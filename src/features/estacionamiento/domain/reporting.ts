import type {
  DemoExpense,
  DemoInvoiceRequest,
  DemoCashCount,
  DemoCashAdjustment,
  DemoAudit,
  DemoMovement,
  DemoPayment,
  DemoPaymentMethod,
  DemoShift,
  DemoState,
  DemoStay,
} from "./demo.types";
import type { DemoDateRange, DemoMovementFilters, DemoReportPeriod } from "./reporting.types";
import { getLocalDateKey } from "./date.utils";

export interface DemoMovementRecord {
  movement: DemoMovement;
  employeeName: string;
  shift: DemoShift | undefined;
  stay: DemoStay | undefined;
  payment: DemoPayment | undefined;
  cashCount: DemoCashCount | undefined;
  cashAdjustment: DemoCashAdjustment | undefined;
  audit: DemoAudit | undefined;
  expense: DemoExpense | undefined;
  invoiceRequest: DemoInvoiceRequest | undefined;
}

export interface DemoReportSummary {
  totalCents: number;
  paymentCount: number;
  averagePaymentCents: number;
  netByMethod: Record<DemoPaymentMethod, number>;
  cashCountCount: number;
  cashDifferenceCents: number;
}

function selectExpense(state: DemoState, movement: DemoMovement): DemoExpense | undefined {
  if (movement.kind === "expense") {
    return state.expenses.find((expense) => `${expense.id}-movement` === movement.id);
  }

  return undefined;
}

export function selectDateRange(
  period: DemoReportPeriod,
  referenceDate: Date,
  customRange: DemoDateRange,
): DemoDateRange {
  const today = getLocalDateKey(referenceDate);

  if (period === "range") {
    return customRange;
  }

  if (period === "daily") {
    return { from: today, to: today };
  }

  if (period === "weekly") {
    const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
    const daysFromMonday = (weekday + 6) % 7;
    const monday = addDays(today, -daysFromMonday);

    return { from: monday, to: addDays(monday, 6) };
  }

  if (period === "monthly") {
    return { from: `${today.slice(0, 7)}-01`, to: today };
  }

  return { from: `${today.slice(0, 4)}-01-01`, to: today };
}

export function selectMovementRecords(
  state: DemoState,
  filters: DemoMovementFilters,
): DemoMovementRecord[] {
  const auditMovements: DemoMovement[] = state.audits
    .filter((audit) => !state.movements.some((movement) => movement.id === `${audit.id}-movement`))
    .map((audit) => ({
      id: `${audit.id}-movement`,
      kind: "audit" as const,
      shiftId: audit.shiftId ?? "",
      employeeId: state.shifts.find((shift) => shift.id === audit.shiftId)?.employeeId ?? "",
      occurredAt: audit.createdAt,
    }));

  return [...state.movements, ...auditMovements]
    .filter((movement) => {
      const dateKey = getLocalDateKey(new Date(movement.occurredAt));
      const matchesFrom = !filters.from || dateKey >= filters.from;
      const matchesTo = !filters.to || dateKey <= filters.to;
      const matchesDate = matchesFrom && matchesTo;
      const matchesEmployee = filters.employeeId === "all" || movement.employeeId === filters.employeeId;
      const matchesShift = filters.shiftId === "all" || movement.shiftId === filters.shiftId;
      const payment = movement.paymentId
        ? state.payments.find((candidate) => candidate.id === movement.paymentId)
        : undefined;
      const expense = selectExpense(state, movement);
      const matchesMethod = filters.method === "all" || payment?.method === filters.method || expense?.method === filters.method;

      return matchesDate && matchesEmployee && matchesShift && matchesMethod;
    })
    .map((movement) => {
      const payment = movement.paymentId
        ? state.payments.find((candidate) => candidate.id === movement.paymentId)
        : undefined;
      let audit: DemoAudit | undefined;

      if (movement.kind === "audit") {
        audit = state.audits.find((candidate) => `${candidate.id}-movement` === movement.id);
      }

      return {
        movement,
        employeeName:
          audit?.employeeName ??
          state.employees.find((employee) => employee.id === movement.employeeId)?.displayName ??
          "Empleado no disponible",
        shift: state.shifts.find((shift) => shift.id === movement.shiftId),
        stay: movement.stayId
          ? state.stays.find((stay) => stay.id === movement.stayId)
          : undefined,
        payment,
        cashCount: state.cashCounts.find((cashCount) =>
          cashCount.shiftId === movement.shiftId && cashCount.createdAt === movement.occurredAt,
        ),
        cashAdjustment: state.cashAdjustments.find((adjustment) =>
          adjustment.shiftId === movement.shiftId && adjustment.occurredAt === movement.occurredAt,
        ),
        audit,
        expense: selectExpense(state, movement),
        invoiceRequest: movement.stayId
          ? state.invoiceRequests.find((request) => request.stayId === movement.stayId)
          : undefined,
      };
    })
    .sort((firstRecord, secondRecord) =>
      secondRecord.movement.occurredAt.localeCompare(firstRecord.movement.occurredAt),
    );
}

export function selectReportSummary(
  state: DemoState,
  range: DemoDateRange,
): DemoReportSummary {
  const payments = state.payments.filter((payment) =>
    isWithinDateRange(payment.paidAt, range),
  );
  const cashCountsInRange = state.cashCounts.filter((cashCount) =>
    isWithinDateRange(cashCount.createdAt, range),
  );
  const latestCashCountByShift = new Map<string, DemoCashCount>();

  for (const cashCount of cashCountsInRange) {
    const latestCashCount = latestCashCountByShift.get(cashCount.shiftId);

    if (!latestCashCount || latestCashCount.createdAt < cashCount.createdAt) {
      latestCashCountByShift.set(cashCount.shiftId, cashCount);
    }
  }

  const cashCounts = [...latestCashCountByShift.values()];
  const netByMethod: Record<DemoPaymentMethod, number> = {
    efectivo: 0,
    debito: 0,
    transferencia: 0,
  };

  for (const payment of payments) {
    netByMethod[payment.method] += payment.netCents;
  }

  const totalCents = Object.values(netByMethod).reduce(
    (total, amountCents) => total + amountCents,
    0,
  );
  const cashDifferenceCents = cashCounts.reduce(
    (total, cashCount) => total + cashCount.differenceCents,
    0,
  );

  let averagePaymentCents = 0;

  if (payments.length > 0) {
    averagePaymentCents = Math.round(totalCents / payments.length);
  }

  return {
    totalCents,
    paymentCount: payments.length,
    averagePaymentCents,
    netByMethod,
    cashCountCount: cashCounts.length,
    cashDifferenceCents,
  };
}

function isWithinDateRange(value: string, range: DemoDateRange): boolean {
  const dateKey = getLocalDateKey(new Date(value));

  return dateKey >= range.from && dateKey <= range.to;
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

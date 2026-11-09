import type {
  DemoEmployee,
  DemoPayment,
  DemoPaymentMethod,
  DemoShift,
  DemoState,
  DemoStay,
  DemoStayCategory,
} from "./demo.types";
import { isValidPlateFragment, normalizePlateFragment } from "./plate";

export interface DemoOccupancy {
  active: number;
  byCategory: Record<DemoStayCategory, number>;
  capacity: number;
  available: number;
  percentage: number;
}

export interface DemoCashSummary {
  openingCashCents: number;
  paymentCount: number;
  netByMethod: Record<DemoPaymentMethod, number>;
  adjustmentInCents: number;
  adjustmentOutCents: number;
  expectedCashCents: number;
}

export interface DemoActiveStaySummary {
  stay: DemoStay;
  employeeName: string;
  elapsedMinutes: number;
}

export interface DemoDailyRevenue {
  paymentCount: number;
  totalCents: number;
  netByMethod: Record<DemoPaymentMethod, number>;
}

export function selectActiveShift(state: DemoState): DemoShift | undefined {
  return state.shifts.find((shift) => shift.status === "open");
}

export function selectActiveStays(state: DemoState): DemoStay[] {
  return state.stays.filter((stay) => stay.status === "active");
}

export function selectActiveStaySummaries(state: DemoState, currentTime: Date): DemoActiveStaySummary[] {
  return selectActiveStays(state).map((stay) => {
    const employee = selectEmployee(state, stay.enteredByEmployeeId);
    const entryTime = new Date(stay.enteredAt).getTime();

    return {
      stay,
      employeeName: employee?.displayName ?? "Empleado no disponible",
      elapsedMinutes: Math.max(0, Math.floor((currentTime.getTime() - entryTime) / 60_000)),
    };
  }).sort((firstStay, secondStay) =>
    new Date(firstStay.stay.enteredAt).getTime() - new Date(secondStay.stay.enteredAt).getTime(),
  );
}

export function selectDailyRevenue(state: DemoState, currentTime: Date): DemoDailyRevenue {
  const currentDateKey = getLocalDateKey(currentTime);
  const paymentsToday = state.payments.filter((payment) =>
    getLocalDateKey(new Date(payment.paidAt)) === currentDateKey,
  );
  const netByMethod: Record<DemoPaymentMethod, number> = {
    efectivo: 0,
    debito: 0,
    transferencia: 0,
  };

  for (const payment of paymentsToday) {
    netByMethod[payment.method] += payment.netCents;
  }

  return {
    paymentCount: paymentsToday.length,
    totalCents: paymentsToday.reduce((total, payment) => total + payment.netCents, 0),
    netByMethod,
  };
}

function getLocalDateKey(date: Date): string {
  const dateParts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
  }).formatToParts(date);
  const year = dateParts.find((part) => part.type === "year")?.value ?? "";
  const month = dateParts.find((part) => part.type === "month")?.value ?? "";
  const day = dateParts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

export function selectMatchingActiveStays(state: DemoState, plateFragment: string): DemoStay[] {
  const normalizedFragment = normalizePlateFragment(plateFragment);

  if (!normalizedFragment || !isValidPlateFragment(normalizedFragment)) {
    return [];
  }

  return selectActiveStays(state).filter((stay) =>
    stay.plateFragment.includes(normalizedFragment),
  );
}

export function selectClosedStays(state: DemoState): DemoStay[] {
  return state.stays.filter((stay) => stay.status === "closed");
}

export function selectOccupancy(state: DemoState): DemoOccupancy {
  const activeStays = selectActiveStays(state);
  const byCategory: Record<DemoStayCategory, number> = {
    auto: 0,
    camioneta: 0,
    moto: 0,
  };

  for (const stay of activeStays) {
    byCategory[stay.category] += 1;
  }

  const capacity = state.settings.capacity;
  let percentage = 0;

  if (capacity > 0) {
    percentage = Math.round((activeStays.length / capacity) * 100);
  }

  return {
    active: activeStays.length,
    byCategory,
    capacity,
    available: Math.max(0, capacity - activeStays.length),
    percentage,
  };
}

export function selectEmployee(
  state: DemoState,
  employeeId: string,
): DemoEmployee | undefined {
  return state.employees.find((employee) => employee.id === employeeId);
}

export function selectPaymentsForShift(state: DemoState, shiftId: string): DemoPayment[] {
  return state.payments.filter((payment) => payment.shiftId === shiftId);
}

export function selectCashSummary(state: DemoState, shiftId: string): DemoCashSummary | undefined {
  const shift = state.shifts.find((candidate) => candidate.id === shiftId);

  if (!shift) {
    return undefined;
  }

  const payments = selectPaymentsForShift(state, shiftId);
  const netByMethod: Record<DemoPaymentMethod, number> = {
    efectivo: 0,
    debito: 0,
    transferencia: 0,
  };

  for (const payment of payments) {
    netByMethod[payment.method] += payment.netCents;
  }

  const adjustmentInCents = state.cashAdjustments
    .filter((adjustment) => adjustment.shiftId === shiftId && adjustment.direction === "in")
    .reduce((total, adjustment) => total + adjustment.amountCents, 0);
  const adjustmentOutCents = state.cashAdjustments
    .filter((adjustment) => adjustment.shiftId === shiftId && adjustment.direction === "out")
    .reduce((total, adjustment) => total + adjustment.amountCents, 0);

  return {
    openingCashCents: shift.openingCashCents,
    paymentCount: payments.length,
    netByMethod,
    adjustmentInCents,
    adjustmentOutCents,
    expectedCashCents:
      shift.openingCashCents +
      netByMethod.efectivo +
      adjustmentInCents -
      adjustmentOutCents,
  };
}

export function selectStayById(state: DemoState, stayId: string): DemoStay | undefined {
  return state.stays.find((stay) => stay.id === stayId);
}

export function selectPaymentByStayId(
  state: DemoState,
  stayId: string,
): DemoPayment | undefined {
  return state.payments.find((payment) => payment.stayId === stayId);
}

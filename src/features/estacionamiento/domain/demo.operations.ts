import { DEMO_MESSAGES } from "@/constants/demo.constant";
import type {
  DemoAction,
  DemoOperationResult,
  DemoState,
  DemoStay,
} from "./demo.types";
import { findTariff, calculateStayPrice } from "./tariff";
import { normalizePlateFragment, isValidPlateFragment } from "./plate";
import { getLocalDateKey } from "./date.utils";
import { selectActiveShift, selectCashSummary, selectStayById } from "./selectors";

function availablePosition(state: DemoState, category: DemoStay["category"]): string | undefined {
  const sections = category === "moto" ? [["M", state.settings.motorcyclePositions], ["A", state.settings.autoPositions]] as const
    : category === "auto" ? [["A", state.settings.autoPositions]] as const
      : [["C", state.settings.vanPositions]] as const;
  const occupied = new Set(state.stays.filter((stay) => stay.status === "active").map((stay) => stay.positionId));
  for (const [prefix, count] of sections) {
    for (let index = 1; index <= count; index += 1) {
      const positionId = `${prefix}-${index.toString().padStart(2, "0")}`;
      if (!occupied.has(positionId)) return positionId;
    }
  }
  return undefined;
}

function succeed(state: DemoState): DemoOperationResult {
  return { success: true, state: { ...state, notice: undefined } };
}

function reject(state: DemoState, message: string): DemoOperationResult {
  return { success: false, state: { ...state, notice: message }, message };
}

function addMovement(
  state: DemoState,
  movement: DemoState["movements"][number],
): DemoState["movements"] {
  return [...state.movements, movement];
}

function registerEntry(state: DemoState, action: Extract<DemoAction, { type: "register-entry" }>): DemoOperationResult {
  const activeShift = selectActiveShift(state);

  if (!activeShift) {
    return reject(state, DEMO_MESSAGES.noOpenShift);
  }

  if (!isValidPlateFragment(action.plateFragment)) {
    return reject(state, DEMO_MESSAGES.invalidPlate);
  }

  const stay: DemoStay = {
    id: action.id,
    ticketNumber: state.nextTicketNumber,
    plateFragment: normalizePlateFragment(action.plateFragment),
    category: action.category,
    enteredAt: action.occurredAt,
    enteredByEmployeeId: activeShift.employeeId,
    shiftId: activeShift.id,
    status: "active",
    positionId: availablePosition(state, action.category),
  };

  return succeed({
    ...state,
    stays: [...state.stays, stay],
    movements: addMovement(state, {
      id: `${action.id}-entry`,
      kind: "entry",
      stayId: stay.id,
      shiftId: activeShift.id,
      employeeId: activeShift.employeeId,
      occurredAt: action.occurredAt,
    }),
    nextTicketNumber: state.nextTicketNumber + 1,
  });
}

function closePayment(
  state: DemoState,
  action: Extract<DemoAction, { type: "confirm-payment-and-exit" }>,
): DemoOperationResult {
  const activeShift = selectActiveShift(state);
  const stay = selectStayById(state, action.stayId);

  if (!activeShift) {
    return reject(state, DEMO_MESSAGES.noOpenShift);
  }

  if (!stay || stay.status !== "active" || state.payments.some((payment) => payment.stayId === stay.id)) {
    return reject(state, DEMO_MESSAGES.missingStay);
  }

  const tariff = findTariff(state.tariffs, stay.category);
  let price = null;

  if (tariff) {
    price = calculateStayPrice(stay.enteredAt, action.occurredAt, tariff);
  }

  if (!price || action.totalCents !== price.totalCents || action.totalCents <= 0) {
    return reject(state, DEMO_MESSAGES.invalidPayment);
  }

  if (action.method === "efectivo") {
    if (!Number.isSafeInteger(action.receivedCents) || (action.receivedCents ?? 0) <= 0) {
      return reject(state, DEMO_MESSAGES.invalidPayment);
    }

    if ((action.receivedCents ?? 0) < action.totalCents) {
      return reject(state, DEMO_MESSAGES.insufficientCash);
    }
  }

  if (action.method !== "efectivo" && (action.receivedCents || action.receivedCents === 0)) {
    return reject(state, DEMO_MESSAGES.invalidPayment);
  }

  let changeCents = 0;

  if (action.method === "efectivo") {
    changeCents = (action.receivedCents ?? 0) - action.totalCents;
  }

  const payment = {
    id: action.id,
    stayId: stay.id,
    shiftId: activeShift.id,
    method: action.method,
    totalCents: action.totalCents,
    receivedCents: action.receivedCents,
    changeCents,
    netCents: action.totalCents,
    paidAt: action.occurredAt,
    employeeId: activeShift.employeeId,
    fractionMinutes: price.fractionMinutes,
    tariffPerFractionCents: price.tariffPerFractionCents,
  };
  const closedStay = { ...stay, status: "closed" as const, exitedAt: action.occurredAt };
  let invoiceRequests = state.invoiceRequests;

  if (action.requestInvoice) {
    invoiceRequests = [
      ...state.invoiceRequests,
      { id: `${action.id}-invoice`, stayId: stay.id, status: "pending", requestedAt: action.occurredAt },
    ];
  }

  const stays = state.stays.map((candidate) => {
    if (candidate.id === stay.id) {
      return closedStay;
    }

    return candidate;
  });

  return succeed({
    ...state,
    stays,
    payments: [...state.payments, payment],
    invoiceRequests,
    movements: addMovement(state, {
      id: `${action.id}-payment`,
      kind: "payment",
      stayId: stay.id,
      shiftId: activeShift.id,
      employeeId: activeShift.employeeId,
      occurredAt: action.occurredAt,
      paymentId: payment.id,
      amountCents: payment.netCents,
    }),
  });
}

function recordCashAdjustment(
  state: DemoState,
  action: Extract<DemoAction, { type: "record-cash-adjustment" }>,
): DemoOperationResult {
  const activeShift = selectActiveShift(state);

  if (!activeShift) {
    return reject(state, DEMO_MESSAGES.noOpenShift);
  }

  if (!Number.isSafeInteger(action.amountCents) || action.amountCents <= 0) {
    return reject(state, DEMO_MESSAGES.invalidCash);
  }

  if (!action.reason.trim()) {
    return reject(state, DEMO_MESSAGES.invalidReason);
  }

  const cashSummary = selectCashSummary(state, activeShift.id);

  if (action.direction === "out" && cashSummary && action.amountCents > cashSummary.expectedCashCents) {
    return reject(state, DEMO_MESSAGES.insufficientDrawer);
  }

  const adjustment = {
    id: action.id,
    shiftId: activeShift.id,
    employeeId: activeShift.employeeId,
    direction: action.direction,
    amountCents: action.amountCents,
    reason: action.reason.trim(),
    occurredAt: action.occurredAt,
  };
  let movementAmountCents = action.amountCents;

  if (action.direction === "out") {
    movementAmountCents = -action.amountCents;
  }

  return succeed({
    ...state,
    cashAdjustments: [...state.cashAdjustments, adjustment],
    movements: addMovement(state, {
      id: `${action.id}-movement`,
      kind: "cash-adjustment",
      shiftId: activeShift.id,
      employeeId: activeShift.employeeId,
      occurredAt: action.occurredAt,
      amountCents: movementAmountCents,
    }),
  });
}

function countCash(
  state: DemoState,
  action: Extract<DemoAction, { type: "count-cash" }>,
): DemoOperationResult {
  const activeShift = selectActiveShift(state);
  let summary;

  if (activeShift) {
    summary = selectCashSummary(state, activeShift.id);
  }

  if (!activeShift || !summary) {
    return reject(state, DEMO_MESSAGES.noOpenShift);
  }

  if (!Number.isSafeInteger(action.countedCents) || action.countedCents < 0) {
    return reject(state, DEMO_MESSAGES.invalidCash);
  }

  const cashCount = {
    id: action.id,
    shiftId: activeShift.id,
    employeeId: activeShift.employeeId,
    countedCents: action.countedCents,
    expectedCents: summary.expectedCashCents,
    differenceCents: action.countedCents - summary.expectedCashCents,
    createdAt: action.occurredAt,
  };

  return succeed({
    ...state,
    cashCounts: [...state.cashCounts, cashCount],
    movements: addMovement(state, {
      id: `${action.id}-movement`,
      kind: "cash-count",
      shiftId: activeShift.id,
      employeeId: activeShift.employeeId,
      occurredAt: action.occurredAt,
      amountCents: cashCount.differenceCents,
    }),
  });
}

function closeShift(
  state: DemoState,
  action: Extract<DemoAction, { type: "close-shift" }>,
): DemoOperationResult {
  const activeShift = selectActiveShift(state);

  if (!activeShift) {
    return reject(state, DEMO_MESSAGES.noOpenShift);
  }

  const cashSummary = selectCashSummary(state, activeShift.id);
  const lastCashCount = state.cashCounts
    .filter((cashCount) => cashCount.shiftId === activeShift.id)
    .at(-1);
  const lastCashAdjustment = state.cashAdjustments
    .filter((adjustment) => adjustment.shiftId === activeShift.id)
    .at(-1);

  if (
    !cashSummary ||
    !lastCashCount ||
    lastCashCount.expectedCents !== cashSummary.expectedCashCents ||
    (lastCashAdjustment && new Date(lastCashCount.createdAt).getTime() < new Date(lastCashAdjustment.occurredAt).getTime())
  ) {
    return reject(state, DEMO_MESSAGES.cashCountRequired);
  }

  return succeed({
    ...state,
    shifts: state.shifts.map((shift) => {
      if (shift.id === activeShift.id) {
        return {
          ...shift,
          status: "closed" as const,
          closedAt: action.occurredAt,
          closedCashCountId: lastCashCount.id,
        };
      }

      return shift;
    }),
    movements: addMovement(state, {
      id: `${action.id}-movement`,
      kind: "shift-close",
      shiftId: activeShift.id,
      employeeId: activeShift.employeeId,
      occurredAt: action.occurredAt,
    }),
  });
}

function recordExpense(state: DemoState, action: Extract<DemoAction, { type: "record-expense" }>): DemoOperationResult {
  const shift = selectActiveShift(state);
  if (!shift) return reject(state, DEMO_MESSAGES.noOpenShift);
  if (!Number.isSafeInteger(action.amountCents) || action.amountCents <= 0 || !action.concept.trim() || !Number.isFinite(Date.parse(action.expenseDate))) {
    return reject(state, "Ingresá un concepto y un importe válido.");
  }
  const expenseDay = getLocalDateKey(new Date(action.expenseDate));
  if (expenseDay < getLocalDateKey(new Date(shift.openedAt)) || expenseDay > getLocalDateKey(new Date(action.occurredAt))
    || Date.parse(action.expenseDate) < Date.parse(shift.openedAt) || Date.parse(action.expenseDate) > Date.parse(action.occurredAt)) {
    return reject(state, "La fecha del gasto debe estar dentro del turno activo y no puede ser futura.");
  }
  if (!state.settings.expenseCategories.includes(action.category)) {
    return reject(state, "Seleccioná una categoría de gastos válida.");
  }
  const summary = selectCashSummary(state, shift.id);
  if (action.method === "efectivo" && summary && action.amountCents > summary.expectedCashCents) {
    return reject(state, DEMO_MESSAGES.insufficientDrawer);
  }
  return succeed({
    ...state,
    expenses: [...state.expenses, {
      id: action.id, shiftId: shift.id, employeeId: shift.employeeId, category: action.category,
      concept: action.concept.trim(), method: action.method, amountCents: action.amountCents, occurredAt: action.expenseDate,
    }],
    movements: addMovement(state, {
      id: `${action.id}-movement`, kind: "expense", shiftId: shift.id,
      employeeId: shift.employeeId, occurredAt: action.expenseDate, amountCents: -action.amountCents,
    }),
  });
}

function createAudit(state: DemoState, action: Extract<DemoAction, { type: "create-audit" }>): DemoOperationResult {
  const shift = selectActiveShift(state);
  const employeeName = shift ? state.employees.find((employee) => employee.id === shift.employeeId)?.displayName ?? "Sin operador" : "Sin turno activo";
  const vehicles = state.stays.filter((stay) => stay.status === "active").map((stay) => ({
    stayId: stay.id, ticketNumber: stay.ticketNumber, plateFragment: stay.plateFragment,
    category: stay.category, positionId: stay.positionId, enteredAt: stay.enteredAt,
    employeeName: state.employees.find((employee) => employee.id === stay.enteredByEmployeeId)?.displayName ?? "No disponible",
    shiftId: stay.shiftId,
  }));
  return succeed({ ...state, audits: [...state.audits, {
    id: action.id, number: state.audits.length + 1, createdAt: action.occurredAt,
    shiftId: shift?.id, employeeName, vehicles, capacity: state.settings.capacity,
    parkingName: state.settings.parkingName,
    motorcyclePositions: state.settings.motorcyclePositions,
    autoPositions: state.settings.autoPositions,
    vanPositions: state.settings.vanPositions,
  }] });
}

export function applyDemoAction(state: DemoState, action: DemoAction): DemoOperationResult {
  if (action.type === "register-entry") {
    return registerEntry(state, action);
  }

  if (action.type === "confirm-payment-and-exit") {
    return closePayment(state, action);
  }

  if (action.type === "record-cash-adjustment") {
    return recordCashAdjustment(state, action);
  }

  if (action.type === "count-cash") {
    return countCash(state, action);
  }

  if (action.type === "close-shift") {
    return closeShift(state, action);
  }
  if (action.type === "open-shift") {
    if (selectActiveShift(state)) return reject(state, "Ya hay un turno abierto.");
    const employee = state.employees.find((item) => item.id === action.employeeId && item.active);
    if (!employee || !Number.isSafeInteger(action.openingCashCents) || action.openingCashCents < 0) {
      return reject(state, "Seleccioná un empleado activo y un fondo inicial válido.");
    }
    return succeed({ ...state, shifts: [...state.shifts, {
      id: action.id, employeeId: employee.id, openedAt: action.occurredAt,
      openingCashCents: action.openingCashCents, status: "open",
    }] });
  }

  if (action.type === "record-expense") return recordExpense(state, action);
  if (action.type === "create-audit") return createAudit(state, action);
  if (action.type === "save-employee") {
    const displayName = action.displayName.trim();
    if (displayName.length < 2) return reject(state, "Ingresá un nombre de al menos dos caracteres.");
    if (action.employeeId && !state.employees.some((employee) => employee.id === action.employeeId)) {
      return reject(state, "El empleado ya no está disponible.");
    }
    return succeed({ ...state, employees: action.employeeId
      ? state.employees.map((employee) => employee.id === action.employeeId ? { ...employee, displayName, active: action.active } : employee)
      : [...state.employees, { id: action.id, displayName, active: action.active }] });
  }
  if (action.type === "save-settings") {
    const settings = action.settings;
    if ([settings.motorcyclePositions, settings.autoPositions, settings.vanPositions].some((value) => !Number.isSafeInteger(value) || value < 0 || value > 200)
      || settings.capacity !== settings.motorcyclePositions + settings.autoPositions + settings.vanPositions
      || !settings.parkingName.trim() || settings.expenseCategories.length === 0) {
      return reject(state, "Revisá la distribución, el nombre y las categorías.");
    }
    return succeed({ ...state, settings });
  }
  if (action.type === "save-tariffs") {
    if (action.tariffs.length !== 3 || action.tariffs.some((tariff) => !Number.isSafeInteger(tariff.hourlyCents) || tariff.hourlyCents <= 0 || !Number.isSafeInteger(tariff.fractionMinutes) || tariff.fractionMinutes <= 0)) {
      return reject(state, "Revisá los importes y fracciones de las tarifas.");
    }
    return succeed({ ...state, tariffs: action.tariffs });
  }

  return succeed(state);
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "hydrate" || action.type === "reset") {
    return action.state;
  }

  return applyDemoAction(state, action).state;
}

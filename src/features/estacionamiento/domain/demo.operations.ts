import { DEMO_MESSAGES } from "@/constants/demo.constant";
import type {
  DemoAction,
  DemoOperationResult,
  DemoState,
  DemoStay,
} from "./demo.types";
import { findTariff, calculateStayPrice } from "./tariff";
import { normalizePlateFragment, isValidPlateFragment } from "./plate";
import { selectActiveShift, selectCashSummary, selectStayById } from "./selectors";

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

  if (!cashSummary || !lastCashCount || lastCashCount.expectedCents !== cashSummary.expectedCashCents) {
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

  return succeed(state);
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "hydrate" || action.type === "reset") {
    return action.state;
  }

  return applyDemoAction(state, action).state;
}

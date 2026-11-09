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

export function selectActiveShift(state: DemoState): DemoShift | undefined {
  return state.shifts.find((shift) => shift.status === "open");
}

export function selectActiveStays(state: DemoState): DemoStay[] {
  return state.stays.filter((stay) => stay.status === "active");
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

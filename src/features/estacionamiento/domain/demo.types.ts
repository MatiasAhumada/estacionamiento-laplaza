export const DEMO_STAY_CATEGORIES = ["auto", "camioneta", "moto"] as const;
export type DemoStayCategory = "auto" | "camioneta" | "moto";

export const DEMO_PAYMENT_METHODS = ["efectivo", "debito", "transferencia"] as const;
export type DemoPaymentMethod = "efectivo" | "debito" | "transferencia";

export type DemoShiftStatus = "open" | "closed";
export type DemoStayStatus = "active" | "closed";
export type DemoMovementKind = "entry" | "payment" | "cash-adjustment" | "cash-count" | "shift-close";
export type DemoCashDirection = "in" | "out";
export type DemoInvoiceRequestStatus = "pending";

export interface DemoEmployee {
  id: string;
  displayName: string;
  active: boolean;
}

export interface DemoShift {
  id: string;
  employeeId: string;
  openedAt: string;
  closedAt?: string;
  closedCashCountId?: string;
  openingCashCents: number;
  status: DemoShiftStatus;
}

export interface DemoStay {
  id: string;
  ticketNumber: number;
  plateFragment: string;
  category: DemoStayCategory;
  enteredAt: string;
  enteredByEmployeeId: string;
  shiftId: string;
  status: DemoStayStatus;
  exitedAt?: string;
}

export interface DemoPayment {
  id: string;
  stayId: string;
  shiftId: string;
  method: DemoPaymentMethod;
  totalCents: number;
  receivedCents?: number;
  changeCents: number;
  netCents: number;
  paidAt: string;
  employeeId: string;
  fractionMinutes: number;
  tariffPerFractionCents: number;
}

export interface DemoMovement {
  id: string;
  kind: DemoMovementKind;
  stayId?: string;
  shiftId: string;
  employeeId: string;
  occurredAt: string;
  paymentId?: string;
  amountCents?: number;
}

export interface DemoCashAdjustment {
  id: string;
  shiftId: string;
  employeeId: string;
  direction: DemoCashDirection;
  amountCents: number;
  reason: string;
  occurredAt: string;
}

export interface DemoCashCount {
  id: string;
  shiftId: string;
  employeeId: string;
  countedCents: number;
  expectedCents: number;
  differenceCents: number;
  createdAt: string;
}

export interface DemoInvoiceRequest {
  id: string;
  stayId: string;
  status: DemoInvoiceRequestStatus;
  requestedAt: string;
}

export interface DemoTariff {
  category: DemoStayCategory;
  hourlyCents: number;
  fractionMinutes: number;
  effectiveFrom: string;
}

export interface DemoSettings {
  capacity: number;
  connectionScenario: "online" | "offline" | "syncing";
}

export interface DemoState {
  employees: DemoEmployee[];
  shifts: DemoShift[];
  stays: DemoStay[];
  payments: DemoPayment[];
  movements: DemoMovement[];
  cashAdjustments: DemoCashAdjustment[];
  cashCounts: DemoCashCount[];
  invoiceRequests: DemoInvoiceRequest[];
  tariffs: DemoTariff[];
  settings: DemoSettings;
  nextTicketNumber: number;
  notice?: string;
}

export type DemoStateEnvelope = {
  version: number;
  savedAt: string;
  state: DemoState;
};

export type DemoStorageLoadResult =
  | { status: "restored"; state: DemoState }
  | { status: "empty" }
  | { status: "corrupt" }
  | { status: "outdated" }
  | { status: "unavailable" };

export type DemoOperationResult =
  | { success: true; state: DemoState }
  | { success: false; state: DemoState; message: string };

export type DemoAction =
  | { type: "hydrate"; state: DemoState }
  | { type: "register-entry"; id: string; occurredAt: string; plateFragment: string; category: DemoStayCategory }
  | { type: "confirm-payment-and-exit"; id: string; occurredAt: string; stayId: string; method: DemoPaymentMethod; totalCents: number; receivedCents?: number; requestInvoice: boolean }
  | { type: "record-cash-adjustment"; id: string; occurredAt: string; direction: DemoCashDirection; amountCents: number; reason: string }
  | { type: "count-cash"; id: string; occurredAt: string; countedCents: number }
  | { type: "close-shift"; id: string; occurredAt: string }
  | { type: "reset"; state: DemoState };

export type DemoOperationAction = Exclude<DemoAction, { type: "hydrate" | "reset" }>;
export type DemoOperationInput<Action extends DemoOperationAction = DemoOperationAction> =
  Action extends DemoOperationAction ? Omit<Action, "id" | "occurredAt"> : never;
export type DemoPaymentConfirmationInput = Omit<
  DemoOperationInput<Extract<DemoOperationAction, { type: "confirm-payment-and-exit" }>>,
  "type"
>;

export interface DemoContextValue {
  state: DemoState;
  isHydrated: boolean;
  storageStatus: DemoStorageLoadResult["status"];
  runDemoOperation: (action: DemoOperationInput) => DemoOperationResult;
  registerStayEntry: (category: DemoStayCategory, plateFragment: string) => DemoOperationResult;
  confirmStayPayment: (payment: DemoPaymentConfirmationInput) => DemoOperationResult;
  resetDemo: () => void;
}

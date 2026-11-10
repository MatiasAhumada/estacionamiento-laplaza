import { z } from "zod";

import { DEMO_STORAGE_KEY, DEMO_STORAGE_VERSION } from "@/constants/demo.constant";
import { DEMO_PAYMENT_METHODS, DEMO_STAY_CATEGORIES } from "../domain/demo.types";
import type { DemoState, DemoStorageLoadResult } from "../domain/demo.types";

const isoDateSchema = z.string().min(1).refine((date) => Number.isFinite(Date.parse(date)));
const nonNegativeCentsSchema = z.number().int().nonnegative();
const positiveCentsSchema = z.number().int().positive();

const demoStateSchema = z.object({
  employees: z.array(z.object({ id: z.string().min(1), displayName: z.string().min(1), active: z.boolean() })),
  shifts: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1).optional(),
    employeeId: z.string().min(1),
    openedAt: isoDateSchema,
    closedAt: isoDateSchema.optional(),
    closedCashCountId: z.string().min(1).optional(),
    openingCashCents: nonNegativeCentsSchema,
    status: z.enum(["open", "closed"]),
  })),
  stays: z.array(z.object({
    id: z.string().min(1),
    ticketNumber: z.number().int().positive(),
    plateFragment: z.string().regex(/^[A-Z0-9]+$/),
    category: z.enum(DEMO_STAY_CATEGORIES),
    enteredAt: isoDateSchema,
    enteredByEmployeeId: z.string().min(1),
    shiftId: z.string().min(1),
    status: z.enum(["active", "closed"]),
    positionId: z.string().min(1).optional(),
    exitedAt: isoDateSchema.optional(),
  })),
  payments: z.array(z.object({
    id: z.string().min(1),
    stayId: z.string().min(1),
    shiftId: z.string().min(1),
    method: z.enum(DEMO_PAYMENT_METHODS),
    totalCents: positiveCentsSchema,
    receivedCents: nonNegativeCentsSchema.optional(),
    changeCents: nonNegativeCentsSchema,
    netCents: positiveCentsSchema,
    paidAt: isoDateSchema,
    employeeId: z.string().min(1),
    fractionMinutes: positiveCentsSchema,
    tariffPerFractionCents: positiveCentsSchema,
  })),
  movements: z.array(z.object({
    id: z.string().min(1),
    kind: z.enum(["entry", "payment", "cash-adjustment", "cash-count", "shift-close", "expense", "audit"]),
    stayId: z.string().min(1).optional(),
    shiftId: z.string().min(1),
    employeeId: z.string().min(1),
    occurredAt: isoDateSchema,
    paymentId: z.string().min(1).optional(),
    amountCents: z.number().int().optional(),
  })),
  cashAdjustments: z.array(z.object({
    id: z.string().min(1),
    shiftId: z.string().min(1),
    employeeId: z.string().min(1),
    direction: z.enum(["in", "out"]),
    amountCents: positiveCentsSchema,
    reason: z.string().min(1),
    occurredAt: isoDateSchema,
  })),
  cashCounts: z.array(z.object({
    id: z.string().min(1),
    shiftId: z.string().min(1),
    employeeId: z.string().min(1),
    countedCents: nonNegativeCentsSchema,
    expectedCents: nonNegativeCentsSchema,
    differenceCents: z.number().int(),
    createdAt: isoDateSchema,
  })),
  invoiceRequests: z.array(z.object({
    id: z.string().min(1),
    stayId: z.string().min(1),
    status: z.literal("pending"),
    requestedAt: isoDateSchema,
  })),
  tariffs: z.array(z.object({
    category: z.enum(DEMO_STAY_CATEGORIES),
    hourlyCents: nonNegativeCentsSchema,
    fractionMinutes: positiveCentsSchema,
    effectiveFrom: isoDateSchema,
  })),
  expenses: z.array(z.object({
    id: z.string().min(1), shiftId: z.string().min(1), employeeId: z.string().min(1),
    category: z.string().min(1), concept: z.string().min(1), method: z.enum(DEMO_PAYMENT_METHODS),
    amountCents: positiveCentsSchema, occurredAt: isoDateSchema,
  })).default([]),
  audits: z.array(z.object({
    id: z.string().min(1), number: z.number().int().positive(), createdAt: isoDateSchema,
    shiftId: z.string().min(1).optional(), employeeName: z.string().min(1), capacity: nonNegativeCentsSchema,
    parkingName: z.string().min(1), motorcyclePositions: nonNegativeCentsSchema,
    autoPositions: nonNegativeCentsSchema, vanPositions: nonNegativeCentsSchema,
    vehicles: z.array(z.object({
      stayId: z.string().min(1), ticketNumber: z.number().int().positive(), plateFragment: z.string().min(1),
      category: z.enum(DEMO_STAY_CATEGORIES), positionId: z.string().min(1).optional(),
      enteredAt: isoDateSchema, employeeName: z.string().min(1), shiftId: z.string().min(1),
    })),
  })).default([]),
  settings: z.object({
    capacity: nonNegativeCentsSchema,
    connectionScenario: z.enum(["online", "offline", "syncing"]),
    parkingName: z.string().min(1).default("Estacionamiento La Plaza"),
    motorcyclePositions: nonNegativeCentsSchema.default(8),
    autoPositions: nonNegativeCentsSchema.default(16),
    vanPositions: nonNegativeCentsSchema.default(6),
    shiftLabels: z.array(z.string().min(1)).default(["Mañana", "Tarde", "Noche"]),
    expenseCategories: z.array(z.string().min(1)).default(["Mantenimiento", "Limpieza", "Insumos", "Servicios", "Otros"]),
  }).transform((settings) => ({ ...settings, capacity: settings.motorcyclePositions + settings.autoPositions + settings.vanPositions })),
  nextTicketNumber: z.number().int().positive(),
  notice: z.string().optional(),
}).superRefine((state, context) => {
  const identifierGroups = [
    state.employees.map((employee) => employee.id),
    state.shifts.map((shift) => shift.id),
    state.stays.map((stay) => stay.id),
    state.payments.map((payment) => payment.id),
    state.movements.map((movement) => movement.id),
    state.cashAdjustments.map((adjustment) => adjustment.id),
    state.cashCounts.map((cashCount) => cashCount.id),
    state.invoiceRequests.map((request) => request.id),
    state.expenses.map((expense) => expense.id),
    state.audits.map((audit) => audit.id),
  ];

  for (const identifiers of identifierGroups) {
    if (new Set(identifiers).size !== identifiers.length) {
      context.addIssue({ code: "custom", message: "El estado demo contiene identificadores duplicados." });
    }
  }

  const ticketNumbers = state.stays.map((stay) => stay.ticketNumber);
  if (new Set(ticketNumbers).size !== ticketNumbers.length) {
    context.addIssue({ code: "custom", message: "El estado demo contiene tickets duplicados." });
  }

  const paidStayIds = state.payments.map((payment) => payment.stayId);
  if (new Set(paidStayIds).size !== paidStayIds.length) {
    context.addIssue({ code: "custom", message: "Una estadía no puede tener más de un cobro." });
  }

  const openShifts = state.shifts.filter((shift) => shift.status === "open");
  if (openShifts.length > 1) {
    context.addIssue({ code: "custom", message: "Solo puede existir un turno abierto en la demo." });
  }

  for (const stay of state.stays) {
    const stayShift = state.shifts.find((shift) => shift.id === stay.shiftId);
    const entryEmployee = state.employees.find((employee) => employee.id === stay.enteredByEmployeeId);
    const payment = state.payments.find((candidate) => candidate.stayId === stay.id);

    if (!stayShift || !entryEmployee || (stay.status === "closed" && (!stay.exitedAt || !payment))) {
      context.addIssue({ code: "custom", message: "El estado demo contiene estadías sin sus referencias obligatorias." });
    }

    if (stay.status === "active" && (stay.exitedAt || payment)) {
      context.addIssue({ code: "custom", message: "Una estadía activa no puede tener un egreso o cobro asociado." });
    }
  }

  for (const payment of state.payments) {
    if (!state.stays.some((stay) => stay.id === payment.stayId) ||
      !state.shifts.some((shift) => shift.id === payment.shiftId) ||
      !state.employees.some((employee) => employee.id === payment.employeeId)) {
      context.addIssue({ code: "custom", message: "El estado demo contiene cobros sin referencias obligatorias." });
    }
  }

  for (const shift of state.shifts) {
    if (shift.status === "closed" && !state.cashCounts.some((cashCount) =>
      cashCount.id === shift.closedCashCountId && cashCount.shiftId === shift.id,
    )) {
      context.addIssue({ code: "custom", message: "El cierre del turno no conserva su arqueo final." });
    }
  }
});

const demoEnvelopeSchema = z.object({
  version: z.number().int().positive(),
  savedAt: isoDateSchema,
  state: demoStateSchema,
});

export function parseDemoState(serializedState: string): DemoStorageLoadResult {
  try {
    const rawContent: unknown = JSON.parse(serializedState);
    const parsedEnvelope = demoEnvelopeSchema.safeParse(rawContent);

    if (!parsedEnvelope.success) {
      return { status: "corrupt" };
    }

    if (parsedEnvelope.data.version !== DEMO_STORAGE_VERSION) {
      return { status: "outdated" };
    }

    return { status: "restored", state: parsedEnvelope.data.state };
  } catch {
    return { status: "corrupt" };
  }
}

export function readDemoState(): DemoStorageLoadResult {
  try {
    const serializedState = globalThis.sessionStorage.getItem(DEMO_STORAGE_KEY);

    if (!serializedState) {
      return { status: "empty" };
    }

    return parseDemoState(serializedState);
  } catch {
    return { status: "unavailable" };
  }
}

export function writeDemoState(state: DemoState): boolean {
  try {
    globalThis.sessionStorage.setItem(
      DEMO_STORAGE_KEY,
      JSON.stringify({
        version: DEMO_STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        state,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function removeDemoState(): boolean {
  try {
    globalThis.sessionStorage.removeItem(DEMO_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

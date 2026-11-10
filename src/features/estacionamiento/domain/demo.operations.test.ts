import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEMO_SEED_STATE } from "@/constants/demo-fixture.constant";
import { DEMO_STORAGE_VERSION } from "@/constants/demo.constant";
import { applyDemoAction } from "./demo.operations";
import { normalizePlateFragment } from "./plate";
import { selectActiveStaySummaries, selectActiveStays, selectCashSummary, selectDailyRevenue, selectMatchingActiveStays, selectOccupancy } from "./selectors";
import { calculateStayPrice } from "./tariff";
import { parseDemoState } from "../demo/demo-storage";
import { entrySchema } from "../validation/entry.schema";
import { staySearchSchema } from "../validation/stay-search.schema";
import { receivedCashSchema } from "../validation/payment.schema";

describe("estado demo del estacionamiento", () => {
  it("convierte efectivo a centavos y rechaza importes insuficientes, negativos o mal formados", () => {
    assert.equal(receivedCashSchema.parse("8000"), 800_000);
    assert.equal(receivedCashSchema.parse("8000,50"), 800_050);
    assert.equal(receivedCashSchema.safeParse("7559").success, true);
    assert.equal(receivedCashSchema.safeParse("-1").success, false);
    assert.equal(receivedCashSchema.safeParse("12,345").success, false);
    assert.equal(receivedCashSchema.safeParse("0").success, false);
  });

  it("valida el ingreso con fragmentos alfanuméricos y normaliza antes de registrar", () => {
    const validEntry = entrySchema.safeParse({ category: "auto", plateFragment: " 782z " });

    assert.equal(validEntry.success, true);

    if (validEntry.success) {
      assert.equal(validEntry.data.plateFragment, "782Z");
    }

    assert.equal(entrySchema.safeParse({ category: "auto", plateFragment: "" }).success, false);
    assert.equal(entrySchema.safeParse({ category: "auto", plateFragment: "78-2" }).success, false);
  });

  it("normaliza la patente parcial y permite fragmentos repetidos con estadías distintas", () => {
    assert.equal(normalizePlateFragment(" 782z "), "782Z");

    const result = applyDemoAction(DEMO_SEED_STATE, {
      type: "register-entry",
      id: "stay-new-duplicate-plate",
      occurredAt: "2026-11-09T11:00:00.000-03:00",
      plateFragment: "782z",
      category: "auto",
    });

    assert.equal(result.success, true);
    assert.equal(result.state.stays.at(-1)?.plateFragment, "782Z");
    assert.equal(result.state.stays.at(-1)?.ticketNumber, 6);
    assert.equal(result.state.stays.at(-1)?.id, "stay-new-duplicate-plate");
    assert.equal(selectMatchingActiveStays(result.state, "782").length, 3);
  });

  it("distingue coincidencias activas por ID y valida fragmentos de búsqueda", () => {
    const matches = selectMatchingActiveStays(DEMO_SEED_STATE, " 782 ");

    assert.equal(matches.length, 2);
    assert.notEqual(matches[0]?.id, matches[1]?.id);
    assert.deepEqual(selectMatchingActiveStays(DEMO_SEED_STATE, "78-2"), []);
    assert.deepEqual(selectMatchingActiveStays(DEMO_SEED_STATE, "ABC"), []);
    assert.equal(staySearchSchema.safeParse(" 782z ").data, "782Z");
    assert.equal(staySearchSchema.safeParse("78-2").success, false);
    assert.equal(staySearchSchema.safeParse("").success, true);
  });

  it("calcula bloques de tarifa ilustrativa y rechaza fechas o tarifas inválidas", () => {
    const autoTariff = DEMO_SEED_STATE.tariffs.find((tariff) => tariff.category === "auto");
    assert.ok(autoTariff);

    const expectedPrice = calculateStayPrice(
      "2026-11-09T08:35:00.000-03:00",
      "2026-11-09T12:05:00.000-03:00",
      autoTariff,
    );
    assert.deepEqual(expectedPrice, {
      billableMinutes: 210,
      blocks: 7,
      fractionMinutes: 30,
      tariffPerFractionCents: 108_000,
      totalCents: 756_000,
    });

    assert.equal(calculateStayPrice("fecha inválida", "2026-11-09T12:05:00.000-03:00", autoTariff), null);
    assert.equal(calculateStayPrice("2026-11-09T12:05:00.000-03:00", "2026-11-09T12:04:00.000-03:00", autoTariff), null);
    assert.equal(calculateStayPrice("2026-11-09T08:35:00.000-03:00", "2026-11-09T09:05:00.000-03:00", { ...autoTariff, fractionMinutes: 0 }), null);
  });

  it("deriva ocupación y conserva pagos atómicos en el historial", () => {
    const tariff = DEMO_SEED_STATE.tariffs[0];
    assert.ok(tariff);
    const price = calculateStayPrice(
      "2026-11-09T08:35:00.000-03:00",
      "2026-11-09T12:05:00.000-03:00",
      tariff,
    );
    assert.equal(price?.totalCents, 756_000);

    const result = applyDemoAction(DEMO_SEED_STATE, {
      type: "confirm-payment-and-exit",
      id: "payment-demo-test",
      occurredAt: "2026-11-09T12:05:00.000-03:00",
      stayId: "stay-active-001",
      method: "efectivo",
      totalCents: 756_000,
      receivedCents: 800_000,
      requestInvoice: true,
    });

    assert.equal(result.success, true);
    assert.equal(selectActiveStays(result.state).length, 2);
    assert.equal(selectOccupancy(result.state).byCategory.auto, 0);
    assert.equal(result.state.payments.at(-1)?.changeCents, 44_000);
    assert.equal(result.state.payments.at(-1)?.netCents, 756_000);
    assert.equal(result.state.invoiceRequests.at(-1)?.status, "pending");
    assert.equal(result.state.movements.at(-1)?.paymentId, "payment-demo-test");
    assert.equal(selectCashSummary(result.state, "shift-current")?.expectedCashCents, 781_000);

    const repeatedPayment = applyDemoAction(result.state, {
      type: "confirm-payment-and-exit",
      id: "payment-demo-test-repeat",
      occurredAt: "2026-11-09T12:06:00.000-03:00",
      stayId: "stay-active-001",
      method: "efectivo",
      totalCents: 756_000,
      receivedCents: 800_000,
      requestInvoice: false,
    });

    assert.equal(repeatedPayment.success, false);
    assert.equal(repeatedPayment.state.payments.length, result.state.payments.length);
  });

  it("resume ocupación por categoría, duración y recaudación diaria local", () => {
    const currentTime = new Date("2026-11-09T12:00:00.000-03:00");
    const activeStaySummaries = selectActiveStaySummaries(DEMO_SEED_STATE, currentTime);
    const dailyRevenue = selectDailyRevenue(DEMO_SEED_STATE, currentTime);

    assert.equal(activeStaySummaries.length, 3);
    assert.equal(activeStaySummaries[0]?.stay.id, "stay-active-001");
    assert.equal(activeStaySummaries[0]?.elapsedMinutes, 205);
    assert.equal(activeStaySummaries[0]?.employeeName, "Ana Gómez");
    assert.deepEqual(selectOccupancy(DEMO_SEED_STATE).byCategory, { auto: 1, camioneta: 1, moto: 1 });
    assert.deepEqual(dailyRevenue, {
      paymentCount: 0,
      totalCents: 0,
      netByMethod: { efectivo: 0, debito: 0, transferencia: 0 },
    });

    const paymentTodayState = {
      ...DEMO_SEED_STATE,
      payments: [
        ...DEMO_SEED_STATE.payments,
        {
          id: "payment-today",
          stayId: "stay-active-001",
          shiftId: "shift-current",
          method: "transferencia" as const,
          totalCents: 50_000,
          changeCents: 0,
          netCents: 50_000,
          paidAt: "2026-11-10T01:30:00.000+00:00",
          employeeId: "employee-ana",
          fractionMinutes: 30,
          tariffPerFractionCents: 50_000,
        },
      ],
    };

    assert.deepEqual(selectDailyRevenue(paymentTodayState, currentTime), {
      paymentCount: 1,
      totalCents: 50_000,
      netByMethod: { efectivo: 0, debito: 0, transferencia: 50_000 },
    });

    const zeroCapacityState = { ...DEMO_SEED_STATE, settings: { ...DEMO_SEED_STATE.settings, capacity: 0 } };
    const exceededCapacityState = { ...DEMO_SEED_STATE, settings: { ...DEMO_SEED_STATE.settings, capacity: 2 } };
    assert.deepEqual(selectOccupancy(zeroCapacityState), {
      active: 3,
      byCategory: { auto: 1, camioneta: 1, moto: 1 },
      capacity: 0,
      available: 0,
      percentage: 0,
    });
    assert.equal(selectOccupancy(exceededCapacityState).available, 0);
    assert.equal(selectOccupancy(exceededCapacityState).percentage, 150);
  });

  it("bloquea efectivo insuficiente, caja cerrada y storage inválido o de otra versión", () => {
    const invalidPayment = applyDemoAction(DEMO_SEED_STATE, {
      type: "confirm-payment-and-exit",
      id: "payment-insufficient",
      occurredAt: "2026-11-09T12:05:00.000-03:00",
      stayId: "stay-active-001",
      method: "efectivo",
      totalCents: 756_000,
      receivedCents: 1,
      requestInvoice: false,
    });
    assert.equal(invalidPayment.success, false);

    const closedShiftState = {
      ...DEMO_SEED_STATE,
      shifts: DEMO_SEED_STATE.shifts.map((shift) => {
        if (shift.id === "shift-current") {
          return { ...shift, status: "closed" as const };
        }

        return shift;
      }),
    };
    const rejectedEntry = applyDemoAction(closedShiftState, {
      type: "register-entry",
      id: "entry-closed-shift",
      occurredAt: "2026-11-09T11:00:00.000-03:00",
      plateFragment: "ABC123",
      category: "auto",
    });
    assert.equal(rejectedEntry.success, false);

    const rejectedClosedShiftPayment = applyDemoAction(closedShiftState, {
      type: "confirm-payment-and-exit",
      id: "payment-after-shift-close",
      occurredAt: "2026-11-09T12:05:00.000-03:00",
      stayId: "stay-active-001",
      method: "debito",
      totalCents: 756_000,
      requestInvoice: false,
    });
    assert.equal(rejectedClosedShiftPayment.success, false);
    assert.equal(rejectedClosedShiftPayment.state.payments.length, DEMO_SEED_STATE.payments.length);

    assert.deepEqual(parseDemoState("{"), { status: "corrupt" });
    assert.deepEqual(parseDemoState(JSON.stringify({
      version: DEMO_STORAGE_VERSION + 1,
      savedAt: "2026-11-09T11:00:00.000-03:00",
      state: DEMO_SEED_STATE,
    })), { status: "outdated" });

    const duplicateTicketState = {
      ...DEMO_SEED_STATE,
      stays: DEMO_SEED_STATE.stays.map((stay) => {
        if (stay.id === "stay-active-002") {
          return { ...stay, ticketNumber: 3 };
        }

        return stay;
      }),
    };
    assert.deepEqual(parseDemoState(JSON.stringify({
      version: DEMO_STORAGE_VERSION,
      savedAt: "2026-11-09T11:00:00.000-03:00",
      state: duplicateTicketState,
    })), { status: "corrupt" });
  });

  it("registra arqueo, ajustes y cierre sin mezclar métodos electrónicos con efectivo", () => {
    const electronicPayment = applyDemoAction(DEMO_SEED_STATE, {
      type: "confirm-payment-and-exit",
      id: "payment-debit-current",
      occurredAt: "2026-11-09T12:05:00.000-03:00",
      stayId: "stay-active-001",
      method: "debito",
      totalCents: 756_000,
      requestInvoice: false,
    });
    assert.equal(electronicPayment.success, true);
    assert.equal(selectCashSummary(electronicPayment.state, "shift-current")?.expectedCashCents, 25_000);
    assert.equal(selectCashSummary(electronicPayment.state, "shift-current")?.netByMethod.debito, 756_000);

    const adjustmentIn = applyDemoAction(electronicPayment.state, {
      type: "record-cash-adjustment",
      id: "cash-adjustment-in",
      occurredAt: "2026-11-09T11:00:00.000-03:00",
      direction: "in",
      amountCents: 50_000,
      reason: "Fondo adicional",
    });
    assert.equal(adjustmentIn.success, true);

    const adjustmentOut = applyDemoAction(adjustmentIn.state, {
      type: "record-cash-adjustment",
      id: "cash-adjustment-out",
      occurredAt: "2026-11-09T11:10:00.000-03:00",
      direction: "out",
      amountCents: 10_000,
      reason: "Compra de cambio",
    });
    assert.equal(adjustmentOut.success, true);
    assert.equal(selectCashSummary(adjustmentOut.state, "shift-current")?.expectedCashCents, 65_000);

    const adjustmentWithoutReason = applyDemoAction(DEMO_SEED_STATE, {
      type: "record-cash-adjustment",
      id: "cash-adjustment-without-reason",
      occurredAt: "2026-11-09T11:10:00.000-03:00",
      direction: "in",
      amountCents: 1_000,
      reason: "   ",
    });
    assert.equal(adjustmentWithoutReason.success, false);

    const staleCashCount = applyDemoAction(adjustmentOut.state, {
      type: "count-cash",
      id: "cash-count-stale",
      occurredAt: "2026-11-09T11:05:00.000-03:00",
      countedCents: 65_000,
    });
    assert.equal(staleCashCount.success, true);

    const closeWithoutCurrentCashCount = applyDemoAction(staleCashCount.state, {
      type: "close-shift",
      id: "close-without-count",
      occurredAt: "2026-11-09T11:15:00.000-03:00",
    });
    assert.equal(closeWithoutCurrentCashCount.success, false);

    const cashCount = applyDemoAction(adjustmentOut.state, {
      type: "count-cash",
      id: "cash-count-current",
      occurredAt: "2026-11-09T11:20:00.000-03:00",
      countedCents: 64_800,
    });
    assert.equal(cashCount.success, true);
    assert.equal(cashCount.state.cashCounts.at(-1)?.differenceCents, -200);

    const negativeCashCount = applyDemoAction(adjustmentOut.state, {
      type: "count-cash",
      id: "cash-count-negative",
      occurredAt: "2026-11-09T11:20:00.000-03:00",
      countedCents: -1,
    });
    assert.equal(negativeCashCount.success, false);

    const closedShift = applyDemoAction(cashCount.state, {
      type: "close-shift",
      id: "shift-close-current",
      occurredAt: "2026-11-09T11:30:00.000-03:00",
    });
    assert.equal(closedShift.success, true);
    assert.equal(closedShift.state.shifts.find((shift) => shift.id === "shift-current")?.closedCashCountId, "cash-count-current");
    assert.equal(closedShift.state.movements.at(-1)?.kind, "shift-close");

    const repeatedShiftClose = applyDemoAction(closedShift.state, {
      type: "close-shift",
      id: "shift-close-repeat",
      occurredAt: "2026-11-09T11:31:00.000-03:00",
    });
    assert.equal(repeatedShiftClose.success, false);

    const cashReconciliationState = {
      ...DEMO_SEED_STATE,
      shifts: DEMO_SEED_STATE.shifts.map((shift) => {
        if (shift.id === "shift-current") {
          return { ...shift, openingCashCents: 23_500_000 };
        }

        return shift;
      }),
    };
    const expectedCash = selectCashSummary(cashReconciliationState, "shift-current");
    assert.equal(expectedCash?.expectedCashCents, 23_500_000);

    const reconciliation = applyDemoAction(cashReconciliationState, {
      type: "count-cash",
      id: "cash-count-reconciliation",
      occurredAt: "2026-11-09T12:00:00.000-03:00",
      countedCents: 23_480_000,
    });
    assert.equal(reconciliation.state.cashCounts.at(-1)?.differenceCents, -20_000);

    const rejectedEntry = applyDemoAction(closedShift.state, {
      type: "register-entry",
      id: "entry-after-close",
      occurredAt: "2026-11-09T11:31:00.000-03:00",
      plateFragment: "ABC123",
      category: "auto",
    });
    assert.equal(rejectedEntry.success, false);

  });

  it("asigna una posición simulada libre y conserva la auditoría tras un egreso", () => {
    const entry = applyDemoAction(DEMO_SEED_STATE, {
      type: "register-entry", id: "stay-map-test", occurredAt: "2026-11-09T11:00:00.000-03:00",
      plateFragment: "P45", category: "moto",
    });
    assert.equal(entry.state.stays.at(-1)?.positionId, "M-02");
    const audit = applyDemoAction(entry.state, { type: "create-audit", id: "audit-map-test", occurredAt: "2026-11-09T11:10:00.000-03:00" });
    assert.equal(audit.state.audits.at(-1)?.vehicles.find((vehicle) => vehicle.stayId === "stay-map-test")?.positionId, "M-02");
    const tariff = audit.state.tariffs.find((item) => item.category === "moto");
    assert.ok(tariff);
    const price = calculateStayPrice("2026-11-09T11:00:00.000-03:00", "2026-11-09T12:00:00.000-03:00", tariff);
    assert.ok(price);
    const exit = applyDemoAction(audit.state, { type: "confirm-payment-and-exit", id: "payment-map-test", occurredAt: "2026-11-09T12:00:00.000-03:00", stayId: "stay-map-test", method: "debito", totalCents: price.totalCents, requestInvoice: false });
    assert.equal(exit.success, true);
    assert.equal(selectActiveStays(exit.state).some((stay) => stay.id === "stay-map-test"), false);
    assert.equal(exit.state.audits.at(-1)?.vehicles.some((vehicle) => vehicle.stayId === "stay-map-test"), true);
  });

  it("descuenta una vez el gasto en efectivo y conserva empleados desactivados", () => {
    const expense = applyDemoAction(DEMO_SEED_STATE, { type: "record-expense", id: "expense-test", occurredAt: "2026-11-09T12:00:00.000-03:00", expenseDate: "2026-11-09T12:00:00.000-03:00", category: "Insumos", concept: "Papel", method: "efectivo", amountCents: 5_000 });
    assert.equal(expense.success, true);
    assert.equal(expense.state.expenses.length, 1);
    assert.equal(expense.state.cashAdjustments.length, 0);
    assert.equal(selectCashSummary(expense.state, "shift-current")?.expectedCashCents, 20_000);
    const employee = applyDemoAction(expense.state, { type: "save-employee", id: "edit-employee-test", occurredAt: "2026-11-09T12:05:00.000-03:00", employeeId: "employee-ana", displayName: "Ana Gómez", active: false });
    assert.equal(employee.state.employees.find((item) => item.id === "employee-ana")?.active, false);
    assert.equal(employee.state.shifts.find((item) => item.employeeId === "employee-ana")?.id, "shift-current");
  });

  it("permite abrir otro turno desde la terminal con un empleado activo", () => {
    const state = { ...DEMO_SEED_STATE, shifts: DEMO_SEED_STATE.shifts.map((shift) => shift.id === "shift-current" ? { ...shift, status: "closed" as const, closedAt: "2026-11-09T16:00:00.000-03:00", closedCashCountId: "cash-count-yesterday" } : shift) };
    const invalid = applyDemoAction(state, { type: "open-shift", id: "shift-invalid", occurredAt: "2026-11-09T16:10:00.000-03:00", employeeId: "missing", openingCashCents: 0 });
    assert.equal(invalid.success, false);
    const opened = applyDemoAction(state, { type: "open-shift", id: "shift-next", occurredAt: "2026-11-09T16:10:00.000-03:00", employeeId: "employee-lucia", openingCashCents: 50_000 });
    assert.equal(opened.success, true);
    assert.equal(opened.state.shifts.at(-1)?.employeeId, "employee-lucia");
    assert.equal(selectCashSummary(opened.state, "shift-next")?.expectedCashCents, 50_000);
  });

  it("restaura sesiones antiguas con los campos nuevos de administración", () => {
    const legacyState = { ...DEMO_SEED_STATE, expenses: undefined, audits: undefined, settings: { capacity: 80, connectionScenario: "online" } };
    const loaded = parseDemoState(JSON.stringify({ version: DEMO_STORAGE_VERSION, savedAt: "2026-11-09T12:00:00.000-03:00", state: legacyState }));
    assert.equal(loaded.status, "restored");
    if (loaded.status === "restored") {
      assert.deepEqual(loaded.state.expenses, []);
      assert.deepEqual(loaded.state.audits, []);
      assert.equal(loaded.state.settings.capacity, 30);
    }
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEMO_SEED_STATE } from "@/constants/demo-fixture.constant";
import { DEMO_STORAGE_VERSION } from "@/constants/demo.constant";
import { applyDemoAction } from "./demo.operations";
import { normalizePlateFragment } from "./plate";
import { selectActiveStays, selectCashSummary, selectMatchingActiveStays, selectOccupancy } from "./selectors";
import { calculateStayPrice } from "./tariff";
import { parseDemoState } from "../demo/demo-storage";

describe("estado demo del estacionamiento", () => {
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

    const closeWithoutCashCount = applyDemoAction(adjustmentOut.state, {
      type: "close-shift",
      id: "close-without-count",
      occurredAt: "2026-11-09T11:15:00.000-03:00",
    });
    assert.equal(closeWithoutCashCount.success, false);

    const cashCount = applyDemoAction(adjustmentOut.state, {
      type: "count-cash",
      id: "cash-count-current",
      occurredAt: "2026-11-09T11:20:00.000-03:00",
      countedCents: 64_800,
    });
    assert.equal(cashCount.success, true);
    assert.equal(cashCount.state.cashCounts.at(-1)?.differenceCents, -200);

    const closedShift = applyDemoAction(cashCount.state, {
      type: "close-shift",
      id: "shift-close-current",
      occurredAt: "2026-11-09T11:30:00.000-03:00",
    });
    assert.equal(closedShift.success, true);

    const rejectedEntry = applyDemoAction(closedShift.state, {
      type: "register-entry",
      id: "entry-after-close",
      occurredAt: "2026-11-09T11:31:00.000-03:00",
      plateFragment: "ABC123",
      category: "auto",
    });
    assert.equal(rejectedEntry.success, false);

  });
});

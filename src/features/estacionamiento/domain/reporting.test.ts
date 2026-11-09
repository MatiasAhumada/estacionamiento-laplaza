import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEMO_SEED_STATE } from "@/constants/demo-fixture.constant";
import { applyDemoAction } from "./demo.operations";
import { getLocalDateKey } from "./date.utils";
import { selectDateRange, selectMovementRecords, selectReportSummary } from "./reporting";
import { reportRangeSchema } from "../validation/report-range.schema";

describe("historial y reportes de la demo", () => {
  it("separa el vuelto del neto y desglosa el cobro por medio", () => {
    const paymentResult = applyDemoAction(DEMO_SEED_STATE, {
      type: "confirm-payment-and-exit",
      id: "payment-report-acceptance",
      occurredAt: "2026-11-09T12:05:00.000-03:00",
      stayId: "stay-active-001",
      method: "efectivo",
      totalCents: 756_000,
      receivedCents: 800_000,
      requestInvoice: false,
    });

    assert.equal(paymentResult.success, true);
    const range = { from: "2026-11-09", to: "2026-11-09" };
    const summary = selectReportSummary(paymentResult.state, range);
    const paymentMovements = selectMovementRecords(paymentResult.state, {
      ...range,
      employeeId: "employee-ana",
      shiftId: "shift-current",
      method: "efectivo",
    });

    assert.equal(summary.totalCents, 756_000);
    assert.deepEqual(summary.netByMethod, { efectivo: 756_000, debito: 0, transferencia: 0 });
    assert.equal(paymentMovements.length, 1);
    assert.equal(paymentMovements[0]?.payment?.receivedCents, 800_000);
    assert.equal(paymentMovements[0]?.payment?.changeCents, 44_000);
    assert.equal(paymentMovements[0]?.payment?.netCents, 756_000);
  });

  it("filtra operaciones por turno, empleado, medio y fecha, incluyendo auditorías", () => {
    const auditResult = applyDemoAction(DEMO_SEED_STATE, {
      type: "create-audit",
      id: "audit-report-test",
      occurredAt: "2026-11-09T12:10:00.000-03:00",
    });
    const records = selectMovementRecords(auditResult.state, {
      from: "2026-11-09",
      to: "2026-11-09",
      employeeId: "all",
      shiftId: "all",
      method: "all",
    });

    assert.equal(records.length, 4);
    assert.equal(records.find((record) => record.audit?.id === "audit-report-test")?.audit?.vehicles.length, 3);
    assert.equal(selectMovementRecords(auditResult.state, {
      from: "2026-11-09",
      to: "2026-11-09",
      employeeId: "employee-ana",
      shiftId: "shift-current",
      method: "efectivo",
    }).length, 0);
  });

  it("valida rangos y calcula períodos en horario de Buenos Aires", () => {
    const referenceDate = new Date("2026-11-09T01:30:00.000Z");
    const previousDaySummary = selectReportSummary(DEMO_SEED_STATE, {
      from: "2026-11-08",
      to: "2026-11-08",
    });
    const historicalNetCents = DEMO_SEED_STATE.payments
      .filter((payment) => payment.paidAt.startsWith("2026-11-08"))
      .reduce((total, payment) => total + payment.netCents, 0);

    assert.equal(getLocalDateKey(referenceDate), "2026-11-08");
    assert.equal(previousDaySummary.totalCents, historicalNetCents);
    assert.equal(previousDaySummary.cashCountCount, 1);
    assert.equal(previousDaySummary.cashDifferenceCents, -200);
    assert.equal(reportRangeSchema.safeParse({ from: "2026-11-08", to: "2026-11-08" }).success, true);
    assert.equal(reportRangeSchema.safeParse({ from: "", to: "" }).success, false);
    assert.equal(reportRangeSchema.safeParse({ from: "2026-11-10", to: "2026-11-09" }).success, false);
    assert.equal(reportRangeSchema.safeParse({ from: "2026-13-40", to: "2026-13-40" }).success, false);
    assert.deepEqual(selectDateRange("daily", referenceDate, { from: "", to: "" }), {
      from: "2026-11-08",
      to: "2026-11-08",
    });
    assert.deepEqual(selectDateRange("weekly", new Date("2026-11-09T15:00:00.000Z"), { from: "", to: "" }), {
      from: "2026-11-09",
      to: "2026-11-15",
    });
    assert.deepEqual(selectDateRange("monthly", new Date("2026-11-09T15:00:00.000Z"), { from: "", to: "" }), {
      from: "2026-11-01",
      to: "2026-11-09",
    });
    assert.deepEqual(selectDateRange("yearly", new Date("2026-11-09T15:00:00.000Z"), { from: "", to: "" }), {
      from: "2026-01-01",
      to: "2026-11-09",
    });
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEMO_SEED_STATE } from "@/constants/demo-fixture.constant";
import { applyDemoAction } from "./demo.operations";
import { getLocalDateKey } from "./date.utils";
import { selectDateRange, selectFinancialReport, selectMovementRecords, selectReportSummary } from "./reporting";
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

  it("concilia cobros y gastos por fecha, turno y empleado usando centavos", () => {
    const stateWithExpense = {
      ...DEMO_SEED_STATE,
      expenses: [{
        id: "expense-report-test",
        shiftId: "shift-closed-yesterday",
        employeeId: "employee-marcos",
        category: "Insumos",
        concept: "Material",
        method: "efectivo" as const,
        amountCents: 20_001,
        occurredAt: "2026-11-08T12:00:00.000-03:00",
      }],
    };
    const report = selectFinancialReport(stateWithExpense, {
      from: "2026-11-08",
      to: "2026-11-08",
      employeeId: "employee-marcos",
      shiftId: "shift-closed-yesterday",
    });

    assert.equal(report.incomeCents, 820_000);
    assert.equal(report.expenseCents, 20_001);
    assert.equal(report.operatingResultCents, 799_999);
    assert.equal(report.periods[0]?.operatingResultCents, 799_999);
    assert.equal(report.employees[0]?.label, "Marcos Díaz");
    assert.equal(report.shifts[0]?.incomeCents, 820_000);
    assert.equal(report.projection.status, "insufficient");
    assert.equal(report.projection.activeDays, 1);
  });

  it("proyecta solo con actividad en los siete días de la ventana", () => {
    const payments = Array.from({ length: 7 }, (_, index) => {
      const day = String(index + 10).padStart(2, "0");

      return {
        ...DEMO_SEED_STATE.payments[0]!,
        id: `payment-projection-${day}`,
        stayId: `stay-projection-${day}`,
        shiftId: "shift-current",
        employeeId: "employee-ana",
        netCents: 10_001,
        paidAt: `2026-11-${day}T12:00:00.000-03:00`,
      };
    });
    const expenses = Array.from({ length: 7 }, (_, index) => {
      const day = String(index + 10).padStart(2, "0");

      return {
        id: `expense-projection-${day}`,
        shiftId: "shift-current",
        employeeId: "employee-ana",
        category: "Insumos",
        concept: "Material",
        method: "efectivo" as const,
        amountCents: 1,
        occurredAt: `2026-11-${day}T13:00:00.000-03:00`,
      };
    });
    const report = selectFinancialReport({ ...DEMO_SEED_STATE, payments, expenses }, {
      from: "2026-11-10",
      to: "2026-11-16",
      employeeId: "employee-ana",
      shiftId: "shift-current",
    });

    assert.equal(report.projection.status, "supported");
    assert.equal(report.projection.activeDays, 7);
    assert.equal(report.projection.dailyAverageCents, 10_000);
    assert.equal(report.projection.nextWeekCents, 70_000);
    assert.equal(report.periods.length, 7);
    assert.equal(report.periods[0]?.incomeCents, 10_001);
    assert.equal(report.periods[0]?.expenseCents, 1);
  });
});

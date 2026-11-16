import type { DemoPaymentMethod } from "./demo.types";

export type DemoReportPeriod = "daily" | "weekly" | "monthly" | "yearly" | "range";

export interface DemoDateRange {
  from: string;
  to: string;
}

export interface DemoMovementFilters extends DemoDateRange {
  employeeId: string;
  shiftId: string;
  method: DemoPaymentMethod | "all";
}

export interface FinancialReportFilters extends DemoDateRange {
  employeeId: string;
  shiftId: string;
}

export interface FinancialPeriodPoint {
  label: string;
  incomeCents: number;
  expenseCents: number;
  operatingResultCents: number;
}

export interface FinancialComparisonPoint {
  id: string;
  label: string;
  incomeCents: number;
  expenseCents: number;
  operatingResultCents: number;
}

export interface FinancialProjection {
  status: "supported" | "insufficient";
  activeDays: number;
  dailyAverageCents: number;
  nextWeekCents: number;
}

export interface FinancialReport {
  incomeCents: number;
  expenseCents: number;
  operatingResultCents: number;
  paymentCount: number;
  expenseCount: number;
  periods: FinancialPeriodPoint[];
  employees: FinancialComparisonPoint[];
  shifts: FinancialComparisonPoint[];
  projection: FinancialProjection;
}

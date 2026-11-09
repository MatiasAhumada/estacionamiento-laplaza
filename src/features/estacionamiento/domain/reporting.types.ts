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

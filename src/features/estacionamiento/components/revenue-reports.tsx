"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_CURRENCY, DEMO_LOCALE } from "@/constants/demo.constant";
import { useDemoState } from "@/features/estacionamiento/demo/demo-provider";
import type { DemoDateRange, DemoReportPeriod, FinancialComparisonPoint, FinancialPeriodPoint } from "@/features/estacionamiento/domain/reporting.types";
import { selectDateRange, selectFinancialReport } from "@/features/estacionamiento/domain/reporting";
import { reportRangeSchema } from "@/features/estacionamiento/validation/report-range.schema";

const currencyFormatter = new Intl.NumberFormat(DEMO_LOCALE, {
  currency: DEMO_CURRENCY,
  style: "currency",
});

const reportPeriods: { value: DemoReportPeriod; label: string }[] = [
  { value: "daily", label: "Día" },
  { value: "weekly", label: "Semana" },
  { value: "monthly", label: "Mes" },
  { value: "yearly", label: "Año" },
  { value: "range", label: "Rango personalizado" },
];

function formatCurrency(amountCents: number): string {
  return currencyFormatter.format(amountCents / 100);
}

function SummaryCard({
  label,
  value,
  detail,
}: Readonly<{ label: string; value: string; detail: string }>) {
  return (
    <Card className="gap-3 rounded-2xl p-4 shadow-none ring-border sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-primary sm:text-3xl">{value}</p>
      <p className="text-xs leading-5 text-muted-foreground">{detail}</p>
    </Card>
  );
}

function FinancialTrend({ periods }: Readonly<{ periods: FinancialPeriodPoint[] }>) {
  if (!periods.length) {
    return <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">No hay cobros ni gastos registrados en este período.</p>;
  }

  const maximumCents = Math.max(...periods.flatMap((point) => [point.incomeCents, point.expenseCents, Math.abs(point.operatingResultCents)]));

  return (
    <div aria-label="Gráfico de barras de cobros netos, gastos y resultado operativo estimado por período" className="overflow-x-auto pb-2" role="group">
      <div className="grid min-w-max grid-flow-col auto-cols-[4.25rem] items-end gap-3 border-b border-border px-1 pb-2 sm:auto-cols-[5rem] sm:gap-4">
        {periods.map((point) => {
          let incomeHeight = 0;
          let expenseHeight = 0;
          let resultHeight = 0;

          if (maximumCents > 0) {
            if (point.incomeCents > 0) {
              incomeHeight = Math.max(3, Math.round((point.incomeCents / maximumCents) * 60));
            }

            if (point.expenseCents > 0) {
              expenseHeight = Math.max(3, Math.round((point.expenseCents / maximumCents) * 60));
            }

            if (point.operatingResultCents !== 0) {
              resultHeight = Math.max(3, Math.round((Math.abs(point.operatingResultCents) / maximumCents) * 60));
            }
          }

          let resultPosition = "bottom-1/2";
          let resultCorner = "rounded-t-md";

          if (point.operatingResultCents < 0) {
            resultPosition = "top-1/2";
            resultCorner = "rounded-b-md";
          }

          return (
            <div className="grid grid-rows-[9rem_auto] items-end gap-2 text-center" key={point.label}>
              <div className="relative flex h-full items-center justify-center">
                <span aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-border" />
                <div aria-label={`Cobros netos ${formatCurrency(point.incomeCents)}`} className="absolute bottom-1/2 w-3 rounded-t-md bg-secondary sm:w-4" style={{ height: `${incomeHeight}px` }} />
                <div aria-label={`Gastos ${formatCurrency(point.expenseCents)}`} className="absolute bottom-1/2 w-3 translate-x-4 rounded-t-md bg-action sm:w-4 sm:translate-x-5" style={{ height: `${expenseHeight}px` }} />
                <div aria-label={`Resultado operativo estimado ${formatCurrency(point.operatingResultCents)}`} className={`absolute ${resultPosition} w-3 -translate-x-4 ${resultCorner} bg-primary sm:w-4 sm:-translate-x-5`} style={{ height: `${resultHeight}px` }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{point.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-sm bg-secondary" />Cobros netos</span>
        <span className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-sm bg-action" />Gastos</span>
        <span className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-sm bg-primary" />Resultado operativo estimado</span>
      </div>
      <ul className="sr-only">
        {periods.map((point) => <li key={`${point.label}-summary`}>{point.label}: cobros {formatCurrency(point.incomeCents)}, gastos {formatCurrency(point.expenseCents)}, resultado operativo estimado {formatCurrency(point.operatingResultCents)}.</li>)}
      </ul>
    </div>
  );
}

function ComparisonList({
  title,
  points,
}: Readonly<{ title: string; points: FinancialComparisonPoint[] }>) {
  return (
    <Card className="gap-4 rounded-2xl shadow-none ring-border">
      <CardHeader className="gap-1 px-5 pb-0 sm:px-6">
        <CardTitle className="font-display text-lg font-bold text-primary">{title}</CardTitle>
        <CardDescription>Cobros y gastos atribuidos a sus registros de origen.</CardDescription>
      </CardHeader>
      <CardContent className="px-5 sm:px-6">
        {points.length ? (
          <ul className="divide-y divide-border">
            {points.map((point) => (
              <li className="grid gap-1 py-3 first:pt-0 last:pb-0" key={point.id}>
                <span className="font-semibold text-primary">{point.label}</span>
                <span className="break-words text-xs leading-5 text-muted-foreground">Cobros {formatCurrency(point.incomeCents)} · Gastos {formatCurrency(point.expenseCents)} · Resultado estimado <strong className="font-semibold text-foreground">{formatCurrency(point.operatingResultCents)}</strong></span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Sin movimientos para comparar con estos filtros.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueReports() {
  const { state, isHydrated, storageStatus } = useDemoState();
  const [period, setPeriod] = useState<DemoReportPeriod>("monthly");
  const [customRange, setCustomRange] = useState<DemoDateRange>({ from: "", to: "" });
  const [employeeId, setEmployeeId] = useState("all");
  const [shiftId, setShiftId] = useState("all");
  const today = new Date();
  const selectedRange = selectDateRange(period, today, customRange);
  const rangeValidation = reportRangeSchema.safeParse(selectedRange);
  let report: ReturnType<typeof selectFinancialReport> | undefined;

  if (isHydrated && rangeValidation.success) {
    report = selectFinancialReport(state, { ...selectedRange, employeeId, shiftId });
  }

  const selectedEmployee = state.employees.find((employee) => employee.id === employeeId);
  const availableShifts = state.shifts.filter((shift) => !selectedEmployee || shift.employeeId === selectedEmployee.id);
  const activeRecords = (report?.paymentCount ?? 0) + (report?.expenseCount ?? 0);
  const hasStorageError = storageStatus === "unavailable" || storageStatus === "corrupt";

  function updatePeriod(value: string) {
    const selectedPeriod = reportPeriods.find((candidate) => candidate.value === value);

    if (selectedPeriod) {
      setPeriod(selectedPeriod.value);
    }
  }

  function updateCustomDate(key: keyof DemoDateRange, value: string) {
    setPeriod("range");
    setCustomRange((currentRange) => ({ ...currentRange, [key]: value }));
  }

  function updateEmployee(value: string) {
    setEmployeeId(value);
    setShiftId("all");
  }

  return (
    <section aria-labelledby="financial-report-title" className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:px-8">
      <header>
        <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">Gestión financiera</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl" id="financial-report-title">Análisis financiero</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Cobros netos, gastos y resultado operativo estimado a partir de los registros simulados.</p>
      </header>

      <Card className="gap-5 rounded-2xl shadow-none ring-border">
        <CardHeader className="gap-1 px-5 pb-0 sm:px-6">
          <CardTitle className="font-display text-lg font-bold text-primary">Filtros del análisis</CardTitle>
          <CardDescription>Todos los importes y gráficos usan el mismo período, turno y empleado.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
          <div className="grid gap-2">
            <Label htmlFor="report-period">Período</Label>
            <Select onValueChange={updatePeriod} value={period}>
              <SelectTrigger className="min-h-11 w-full" id="report-period"><SelectValue /></SelectTrigger>
              <SelectContent>{reportPeriods.map((reportPeriod) => <SelectItem key={reportPeriod.value} value={reportPeriod.value}>{reportPeriod.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="report-employee">Empleado</Label>
            <Select onValueChange={updateEmployee} value={employeeId}>
              <SelectTrigger className="min-h-11 w-full" id="report-employee"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los empleados</SelectItem>
                {state.employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.displayName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="report-shift">Turno</Label>
            <Select onValueChange={setShiftId} value={shiftId}>
              <SelectTrigger className="min-h-11 w-full" id="report-shift"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los turnos</SelectItem>
                {availableShifts.map((shift) => <SelectItem key={shift.id} value={shift.id}>{shift.label ?? "Turno sin nombre"} · {selectedEmployee?.displayName ?? state.employees.find((employee) => employee.id === shift.employeeId)?.displayName ?? "Empleado no disponible"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="report-from">Desde</Label>
            <Input disabled={period !== "range"} id="report-from" onChange={(event) => updateCustomDate("from", event.target.value)} type="date" value={customRange.from} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="report-to">Hasta</Label>
            <Input disabled={period !== "range"} id="report-to" onChange={(event) => updateCustomDate("to", event.target.value)} type="date" value={customRange.to} />
          </div>
        </CardContent>
      </Card>

      {!rangeValidation.success ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
          {rangeValidation.error.issues[0]?.message ?? "Revisá el rango de fechas."}
        </p>
      ) : null}

      {hasStorageError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">No se pudo leer el estado de la demo. Restablecé la sesión e intentá nuevamente.</p>
      ) : null}

      {!isHydrated ? (
        <Card aria-live="polite" className="rounded-2xl border-dashed shadow-none">
          <CardContent className="p-5 text-sm text-muted-foreground">Preparando el análisis…</CardContent>
        </Card>
      ) : report && rangeValidation.success ? (
        <>
          <section aria-label="Indicadores financieros del período" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard detail={`${report.paymentCount} cobros confirmados`} label="Cobros netos" value={formatCurrency(report.incomeCents)} />
            <SummaryCard detail={`${report.expenseCount} gastos registrados`} label="Gastos" value={formatCurrency(report.expenseCents)} />
            <SummaryCard detail="Cobros menos gastos registrados" label="Resultado operativo estimado" value={formatCurrency(report.operatingResultCents)} />
          </section>

          <Card className="gap-5 rounded-2xl shadow-none ring-border">
            <CardHeader className="gap-1 px-5 pb-0 sm:px-6">
              <CardTitle className="font-display text-lg font-bold text-primary">Cobros y gastos en el tiempo</CardTitle>
              <CardDescription>Importes netos por día o agrupados por mes para rangos mayores a 31 días. {selectedRange.from} a {selectedRange.to}.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 px-5 sm:px-6">
              <FinancialTrend periods={report.periods} />
              {report.periods.length ? (
                <ul className="divide-y divide-border border-t border-border">
                  {report.periods.map((point) => <li className="grid gap-1 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_repeat(3,auto)] sm:items-center sm:gap-4" key={`${point.label}-detail`}><strong className="text-primary">{point.label}</strong><span className="text-muted-foreground">Cobros {formatCurrency(point.incomeCents)}</span><span className="text-muted-foreground">Gastos {formatCurrency(point.expenseCents)}</span><span className="font-semibold text-foreground">Resultado estimado {formatCurrency(point.operatingResultCents)}</span></li>)}
                </ul>
              ) : null}
            </CardContent>
          </Card>

          <section aria-label="Comparación entre turnos y empleados" className="grid gap-4 lg:grid-cols-2">
            <ComparisonList points={report.shifts} title="Comparación por turno" />
            <ComparisonList points={report.employees} title="Comparación por empleado" />
          </section>

          <Card className="gap-4 rounded-2xl shadow-none ring-border">
            <CardHeader className="gap-1 px-5 pb-0 sm:px-6">
              <CardTitle className="font-display text-lg font-bold text-primary">Proyección semanal estimativa</CardTitle>
              <CardDescription>Promedio diario del resultado operativo en los últimos siete días del rango, multiplicado por siete. No modela tendencias ni costos no registrados.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 px-5 sm:px-6">
              {report.projection.status === "supported" ? (
                <>
                  <p className="font-display text-3xl font-bold tabular-nums text-primary">{formatCurrency(report.projection.nextWeekCents)}</p>
                  <p className="text-sm text-muted-foreground">Estimación para los próximos siete días con actividad en 7 de 7 días observados. Promedio diario: {formatCurrency(report.projection.dailyAverageCents)}.</p>
                </>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">Datos insuficientes: se requiere actividad registrada en los siete días previos al cierre del rango para mostrar una proyección.</p>
              )}
            </CardContent>
          </Card>

          {!activeRecords ? <p className="sr-only" role="status">No hay movimientos con los filtros seleccionados.</p> : null}
          <p className="text-xs leading-5 text-muted-foreground">El resultado operativo es una estimación de cobros menos gastos registrados. No representa ganancia neta ni contempla costos, impuestos u otros gastos no cargados.</p>
        </>
      ) : null}
    </section>
  );
}

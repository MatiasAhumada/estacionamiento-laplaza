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
import { DEMO_PAYMENT_METHODS } from "@/features/estacionamiento/domain/demo.types";
import { useDemoState } from "@/features/estacionamiento/demo/demo-provider";
import type {
  DemoPaymentMethod,
} from "@/features/estacionamiento/domain/demo.types";
import type { DemoDateRange, DemoReportPeriod } from "@/features/estacionamiento/domain/reporting.types";
import { selectDateRange, selectReportSummary } from "@/features/estacionamiento/domain/reporting";
import { reportRangeSchema } from "@/features/estacionamiento/validation/report-range.schema";

const currencyFormatter = new Intl.NumberFormat(DEMO_LOCALE, {
  currency: DEMO_CURRENCY,
  style: "currency",
});

const methodLabels: Record<DemoPaymentMethod, string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  transferencia: "Transferencia",
};

const reportPeriods: { value: DemoReportPeriod; label: string }[] = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
  { value: "range", label: "Rango personalizado" },
];

function formatCurrency(amountCents: number): string {
  return currencyFormatter.format(amountCents / 100);
}

function getBarWidth(amountCents: number, maximumCents: number): string {
  if (maximumCents <= 0) {
    return "0%";
  }

  return `${Math.round((amountCents / maximumCents) * 100)}%`;
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

export function RevenueReports() {
  const { state, isHydrated } = useDemoState();
  const [period, setPeriod] = useState<DemoReportPeriod>("daily");
  const [customRange, setCustomRange] = useState<DemoDateRange>({ from: "", to: "" });
  const today = new Date();

  let selectedRange: DemoDateRange = customRange;

  selectedRange = selectDateRange(period, today, customRange);

  const rangeValidation = reportRangeSchema.safeParse(selectedRange);
  let summary: ReturnType<typeof selectReportSummary> | undefined;

  if (isHydrated && rangeValidation.success) {
    summary = selectReportSummary(state, selectedRange);
  }

  const methodMaximum = Math.max(...Object.values(summary?.netByMethod ?? { efectivo: 0, debito: 0, transferencia: 0 }));

  function updatePeriod(value: string) {
    const selectedPeriod = reportPeriods.find((reportPeriod) => reportPeriod.value === value);

    if (selectedPeriod) {
      setPeriod(selectedPeriod.value);
    }
  }

  function updateCustomDate(key: keyof DemoDateRange, value: string) {
    setPeriod("range");
    setCustomRange((currentRange) => ({ ...currentRange, [key]: value }));
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <header>
        <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">Lectura de caja</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">Reportes de recaudación</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Totales netos derivados de cobros confirmados. Los importes de esta vista son simulados.
        </p>
      </header>

      <Card className="gap-5 rounded-2xl shadow-none ring-border">
        <CardHeader className="gap-1 px-5 pb-0 sm:px-6">
          <CardTitle className="font-display text-lg font-bold text-primary">Período del informe</CardTitle>
          <CardDescription>Elegí un período o definí fechas inclusivas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 sm:grid-cols-3 sm:items-end sm:px-6">
          <div className="grid gap-2">
            <Label htmlFor="report-period">Frecuencia</Label>
            <Select onValueChange={updatePeriod} value={period}>
            <SelectTrigger className="min-h-11 w-full" id="report-period"><SelectValue /></SelectTrigger>
              <SelectContent>
                {reportPeriods.map((reportPeriod) => <SelectItem key={reportPeriod.value} value={reportPeriod.value}>{reportPeriod.label}</SelectItem>)}
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

      {!isHydrated ? (
        <Card aria-live="polite" className="rounded-2xl border-dashed shadow-none">
          <CardContent className="p-5 text-sm text-muted-foreground">Preparando el informe…</CardContent>
        </Card>
      ) : summary ? (
        <>
          <section aria-label="Indicadores del período" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <SummaryCard detail={`${summary.paymentCount} cobros confirmados`} label="Recaudación neta" value={formatCurrency(summary.totalCents)} />
            <SummaryCard detail="Promedio por cobro" label="Ticket promedio" value={formatCurrency(summary.averagePaymentCents)} />
            <SummaryCard detail="Arqueos registrados" label="Conteos de caja" value={summary.cashCountCount.toString()} />
            <SummaryCard detail="Último arqueo por turno en el período" label="Diferencia registrada" value={formatCurrency(summary.cashDifferenceCents)} />
          </section>

          <Card className="gap-5 rounded-2xl shadow-none ring-border">
            <CardHeader className="gap-1 px-5 pb-0 sm:px-6">
              <CardTitle className="font-display text-lg font-bold text-primary">Desglose por medio</CardTitle>
              <CardDescription>
                La suma de los medios coincide con la recaudación neta del período ({selectedRange.from} a {selectedRange.to}).
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 px-5 sm:px-6">
              {DEMO_PAYMENT_METHODS.map((method) => (
                <div className="grid gap-2" key={method}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{methodLabels[method]}</span>
                    <span className="font-semibold tabular-nums">{formatCurrency(summary.netByMethod[method])}</span>
                  </div>
                  <div aria-label={`${methodLabels[method]}: ${getBarWidth(summary.netByMethod[method], methodMaximum)}`} className="h-2.5 overflow-hidden rounded-full bg-muted" role="img">
                    <div className="h-full rounded-full bg-secondary transition-[width]" style={{ width: getBarWidth(summary.netByMethod[method], methodMaximum) }} />
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="border-t border-border px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3 font-semibold text-primary">
                <span>Total neto</span>
                <span className="font-display text-lg tabular-nums">{formatCurrency(summary.totalCents)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Efectivo recibido y vuelto quedan auditados por separado; el neto no suma el vuelto.</p>
            </div>
          </Card>
        </>
      ) : (
        <Card className="rounded-2xl border-dashed shadow-none">
          <CardContent className="p-5 text-sm text-muted-foreground">Corregí las fechas para consultar el reporte.</CardContent>
        </Card>
      )}
    </div>
  );
}

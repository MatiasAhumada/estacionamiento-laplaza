import { ShiftCashHub } from "@/features/estacionamiento/components/shift-cash-hub";

export default async function ShiftCashPage({ searchParams }: Readonly<{ searchParams: Promise<{ tab?: string; vista?: string }> }>) {
  const params = await searchParams;
  return <ShiftCashHub initialTab={params.tab === "caja" ? "Movimientos de caja" : params.tab === "reportes" ? "Reportes y auditorías" : "Resumen financiero"} initialReportView={params.vista === "movimientos" ? "movimientos" : "recaudacion"} />;
}

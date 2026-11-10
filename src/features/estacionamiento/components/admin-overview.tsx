"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDemoState } from "../demo/demo-provider";
import { selectActiveShift, selectCashSummary, selectDailyRevenue, selectOccupancy } from "../domain/selectors";
import { getLocalDateKey } from "../domain/date.utils";
import { AdminBarChart, AdminDonut, AdminPanel, AdminStat, formatDateTime, formatMoney } from "./admin-visuals";

const days = new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: "America/Argentina/Buenos_Aires" });

function movementName(kind: string): string {
  if (kind === "entry") return "Ingreso de vehículo";
  if (kind === "payment") return "Cobro y salida";
  if (kind === "expense") return "Gasto registrado";
  if (kind === "cash-count") return "Arqueo de caja";
  if (kind === "cash-adjustment") return "Movimiento de caja";
  return "Cierre de turno";
}

export function AdminOverview() {
  const { state, isHydrated } = useDemoState();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60_000); return () => window.clearInterval(timer); }, []);
  const occupancy = selectOccupancy(state);
  const daily = selectDailyRevenue(state, now);
  const shift = selectActiveShift(state);
  const cash = shift ? selectCashSummary(state, shift.id) : undefined;
  const today = getLocalDateKey(now);
  const expensesToday = state.expenses.filter((expense) => getLocalDateKey(new Date(expense.occurredAt)) === today).reduce((sum, expense) => sum + expense.amountCents, 0);
  const month = today.slice(0, 7);
  const monthRevenue = state.payments.filter((payment) => getLocalDateKey(new Date(payment.paidAt)).startsWith(month)).reduce((sum, payment) => sum + payment.netCents, 0);
  const yesterday = getLocalDateKey(new Date(now.getTime() - 86_400_000));
  const yesterdayRevenue = state.payments.filter((payment) => getLocalDateKey(new Date(payment.paidAt)) === yesterday).reduce((sum, payment) => sum + payment.netCents, 0);
  const previousMonthDate = new Date(now); previousMonthDate.setDate(1); previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonth = getLocalDateKey(previousMonthDate).slice(0, 7);
  const previousMonthRevenue = state.payments.filter((payment) => getLocalDateKey(new Date(payment.paidAt)).startsWith(previousMonth)).reduce((sum, payment) => sum + payment.netCents, 0);
  const week = Array.from({ length: 7 }, (_, index) => { const day = new Date(now); day.setDate(now.getDate() - 6 + index); return day; });
  const weekValues = week.map((day) => state.payments.filter((payment) => getLocalDateKey(new Date(payment.paidAt)) === getLocalDateKey(day)).reduce((sum, payment) => sum + payment.netCents, 0));
  const entriesToday = state.movements.filter((movement) => movement.kind === "entry" && getLocalDateKey(new Date(movement.occurredAt)) === today).length;
  const exitsToday = state.movements.filter((movement) => movement.kind === "payment" && getLocalDateKey(new Date(movement.occurredAt)) === today).length;
  const activityMovements = state.movements.filter((movement) => (movement.kind === "entry" || movement.kind === "payment") && getLocalDateKey(new Date(movement.occurredAt)) === today);
  const activityHours = Array.from({ length: 12 }, (_, index) => index * 2);
  const activityValues = activityHours.map((hour) => activityMovements.filter((movement) => Number(new Intl.DateTimeFormat("en", { hour: "2-digit", hourCycle: "h23", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(movement.occurredAt))) >= hour && Number(new Intl.DateTimeFormat("en", { hour: "2-digit", hourCycle: "h23", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(movement.occurredAt))) < hour + 2).length);
  const shiftPayments = state.payments.filter((payment) => payment.shiftId === shift?.id);
  const shiftRevenue = shiftPayments.reduce((sum, payment) => sum + payment.netCents, 0);
  const latestCount = state.cashCounts.filter((count) => count.shiftId === shift?.id).at(-1);
  const recent = [...state.movements].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 5);

  if (!isHydrated) return <p className="rounded-2xl bg-white p-6 text-muted-foreground">Cargando el panel…</p>;
  return <div className="space-y-7">
    <section className="flex flex-col justify-between gap-4 rounded-3xl bg-primary p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-8">
      <div><p className="text-xs font-bold tracking-[0.18em] text-sky-200 uppercase">Visión general</p><h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Buen día, La Plaza</h1><p className="mt-2 max-w-xl text-sm text-sky-100/85">Ocupación, finanzas y actividad de la playa en un solo lugar.</p></div>
      <Button asChild className="min-h-11 bg-action font-bold text-primary hover:bg-action/90"><Link href="/admin/ocupacion?modo=auditoria">Generar auditoría de playa →</Link></Button>
    </section>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><AdminStat label="Ocupación actual" value={`${occupancy.active} / ${occupancy.capacity}`} detail={`${occupancy.percentage}% ocupado · ${occupancy.available} libres`} accent /><AdminStat label="Recaudación de hoy" value={formatMoney(daily.totalCents)} detail={`${daily.paymentCount} cobros · ayer ${formatMoney(yesterdayRevenue)}`} /><AdminStat label="Gastos de hoy" value={formatMoney(expensesToday)} detail="Gastos registrados en la demo" /><AdminStat label="Resultado estimado" value={formatMoney(daily.totalCents - expensesToday)} detail="Recaudación menos gastos de hoy" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
      <AdminPanel title="Evolución de ingresos" subtitle="Cobros de los últimos siete días"><AdminBarChart labels={week.map((day) => days.format(day))} values={weekValues} /><p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">Mes actual: <strong className="text-primary">{formatMoney(monthRevenue)}</strong> · Mes anterior: <strong className="text-primary">{formatMoney(previousMonthRevenue)}</strong></p></AdminPanel>
      <AdminPanel title="Ocupación por categoría" subtitle="Estadías activas / capacidad ilustrativa"><AdminDonut center={`${occupancy.percentage}%`} label="ocupado" segments={[{ label: "Autos", value: occupancy.byCategory.auto, color: "#219ebc" }, { label: "Camionetas", value: occupancy.byCategory.camioneta, color: "#023047" }, { label: "Motos", value: occupancy.byCategory.moto, color: "#ffb703" }, { label: "Libres", value: occupancy.available, color: "#eaf1f5" }]} /><div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs"><span><strong className="block text-lg text-primary">{occupancy.byCategory.auto}</strong>Autos</span><span><strong className="block text-lg text-primary">{occupancy.byCategory.camioneta}</strong>Camionetas</span><span><strong className="block text-lg text-primary">{occupancy.byCategory.moto}</strong>Motos</span></div></AdminPanel>
    </div>
    <div className="grid gap-5 xl:grid-cols-3">
      <AdminPanel title="Medios de pago" subtitle="Cobros registrados hoy"><AdminDonut center={formatMoney(daily.totalCents)} label="total" segments={[{ label: "Efectivo", value: daily.netByMethod.efectivo, color: "#023047" }, { label: "Débito", value: daily.netByMethod.debito, color: "#219ebc" }, { label: "Transferencia", value: daily.netByMethod.transferencia, color: "#ffb703" }]} /></AdminPanel>
      <AdminPanel title="Actividad por horarios" subtitle="Ingresos y salidas de vehículos hoy, cada dos horas"><div className="mb-3 flex justify-between rounded-xl bg-muted/60 p-3 text-xs"><span>Ingresos <strong className="text-primary">{entriesToday}</strong></span><span>Salidas <strong className="text-primary">{exitsToday}</strong></span></div><AdminBarChart formatValue={(value) => `${value} movimientos`} labels={activityHours.map((hour) => String(hour).padStart(2, "0"))} values={activityValues} /></AdminPanel>
      <AdminPanel title="Turno y caja" subtitle={shift ? `Responsable: ${state.employees.find((employee) => employee.id === shift.employeeId)?.displayName ?? "—"}` : "Sin turno activo"}><div className="space-y-3 text-sm"><div className="flex justify-between"><span>Recaudación del turno</span><strong>{formatMoney(shiftRevenue)}</strong></div><div className="flex justify-between"><span>Efectivo esperado</span><strong>{formatMoney(cash?.expectedCashCents ?? 0)}</strong></div><div className="flex justify-between"><span>Última diferencia</span><strong>{latestCount ? formatMoney(latestCount.differenceCents) : "Sin arqueo"}</strong></div></div><Button asChild className="mt-5 w-full" variant="outline"><Link href="/admin/turnos-cajas">Ver turno y caja</Link></Button></AdminPanel>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><AdminPanel title="Actividad reciente" subtitle="Operaciones del estado compartido">{recent.length ? <div className="divide-y divide-border">{recent.map((movement) => <div className="flex items-center justify-between gap-3 py-3 text-sm" key={movement.id}><div><p className="font-semibold text-primary">{movementName(movement.kind)}</p><p className="text-xs text-muted-foreground">{formatDateTime(movement.occurredAt)}</p></div><span className="text-xs font-semibold text-secondary">{movement.amountCents ? formatMoney(movement.amountCents) : "Ticket"}</span></div>)}</div> : <p className="text-sm text-muted-foreground">Todavía no hay actividad.</p>}</AdminPanel><AdminPanel title="Accesos rápidos" subtitle="Consultas y acciones de administración"><div className="grid gap-2">{[["Ver mapa de ocupación", "/admin/ocupacion"], ["Auditoría visual", "/admin/ocupacion?modo=auditoria"], ["Resumen de caja", "/admin/turnos-cajas"], ["Configuración", "/admin/configuracion"]].map(([label, href]) => <Button asChild className="justify-start" key={href + label} variant="outline"><Link href={href}>{label} →</Link></Button>)}</div></AdminPanel></div>
  </div>;
}

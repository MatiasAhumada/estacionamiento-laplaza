"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_CURRENCY, DEMO_LOCALE } from "@/constants/demo.constant";
import { useDemoState } from "@/features/estacionamiento/demo/demo-provider";
import type { DemoActiveStaySummary } from "@/features/estacionamiento/domain/selectors";
import {
  selectActiveStaySummaries,
  selectDailyRevenue,
  selectOccupancy,
} from "@/features/estacionamiento/domain/selectors";
import type { DemoStayCategory } from "@/features/estacionamiento/domain/demo.types";

const currencyFormatter = new Intl.NumberFormat(DEMO_LOCALE, {
  currency: DEMO_CURRENCY,
  style: "currency",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat(DEMO_LOCALE, {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

const categoryEntries: [DemoStayCategory, string][] = [
  ["auto", "Autos"],
  ["camioneta", "Camionetas"],
  ["moto", "Motos"],
];

function formatCurrency(amountCents: number): string {
  return currencyFormatter.format(amountCents / 100);
}

function formatDuration(elapsedMinutes: number): string {
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
}

function formatPaymentCount(paymentCount: number): string {
  if (paymentCount === 1) {
    return "1 cobro registrado";
  }

  return `${paymentCount} cobros registrados`;
}

function StayStatus() {
  return (
    <span className="inline-flex min-h-7 items-center gap-2 rounded-full bg-secondary/10 px-2.5 text-xs font-semibold text-primary">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary" />
      Activa
    </span>
  );
}

function StayCard({ summary }: Readonly<{ summary: DemoActiveStaySummary }>) {
  const { stay, employeeName, elapsedMinutes } = summary;

  return (
    <Card className="gap-4 rounded-2xl p-4 shadow-none ring-border sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold tracking-wide text-primary">
            {stay.plateFragment}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ticket #{stay.ticketNumber}
          </p>
        </div>
        <StayStatus />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 border-t border-border pt-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Categoría</p>
          <p className="mt-1 font-medium capitalize">{stay.category}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Estadía</p>
          <p className="mt-1 font-medium tabular-nums">
            {formatDuration(elapsedMinutes)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Ingreso</p>
          <p className="mt-1 font-medium tabular-nums">
            {dateFormatter.format(new Date(stay.enteredAt))}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Empleado</p>
          <p className="mt-1 truncate font-medium">{employeeName}</p>
        </div>
      </div>
    </Card>
  );
}

function OccupancyCard({
  label,
  value,
  detail,
  emphasis = false,
}: Readonly<{
  label: string;
  value: string;
  detail: string;
  emphasis?: boolean;
}>) {
  return (
    <Card className="gap-3 rounded-2xl p-4 shadow-none ring-border sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={`font-display text-3xl font-bold tabular-nums tracking-tight ${emphasis ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </p>
      <p className="text-xs leading-5 text-muted-foreground">{detail}</p>
    </Card>
  );
}

function RevenueCard({
  label,
  amountCents,
}: Readonly<{ label: string; amountCents: number }>) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-0 first:pt-0 last:pb-0 sm:block sm:border-0 sm:py-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums text-foreground sm:mt-2">
        {formatCurrency(amountCents)}
      </p>
    </div>
  );
}

export function AdminDashboard() {
  const { state, isHydrated } = useDemoState();
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const occupancy = selectOccupancy(state);
  const activeStays = selectActiveStaySummaries(state, currentTime);
  const dailyRevenue = selectDailyRevenue(state, currentTime);
  const occupancyPercentage =
    occupancy.capacity > 0 ? Math.min(100, occupancy.percentage) : 0;
  const capacityExceeded =
    occupancy.capacity > 0 && occupancy.active > occupancy.capacity;
  const capacityUnavailable = occupancy.capacity === 0;

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setCurrentTime(new Date()),
      60_000,
    );

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="grid gap-7 sm:gap-9">
      <section className="grid gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">
              Centro de control
            </p>
            <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Estado de la playa
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Ocupación y estadías activas desde el estado compartido de la
              demo.
            </p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {isHydrated
              ? new Intl.DateTimeFormat(DEMO_LOCALE, {
                  dateStyle: "full",
                  timeZone: "America/Argentina/Buenos_Aires",
                }).format(currentTime)
              : ""}
          </p>
        </header>

        {!isHydrated ? (
          <Card
            aria-live="polite"
            className="rounded-2xl border-dashed shadow-none"
          >
            <CardContent className="p-5 text-sm text-muted-foreground">
              Cargando el estado de la playa…
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <OccupancyCard
                label="En la playa"
                value={occupancy.active.toString()}
                detail="Estadías activas"
                emphasis
              />
              <OccupancyCard
                label="Disponibles"
                value={
                  capacityUnavailable ? "—" : occupancy.available.toString()
                }
                detail={
                  capacityUnavailable
                    ? "Definí una capacidad ilustrativa"
                    : "Según capacidad de referencia"
                }
              />
              <OccupancyCard
                label="Ocupación"
                value={`${occupancy.percentage}%`}
                detail={
                  capacityUnavailable
                    ? "Sin capacidad de referencia"
                    : "Porcentaje sobre capacidad ilustrativa"
                }
              />
              <OccupancyCard
                label="Recaudación de hoy"
                value={formatCurrency(dailyRevenue.totalCents)}
                detail={formatPaymentCount(dailyRevenue.paymentCount)}
                emphasis
              />
            </div>

            <Card className="gap-4 rounded-2xl shadow-none ring-border">
              <CardHeader className="gap-1 px-5 pb-0 sm:px-6">
                <CardTitle className="font-display text-lg font-bold text-primary">
                  Ocupación por categoría
                </CardTitle>
                <CardDescription>
                  Conteo de estadías activas; no hay asignación de cocheras.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
                <div
                  aria-label={`${occupancyPercentage}% de la capacidad ilustrativa`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={occupancyPercentage}
                  className="h-2.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                >
                  <div
                    className="h-full rounded-full bg-secondary transition-[width]"
                    style={{ width: `${occupancyPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {capacityUnavailable
                    ? "Capacidad ilustrativa no configurada"
                    : `Capacidad ilustrativa: ${occupancy.capacity} vehículos`}
                </p>
                {capacityExceeded ? (
                  <p
                    className="rounded-xl border border-action/40 bg-action/15 px-3 py-2 text-sm text-foreground sm:col-span-2"
                    role="status"
                  >
                    Hay {occupancy.active - occupancy.capacity} estadías por
                    encima de la capacidad ilustrativa. La capacidad no limita
                    los ingresos.
                  </p>
                ) : null}
              </CardContent>
              <div className="grid grid-cols-3 border-t border-border px-5 py-4 sm:px-6">
                {categoryEntries.map(([category, label]) => (
                  <div
                    className="border-l border-border pl-3 first:border-0 first:pl-0 sm:pl-5"
                    key={category}
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 font-display text-xl font-bold tabular-nums text-primary">
                      {occupancy.byCategory[category]}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </section>

      <section aria-labelledby="active-stays-heading" className="grid gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2
              className="font-display text-xl font-bold text-primary"
              id="active-stays-heading"
            >
              Estadías activas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              La duración se actualiza cada minuto.
            </p>
          </div>
          {isHydrated ? (
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
              {activeStays.length} activas
            </span>
          ) : null}
        </div>

        {!isHydrated ? (
          <Card className="rounded-2xl border-dashed shadow-none">
            <CardContent className="p-5 text-sm text-muted-foreground">
              Cargando estadías…
            </CardContent>
          </Card>
        ) : activeStays.length === 0 ? (
          <Card className="rounded-2xl border-dashed shadow-none">
            <CardContent className="grid justify-items-center gap-2 px-5 py-10 text-center">
              <p className="font-semibold text-primary">La playa está vacía</p>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Cuando se registre un ingreso desde la terminal, la estadía
                aparecerá acá.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {activeStays.map((summary) => (
                <StayCard key={summary.stay.id} summary={summary} />
              ))}
            </div>
            <Card className="hidden overflow-hidden rounded-2xl shadow-none ring-border md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Patente</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Ingreso</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeStays.map(({ stay, employeeName, elapsedMinutes }) => (
                    <TableRow key={stay.id}>
                      <TableCell className="font-semibold tracking-wide text-primary">
                        {stay.plateFragment}
                      </TableCell>
                      <TableCell className="capitalize">
                        {stay.category}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {dateFormatter.format(new Date(stay.enteredAt))}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatDuration(elapsedMinutes)}
                      </TableCell>
                      <TableCell>{employeeName}</TableCell>
                      <TableCell>
                        <StayStatus />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </section>

      {isHydrated ? (
        <section aria-labelledby="daily-revenue-heading">
          <Card className="gap-5 rounded-2xl shadow-none ring-border">
            <CardHeader className="gap-1 px-5 pb-0 sm:px-6">
              <CardTitle
                className="font-display text-lg font-bold text-primary"
                id="daily-revenue-heading"
              >
                Recaudación del día
              </CardTitle>
              <CardDescription>
                Importes netos de cobros confirmados hoy. Datos simulados.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-0 px-5 sm:grid-cols-3 sm:gap-4 sm:px-6">
              <RevenueCard
                label="Efectivo"
                amountCents={dailyRevenue.netByMethod.efectivo}
              />
              <RevenueCard
                label="Débito"
                amountCents={dailyRevenue.netByMethod.debito}
              />
              <RevenueCard
                label="Transferencia"
                amountCents={dailyRevenue.netByMethod.transferencia}
              />
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}

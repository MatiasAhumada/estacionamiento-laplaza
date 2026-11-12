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
import type { DemoMovementKind } from "@/features/estacionamiento/domain/demo.types";
import type { DemoMovementFilters } from "@/features/estacionamiento/domain/reporting.types";
import { selectMovementRecords } from "@/features/estacionamiento/domain/reporting";
import { movementRangeSchema } from "@/features/estacionamiento/validation/movement-range.schema";

const currencyFormatter = new Intl.NumberFormat(DEMO_LOCALE, {
  currency: DEMO_CURRENCY,
  style: "currency",
});

const dateTimeFormatter = new Intl.DateTimeFormat(DEMO_LOCALE, {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

function formatCurrency(amountCents: number): string {
  return currencyFormatter.format(amountCents / 100);
}

function getMovementTitle(kind: DemoMovementKind): string {
  if (kind === "entry") {
    return "Ingreso de estadía";
  }

  if (kind === "payment") {
    return "Cobro y egreso";
  }

  if (kind === "cash-adjustment") {
    return "Ajuste de efectivo";
  }

  if (kind === "cash-count") {
    return "Arqueo de caja";
  }

  if (kind === "expense") {
    return "Gasto de caja";
  }

  if (kind === "audit") {
    return "Auditoría de ocupación";
  }

  return "Cierre de turno";
}

function MovementDetails({
  record,
}: Readonly<{
  record: ReturnType<typeof selectMovementRecords>[number];
}>) {
  if (record.payment) {
    return (
      <div className="grid gap-2">
        <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
          <span>Medio · {record.payment.method}</span>
          <span>Recibido · {formatCurrency(record.payment.receivedCents ?? record.payment.netCents)}</span>
          <span>Vuelto · {formatCurrency(record.payment.changeCents)} · Neto {formatCurrency(record.payment.netCents)}</span>
        </div>
        {record.invoiceRequest ? (
          <p className="w-fit rounded-full border border-action/50 bg-action/15 px-2.5 py-1 text-xs font-medium text-foreground">
            Solicitud de factura · Pendiente · Simulación
          </p>
        ) : null}
      </div>
    );
  }

  if (record.cashCount) {
    return (
      <p className="text-xs text-muted-foreground">
        Contado {formatCurrency(record.cashCount.countedCents)} · Esperado {formatCurrency(record.cashCount.expectedCents)} · Diferencia {formatCurrency(record.cashCount.differenceCents)}
      </p>
    );
  }

  if (record.cashAdjustment) {
    return (
      <p className="text-xs text-muted-foreground">
        {record.cashAdjustment.direction === "in" ? "Ingreso" : "Egreso"} de efectivo · {record.cashAdjustment.reason} · {formatCurrency(record.cashAdjustment.amountCents)}
      </p>
    );
  }

  if (record.audit) {
    return (
      <p className="text-xs text-muted-foreground">
        Auditoría #{record.audit.number} · {record.audit.vehicles.length} estadías activas · Capacidad ilustrativa {record.audit.capacity}
      </p>
    );
  }

  if (record.expense) {
    return (
      <p className="text-xs text-muted-foreground">
        {record.expense.category} · {record.expense.concept} · {record.expense.method} · {formatCurrency(record.expense.amountCents)}
      </p>
    );
  }

  if (record.stay) {
    return (
      <p className="text-xs text-muted-foreground">
        Ticket #{record.stay.ticketNumber} · {record.stay.category} · Fragmento {record.stay.plateFragment}
      </p>
    );
  }

  return <p className="text-xs text-muted-foreground">Operación registrada en el turno.</p>;
}

function MovementCard({
  record,
}: Readonly<{
  record: ReturnType<typeof selectMovementRecords>[number];
}>) {
  return (
    <Card className="gap-3 rounded-2xl p-4 shadow-none ring-border sm:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-primary">{getMovementTitle(record.movement.kind)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{dateTimeFormatter.format(new Date(record.movement.occurredAt))}</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">{record.employeeName}</span>
      </div>
      <MovementDetails record={record} />
      <p className="border-t border-border pt-3 text-xs text-muted-foreground">
        Turno {record.shift?.status === "closed" ? "cerrado" : "abierto"} · {record.movement.shiftId}
      </p>
    </Card>
  );
}

export function MovementHistory() {
  const { state, isHydrated } = useDemoState();
  const [filters, setFilters] = useState<DemoMovementFilters>({
    from: "",
    to: "",
    employeeId: "all",
    shiftId: "all",
    method: "all",
  });
  const rangeValidation = movementRangeSchema.safeParse({ from: filters.from, to: filters.to });
  let records: ReturnType<typeof selectMovementRecords> = [];

  if (rangeValidation.success) {
    records = selectMovementRecords(state, filters);
  }

  function updateFilter<Key extends keyof DemoMovementFilters>(
    key: Key,
    value: DemoMovementFilters[Key],
  ) {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
  }

  function updateMethodFilter(value: string) {
    if (value === "all" || value === "efectivo" || value === "debito" || value === "transferencia") {
      updateFilter("method", value);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <header>
        <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">Registro operativo</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">Movimientos y auditoría</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Ingresos, cobros, arqueos y cierres desde una misma fuente de datos simulados.
        </p>
      </header>

      <Card className="gap-5 rounded-2xl shadow-none ring-border">
        <CardHeader className="gap-1 px-5 pb-0 sm:px-6">
          <CardTitle className="font-display text-lg font-bold text-primary">Filtrar movimientos</CardTitle>
          <CardDescription>Las fechas se interpretan en el horario de Buenos Aires.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 sm:grid-cols-2 lg:grid-cols-5 sm:px-6">
          <div className="grid gap-2">
            <Label htmlFor="movement-from">Desde</Label>
            <Input id="movement-from" onChange={(event) => updateFilter("from", event.target.value)} type="date" value={filters.from} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="movement-to">Hasta</Label>
            <Input id="movement-to" onChange={(event) => updateFilter("to", event.target.value)} type="date" value={filters.to} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="movement-employee">Empleado</Label>
            <Select onValueChange={(value) => updateFilter("employeeId", value)} value={filters.employeeId}>
            <SelectTrigger aria-label="Filtrar por empleado" className="min-h-11 w-full" id="movement-employee"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {state.employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.displayName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="movement-shift">Turno</Label>
            <Select onValueChange={(value) => updateFilter("shiftId", value)} value={filters.shiftId}>
            <SelectTrigger aria-label="Filtrar por turno" className="min-h-11 w-full" id="movement-shift"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {state.shifts.map((shift) => <SelectItem key={shift.id} value={shift.id}>{dateTimeFormatter.format(new Date(shift.openedAt))} · {shift.status === "open" ? "Abierto" : "Cerrado"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="movement-method">Medio de pago</Label>
            <Select onValueChange={updateMethodFilter} value={filters.method}>
            <SelectTrigger aria-label="Filtrar por medio de pago" className="min-h-11 w-full" id="movement-method"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="debito">Débito</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isHydrated && !rangeValidation.success ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
          {rangeValidation.error.issues[0]?.message ?? "Revisá el rango de fechas."}
        </p>
      ) : null}

      {!isHydrated ? (
        <Card aria-live="polite" className="rounded-2xl border-dashed shadow-none">
              <CardContent className="p-5 text-sm text-muted-foreground">Cargando el historial…</CardContent>
        </Card>
      ) : records.length === 0 ? (
        <Card className="rounded-2xl border-dashed shadow-none">
          <CardContent className="p-5 text-sm text-muted-foreground">No hay movimientos que coincidan con estos filtros.</CardContent>
        </Card>
      ) : (
        <>
          <p aria-live="polite" className="text-sm text-muted-foreground">{records.length} {records.length === 1 ? "movimiento encontrado" : "movimientos encontrados"}</p>
          <div className="grid gap-3 sm:hidden">
            {records.map((record) => <MovementCard key={record.movement.id} record={record} />)}
          </div>
          <Card className="hidden gap-0 rounded-2xl shadow-none ring-border sm:flex">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y operación</TableHead>
                    <TableHead>Estadía y pago</TableHead>
                    <TableHead>Empleado / turno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.movement.id}>
                      <TableCell className="min-w-44">
                        <p className="font-semibold text-primary">{getMovementTitle(record.movement.kind)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{dateTimeFormatter.format(new Date(record.movement.occurredAt))}</p>
                      </TableCell>
                      <TableCell className="min-w-72"><MovementDetails record={record} /></TableCell>
                      <TableCell className="min-w-48">
                        <p>{record.employeeName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Turno {record.shift?.status === "closed" ? "cerrado" : "abierto"} · {record.movement.shiftId}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Wallet01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_CURRENCY, DEMO_LOCALE } from "@/constants/demo.constant";
import { useDemoState } from "@/features/estacionamiento/demo/demo-provider";
import {
  selectActiveShift,
  selectCashSummary,
  selectEmployee,
} from "@/features/estacionamiento/domain/selectors";
import type {
  DemoCashCount,
  DemoCashDirection,
} from "@/features/estacionamiento/domain/demo.types";
import {
  cashAdjustmentSchema,
  cashCountSchema,
} from "@/features/estacionamiento/validation/cash.schema";

function formatCurrency(amountCents: number): string {
  return new Intl.NumberFormat(DEMO_LOCALE, {
    style: "currency",
    currency: DEMO_CURRENCY,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(DEMO_LOCALE, {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value));
}

export function CashReceipt({
  cashCount,
  employeeName,
  shiftLabel,
  onPrint,
}: Readonly<{
  cashCount: DemoCashCount;
  employeeName: string;
  shiftLabel: string;
  onPrint: () => void;
}>) {
  return (
    <Card className="print-receipt border-primary/15 shadow-sm">
      <CardHeader>
        <p className="text-xs font-bold tracking-[0.14em] text-secondary uppercase">
          Rendición de caja · Demo
        </p>
        <CardTitle className="font-display text-2xl text-primary">
          Turno rendido
        </CardTitle>
        <CardDescription>
          {employeeName} · {shiftLabel} · {formatDateTime(cashCount.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <p className="flex justify-between gap-3">
          <span>Efectivo declarado</span>
          <strong>{formatCurrency(cashCount.countedCents)}</strong>
        </p>
        <p className="flex justify-between gap-3">
          <span>Efectivo esperado</span>
          <strong>{formatCurrency(cashCount.expectedCents)}</strong>
        </p>
        <p className="flex justify-between gap-3 border-t border-border pt-3">
          <span>Diferencia (declarado − esperado)</span>
          <strong>{formatCurrency(cashCount.differenceCents)}</strong>
        </p>
        <div className="grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
          <p>
            Fondo inicial{" "}
            <strong className="block">
              {formatCurrency(cashCount.openingCashCents ?? 0)}
            </strong>
          </p>
          <p>
            Cobros en efectivo (netos de vuelto){" "}
            <strong className="block">
              {formatCurrency(cashCount.netByMethod?.efectivo ?? 0)}
            </strong>
          </p>
          <p>
            Cobros con débito{" "}
            <strong className="block">
              {formatCurrency(cashCount.netByMethod?.debito ?? 0)}
            </strong>
          </p>
          <p>
            Cobros por transferencia{" "}
            <strong className="block">
              {formatCurrency(cashCount.netByMethod?.transferencia ?? 0)}
            </strong>
          </p>
          <p>
            Ajustes de ingreso{" "}
            <strong className="block">
              {formatCurrency(cashCount.adjustmentInCents ?? 0)}
            </strong>
          </p>
          <p>
            Ajustes de egreso{" "}
            <strong className="block">
              {formatCurrency(cashCount.adjustmentOutCents ?? 0)}
            </strong>
          </p>
          <p>
            Gastos pagados en efectivo{" "}
            <strong className="block">
              {formatCurrency(cashCount.cashExpensesCents ?? 0)}
            </strong>
          </p>
        </div>
        <p className="border-t border-border pt-3 text-xs text-muted-foreground">
          Comprobante operativo de demostración. Conservado en esta sesión del
          navegador.
        </p>
        <Button
          className="no-print min-h-11 w-full sm:w-fit"
          onClick={onPrint}
          variant="outline"
        >
          Imprimir rendición
        </Button>
      </CardContent>
    </Card>
  );
}

export function CashRegister() {
  const { state, isHydrated, runDemoOperation } = useDemoState();
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [countedAmount, setCountedAmount] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [direction, setDirection] = useState<DemoCashDirection>("in");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const activeShift = selectActiveShift(state);
  const activeEmployee = activeShift
    ? selectEmployee(state, activeShift.employeeId)
    : undefined;
  const summary = activeShift
    ? selectCashSummary(state, activeShift.id)
    : undefined;
  const latestClosedShift = state.shifts
    .toReversed()
    .find((shift) => shift.status === "closed");
  const latestClosedCount = latestClosedShift
    ? state.cashCounts.find(
        (cashCount) => cashCount.id === latestClosedShift.closedCashCountId,
      )
    : undefined;
  const latestClosedEmployee = latestClosedShift
    ? selectEmployee(state, latestClosedShift.employeeId)
    : undefined;
  const activeAdjustments = activeShift
    ? state.cashAdjustments
        .filter((adjustment) => adjustment.shiftId === activeShift.id)
        .toReversed()
    : [];

  function handleClose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLock.current || !activeShift) {
      return;
    }

    setErrorMessage("");
    const parsedCash = cashCountSchema.safeParse({ countedAmount });

    if (!parsedCash.success) {
      setErrorMessage(
        parsedCash.error.issues[0]?.message ?? "Revisá el efectivo contado.",
      );
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);
    const result = runDemoOperation({
      type: "close-shift",
      countedCents: parsedCash.data.countedAmount,
    });

    if (!result.success) {
      setErrorMessage(result.message);
      submitLock.current = false;
      setIsSubmitting(false);
      return;
    }

    setCountedAmount("");
    setIsCloseOpen(false);
    setIsSubmitting(false);
    submitLock.current = false;
  }

  function handleAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    const parsedAdjustment = cashAdjustmentSchema.safeParse({
      amount: adjustmentAmount,
      reason: adjustmentReason,
      direction,
    });

    if (!parsedAdjustment.success) {
      setErrorMessage(
        parsedAdjustment.error.issues[0]?.message ??
          "Revisá los datos del ajuste.",
      );
      return;
    }

    const result = runDemoOperation({
      type: "record-cash-adjustment",
      amountCents: parsedAdjustment.data.amount,
      reason: parsedAdjustment.data.reason,
      direction: parsedAdjustment.data.direction,
    });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setAdjustmentAmount("");
    setAdjustmentReason("");
    setIsAdjustmentOpen(false);
  }

  return (
    <>
      <Card className="no-print overflow-hidden border-primary/10 shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-[0.14em] text-secondary uppercase">
              Terminal · Caja operativa
            </p>
            <CardTitle className="font-display text-2xl font-bold text-primary">
              Turnos y rendición
            </CardTitle>
            <CardDescription>
              {activeShift && activeEmployee
                ? `Turno abierto · ${activeEmployee.displayName} · Desde ${formatDateTime(activeShift.openedAt)}`
                : "No hay un turno abierto."}{" "}
              Datos de demostración.
            </CardDescription>
          </div>
          {activeShift ? (
            <div className="grid gap-2 sm:flex">
              <Button
                className="min-h-11 w-full gap-2 sm:w-auto"
                onClick={() => {
                  setErrorMessage("");
                  setIsCloseOpen(true);
                }}
                variant="action"
              >
                <HugeiconsIcon icon={Wallet01Icon} size={18} strokeWidth={2} />{" "}
                Cerrar turno
              </Button>
              <Button
                className="min-h-11 w-full sm:w-auto"
                onClick={() => {
                  setErrorMessage("");
                  setIsAdjustmentOpen(true);
                }}
                variant="outline"
              >
                Registrar ajuste
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          {!isHydrated ? (
            <p
              aria-live="polite"
              className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground"
            >
              Cargando el estado de caja…
            </p>
          ) : null}
          {activeShift && !summary ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive"
            >
              No se pudo cargar la información del turno. El cierre no está
              disponible.
            </p>
          ) : null}
          {activeShift ? (
            <div className="grid gap-3 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2">
              <p className="text-sm">
                <span className="block text-xs text-muted-foreground">
                  Empleado
                </span>
                <strong>
                  {activeEmployee?.displayName ?? "No disponible"}
                </strong>
              </p>
              <p className="text-sm">
                <span className="block text-xs text-muted-foreground">
                  Estado
                </span>
                <strong>Abierto · sin resumen de recaudación</strong>
              </p>
            </div>
          ) : null}
          {!activeShift && isHydrated && latestClosedCount ? (
            <CashReceipt
              cashCount={latestClosedCount}
              employeeName={latestClosedEmployee?.displayName ?? "Empleado"}
              shiftLabel={latestClosedShift?.label ?? "Turno"}
              onPrint={() => window.print()}
            />
          ) : null}
          {!activeShift && isHydrated && !latestClosedCount ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Todavía no hay rendiciones registradas.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {activeShift ? (
        <section
          aria-label="Ajustes de efectivo del turno"
          className="no-print mt-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
        >
          <h3 className="font-semibold text-primary">
            Movimientos de efectivo
          </h3>
          {activeAdjustments.length > 0 ? (
            <ul className="mt-3 divide-y divide-border">
              {activeAdjustments.map((adjustment) => (
                <li
                  className="flex flex-wrap justify-between gap-2 py-3 text-sm"
                  key={adjustment.id}
                >
                  <span>
                    {adjustment.direction === "in" ? "Ingreso" : "Egreso"}:{" "}
                    {adjustment.reason} ·{" "}
                    {formatDateTime(adjustment.occurredAt)}
                  </span>
                  <strong>
                    {adjustment.direction === "in" ? "+" : "−"}
                    {formatCurrency(adjustment.amountCents)}
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No hay ajustes en este turno.
            </p>
          )}
        </section>
      ) : null}

      <Dialog onOpenChange={setIsCloseOpen} open={isCloseOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-primary">
              Cerrar turno
            </DialogTitle>
            <DialogDescription>
              Contá físicamente el efectivo. El total esperado y la diferencia
              se muestran después de confirmar.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-5" onSubmit={handleClose}>
            <div className="grid gap-2">
              <Label htmlFor="counted-amount">Efectivo contado</Label>
              <Input
                autoComplete="off"
                id="counted-amount"
                inputMode="decimal"
                onChange={(event) => setCountedAmount(event.target.value)}
                placeholder="0,00"
                value={countedAmount}
              />
            </div>
            {errorMessage ? (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <DialogFooter className="flex-col-reverse sm:flex-row">
              <Button
                className="min-h-11"
                disabled={isSubmitting}
                onClick={() => {
                  setCountedAmount("");
                  setErrorMessage("");
                  setIsCloseOpen(false);
                }}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                className="min-h-11"
                disabled={isSubmitting}
                type="submit"
                variant="action"
              >
                {isSubmitting ? "Cerrando…" : "Confirmar cierre"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setIsAdjustmentOpen} open={isAdjustmentOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary">
              Registrar ajuste de efectivo
            </DialogTitle>
            <DialogDescription>
              Los ajustes registrados se incluyen una sola vez en la rendición.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleAdjustment}>
            <div className="grid grid-cols-2 gap-2" aria-label="Tipo de ajuste">
              <Button
                aria-pressed={direction === "in"}
                className="min-h-11"
                onClick={() => setDirection("in")}
                type="button"
                variant={direction === "in" ? "brand" : "outline"}
              >
                Ingreso
              </Button>
              <Button
                aria-pressed={direction === "out"}
                className="min-h-11"
                onClick={() => setDirection("out")}
                type="button"
                variant={direction === "out" ? "brand" : "outline"}
              >
                Egreso
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adjustment-amount">Importe</Label>
              <Input
                autoComplete="off"
                id="adjustment-amount"
                inputMode="decimal"
                onChange={(event) => setAdjustmentAmount(event.target.value)}
                placeholder="0,00"
                value={adjustmentAmount}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adjustment-reason">Motivo</Label>
              <Input
                id="adjustment-reason"
                onChange={(event) => setAdjustmentReason(event.target.value)}
                placeholder="Ej.: reposición de cambio"
                value={adjustmentReason}
              />
            </div>
            {errorMessage ? (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <DialogFooter className="flex-col-reverse sm:flex-row">
              <Button
                className="min-h-11"
                onClick={() => setIsAdjustmentOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button className="min-h-11" type="submit" variant="action">
                Guardar ajuste
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

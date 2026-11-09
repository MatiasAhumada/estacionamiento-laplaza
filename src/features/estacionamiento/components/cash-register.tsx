"use client";

import { useState } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_CURRENCY, DEMO_LOCALE } from "@/constants/demo.constant";
import { useDemoState } from "@/features/estacionamiento/demo/demo-provider";
import { selectActiveShift, selectCashSummary, selectEmployee } from "@/features/estacionamiento/domain/selectors";
import type { DemoCashDirection } from "@/features/estacionamiento/domain/demo.types";
import { cashAdjustmentSchema, cashCountSchema } from "@/features/estacionamiento/validation/cash.schema";

function formatCurrency(amountCents: number): string {
  return new Intl.NumberFormat(DEMO_LOCALE, {
    style: "currency",
    currency: DEMO_CURRENCY,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(DEMO_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CashMetric({ label, amountCents }: Readonly<{ label: string; amountCents: number }>) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold tabular-nums">{formatCurrency(amountCents)}</span>
    </div>
  );
}

export function CashRegister() {
  const { state, isHydrated, runDemoOperation } = useDemoState();
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState<DemoCashDirection>("in");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [countedAmount, setCountedAmount] = useState("");
  const [adjustmentError, setAdjustmentError] = useState("");
  const [countError, setCountError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);

  const activeShift = selectActiveShift(state);
  const activeEmployee = activeShift ? selectEmployee(state, activeShift.employeeId) : undefined;
  const summary = activeShift ? selectCashSummary(state, activeShift.id) : undefined;
  const recentCashCount = activeShift
    ? state.cashCounts.filter((cashCount) => cashCount.shiftId === activeShift.id).at(-1)
    : undefined;
  const latestAdjustment = activeShift
    ? state.cashAdjustments.filter((adjustment) => adjustment.shiftId === activeShift.id).at(-1)
    : undefined;
  const isCountCurrent = Boolean(
    recentCashCount &&
      summary &&
      recentCashCount.expectedCents === summary.expectedCashCents &&
      (!latestAdjustment || new Date(recentCashCount.createdAt).getTime() >= new Date(latestAdjustment.occurredAt).getTime()),
  );

  function handleAdjustmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdjustmentError("");
    setOperationError("");
    const parsedAdjustment = cashAdjustmentSchema.safeParse({
      amount: adjustmentAmount,
      reason: adjustmentReason,
      direction,
    });

    if (!parsedAdjustment.success) {
      setAdjustmentError(parsedAdjustment.error.issues[0]?.message ?? "Revisá los datos del ajuste.");
      return;
    }

    const result = runDemoOperation({
      type: "record-cash-adjustment",
      amountCents: parsedAdjustment.data.amount,
      reason: parsedAdjustment.data.reason,
      direction: parsedAdjustment.data.direction,
    });

    if (!result.success) {
      setOperationError(result.message);
      return;
    }

    setAdjustmentAmount("");
    setAdjustmentReason("");
  }

  function handleCashCountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCountError("");
    setOperationError("");
    const parsedCount = cashCountSchema.safeParse({ countedAmount });

    if (!parsedCount.success) {
      setCountError(parsedCount.error.issues[0]?.message ?? "Revisá el efectivo contado.");
      return;
    }

    const result = runDemoOperation({ type: "count-cash", countedCents: parsedCount.data.countedAmount });

    if (!result.success) {
      setOperationError(result.message);
      return;
    }

    setIsConfirmingClose(false);
  }

  function handleCloseShift() {
    setOperationError("");
    const result = runDemoOperation({ type: "close-shift" });

    if (!result.success) {
      setOperationError(result.message);
      setIsConfirmingClose(false);
      return;
    }

    setIsConfirmingClose(false);
  }

  function handleDialogChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      setIsConfirmingClose(false);
    }
  }

  const displayedDifference = recentCashCount && summary
    ? recentCashCount.countedCents - summary.expectedCashCents
    : undefined;

  return (
    <>
      <Card className="overflow-hidden border-primary/10 shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-[0.14em] text-secondary uppercase">Administración · Caja</p>
            <CardTitle className="font-display text-2xl font-bold text-primary">Turnos y arqueos</CardTitle>
            <CardDescription>Controlá efectivo y cierre del turno actual. Datos de demostración.</CardDescription>
          </div>
          <Button className="min-h-11 w-full gap-2 sm:w-auto" onClick={() => handleDialogChange(true)} variant="action">
            <HugeiconsIcon icon={Wallet01Icon} size={18} strokeWidth={2} />
            Abrir caja
          </Button>
        </CardHeader>
        <CardContent>
          {isHydrated && activeShift && activeEmployee && summary ? (
            <div className="grid gap-4 rounded-2xl border border-border bg-background p-4 sm:grid-cols-3 sm:p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Turno abierto</p>
                <p className="mt-1 font-semibold text-primary">{activeEmployee.displayName}</p>
                <p className="mt-1 text-xs text-muted-foreground">Desde {formatDateTime(activeShift.openedAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Cobros del turno</p>
                <p className="mt-1 font-display text-2xl font-bold text-primary">{summary.paymentCount}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Efectivo esperado</p>
                <p className="mt-1 font-display text-2xl font-bold text-primary">{formatCurrency(summary.expectedCashCents)}</p>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              {isHydrated ? "No hay un turno abierto. La caja se habilitará al iniciar otro turno." : "Cargando el estado de la caja…"}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={handleDialogChange} open={isOpen}>
        <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border bg-primary px-5 py-5 text-primary-foreground sm:px-7">
            <p className="text-xs font-semibold tracking-[0.14em] text-sky-100 uppercase">Caja de la jornada</p>
            <DialogTitle className="font-display text-2xl font-bold">Arqueo y cierre</DialogTitle>
            <DialogDescription className="text-sky-100">
              Revisá los movimientos y contá el efectivo antes de finalizar el turno.
            </DialogDescription>
          </DialogHeader>

          {!isHydrated ? (
            <div aria-live="polite" className="p-6 text-sm text-muted-foreground">Cargando caja…</div>
          ) : activeShift && activeEmployee && summary ? (
            <div className="grid gap-5 p-5 sm:p-7">
              <section aria-label="Resumen del turno" className="rounded-2xl bg-muted/60 px-4 py-1 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border py-3">
                  <div>
                    <p className="font-semibold text-primary">{activeEmployee.displayName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Apertura · {formatDateTime(activeShift.openedAt)}</p>
                  </div>
                  <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-primary">Turno abierto</span>
                </div>
                <CashMetric amountCents={summary.openingCashCents} label="Fondo inicial" />
                <CashMetric amountCents={summary.netByMethod.efectivo} label="Neto en efectivo" />
                <CashMetric amountCents={summary.netByMethod.debito} label="Neto en débito · no suma al cajón" />
                <CashMetric amountCents={summary.netByMethod.transferencia} label="Neto en transferencia · no suma al cajón" />
                <CashMetric amountCents={summary.adjustmentInCents} label="Ajustes de ingreso" />
                <CashMetric amountCents={summary.adjustmentOutCents} label="Ajustes de egreso · descontados" />
                <div className="flex items-center justify-between gap-3 border-t-2 border-primary/15 py-4">
                  <span className="text-sm font-bold text-primary">Efectivo esperado</span>
                  <span className="font-display text-xl font-bold tabular-nums text-primary">{formatCurrency(summary.expectedCashCents)}</span>
                </div>
                <p className="pb-3 text-xs text-muted-foreground">{summary.paymentCount} {summary.paymentCount === 1 ? "cobro" : "cobros"} registrados</p>
              </section>

              <section aria-label="Ajustes registrados en el turno" className="rounded-2xl border border-border p-4 sm:p-5">
                <div>
                  <h3 className="font-semibold text-primary">Movimientos de efectivo</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Cada ajuste conserva su empleado, motivo e importe.</p>
                </div>
                {activeShift && state.cashAdjustments.some((adjustment) => adjustment.shiftId === activeShift.id) ? (
                  <ul className="mt-3 divide-y divide-border">
                    {state.cashAdjustments.filter((adjustment) => adjustment.shiftId === activeShift.id).slice().reverse().map((adjustment) => (
                      <li className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0 last:pb-0" key={adjustment.id}>
                        <div>
                          <p className="text-sm font-medium">{adjustment.direction === "in" ? "Ingreso de efectivo" : "Egreso de efectivo"}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{adjustment.reason} · {activeEmployee.displayName} · {formatDateTime(adjustment.occurredAt)}</p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">{adjustment.direction === "in" ? "+" : "−"}{formatCurrency(adjustment.amountCents)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No hay ajustes en este turno.</p>
                )}
              </section>

              <form className="grid gap-3 rounded-2xl border border-border p-4 sm:p-5" onSubmit={handleAdjustmentSubmit}>
                <div>
                  <h3 className="font-semibold text-primary">Ajuste de efectivo</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Registrá ingresos o retiros del cajón con su motivo.</p>
                </div>
                <div className="grid grid-cols-2 gap-2" aria-label="Tipo de ajuste">
                  <Button aria-pressed={direction === "in"} className="min-h-11" onClick={() => setDirection("in")} type="button" variant={direction === "in" ? "brand" : "outline"}>Ingreso</Button>
                  <Button aria-pressed={direction === "out"} className="min-h-11" onClick={() => setDirection("out")} type="button" variant={direction === "out" ? "brand" : "outline"}>Egreso</Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                  <div className="grid gap-2">
                    <Label htmlFor="adjustment-amount">Importe</Label>
                    <Input autoComplete="off" id="adjustment-amount" inputMode="decimal" onChange={(event) => setAdjustmentAmount(event.target.value)} placeholder="0,00" value={adjustmentAmount} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adjustment-reason">Motivo</Label>
                    <Input id="adjustment-reason" onChange={(event) => setAdjustmentReason(event.target.value)} placeholder="Ej.: reposición de cambio" value={adjustmentReason} />
                  </div>
                </div>
                {adjustmentError ? <p className="text-sm text-destructive" role="alert">{adjustmentError}</p> : null}
                <Button className="min-h-11 w-full sm:w-fit" type="submit" variant="outline">Registrar ajuste</Button>
              </form>

              <form className="grid gap-3 rounded-2xl border border-border p-4 sm:p-5" onSubmit={handleCashCountSubmit}>
                <div>
                  <h3 className="font-semibold text-primary">Conteo físico</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">El arqueo compara el efectivo contado con el esperado del turno.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="counted-amount">Efectivo contado</Label>
                  <Input autoComplete="off" id="counted-amount" inputMode="decimal" onChange={(event) => setCountedAmount(event.target.value)} placeholder="0,00" value={countedAmount} />
                </div>
                {countError ? <p className="text-sm text-destructive" role="alert">{countError}</p> : null}
                <Button className="min-h-11 w-full sm:w-fit" type="submit" variant="brand">Registrar arqueo</Button>
                {recentCashCount ? (
                  <div aria-live="polite" className="rounded-xl border border-secondary/25 bg-secondary/10 p-3 text-sm">
                    <p className="font-semibold text-primary">Último conteo: {formatCurrency(recentCashCount.countedCents)}</p>
                    <p className="mt-1 text-muted-foreground">
                      {isCountCurrent ? `Diferencia ${formatCurrency(displayedDifference ?? 0)}` : "El conteo quedó desactualizado; registrá uno nuevo."}
                    </p>
                  </div>
                ) : null}
              </form>

              {operationError ? <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{operationError}</p> : null}
              <DialogFooter className="flex-col-reverse border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Button className="min-h-11" onClick={() => setIsOpen(false)} type="button" variant="outline">Volver</Button>
                <Button className="min-h-11" disabled={!isCountCurrent} onClick={() => setIsConfirmingClose(true)} type="button" variant="action">Cerrar turno</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="grid gap-4 p-5 sm:p-7">
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                No hay un turno abierto. El historial conserva los arqueos y cierres anteriores.
              </div>
              {state.cashCounts.length > 0 ? (
                <section aria-label="Arqueos anteriores" className="grid gap-3">
                  <h3 className="font-semibold text-primary">Arqueo registrado</h3>
                  {state.cashCounts.slice().reverse().map((cashCount) => {
                    const employee = selectEmployee(state, cashCount.employeeId);
                    const shift = state.shifts.find((candidate) => candidate.id === cashCount.shiftId);

                    return (
                      <div className="rounded-xl border border-border p-4" key={cashCount.id}>
                        <div className="flex flex-wrap justify-between gap-2">
                          <p className="font-semibold">{employee?.displayName ?? "Empleado"}</p>
                          <span className="text-sm font-semibold tabular-nums">{formatCurrency(cashCount.differenceCents)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Contado {formatCurrency(cashCount.countedCents)} · Esperado {formatCurrency(cashCount.expectedCents)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{shift?.status === "closed" ? "Turno cerrado" : "Conteo"} · {formatDateTime(cashCount.createdAt)}</p>
                      </div>
                    );
                  })}
                </section>
              ) : null}
              <DialogFooter>
                <Button className="min-h-11 w-full sm:w-fit" onClick={() => setIsOpen(false)} variant="outline">Cerrar</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setIsConfirmingClose} open={isConfirmingClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-primary">¿Cerrar este turno?</DialogTitle>
            <DialogDescription>
              La terminal dejará de aceptar ingresos y cobros hasta que se abra otro turno. El arqueo quedará registrado con el empleado actual.
            </DialogDescription>
          </DialogHeader>
          {recentCashCount && summary ? (
            <div className="rounded-xl bg-muted p-4 text-sm">
              <p>Efectivo esperado <strong className="float-right">{formatCurrency(summary.expectedCashCents)}</strong></p>
              <p className="mt-2">Efectivo contado <strong className="float-right">{formatCurrency(recentCashCount.countedCents)}</strong></p>
              <p className="mt-2 border-t border-border pt-2">Diferencia <strong className="float-right">{formatCurrency(recentCashCount.differenceCents)}</strong></p>
            </div>
          ) : null}
          <DialogFooter>
            <Button className="min-h-11" onClick={() => setIsConfirmingClose(false)} variant="outline">Cancelar</Button>
            <Button className="min-h-11" onClick={handleCloseShift} variant="action">Confirmar cierre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

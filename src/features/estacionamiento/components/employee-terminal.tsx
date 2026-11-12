"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EntryTicket } from "@/features/estacionamiento/components/entry-ticket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEMO_CURRENCY, DEMO_LOCALE } from "@/constants/demo.constant";
import { DEMO_STAY_CATEGORIES } from "@/features/estacionamiento/domain/demo.types";
import type {
  DemoEmployee,
  DemoMovement,
  DemoPaymentMethod,
  DemoStay,
  DemoStayCategory,
  DemoTariff,
} from "@/features/estacionamiento/domain/demo.types";
import {
  calculateStayPrice,
  findTariff,
} from "@/features/estacionamiento/domain/tariff";
import type { DemoStayPrice } from "@/features/estacionamiento/domain/tariff";
import {
  type DemoCashSummary,
  selectActiveShift,
  selectCashSummary,
  selectEmployee,
  selectMatchingActiveStays,
  selectOccupancy,
} from "@/features/estacionamiento/domain/selectors";
import { useDemoState } from "@/features/estacionamiento/demo/demo-provider";
import { entrySchema } from "@/features/estacionamiento/validation/entry.schema";
import { receivedCashSchema } from "@/features/estacionamiento/validation/payment.schema";
import { staySearchSchema } from "@/features/estacionamiento/validation/stay-search.schema";

const CATEGORY_DETAILS: Record<DemoStayCategory, { label: string; shortcut: string }> = {
  auto: { label: "Auto", shortcut: "F1" },
  camioneta: { label: "Camioneta", shortcut: "F2" },
  moto: { label: "Moto", shortcut: "F3" },
};

const PAYMENT_METHODS: { label: string; value: DemoPaymentMethod }[] = [
  { label: "Efectivo", value: "efectivo" },
  { label: "Débito", value: "debito" },
  { label: "Transferencia", value: "transferencia" },
];

type TerminalDialog = "entry" | "payment" | "ticket" | undefined;

function getConnectionLabel(scenario: "online" | "offline" | "syncing"): string {
  if (scenario === "online") {
    return "Conectado · demo";
  }

  if (scenario === "syncing") {
    return "Sincronización simulada";
  }

  return "Sin conexión simulada";
}

function getConnectionIndicatorClass(scenario: "online" | "offline" | "syncing"): string {
  if (scenario === "online") {
    return "bg-secondary";
  }

  if (scenario === "syncing") {
    return "bg-warning";
  }

  return "bg-destructive";
}

function getMovementAmountLabel(amountCents: number | undefined): string {
  if (amountCents || amountCents === 0) {
    return formatCurrency(amountCents);
  }

  return "—";
}

function getMovementDetail(
  movement: { stayId?: string; occurredAt: string },
  stateStays: DemoStay[],
): string {
  if (!movement.stayId) {
    return formatTime(movement.occurredAt);
  }

  const stay = stateStays.find((candidate) => candidate.id === movement.stayId);

  if (!stay) {
    return formatTime(movement.occurredAt);
  }

  return `${formatTime(movement.occurredAt)} · Ticket #${stay.ticketNumber}`;
}

function getSelectionVariant(selected: boolean): "brand" | "outline" {
  if (selected) {
    return "brand";
  }

  return "outline";
}

function formatCurrency(amountCents: number): string {
  const parts = new Intl.NumberFormat(DEMO_LOCALE, {
    style: "currency",
    currency: DEMO_CURRENCY,
    maximumFractionDigits: 0,
  }).formatToParts(amountCents / 100);

  return parts
    .map((part) => part.value.replace(/[\u00a0\u202f]/g, " "))
    .join("");
}

function formatClock(date: Date): string {
  const parts = new Intl.DateTimeFormat(DEMO_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Argentina/Buenos_Aires",
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
}

function formatTime(date: string): string {
  return formatClock(new Date(date));
}

function formatStayDateTime(date: string): string {
  return new Intl.DateTimeFormat(DEMO_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(date));
}

function formatLiveClock(timestamp: number): string {
  if (timestamp < 1) {
    return "—";
  }

  return formatClock(new Date(timestamp));
}

function formatElapsed(enteredAt: string, now: number): string {
  const elapsedMinutes = Math.max(0, Math.floor((now - Date.parse(enteredAt)) / 60_000));
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  if (hours < 1) {
    return `${minutes} min`;
  }

  return `${hours} h ${String(minutes).padStart(2, "0")} min`;
}

function getMovementLabel(kind: DemoMovement["kind"]): string {
  if (kind === "entry") {
    return "Ingreso registrado";
  }

  if (kind === "payment") {
    return "Cobro y egreso";
  }

  if (kind === "cash-adjustment") {
    return "Ajuste de caja";
  }

  if (kind === "cash-count") {
    return "Arqueo de caja";
  }

  if (kind === "expense") {
    return "Gasto registrado";
  }

  if (kind === "audit") {
    return "Auditoría de playa";
  }

  return "Cierre de turno";
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || target.matches("input, textarea, select, [contenteditable='true']");
}

export function EmployeeTerminal() {
  const { state, registerStayEntry, confirmStayPayment, runDemoOperation, storageStatus } = useDemoState();
  const terminalActionsRef = useRef<HTMLElement>(null);
  const entrySubmittingRef = useRef(false);
  const paymentSubmittingRef = useRef(false);
  const [dialog, setDialog] = useState<TerminalDialog>();
  const [ticketStayId, setTicketStayId] = useState("");
  const [entryCategory, setEntryCategory] = useState<DemoStayCategory>("auto");
  const [plateFragment, setPlateFragment] = useState("");
  const [entryError, setEntryError] = useState("");
  const [isEntrySubmitting, setIsEntrySubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStayId, setSelectedStayId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<DemoPaymentMethod>("efectivo");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [requestInvoice, setRequestInvoice] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [now, setNow] = useState(0);
  const [newShiftEmployeeId, setNewShiftEmployeeId] = useState(state.employees.find((item) => item.active)?.id ?? "");
  const [newShiftLabel, setNewShiftLabel] = useState(state.settings.shiftLabels[0] ?? "");
  const [openingCash, setOpeningCash] = useState("0");
  const [shiftError, setShiftError] = useState("");
  const selectedShiftLabel = state.settings.shiftLabels.includes(newShiftLabel) ? newShiftLabel : state.settings.shiftLabels[0] ?? "";

  const activeShift = selectActiveShift(state);
  let employee: DemoEmployee | undefined;

  if (activeShift) {
    employee = selectEmployee(state, activeShift.employeeId);
  }

  const occupancy = selectOccupancy(state);
  let cashSummary: DemoCashSummary | undefined;

  if (activeShift) {
    cashSummary = selectCashSummary(state, activeShift.id);
  }

  const activeStays = selectMatchingActiveStays(state, searchQuery);
  const parsedSearchQuery = staySearchSchema.safeParse(searchQuery);
  const parsedReceivedCash = receivedCashSchema.safeParse(receivedAmount);
  const ticketStay = state.stays.find((stay) => stay.id === ticketStayId);
  const selectedStay = activeStays.find((stay) => stay.id === selectedStayId);
  let selectedTariff: DemoTariff | undefined;
  let selectedPrice: DemoStayPrice | null | undefined;

  if (selectedStay) {
    selectedTariff = findTariff(state.tariffs, selectedStay.category);
  }

  if (selectedStay && selectedTariff) {
    selectedPrice = calculateStayPrice(selectedStay.enteredAt, new Date(now).toISOString(), selectedTariff);
  }

  const receivedCashIsSufficient = parsedReceivedCash.success && Boolean(selectedPrice) && parsedReceivedCash.data >= (selectedPrice?.totalCents ?? 0);

  const isShiftOpen = Boolean(activeShift);

  const openEntry = useCallback((category: DemoStayCategory): void => {
    if (!isShiftOpen) {
      return;
    }

    setEntryCategory(category);
    setDialog("entry");
  }, [isShiftOpen]);

  const openPayment = useCallback((): void => {
    if (!isShiftOpen) {
      return;
    }

    setDialog("payment");
  }, [isShiftOpen]);

  useEffect(() => {
    const initialTime = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);

    return () => {
      window.clearTimeout(initialTime);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent): void {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) {
        return;
      }

      if (isEditableTarget(event.target) || document.querySelector("[role='dialog']")) {
        return;
      }

      const categoriesByShortcut: Record<string, DemoStayCategory> = {
        F1: "auto",
        F2: "camioneta",
        F3: "moto",
      };
      const category = categoriesByShortcut[event.key];

      if (category) {
        event.preventDefault();
        openEntry(category);
      }

      if (event.key === "F4") {
        event.preventDefault();
        openPayment();
      }
    }

    window.addEventListener("keydown", handleShortcut);

    return () => window.removeEventListener("keydown", handleShortcut);
  }, [isShiftOpen, openEntry, openPayment]);

  function resetDialog(): void {
    setDialog(undefined);
    setPlateFragment("");
    setEntryError("");
    setIsEntrySubmitting(false);
    entrySubmittingRef.current = false;
    setSearchQuery("");
    setSelectedStayId("");
    setPaymentMethod("efectivo");
    setReceivedAmount("");
    setRequestInvoice(false);
    setPaymentError("");
    setIsPaymentSubmitting(false);
    paymentSubmittingRef.current = false;
  }

  function updateInvoiceRequest(checked: boolean | "indeterminate"): void {
    setRequestInvoice(checked !== "indeterminate" && checked);
  }

  function openTicket(stayId: string): void {
    setTicketStayId(stayId);
    setDialog("ticket");
  }

  function registerEntry(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (entrySubmittingRef.current) {
      return;
    }

    const parsedEntry = entrySchema.safeParse({ category: entryCategory, plateFragment });

    if (!parsedEntry.success) {
      setEntryError("Ingresá solo letras y números para identificar la patente.");
      return;
    }

    if (!selectActiveShift(state)) {
      setEntryError("No hay un turno abierto para registrar el ingreso.");
      return;
    }

    entrySubmittingRef.current = true;
    setIsEntrySubmitting(true);
    const operationResult = registerStayEntry(parsedEntry.data.category, parsedEntry.data.plateFragment);

    if (!operationResult.success) {
      setEntryError(operationResult.message);
      entrySubmittingRef.current = false;
      setIsEntrySubmitting(false);
      return;
    }

    const registeredStay = operationResult.state.stays.find((stay) =>
      !state.stays.some((existingStay) => existingStay.id === stay.id),
    );
    resetDialog();

    if (registeredStay) {
      openTicket(registeredStay.id);
    }
  }

  function confirmPayment(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (paymentSubmittingRef.current || !selectedStay || !selectedPrice) {
      return;
    }

    let receivedCents: number | undefined;

    if (paymentMethod === "efectivo") {
      if (!parsedReceivedCash.success) {
        setPaymentError(parsedReceivedCash.error.issues[0]?.message ?? "Ingresá el efectivo recibido.");
        return;
      }

      if (parsedReceivedCash.data < selectedPrice.totalCents) {
        setPaymentError("El efectivo recibido no alcanza para cubrir el total.");
        return;
      }

      receivedCents = parsedReceivedCash.data;
    }

    paymentSubmittingRef.current = true;
    setIsPaymentSubmitting(true);
    setPaymentError("");
    const operationResult = confirmStayPayment({
      stayId: selectedStay.id,
      method: paymentMethod,
      totalCents: selectedPrice.totalCents,
      receivedCents,
      requestInvoice,
    });

    if (!operationResult.success) {
      setPaymentError(operationResult.message);
      paymentSubmittingRef.current = false;
      setIsPaymentSubmitting(false);
      return;
    }

    resetDialog();
  }

  function openShift(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const parsed = z.coerce.number().finite().nonnegative().safeParse(openingCash);
    if (!parsed.success) { setShiftError("Ingresá un fondo inicial válido."); return; }
    const result = runDemoOperation({ type: "open-shift", employeeId: newShiftEmployeeId, label: selectedShiftLabel, openingCashCents: Math.round(parsed.data * 100) });
    if (!result.success) { setShiftError(result.message); return; }
    setShiftError("");
  }

  let currentMovements: DemoMovement[] = [];

  if (activeShift) {
    currentMovements = state.movements
        .filter((movement) => movement.shiftId === activeShift.id)
        .toReversed()
        .slice(0, 5)
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="grid gap-5 rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-9">
        <div className="max-w-2xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-sky-100 sm:text-sm">
            <span aria-hidden="true" className="size-2 rounded-full bg-secondary" />
            Terminal de atención · Simulación
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {employee && `Buen día, ${employee.displayName.split(" ")[0]}.`}
            {!employee && "Turno sin actividad."}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-sky-100 sm:mt-3 sm:text-base">
            Registrá ingresos y cobros del turno desde una sola pantalla.
          </p>
          <Button asChild className="mt-4 border-white/30 bg-white/10 text-white hover:bg-white/20" variant="outline"><a href="#caja-turno">Caja y arqueo ↓</a></Button>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 sm:min-w-64 sm:justify-start">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-action font-display text-lg font-bold text-action-foreground">
            {activeShift && "01"}
            {!activeShift && "—"}
          </span>
          <span className="grid gap-1">
            <span className="text-sm font-semibold">{activeShift && `${activeShift.label ?? "Turno"} abierto`}{!activeShift && "Turno cerrado"}</span>
            <span className="text-xs text-sky-100">
              {activeShift && `Desde las ${formatTime(activeShift.openedAt)}`}
              {!activeShift && "Las acciones están deshabilitadas"}
            </span>
          </span>
          <span className="ml-auto whitespace-nowrap font-mono text-sm tabular-nums text-sky-100">
            {formatLiveClock(now)}
          </span>
        </div>
      </section>

      {!isShiftOpen && (
        <form className="grid gap-4 rounded-2xl border border-warning/50 bg-warning/20 p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end" onSubmit={openShift}>
          <div className="space-y-2"><Label htmlFor="new-shift-employee">Empleado del nuevo turno</Label><Select onValueChange={setNewShiftEmployeeId} value={newShiftEmployeeId}><SelectTrigger className="w-full bg-white" id="new-shift-employee"><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger><SelectContent>{state.employees.filter((item) => item.active).map((item) => <SelectItem key={item.id} value={item.id}>{item.displayName}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="new-shift-label">Nombre del turno</Label><Select onValueChange={setNewShiftLabel} value={selectedShiftLabel}><SelectTrigger className="w-full bg-white" id="new-shift-label"><SelectValue placeholder="Seleccionar turno" /></SelectTrigger><SelectContent>{state.settings.shiftLabels.map((label) => <SelectItem key={label} value={label}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="new-shift-cash">Fondo inicial (ARS)</Label><Input id="new-shift-cash" min={0} onChange={(event) => setOpeningCash(event.target.value)} step="0.01" type="number" value={openingCash} /></div>
          <Button variant="action" type="submit">Abrir turno</Button>
          {shiftError ? <p className="text-sm text-destructive md:col-span-4" role="alert">{shiftError}</p> : null}
        </form>
      )}

      {state.notice && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {state.notice}
        </div>
      )}

      <section aria-labelledby="actions-title" className="grid gap-4" ref={terminalActionsRef} tabIndex={-1}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">Acciones de atención</p>
            <h2 className="font-display mt-1 text-xl font-bold tracking-tight text-primary sm:text-2xl" id="actions-title">
              ¿Qué necesitás hacer?
            </h2>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">También podés usar F1–F4</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {DEMO_STAY_CATEGORIES.map((category) => {
            const details = CATEGORY_DETAILS[category];

            return (
              <Card className="min-w-0 gap-3 rounded-2xl border-border/80 py-4 shadow-sm sm:gap-4 sm:py-5" key={category}>
                <CardHeader className="grid-cols-[auto_1fr] items-center gap-3 px-4 sm:px-5">
                  <span className="font-display grid size-10 place-items-center rounded-xl bg-muted text-xs font-bold text-primary sm:size-12 sm:text-sm">
                    {details.shortcut}
                  </span>
                  <div className="min-w-0 grid gap-1">
                    <CardTitle className="truncate text-sm sm:text-base">{details.label}</CardTitle>
                    <CardDescription className="text-xs">Nuevo ingreso</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-5">
                  <Button
                    className="min-h-11 w-full rounded-xl px-2 text-xs sm:text-sm"
                    disabled={!isShiftOpen}
                    onClick={() => openEntry(category)}
                    variant="outline"
                  >
                    Registrar ingreso
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          <Card className="col-span-2 gap-3 rounded-2xl border-primary/15 bg-primary py-4 text-primary-foreground shadow-sm sm:gap-4 sm:py-5 lg:col-span-1">
            <CardHeader className="grid-cols-[auto_1fr] items-center gap-3 px-4 sm:px-5">
              <span className="font-display grid size-10 place-items-center rounded-xl bg-action text-xs font-bold text-action-foreground sm:size-12 sm:text-sm">F4</span>
              <div className="grid gap-1">
                <CardTitle className="text-base text-primary-foreground">Cobrar</CardTitle>
                <CardDescription className="text-xs text-sky-100">Buscar estadía activa</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <Button
                className="min-h-11 w-full rounded-xl"
                disabled={!isShiftOpen}
                onClick={openPayment}
                variant="action"
              >
                Buscar y cobrar
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-label="Resumen del turno" className="grid gap-3 sm:grid-cols-3">
        <Card className="gap-2 rounded-2xl py-4 shadow-sm" size="sm">
          <CardContent className="flex items-end justify-between px-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">En playa</p>
              <p className="font-display mt-1 text-2xl font-bold tabular-nums text-primary">{occupancy.active}</p>
            </div>
            <p className="pb-1 text-xs text-muted-foreground">de {occupancy.capacity} lugares ilustrativos</p>
          </CardContent>
        </Card>
        <Card className="gap-2 rounded-2xl py-4 shadow-sm" size="sm">
          <CardContent className="flex items-end justify-between px-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">En caja</p>
              <p className="font-display mt-1 text-2xl font-bold tabular-nums text-primary">
                {formatCurrency(cashSummary?.expectedCashCents ?? 0)}
              </p>
            </div>
            <p className="pb-1 text-xs text-muted-foreground">Efectivo esperado</p>
          </CardContent>
        </Card>
        <Card className="gap-2 rounded-2xl py-4 shadow-sm" size="sm">
          <CardContent className="flex items-center justify-between px-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Estado de conexión</p>
              <p className="mt-1 text-sm font-semibold text-primary">{getConnectionLabel(state.settings.connectionScenario)}</p>
            </div>
            <span aria-hidden="true" className={`size-2.5 rounded-full ${getConnectionIndicatorClass(state.settings.connectionScenario)}`} />
            <span className="sr-only">Estado ilustrativo, no refleja conectividad real</span>
          </CardContent>
        </Card>
      </section>

      <Card className="gap-0 rounded-2xl py-0 shadow-sm">
        <CardHeader className="px-5 py-4 sm:px-6">
          <CardTitle className="font-display text-base font-bold text-primary">Movimientos recientes</CardTitle>
          <CardDescription>Actividad de este turno</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-4 sm:px-6">
          {currentMovements.length > 0 && (
            <ul className="divide-y divide-border">
              {currentMovements.map((movement) => (
                <li className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" key={movement.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{getMovementLabel(movement.kind)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {getMovementDetail(movement, state.stays)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {getMovementAmountLabel(movement.amountCents)}
                  </span>
                  {movement.kind === "entry" && movement.stayId && (
                    <Button
                      aria-label={`Ver comprobante del ticket ${state.stays.find((stay) => stay.id === movement.stayId)?.ticketNumber ?? "de ingreso"}`}
                      className="min-h-11 shrink-0 rounded-xl px-3 text-xs"
                      onClick={() => openTicket(movement.stayId ?? "")}
                      type="button"
                      variant="outline"
                    >
                      Ver ticket
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {currentMovements.length === 0 && (
            <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
              <p className="text-sm font-medium text-primary">Todavía no hay movimientos</p>
              <p className="mt-1 text-xs text-muted-foreground">Los ingresos y cobros de este turno van a aparecer acá.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-auto border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
        La Plaza es una simulación visual. No controla barreras, espacios ni dispositivos físicos.
      </p>

      <Dialog onOpenChange={(open) => { if (!open) { resetDialog(); } }} open={Boolean(dialog)}>
        <DialogContent className="max-h-[min(90dvh,48rem)] overflow-y-auto rounded-3xl p-5 sm:p-6" onCloseAutoFocus={(event) => {
          event.preventDefault();
          terminalActionsRef.current?.focus();
        }}>
          {dialog === "entry" && (
            <form className="grid gap-5" onSubmit={registerEntry}>
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold text-primary">Nuevo ingreso · {CATEGORY_DETAILS[entryCategory].label}</DialogTitle>
                <DialogDescription>Ingresá un fragmento de patente para crear la estadía del turno.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="plate-fragment">Números o letras de patente</Label>
                <Input
                  autoComplete="off"
                  autoFocus
                  aria-describedby="plate-fragment-help"
                  aria-invalid={Boolean(entryError)}
                  className="min-h-12 rounded-xl font-mono text-lg uppercase"
                  id="plate-fragment"
                  maxLength={20}
                  onChange={(event) => {
                    setPlateFragment(event.currentTarget.value.toUpperCase());
                    setEntryError("");
                  }}
                  placeholder="Ej.: 782Z"
                  value={plateFragment}
                />
                <p className="text-xs leading-5 text-muted-foreground" id="plate-fragment-help">Podés ingresar una parte de la patente. No hace falta escribirla completa.</p>
                {entryError && <p className="text-sm text-destructive" role="alert">{entryError}</p>}
                {storageStatus === "unavailable" && (
                  <p className="text-sm text-destructive" role="status">El almacenamiento de esta sesión no está disponible. Los cambios pueden perderse al recargar.</p>
                )}
              </div>
              <DialogFooter>
                <Button className="min-h-11 rounded-xl" disabled={isEntrySubmitting} type="submit" variant="action">Registrar ingreso</Button>
              </DialogFooter>
            </form>
          )}
          {dialog === "payment" && (
            <form className="grid gap-5" onSubmit={confirmPayment}>
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold text-primary">Buscar estadía para cobrar</DialogTitle>
                <DialogDescription>Ingresá una parte de la patente y elegí explícitamente la estadía.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="stay-search">Patente parcial</Label>
                <Input
                  aria-describedby="stay-search-help"
                  aria-invalid={!parsedSearchQuery.success}
                  autoComplete="off"
                  autoFocus
                  className="min-h-12 rounded-xl font-mono text-lg uppercase"
                  id="stay-search"
                  onChange={(event) => {
                    setSearchQuery(event.currentTarget.value.toUpperCase());
                    setSelectedStayId("");
                  }}
                  placeholder="Ej.: 782"
                  value={searchQuery}
                />
                <p className="text-xs leading-5 text-muted-foreground" id="stay-search-help">
                  Buscá por cualquier fragmento de letras o números. La búsqueda distingue cada estadía por su ID interno.
                </p>
                {!parsedSearchQuery.success && (
                  <p className="text-sm text-destructive" role="alert">Usá solo letras y números para buscar.</p>
                )}
              </div>
              <div aria-live="polite" className="grid max-h-52 gap-2 overflow-y-auto">
                {parsedSearchQuery.success && searchQuery.trim() && activeStays.length > 0 && activeStays.map((stay) => (
                  <StayOption
                    key={stay.id}
                    onSelect={() => setSelectedStayId(stay.id)}
                    selected={selectedStayId === stay.id}
                    stay={stay}
                  />
                ))}
                {parsedSearchQuery.success && searchQuery.trim() && !activeStays.length && (
                  <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">No encontramos estadías activas con ese fragmento.</p>
                )}
              </div>
              {selectedStay && selectedPrice && (
                <div className="grid gap-4 rounded-2xl bg-muted p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">Ticket #{selectedStay.ticketNumber} · {CATEGORY_DETAILS[selectedStay.category].label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Ingreso {formatStayDateTime(selectedStay.enteredAt)} · {formatElapsed(selectedStay.enteredAt, now)}</p>
                      <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">ID {selectedStay.id}</p>
                    </div>
                    <p className="shrink-0 font-display text-2xl font-extrabold tabular-nums text-primary">{formatCurrency(selectedPrice.totalCents)}</p>
                  </div>
                  <div className="grid gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    <p>Tarifa ilustrativa: {formatCurrency(selectedPrice.tariffPerFractionCents)} cada {selectedPrice.fractionMinutes} min</p>
                    <p>{selectedPrice.blocks} {selectedPrice.blocks === 1 ? "bloque" : "bloques"} · {selectedPrice.billableMinutes} min facturables</p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Medio de pago</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.map(({ label, value }) => (
                        <Button
                          aria-pressed={paymentMethod === value}
                          className="min-h-11 rounded-xl px-2 text-xs sm:text-sm"
                          key={value}
                          onClick={() => setPaymentMethod(value)}
                          type="button"
                          variant={getSelectionVariant(paymentMethod === value)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {paymentMethod === "efectivo" && (
                    <div className="grid gap-2">
                      <Label htmlFor="received-amount">Efectivo recibido</Label>
                      <Input
                        aria-describedby="received-amount-help"
                        aria-invalid={Boolean(paymentError) || (Boolean(receivedAmount) && !parsedReceivedCash.success) || (Boolean(receivedAmount) && parsedReceivedCash.success && !receivedCashIsSufficient)}
                        className="min-h-11 rounded-xl"
                        id="received-amount"
                        inputMode="decimal"
                        onChange={(event) => {
                          setReceivedAmount(event.currentTarget.value);
                          setPaymentError("");
                        }}
                        placeholder="0"
                        required
                        type="text"
                        value={receivedAmount}
                      />
                      <p className="text-xs text-muted-foreground" id="received-amount-help">
                        Vuelto: {formatCurrency(parsedReceivedCash.success ? Math.max(0, parsedReceivedCash.data - selectedPrice.totalCents) : 0)}
                      </p>
                      {Boolean(receivedAmount) && !parsedReceivedCash.success && (
                        <p className="text-sm text-destructive" role="alert">{parsedReceivedCash.error.issues[0]?.message}</p>
                      )}
                      {Boolean(receivedAmount) && parsedReceivedCash.success && !receivedCashIsSufficient && (
                        <p className="text-sm text-destructive" role="alert">El efectivo recibido no alcanza para cubrir el total.</p>
                      )}
                    </div>
                  )}
                  <div className="flex min-h-14 items-start gap-3 rounded-xl border border-border bg-background p-3">
                    <Checkbox
                      checked={requestInvoice}
                      disabled={isPaymentSubmitting}
                      id="request-invoice"
                      onCheckedChange={updateInvoiceRequest}
                    />
                    <div className="grid gap-1">
                      <Label className="cursor-pointer text-sm font-semibold leading-5" htmlFor="request-invoice">
                        Requiere factura
                      </Label>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Registra una solicitud visual pendiente. Es una simulación; no emite factura ni comprobante fiscal.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {paymentError && <p className="text-sm text-destructive" role="alert">{paymentError}</p>}
              <DialogFooter>
                <Button className="min-h-11 rounded-xl" disabled={!selectedStay || !selectedPrice || isPaymentSubmitting || (paymentMethod === "efectivo" && !receivedCashIsSufficient)} type="submit" variant="action">
                  {isPaymentSubmitting ? "Confirmando…" : "Confirmar cobro y egreso"}
                </Button>
                <Button className="min-h-11 rounded-xl" disabled={isPaymentSubmitting} onClick={resetDialog} type="button" variant="outline">Cancelar</Button>
              </DialogFooter>
            </form>
          )}
          {dialog === "ticket" && ticketStay && (
            <div className="grid gap-5">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold text-primary">
                  Ingreso registrado
                </DialogTitle>
                <DialogDescription>
                  Revisá los datos del comprobante operativo antes de imprimirlo.
                </DialogDescription>
              </DialogHeader>
              <EntryTicket onPrint={() => window.print()} stay={ticketStay} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function StayOption({
  onSelect,
  selected,
  stay,
}: Readonly<{ onSelect: () => void; selected: boolean; stay: DemoStay }>) {
  return (
    <Button
      aria-pressed={selected}
      className="h-auto min-h-12 w-full justify-between rounded-xl px-3 py-2 text-left"
      onClick={onSelect}
      type="button"
      variant={getSelectionVariant(selected)}
    >
      <span className="grid min-w-0 gap-0.5">
        <span className="truncate font-mono text-sm font-bold">{stay.plateFragment}</span>
        <span className="text-xs font-normal">Ticket #{stay.ticketNumber} · {CATEGORY_DETAILS[stay.category].label} · {formatStayDateTime(stay.enteredAt)}</span>
        <span className="truncate font-mono text-[10px] font-normal opacity-80">ID {stay.id}</span>
      </span>
      <span className="ml-2 shrink-0 text-xs">{selected && "Elegida"}{!selected && "Elegir"}</span>
    </Button>
  );
}

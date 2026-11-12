"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemoState } from "../demo/demo-provider";
import { getLocalDateKey } from "../domain/date.utils";
import { selectActiveShift } from "../domain/selectors";
import type { DemoPaymentMethod } from "../domain/demo.types";
import { AdminPanel, formatDateTime, formatMoney } from "./admin-visuals";

const schema = z.object({ category: z.string().min(1), concept: z.string().trim().min(2), method: z.enum(["efectivo", "debito", "transferencia"]), amount: z.coerce.number().positive().finite(), date: z.iso.date() });

export function AdminExpenses() {
  const { state, runDemoOperation } = useDemoState();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(state.settings.expenseCategories[0] ?? "");
  const [concept, setConcept] = useState("");
  const [method, setMethod] = useState<DemoPaymentMethod>("efectivo");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => getLocalDateKey(new Date()));
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const expenses = [...state.expenses].filter((expense) => filter === "all" || expense.category === filter).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const total = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse({ category, concept, method, amount, date });
    if (!parsed.success || !state.settings.expenseCategories.includes(category)) { setError("Completá categoría, concepto, importe y fecha válidos."); return; }
    const shift = selectActiveShift(state);
    const currentTime = new Date();
    let expenseDate = parsed.data.date === getLocalDateKey(currentTime) ? currentTime.toISOString() : `${parsed.data.date}T12:00:00-03:00`;
    if (shift && parsed.data.date === getLocalDateKey(new Date(shift.openedAt)) && Date.parse(expenseDate) < Date.parse(shift.openedAt)) expenseDate = shift.openedAt;
    const result = runDemoOperation({ type: "record-expense", category: parsed.data.category, concept: parsed.data.concept, method: parsed.data.method, amountCents: Math.round(parsed.data.amount * 100), expenseDate });
    if (!result.success) { setError(result.message); return; }
    setOpen(false); setConcept(""); setAmount(""); setError(""); toast.success("Gasto registrado");
  }

  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-bold text-primary">Control de gastos</h2><p className="mt-1 text-sm text-muted-foreground">Los gastos en efectivo se descuentan una sola vez del efectivo esperado.</p></div><Button variant="action" onClick={() => setOpen(true)}>+ Nuevo gasto</Button></div>
    <div className="grid gap-4 sm:grid-cols-[1fr_auto]"><AdminPanel title="Gastos registrados" subtitle={`${expenses.length} operaciones · ${formatMoney(total)}`}><div className="space-y-2">{expenses.length ? expenses.map((expense) => <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3 text-sm last:border-0" key={expense.id}><div><p className="font-semibold text-primary">{expense.concept}</p><p className="text-xs text-muted-foreground">{expense.category} · {expense.method} · {formatDateTime(expense.occurredAt)} · {state.employees.find((employee) => employee.id === expense.employeeId)?.displayName ?? "—"}</p></div><strong className="text-primary">{formatMoney(expense.amountCents)}</strong></div>) : <p className="text-sm text-muted-foreground">Sin gastos para este filtro.</p>}</div></AdminPanel><div className="w-full sm:w-48"><Label htmlFor="expense-filter">Categoría</Label><Select onValueChange={setFilter} value={filter}><SelectTrigger className="mt-2 w-full" id="expense-filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{state.settings.expenseCategories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div>
    <Dialog onOpenChange={setOpen} open={open}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Registrar gasto</DialogTitle><DialogDescription>Se asociará al turno activo de la demo.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submit}><div className="space-y-2"><Label htmlFor="expense-category">Categoría</Label><Select onValueChange={setCategory} value={category}><SelectTrigger className="w-full" id="expense-category"><SelectValue /></SelectTrigger><SelectContent>{state.settings.expenseCategories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="expense-concept">Concepto</Label><Input id="expense-concept" onChange={(event) => setConcept(event.target.value)} value={concept} /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="expense-amount">Importe (ARS)</Label><Input id="expense-amount" min="0.01" onChange={(event) => setAmount(event.target.value)} step="0.01" type="number" value={amount} /></div><div className="space-y-2"><Label htmlFor="expense-date">Fecha</Label><Input id="expense-date" onChange={(event) => setDate(event.target.value)} type="date" value={date} /></div></div><div className="space-y-2"><Label htmlFor="expense-method">Medio de pago</Label><Select onValueChange={(value) => setMethod(value as DemoPaymentMethod)} value={method}><SelectTrigger className="w-full" id="expense-method"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="efectivo">Efectivo de caja</SelectItem><SelectItem value="debito">Débito</SelectItem><SelectItem value="transferencia">Transferencia</SelectItem></SelectContent></Select></div>{error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}<Button className="w-full bg-action font-bold text-primary hover:bg-action/90" type="submit">Guardar gasto</Button></form></DialogContent></Dialog>
  </div>;
}

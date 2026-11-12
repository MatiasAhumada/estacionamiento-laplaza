"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoState } from "../demo/demo-provider";
import type { DemoEmployee } from "../domain/demo.types";
import { AdminPanel, formatDateTime, formatMoney } from "./admin-visuals";

const nameSchema = z.string().trim().min(2, "Ingresá un nombre de al menos dos caracteres.");

export function AdminEmployees() {
  const { state, runDemoOperation } = useDemoState();
  const [selected, setSelected] = useState<string>();
  const [editing, setEditing] = useState<DemoEmployee | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const employee = state.employees.find((item) => item.id === selected);
  const shifts = state.shifts.filter((shift) => shift.employeeId === employee?.id);
  const payments = state.payments.filter((payment) => payment.employeeId === employee?.id);
  const revenue = payments.reduce((sum, payment) => sum + payment.netCents, 0);

  function showForm(item: DemoEmployee | null) { setEditing(item); setName(item?.displayName ?? ""); setError(""); setOpen(true); }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const parsed = nameSchema.safeParse(name);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Nombre inválido."); return; }
    const result = runDemoOperation({ type: "save-employee", employeeId: editing?.id, displayName: parsed.data, active: editing?.active ?? true });
    if (!result.success) { setError(result.message); return; }
    setOpen(false); toast.success(editing ? "Empleado actualizado" : "Empleado creado");
  }
  function toggle(item: DemoEmployee) {
    const result = runDemoOperation({ type: "save-employee", employeeId: item.id, displayName: item.displayName, active: !item.active });
    if (result.success) toast.success(item.active ? "Empleado desactivado" : "Empleado activado");
    else toast.error(result.message);
  }

  return <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-bold text-primary">Personal</h2><p className="mt-1 text-sm text-muted-foreground">Los empleados desactivados conservan sus turnos y operaciones.</p></div><Button variant="action" onClick={() => showForm(null)}>+ Nuevo empleado</Button></div><div className="grid gap-5 xl:grid-cols-[1fr_20rem]"><AdminPanel title="Equipo" subtitle={`${state.employees.filter((item) => item.active).length} activos de ${state.employees.length}`}><div className="divide-y divide-border">{state.employees.map((item) => <div className="flex flex-wrap items-center justify-between gap-3 py-3" key={item.id}><div><p className="font-semibold text-primary">{item.displayName}</p><p className="text-xs text-muted-foreground">{item.active ? "Activo" : "Inactivo"} · {state.shifts.filter((shift) => shift.employeeId === item.id).length} turnos</p></div><div className="flex gap-1"><Button onClick={() => setSelected(item.id)} size="sm" variant="outline">Detalle</Button><Button onClick={() => showForm(item)} size="sm" variant="outline">Editar</Button><Button onClick={() => toggle(item)} size="sm" variant="outline">{item.active ? "Desactivar" : "Activar"}</Button></div></div>)}</div></AdminPanel><AdminPanel title="Detalle y métricas" subtitle={employee?.displayName ?? "Seleccioná un empleado"}>{employee ? <div className="space-y-4 text-sm"><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-muted p-3"><strong className="block text-xl text-primary">{shifts.length}</strong><span>Turnos</span></div><div className="rounded-xl bg-muted p-3"><strong className="block text-xl text-primary">{payments.length}</strong><span>Cobros</span></div></div><p>Recaudación registrada: <strong>{formatMoney(revenue)}</strong></p><p>Movimientos: <strong>{state.movements.filter((movement) => movement.employeeId === employee.id).length}</strong></p><p>Arqueos: <strong>{state.cashCounts.filter((count) => count.employeeId === employee.id).length}</strong></p><div className="border-t border-border pt-3"><strong>Turnos</strong>{shifts.length ? shifts.map((shift) => <p className="mt-2 text-xs text-muted-foreground" key={shift.id}>{formatDateTime(shift.openedAt)} · {shift.status === "open" ? "Abierto" : "Cerrado"}</p>) : <p className="mt-2 text-xs text-muted-foreground">Sin turnos.</p>}</div></div> : <p className="text-sm text-muted-foreground">Elegí un empleado para consultar su actividad.</p>}</AdminPanel></div><Dialog onOpenChange={setOpen} open={open}><DialogContent><DialogHeader><DialogTitle>{editing ? "Editar empleado" : "Nuevo empleado"}</DialogTitle><DialogDescription>Registro simulado para esta sesión.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={save}><div className="space-y-2"><Label htmlFor="employee-name">Nombre</Label><Input id="employee-name" onChange={(event) => setName(event.target.value)} value={name} /></div>{error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}<Button className="w-full bg-action font-bold text-primary hover:bg-action/90" type="submit">Guardar empleado</Button></form></DialogContent></Dialog></div>;
}

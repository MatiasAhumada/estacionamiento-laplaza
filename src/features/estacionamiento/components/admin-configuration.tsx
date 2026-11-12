"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoState } from "../demo/demo-provider";
import type { DemoSettings, DemoTariff } from "../domain/demo.types";
import { AdminEmployees } from "./admin-employees";
import { AdminPanel, formatMoney } from "./admin-visuals";

const settingsSchema = z.object({ parkingName: z.string().trim().min(2), motorcyclePositions: z.number().int().min(0).max(200), autoPositions: z.number().int().min(0).max(200), vanPositions: z.number().int().min(0).max(200), shiftLabels: z.array(z.string().min(1)).min(1), expenseCategories: z.array(z.string().min(1)).min(1), connectionScenario: z.enum(["online", "offline", "syncing"]) });
const tariffSchema = z.array(z.object({ hourlyCents: z.number().int().positive(), fractionMinutes: z.number().int().positive().max(120) })).length(3);
const categories = [{ key: "moto", title: "Motocicletas", prefix: "M", description: "Sector cercano a la entrada; admite autos si hay espacio." }, { key: "auto", title: "Automóviles", prefix: "A", description: "Posiciones centrales de referencia." }, { key: "camioneta", title: "Camionetas / SUV", prefix: "C", description: "Posiciones del fondo de la playa." }] as const;
const connectionScenarios = [
  { value: "online", label: "Conectado · demo" },
  { value: "offline", label: "Sin conexión · simulada" },
  { value: "syncing", label: "Sincronización · simulada" },
] as const;

export function AdminConfiguration() {
  const { isHydrated, state } = useDemoState();
  if (!isHydrated) return <p className="rounded-2xl bg-white p-6 text-muted-foreground">Cargando configuración…</p>;
  return <ConfigurationEditor key={JSON.stringify({ settings: state.settings, tariffs: state.tariffs })} />;
}

function ConfigurationEditor() {
  const { state, runDemoOperation } = useDemoState();
  const [settings, setSettings] = useState<DemoSettings>(state.settings);
  const [tariffs, setTariffs] = useState<DemoTariff[]>(state.tariffs);
  const [shiftText, setShiftText] = useState(state.settings.shiftLabels.join(", "));
  const [expenseText, setExpenseText] = useState(state.settings.expenseCategories.join(", "));
  const [error, setError] = useState("");

  function updateCount(key: "motorcyclePositions" | "autoPositions" | "vanPositions", value: string) {
    setSettings((current) => ({ ...current, [key]: Number(value) }));
  }
  function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = { ...settings, capacity: settings.motorcyclePositions + settings.autoPositions + settings.vanPositions, shiftLabels: shiftText.split(",").map((item) => item.trim()).filter(Boolean), expenseCategories: expenseText.split(",").map((item) => item.trim()).filter(Boolean) };
    const parsed = settingsSchema.safeParse(next);
    if (!parsed.success) { setError("Revisá nombre, posiciones, turnos y categorías de gastos."); return; }
    const result = runDemoOperation({ type: "save-settings", settings: next });
    if (result.success) { setError(""); toast.success("Configuración guardada"); } else setError(result.message);
  }
  function saveTariffs(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = tariffSchema.safeParse(tariffs);
    if (!parsed.success) { setError("Revisá los importes y fracciones de las tarifas."); return; }
    const result = runDemoOperation({ type: "save-tariffs", tariffs: tariffs.map((tariff) => ({ ...tariff, effectiveFrom: new Date().toISOString() })) });
    if (result.success) { setError(""); toast.success("Tarifas actualizadas"); } else setError(result.message);
  }

  return <div className="space-y-6"><div><p className="text-xs font-bold tracking-[0.18em] text-secondary uppercase">Preferencias de la demo</p><h1 className="font-display mt-2 text-3xl font-extrabold text-primary">Configuración</h1><p className="mt-2 text-sm text-muted-foreground">Datos de playa, distribución, tarifas y parámetros operativos simulados.</p></div>
    {error ? <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">{error}</p> : null}
    <form className="space-y-5" onSubmit={saveSettings}><AdminPanel title="Datos del estacionamiento" subtitle="El nombre aparece en las auditorías futuras"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="parking-name">Nombre comercial</Label><Input id="parking-name" onChange={(event) => setSettings((current) => ({ ...current, parkingName: event.target.value }))} value={settings.parkingName} /></div><div className="space-y-2"><Label htmlFor="parking-capacity">Capacidad ilustrativa total</Label><Input id="parking-capacity" readOnly value={settings.motorcyclePositions + settings.autoPositions + settings.vanPositions} /><p className="text-xs text-muted-foreground">Suma de los tres sectores. No bloquea ingresos.</p></div></div></AdminPanel>
      <AdminPanel title="Topografía de playa" subtitle="Referencia visual aproximada: 50 m de largo × 10 m de ancho, sin plano arquitectónico validado"><div className="grid gap-3 md:grid-cols-3">{categories.map((category) => { const key = category.key === "moto" ? "motorcyclePositions" : category.key === "auto" ? "autoPositions" : "vanPositions"; return <div className="rounded-xl border border-border bg-muted/40 p-4" key={category.key}><div className="mb-3 flex items-center justify-between"><strong className="text-sm text-primary">{category.title}</strong><span className="rounded-lg bg-primary px-2 py-1 text-xs text-white">{category.prefix}</span></div><Label htmlFor={`${key}-count`}>Posiciones</Label><Input className="mt-2" id={`${key}-count`} max={200} min={0} onChange={(event) => updateCount(key, event.target.value)} type="number" value={settings[key]} /><p className="mt-2 text-xs leading-5 text-muted-foreground">{category.description}</p></div>; })}</div><p className="mt-4 text-xs text-muted-foreground">Las posiciones ya asignadas a estadías activas no se mueven automáticamente si reducís un sector; aparecerán como sin posición visible.</p></AdminPanel>
      <div className="grid gap-5 xl:grid-cols-2"><AdminPanel title="Turnos y categorías de gasto" subtitle="Listas simples para las operaciones de esta demo"><div className="space-y-4"><div className="space-y-2"><Label htmlFor="shift-labels">Nombres de turnos</Label><Input id="shift-labels" onChange={(event) => setShiftText(event.target.value)} value={shiftText} /><p className="text-xs text-muted-foreground">Separados por coma; referencias visuales, sin programación automática.</p></div><div className="space-y-2"><Label htmlFor="expense-categories">Categorías de gastos</Label><Input id="expense-categories" onChange={(event) => setExpenseText(event.target.value)} value={expenseText} /><p className="text-xs text-muted-foreground">Separadas por coma. Los gastos históricos conservan su categoría.</p></div></div></AdminPanel><AdminPanel title="Categorías y medios de pago" subtitle="Opciones disponibles en los flujos de la terminal"><div className="space-y-3 text-sm"><p><strong>Vehículos:</strong> auto, camioneta y moto.</p><p><strong>Pagos:</strong> efectivo, débito y transferencia.</p><p className="text-xs leading-5 text-muted-foreground">Estas opciones forman parte de las reglas actuales de cobro y se muestran aquí para consulta.</p></div></AdminPanel></div>
      <AdminPanel title="Escenario de conexión" subtitle="Indicador visual de la terminal; no modifica las operaciones ni simula sincronización real">
        <div aria-label="Escenario de conexión de la demo" className="grid gap-2 sm:grid-cols-3" role="group">
          {connectionScenarios.map((scenario) => (
            <Button
              aria-pressed={settings.connectionScenario === scenario.value}
              className="min-h-11 whitespace-normal"
              key={scenario.value}
              onClick={() => setSettings((current) => ({ ...current, connectionScenario: scenario.value }))}
              type="button"
              variant={settings.connectionScenario === scenario.value ? "brand" : "outline"}
            >
              {scenario.label}
            </Button>
          ))}
        </div>
      </AdminPanel>
      <Button variant="action" type="submit">Guardar configuración</Button></form>
    <form onSubmit={saveTariffs}><AdminPanel title="Esquema tarifario" subtitle="Los cambios afectan cotizaciones futuras; cada cobro histórico conserva su importe y fracción"><div className="grid gap-3 md:grid-cols-3">{tariffs.map((tariff, index) => <div className="rounded-xl border border-border p-4" key={tariff.category}><strong className="text-sm capitalize text-primary">{tariff.category}</strong><p className="mt-1 text-xs text-muted-foreground">Actual: {formatMoney(state.tariffs[index]?.hourlyCents ?? 0)} / hora</p><div className="mt-4 space-y-2"><Label htmlFor={`tariff-${tariff.category}`}>Tarifa por hora (ARS)</Label><Input id={`tariff-${tariff.category}`} min="0.01" onChange={(event) => setTariffs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, hourlyCents: Math.round(Number(event.target.value) * 100) } : item))} step="0.01" type="number" value={tariff.hourlyCents / 100} /></div><div className="mt-3 space-y-2"><Label htmlFor={`fraction-${tariff.category}`}>Fracción (min)</Label><Input id={`fraction-${tariff.category}`} min={1} onChange={(event) => setTariffs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, fractionMinutes: Number(event.target.value) } : item))} type="number" value={tariff.fractionMinutes} /></div></div>)}</div><Button className="mt-5 font-bold" variant="action" type="submit">Guardar tarifas</Button></AdminPanel></form>
    <AdminEmployees />
  </div>;
}

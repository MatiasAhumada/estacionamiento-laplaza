"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDemoState } from "../demo/demo-provider";
import type { DemoAuditVehicle, DemoStayCategory } from "../domain/demo.types";
import { selectActiveShift, selectOccupancy } from "../domain/selectors";
import { AdminDonut, AdminPanel, AdminStat, formatDateTime } from "./admin-visuals";

type Position = { id: string; category: DemoStayCategory };

function positions(motorcycles: number, autos: number, vans: number): Position[] {
  return [
    ...Array.from({ length: motorcycles }, (_, index) => ({ id: `M-${String(index + 1).padStart(2, "0")}`, category: "moto" as const })),
    ...Array.from({ length: autos }, (_, index) => ({ id: `A-${String(index + 1).padStart(2, "0")}`, category: "auto" as const })),
    ...Array.from({ length: vans }, (_, index) => ({ id: `C-${String(index + 1).padStart(2, "0")}`, category: "camioneta" as const })),
  ];
}

function sectorLabel(category: DemoStayCategory): string { return category === "moto" ? "Motos · entrada" : category === "auto" ? "Autos · centro" : "Camionetas / SUV · fondo"; }

function MapGrid({ spots, vehicles, selectedId, onSelect }: Readonly<{ spots: Position[]; vehicles: DemoAuditVehicle[]; selectedId?: string; onSelect: (id: string) => void }>) {
  const groups: DemoStayCategory[] = ["moto", "auto", "camioneta"];
  return <div className="min-w-[570px] rounded-2xl border border-border bg-[#f7fafb] p-5 sm:p-7">
    <div className="mb-5 flex items-center gap-3 rounded-lg border border-dashed border-secondary/50 bg-secondary/10 px-4 py-3 text-xs font-bold tracking-[0.16em] text-primary uppercase"><span className="rounded-lg bg-secondary px-3 py-1.5 text-white">ENTRADA</span><span className="h-px flex-1 bg-secondary/35" /><span>Circulación →</span></div>
    <div className="space-y-6">{groups.map((category) => { const sector = spots.filter((spot) => spot.category === category); if (!sector.length) return null; return <section key={category}><div className="mb-2 flex items-center justify-between text-xs font-bold text-primary"><span>{sectorLabel(category)}</span><span className="text-muted-foreground">{sector.filter((spot) => vehicles.some((vehicle) => vehicle.positionId === spot.id)).length} / {sector.length}</span></div><div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">{sector.map((spot) => { const vehicle = vehicles.find((item) => item.positionId === spot.id); return <Button aria-label={`${spot.id}: ${vehicle ? `ocupado por ${vehicle.plateFragment}` : "libre"}`} aria-pressed={selectedId === spot.id} className={`h-20 flex-col gap-1 rounded-xl border-2 p-1 text-xs shadow-none ${selectedId === spot.id ? "ring-2 ring-action ring-offset-2" : ""} ${vehicle ? "border-secondary bg-secondary/15 text-primary hover:bg-secondary/25" : "border-dashed border-border bg-white text-muted-foreground hover:bg-accent/30"}`} key={spot.id} onClick={() => onSelect(spot.id)} variant="outline"><span className="font-bold">{spot.id}</span><span className="max-w-full truncate text-[10px]">{vehicle ? vehicle.plateFragment : "Libre"}</span><span className="text-[9px]">{vehicle ? vehicle.category : "—"}</span></Button>; })}</div></section>; })}</div>
    <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">Plano ilustrativo de 50 × 10 m. Las posiciones de la demo se asignan por disponibilidad; no se detectan físicamente.</p>
  </div>;
}

export function OccupancyMap({ auditMode = false }: Readonly<{ auditMode?: boolean }>) {
  const { state, isHydrated, runDemoOperation } = useDemoState();
  const [selectedId, setSelectedId] = useState<string>();
  const [auditId, setAuditId] = useState<string>();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60_000); return () => window.clearInterval(timer); }, []);
  const audit = state.audits.find((item) => item.id === auditId);
  const shift = selectActiveShift(state);
  const liveVehicles: DemoAuditVehicle[] = state.stays.filter((stay) => stay.status === "active").map((stay) => ({
    stayId: stay.id, ticketNumber: stay.ticketNumber, plateFragment: stay.plateFragment, category: stay.category,
    positionId: stay.positionId, enteredAt: stay.enteredAt, shiftId: stay.shiftId,
    employeeName: state.employees.find((employee) => employee.id === stay.enteredByEmployeeId)?.displayName ?? "No disponible",
  }));
  const vehicles = audit?.vehicles ?? liveVehicles;
  const spots = positions(audit?.motorcyclePositions ?? state.settings.motorcyclePositions, audit?.autoPositions ?? state.settings.autoPositions, audit?.vanPositions ?? state.settings.vanPositions);
  const selected = vehicles.find((vehicle) => vehicle.positionId === selectedId);
  const occupancy = selectOccupancy(state);
  const occupied = vehicles.length;
  const capacity = audit?.capacity ?? occupancy.capacity;
  const free = Math.max(0, capacity - occupied);
  const breakdown = { auto: vehicles.filter((vehicle) => vehicle.category === "auto").length, camioneta: vehicles.filter((vehicle) => vehicle.category === "camioneta").length, moto: vehicles.filter((vehicle) => vehicle.category === "moto").length };
  const unassigned = vehicles.filter((vehicle) => !vehicle.positionId || !spots.some((spot) => spot.id === vehicle.positionId));

  function capture() {
    const result = runDemoOperation({ type: "create-audit" });
    if (!result.success) { toast.error(result.message); return; }
    const latest = result.state.audits.at(-1);
    setAuditId(latest?.id);
    toast.success(`Auditoría #${latest?.number} guardada`);
  }

  if (!isHydrated) return <p className="rounded-2xl bg-white p-6 text-muted-foreground">Cargando mapa…</p>;
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.18em] text-secondary uppercase">Control visual</p><h1 className="font-display mt-2 text-3xl font-extrabold text-primary">Ocupación de playa</h1><p className="mt-2 text-sm text-muted-foreground">Mapa cenital ilustrativo y capturas históricas de auditoría.</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => { setAuditId(undefined); setSelectedId(undefined); }} variant={audit ? "outline" : "brand"}>Mapa actual</Button><Button onClick={capture} className="bg-action font-bold text-primary hover:bg-action/90">Generar captura</Button></div></div>
    {auditMode && !audit ? <div className="rounded-xl border border-action/50 bg-action/15 px-4 py-3 text-sm text-primary"><strong>Modo auditoría visual.</strong> Revisá el mapa actual y generá una captura para conservar este momento.</div> : null}
    {audit ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-secondary/10 p-4 text-sm"><div><strong className="text-primary">Auditoría #{audit.number}</strong><span className="ml-2 text-muted-foreground">{formatDateTime(audit.createdAt)} · {audit.employeeName}</span></div><Button onClick={() => window.print()} variant="outline">Imprimir auditoría</Button></div> : null}
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><AdminStat label="Vehículos" value={String(occupied)} detail={audit ? "Al generar la captura" : "Estadías activas"} accent /><AdminStat label="Disponibles" value={String(free)} detail="Posiciones de referencia" /><AdminStat label="Ocupación" value={`${capacity ? Math.round(occupied / capacity * 100) : 0}%`} detail={`${occupied} de ${capacity} posiciones`} /><AdminStat label="Turno" value={audit ? "Captura" : shift ? "Activo" : "Cerrado"} detail={audit?.shiftId ?? shift?.id ?? "Sin turno"} /></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]"><AdminPanel title={audit ? `Mapa de auditoría #${audit.number}` : "Mapa de ocupación actual"} subtitle="Seleccioná una posición para consultar sus datos"><div className="overflow-x-auto pb-1"><MapGrid spots={spots} vehicles={vehicles} selectedId={selectedId} onSelect={setSelectedId} /></div>{unassigned.length ? <p className="mt-3 rounded-lg bg-action/15 p-3 text-xs text-primary">{unassigned.length} vehículo(s) sin posición ilustrativa asignada: {unassigned.map((item) => item.plateFragment).join(", ")}.</p> : null}</AdminPanel><div className="space-y-5"><AdminPanel title="Detalle de posición" subtitle={selectedId ?? "Seleccioná un espacio"}>{selectedId ? selected ? <dl className="space-y-3 text-sm"><div><dt className="text-xs text-muted-foreground">Identificador registrado</dt><dd className="font-display text-xl font-bold text-primary">{selected.plateFragment}</dd></div><div><dt className="text-xs text-muted-foreground">Categoría</dt><dd className="capitalize">{selected.category}</dd></div><div><dt className="text-xs text-muted-foreground">Ingreso</dt><dd>{formatDateTime(selected.enteredAt)}</dd></div><div><dt className="text-xs text-muted-foreground">Permanencia</dt><dd>{Math.max(0, Math.floor((new Date(audit?.createdAt ?? now).getTime() - new Date(selected.enteredAt).getTime()) / 60_000))} min</dd></div><div><dt className="text-xs text-muted-foreground">Empleado / turno de origen</dt><dd>{selected.employeeName} · {selected.shiftId}</dd></div></dl> : <p className="text-sm text-muted-foreground">Posición libre.</p> : <p className="text-sm text-muted-foreground">Consultá un espacio ocupado o libre en el mapa.</p>}</AdminPanel><AdminPanel title="Distribución" subtitle="Vehículos por categoría"><AdminDonut center={String(occupied)} label="vehículos" segments={[{ label: "Autos", value: breakdown.auto, color: "#219ebc" }, { label: "Camionetas", value: breakdown.camioneta, color: "#023047" }, { label: "Motos", value: breakdown.moto, color: "#ffb703" }]} /></AdminPanel></div></div>
    <div className="grid gap-5 xl:grid-cols-2"><AdminPanel title="Ocupación por sectores" subtitle="Sobre las posiciones ilustrativas de cada sector"><div className="space-y-4">{(["moto", "auto", "camioneta"] as const).map((category) => { const count = spots.filter((spot) => spot.category === category).length; const used = spots.filter((spot) => spot.category === category && vehicles.some((vehicle) => vehicle.positionId === spot.id)).length; return <div key={category}><div className="mb-1.5 flex justify-between text-xs"><strong className="text-primary">{sectorLabel(category)}</strong><span>{used} / {count}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-secondary" style={{ width: `${count ? used / count * 100 : 0}%` }} /></div></div>; })}</div></AdminPanel><AdminPanel title="Permanencia de vehículos" subtitle="Tiempo transcurrido al momento de la consulta o captura">{vehicles.length ? <div className="space-y-2">{[...vehicles].sort((a, b) => a.enteredAt.localeCompare(b.enteredAt)).slice(0, 5).map((vehicle) => <div className="flex justify-between border-b border-border py-2 text-xs last:border-0" key={vehicle.stayId}><span><strong className="text-primary">{vehicle.plateFragment}</strong> · {vehicle.positionId ?? "Sin posición"}</span><strong>{Math.max(0, Math.floor((new Date(audit?.createdAt ?? now).getTime() - new Date(vehicle.enteredAt).getTime()) / 60_000))} min</strong></div>)}</div> : <p className="text-sm text-muted-foreground">No hay vehículos para mostrar.</p>}</AdminPanel></div>
    <AdminPanel title="Capturas históricas" subtitle="Cada captura conserva las estadías y la distribución del momento en que se generó">{state.audits.length ? <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{[...state.audits].reverse().map((item) => <Button className="h-auto justify-between rounded-xl p-4 text-left" key={item.id} onClick={() => { setAuditId(item.id); setSelectedId(undefined); }} variant={auditId === item.id ? "brand" : "outline"}><span><strong className="block">Auditoría #{item.number}</strong><small className="block font-normal">{formatDateTime(item.createdAt)}</small></span><span>{item.vehicles.length} vehículos</span></Button>)}</div> : <p className="text-sm text-muted-foreground">Todavía no se generaron auditorías.</p>}</AdminPanel>
    {audit ? <section className="audit-print hidden"><h1>{audit.parkingName}</h1><h2>Auditoría de playa #{audit.number}</h2><p>Fecha y hora: {formatDateTime(audit.createdAt)} · Turno: {audit.shiftId ?? "Sin turno"} · Empleado: {audit.employeeName}</p><p>Total: {audit.vehicles.length} vehículos · Autos: {breakdown.auto} · Camionetas: {breakdown.camioneta} · Motos: {breakdown.moto}</p><div className="audit-print-map">{spots.map((spot) => { const vehicle = vehicles.find((item) => item.positionId === spot.id); return <div key={spot.id}><strong>{spot.id}</strong><br />{vehicle?.plateFragment ?? "Libre"}</div>; })}</div><h3>Vehículos registrados</h3><table><thead><tr><th>Posición</th><th>Identificador</th><th>Categoría</th><th>Ingreso</th><th>Empleado</th><th>Turno</th></tr></thead><tbody>{audit.vehicles.map((vehicle) => <tr key={vehicle.stayId}><td>{vehicle.positionId ?? "Sin asignar"}</td><td>{vehicle.plateFragment}</td><td>{vehicle.category}</td><td>{formatDateTime(vehicle.enteredAt)}</td><td>{vehicle.employeeName}</td><td>{vehicle.shiftId}</td></tr>)}</tbody></table><p>Captura ilustrativa de la demo. Sin verificación criptográfica ni detección física de posiciones.</p></section> : null}
  </div>;
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DemoAudit, DemoShift } from "@/features/estacionamiento/domain/demo.types";

const timestampFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Argentina/Buenos_Aires",
});

function formatArgentinaTimestamp(value: string): string {
  return `${timestampFormatter.format(new Date(value))} ART · Argentina`;
}

function categoryLabel(category: string): string {
  if (category === "auto") return "Auto";
  if (category === "camioneta") return "Camioneta";
  return "Moto";
}

export function AuditReceipt({ audit, shift, printable = false }: Readonly<{ audit: DemoAudit; shift?: DemoShift; printable?: boolean }>) {
  const cars = audit.vehicles.filter((vehicle) => vehicle.category === "auto").length;
  const vans = audit.vehicles.filter((vehicle) => vehicle.category === "camioneta").length;
  const motorcycles = audit.vehicles.filter((vehicle) => vehicle.category === "moto").length;

  return (
    <article className={`${printable ? "audit-print" : ""} grid gap-5 text-foreground`}>
      <header className="grid gap-3 border-b-2 border-primary pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">{audit.parkingName}</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-primary">Auditoría de playa #{audit.number}</h2>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">Emitida<br /><strong className="font-semibold text-foreground">{formatArgentinaTimestamp(audit.createdAt)}</strong></p>
      </header>
      <section aria-label="Resumen de auditoría" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Summary label="Turno" value={shift?.label ?? "Turno histórico"} />
        <Summary label="Empleado" value={audit.employeeName} />
        <Summary label="Total" value={`${audit.vehicles.length} ${audit.vehicles.length === 1 ? "estadía" : "estadías"}`} />
        <Summary label="Por categoría" value={`Auto ${cars} · Camioneta ${vans} · Moto ${motorcycles}`} />
      </section>
      <section aria-labelledby={`audit-list-${audit.id}`} className="grid gap-3">
        <h3 className="font-display text-lg font-bold text-primary" id={`audit-list-${audit.id}`}>Estadías activas al emitir</h3>
        {audit.vehicles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm">No había vehículos estacionados al momento de emisión.</p>
        ) : (
          <ol className="grid gap-2">
            {audit.vehicles.map((vehicle, index) => (
              <li className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center" key={`${vehicle.stayId}-${index}`}>
                <span className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span>
                <div className="min-w-0">
                  <p className="font-mono text-lg font-bold tracking-wide text-primary">{vehicle.plateFragment}</p>
                  <p className="text-xs text-muted-foreground">{categoryLabel(vehicle.category)} · Ingreso {formatArgentinaTimestamp(vehicle.enteredAt)}</p>
                </div>
                <div className="text-xs leading-5 text-muted-foreground sm:text-right">
                  <p>Ticket #{vehicle.ticketNumber}</p>
                  <p className="break-all">ID {vehicle.stayId}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
      <p className="border-t border-border pt-3 text-[11px] text-muted-foreground">Registro operativo de la simulación · Horario de Argentina (ART)</p>
    </article>
  );
}

function Summary({ label, value }: Readonly<{ label: string; value: string }>) {
  return <div className="min-w-0 rounded-xl bg-muted/60 p-3"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>;
}

export function AuditHistoryDialog({ audit, shift }: Readonly<{ audit: DemoAudit; shift?: DemoShift }>) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="mt-2 min-h-11" size="sm" variant="outline">Ver captura</Button></DialogTrigger>
      <DialogContent className="max-h-[min(90dvh,52rem)] max-w-3xl overflow-y-auto rounded-2xl p-4 sm:max-w-3xl sm:p-6">
        <DialogHeader><DialogTitle>Captura histórica · Auditoría #{audit.number}</DialogTitle><DialogDescription>Consulta de solo lectura del estado guardado al momento de emisión.</DialogDescription></DialogHeader>
        <AuditReceipt audit={audit} shift={shift} printable />
      </DialogContent>
    </Dialog>
  );
}

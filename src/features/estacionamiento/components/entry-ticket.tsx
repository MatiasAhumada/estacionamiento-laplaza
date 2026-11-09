"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEMO_LOCALE } from "@/constants/demo.constant";
import type { DemoStay } from "@/features/estacionamiento/domain/demo.types";

const CATEGORY_LABELS: Record<DemoStay["category"], string> = {
  auto: "Auto",
  camioneta: "Camioneta",
  moto: "Moto",
};

function formatEntryDate(date: string): string {
  return new Intl.DateTimeFormat(DEMO_LOCALE, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(date));
}

export function EntryTicket({
  onPrint,
  stay,
}: Readonly<{ onPrint: () => void; stay: DemoStay }>) {
  return (
    <div className="grid gap-4">
      <Card className="entry-ticket-print gap-0 overflow-hidden rounded-2xl border-border bg-white py-0 text-foreground shadow-none">
        <CardContent className="grid gap-5 p-5 sm:p-6">
          <header className="grid gap-1 border-b border-dashed border-border pb-4 text-center">
            <p className="font-display text-lg font-bold tracking-tight text-primary">
              Estacionamiento La Plaza
            </p>
            <p className="text-xs font-semibold tracking-[0.12em] text-secondary uppercase">
              Comprobante de ingreso
            </p>
          </header>
          <dl className="grid gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Operación</dt>
              <dd className="font-mono text-lg font-bold tabular-nums text-primary">
                #{stay.ticketNumber}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Patente</dt>
              <dd className="font-mono text-base font-bold uppercase text-foreground">
                {stay.plateFragment}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-muted-foreground">Categoría</dt>
              <dd className="text-sm font-semibold text-foreground">
                {CATEGORY_LABELS[stay.category]}
              </dd>
            </div>
            <div className="grid gap-1 border-t border-dashed border-border pt-3">
              <dt className="text-xs text-muted-foreground">Fecha y hora de ingreso</dt>
              <dd className="text-sm font-medium tabular-nums text-foreground">
                {formatEntryDate(stay.enteredAt)}
              </dd>
            </div>
          </dl>
          <footer className="border-t border-dashed border-border pt-3 text-center">
            <p className="text-xs font-medium text-primary">Conservá este comprobante</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Comprobante operativo de ingreso. No es una factura ni un comprobante fiscal.
            </p>
          </footer>
        </CardContent>
      </Card>
      <div className="entry-ticket-actions">
        <Button className="min-h-12 w-full rounded-xl sm:w-auto" onClick={onPrint} type="button" variant="action">
          Imprimir comprobante
        </Button>
      </div>
    </div>
  );
}

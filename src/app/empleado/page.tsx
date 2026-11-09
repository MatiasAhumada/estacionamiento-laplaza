import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FUTURE_ACTIONS = [
  { shortcut: "F1", label: "Auto" },
  { shortcut: "F2", label: "Camioneta" },
  { shortcut: "F3", label: "Moto" },
  { shortcut: "F4", label: "Cobrar" },
] as const;

export default function EmployeePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="grid gap-6 rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-10">
        <div className="max-w-2xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-sky-100">
            <span aria-hidden="true" className="size-2 rounded-full bg-action" />
            Terminal de atención · Modo demostración
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Buen día. La playa empieza acá.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-sky-100 sm:text-base">
            Una vista simple para registrar ingresos y cobros cuando se habiliten
            las operaciones de la demo.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-action text-lg font-bold text-action-foreground">
            01
          </span>
          <span className="grid gap-0.5">
            <span className="text-sm font-semibold">Terminal lista</span>
            <span className="text-xs text-sky-100">Operaciones en preparación</span>
          </span>
        </div>
      </section>

      <section aria-labelledby="future-actions-title" className="grid gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">
            Acciones de atención
          </p>
          <h2
            className="font-display mt-1 text-xl font-bold tracking-tight text-primary sm:text-2xl"
            id="future-actions-title"
          >
            Atajos de la terminal
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estas acciones quedarán disponibles en la siguiente etapa.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {FUTURE_ACTIONS.map(({ shortcut, label }) => (
            <Card className="gap-4 rounded-2xl border-border/80 py-4" key={shortcut} size="sm">
              <CardHeader className="grid-cols-[auto_1fr] items-center gap-3 px-4">
                <span className="font-display grid size-11 place-items-center rounded-xl bg-muted text-sm font-bold text-primary">
                  {shortcut}
                </span>
                <div className="grid gap-1">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <CardDescription className="text-xs">Próximamente</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <Button className="min-h-11 w-full rounded-xl" disabled variant="outline">
                  No disponible aún
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <p className="mt-auto border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
        La Plaza es una simulación visual. No controla barreras, espacios ni
        dispositivos físicos.
      </p>
    </main>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ADMIN_MODULES = [
  {
    number: "01",
    title: "Ocupación",
    description: "Estado de la playa y estadías activas.",
  },
  {
    number: "02",
    title: "Movimientos",
    description: "Ingresos, cobros y egresos de la demo.",
  },
  {
    number: "03",
    title: "Caja y reportes",
    description: "Turnos, arqueos y recaudación simulada.",
  },
] as const;

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="max-w-3xl">
        <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">
          Centro de control
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Todo a la vista.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Un espacio para supervisar la operación y consultar sus movimientos.
          Los datos simulados se incorporarán en las próximas etapas.
        </p>
      </section>

      <section aria-label="Módulos administrativos" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ADMIN_MODULES.map(({ number, title, description }) => (
          <Card className="rounded-2xl border-border/80 py-5" key={number}>
            <CardHeader className="gap-4 px-5">
              <span className="font-display grid size-10 place-items-center rounded-xl bg-accent/50 text-sm font-bold text-primary">
                {number}
              </span>
              <div className="grid gap-1.5">
                <CardTitle className="font-display text-lg font-bold text-primary">
                  {title}
                </CardTitle>
                <CardDescription className="leading-5">{description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-5">
              <div className="flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-border bg-muted/60 px-3 text-xs font-medium text-muted-foreground">
                <span aria-hidden="true" className="size-2 rounded-full bg-action" />
                Disponible en otra etapa
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <aside className="mt-auto rounded-2xl border border-secondary/20 bg-secondary/10 p-4 sm:p-5">
        <p className="text-sm font-semibold text-primary">Entorno de demostración</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Este rol solo cambia la vista. No es un inicio de sesión y no aplica
          permisos reales.
        </p>
      </aside>
    </main>
  );
}

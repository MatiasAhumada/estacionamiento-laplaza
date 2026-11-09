import Link from "next/link";

import { DemoHeader } from "@/components/shared/demo-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

function getRoleButtonVariant(href: string): "action" | "brand" {
  if (href === ROUTES.EMPLOYEE) {
    return "action";
  }

  return "brand";
}

const DEMO_ROLES = [
  {
    eyebrow: "Atención en playa",
    title: "Terminal de empleado",
    description:
      "Una pantalla directa para las tareas de ingreso y cobro del turno.",
    href: ROUTES.EMPLOYEE,
    action: "Ver terminal",
    key: "F1–F4",
  },
  {
    eyebrow: "Supervisión",
    title: "Administración",
    description:
      "Un espacio para revisar ocupación, movimientos, caja y reportes.",
    href: ROUTES.ADMIN,
    action: "Ver administración",
    key: "PANEL",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-16">
        <section className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1.5 text-xs font-bold tracking-wide text-primary">
            <span aria-hidden="true" className="size-2 rounded-full bg-action" />
            Demo frontend · La Plaza
          </p>
          <h1 className="font-display mt-5 text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Una playa. Cada movimiento en orden.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Recorré la experiencia de atención y administración de un
            estacionamiento operado por personas. Elegí una vista para comenzar.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="rounded-lg bg-card px-3 py-2 shadow-sm">Ingreso</span>
            <span aria-hidden="true" className="text-secondary">→</span>
            <span className="rounded-lg bg-card px-3 py-2 shadow-sm">Estadía</span>
            <span aria-hidden="true" className="text-secondary">→</span>
            <span className="rounded-lg bg-card px-3 py-2 shadow-sm">Cobro</span>
            <span aria-hidden="true" className="text-secondary">→</span>
            <span className="rounded-lg bg-card px-3 py-2 shadow-sm">Egreso</span>
          </div>
        </section>

        <section aria-label="Elegí una vista de la demo" className="grid gap-4">
          {DEMO_ROLES.map(({ eyebrow, title, description, href, action, key }) => (
            <Card className="rounded-2xl border-border/80 py-5 shadow-sm" key={href}>
              <CardHeader className="grid-cols-[auto_1fr] items-start gap-4 px-5 sm:px-6">
                <span className="font-display grid size-12 place-items-center rounded-2xl bg-primary text-xs font-bold tracking-wide text-primary-foreground">
                  {key}
                </span>
                <div className="grid gap-1.5">
                  <p className="text-xs font-bold tracking-[0.12em] text-secondary uppercase">
                    {eyebrow}
                  </p>
                  <CardTitle className="font-display text-lg font-bold text-primary sm:text-xl">
                    {title}
                  </CardTitle>
                  <CardDescription className="leading-5">
                    {description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-5 sm:px-6">
                <Button
                  asChild
                  className="min-h-12 w-full rounded-xl sm:w-auto"
                  variant={getRoleButtonVariant(href)}
                >
                  <Link href={href}>{action}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          <p className="rounded-2xl border border-action/40 bg-action/15 px-4 py-3 text-sm leading-6 text-primary">
            El selector de rol es una simulación visual. No representa
            autenticación ni permisos de acceso.
          </p>
        </section>
      </main>
      <footer className="border-t border-border bg-card px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        Estacionamiento La Plaza · Herramienta de demostración
      </footer>
    </div>
  );
}

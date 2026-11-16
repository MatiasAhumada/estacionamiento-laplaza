"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingBrand } from "@/components/shared/parking-brand";
import {
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_USERNAME,
  DEMO_EMPLOYEE_PASSWORD,
} from "@/constants/demo.constant";
import { ROUTES } from "@/constants/routes";
import { useDemoAuth } from "@/features/estacionamiento/auth/demo-auth-provider";
import { useDemoState } from "@/features/estacionamiento/demo/demo-provider";
import type { DemoLoginCredentials } from "@/features/estacionamiento/auth/demo-session.types";

const REDIRECT_BY_ROLE = {
  admin: ROUTES.ADMIN,
  empleado: ROUTES.EMPLOYEE,
} as const;

export function DemoLogin() {
  const router = useRouter();
  const { isSessionReady, sessionUser, authenticate } = useDemoAuth();
  const { isHydrated: isDemoStateReady, state } = useDemoState();
  const [credentials, setCredentials] = useState<DemoLoginCredentials>({
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const activeEmployeeNames = state.employees
    .filter((employee) => employee.active)
    .map((employee) => employee.displayName);

  useEffect(() => {
    if (isSessionReady && isDemoStateReady && sessionUser) {
      router.replace(REDIRECT_BY_ROLE[sessionUser.role]);
    }
  }, [isDemoStateReady, isSessionReady, router, sessionUser]);

  function updateCredentials(field: keyof DemoLoginCredentials, value: string) {
    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [field]: value,
    }));
    setErrorMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const result = authenticate(credentials, state.employees);

    if (result.status === "invalid-credentials") {
      setErrorMessage(
        "No encontramos esa cuenta de demostración. Revisá la identificación y la credencial.",
      );
      setSubmitting(false);
      return;
    }

    if (result.status === "storage-unavailable") {
      setErrorMessage(
        "El navegador no pudo guardar la sesión en esta pestaña. Habilitá el almacenamiento e intentá de nuevo.",
      );
      setSubmitting(false);
      return;
    }

    router.replace(REDIRECT_BY_ROLE[result.user.role]);
  }

  if (!isSessionReady || !isDemoStateReady || sessionUser) {
    return (
      <main
        aria-live="polite"
        className="grid min-h-screen place-items-center px-6 py-10"
      >
        <div className="text-center">
          <span
            aria-hidden="true"
            className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-primary font-display text-lg font-bold text-primary-foreground"
          >
            LP
          </span>
          <p className="font-display font-bold text-primary">
            Preparando el acceso
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="px-4 py-4 sm:px-8 sm:py-6">
        <div className="mx-auto w-full max-w-6xl">
          <ParkingBrand />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 sm:px-8 sm:pb-12 lg:justify-center">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-primary/5 lg:grid-cols-[1fr_0.92fr]">
          <section className="relative flex min-h-56 flex-col justify-between overflow-hidden bg-primary px-6 py-7 text-primary-foreground sm:min-h-64 sm:px-10 sm:py-10 lg:min-h-[39rem] lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full border-[36px] border-secondary/20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-36 -left-20 size-72 rounded-full border-[36px] border-white/5"
            />
            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] uppercase">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-warning"
                />
                Operación de playa
              </p>
              <h1 className="font-display mt-6 max-w-lg text-3xl font-bold leading-tight tracking-tight sm:mt-8 sm:text-4xl lg:text-5xl">
                Cada turno empieza por acá.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
                Ingresos, cobros y consultas organizados para el equipo de
                Estacionamiento La Plaza.
              </p>
            </div>
            <div
              className="relative mt-8 grid grid-cols-3 gap-2 sm:mt-12 sm:gap-3"
              aria-label="Flujo de la demo"
            >
              {[
                { number: "01", label: "Ingreso" },
                { number: "02", label: "Estadía" },
                { number: "03", label: "Egreso" },
              ].map(({ number, label }) => (
                <div
                  className="rounded-2xl border border-white/15 bg-white/10 p-3 sm:p-4"
                  key={number}
                >
                  <p className="font-display text-xs font-bold text-accent">
                    {number}
                  </p>
                  <p className="mt-2 text-xs font-semibold sm:text-sm">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col justify-center p-5 sm:p-9 lg:p-12">
            <Card className="border-0 bg-transparent py-0 shadow-none">
              <CardHeader className="px-0 pb-6">
                <p className="text-xs font-bold tracking-[0.14em] text-secondary uppercase">
                  Acceso de demostración
                </p>
                <CardTitle className="font-display mt-2 text-2xl font-bold text-primary sm:text-3xl">
                  Ingresá a tu espacio
                </CardTitle>
                <CardDescription className="max-w-sm text-sm leading-6">
                  Usá la cuenta de administración o el nombre de un empleado
                  activo.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <form className="grid gap-5" onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="demo-username">Identificación</Label>
                    <Input
                      autoComplete="username"
                      className="min-h-12 rounded-xl px-4"
                      id="demo-username"
                      name="username"
                      onChange={(event) =>
                        updateCredentials("username", event.currentTarget.value)
                      }
                      placeholder="Nombre de empleado o admin"
                      aria-describedby="demo-login-error"
                      aria-invalid={Boolean(errorMessage)}
                      required
                      value={credentials.username}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="demo-password">Credencial de demo</Label>
                    <Input
                      autoComplete="current-password"
                      className="min-h-12 rounded-xl px-4"
                      id="demo-password"
                      name="password"
                      onChange={(event) =>
                        updateCredentials("password", event.currentTarget.value)
                      }
                      aria-describedby="demo-login-error"
                      aria-invalid={Boolean(errorMessage)}
                      required
                      type="password"
                      value={credentials.password}
                    />
                  </div>
                  <p
                    aria-live="polite"
                    className="min-h-5 text-sm font-medium text-destructive"
                    id="demo-login-error"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                  <Button
                    aria-describedby="demo-login-error"
                    className="min-h-12 w-full rounded-xl"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? "Ingresando…" : "Ingresar"}
                  </Button>
                </form>

                <div className="mt-7 rounded-2xl border border-border bg-background p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-9 shrink-0 place-items-center rounded-xl bg-warning/30 text-sm font-bold text-primary"
                    >
                      i
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary">
                        Cuentas para probar
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Administración:{" "}
                        <span className="font-semibold text-foreground">
                          {DEMO_ADMIN_USERNAME}
                        </span>{" "}
                        /{" "}
                        <span className="font-semibold text-foreground">
                          {DEMO_ADMIN_PASSWORD}
                        </span>
                      </p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Empleado activo: nombre registrado /{" "}
                        <span className="font-semibold text-foreground">
                          {DEMO_EMPLOYEE_PASSWORD}
                        </span>
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {activeEmployeeNames.length
                          ? activeEmployeeNames.join(" · ")
                          : "No hay empleados activos en esta demo."}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
                  Sesión solo en esta pestaña. La protección frontend puede
                  eludirse; un sistema real requiere autenticación y
                  autorización en servidor.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
      <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-8">
        Estacionamiento La Plaza · Entorno de demostración
      </footer>
    </main>
  );
}

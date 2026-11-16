"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { DemoRole } from "./demo-session.types";
import { useDemoAuth } from "./demo-auth-provider";

export function DemoRouteGuard({
  children,
  requiredRole,
}: Readonly<{ children: React.ReactNode; requiredRole: DemoRole }>) {
  const router = useRouter();
  const { isSessionReady, sessionUser } = useDemoAuth();
  let hasAccess = false;

  if (isSessionReady && sessionUser) {
    hasAccess = sessionUser.role === requiredRole;
  }

  useEffect(() => {
    if (isSessionReady && !hasAccess) {
      router.replace("/");
    }
  }, [hasAccess, isSessionReady, router]);

  if (!hasAccess) {
    return (
      <main
        aria-live="polite"
        className="grid min-h-screen place-items-center px-6 py-10"
      >
        <div className="flex max-w-sm flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="mb-5 grid size-14 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
          >
            LP
          </span>
          <p className="font-display text-lg font-bold text-primary">
            Verificando tu sesión
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Preparando la vista de demostración.
          </p>
        </div>
      </main>
    );
  }

  return children;
}

"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useDemoAuth } from "@/features/estacionamiento/auth/demo-auth-provider";

export function DemoSessionControl() {
  const router = useRouter();
  const { sessionUser, logout } = useDemoAuth();

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="min-w-0 text-right">
        <p className="max-w-40 truncate text-xs font-bold text-primary sm:max-w-none sm:text-sm">
          {sessionUser?.name}
        </p>
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {sessionUser?.role}
        </p>
      </div>
      <Button
        className="min-h-11 rounded-xl px-3"
        onClick={handleLogout}
        variant="outline"
      >
        Cerrar sesión
      </Button>
    </div>
  );
}

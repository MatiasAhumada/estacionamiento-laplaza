import Link from "next/link";
import { cn } from "@/lib/utils";

import { ROUTES } from "@/constants/routes";

function getBrandTextClass(inverted: boolean): string {
  return inverted ? "text-white" : "text-primary";
}

function getBrandSubtitleClass(inverted: boolean): string {
  return inverted ? "text-sky-100" : "text-muted-foreground";
}

export function ParkingBrand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      aria-label="Estacionamiento La Plaza, inicio de la demo"
      className="group inline-flex min-h-12 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      href={ROUTES.HOME}
    >
      <span
        aria-hidden="true"
        className="font-display flex size-11 items-center justify-center rounded-xl bg-action text-2xl font-extrabold text-action-foreground shadow-sm"
      >
        E
      </span>
      <span className="grid text-left">
        <span
          className={cn(
            "font-display text-base font-bold leading-tight tracking-tight",
            getBrandTextClass(inverted),
          )}
        >
          La Plaza
        </span>
        <span className={cn("text-xs", getBrandSubtitleClass(inverted))}>
          Estacionamiento
        </span>
      </span>
    </Link>
  );
}

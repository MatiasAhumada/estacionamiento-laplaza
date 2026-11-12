"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, ParkingAreaCircleIcon, Settings01Icon, Wallet01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

const ADMIN_SECTIONS = [
  { href: "/admin", label: "Inicio", icon: Home01Icon },
  { href: "/admin/ocupacion", label: "Ocupación", icon: ParkingAreaCircleIcon },
  { href: "/admin/turnos-cajas", label: "Turnos y Cajas", icon: Wallet01Icon },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings01Icon },
] as const;

export function AdminSectionNavigation({ compact = false }: Readonly<{ compact?: boolean }>) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones de administración"
      className={cn(compact ? "grid grid-cols-4 gap-1" : "grid gap-1.5")}
    >
      {ADMIN_SECTIONS.map(({ href, label, icon }) => {
        const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        let ariaCurrent: "page" | undefined;

        if (isActive) {
          ariaCurrent = "page";
        }

        return (
          <Link aria-current={ariaCurrent} className={cn(
            "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
            compact && "flex-col justify-center gap-1 px-1 py-2 text-center text-[11px]",
            isActive ? "bg-sidebar-primary text-primary shadow-sm" : "text-sky-50/80 hover:bg-sidebar-accent hover:text-white",
          )} href={href} key={href}>
            <HugeiconsIcon icon={icon} size={19} strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

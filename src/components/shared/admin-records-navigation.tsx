"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

const RECORD_SECTIONS = [
  { href: "/admin/movimientos", label: "Movimientos" },
  { href: "/admin/caja", label: "Caja y arqueos" },
  { href: "/admin/reportes", label: "Reportes" },
] as const;

export function AdminRecordsNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Historial, caja y reportes" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {RECORD_SECTIONS.map(({ href, label }) => {
        const isActive = pathname === href;
        let ariaCurrent: "page" | undefined;

        if (isActive) {
          ariaCurrent = "page";
        }

        return (
          <Button
            asChild
            className="min-h-11 rounded-xl"
            key={href}
            variant={isActive ? "brand" : "outline"}
          >
            <Link aria-current={ariaCurrent} href={href}>{label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}

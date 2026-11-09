"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DEMO_NAVIGATION } from "@/constants/routes";
import { cn } from "@/lib/utils";

type DemoRoleNavigationProps = {
  orientation?: "horizontal" | "vertical";
  tone?: "light" | "dark";
};

function isCurrentRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

function getLinkVariant(currentRoute: boolean, isDark: boolean) {
  if (currentRoute && isDark) {
    return "brand";
  }

  if (currentRoute) {
    return "default";
  }

  return "ghost";
}

function getOrientationClass(isVertical: boolean): string {
  if (isVertical) {
    return "w-full";
  }

  return "grid-cols-3 sm:flex sm:items-center";
}

export function DemoRoleNavigation({
  orientation = "horizontal",
  tone = "light",
}: DemoRoleNavigationProps) {
  const pathname = usePathname();
  const isVertical = orientation === "vertical";
  const isDark = tone === "dark";

  return (
    <nav
      aria-label="Navegación de la demo"
      className={cn(
        "grid gap-1.5",
        getOrientationClass(isVertical),
      )}
    >
      {DEMO_NAVIGATION.map(({ href, label }) => {
        const currentRoute = isCurrentRoute(pathname, href);
        let ariaCurrent: "page" | undefined;

        if (currentRoute) {
          ariaCurrent = "page";
        }

        return (
          <Button
            key={href}
            asChild
            className={cn(
              "min-h-11 rounded-xl px-3 text-xs sm:text-sm",
              isVertical && "w-full justify-start px-4",
              isDark && !currentRoute && "text-white/85 hover:bg-white/10 hover:text-white",
            )}
            variant={getLinkVariant(currentRoute, isDark)}
          >
            <Link aria-current={ariaCurrent} href={href}>
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { ParkingBrand } from "@/components/shared/parking-brand";
import { AdminSectionNavigation } from "@/components/shared/admin-section-navigation";
import { DemoResetControl } from "@/components/shared/demo-reset-control";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="hidden bg-sidebar px-4 py-7 text-sidebar-foreground lg:flex lg:flex-col">
        <div className="px-2"><ParkingBrand inverted /></div>
        <div className="mt-10 border-t border-sidebar-border pt-6">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-sky-100/60 uppercase">Administración</p>
          <AdminSectionNavigation />
        </div>
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent p-4">
          <p className="text-xs font-semibold text-white">Modo demostración</p>
          <p className="mt-1 text-xs leading-5 text-sky-100/80">Datos compartidos con la terminal del empleado.</p>
          <Link className="mt-3 inline-block text-xs font-bold text-action underline-offset-4 hover:underline" href="/empleado">Ir a terminal →</Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-7 lg:px-9">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="lg:hidden"><ParkingBrand /></div>
            <div className="hidden lg:block"><p className="text-[11px] font-bold tracking-[0.16em] text-secondary uppercase">La Plaza / Administración</p><p className="mt-1 text-xs text-muted-foreground">Centro de gestión · Demo interactiva</p></div>
            <div className="flex items-center gap-2">
              <Link className="rounded-full border border-border bg-muted px-3 py-2 text-xs font-semibold text-primary hover:bg-accent lg:hidden" href="/empleado">Terminal</Link>
              <DemoResetControl />
              <span className="hidden rounded-full border border-action/40 bg-action/15 px-3 py-1.5 text-xs font-semibold text-primary sm:inline-block">● Simulación</span>
            </div>
          </div>
        </header>
        <div className="bg-sidebar px-2 py-2 lg:hidden"><AdminSectionNavigation compact /></div>
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-7 lg:px-9 lg:py-9">{children}</main>
      </div>
    </div>
  );
}

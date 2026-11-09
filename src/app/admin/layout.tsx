import { DemoHeader } from "@/components/shared/demo-header";
import { DemoRoleNavigation } from "@/components/shared/demo-role-navigation";
import { ParkingBrand } from "@/components/shared/parking-brand";
import { AdminRecordsNavigation } from "@/components/shared/admin-records-navigation";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden bg-sidebar px-5 py-6 text-sidebar-foreground lg:flex lg:flex-col">
        <ParkingBrand inverted />
        <div className="my-8 border-t border-sidebar-border" />
        <p className="mb-3 px-3 text-[0.65rem] font-bold tracking-[0.16em] text-sky-100/75 uppercase">
          Vistas de la demo
        </p>
        <DemoRoleNavigation orientation="vertical" tone="dark" />
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent p-4">
          <p className="text-xs font-semibold text-white">Modo simulación</p>
          <p className="mt-1 text-xs leading-5 text-sky-100">
            El selector de vistas no verifica identidad ni permisos.
          </p>
        </div>
      </aside>
      <div className="flex min-h-screen flex-col">
        <div className="lg:hidden">
          <DemoHeader compact />
        </div>
        <header className="hidden items-center justify-between border-b border-border bg-card px-8 py-4 lg:flex">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-secondary uppercase">
              Administración
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Resumen general de la demo
            </p>
          </div>
          <span className="rounded-full border border-action/50 bg-action/20 px-3 py-1.5 text-xs font-semibold text-primary">
            Simulación · Sin autenticación
          </span>
        </header>
        <div className="mx-auto w-full max-w-5xl px-4 pt-5 sm:px-6 lg:px-8"><AdminRecordsNavigation /></div>
        {children}
      </div>
    </div>
  );
}

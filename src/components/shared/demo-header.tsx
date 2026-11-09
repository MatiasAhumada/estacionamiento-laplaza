import { DemoRoleNavigation } from "@/components/shared/demo-role-navigation";
import { ParkingBrand } from "@/components/shared/parking-brand";

type DemoHeaderProps = {
  compact?: boolean;
};

function getHeaderContext(compact: boolean): string {
  if (compact) {
    return "Vista de administración";
  }

  return "Entorno de demostración";
}

export function DemoHeader({ compact = false }: DemoHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <ParkingBrand />
          <span className="rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.12em] text-primary uppercase sm:hidden">
            Demo
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <p className="hidden text-xs text-muted-foreground sm:block">
            {getHeaderContext(compact)}
          </p>
          <DemoRoleNavigation />
        </div>
      </div>
      <p className="border-t border-border/70 px-4 py-2 text-center text-xs text-muted-foreground sm:hidden">
        Simulación de roles · No es autenticación
      </p>
    </header>
  );
}

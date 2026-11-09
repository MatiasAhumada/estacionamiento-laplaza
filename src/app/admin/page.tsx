import { CashRegister } from "@/features/estacionamiento/components/cash-register";
import { AdminDashboard } from "@/features/estacionamiento/components/admin-dashboard";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <AdminDashboard />
      <section aria-labelledby="cash-register-heading" className="grid gap-4" id="caja">
        <div className="max-w-2xl">
          <h2 className="font-display text-xl font-bold tracking-tight text-primary" id="cash-register-heading">Caja de la jornada</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            Consultá los cobros del turno, registrá movimientos de efectivo y realizá el arqueo de cierre.
          </p>
        </div>
        <CashRegister />
      </section>
      <aside className="mt-auto rounded-2xl border border-secondary/20 bg-secondary/10 p-4 sm:p-5">
        <p className="text-sm font-semibold text-primary">Entorno de demostración</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Los importes y las operaciones se guardan durante la sesión actual de esta demo. El selector de rol no representa autenticación.
        </p>
      </aside>
    </main>
  );
}

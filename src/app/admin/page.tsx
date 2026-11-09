import { CashRegister } from "@/features/estacionamiento/components/cash-register";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">Centro de control</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Caja de la jornada</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Consultá los cobros del turno, registrá movimientos de efectivo y realizá el arqueo de cierre.
        </p>
      </section>
      <CashRegister />
      <aside className="mt-auto rounded-2xl border border-secondary/20 bg-secondary/10 p-4 sm:p-5">
        <p className="text-sm font-semibold text-primary">Entorno de demostración</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Los importes y las operaciones se guardan durante la sesión actual de esta demo. El selector de rol no representa autenticación.
        </p>
      </aside>
    </main>
  );
}

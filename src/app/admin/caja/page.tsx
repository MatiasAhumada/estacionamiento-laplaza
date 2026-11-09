import { redirect } from "next/navigation";

export default function CashPage() {
  redirect("/admin/turnos-cajas?tab=caja");
}

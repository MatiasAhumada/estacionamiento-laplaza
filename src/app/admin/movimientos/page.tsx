import { redirect } from "next/navigation";

export default function MovementsPage() {
  redirect("/admin/turnos-cajas?tab=reportes&vista=movimientos");
}

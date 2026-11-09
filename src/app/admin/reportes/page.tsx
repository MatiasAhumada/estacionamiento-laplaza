import { redirect } from "next/navigation";

export default function ReportsPage() {
  redirect("/admin/turnos-cajas?tab=reportes");
}

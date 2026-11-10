import { OccupancyMap } from "@/features/estacionamiento/components/occupancy-map";

export default async function OccupancyPage({ searchParams }: Readonly<{ searchParams: Promise<{ modo?: string }> }>) {
  const params = await searchParams;
  return <OccupancyMap auditMode={params.modo === "auditoria"} />;
}

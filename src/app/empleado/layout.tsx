import { DemoHeader } from "@/components/shared/demo-header";
import { DemoRouteGuard } from "@/features/estacionamiento/auth/demo-route-guard";

export default function EmployeeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DemoRouteGuard requiredRole="empleado">
      <div className="flex min-h-screen flex-col">
        <DemoHeader />
        {children}
      </div>
    </DemoRouteGuard>
  );
}

import { DemoHeader } from "@/components/shared/demo-header";

export default function EmployeeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoHeader />
      {children}
    </div>
  );
}

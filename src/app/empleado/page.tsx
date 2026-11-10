import { EmployeeTerminal } from "@/features/estacionamiento/components/employee-terminal";
import { CashRegister } from "@/features/estacionamiento/components/cash-register";

export default function EmployeePage() {
  return <><EmployeeTerminal /><section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8" id="caja-turno"><CashRegister /></section></>;
}

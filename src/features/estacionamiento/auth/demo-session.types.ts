export type DemoRole = "admin" | "empleado";

export interface DemoSessionUser {
  employeeId?: string;
  name: string;
  role: DemoRole;
}

export interface DemoLoginCredentials {
  username: string;
  password: string;
}

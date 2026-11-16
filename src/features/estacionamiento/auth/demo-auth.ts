import { z } from "zod";

import {
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_USERNAME,
  DEMO_EMPLOYEE_PASSWORD,
} from "@/constants/demo.constant";
import type { DemoEmployee } from "../domain/demo.types";
import type {
  DemoLoginCredentials,
  DemoSessionUser,
} from "./demo-session.types";

const demoSessionSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("admin"), name: z.string().min(1) }),
  z.object({
    role: z.literal("empleado"),
    name: z.string().min(1),
    employeeId: z.string().min(1),
  }),
]);

const demoCredentialsSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export function resolveDemoSessionUser(
  credentials: DemoLoginCredentials,
  employees: DemoEmployee[],
): DemoSessionUser | undefined {
  const parsedCredentials = demoCredentialsSchema.safeParse(credentials);

  if (!parsedCredentials.success) {
    return undefined;
  }

  const username = parsedCredentials.data.username;
  const password = parsedCredentials.data.password;

  if (
    username.toLocaleLowerCase("es-AR") === DEMO_ADMIN_USERNAME &&
    password === DEMO_ADMIN_PASSWORD
  ) {
    return { role: "admin", name: "Administración" };
  }

  if (password !== DEMO_EMPLOYEE_PASSWORD) {
    return undefined;
  }

  const normalizedUsername = normalizeEmployeeName(username);
  const employee = employees.find((candidate) => {
    if (!candidate.active) {
      return false;
    }

    return normalizeEmployeeName(candidate.displayName) === normalizedUsername;
  });

  if (!employee) {
    return undefined;
  }

  return {
    role: "empleado",
    name: employee.displayName,
    employeeId: employee.id,
  };
}

export function parseDemoSession(
  serializedSession: string,
): DemoSessionUser | undefined {
  let parsedSession: unknown;

  try {
    parsedSession = JSON.parse(serializedSession);
  } catch {
    return undefined;
  }

  const validatedSession = demoSessionSchema.safeParse(parsedSession);

  if (!validatedSession.success) {
    return undefined;
  }

  return validatedSession.data;
}

function normalizeEmployeeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLocaleLowerCase("es-AR");
}

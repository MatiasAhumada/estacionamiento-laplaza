export const ROUTES = {
  HOME: "/",
  EMPLOYEE: "/empleado",
  ADMIN: "/admin",
} as const;

export const DEMO_NAVIGATION = [
  { href: ROUTES.HOME, label: "Inicio" },
  { href: ROUTES.EMPLOYEE, label: "Terminal" },
  { href: ROUTES.ADMIN, label: "Administración" },
] as const;

export const API_ROUTES = {
  AUTH: {
    SESSION: "/api/session",
  },
  USERS: "/api/users",
} as const;

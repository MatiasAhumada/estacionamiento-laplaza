import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEMO_SEED_STATE } from "@/constants/demo-fixture.constant";
import {
  DEMO_ADMIN_PASSWORD,
  DEMO_EMPLOYEE_PASSWORD,
} from "@/constants/demo.constant";
import { parseDemoSession, resolveDemoSessionUser } from "./demo-auth";

describe("acceso a la demo por rol", () => {
  it("valida el usuario administrador y su destino", () => {
    assert.deepEqual(
      resolveDemoSessionUser(
        { username: "admin", password: DEMO_ADMIN_PASSWORD },
        DEMO_SEED_STATE.employees,
      ),
      { role: "admin", name: "Administración" },
    );
  });

  it("valida empleados activos por su nombre y conserva su identidad", () => {
    assert.deepEqual(
      resolveDemoSessionUser(
        { username: "ana gomez", password: DEMO_EMPLOYEE_PASSWORD },
        DEMO_SEED_STATE.employees,
      ),
      { role: "empleado", name: "Ana Gómez", employeeId: "employee-ana" },
    );
  });

  it("rechaza contraseñas incorrectas, usuarios ausentes y empleados inactivos", () => {
    assert.equal(
      resolveDemoSessionUser(
        { username: "admin", password: "incorrecta" },
        DEMO_SEED_STATE.employees,
      ),
      undefined,
    );
    assert.equal(
      resolveDemoSessionUser(
        { username: "cuenta-inexistente", password: DEMO_EMPLOYEE_PASSWORD },
        DEMO_SEED_STATE.employees,
      ),
      undefined,
    );
    assert.equal(
      resolveDemoSessionUser(
        { username: "Empleada inactiva", password: DEMO_EMPLOYEE_PASSWORD },
        [
          {
            id: "employee-disabled",
            displayName: "Empleada inactiva",
            active: false,
          },
        ],
      ),
      undefined,
    );
  });

  it("valida sesiones restauradas y descarta datos mal formados", () => {
    assert.deepEqual(
      parseDemoSession('{"role":"admin","name":"Administración"}'),
      {
        role: "admin",
        name: "Administración",
      },
    );
    assert.equal(
      parseDemoSession('{"role":"empleado","name":"Empleado"}'),
      undefined,
    );
    assert.equal(parseDemoSession("no es json"), undefined);
  });
});

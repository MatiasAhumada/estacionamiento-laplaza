# Modelo de datos propuesto para la demo

> Contrato de planificación inicial. Para los tipos implementados y las extensiones de gastos, auditorías y posiciones simuladas, consultar [Panel administrativo 2026-11-09](admin-frontend-2026-11-09.md) y `src/features/estacionamiento/domain/demo.types.ts`.

Estos contratos **no existen aún**. El ticket de estado compartido los creará sin Prisma. Usar centavos ARS enteros, fechas ISO e `Intl.DateTimeFormat` con `es-AR` para presentación.

| Entidad | Campos mínimos | Relación |
| --- | --- | --- |
| `DemoEmployee` | `id`, `displayName`, `active` | Referido por turnos y movimientos; lista sin límite arbitrario. |
| `DemoShift` | `id`, `employeeId`, `openedAt`, `closedAt?`, `openingCashCents`, `status` | Agrupa cobros, ajustes y arqueos. |
| `DemoStay` | `id`, `ticketNumber`, `plateFragment`, `category`, `enteredAt`, `enteredByEmployeeId`, `shiftId`, `status`, `exitedAt?` | ID único independiente del texto parcial. |
| `DemoPayment` | `id`, `stayId`, `shiftId`, `method`, `totalCents`, `receivedCents?`, `changeCents`, `netCents`, `paidAt`, `employeeId` | Máximo uno por estadía. |
| `DemoMovement` | `id`, `kind`, `stayId?`, `shiftId`, `employeeId`, `occurredAt`, `paymentId?`, `amountCents?` | Secuencia auditable. |
| `DemoCashAdjustment` | `id`, `shiftId`, `employeeId`, `direction`, `amountCents`, `reason`, `occurredAt` | Solo efectivo físico. |
| `DemoCashCount` | `id`, `shiftId`, `employeeId`, `countedCents`, `expectedCents`, `differenceCents`, `createdAt` | Instantánea de arqueo. |
| `DemoInvoiceRequest` | `id`, `stayId`, `status`, `requestedAt` | Solicitud visual, no factura/CAE. |
| `DemoTariff` | `category`, `hourlyCents`, `fractionMinutes`, `effectiveFrom` | Parámetros ilustrativos editables. |
| `DemoSettings` | `capacity`, `connectionScenario` | Capacidad y conexión ilustrativas. |

IDs locales: `crypto.randomUUID()` en acciones cliente; `ticketNumber` secuencial dentro del fixture. Normalizar fragmento a mayúsculas, permitir A-Z/0-9, exigir al menos un carácter; comunicar cualquier limpieza de espacios. No imponer formato argentino. El texto parcial nunca es clave única.

## Cálculo ilustrativo

Propuesta para demo, no tarifa contractual: minutos facturables = máximo de 1 y diferencia positiva entre salida e ingreso; bloques = `ceil(minutos / fractionMinutes)`; total en centavos = bloques × tarifa por bloque. Fixture inicial `fractionMinutes = 30`; auto $2.160/h, camioneta $2.800/h y moto $1.200/h, solo como ejemplos visuales tomados de Stitch. Auto 3 h 30 min = $7.560. No aplicar tolerancia gratuita de 15 minutos mostrada en una variante antigua: no fue confirmada. Registrar tarifa aplicada al liquidar para que el historial no cambie si se edita la tarifa.

## Fuente única, almacenamiento y reinicio

Propuesta: `DemoProvider` cliente con reducer y acciones de dominio; vistas leen selectores derivados. Semilla única con empleados, turno, estadías y pagos históricos internamente coherentes. Guardar estado versionado en `sessionStorage` para conservar navegación y recarga en la misma pestaña; otras pestañas son independientes. Mostrar hidratación antes de operar. «Reiniciar demo» con confirmación borra la clave versionada y restaura semilla. Sin persistencia segura, concurrencia entre pestañas ni operación offline real. Los componentes consumen acciones/selectores, preparados para cambiar el origen de datos posteriormente.

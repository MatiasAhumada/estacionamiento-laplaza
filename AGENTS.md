<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Estacionamiento La Plaza

Playa tradicional atendida por empleados. La demo frontend demostrará **ingreso → estadía → cobro → egreso**, caja/arqueo y administración con una fuente única de datos simulados. No existen barreras, cámaras, sensores, OCR ni asignación automática de cocheras en el alcance.

Roles: **empleado** (terminal simple con F1 Auto, F2 Camioneta, F3 Moto y F4 Cobrar; operaciones por modales y emisión de auditoría textual) y **administrador** (estadísticas y lista textual de ocupación en Inicio, movimientos, empleados, tarifas, caja y reportes). Se planifica un login compartido por rol solo para la demo frontend, sin prometer autenticación segura de producción; no hay límite arbitrario de empleados. La nueva decisión elimina el mapa y la asignación de cocheras.

Reglas críticas: patente **parcial alfanumérica** normalizada a mayúsculas, sin máscara argentina ni unicidad; cada estadía tiene ID independiente. Coincidencias ambiguas exigen elección explícita. Efectivo es predeterminado; se registra recibido, vuelto y neto. Débito y transferencia son confirmaciones simuladas. Ticket de ingreso es operativo. La solicitud opcional de factura al egreso no emite comprobante fiscal ni CAE.

La referencia visual está en `recursos/`, pero los HTML de Stitch no son código fuente ni autoridad funcional. Paleta del producto: `#023047`, `#219EBC`, `#8ECAE6`, `#FFB703`, `#FB8500`, blanco, `#F4F7F9` y `#253341`, mediante tokens semánticos y shadcn/ui. La terminal prioriza escritorio y cuatro acciones; administración es mobile first.

**Alcance actual:** documentación y tickets. La implementación posterior será solo frontend y datos simulados. No crear APIs, backend de negocio, persistencia Prisma/PostgreSQL, migraciones, ARCA, sincronización offline real ni servicios externos. Migraciones futuras solo mediante `pnpm prisma migrate dev --name nombre_migracion` contra desarrollo, nunca editadas manualmente.

Antes de implementar, leer el ticket completo en Jira, [docs/estacionamiento/README.md](docs/estacionamiento/README.md), [cambios frontend 2026-11-12](docs/estacionamiento/cambios-frontend-2026-11-12.md) y [convenciones-tecnicas-base.md](docs/estacionamiento/convenciones-tecnicas-base.md); buscar → reutilizar → extender → crear. Mantener TypeScript estricto, separación de UI y dominio, shadcn/CVA, accesibilidad, estados UI, Axios para HTTP futuro y Zod. **Cierre de tickets:** cuando un ticket de La Plaza esté implementado y validado según sus criterios de aceptación, moverlo al estado Jira `Finalizado` después de commitear y pushear los cambios correspondientes. Mantener `Estacionamiento` mientras el trabajo siga en curso y no revertir estados de tickets históricos finalizados.

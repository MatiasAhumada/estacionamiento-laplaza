# Plan de implementación

Este plan describe la ejecución inicial de documentación y Jira. Varias rutas/componentes propuestos ya existen; el estado nuevo para implementación posterior está en [cambios frontend 2026-11-12](cambios-frontend-2026-11-12.md). Especificaciones iniciales completas en [tickets-demo.md](tickets-demo.md).

| Orden | Jira | Entregable | Depende de |
| --- | --- | --- | --- |
| 1 | COD-1560 | Identidad visual, layouts y navegación de demo | — |
| 2 | COD-1561 | Contratos, fixture, estado único y acciones simuladas | COD-1560 |
| 3 | COD-1562 | Terminal operativa con F1–F4 | COD-1560, COD-1561 |
| 4 | COD-1563 | Ingreso por patente parcial y categoría | COD-1561, COD-1562 |
| 5 | COD-1564 | Ticket interno de ingreso imprimible | COD-1563 |
| 6 | COD-1565 | Búsqueda ambigua, duración y tarifa ilustrativa | COD-1561, COD-1563 |
| 7 | COD-1566 | Cobro simulado y egreso atómico | COD-1565, COD-1562 |
| 8 | COD-1567 | Caja, arqueo, ajustes y cierre de turno | COD-1561, COD-1566 |
| 9 | COD-1568 | Estado administrativo de la playa | COD-1561, COD-1563, COD-1566 |
| 10 | COD-1569 | Historial, auditoría y reportes | COD-1566, COD-1567, COD-1568 |
| 11 | COD-1570 | Gestión demo de empleados y tarifas | COD-1561, COD-1568 |
| 12 | COD-1571 | Solicitud visual opcional de factura | COD-1566 |
| 13 | COD-1572 | Integración, responsive, accesibilidad y validación | COD-1564, COD-1567, COD-1569, COD-1570, COD-1571 |

T01 y T02 fijan las bases; no duplicar stores, componentes ni fixtures en tickets siguientes. T04/T06/T07 definen el camino crítico. T09–T12 pueden desarrollarse después de sus dependencias sin suponer backend.

## Criterios transversales de terminado

Cada ticket: releer Jira, `AGENTS.md`, esta documentación y el prompt técnico; buscar → reutilizar → extender → crear; usar TypeScript estricto, shadcn/CVA, tokens, Zod cuando hay entradas, mobile first, foco/teclado/labels/contraste, estados vacío/error/procesando según corresponda. Probar casos normales y alternativos reales. Ejecutar `pnpm lint`, `pnpm build` y pruebas pertinentes sin warnings; `pnpm exec tsc --noEmit` cuando aporte validación. Para UI, aplicar skill de diseño y validación en navegador gstack según el prompt técnico. Revisar diff, commit y push a `dev` solo con validaciones limpias y sin incluir cambios ajenos. **Jira pasa a `Finalizado` después de implementación, QA, commit y push aprobados; antes sigue en `Estacionamiento`**. Ningún ticket agrega backend, Prisma, APIs, ARCA, servicios externos ni offline real.

## Escenarios finales verificables

1. Ingresar auto con `782` → aparece en activos y ocupación, ticket imprimible.
2. Ingresar otra estadía con `782` → búsqueda solicita elección, no confunde IDs.
3. Cobrar la primera con efectivo recibido mayor → vuelto correcto, neto igual al total; sale de activos, aparece en historial/caja/admin.
4. Intentar confirmar con importe insuficiente o dos veces → no se registra un segundo cobro.
5. Cobrar por débito/transferencia → no hay vuelto ni suma al efectivo físico.
6. Arqueo con diferencia negativa/positiva → queda ligado a turno/empleado; cierre impide nuevos movimientos en ese turno.
7. Reiniciar demo → restaura fixture; navegación y recarga de misma pestaña conservan operaciones antes del reinicio.
8. Móvil/desktop, teclado y foco funcionan; ninguna vista afirma autenticación, fiscalización ni sincronización de producción.

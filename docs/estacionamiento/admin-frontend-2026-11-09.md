# Panel administrativo: revisión e implementación, 2026-11-09

## Recursos y correspondencia

Se recorrió `recursos/stitch_sistema_la_plaza_estacionamiento` completo. Los cuatro directorios administrativos nuevos contienen `code.html`; Ocupación y Turnos y Cajas incluyen además `screen.png`. Los diseños anteriores de terminal, cobro y arqueo siguen como referencia secundaria. El HTML de Stitch se usó para composición, jerarquía y lenguaje visual, sin copiar su lógica ni sus datos.

| Pantalla | Recurso nuevo | Ruta | Base reutilizada | Cambio realizado |
| --- | --- | --- | --- | --- |
| Inicio | `inicio_dashboard_ejecutivo/code.html` | `/admin` | `DemoProvider`, selectores, tokens, `Card`/`Button` | Se sustituyó el resumen anterior por indicadores, gráficos, actividad, turno y accesos rápidos vinculados al estado compartido. |
| Ocupación | `ocupaci_n_y_mapa_cenital_de_playa/code.html` y `screen.png` | `/admin/ocupacion` | estadías, ocupación, empleado y turno | Se creó un plano 2D seleccionable con sectores, detalle, permanencia y auditorías históricas imprimibles. |
| Turnos y Cajas | `turnos_y_cajas_unificado/code.html` y `screen.png` | `/admin/turnos-cajas` | `RevenueReports`, `MovementHistory`, arqueos y selectores de caja | Se reunieron seis módulos en pestañas: resumen, caja, gastos, historial, personal y reportes. |
| Configuración | `configuraci_n_de_playa_y_tarifas/code.html` | `/admin/configuracion` | tarifas, empleados y estado demo | Se agregaron formularios para nombre, distribución, tarifas, turnos y categorías de gasto; personal comparte componente con Turnos y Cajas. |

En la auditoría inicial solo existía `/admin` con resumen de ocupación y estadías. Las rutas secundarias de caja, movimientos y reportes estaban separadas y caja permitía acciones operativas. No había mapa, auditoría visual, gastos, gestión de personal ni configuración administrativa completa. El layout mostraba vistas de la demo en el lateral. Ahora el lateral contiene exclusivamente **Inicio, Ocupación, Turnos y Cajas, Configuración**. Las rutas anteriores `/admin/caja`, `/admin/movimientos` y `/admin/reportes` redirigen a pestañas de la vista unificada; la administración ya no muestra controles de cobro, egreso, ajustes, arqueo ni cierre.

## Estado y flujos

`DemoProvider` conserva un único `DemoState` en `sessionStorage`. Las acciones puras de `demo.operations.ts` agregan gastos, auditorías, empleados, configuración, tarifas y apertura de turno desde la terminal. Los nuevos ingresos de empleado reciben la primera posición ilustrativa disponible de su sector: motos `M-01..M-08`, autos `A-01..A-16`, camionetas `C-01..C-06`. Una moto puede usar un espacio de autos cuando se llena su sector. La asignación es **simulada por disponibilidad**, sin sensores ni ubicación física verificada. Si no hay posición ilustrativa compatible, la estadía sigue activa y aparece en la lista de no asignadas. La capacidad configurada es informativa y no impide ingresos.

Las 30 posiciones se eligieron como referencia coherente entre recursos. Un diseño dibuja 17 autos (31 plazas totales), mientras Configuración enumera 16; se adoptó 8 + 16 + 6 = 30 y se permite editar cada sector. La medida 50 × 10 m no es un plano validado.

Una auditoría guarda número, fecha, turno, responsable, nombre del estacionamiento, capacidad, distribución y una **copia** de cada vehículo activo (identificador parcial, categoría, posición simulada, ingreso, empleado y turno de origen). Una salida posterior no altera esa copia. La impresión usa el navegador y reúne mapa, resumen y tabla. No existe firma criptográfica ni respaldo de servidor.

Un gasto tiene categoría, concepto, medio, importe, fecha, turno y empleado asociados. Si se paga en efectivo, `selectCashSummary` lo descuenta una vez del efectivo esperado; no se crea además un ajuste de caja. Los pagos históricos ya conservan importe y fracción aplicada, de modo que editar tarifas solo modifica cotizaciones nuevas. Al cerrar un turno en la terminal, se puede abrir otro allí seleccionando un empleado activo y fondo inicial; la administración consulta turnos y arqueos.

La configuración guarda los sectores, categorías de gasto, nombre y etiquetas de turno. Las categorías de vehículos y medios de pago son las tres opciones actuales de los flujos y se muestran para consulta; cambiar su conjunto requeriría revisar reglas de tarifa y cobro. Las etiquetas de turno son visuales; todavía no programan horarios. Las categorías retiradas no borran gastos históricos.

Los gráficos del dashboard y del resumen financiero derivan cobros, movimientos, gastos, ocupación y turnos del mismo estado. El reporte de recaudación permite períodos diario, semanal, mensual, anual y rango; el historial filtra fecha, empleado, turno y medio. La exportación CSV contiene todos los cobros y gastos simulados, sin datos fiscales. El CSV no hereda el filtro visual del reporte.

## Componentes y arquitectura

- Reutilizados: `DemoProvider`, `selectors.ts`, `reporting.ts`, `RevenueReports`, `MovementHistory`, `ParkingBrand`, primitives shadcn, tokens de `globals.css` y flujos de la terminal.
- Nuevos o extendidos: `AdminSectionNavigation`, `AdminOverview`, `OccupancyMap`, `ShiftCashHub`, `AdminConfiguration`, `AdminExpenses`, `AdminEmployees`, `AdminStat`, `AdminPanel`, `AdminBarChart`, `AdminDonut`, acciones y tipos de estado demo.
- Las rutas de Next usan páginas de servidor y componentes cliente para formularios/estado. Se consultaron las guías de layouts y componentes cliente de `node_modules/next/dist/docs/` antes de editar rutas.
- No se añadió backend, API, migración Prisma, facturación real, hardware ni sincronización offline.

## Validación y asuntos conocidos

Se ejecutaron `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` y `pnpm exec tsx --test src/features/estacionamiento/domain/demo.operations.test.ts src/features/estacionamiento/domain/reporting.test.ts` con 16 pruebas aprobadas. Las pruebas de dominio cubren asignación de posición, permanencia de auditoría después de egreso, gasto en efectivo sin duplicación y apertura de otro turno. En navegador local se recorrieron Inicio, Ocupación, Turnos y Cajas y Configuración; se seleccionó una posición, se generó una captura y se registró un gasto de $120, observando que el efectivo esperado pasó de $250 a $130. Se cambió la capacidad a 31, se comprobó el mapa actualizado y se restituyeron las 30 plazas iniciales. Desde la terminal se registró un auto con identificador parcial `TEST9`; Inicio pasó de 3 a 4 vehículos y el mapa lo mostró en `A-02`. La auditoría anterior continuó mostrando 3 vehículos y `A-02` libre. Se inspeccionaron escritorio y viewport móvil de 390 px; no hubo desborde horizontal de documento y el mapa desplazó su área interna. La skill de gstack existe, pero su navegador binario no está compilado en este Windows; se usó el navegador integrado para la validación visual.

El seed de la demo es fechado (8 y 9 de noviembre de 2026). En una fecha posterior, las métricas de «hoy» y los gráficos móviles reflejarán las operaciones reales de la sesión, mientras los datos históricos seguirán disponibles por período. Los datos se guardan solo en la sesión del navegador. No hay autenticación ni multiusuario.

## Jira

Trabajo relacionado con `COD-1569` (historial, auditoría y reportes), `COD-1570` (empleados, capacidad y tarifas) y `COD-1572` (integración y validación). Esos tickets se consultaron mediante Atlassian Rovo y se mantienen en el estado exacto `Estacionamiento`, conforme al pedido actual. No se crearon duplicados ni migraciones.

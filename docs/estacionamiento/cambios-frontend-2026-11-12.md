# Cambios frontend aprobados para implementación posterior

Fecha: 12 de noviembre de 2026. Este documento describe decisiones de producto y trabajo pendiente. **No indica que los cambios ya estén implementados.** La rama `dev` conserva por ahora el mapa de ocupación, la asignación ilustrativa de posiciones, el cierre con importes visibles y el selector libre de rol. Alcance: interfaz y estado simulado del frontend, sin backend, API, Prisma, migraciones, facturación real ni hardware.

## Decisiones confirmadas

| Tema | Comportamiento requerido | Ticket |
| --- | --- | --- |
| Ocupación | Quitar la sección Ocupación del menú y todo mapa/gráfico de cocheras, selección o asignación de lugar. Mantener en **Inicio** conteos y lista textual de vehículos activos; en la terminal, sus conteos textuales. | [COD-1575](https://codev-crew.atlassian.net/browse/COD-1575) |
| Auditoría | El **empleado** emite e imprime un comprobante con total y lista de vehículos estacionados, identificador de patente tal como fue registrado y fecha/hora completas de ingreso. La captura histórica no cambia al producirse salidas. Sin mapa. | [COD-1579](https://codev-crew.atlassian.net/browse/COD-1579) |
| Cierre de caja | El empleado solo declara el **efectivo contado físicamente en caja**. Hasta confirmar el cierre no ve recaudación acumulada, efectivo esperado ni diferencia. Tras cerrar recibe un ticket de rendición imprimible. | [COD-1578](https://codev-crew.atlassian.net/browse/COD-1578) |
| Ingreso a la demo | Un login frontend común identifica el rol y dirige a empleado o administración; la navegación impide que el empleado vea el panel admin durante su turno. Al ser frontend puro, esta restricción es **solo de demo**, no seguridad de producción. | [COD-1576](https://codev-crew.atlassian.net/browse/COD-1576) |
| Análisis financiero | Gráficos admin filtrables por día, semana, mes, turno y empleado, con serie de cobros, gastos, resultado operativo **estimado**, comparativas y proyección explícita con método visible. No llamar ganancia neta al resultado sin costos completos. | [COD-1577](https://codev-crew.atlassian.net/browse/COD-1577) |

Las patentes del estado actual son **fragmentos alfanuméricos parciales**. La auditoría muestra exactamente lo ingresado; nunca completa una patente inventada. «Hora completa» significa fecha y hora con segundos en zona `America/Argentina/Buenos_Aires`, tanto para ingreso como para emisión del comprobante.

El recuento de ocupación continúa derivándose de las estadías activas del estado compartido. La capacidad puede quedar como referencia ilustrativa; no implica identificar un lugar físico ni bloquear ingresos. El historial existente con `positionId` debe seguir cargando sin exhibir plazas ficticias. El acceso anterior `/admin/ocupacion` debe resolverse sin mapa ni enlace roto. Las auditorías antiguas pueden conservar sus datos guardados para compatibilidad, pero no representar posiciones en los nuevos comprobantes.

En el cierre a ciegas, no se oculta el importe individual necesario para cobrar y dar vuelto. Lo que se oculta al empleado es la **suma del turno** y su comparación con lo esperado antes de confirmar. El cálculo de conciliación sigue disponible para el administrador y para el ticket **posterior** al cierre. Es indispensable resolver el login de demo antes de evaluar esta experiencia, porque hoy existen enlaces directos entre roles. La restricción cliente no protege información frente a manipulación del navegador; producción requerirá autenticación y autorización de servidor en otra etapa.

## Estado actual y reutilización

- `src/components/shared/admin-section-navigation.tsx` incluye Ocupación; `src/app/admin/ocupacion/page.tsx` y `src/features/estacionamiento/components/occupancy-map.tsx` renderizan mapa y auditoría admin. `admin-overview.tsx` tiene dona de ocupación y enlaces hacia el mapa. `demo.operations.ts` asigna `positionId` al ingreso. COD-1575 retira esa representación y conserva datos textuales en Inicio.
- `create-audit` ya guarda una copia de estadías activas, pero el disparador y la impresión están en la vista admin. COD-1579 reutiliza la captura, cambia el emisor a empleado y elimina el mapa del comprobante.
- `cash-register.tsx` y la terminal muestran efectivo esperado y netos antes del cierre; `count-cash` y `close-shift` son pasos separados. COD-1578 reemplaza el flujo visible por un solo monto declarado y rendición posterior, conservando la conciliación.
- `src/app/page.tsx` contiene enlaces libres a ambos roles, sin login. COD-1576 introduce sesión visual de demo y redirección por rol, sin prometer seguridad real.
- `admin-overview.tsx`, `shift-cash-hub.tsx`, `revenue-reports.tsx` y `reporting.ts` ya tienen métricas, períodos y gráficos parciales. COD-1577 extiende filtros y series sobre los pagos y gastos existentes.

## Orden y cierre de los tickets

Implementar COD-1575 y COD-1576 primero. COD-1579 depende del retiro del mapa; COD-1578 depende del login visual para no exponer el panel admin al empleado. COD-1577 puede avanzar en paralelo conceptual con esos cambios, pero su QA final debe verificar que no reaparece un gráfico de cocheras. Tomar los criterios históricos de COD-1572 como referencia de QA y contrastar con [la paleta aprobada](paleta-canonica-2026-11-11.md); COD-1572 ya está finalizado y no se reabre por este nuevo alcance.

Cada ticket nuevo permanece abierto mientras solo exista documentación o implementación sin QA. **Después** de completar implementación frontend, pruebas y QA de los criterios de aceptación, revisar el diff, hacer commit y push a `dev`, y mover ese ticket a `Finalizado`. Si falla una validación, registrar lo pendiente y no finalizarlo. Los tickets históricos que el usuario ya finalizó conservan su estado.

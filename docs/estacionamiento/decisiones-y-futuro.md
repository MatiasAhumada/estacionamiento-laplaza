# Decisiones y evolución

> Las decisiones nuevas del 12/11/2026 sobre retiro del mapa, auditoría del empleado, cierre a ciegas, login visual y gráficos están en [cambios frontend](cambios-frontend-2026-11-12.md). Este documento conserva el contexto de la etapa inicial.

## Decisiones para la demo

1. **Frontend exclusivamente:** el negocio se simula en cliente. Prisma/PostgreSQL y el ejemplo de usuarios no se tocan. Evita sugerir persistencia inexistente.
2. **Estado único versionado por pestaña:** reducer/provider y `sessionStorage`, descritos en [modelo](modelo-datos-demo.md). Permite una demo coherente tras navegación/recarga, con botón de reinicio. No implica sincronización ni consistencia entre dispositivos.
3. **Identidad por estadía:** fragmento de patente no único; ID y ticket separados. La búsqueda ambigua requiere elección.
4. **Dinero en centavos:** pagos netos y caja derivados de operaciones; el vuelto nunca infla recaudación.
5. **Tarifa ilustrativa configurable:** cálculo simple por media hora solo para demo. Capacidad y tarifas se muestran como ejemplos, pendientes de validación del cliente.
6. **shadcn y tokens:** extender lo existente; refactorizar componentes heredados si entran al alcance, sin segundo sistema visual.
7. **Rol de desarrollo explícito:** se planifica login visual por rol para la demo, sin autorización segura de producción. La interfaz no debe afirmar seguridad real.

## Fuera de esta etapa

Backend de negocio, endpoints REST, base PostgreSQL, migraciones Prisma, sesiones/autorización **reales de servidor**, emisión fiscal ARCA/CAE, integración POS o bancaria, impresora física, barreras/sensores/OCR, asignación de plazas y offline real. Antes de implementar offline productivo, investigar almacenamiento durable, colas, IDs, conflictos, sincronización, seguridad y recuperación; hacerlo como etapa separada. Antes de facturación real, definir requisitos fiscales y proveedor con el cliente. No generar migraciones manuales; las futuras se generan únicamente con el comando Prisma indicado en `AGENTS.md` sobre desarrollo.

## Validaciones pendientes con el cliente

Capacidad real, política tarifaria (fracción, mínimo, tolerancia, cambios de tarifa), horarios/fondo de caja, ajustes autorizados, datos requeridos para facturar, reportes prioritarios y tratamiento de operaciones cuando no hay conectividad. Estas dudas no bloquean la demo si todo valor ilustrativo queda identificado.

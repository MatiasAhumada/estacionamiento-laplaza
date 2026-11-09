# Especificaciones para Jira

Todos pertenecen a la épica «Estacionamiento La Plaza — Demo Frontend Funcional», proyecto `COD`, estado exacto `Estacionamiento`. Son implementables por separado tras sus dependencias. Las rutas/archivos bajo `src/features/estacionamiento` y rutas nuevas de `src/app` son **propuestos**. Referencia común: `AGENTS.md`, `docs/estacionamiento/README.md`, `plan-implementacion.md` y prompt técnico adjunto. Definición de terminado común en el plan.

## T01 — Identidad visual, layouts y navegación de demo

**Objetivo / prioridad / dependencias:** establecer un solo sistema visual y estructura navegable. Alta; sin dependencias.

**Contexto y alcance funcional:** reemplazar starter Next por entrada de demo identificada; navegación entre terminal y administración con selector de rol marcado «simulación». Diferenciar layout operativo del administrativo, conservar cuatro acciones como jerarquía futura. Metadatos y idioma español.

**Alcance técnico:** extender `src/app/globals.css` con tokens semánticos de paleta, tipografías Inter/Plus Jakarta Sans y variantes CVA de `src/components/ui/button.tsx`; usar `src/components/ui`. Definir rutas en `src/constants/routes.ts`, layouts propuestos en `src/app/empleado` y `src/app/admin`; componentes compartidos de navegación. Revisar `GenericModal`/ `DataTable` sin propagarlos tal como están. No crear store de dominio aquí. Recursos: `se_al_urbana_pos/DESIGN.md`, terminal `screen.png`/`code.html`.

**Aceptación:** Dado cualquier viewport, cuando se navega entre roles de demo, entonces el cambio es claro, accesible y no se presenta como autorización real. Dado un componente base, cuando se aplica un color/estado, entonces proviene de tokens/variants compartidos. Metadatos muestran La Plaza y `lang=es`.

**Alternativos y validación:** menú móvil, foco visible, navegación teclado, contraste y no overflow. `pnpm lint`, `pnpm build` y revisión visual móvil/escritorio. **Fuera:** autenticación, operaciones reales, rutas API.

## T02 — Contratos, fixture y estado único de demo

**Objetivo / prioridad / dependencias:** una fuente coherente para todas las pantallas. Alta; T01.

**Contexto y alcance funcional:** proveer turno, empleados sin límite arbitrario, estadías, cobros, caja, tarifas y capacidad ilustrativas, acciones de ingreso/egreso/arqueo/cierre y reinicio; mostrar claramente que son datos demo.

**Alcance técnico:** crear (propuesto) `src/features/estacionamiento/domain` y `demo`: tipos del [modelo](modelo-datos-demo.md), semilla consistente, reducer/provider en layout compartido, selectores y almacenamiento `sessionStorage` versionado. IDs internos estables, tickets secuenciales, importes en centavos. Distinguir hidratación del estado vacío. Constantes de fixture en `src/constants`. Validar transiciones en reglas puras, no en JSX.

**Aceptación:** Dado ingreso simulado, cuando se confirma, entonces activos, ocupación y movimientos reflejan el mismo ID. Dado cobro/egreso, entonces desaparece de activos y permanece en historial. Recarga en misma pestaña conserva datos; reiniciar restaura semilla. Ningún fragmento de patente es clave única.

**Alternativos y validación:** storage corrupto/versión antigua, duplicación, turno cerrado y segunda pestaña independiente. Pruebas de invariantes/selectores, `pnpm lint`, `pnpm build`. **Fuera:** persistencia de producción, servidor, sincronización offline.

## T03 — Terminal operativa F1–F4

**Objetivo / prioridad / dependencias:** interfaz rápida para empleado. Alta; T01, T02.

**Contexto y alcance funcional:** cuatro botones grandes F1 Auto, F2 Camioneta, F3 Moto, F4 Cobrar; turno/empleado, reloj, ocupación breve, estado visual de conexión, caja y últimos movimientos resumidos. Nada de tabla extensa ni formulario en base.

**Alcance técnico:** ruta propuesta `src/app/empleado/page.tsx`, componentes en `features/estacionamiento/components`; usar `Button`, `Card` y variantes del T01, selectores del T02. Atajos de teclado solo fuera de inputs/modales incompatibles. Estado de conexión es escenario visual, no red real. Recursos: terminal HTML/captura.

**Aceptación:** Dado turno activo, F1/F2/F3 abre ingreso con categoría fijada, F4 abre búsqueda/cobro; clic equivale a tecla. Totales y movimientos provienen del store. La terminal sigue legible en escritorio y móvil.

**Alternativos y validación:** turno cerrado deshabilita acciones con explicación; foco dentro de input no dispara atajos; sin movimientos muestra vacío. Teclado, móvil/escritorio, `pnpm lint`, `pnpm build`. **Fuera:** dashboard administrativo, mapa de cocheras, dispositivos físicos.

## T04 — Modal de ingreso con patente parcial

**Objetivo / prioridad / dependencias:** registrar estadía rápida sin datos innecesarios. Alta; T02, T03.

**Contexto y alcance funcional:** al elegir categoría, abrir modal con foco en «Números o letras de patente»; aceptar fragmento alfanumérico en mayúsculas y crear estadía activa con hora, empleado, turno y ticket. No elegir categoría dos veces.

**Alcance técnico:** composición sobre `src/components/ui/dialog.tsx`, `Input`, `Label`, `Button`; validar con Zod en `features/estacionamiento/validation`, normalización en dominio y acción del T02. Recurso: modal embebido en terminal `code.html`, corrigiendo placeholder de patente completa.

**Aceptación:** Dado F1 y `782z`, cuando confirma, entonces se registra `782Z` como auto con ID nuevo, se actualiza ocupación y vuelve el foco a terminal. Dos estadías pueden compartir fragmento sin colisión.

**Alternativos y validación:** vacío, símbolos, cancelación, doble clic, turno cerrado y error de storage. Foco/Escape, pruebas de normalización, `pnpm lint`, `pnpm build`. **Fuera:** conductor, DNI, marca/modelo, OCR.

## T05 — Ticket interno de ingreso

**Objetivo / prioridad / dependencias:** enseñar comprobante de entrada. Media; T04.

**Contexto y alcance funcional:** tras ingreso, vista previa con nombre, número de operación, fragmento, categoría y fecha/hora; permitir imprimir o volver sin duplicar estadía.

**Alcance técnico:** componente imprimible propuesto en `features/estacionamiento/components`, datos del `stayId` registrado, estilos de impresión acotados y `Button`/ `Dialog`. Recurso: terminal HTML/captura; separar recibo operativo de factura fiscal.

**Aceptación:** Dado ingreso confirmado, vista previa refleja exactamente la estadía; imprimir abre flujo del navegador y no crea otro ingreso. Tras cancelar impresión, estadía sigue activa.

**Alternativos y validación:** recarga antes de imprimir, cancelación, foco y vista móvil. Revisión de impresión y `pnpm lint`/`pnpm build`. **Fuera:** impresora integrada, factura, ticket automático de salida.

## T06 — Identificación ambigua y cálculo de egreso

**Objetivo / prioridad / dependencias:** localizar la estadía correcta y liquidar automáticamente. Alta; T02, T04.

**Contexto y alcance funcional:** buscar fragmentos entre estadías activas, elegir entre coincidencias, ver ingreso/duración/categoría/ticket/total. Usar tarifa configurada ilustrativa y documentar cálculo por media hora.

**Alcance técnico:** selectores y funciones puras de búsqueda/cálculo en `features/estacionamiento/domain`, modal/composición sobre `Dialog` y `Input`, Zod para búsqueda. Tarifas del T02; snapshot de tarifa al liquidar. Recurso: cobro HTML/captura y terminal modal de búsqueda. No usar mapa de cocheras.

**Aceptación:** Dado dos activas con `782`, cuando se busca `782`, entonces ambas se distinguen por ID/ticket/categoría/hora y ninguna se elige automáticamente. Dado auto 3h30 y fixture $2.160/h con bloques de 30 min, total $7.560.

**Alternativos y validación:** cero resultados, una coincidencia, ingreso futuro/reloj inválido, cambio de tarifa, borde de fracción. Pruebas de reglas, teclado y `pnpm lint`/`pnpm build`. **Fuera:** tarifa contractual, cobro efectivo y egreso (T07).

## T07 — Modal de cobro y egreso atómico

**Objetivo / prioridad / dependencias:** completar ciclo con efectivo, débito o transferencia. Alta; T06, T03.

**Contexto y alcance funcional:** mostrar total destacado y tres botones de medio; efectivo preseleccionado. Ingresar recibido, calcular vuelto, bloquear insuficiente/negativo. Débito/transferencia requieren confirmación simulada sin vuelto. Confirmar cobro y salida una sola vez.

**Alcance técnico:** `Dialog`, `Button` con variantes, `Input`, Zod y acción de dominio atómica del T02; centavos, `netCents=totalCents`, referencias a turno/empleado/estadía. Recurso: modal de cobro HTML/captura. Errores por mecanismo frontend centralizado cuando corresponda.

**Aceptación:** Dado total $7.560 y recibido $8.000, vuelto $440 y recaudación neta $7.560; la estadía sale de activos y aparece en historial/caja/admin. Dado débito o transferencia, vuelto cero y no aumenta efectivo físico. Segundo intento no crea cobro.

**Alternativos y validación:** insuficiente, negativo, formato inválido, cancelación, doble envío, turno cerrado, estadía ya cerrada. Pruebas monetarias y flujo UI, `pnpm lint`/`pnpm build`. **Fuera:** banco, POS, ARCA, ticket automático de egreso.

## T08 — Caja, ajustes, arqueo y cierre

**Objetivo / prioridad / dependencias:** conciliar turno y mostrar diferencias. Alta; T02, T07.

**Contexto y alcance funcional:** modal de caja con empleado, turno, apertura, fondo, cantidad de cobros, netos por medio y ajustes de efectivo con motivo. Contar efectivo, registrar diferencia y cerrar turno con confirmación.

**Alcance técnico:** selectores/acciones puras del T02; `Dialog`, `Card`, `Input`, `Button` y confirmación shadcn. Efectivo esperado = fondo + neto efectivo + ajustes; snapshot de arqueo con turno/empleado. Recurso: caja HTML/captura, sin AFIP/firma/biometría.

**Aceptación:** Dado esperado $235.000 y contado $234.800, diferencia -$200. Débito/transferencia no suman a esperado. Al cerrar, terminal impide movimientos en ese turno y auditoría muestra arqueo.

**Alternativos y validación:** contado negativo, diferencia positiva, cancelación de cierre, ajustes sin motivo, turno ya cerrado, doble cierre. Pruebas de caja y `pnpm lint`/`pnpm build`. **Fuera:** caja fiscal, firma digital, biometría, impresora física.

## T09 — Panel administrativo de estado de playa

**Objetivo / prioridad / dependencias:** vista inicial del administrador. Alta; T02, T04, T07.

**Contexto y alcance funcional:** ocupación total/por categoría, capacidad ilustrativa, disponibles, porcentaje y listado de activas con fragmento, categoría, ingreso, duración, empleado y estado; recaudación diaria breve.

**Alcance técnico:** ruta propuesta `src/app/admin/page.tsx`; selectores del T02, `Card`, `Table` shadcn o cards móviles, tokens/layout T01. Revisar `DataTable` antes de uso; no copiar `any` ni ancho fijo. No hay recurso Stitch administrativo: seguir `diseno-ui.md`.

**Aceptación:** Dado ingreso/cobro desde terminal, cuando se navega a admin, entonces ocupación y lista coinciden sin recargar fixtures independientes. Capacidad está etiquetada ilustrativa.

**Alternativos y validación:** playa vacía/llena, capacidad cero o menor que ocupación, móvil estrecho, duración actualizada. Pruebas selectores y UI, `pnpm lint`/`pnpm build`. **Fuera:** plazas asignadas, monitoreo físico, autenticación.

## T10 — Historial, auditoría y reportes

**Objetivo / prioridad / dependencias:** explicar operaciones y recaudación. Media; T07, T08, T09.

**Contexto y alcance funcional:** historial filtrable por fecha, empleado, turno y medio; detalles de ingreso/egreso, recibido/vuelto/neto, arqueos/diferencias. Reportes diario, semanal, mensual, anual y rango; desgloses por medio y estadísticas coherentes.

**Alcance técnico:** rutas propuestas `src/app/admin/movimientos`, `admin/caja`, `admin/reportes`; selectores agregados puros del T02, `Table`/cards shadcn, Zod para rango. Fixtures históricos coherentes con saldos. Recurso visual: caja/terminal como lenguaje, no datos numéricos literales.

**Aceptación:** Dado cobro de $7.560 con recibido $8.000, historial muestra $440 de vuelto y reporte suma $7.560; suma de métodos iguala total. Filtro y rango cambian resultados de forma consistente.

**Alternativos y validación:** rango inválido, cero datos, turno cruzando día, múltiples empleados, responsive. Pruebas de agregación/fechas, `pnpm lint`/`pnpm build`. **Fuera:** exportación fiscal, backend, reportes sobre operaciones inexistentes.

## T11 — Empleados y tarifas configurables de demo

**Objetivo / prioridad / dependencias:** representar administración básica sin fijar límites falsos. Media; T02, T09.

**Contexto y alcance funcional:** listado y alta/edición/desactivación simulada de empleados; selección de empleado para turno nuevo. Editar tarifas ilustrativas por categoría y capacidad de ejemplo con aviso de demo. Historial conserva empleado y tarifa aplicada.

**Alcance técnico:** rutas/secciones propuestas en `src/app/admin`; `Dialog`, `Input`, `Select`, `Button`, Zod, constantes, acciones del T02. Sin modelo Prisma. No agregar límite de cantidad ni permisos reales.

**Aceptación:** Dado empleado nuevo, aparece en lista y puede asociarse a nuevo turno; desactivarlo no borra movimientos anteriores. Cambiar tarifa afecta liquidaciones nuevas, no pagos históricos. Capacidad ilustrativa se refleja en admin.

**Alternativos y validación:** nombre vacío, tarifa negativa/cero, capacidad inválida, empleado con turno activo, cancelación. Pruebas de reglas y UI móvil, `pnpm lint`/`pnpm build`. **Fuera:** usuarios/login, RRHH, tarifas contractuales.

## T12 — Solicitud visual opcional de factura

**Objetivo / prioridad / dependencias:** mostrar pedido fiscal sin emisión real. Media; T07.

**Contexto y alcance funcional:** en egreso, opción «Requiere factura» separada del pago; crear solicitud visual pendiente y consultar estado en historial/admin. No pedir datos fiscales en modal principal ni emitir ticket de salida automáticamente.

**Alcance técnico:** `DemoInvoiceRequest` del modelo, acción del T02, checkbox/primitiva shadcn y estado visual; referencia modal cobro HTML. Etiquetas explícitas «simulación» y «pendiente».

**Aceptación:** Dado pago con opción marcada, historial muestra solicitud pendiente ligada a estadía; sin opción no crea solicitud. En ningún caso aparece CAE o comprobante autorizado.

**Alternativos y validación:** cancelar cobro no crea solicitud, doble confirmación no duplica, estado vacío. `pnpm lint`, `pnpm build` y flujo UI. **Fuera:** ARCA, CAE, datos fiscales definitivos, PDF fiscal.

## T13 — Integración funcional y validación final

**Objetivo / prioridad / dependencias:** demo navegable y consistente de punta a punta. Alta; T05, T08, T10, T11, T12.

**Contexto y alcance funcional:** recorrer ingreso → ticket → cobro → salida → caja → admin/reportes; corregir incoherencias, asegurar reinicio y escenarios de conexión visual. Revisar texto demo y ausencia de afirmaciones productivas falsas.

**Alcance técnico:** integrar rutas/componentes propuestos, pruebas significativas de reglas y flujos, revisar límites de componentes cliente, accesibilidad, mobile first, focus y variantes compartidas. Validar ejemplos de `plan-implementacion.md`. No ampliar producto más allá de tickets.

**Aceptación:** Todos los escenarios finales del plan pasan en escritorio y móvil; las mismas operaciones aparecen con iguales importes/IDs en terminal, admin, caja e historial; reinicio funciona. Lint/build sin warnings.

**Alternativos y validación:** sesiones vacías, dos fragmentos iguales, dinero insuficiente, repetición, turno cerrado, storage corrupto, teclado y viewport estrecho. Ejecutar `pnpm lint`, `pnpm build`, pruebas pertinentes y navegador gstack. **Fuera:** despliegue, backend, offline, factura real.

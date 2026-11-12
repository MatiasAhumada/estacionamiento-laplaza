# Investigación visual de `recursos/`

> Investigación de los diseños originales. Los cuatro recursos administrativos incorporados después, incluidos el mapa visual y sus capturas, se analizan en [Panel administrativo 2026-11-09](admin-frontend-2026-11-09.md). Esa implementación del mapa es histórica: la decisión vigente del 12/11 es retirarlo y conservar solo estadísticas/listas textuales de ocupación; ver [cambios frontend](cambios-frontend-2026-11-12.md).

Se inspeccionaron recursivamente los siete archivos: `se_al_urbana_pos/DESIGN.md` y, en cada una de las carpetas `terminal_operativa_4_acciones`, `modal_cobro_y_vuelto_efectivo` y `modal_caja_y_arqueo_turno`, `code.html` y `screen.png`. Se leyeron las estructuras/textos HTML y se contrastaron las tres capturas. Las capturas muestran variantes de escritorio; **no hay captura administrativa ni diseño móvil final**. Los HTML de Stitch incluyen Tailwind por CDN, iconos Material y scripts demostrativos: sirven como referencia visual, no como implementación React.

## Sistema visual aprovechable

Paleta contractual del pedido: Deep Space Blue `#023047`, Blue Green `#219EBC`, Sky Blue `#8ECAE6`, Amber Flame `#FFB703`, Princeton Orange `#FB8500`, blanco, canvas `#F4F7F9`, texto `#253341`. `DESIGN.md` propone una paleta extendida Material con superficies azul pálido que puede inspirar estados, pero no reemplaza esos ocho valores. Convertir a tokens `background`, `foreground`, `primary`, `secondary`, `accent`, `muted`, `warning`, `success`, `border`, etc.; verificar contraste. Tipos: Plus Jakarta Sans para títulos/totales, Inter para cuerpo/datos y números tabulares. Guía de espacios: base 8px, márgenes 16–32px; controles al menos 44–48px, radios 8px en inputs/botones, 16px en cards y 24px en diálogos. Sombras discretas y bordes claros.

La captura de terminal muestra cuatro tarjetas de acción dominantes, encabezado con turno/conexión, ocupación resumida y últimos movimientos. Conservar jerarquía, teclas F1–F4, tarjeta de cobro naranja, badge de conexión, bloques de resumen. Reducir la tabla extensa del empleado y evitar un dashboard administrativo. El HTML contiene modales de ingreso, cobro, búsqueda y arqueo; su JavaScript abre/cierra overlays y calcula un vuelto de ejemplo, pero confirmar ingreso/cobro solo cierra el modal y no mantiene estado consistente. Reconstruirlos con `Dialog`/primitivas shadcn, foco correcto y acciones reales de demo.

La captura de cobro está recortada en el archivo proporcionado; su HTML sí contiene identificación, duración, total destacado, tres botones de pago, recibido/vuelto y opción de factura. Conservar esa secuencia y el énfasis del total. La captura de caja muestra tarjetas de netos por medio y dos columnas de conciliación; en mobile convertirlas en columna y mantener campo de efectivo contado y diferencia visibles.

## Correcciones obligatorias frente a versiones antiguas

| En Stitch | Decisión para la demo |
| --- | --- |
| «Mapa de Cocheras», zona/nivel, barrera activa, plazas asignadas | Descartar control físico; usar estado agregado de playa y estadías, sin mapa de plazas. |
| Patente argentina completa y ejemplos inventados, marcas/modelos, conductor | Campo de fragmento libre alfanumérico; no completar patente ni pedir extras. |
| Tarifas $2.160/$2.800/$1.200, 15 minutos gratis, capacidad 150 | Solo fixture etiquetado ilustrativo; sin tolerancia no confirmada ni capacidad contractual. |
| «Facturados», AFIP sincronizado, firma digital, autorización biométrica | Cambiar a cobros registrados y arqueo simulado; no insinuar integración fiscal ni biométrica. |
| «En línea / Sincronizado», QR, POS Visa, escáner | Indicador de escenario visual; transferencia simple, débito simulado, sin periféricos ni proveedores. |
| Atajos F5/F10/F12 e impresión/cierre contradictorios entre vistas | F1–F4 son base; definir F5 solo para caja si no choca con modal. Impresión por navegador; cierre con confirmación. |
| Pie «ATAJOS GLOBALES POS», tablas densas y menú amplio en empleado | Simplificar terminal y reservar administración extensa para otro layout. |

No usar la identidad violeta de Delta en la interfaz del estacionamiento. Incluir atribución a Delta — Laboratorio de Software solo donde corresponda, sin dominar la marca. Botones, modales, tablas, badges y estados deben provenir de un único sistema shadcn/CVA; móvil primero en administración y adaptación real en terminal. Las pantallas administrativas se diseñan en el ticket respectivo a partir de estas reglas, no se copian de Stitch.

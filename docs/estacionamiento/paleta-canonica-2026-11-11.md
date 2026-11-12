# Paleta canónica y ajuste visual pendiente

## Decisión de producto

La paleta elegida por el usuario para Estacionamiento La Plaza comprende **cinco familias, con diez tonos cada una**. Los valores de esta tabla son la referencia cromática para la terminal y las vistas administrativas vigentes. La columna 500 coincide con `DEFAULT`. Mantener la grafía hexadecimal es indiferente; el valor RGB no lo es. La sección Ocupación y su mapa se retirarán según [la decisión posterior del 12/11](cambios-frontend-2026-11-12.md).

| Familia | DEFAULT / 500 | 100 | 200 | 300 | 400 | 600 | 700 | 800 | 900 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sky Blue (Light) | `#8ECAE6` | `#0D2E3D` | `#1B5C7A` | `#288AB7` | `#51AED9` | `#A5D5EB` | `#BBDFF0` | `#D2EAF5` | `#E8F4FA` |
| Blue Green | `#219EBC` | `#071F25` | `#0D3E4B` | `#145D70` | `#1A7D95` | `#39BCDC` | `#6BCCE5` | `#9CDDEE` | `#CEEEF6` |
| Deep Space Blue | `#023047` | `#00090E` | `#01131C` | `#011C2A` | `#012638` | `#04699B` | `#06A3F1` | `#54C3FB` | `#A9E1FD` |
| Amber Flame | `#FFB703` | `#342500` | `#684B00` | `#9C7000` | `#D09500` | `#FFC637` | `#FFD569` | `#FFE39B` | `#FFF1CD` |
| Princeton Orange | `#FB8500` | `#321B00` | `#643500` | `#965000` | `#C86B00` | `#FF9E2F` | `#FFB663` | `#FFCE97` | `#FFE7CB` |

El archivo [DESIGN.md](../../recursos/stitch_sistema_la_plaza_estacionamiento/se_al_urbana_pos/DESIGN.md) describe el lenguaje visual y sugiere los roles: azul profundo para estructura/títulos, turquesa para interacción, celeste para fondos suaves, ámbar para atención y naranja para acciones transaccionales. Sus ejemplos de barreras, sensores, OCR o equipamiento son referencias decorativas del diseño y **no** funciones del producto. El bloque YAML del mismo archivo incluye una paleta Material extendida con `primary: #001A2A`, `secondary: #00677D` y `background: #F7F9FF`; esos valores no sustituyen los cinco colores elegidos arriba. Para neutrales, la documentación previa del producto usa blanco, canvas `#F4F7F9` y texto `#253341`.

## Estado observado en `dev`

- `src/app/globals.css` ya define los cinco colores base como `--brand-navy`, `--brand-blue`, `--brand-sky`, `--brand-amber` y `--brand-orange`, pero **no** define las escalas 100–900 ni un contrato explícito para elegir los tonos por función.
- El token `--action` y los botones de acción usan Amber Flame (`#FFB703`); la guía reserva Princeton Orange (`#FB8500`) para la acción transaccional y Amber Flame para avisos/atención. Esto requiere revisar cada uso por intención, no reemplazar ámbar globalmente.
- El sidebar actual usa Deep Space Blue como superficie y ámbar para la selección. Hay que compararlo con los recursos administrativos más recientes antes de decidir cambios de superficies o estado activo.
- Gráficos de `admin-overview.tsx`, `occupancy-map.tsx` y `shift-cash-hub.tsx` pasan hexadecimales directos a componentes visuales. Centralizar los colores de series/estados para evitar divergencias entre vistas.
- Los componentes shadcn/CVA y las clases utilitarias ya usan parte de los tokens semánticos. La adaptación debe reutilizarlos y conservar contraste, foco y estados legibles.

## Trabajo para un chat posterior

1. Revisar los recursos administrativos nuevos y las vistas vigentes de Inicio, Turnos y Cajas y Configuración, además de la terminal, en móvil y escritorio. El recurso de Ocupación queda como referencia histórica; no reconstruir el mapa.
2. Definir los 50 tonos como fuente única y mapear roles semánticos (estructura, interacción, acción transaccional, atención, superficies, texto y gráficos) sin duplicar hexadecimales en componentes.
3. Corregir usos que contradigan esos roles, conservando las operaciones existentes y evitando copiar HTML o funciones ficticias de Stitch.
4. Verificar contraste y estados `hover`, `focus`, `disabled`, alertas, gráficos y legibilidad de cifras; documentar cualquier excepción necesaria por accesibilidad.
5. Comparar visualmente el resultado con las capturas/HTML de `/recursos` y validar las cuatro rutas administrativas y la terminal en móvil y escritorio. Ejecutar lint, typecheck, build y pruebas pertinentes antes de publicar.

Esta nota documenta el hallazgo y el criterio de aceptación; no modifica los estilos actuales.

Ticket de implementación posterior: [COD-1574](https://codev-crew.atlassian.net/browse/COD-1574).

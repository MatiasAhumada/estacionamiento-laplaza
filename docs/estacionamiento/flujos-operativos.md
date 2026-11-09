# Flujos operativos

## Ingreso

Terminal → F1 Auto/F2 Camioneta/F3 Moto → `Dialog` con categoría fijada y foco en «Números o letras de patente» → normalizar/validar → confirmar una vez → fecha/hora, ID, ticket → estadía activa y ocupación actualizadas → vista previa imprimible → terminal. Cancelar no modifica datos. Impresión por navegador, sin impresora integrada.

## Cobro y salida

F4 → búsqueda de estadías activas. Cero resultados: estado vacío y corrección; una coincidencia inequívoca: selección; varias: lista con fragmento, categoría, ingreso, ticket e ID, elección obligatoria. Mostrar duración, regla ilustrativa y total destacado. Elegir efectivo (default), débito o transferencia. Efectivo: recibido y vuelto; insuficiente, negativo o inválido bloquea. Otros medios: confirmación simulada. Opción separada «Requiere factura». Confirmar transacción única → pago/egreso vinculados → sale de activos, entra en historial, cambian ocupación y caja. Cancelar no cobra.

## Caja y turno

Desde terminal → resumen del turno con empleado, apertura, fondo, cantidad, netos por medio y ajustes → ingresar efectivo contado → calcular esperado y diferencia positiva, cero o negativa → registrar arqueo con empleado y turno → cerrar con confirmación explícita. Un turno cerrado no recibe nuevos movimientos. Para continuar demo, iniciar otro turno simulado o reiniciar datos.

## Administración

Vista inicial: estado actual de playa con total por categoría, capacidad ilustrativa, libres y porcentaje; lista de activas con fragmento, categoría, ingreso, duración y empleado. Otras vistas: historial/filtros, recaudación por medio, arqueos/diferencias, empleados de demo, tarifas ilustrativas y reportes diario/semanal/mensual/anual/rango. Métricas derivadas del mismo estado o de fixtures históricos coherentes. Navegación entre roles explícitamente de demo.

## Conexión

Estados visuales «en línea», «sin conexión», «sincronizando» y contador de pendientes como **escenarios demostrativos controlados**. No afirmar cola durable, servicio remoto ni sincronización real.

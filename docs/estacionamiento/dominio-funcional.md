# Dominio funcional

## Actores y alcance

Playa atendida por personas. El **empleado** registra ingresos, cobra salidas, consulta turno, arquea y cierra caja desde una terminal sencilla. El **administrador** consulta ocupación, estadías, movimientos, empleados, tarifas de demo, recaudación, arqueos, diferencias y reportes. Un selector de rol claramente marcado «modo demostración» representa los roles, sin permisos reales.

La secuencia es **ingreso → estadía activa → cálculo y cobro → egreso**. No existen cámaras, barreras, sensores, OCR, escáner ni asignación de espacio físico. La capacidad es un parámetro ilustrativo, no un dato contractual.

## Invariantes

- Categorías: auto, camioneta y moto. F1/F2/F3 fijan la categoría; no pedirla otra vez.
- Patente parcial: letras y números en mayúsculas, sin formato completo ni máscara. Campo «Números o letras de patente». El fragmento puede repetirse; la identidad es el `stayId` interno. Ante varias coincidencias, elegir explícitamente con categoría, hora, ticket e ID.
- El ingreso toma la hora de la acción, crea una estadía activa y ticket interno. No pedir nombre, DNI, teléfono, marca, modelo ni datos fiscales.
- Cada estadía tiene como máximo un cobro y egreso. Confirmación atómica del estado simulado: pago, salida, historial, ocupación y caja. Deshabilitar confirmación mientras procesa y bloquear repeticiones.
- Medios: efectivo predeterminado, débito y transferencia. Efectivo exige recibido ≥ total; vuelto = recibido − total; neto = total. Negativos o insuficientes bloquean. Otros medios registran confirmación simulada por el total, sin vuelto.
- Ticket de ingreso: establecimiento, número, fragmento, categoría, fecha/hora. Es imprimible, no fiscal. No hay ticket automático de salida. «Requiere factura» crea solicitud visual separada, sin CAE.
- Caja pertenece a turno y empleado. Total por medio deriva de cobros netos. Efectivo esperado = fondo inicial + cobros netos en efectivo + ingresos adicionales − egresos adicionales de efectivo. Débito y transferencia jamás se suman a gaveta. Diferencia = contado − esperado. Arqueo/cierre conservan instantánea y autor.
- Empleados sin límite arbitrario. Movimientos conservan empleado, turno y fecha/hora. Histórico y ocupación comparten fuente.

## Pendiente de confirmación comercial

Tarifas reales, fracciones, mínimos, tolerancias, capacidad, horarios de turnos, política de descuentos, fondo inicial y proceso fiscal. La demo usa fixtures configurables etiquetados «valores ilustrativos»; cifras de Stitch no son contrato.

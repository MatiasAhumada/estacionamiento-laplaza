# Arquitectura frontend propuesta

> Documento de planificación inicial. El estado implementado, las cuatro rutas administrativas y los componentes actuales están registrados en [Panel administrativo 2026-11-09](admin-frontend-2026-11-09.md). Los párrafos que hablan de una plantilla sin estado describen el punto de partida anterior.

La plantilla solo ofrece `src/app`, `components/ui`, `components/common`, constantes, servicio Axios de usuarios y ejemplo de servidor/Prisma. No hay estado de aplicación. La estructura siguiente es **propuesta**, no implementada:

```text
src/app/
  page.tsx                 terminal o entrada a modo demo
  empleado/page.tsx        terminal
  admin/page.tsx           estado de playa
  admin/movimientos/page.tsx
  admin/caja/page.tsx
  admin/reportes/page.tsx
src/components/ui/         primitivas shadcn, única fuente visual
src/components/common/     composiciones reutilizables revisadas
src/features/estacionamiento/
  components/              terminal, modales, ticket, listados, paneles
  demo/                    semilla, reducer, provider, selectores, storage
  domain/                  contratos, reglas de tarifa, caja, normalización
  validation/              esquemas Zod de entradas
src/constants/             rutas, labels repetidos y configuración demo
```

Las rutas exactas se fijan en el primer ticket; no hay necesidad de rutas API. `page.tsx` y layouts serán Server Components salvo hojas interactivas. El provider cliente se monta en un layout compartido para que empleado y admin vean el mismo estado durante navegación. Datos semilla y estado de interfaz no deben duplicarse por página. Selectores calculan ocupación, ingresos, recaudación, duración y diferencias a partir del estado; no almacenar copias derivadas.

Las acciones del reducer representan operaciones completas (`registerEntry`, `confirmPaymentAndExit`, `countCash`, `closeShift`, `resetDemo`) y preservan invariantes. Cálculos y validaciones viven fuera del JSX y son verificables con pruebas de reglas de negocio. La demo puede mostrar carga/hidratación, vacío, error, éxito, deshabilitado y procesamiento. Los formularios usan Zod y primitivas shadcn. Atajos F1–F4 no deben activarse mientras el foco está en un campo o modal incompatible.

Reutilizar `Button`, `Dialog`, `Input`, `Label`, `Select`, `Card`, `Table` y Sonner; extender variantes CVA y tokens en `globals.css`. Evaluar `GenericModal` y `DataTable` antes de uso; sus implementaciones actuales no son patrón a replicar. Incorporar otras primitivas shadcn solo cuando el ticket las requiera. Separar terminal y panel administrativo mediante layouts compartidos. Terminal optimizada para escritorio con adaptación móvil; administración mobile first con cards o tabla adaptada.

El límite de sustitución futura es el origen de acciones y lecturas de dominio. Cuando exista backend, cambiar la implementación de esa capa por servicios Axios tipados y manejo centralizado de errores; no introducir API ni interfaz abstracta vacía ahora. Autenticación/autorización real, persistencia y sincronización se diseñarán por separado. Las restricciones de navegación en el cliente no son controles de seguridad.

## Acceso de demostración por rol

La portada ofrece un login simulado para administración y empleados activos de la fuente de datos de la demo. La sesión del rol vive en `sessionStorage`, separada de `la-plaza-demo-state`; cerrar sesión elimina solo la sesión visual y conserva los datos operativos. Las rutas `/admin` y `/empleado` muestran una carga neutra mientras se verifica la sesión y redirigen al login si falta el rol correspondiente. Las credenciales son públicas dentro del frontend y se muestran en el login.

La validación de credenciales y la protección de navegación se ejecutan en el cliente y pueden eludirse modificando el navegador. No protegen datos ni sustituyen autenticación o autorización real. Un despliegue con información sensible requiere validar la sesión y los permisos en el servidor antes de entregar páginas o datos y proteger cada operación en el backend.

> Copia del documento técnico suministrado con la planificación. Para Estacionamiento La Plaza, la instrucción específica de `AGENTS.md` y del plan prevalece sobre la transición genérica a `Finalizado`: todos los tickets deben permanecer en `Estacionamiento`. El resto de las convenciones continúa vigente.

# PROMPT MAESTRO — IMPLEMENTACIÓN DE TICKETS Y CONVENCIONES TÉCNICAS

Este documento es un prompt genérico y reutilizable para trabajar tickets dentro de cualquier proyecto que lo incorpore. Las convenciones técnicas que siguen se aplican junto con el flujo operativo de esta sección.

## Instrucción breve para iniciar cada tarea

Adjuntá este archivo y reemplazá `[TICKET-KEY]` por la clave correspondiente:

```text
Vamos con la implementación del ticket [TICKET-KEY] de Jira. Releé el ticket completo con Atlassian Rovo, que ya está integrado e iniciado sesión, y seguí de punta a punta el prompt técnico adjunto. Implementá, validá, commiteá y pusheá a dev según sus condiciones. Al terminar correctamente, mové el ticket a “Finalizado”.
```

## Flujo obligatorio para cada ticket

### 1. Actualizar el contexto antes de trabajar

1. Volvé a leer el ticket indicado usando Atlassian Rovo. No dependas de resúmenes de conversaciones anteriores ni de una lectura previa.
2. Revisá la descripción, criterios de aceptación, comentarios recientes, adjuntos, subtareas, dependencias, bloqueos y estado actual que sean pertinentes. Confirmá que la clave corresponde al ticket solicitado.
3. Leé `CLAUDE.md` (incluidas variantes de mayúsculas/minúsculas que existan en el repositorio) para conocer la lógica de negocio y las convenciones específicas del proyecto.
4. Leé también `AGENTS.md`, `README.md` y la documentación relacionada que indique el proyecto. Si las instrucciones difieren, respetá el dominio y el flujo vigente del repositorio sin debilitar las reglas técnicas de este documento.
5. Inspeccioná el estado de Git y el código relacionado antes de editar. Identificá cambios preexistentes para preservarlos y no incluirlos accidentalmente en el commit.
6. Si no podés acceder al ticket con Atlassian Rovo, no inventes sus requisitos: informá el bloqueo antes de implementar.

### 2. UX/UI y uso de gstack

Cuando el ticket incluya trabajo de interfaz o experiencia de usuario:

1. Invocá la skill disponible de diseño frontend (`frontend-design` o `frontend-desing`, según el nombre instalado) antes de diseñar o modificar la experiencia.
2. Aplicá diseño mobile first: comenzá por mobile y luego ampliá a tablet y desktop. Verificá legibilidad, navegación, áreas táctiles, formularios, tablas, overlays y ausencia de overflow horizontal.
3. Usá gstack para probar UX/UI en navegador. Revisá las skills y comandos de gstack instalados y elegí los adecuados para abrir la aplicación, recorrer los flujos afectados y validar el resultado en tamaños mobile y desktop.
4. Si gstack requiere una actualización para poder realizar esas pruebas, actualizalo siguiendo su mecanismo documentado y después continuá. El usuario autoriza las acciones y necesidades razonables requeridas para usar gstack en estas validaciones.
5. No afirmes que la interfaz fue verificada en navegador si la prueba no se ejecutó. Si falta una skill o falla una herramienta, probá la alternativa disponible de gstack y reportá con precisión cualquier validación que no haya sido posible.

### 3. Pruebas y base de datos

Las bases configuradas para este entorno son de desarrollo y corresponden a una copia de producción. Podés usarlas para probar el comportamiento del ticket. Antes de ejecutar operaciones, verificá que la conexión apunte al entorno de desarrollo. No cambies la configuración para conectarte a producción ni ejecutes pruebas destructivas sobre datos compartidos; usá datos de prueba y limpiá únicamente los que hayas creado cuando sea seguro hacerlo.

### 4. Validación obligatoria

Después de implementar:

1. Ejecutá los comandos de `lint` y `build` definidos por el proyecto, desde el directorio y con el alcance correctos para el repositorio o monorepo.
2. Revisá toda la salida. Si aparece cualquier error o warning, aunque sea preexistente o esté fuera de los archivos modificados, investigá la causa y resolvelo sin ocultarlo, deshabilitar reglas ni degradar el tipado.
3. Volvé a ejecutar `lint` y `build` hasta que ambos terminen correctamente y sin errores ni warnings. No consideres suficiente que el código compile si lint presenta hallazgos.
4. Ejecutá además las pruebas específicas disponibles que sean necesarias para validar los criterios de aceptación y los flujos afectados.
5. Si un bloqueo externo impide dejar ambos comandos limpios, no declares la tarea terminada, no hagas push y no muevas el ticket a “Finalizado”. Informá la salida relevante y qué falta resolver.

### 5. Commit y push a dev

Solo cuando `lint` y `build` finalicen correctamente y sin errores ni warnings, y las validaciones aplicables estén completas:

1. Revisá `git status` y el diff final. Confirmá que los cambios propios de la tarea y las correcciones necesarias están completos.
2. No descartes ni incluyas cambios preexistentes del usuario que no formen parte del trabajo autorizado.
3. Creá un commit con el formato y convenciones del repositorio.
4. Integrá el commit en la rama `dev` y pushealo al remoto configurado, siguiendo el mecanismo normal del repositorio y sin forzar el push.
5. Confirmá que el push terminó correctamente y que el commit esperado quedó en `dev`.
6. Si la rama está protegida o el push es rechazado, no fuerces ni eludas esa protección. Dejá el trabajo local en estado seguro y reportá el bloqueo; no cierres el ticket.

### 6. Cierre del ticket

Después de confirmar el push exitoso a `dev`, volvé a Atlassian Rovo y mové el ticket a `Finalizado`. Verificá que la transición se haya aplicado. No cierres el ticket antes del push ni si quedan validaciones fallidas. Si Atlassian Rovo no ofrece esa transición o la rechaza, no simules el cambio: informá el estado real y el motivo.

### 7. Resumen de entrega

Al finalizar, informá de forma breve:

- ticket trabajado;
- resumen de cambios;
- resultado de lint, build y pruebas relevantes;
- hash del commit y confirmación del push a `dev`;
- estado final del ticket.

Si alguna etapa queda bloqueada, indicá exactamente cuál y no presentes la tarea como completa.

---

# CONVENCIONES TÉCNICAS OBLIGATORIAS

# PROMPT BASE TÉCNICO — CONVENCIONES OBLIGATORIAS DEL PROYECTO

Actuá exclusivamente como **desarrollador senior TypeScript / Next.js**, con criterio de arquitectura, escalabilidad, seguridad, mantenibilidad y calidad de producción.

Este documento define convenciones **obligatorias y no negociables**.

Todo código, refactor, componente, endpoint, servicio, schema, modelo, integración o modificación que realices dentro del proyecto debe respetar estas reglas.

Si una solución propuesta viola alguna regla:

> NO la implementes.

Buscá una alternativa compatible con estas convenciones.

---

# 1. FUENTES DE VERDAD

Antes de comenzar cualquier tarea leer obligatoriamente:

```text
AGENTS.md
README.md
docs/
```

y cualquier documentación específica relacionada con el módulo afectado.

Este documento define las **convenciones técnicas generales**.

`AGENTS.md` define:

* reglas del dominio;
* arquitectura específica;
* decisiones de negocio;
* integraciones;
* permisos;
* alcance funcional.

Ambos documentos deben respetarse simultáneamente.

Si existe una aparente contradicción:

1. preservar la regla de negocio definida en `AGENTS.md`;
2. preservar las reglas de calidad establecidas aquí;
3. utilizar la alternativa técnicamente más estricta y mantenible;
4. no romper convenciones para resolver el problema rápidamente.

---

# 2. OBJETIVO GENERAL

Todo código producido debe estar listo para producción.

Priorizar siempre:

1. seguridad;
2. integridad del dominio;
3. consistencia arquitectónica;
4. reutilización;
5. mantenibilidad;
6. legibilidad;
7. escalabilidad;
8. accesibilidad;
9. performance;
10. simplicidad.

La velocidad de implementación nunca justifica degradar la arquitectura.

---

# 3. PROHIBICIONES ABSOLUTAS

No utilizar bajo ninguna circunstancia:

```ts
any
```

No utilizar:

```ts
typeof
```

Única excepción:

```ts
zod.preprocess()
```

cuando sea estrictamente necesario para conversión o normalización de tipos.

---

# 4. COMPARACIONES PROHIBIDAS

No utilizar:

```ts
value === null
value === undefined
flag === true
flag === false
```

Utilizar alternativas expresivas:

```ts
if (value) {
}

if (!value) {
}
```

---

# 5. CORTOCIRCUITOS PARA SIDE EFFECTS

Prohibido:

```ts
condition && executeAction();
```

Para side effects utilizar:

```ts
if (condition) {
  executeAction();
}
```

---

# 6. OPERADOR TERNARIO

El operador ternario únicamente puede utilizarse directamente dentro de un `return`.

Permitido:

```ts
return condition ? enabledValue : disabledValue;
```

Prohibido:

```ts
const value = condition ? enabledValue : disabledValue;
```

Evitar ternarios anidados.

---

# 7. TYPESCRIPT ESTRICTO

Todo código debe utilizar TypeScript estricto.

Obligatorio:

* tipos explícitos;
* tipos específicos;
* unions cuando corresponda;
* discriminated unions cuando aporten claridad;
* evitar casts innecesarios;
* evitar aserciones inseguras;
* no ocultar errores de tipado;
* no usar `@ts-ignore`;
* no usar `@ts-nocheck`.

No solucionar un problema de tipado debilitando TypeScript.

Solucionar la causa real.

---

# 8. NOMBRES SEMÁNTICOS

Utilizar nombres descriptivos.

Prohibir nombres ambiguos como:

```text
i
x
tmp
temp
obj
thing
foo
bar
data
res
value2
item2
```

salvo contextos extremadamente locales donde el significado sea inequívoco.

Preferir:

```ts
studentEnrollment
videoUpload
courseAccess
playbackAuthorization
activeStudents
```

El código debe explicar su intención a través de sus nombres.

---

# 9. FUNCIONES

Cada función debe:

* ser pequeña;
* tener una única responsabilidad;
* tener un nombre semántico;
* recibir únicamente las dependencias necesarias;
* retornar un resultado predecible;
* evitar efectos secundarios inesperados.

Si una función:

* valida;
* persiste;
* envía HTTP;
* transforma;
* notifica;

todo al mismo tiempo, debe dividirse.

---

# 10. SOLID ES OBLIGATORIO

## Single Responsibility

Cada módulo debe tener una única razón para cambiar.

## Open / Closed

Extender comportamiento sin reescribir componentes existentes innecesariamente.

## Liskov Substitution

Toda implementación debe respetar el contrato de su abstracción.

## Interface Segregation

Preferir interfaces pequeñas y específicas.

## Dependency Inversion

Servicios de negocio deben depender de abstracciones.

No instanciar implementaciones de infraestructura directamente dentro de la lógica de dominio.

---

# 11. ARQUITECTURA CLEAN

Separar responsabilidades claramente.

Referencia conceptual:

```text
UI
 ↓
Handler / Action
 ↓
Service
 ↓
Repository / Provider
 ↓
Infrastructure
```

Evitar mezclar en un mismo archivo:

* presentación;
* validación;
* reglas de negocio;
* persistencia;
* HTTP externo;
* transformación compleja.

---

# 12. TIPOS E INTERFACES

Los tipos reutilizables deben vivir en:

```text
/types/*.ts
```

Ejemplos:

* unions;
* aliases;
* intersections;
* DTOs reutilizables cuando corresponda.

Las interfaces reutilizables deben vivir en:

```text
/interfaces/*.ts
```

Ejemplos:

* contratos;
* proveedores;
* estructuras;
* abstracciones.

Nunca duplicar definiciones.

Mantener un único punto de verdad.

---

# 13. SISTEMA DE COMPONENTES — REGLA CRÍTICA

## shadcn/ui es el sistema visual obligatorio del proyecto.

Todo componente visual interactivo debe construirse utilizando:

```text
shadcn/ui
```

como primera opción y capa base.

No es una recomendación.

Es una convención estructural obligatoria.

---

# 14. PROHIBIDO CREAR CONTROLES NATIVOS AD HOC

Cuando exista un componente equivalente en shadcn/ui, está prohibido crear directamente elementos visuales nativos personalizados.

Prohibido:

```tsx
<button className="...">
<input className="...">
<textarea className="...">
<select className="...">
<dialog>
```

si existe una alternativa shadcn adecuada.

Utilizar:

```tsx
<Button />
<Input />
<Textarea />
<Select />
<Dialog />
```

---

# 15. COMPONENTES SHADCN OBLIGATORIOS

Utilizar los componentes shadcn correspondientes para funcionalidades equivalentes.

Ejemplos:

```text
Button
Input
Textarea
Select
Checkbox
RadioGroup
Switch
Label
Card
Dialog
AlertDialog
Sheet
Drawer
Popover
Tooltip
DropdownMenu
ContextMenu
Command
Tabs
Accordion
Table
Badge
Avatar
Skeleton
Progress
Separator
Breadcrumb
Pagination
Form
Calendar
Collapsible
ScrollArea
Sonner / Toast
```

Si existe un componente shadcn que cubre la necesidad, utilizarlo.

No reconstruirlo desde cero.

---

# 16. HTML SEMÁNTICO SÍ ESTÁ PERMITIDO

Esta regla NO significa reemplazar todo HTML por componentes.

Deben utilizarse elementos semánticos normalmente:

```tsx
<main>
<section>
<article>
<header>
<footer>
<nav>
<aside>
<div>
<span>
<p>
<h1>
<h2>
<ul>
<li>
```

cuando corresponda.

La prohibición apunta principalmente a:

* controles interactivos;
* formularios;
* componentes visuales complejos;
* overlays;
* modales;
* menús;
* tablas;
* elementos que shadcn ya abstrae.

---

# 17. NO CREAR DOS SISTEMAS DE DISEÑO

Está estrictamente prohibido que una parte de la aplicación utilice:

```text
shadcn
```

mientras otra implemente:

```text
HTML nativo + Tailwind personalizado
```

para resolver los mismos componentes.

Eso genera divergencia visual.

Debe existir un único sistema de diseño.

---

# 18. COMPONENTES BASE CENTRALIZADOS

Los componentes base deben vivir en la estructura definida por el proyecto.

Referencia:

```text
/components/ui
```

para primitivas shadcn.

Y cuando corresponda:

```text
/components/shared
```

o la estructura equivalente existente para composiciones reutilizables.

Ejemplos:

```text
PageHeader
EmptyState
DataTable
StatusBadge
SearchInput
FormField
ConfirmDialog
PageContainer
ResponsiveModal
LoadingState
ErrorState
VideoStatusBadge
```

Antes de crear uno nuevo:

1. buscar uno existente;
2. reutilizarlo;
3. extenderlo;
4. crear uno nuevo solo si realmente representa una abstracción distinta.

---

# 19. NO DUPLICAR COMPONENTES

Prohibido crear:

```text
UserButton
StudentButton
CourseButton
VideoButton
```

si todos representan variantes de:

```text
Button
```

Utilizar variantes.

Ejemplo conceptual:

```tsx
<Button variant="default" />
<Button variant="destructive" />
<Button variant="outline" />
```

---

# 20. VARIANTS DE SHADCN / CVA — OBLIGATORIO

Todo estilado específico, repetible o semántico de un componente shadcn debe implementarse mediante el sistema de `variants` del componente.

Cuando el componente utilice `class-variance-authority` / `cva`, las diferencias visuales deben declararse dentro de sus variantes.

No repetir estilos mediante `className` cada vez que se utiliza el componente.

## Correcto

Componente base:

```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
        destructive: "...",
        outline: "...",
        success: "...",
        warning: "...",
      },
      size: {
        default: "...",
        sm: "...",
        lg: "...",
        icon: "...",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

Uso:

```tsx
<Button variant="success">
  Aprobar
</Button>
```

## Incorrecto

```tsx
<Button className="bg-green-600 text-white hover:bg-green-700">
  Aprobar
</Button>
```

si ese estilo representa una variante semántica reutilizable.

---

# 20.1 `className` NO DEBE REEMPLAZAR VARIANTS

`className` puede utilizarse únicamente para ajustes contextuales de layout que no pertenecen al diseño intrínseco del componente.

Ejemplos válidos:

```tsx
<Button className="w-full" />
```

```tsx
<Card className="md:col-span-2" />
```

porque:

```text
w-full
md:col-span-2
```

describen cómo el componente se comporta dentro del layout actual.

No describen una nueva identidad visual del componente.

---

# 20.2 ESTILOS VISUALES DEBEN SER VARIANTS

Si cambia cualquiera de estas propiedades de manera semántica:

* color;
* background;
* border;
* radius;
* typography;
* shadow;
* estado visual;
* tamaño reusable;
* estilo de interacción;
* hover;
* focus;
* disabled;
* destructive state;
* success state;
* warning state;

evaluar primero crear una `variant`.

Ejemplo:

```tsx
<Badge variant="active" />
<Badge variant="expired" />
<Badge variant="suspended" />
```

No:

```tsx
<Badge className="bg-green-500">
<Badge className="bg-red-500">
<Badge className="bg-yellow-500">
```

distribuido por distintas pantallas.

---

# 20.3 VARIANTS SEMÁNTICAS

Las variants deben nombrarse por significado, no únicamente por apariencia.

Preferir:

```text
success
warning
destructive
active
inactive
processing
expired
```

Evitar cuando sea posible:

```text
green
orange
red
blue
```

La UI debe depender de conceptos del sistema de diseño, no de colores físicos.

---

# 20.4 COMPONENTES DE DOMINIO SOBRE PRIMITIVES SHADCN

Cuando una variant represente un concepto específico del negocio que no pertenece a la primitive global, crear un componente compuesto.

Ejemplo:

```tsx
<EnrollmentStatusBadge status={status} />
```

internamente:

```tsx
<Badge variant={resolvedVariant}>
  {label}
</Badge>
```

No agregar innecesariamente al `Badge` global:

```text
enrollment-active
enrollment-expired
enrollment-suspended
```

si esas variants solo tienen sentido dentro de una feature.

La primitive global debe permanecer genérica.

El componente de dominio traduce:

```text
estado del negocio
        ↓
variant visual
```

---

# 20.5 EVITAR VARIANTS DUPLICADAS

Antes de agregar una variant:

1. revisar las existentes;
2. verificar si alguna representa el mismo concepto;
3. reutilizarla;
4. extenderla únicamente cuando exista una diferencia real.

No crear:

```text
danger
error
destructive
critical
red
```

si todas terminan representando exactamente el mismo estilo.

Mantener un vocabulario visual controlado.

---

# 20.6 VARIANT PROPS TIPADAS

Las props de variants deben conservar el tipado generado por CVA.

No utilizar:

```ts
variant: string
```

si el componente posee un conjunto cerrado de variants.

Utilizar el contrato tipado correspondiente.

El objetivo es que esto:

```tsx
<Button variant="invented-value" />
```

falle en TypeScript.

---

# 20.7 COMPONENTES NUEVOS

Cuando se cree un componente visual reusable y tenga múltiples estilos posibles, evaluar desde el inicio si debe utilizar:

```text
cva()
+
VariantProps
```

No esperar a que diferentes features empiecen a agregar `className` arbitrarios.

---

# 20.8 REGLA DE DECISIÓN

Ante una necesidad visual aplicar este orden:

```text
¿La diferencia pertenece al layout actual?
        ↓
sí
        ↓
className contextual permitido


¿La diferencia representa un estado o estilo reusable?
        ↓
sí
        ↓
variant


¿Representa un concepto específico del dominio?
        ↓
sí
        ↓
componente de dominio
        ↓
primitive shadcn + variant
```

---

# 20.9 EJEMPLO REAL

Incorrecto:

```tsx
<Button className="bg-orange-500 hover:bg-orange-600">
  Subir video
</Button>
```

en una pantalla.

Y después:

```tsx
<Button className="bg-orange-600 hover:bg-orange-700">
  Crear alumno
</Button>
```

en otra.

Eso genera divergencia.

Correcto:

```tsx
<Button variant="default">
  Subir video
</Button>
```

```tsx
<Button variant="default">
  Crear alumno
</Button>
```

Ambos consumen exactamente el mismo sistema visual.

---

# 20.10 CHECKLIST OBLIGATORIO DE VARIANTS

Antes de finalizar frontend verificar:

* no existen estilos semánticos repetidos mediante `className`;
* los estilos reutilizables usan `variant`;
* los tamaños reutilizables usan `size`;
* las variants usan nombres semánticos;
* CVA se utiliza cuando corresponde;
* las variants mantienen tipado estricto;
* no existen variants duplicadas;
* los componentes de dominio traducen estados a variants;
* `className` se usa principalmente para layout/contexto;
* ninguna page redefine visualmente una primitive shadcn.

---

# 21. NO MODIFICAR SHADCN DE FORMA DISPERSA

Si un componente base necesita ajustes de diseño:

modificar o extender la implementación central.

No aplicar correcciones visuales repetidas en cada uso.

Evitar:

```tsx
<Button className="rounded-[7px] bg-[#123456] ...">
```

en múltiples features.

La personalización debe resolverse mediante:

* variantes;
* tokens;
* componentes compartidos;
* theme.

---

# 22. DESIGN TOKENS

Todos los valores visuales repetibles deben provenir del sistema de diseño.

Centralizar:

* colores;
* radius;
* spacing;
* tipografía;
* estados;
* sombras;
* breakpoints cuando corresponda.

No hardcodear:

```text
#ffffff
#000000
#dd6e42
13px
17px
37px
```

directamente de forma dispersa en JSX.

Los colores del proyecto deben estar configurados en:

* CSS variables;
* theme;
* Tailwind config;
* mecanismo equivalente existente.

---

# 23. PALETA DEL PROYECTO

La paleta visual definida para el proyecto debe convertirse en tokens semánticos.

No consumir colores únicamente por su nombre físico.

Preferir conceptos:

```text
primary
primary-foreground
secondary
accent
muted
background
foreground
border
destructive
success
warning
```

La implementación visual debe abstraer la paleta.

De esta manera cambiar una identidad visual no obliga a modificar cientos de componentes.

---

# 24. TAILWIND

Tailwind debe utilizarse como complemento del sistema de componentes.

No como reemplazo de shadcn.

Tailwind es apropiado para:

* layout;
* spacing;
* responsive;
* grid;
* flex;
* posicionamiento;
* ajustes específicos.

No utilizarlo para reconstruir manualmente componentes que shadcn ya proporciona.

---

# 25. CLASES

Evitar cadenas gigantes de clases repetidas.

Cuando una composición visual aparece varias veces:

crear componente reutilizable.

Para composición condicional utilizar el helper estándar del proyecto, normalmente:

```ts
cn()
```

No implementar helpers duplicados.

---

# 26. ICONOGRAFÍA

Utilizar únicamente la librería de iconos estándar ya adoptada por el proyecto.

No instalar otra librería porque un icono puntual no fue encontrado inmediatamente.

No utilizar:

* emojis como iconografía funcional;
* SVG copiados arbitrariamente;
* múltiples librerías de iconos.

Mantener consistencia visual.

---

# 27. FORMULARIOS

Los formularios deben utilizar los componentes shadcn correspondientes.

Ejemplo:

```text
Form
FormField
FormItem
FormLabel
FormControl
FormMessage
Input
Textarea
Select
Checkbox
Button
```

No crear formularios con inputs nativos estilados manualmente.

---

# 28. VALIDACIÓN DE FORMULARIOS

Toda validación debe tener una fuente clara.

Preferir:

```text
Zod
```

según convenciones existentes.

Errores:

* próximos al campo;
* comprensibles;
* consistentes;
* provenientes de constantes cuando corresponda.

No duplicar esquemas entre frontend y backend si pueden compartirse de forma segura.

---

# 29. MOBILE FIRST

Toda UI debe implementarse Mobile First.

Orden conceptual:

```text
Mobile
 ↓
Tablet
 ↓
Desktop
```

Los estilos base corresponden a mobile.

Los breakpoints agregan progresivamente capacidad.

No implementar:

```text
Desktop
 ↓
parches para Mobile
```

---

# 30. SHADCN + MOBILE FIRST

Los componentes shadcn también deben utilizarse con criterio responsive.

Ejemplos:

En desktop:

```text
Dialog
```

puede ser adecuado.

En mobile puede ser más apropiado:

```text
Drawer
```

o:

```text
Sheet
```

Si esta adaptación se repite, crear una abstracción reutilizable como:

```text
ResponsiveModal
```

No resolverlo manualmente en cada feature.

---

# 31. TABLAS RESPONSIVE

No comprimir una tabla desktop hasta hacerla ilegible.

En mobile evaluar:

* cards;
* columnas prioritarias;
* información expandible;
* scroll controlado.

Si se utiliza `Table`, debe mantenerse la consistencia shadcn.

No construir tablas ad hoc con `<table>` directamente cuando existe el componente estándar.

---

# 32. ACCESIBILIDAD

Todo componente debe ser accesible.

Respetar:

* labels;
* focus;
* navegación por teclado;
* aria cuando corresponda;
* contraste;
* estados disabled;
* estados loading;
* touch targets;
* semántica.

No eliminar outline/focus sin reemplazo accesible.

No utilizar únicamente color para transmitir un estado.

---

# 33. ESTADOS OBLIGATORIOS DE UI

Todo flujo que cargue datos debe contemplar cuando corresponda:

```text
loading
empty
error
success
disabled
processing
```

No implementar únicamente el happy path.

Reutilizar:

```text
Skeleton
EmptyState
ErrorState
```

o componentes equivalentes.

---

# 34. SERVER COMPONENTS POR DEFECTO

En Next.js App Router:

usar Server Components como opción predeterminada.

Agregar:

```ts
"use client"
```

únicamente cuando exista una necesidad real:

* estado local;
* eventos;
* hooks de navegador;
* componentes interactivos;
* APIs browser-only.

No convertir páginas completas a Client Components porque un botón necesita interacción.

Empujar la frontera cliente hacia componentes hoja.

---

# 35. NO ABUSAR DE useEffect

No utilizar `useEffect` para:

* sincronizar datos que pueden derivarse;
* inicializar estados innecesariamente;
* reemplazar Server Components;
* ejecutar lógica que pertenece a servicios;
* duplicar fetching.

Utilizarlo solo cuando exista un side effect real del cliente.

---

# 36. ESTADO

No duplicar estado derivable.

Evitar:

```text
prop
+
local state con la misma información
```

si no es necesario.

Cada dato debe tener una fuente de verdad clara.

---

# 37. HTTP

Todas las llamadas HTTP deben utilizar exclusivamente:

```text
axios
```

No usar:

```text
fetch
```

para llamadas HTTP del proyecto.

Centralizar instancias cuando corresponda.

Ejemplo conceptual:

```text
apiClient
externalApiClient
```

No repetir:

* baseURL;
* headers;
* interceptors;
* manejo de errores.

---

# 38. MANEJO DE ERRORES

Backend:

```text
apiError.handler
```

Frontend:

```text
clientError.handler
```

Todo error debe pasar por el mecanismo centralizado correspondiente.

No exponer al cliente:

* stack trace;
* mensajes del proveedor;
* errores de Prisma;
* secretos;
* información interna.

---

# 39. CÓDIGOS HTTP

Utilizar códigos semánticamente correctos.

Ejemplos:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

No devolver siempre `200`.

---

# 40. REST ESTRICTO

Los endpoints deben representar recursos.

Correcto:

```text
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

Incorrecto:

```text
/getUsers
/createUser
/updateUser
/deleteUser
```

---

# 41. ACCIONES EN URL

Prohibido:

```text
/users/:id/activate
/users/:id/deactivate
/videos/:id/process
```

Si se modifica estado:

```text
PATCH /users/:id
```

Si realmente se crea un recurso nuevo, modelarlo como recurso.

Ejemplo:

```text
POST /videos/:id/playback-authorizations
```

---

# 42. CONSTANTES

Nunca hardcodear:

* mensajes;
* URLs;
* rutas;
* límites;
* timeouts;
* números de negocio;
* estados visuales;
* textos reutilizables;
* configuraciones;
* colores;
* labels repetidos.

---

# 43. UBICACIÓN DE CONSTANTES

Reglas de negocio:

```text
/constants/*.constant.ts
```

Infraestructura:

```text
/config/*.ts
```

Estados persistidos:

preferir:

```text
Prisma Enum
```

cuando corresponda.

---

# 44. TEXTOS DE UI

Los textos repetidos deben centralizarse.

Evitar escribir literalmente:

```tsx
<Button>Guardar</Button>
```

en decenas de lugares si corresponde a un texto reutilizable de la aplicación.

No convertir cada texto único de una vista en constante innecesariamente.

Aplicar criterio de reutilización real.

---

# 45. PRISMA

Prisma debe representar relaciones reales.

Utilizar:

* foreign keys;
* uniques;
* indexes;
* enums;
* constraints;
* timestamps.

No utilizar JSON para evitar modelar relaciones correctamente.

JSON queda reservado para metadata verdaderamente flexible.

---

# 46. REPOSITORY PATTERN

La persistencia debe encapsularse cuando el proyecto adopte repositorios.

Ejemplo:

```text
CourseService
      ↓
CourseRepository
      ↓
Prisma
```

No colocar queries Prisma complejas dispersas por componentes o handlers.

---

# 47. SERVICES

Los servicios representan reglas de negocio.

No deben contener:

* JSX;
* detalles visuales;
* manipulación del DOM.

No deben depender innecesariamente de Next.js.

Cuando sea posible mantener lógica de dominio desacoplada del framework.

---

# 48. ROUTE HANDLERS

Los Route Handlers deben ser delgados.

Responsabilidades:

1. recibir request;
2. validar;
3. autenticar;
4. delegar;
5. transformar respuesta HTTP.

No colocar allí toda la lógica de negocio.

---

# 49. VALIDACIÓN

Toda entrada externa debe validarse.

Incluye:

* request body;
* params;
* query params;
* formularios;
* variables de entorno;
* payloads externos relevantes.

Utilizar Zod cuando corresponda.

---

# 50. SEGURIDAD

Nunca confiar en información proveniente del cliente para autorización.

No confiar en:

```text
role enviado por frontend
userId enviado sin validar
courseId sin verificar
hidden buttons
client-side guards
```

La autorización real siempre ocurre en servidor.

---

# 51. SECRETOS

Nunca exponer:

* tokens;
* API secrets;
* private keys;
* credentials;
* contraseñas;
* secrets de webhooks.

Variables sensibles jamás deben utilizar prefijos públicos.

---

# 52. NO COMMENTS

No agregar comentarios al código.

El código debe ser suficientemente claro mediante:

* nombres;
* separación;
* abstracciones;
* tipos.

No compensar una arquitectura confusa con comentarios.

La documentación arquitectónica pertenece a:

```text
AGENTS.md
README.md
docs/
Jira
```

según corresponda.

---

# 53. DUPLICACIÓN

Antes de escribir código buscar obligatoriamente:

* componentes similares;
* hooks;
* services;
* repositories;
* schemas;
* interfaces;
* types;
* utils;
* constants;
* handlers.

Si existe:

```text
REUTILIZAR
```

Si falta capacidad:

```text
EXTENDER
```

Solo crear uno nuevo cuando represente una responsabilidad nueva.

---

# 54. METODOLOGÍA OBLIGATORIA ANTES DE IMPLEMENTAR

Antes de modificar código:

1. leer `AGENTS.md`;
2. leer documentación relacionada;
3. leer el ticket;
4. inspeccionar archivos afectados;
5. buscar implementaciones similares;
6. revisar componentes existentes;
7. revisar componentes shadcn instalados;
8. revisar `components/ui`;
9. revisar tipos;
10. revisar interfaces;
11. revisar schemas;
12. revisar services;
13. revisar repositories;
14. revisar constantes;
15. revisar handlers;
16. evaluar impacto en Prisma;
17. evaluar impacto de seguridad;
18. evaluar responsive;
19. evaluar reutilización;
20. recién entonces implementar.

---

# 55. SHADCN ANTES DE CREAR COMPONENTES

Antes de crear cualquier componente visual:

## Paso 1

Verificar si ya existe en:

```text
/components/ui
```

## Paso 2

Verificar si existe un componente compartido equivalente.

## Paso 3

Verificar si shadcn dispone de esa primitive y aún no fue instalada.

## Paso 4

Si realmente corresponde, incorporar el componente siguiendo el mecanismo estándar del proyecto.

## Paso 5

Solo crear un componente propio cuando represente composición o lógica específica del producto.

---

# 56. EJEMPLO DE DECISIÓN CORRECTA

Necesidad:

```text
confirmar eliminación
```

Incorrecto:

```tsx
<div className="fixed ...">
  <button>Cancelar</button>
  <button>Eliminar</button>
</div>
```

Correcto:

```text
AlertDialog
+
Button
```

---

# 57. OTRO EJEMPLO

Necesidad:

```text
estado de alumno
```

Incorrecto:

```tsx
<span className="rounded bg-green-500 px-2">
  Activo
</span>
```

repetido en varias vistas.

Correcto:

```text
EnrollmentStatusBadge
```

construido sobre:

```text
Badge
```

y utilizado en toda la aplicación.

---

# 58. OTRO EJEMPLO

Necesidad:

```text
formulario de alumno
```

Incorrecto:

```tsx
<label>
<input>
<select>
<button>
```

con estilos personalizados.

Correcto:

```text
Form
FormField
FormLabel
Input
Select
Button
```

con validación centralizada.

---

# 59. CONSISTENCIA VISUAL

La aplicación debe sentirse como un único producto.

Mismos conceptos deben verse iguales.

Ejemplos:

Todos los botones primarios:

```text
misma variante
```

Todos los destructive:

```text
misma variante
```

Todos los estados:

```text
mismo StatusBadge
```

Todos los dialogs de confirmación:

```text
mismo patrón
```

Todos los formularios:

```text
mismo spacing
misma jerarquía
mismos errores
```

No permitir divergencia entre features.

---

# 60. NO ESTILAR POR PÁGINA

Evitar que cada page defina su propio lenguaje visual.

Una página consume el sistema de diseño.

No lo reinventa.

---

# 61. LAYOUTS COMPARTIDOS

Reutilizar estructuras como:

```text
AppShell
Sidebar
Topbar
PageContainer
PageHeader
SectionHeader
```

cuando existan.

No replicar navegación o contenedores en distintas rutas.

---

# 62. COMPONENTIZACIÓN CON CRITERIO

No convertir cada `<div>` en componente.

Crear componentes cuando exista:

* reutilización;
* responsabilidad;
* complejidad;
* semántica;
* aislamiento útil.

Evitar tanto:

```text
componentes gigantes
```

como:

```text
componentización artificial extrema
```

---

# 63. PERFORMANCE

Evitar:

* renders innecesarios;
* datos excesivos;
* queries N+1;
* bundles cliente grandes;
* dependencias redundantes;
* cargar componentes pesados sin necesidad.

Utilizar lazy loading cuando aporte valor.

---

# 64. DEPENDENCIAS

Antes de instalar cualquier paquete:

1. verificar si el proyecto ya resuelve el problema;
2. verificar si shadcn/Radix ya lo provee;
3. verificar si la plataforma/framework lo provee;
4. justificar la nueva dependencia.

No instalar paquetes triviales.

---

# 65. NO CAMBIAR STACK SIN NECESIDAD

No introducir:

* otra librería UI;
* otro ORM;
* otro cliente HTTP;
* otro sistema de forms;
* otra librería de icons;
* otro sistema de styling;

sin requerimiento explícito y análisis previo.

---

# 66. TESTING

Cuando corresponda, validar:

* happy path;
* errores;
* permisos;
* estados límite;
* reglas de negocio.

Una modificación no está terminada solamente porque compila.

---

# 67. VALIDACIONES PRE-ENTREGA

Ejecutar según scripts disponibles:

```text
lint
typecheck
tests
build
```

No declarar una tarea finalizada si existen errores relacionados con la implementación.

---

# 68. CHECKLIST TYPESCRIPT

Antes de entregar:

* no existe `any`;
* no existe `typeof` fuera de la excepción;
* no existen comparaciones explícitas prohibidas;
* no existen ternarios fuera de return;
* no existen short-circuit side effects;
* los nombres son descriptivos;
* los tipos son específicos.

---

# 69. CHECKLIST ARQUITECTURA

Validar:

* responsabilidad única;
* no duplicación;
* dependencias correctas;
* lógica de negocio fuera de UI;
* persistencia correctamente encapsulada;
* errores centralizados;
* constantes centralizadas;
* REST correcto.

---

# 70. CHECKLIST SHADCN — OBLIGATORIO

Antes de finalizar cualquier ticket de frontend verificar:

* ningún `<button>` manual reemplaza `Button`;
* ningún `<input>` manual reemplaza `Input`;
* ningún `<textarea>` manual reemplaza `Textarea`;
* ningún `<select>` manual reemplaza `Select`;
* ningún modal manual reemplaza `Dialog`/`AlertDialog`;
* ningún drawer manual reemplaza `Sheet`/`Drawer`;
* ninguna card manual duplicada reemplaza `Card`;
* ninguna tabla inconsistente reemplaza `Table`;
* ningún badge custom repetido reemplaza `Badge`;
* ningún skeleton custom reemplaza `Skeleton`;
* ningún tooltip manual reemplaza `Tooltip`;
* ningún dropdown manual reemplaza `DropdownMenu`;
* ningún patrón ya existente fue duplicado;
* componentes compartidos fueron reutilizados;
* variantes fueron reutilizadas;
* tokens del theme fueron utilizados;
* no existen colores arbitrarios dispersos;
* no existe styling paralelo al sistema de diseño.

---

# 71. CHECKLIST MOBILE FIRST

Validar:

* mobile funciona primero;
* no existe overflow horizontal accidental;
* inputs son cómodos;
* touch targets son adecuados;
* modals/drawers responden al viewport;
* navegación funciona en mobile;
* tablas se adaptan;
* textos son legibles;
* acciones principales siguen disponibles;
* desktop amplía la experiencia, no la corrige.

---

# 72. CHECKLIST ACCESIBILIDAD

Validar:

* labels correctos;
* navegación por teclado;
* foco visible;
* contraste;
* aria cuando corresponda;
* estados disabled;
* feedback de errores;
* información no depende únicamente de color.

---

# 73. CHECKLIST NEXT.JS

Validar:

* Server Components por defecto;
* `use client` únicamente cuando corresponde;
* no existen Client Components gigantes innecesarios;
* no existe fetching cliente innecesario;
* no existe `useEffect` utilizado como workaround arquitectónico;
* límites servidor/cliente son claros.

---

# 74. SI EXISTE UNA IMPLEMENTACIÓN INCORRECTA

Si durante un ticket encontrás código existente que viola estas convenciones:

No expandir el patrón incorrecto.

Si está directamente relacionado con el alcance:

refactorizar hacia la convención correcta siempre que sea seguro.

Si está fuera del alcance:

no hacer un refactor masivo silencioso.

Documentar la deuda o generar el ticket correspondiente según la metodología del proyecto.

---

# 75. NO SOBREINGENIERÍA

La calidad alta no significa crear abstracciones innecesarias.

No crear:

* factories sin necesidad;
* managers genéricos vacíos;
* capas sin responsabilidad;
* wrappers inútiles;
* interfaces con una única implementación sin razón arquitectónica;
* patrones complejos únicamente por estética técnica.

Toda abstracción debe resolver un problema real.

---

# 76. COMPONENTES GENÉRICOS ANTES QUE COMPONENTES ESPECÍFICOS

Si múltiples features comparten comportamiento visual:

crear una abstracción reusable.

Ejemplo:

```text
GenericDataTable
GenericFormDialog
ConfirmDialog
PageHeader
StatusBadge
EmptyState
```

Pero no crear un componente excesivamente genérico que reciba decenas de props para resolver escenarios incompatibles.

Buscar equilibrio.

---

# 77. PRINCIPIO DE UNA ÚNICA FUENTE VISUAL

Para cada primitive visual debe existir una única fuente de verdad.

Ejemplo:

```text
Button → components/ui/button
```

No:

```text
components/ui/button
components/common/custom-button
features/users/user-button
features/videos/video-button
```

resolviendo lo mismo.

---

# 78. REGLA DE NO DIVERGENCIA

Si dos pantallas necesitan el mismo patrón visual, deben compartir la misma implementación.

No aceptar:

```text
Página A → Dialog shadcn
Página B → modal nativo personalizado
Página C → otro componente custom
```

Debe existir consistencia.

Esta regla es especialmente importante porque el proyecto comienza desde cero y debe evitar deuda visual temprana.

---

# 79. CRITERIO DE DECISIÓN PARA UI

Antes de implementar cualquier elemento visual preguntarse, en este orden:

```text
¿Ya existe en el proyecto?
        ↓
sí → reutilizar
        ↓ no

¿Existe en shadcn?
        ↓
sí → usar shadcn
        ↓ no

¿Puede componerse con primitives shadcn?
        ↓
sí → crear componente compartido
        ↓ no

¿Requiere realmente una implementación custom?
        ↓
sí → implementarla siguiendo tokens y convenciones
```

Nunca empezar directamente por HTML + Tailwind personalizado.

---

# 80. COMPORTAMIENTO ESPERADO DEL AGENTE

No explicar por qué las reglas son estrictas.

No sugerir ignorarlas para acelerar.

No proponer una solución "más simple" que las viole.

No debilitar tipado.

No duplicar componentes.

No crear excepciones visuales arbitrarias.

No introducir patrones nuevos sin revisar los existentes.

No instalar paquetes sin necesidad.

No producir código temporal esperando "limpiarlo después".

Implementar correctamente desde el inicio.

---

# 81. PRIORIDAD FINAL

Ante dos soluciones funcionalmente equivalentes, elegir aquella que:

1. reutilice más infraestructura existente;
2. mantenga mejor consistencia visual;
3. use shadcn correctamente;
4. tenga mejor tipado;
5. tenga responsabilidades más claras;
6. sea más fácil de testear;
7. sea más fácil de mantener;
8. agregue menos deuda técnica.

---

# 82. REGLA FINAL

La aplicación debe crecer sobre:

```text
UN SOLO SISTEMA DE DISEÑO
+
UNA SOLA ARQUITECTURA
+
UNA SOLA FUENTE DE VERDAD
+
COMPONENTES REUTILIZABLES
+
TIPADO ESTRICTO
+
CONVENCIONES CONSISTENTES
```

No debe existir una parte de la aplicación "hecha diferente" porque fue implementada en otro momento, por otro ticket o por otro agente.

Cada nueva implementación debe parecer escrita por el mismo equipo, bajo las mismas decisiones arquitectónicas y visuales.

El objetivo no es solamente que el código funcione.

El objetivo es producir una base profesional, consistente y escalable desde el primer día.

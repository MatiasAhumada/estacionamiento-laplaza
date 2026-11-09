# Investigación del repositorio — 9 de noviembre de 2026

## Estado inicial verificado

Rama `dev`, commit base `0690552` («Copia de repo generico»), remoto `origin` a `MatiasAhumada/estacionamiento-laplaza`; también existe `master`. Antes de documentar, el único cambio era `?? recursos/` aportado para esta tarea. No había `.codegraph/` ni `docs/`. `CLAUDE.md` solo referenciaba `AGENTS.md`; este contenía la advertencia sobre la versión de Next. No se hallaron otras variantes de `CLAUDE.md`.

`package.json` y `pnpm-lock.yaml`: Next 16.2.0, React 19.2.4, TypeScript ^5, Tailwind 4, shadcn 4, Radix 1.4.3, CVA 0.7.1, Axios 1.13.6, Zod 4.3.6, Prisma 7.5, Sonner 2, Framer Motion 12, dos paquetes Hugeicons. `components.json` usa estilo `radix-maia`, CSS variables y alias `@/`. `tsconfig.json` tiene `strict: true`; ESLint usa core web vitals y TypeScript de Next. No hay script ni configuración de tests. `next.config.ts` no define opciones; `postcss.config.mjs` conecta Tailwind. Hay `.prettierignore` y script `format`, sin configuración Prettier propia.

Solo existe `src/app/page.tsx` (starter de Next), `layout.tsx` (metadatos `Create Next App`, `lang=en`, Geist/Figtree) y `globals.css` (tema neutral). No hay login real, hooks, providers, estado compartido ni rutas API. `src/constants/routes.ts` enumera `/login` y `/api/users`, pero no existen esas rutas.

Primitivas en `src/components/ui`: `button`, `card`, `dialog`, `input`, `label`, `select`, `table`, `sonner`. `Button` usa CVA. No hay aún `AlertDialog`, `Drawer`, `Sheet`, `Skeleton`, `Badge`, `Textarea` ni `Form`; instalar por mecanismo shadcn solo si se necesitan.

`src/components/common/GenericModal.tsx` es un modal propio con Framer Motion, backdrop manual y colores oscuros rígidos; revisar foco, Escape y adaptación a `Dialog` antes de usar. `DataTable.tsx` usa `<table>` manual, ancho mínimo 800px, colores oscuros y animación; no satisface las convenciones visuales actuales. Al inicio contenía `as any`, corregido en la limpieza de validación. Reutilizar su idea de búsqueda/columnas solo tras refactor visual. Sonner y handlers de error pueden reutilizarse cuando corresponda.

`src/services/user.service.ts`, `src/server/services/user.service.ts`, `src/server/repository/user.repository.ts`, `src/lib/prisma.ts` y `prisma/schema.prisma` son ejemplos de usuarios; el único modelo es `User`. `src/utils/clientAxios.util.ts` centraliza una instancia HTTP futura. `prisma.config.ts` toma `DATABASE_URL` del entorno. `.env.example` declara `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV` y `NEXT_PUBLIC_API_URL`; no son requisitos de la demo. No se inspeccionaron secretos locales.

## Buscar → reutilizar → extender → crear

Reutilizar `components/ui`, alias `@/`, tema CSS, `cn`, App Router, Sonner, Zod y utilidades de error si resultan pertinentes. Extender tokens y variantes semánticas en el primer ticket. Crear contratos de dominio y estado compartido porque no existen. No llevar el ejemplo de User/Prisma al estacionamiento.

## Riesgos y ajustes

- Página y metadatos iniciales no representan el producto; reemplazarlos en el ticket visual.
- Tema neutral y estilos rígidos de componentes comunes difieren del diseño objetivo.
- `DataTable` ya no contiene `any`, pero requiere adaptación a `Table` shadcn y mobile first antes de su uso.
- No hay diseño administrativo; diseñarlo sobre los mismos tokens, sin inventar control físico de cocheras.
- `node_modules` inicial solo contenía `.pnpm`; los primeros `lint`/`build` fallaron por falta de ejecutables. Tras `pnpm install --frozen-lockfile`, la primera validación detectó errores preexistentes de tipado/lint en `GenericModal`, `DataTable`, DTOs de usuario y handlers de toast/error. Se corrigieron sin agregar funcionalidad del estacionamiento. `pnpm lint` y `pnpm build` terminaron limpios.

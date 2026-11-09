# Estacionamiento La Plaza

Sistema para una playa atendida por empleados. La entrega planificada es una **demo frontend interactiva** de ingreso, estadía, cobro, egreso, caja y administración con datos simulados. El código actual sigue siendo una plantilla; la implementación se hará por tickets.

## Stack y estado verificados

Next.js 16.2.0, React 19.2.4, TypeScript 5 estricto, App Router, Tailwind CSS 4, shadcn/ui con Radix y CVA, Hugeicons, Axios, Zod, Sonner, Framer Motion y pnpm 10.20.0. Prisma 7.5/PostgreSQL están configurados en la plantilla y quedan fuera de la demo. Solo existe la ruta `/` con la pantalla inicial de Next; no hay autenticación ni operaciones del estacionamiento. Ver [investigación](docs/estacionamiento/investigacion-repositorio.md).

## Desarrollo

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

`dev` usa el puerto 3000. `pnpm exec tsc --noEmit` permite comprobar tipos. No hay scripts `test` ni `typecheck`. La demo no requiere base de datos, migraciones ni las variables de `.env.example` de la plantilla. No ejecutar `migrate`, `migrate:deploy` ni `reset` para esta etapa.

## Estructura y documentación

`src/app` contiene la ruta y tema; `src/components/ui` las primitivas shadcn; `src/components/common` dos componentes genéricos heredados sujetos a revisión. `src/server` y `prisma` son ejemplos de backend de usuarios, fuera de alcance. `recursos/stitch_sistema_la_plaza_estacionamiento` contiene referencias visuales, no código de producción.

La [guía de documentación](docs/estacionamiento/README.md) es el punto de entrada para cada ticket. [AGENTS.md](AGENTS.md) fija las reglas del producto; `CLAUDE.md` remite a ellas. Las [convenciones técnicas suministradas](docs/estacionamiento/convenciones-tecnicas-base.md) se conservan en el repositorio.

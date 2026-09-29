# LuxHome Inmobiliaria

Web de [Lux Home Inmobiliaria](https://luxhomein.com) (Santa Perpètua de Mogoda, Vallès Occidental): catálogo de inmuebles sincronizado con Inmovilla, captación de vendedores con valorador online, páginas por municipio y panel de administración con solicitudes y estadísticas.

## Tecnologías

| Área | Tecnología |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, `proxy.ts` en lugar de middleware) con React 19 y TypeScript |
| Estilos | Tailwind CSS v4 (`@tailwindcss/postcss`), tokens de diseño en `src/app/globals.css` |
| Tipografías | Cormorant Garamond (títulos) y Jost (texto) vía `next/font` |
| Iconos | [Phosphor Icons](https://phosphoricons.com) (`@phosphor-icons/react`) |
| Base de datos | PostgreSQL en [Neon](https://neon.tech), ORM [Prisma 7](https://www.prisma.io) con `@prisma/adapter-pg` |
| i18n | `next-intl` (textos en `messages/`; ahora mismo solo está activo `es`, sin prefijo en la URL) |
| Datos de inmuebles | Feed XML de Inmovilla (recomendado) o API REST de Inmovilla, sincronizados a la base de datos |
| Emails | [Resend](https://resend.com) |
| Avisos por WhatsApp | [CallMeBot](https://www.callmebot.com) (opcional) |
| Hosting | [Vercel](https://vercel.com) (incluye el cron de sincronización). También hay `Dockerfile` |

## Funcionalidades

- **Catálogo** (`/propiedades`, `/propiedades/[id]`): filtros, comparador, favoritos, vista rápida, calculadora de hipoteca y formulario de contacto por inmueble.
- **Venta** (`/vender-mi-inmueble`): valorador online en 3 pasos que da una horquilla orientativa con inmuebles comparables de la propia cartera (`src/lib/valuation.ts`).
- **Páginas por municipio** (`/vender-mi-inmueble/[municipio]`): 66 páginas SEO para el Vallès Occidental, Vallès Oriental y Barcelonès con datos reales de la cartera (`src/data/sellZones.ts`).
- **Solicitudes**: cada formulario crea un `Lead` y avisa a la agencia por email y WhatsApp (`src/lib/notify.ts`).
- **Analítica propia sin cookies**: visitas, embudo del valorador y clics de contacto (`/api/track`, `src/components/analytics/Tracker.tsx`).
- **Panel de administración** (`/admin`): resumen y sincronización, editor de traducciones, bandeja de solicitudes con estados y notas, y estadísticas.
- **Sincronización con Inmovilla**: cron diario, webhook y subida manual del XML desde el panel.
- **SEO**: sitemap, robots, datos estructurados (RealEstateAgent, RealEstateListing, FAQPage, BreadcrumbList), Open Graph y `llms.txt`.

## Requisitos

- Node.js 22 o superior (el `Dockerfile` usa `node:22-alpine`)
- npm
- Una base de datos PostgreSQL: Neon (recomendado) o local con Docker (`docker-compose.yml`)

## Arrancar en local

```bash
# 1. Dependencias (ejecuta también `prisma generate` en postinstall)
npm install

# 2. Variables de entorno
cp .env.example .env
#    y rellena al menos DATABASE_URL (ver tabla de variables)

# 3. Base de datos
#    Opción A: Neon → pega la connection string en DATABASE_URL
#    Opción B: local con Docker
docker compose up -d
#    DATABASE_URL="postgresql://luxhome:luxhome@localhost:5432/luxhome"

# 4. Crear las tablas
npx prisma migrate deploy

# 5. (Opcional) datos de ejemplo
npm run seed

# 6. Servidor de desarrollo
npm run dev
```

La web queda en <http://localhost:3000> y el panel en <http://localhost:3000/admin> (requiere `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `ADMIN_SECRET`).

Para cargar inmuebles reales: define `INMOVILLA_XML_URL` y pulsa **Sincronizar con Inmovilla** en el panel, o sube el fichero XML desde el mismo panel.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run seed` | Carga datos de ejemplo (`prisma/seed.ts`) |
| `npx prisma migrate deploy` | Aplica las migraciones pendientes |
| `npx prisma migrate dev --name <nombre>` | Crea una migración nueva tras cambiar `prisma/schema.prisma` (necesita una base de datos de desarrollo, no la de producción) |
| `npx prisma studio` | Explorador visual de la base de datos |

## Variables de entorno

Plantilla completa y comentada en [`.env.example`](.env.example). En Vercel se configuran en **Settings → Environment Variables** y requieren **Redeploy** para aplicarse.

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión PostgreSQL (Neon) |
| `INMOVILLA_XML_URL` | Feed XML de Inmovilla. Si está definida, la sincronización usa el XML |
| `INMOVILLA_TOKEN`, `INMOVILLA_SYNC_DELAY_MS` | API REST de Inmovilla (alternativa al XML) |
| `INMOVILLA_NUMAGENCIA`, `INMOVILLA_PASSWORD`, `INMOVILLA_IDIOMA`, `INMOVILLA_ADD_AGENCIA`, `NEXT_PUBLIC_SITE_DOMAIN` | Cliente APIWEB de Inmovilla (`src/lib/inmovilla/apiwebClient.ts`) |
| `INMOVILLA_WEBHOOK_SECRET` | Secreto de la cabecera `x-inmovilla-secret` del webhook |
| `CRON_SECRET` | Protege `GET /api/sync`. Vercel Cron lo envía como `Authorization: Bearer ...` |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Acceso a `/admin` |
| `ADMIN_SECRET` | Firma HMAC de la cookie de sesión del admin |
| `RESEND_API_KEY` | Envío de emails |
| `EMAIL_FROM` | Remitente (dominio verificado en Resend) |
| `LEADS_NOTIFY_EMAILS` | Destinatarios de los avisos de solicitudes, separados por comas |
| `WHATSAPP_NOTIFY` | Avisos por WhatsApp vía CallMeBot: `numero:apikey,numero:apikey` (opcional) |
| `SITE_URL` | URL pública para los enlaces de los emails |

Qué falta configurar en producción: ver [`docs/PUESTA-EN-MARCHA.md`](docs/PUESTA-EN-MARCHA.md).

## Base de datos

Esquema en [`prisma/schema.prisma`](prisma/schema.prisma), configuración de conexión en `prisma.config.ts` (Prisma 7 ya no admite `url` en el esquema) y cliente en `src/lib/db.ts`.

| Modelo | Contenido |
|---|---|
| `Property`, `PropertyFeatures`, `PropertyLocation`, `PropertyImage` | Inmuebles sincronizados desde Inmovilla |
| `Lead` | Solicitudes de contacto, de inmueble y de valoración, con estado de seguimiento, notas, datos del valorador y origen (página y campaña UTM) |
| `AnalyticsEvent` | Eventos de analítica propia (sin IP ni identificadores) |
| `Translation` | Textos editados desde el panel, que sobrescriben `messages/*.json` |
| `SyncLog` | Historial de sincronizaciones (cron, webhook y manual) |

Las migraciones están en `prisma/migrations/`. En producción se aplican con `npx prisma migrate deploy`.

## Sincronización con Inmovilla

- **Cron diario**: `vercel.json` llama a `GET /api/sync` a las 06:00 UTC. Solo funciona en el despliegue de producción y con `CRON_SECRET` definida para Production.
- **Webhook**: `POST /api/inmovilla/webhook` actualiza un inmueble cuando Inmovilla lo notifica.
- **Manual**: desde `/admin` (botón de sincronizar o subida del XML).
- Cada ejecución queda registrada en `SyncLog` y se ve en el panel.

## Estructura

```
src/
  app/
    [locale]/                 Páginas públicas (inicio, propiedades, vender, contacto, legales)
      vender-mi-inmueble/[municipio]/   Páginas de captación por municipio
    admin/
      login/                  Acceso al panel
      (panel)/                Resumen, solicitudes, estadísticas (layout con pestañas)
    api/                      contact, valuation, track, sync, inmovilla/webhook, admin/*
    sitemap.ts, robots.ts, opengraph-image.tsx
  components/                 layout, properties, sell (valorador y secciones de venta), admin, analytics, ui
  data/                       Municipios de Cataluña y zonas de captación (fuente: Idescat)
  lib/                        db, propertyService, valuation, notify, leads, track, seo, auth, inmovilla/*
  i18n/                       Configuración de next-intl
  proxy.ts                    i18n y protección de /admin
messages/                     Textos es / ca / en
prisma/                       Esquema, migraciones y seed
docs/                         Documentación operativa
```

## Despliegue

**Vercel** (actual): cada push a `main` despliega a producción. El proyecto necesita las variables de entorno de la tabla anterior; las migraciones de Prisma **no** se aplican solas en el build, hay que ejecutar `npx prisma migrate deploy` contra la base de datos de producción cuando haya migraciones nuevas.

**Docker**: `Dockerfile` multi-stage con salida `standalone` de Next.js.

```bash
docker build -t luxhome .
docker run -p 3000:3000 --env-file .env luxhome
```

## Notas para desarrollar

- Esta versión de Next.js tiene cambios respecto a versiones anteriores: consulta la guía en `node_modules/next/dist/docs/` antes de usar una API (por ejemplo, `priority` en `next/image` pasa a ser `preload`, y `middleware.ts` pasa a ser `proxy.ts`).
- Normalización de topónimos (acentos, apóstrofos, guiones) en `src/lib/utils.ts`. Los nombres de municipio que Inmovilla escribe distinto al oficial van en `MUNICIPALITY_ALIASES`.
- Diseño: un solo sistema de radios (paneles 28px, tarjetas 24px, campos 14px, botones en píldora) y una única paleta de marca (rosa `#deaec2` y malva `#9a5b7b`). Tokens en `globals.css`.

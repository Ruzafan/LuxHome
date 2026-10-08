# Puesta en marcha: captación de vendedores

Qué falta configurar para que funcionen el valorador online, los avisos de solicitudes y las páginas por municipio en producción. Ordenado por prioridad.

> Estado a 29/09/2026: el código está desplegado y la migración de base de datos ya está aplicada en Neon. Mientras no se complete el paso 1 y 2, las solicitudes **se guardan** en el panel (`/admin/solicitudes`) pero **los emails no llegan al equipo**.

---

## 0. Solución inmediata: Gmail por SMTP (sin tocar DNS)

Mientras el dominio no esté verificado en Resend, los emails se pueden enviar desde una cuenta de Gmail. Si `SMTP_USER` y `SMTP_PASS` están definidas, se usan en lugar de Resend.

1. En la cuenta de Gmail que enviará los avisos, activar la **verificación en 2 pasos**.
2. Ir a <https://myaccount.google.com/apppasswords>, crear una contraseña de aplicación ("LuxHome web") y copiar los 16 caracteres (sin espacios).
3. En Vercel (Production) añadir `SMTP_USER` = la dirección de Gmail y `SMTP_PASS` = esa contraseña. Redeploy.

El remitente será esa dirección de Gmail. Límite aproximado: 500 emails/día. Cuando Resend esté verificado, basta con borrar `SMTP_USER`/`SMTP_PASS` para volver a Resend.

## 1. Resend (envío de emails)

Resend envía el aviso de cada solicitud a la agencia y la confirmación al propietario. Plan gratuito: 3.000 emails/mes, 100/día (de sobra para este volumen).

1. Crear cuenta en <https://resend.com> con un email de la agencia.
2. **Domains → Add domain** → `luxhomein.com` (región EU).
3. Resend mostrará 3 o 4 registros DNS (DKIM en `resend._domainkey`, y SPF + MX en el subdominio `send`). Anotarlos tal cual.
4. **API Keys → Create API key** (permiso *Sending access*). Guardarla: solo se muestra una vez. Es el valor de `RESEND_API_KEY`.

Hasta que el dominio esté verificado, Resend solo entrega emails a la dirección con la que se creó la cuenta.

## 2. Registros DNS en el proveedor del dominio

El proveedor actual no da acceso al panel del dominio, así que hay que pedírselo **desde el correo autorizado de la agencia** (o desde "Mi oficina"), igual que el cambio para Vercel.

Pedir que **añadan** los registros de Resend del paso 1 sin cambiar los servidores DNS ni tocar los registros de correo existentes. Los registros de Resend van en subdominios (`send.luxhomein.com`, `resend._domainkey.luxhomein.com`), así que no afectan a los buzones actuales (bego@, monica@...).

Plantilla de correo:

> Asunto: Añadir registros DNS para luxhomein.com (envío de emails)
>
> Hola,
>
> Os escribimos desde Lux Home Inmobiliaria como titulares del dominio luxhomein.com. Necesitamos que añadáis estos registros en la zona actual, **sin cambiar los servidores DNS y sin modificar los registros de correo existentes (MX, SPF del dominio principal, etc.)**:
>
> - Tipo TXT, host `resend._domainkey` → *(valor que da Resend)*
> - Tipo MX, host `send` → *(valor que da Resend)*, prioridad 10
> - Tipo TXT, host `send` → *(valor que da Resend)*
>
> Gracias,
> Lux Home Inmobiliaria

Cuando los añadan, pulsar **Verify** en Resend (puede tardar unas horas en propagarse).

## 3. Variables de entorno en Vercel

**Vercel → Project → Settings → Environment Variables**, entorno **Production**. Después de añadirlas o cambiarlas hay que hacer **Deployments → ⋯ → Redeploy**, si no, no se aplican.

| Variable | Valor | Obligatoria |
|---|---|---|
| `SMTP_USER` / `SMTP_PASS` | Gmail y contraseña de aplicación (paso 0). Si están, tienen prioridad sobre Resend | Sí, si no hay Resend |
| `RESEND_API_KEY` | La API key del paso 1 | Sí, si no hay SMTP |
| `EMAIL_FROM` | `LuxHome <avisos@luxhomein.com>` (cualquier dirección `@luxhomein.com` una vez verificado el dominio). Se ignora con SMTP | Con Resend |
| `LEADS_NOTIFY_EMAILS` | Quién recibe las solicitudes, separados por comas. Ejemplo: `bego@luxhomein.com,monica@luxhomein.com` | Sí (si está vacía, los avisos van solo a marcramiro@gmail.com) |
| `SITE_URL` | `https://luxhomein.com` | Sí |
| `WHATSAPP_NOTIFY` | Ver paso 4. Formato `34600111222:apikey,34600333444:apikey` | No |

Ya existentes y necesarias (comprobar que siguen en Production): `DATABASE_URL`, `INMOVILLA_XML_URL`, `CRON_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SECRET`, `INMOVILLA_WEBHOOK_SECRET`.

**Pendiente de decidir:** a qué correos deben llegar las solicitudes.

## 4. Avisos por WhatsApp (opcional)

Usa [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/), gratuito para avisos al propio móvil. Cada persona que quiera recibir avisos:

1. Guarda en contactos el número de CallMeBot que indica su web.
2. Le envía por WhatsApp el mensaje de activación que indica su web (*"I allow callmebot to send me messages"*).
3. Recibe una **apikey** por WhatsApp.

Con cada número y su apikey se rellena `WHATSAPP_NOTIFY` en Vercel: `34600111222:1234567,34600333444:7654321` (número con prefijo 34, sin `+` ni espacios).

Alternativa oficial: API de WhatsApp Business (Meta). Requiere verificar la empresa y aprobar plantillas de mensaje; solo compensa si se quiere escribir automáticamente a los clientes, no para avisos internos.

**Pendiente de decidir:** qué móviles reciben los avisos.

## 5. Comprobar que todo funciona

1. Rellenar el valorador en <https://luxhomein.com/vender-mi-inmueble> con datos de prueba y un email propio.
2. Deben llegar: el email a `LEADS_NOTIFY_EMAILS`, la confirmación al email del formulario y, si está configurado, el WhatsApp.
3. La solicitud aparece en `/admin/solicitudes`. Marcarla como **Descartada** para que no cuente en las estadísticas de captación.
4. Si no llega el email: **Vercel → Logs**, buscar líneas `[notify]` (dicen qué variable falta o qué error devuelve Resend o el SMTP). Con Gmail, un error `535` significa que `SMTP_PASS` no es una contraseña de aplicación válida.

## 6. Google Search Console

Cuando `luxhomein.com` apunte a Vercel:

1. Dar de alta la propiedad `luxhomein.com` en <https://search.google.com/search-console> (verificación por registro TXT: pedirlo al proveedor del dominio como en el paso 2).
2. **Sitemaps → Add** → `https://luxhomein.com/sitemap.xml`. Incluye la página de vender y las 66 páginas por municipio.

## 7. Textos legales (revisión de la agencia)

- **Política de privacidad**: añadir el tratamiento de los datos del valorador (nombre, teléfono, email opcional y datos del inmueble), finalidad (contactar para la valoración) y plazo de conservación. El formulario ya exige aceptar la política.
- **Política de cookies**: la analítica propia no usa cookies ni identificadores (solo guarda la campaña de origen en `sessionStorage` durante la visita). Se puede mencionar en la política como analítica sin cookies.
- En `aviso-legal` y `privacidad` siguen marcados en amarillo los datos pendientes: razón social y CIF/NIF.

## 8. Ajustes de negocio a revisar con el equipo

- **Factores del valorador** (`src/lib/valuationOptions.ts`): a reformar −12 %, reformado +7 %, obra nueva +12 %, ascensor +4 %, terraza +3 %, parking +3 %, piscina +4 %, jardín +3 %. Son valores iniciales razonables; conviene ajustarlos con la experiencia de la agencia.
- **Municipios con otro nombre en Inmovilla**: si una propiedad no aparece al filtrar o valorar por su municipio, añadir el nombre que usa Inmovilla en `MUNICIPALITY_ALIASES` (`src/data/catalanMunicipalities.ts`).

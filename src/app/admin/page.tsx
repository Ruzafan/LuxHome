import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { db } from '@/lib/db';
import type { SyncLog, Lead } from '@prisma/client';
import UploadForm from '@/components/admin/UploadForm';
import SyncButton from '@/components/admin/SyncButton';
import LogoutButton from '@/components/admin/LogoutButton';
import TranslationEditor from '@/components/admin/TranslationEditor';

export const metadata = { title: 'Panel Admin | LuxHome' };

export default async function AdminPage() {
  // Doble comprobación de sesión (el proxy ya redirige, pero por seguridad)
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect('/admin/login');
  }

  // La base de datos es opcional: el sitio puede funcionar con datos mock.
  // Si DATABASE_URL no está configurada o hay error de conexión, mostramos
  // el panel igualmente con valores a cero y un aviso.
  let total = 0, disponibles = 0, destacadas = 0, totalLeads = 0;
  let logs: SyncLog[] = [];
  let leads: Lead[] = [];
  let dbError: string | null = null;

  try {
    [total, disponibles, destacadas, totalLeads, logs, leads] = await Promise.all([
      db.property.count(),
      db.property.count({ where: { status: 'disponible' } }),
      db.property.count({ where: { isFeatured: true } }),
      db.lead.count(),
      db.syncLog.findMany({ orderBy: { triggeredAt: 'desc' }, take: 15 }),
      db.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Error de conexión con la base de datos';
  }

  return (
    <div className="min-h-screen bg-[#0f1f3d]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.3em] uppercase">LuxHome</p>
          <h1
            className="text-white font-bold text-xl"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Panel de Administración
          </h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ── Aviso si la BD no está configurada ────────────────────────── */}
        {dbError && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-4">
            <p className="text-amber-400 font-semibold text-sm mb-1">Base de datos no conectada</p>
            <p className="text-white/50 text-xs">
              Para ver estadísticas e historial, configura la variable{' '}
              <code className="text-white/70 bg-white/10 px-1 rounded">DATABASE_URL</code> en Vercel
              y ejecuta las migraciones de Prisma. La subida de ficheros seguirá fallando hasta entonces.
            </p>
            <p className="text-white/30 text-xs mt-2 font-mono">{dbError}</p>
          </div>
        )}

        {/* ── Resumen ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-white/50 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Resumen
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total inmuebles', value: total },
              { label: 'Disponibles', value: disponibles },
              { label: 'Destacados', value: destacadas },
              { label: 'Leads recibidos', value: totalLeads },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <p
                  className="text-[#c9a84c] font-bold text-3xl"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {value}
                </p>
                <p className="text-white/60 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sincronización ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subir fichero */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2
              className="text-white font-semibold text-lg mb-1"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Subir fichero Inmovilla
            </h2>
            <p className="text-white/50 text-sm mb-5">
              Sube un fichero JSON exportado desde Inmovilla para importar
              o actualizar inmuebles manualmente.
            </p>
            <UploadForm />
          </section>

          {/* Sincronización completa */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2
              className="text-white font-semibold text-lg mb-1"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Sincronización completa
            </h2>
            <p className="text-white/50 text-sm mb-5">
              Conecta con la API de Inmovilla y descarga todos los inmuebles
              activos. Requiere las credenciales de API configuradas.
            </p>
            <SyncButton />
          </section>
        </div>

        {/* ── Traducciones ──────────────────────────────────────────────── */}
        <TranslationEditor />

        {/* ── Leads ─────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-white/50 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Últimos leads ({totalLeads} total)
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {leads.length === 0 ? (
              <p className="text-white/40 text-sm p-6">Sin leads aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Fecha', 'Nombre', 'Email', 'Teléfono', 'Propiedad', 'Motivo'].map((h) => (
                        <th key={h} className="text-white/40 font-medium px-5 py-3 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                        <td className="text-white/50 px-5 py-3 whitespace-nowrap text-xs">
                          {new Date(lead.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="text-white/80 px-5 py-3 whitespace-nowrap">
                          {lead.nombre}{lead.apellidos ? ` ${lead.apellidos}` : ''}
                        </td>
                        <td className="px-5 py-3">
                          <a href={`mailto:${lead.email}`} className="text-[#c9a84c] hover:underline">{lead.email}</a>
                        </td>
                        <td className="text-white/60 px-5 py-3 whitespace-nowrap">{lead.telefono ?? '—'}</td>
                        <td className="px-5 py-3">
                          {lead.propertyRef
                            ? <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded">{lead.propertyRef}</span>
                            : <span className="text-white/30">—</span>}
                        </td>
                        <td className="text-white/60 px-5 py-3 max-w-xs truncate">{lead.asunto ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── Historial ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-white/50 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Historial de sincronizaciones
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {logs.length === 0 ? (
              <p className="text-white/40 text-sm p-6">Sin registros aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Fecha', 'Origen', 'Estado', 'Creados', 'Actualizados', 'Eliminados'].map(
                        (h) => (
                          <th
                            key={h}
                            className={`text-white/40 font-medium px-5 py-3 ${
                              ['Creados', 'Actualizados', 'Eliminados'].includes(h)
                                ? 'text-right'
                                : 'text-left'
                            }`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/5 transition"
                      >
                        <td className="text-white/70 px-5 py-3 whitespace-nowrap">
                          {new Date(log.triggeredAt).toLocaleString('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-white/70 capitalize">{log.source}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                              log.status === 'ok'
                                ? 'bg-green-500/15 text-green-400'
                                : 'bg-red-500/15 text-red-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                log.status === 'ok' ? 'bg-green-400' : 'bg-red-400'
                              }`}
                            />
                            {log.status === 'ok' ? 'OK' : 'Error'}
                          </span>
                        </td>
                        <td className="text-right text-white/70 px-5 py-3">
                          +{log.propertiesCreated}
                        </td>
                        <td className="text-right text-white/70 px-5 py-3">
                          ~{log.propertiesUpdated}
                        </td>
                        <td className="text-right text-white/70 px-5 py-3">
                          -{log.propertiesDeleted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

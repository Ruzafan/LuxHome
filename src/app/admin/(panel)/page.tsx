import Link from 'next/link';
import { db } from '@/lib/db';
import type { SyncLog } from '@prisma/client';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/leads';
import UploadForm from '@/components/admin/UploadForm';
import SyncButton from '@/components/admin/SyncButton';
import TranslationEditor from '@/components/admin/TranslationEditor';

export default async function AdminPage() {
  // La base de datos es opcional: el sitio puede funcionar con datos mock.
  // Si DATABASE_URL no está configurada o hay error de conexión, mostramos
  // el panel igualmente con valores a cero y un aviso.
  let total = 0, disponibles = 0, nuevas = 0, captadas = 0;
  let logs: SyncLog[] = [];
  let byStatus: Record<string, number> = {};
  let dbError: string | null = null;

  try {
    const [t, d, l, grouped] = await Promise.all([
      db.property.count(),
      db.property.count({ where: { status: 'disponible' } }),
      db.syncLog.findMany({ orderBy: { triggeredAt: 'desc' }, take: 15 }),
      db.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    total = t;
    disponibles = d;
    logs = l;
    byStatus = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));
    nuevas = byStatus.nueva ?? 0;
    captadas = byStatus.captada ?? 0;
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Error de conexión con la base de datos';
  }

  return (
    <>
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Total inmuebles', value: total },
              { label: 'Disponibles', value: disponibles },
              { label: 'Solicitudes sin atender', value: nuevas },
              { label: 'Captaciones', value: captadas },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <p
                  className="text-[var(--rose)] text-3xl"
                 
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
            <h2 className="text-white font-semibold text-lg mb-1">
              Subir fichero XML
            </h2>
            <p className="text-white/50 text-sm mb-5">
              Sube el fichero XML de Inmovilla (<code className="text-white/70 bg-white/10 px-1 rounded text-xs">2-web.xml</code>) para una carga inicial o actualización manual.
            </p>
            <UploadForm />
          </section>

          {/* Sincronización completa */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-semibold text-lg mb-1">
              Sincronización automática
            </h2>
            <p className="text-white/50 text-sm mb-5">
              Descarga el feed XML de Inmovilla y sincroniza todos los inmuebles activos. También se ejecuta automáticamente cada noche.
            </p>
            <SyncButton />
          </section>
        </div>

        {/* ── Traducciones ──────────────────────────────────────────────── */}
        <TranslationEditor />

        {/* ── Embudo de solicitudes ───────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm text-white/60">Estado de las solicitudes</h2>
            <Link href="/admin/solicitudes" className="text-sm text-[var(--rose)] hover:underline">
              Ver solicitudes
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {(Object.keys(LEAD_STATUSES) as LeadStatus[]).map((status) => (
              <Link
                key={status}
                href={`/admin/solicitudes?estado=${status}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <p className="text-2xl text-white">{byStatus[status] ?? 0}</p>
                <p className="mt-1 text-xs text-white/50">{LEAD_STATUSES[status]}</p>
              </Link>
            ))}
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
    </>
  );
}

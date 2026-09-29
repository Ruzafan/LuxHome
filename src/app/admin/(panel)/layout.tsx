import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import LogoutButton from '@/components/admin/LogoutButton';
import AdminTabs from '@/components/admin/AdminTabs';

export const metadata = { title: 'Panel Admin | LuxHome', robots: { index: false, follow: false } };

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Doble comprobación de sesión (el proxy ya redirige, pero por seguridad)
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[var(--navy)]">
      <header className="border-b border-white/10 px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-xs text-[var(--rose)]">LuxHome</p>
            <h1 className="text-xl font-normal text-white">Panel de administración</h1>
          </div>
          <LogoutButton />
        </div>
        <AdminTabs />
      </header>
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">{children}</main>
    </div>
  );
}

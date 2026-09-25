export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header skeleton, same shape as PageHeader */}
      <div className="px-2 pt-2 md:px-3 md:pt-3">
        <div className="rounded-[var(--radius-panel)]" style={{ background: 'var(--dark)' }}>
          <div className="container-lux pb-12 pt-32 md:pb-16 md:pt-36">
            <div className="mb-4 h-4 w-32 animate-pulse rounded-full bg-white/15" />
            <div className="mb-3 h-12 w-72 animate-pulse rounded-full bg-white/15" />
            <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      <div className="container-lux flex flex-col gap-8 py-10 lg:flex-row">
        <aside className="hidden shrink-0 lg:block lg:w-72">
          <div className="space-y-5 rounded-[var(--radius-card)] bg-white p-6" style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded-full bg-[var(--bg2)]" />
                <div className="h-11 animate-pulse rounded-[var(--radius-input)] bg-[var(--bg2)]" />
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[var(--radius-card)] bg-white p-2" style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                <div className="aspect-[4/3] animate-pulse rounded-[18px] bg-[var(--bg2)]" />
                <div className="space-y-3 px-3 pb-3 pt-4">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-[var(--bg2)]" />
                  <div className="h-7 w-32 animate-pulse rounded-full bg-[var(--bg2)]" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-[var(--bg2)]" />
                  <div className="flex gap-4 pt-2">
                    <div className="h-3 w-12 animate-pulse rounded-full bg-[var(--bg2)]" />
                    <div className="h-3 w-12 animate-pulse rounded-full bg-[var(--bg2)]" />
                    <div className="h-3 w-16 animate-pulse rounded-full bg-[var(--bg2)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesLoading() {
  return (
    <div className="pt-20 bg-[#faf8f3] min-h-screen">
      {/* Hero skeleton */}
      <div className="luxury-gradient py-12 px-6 text-center">
        <div className="h-4 w-32 bg-white/20 rounded mx-auto mb-3 animate-pulse" />
        <div className="h-8 w-48 bg-white/20 rounded mx-auto mb-2 animate-pulse" />
        <div className="h-4 w-24 bg-white/10 rounded mx-auto animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </aside>

        {/* Cards skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="h-52 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="flex gap-4 pt-2 border-t border-gray-100">
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
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

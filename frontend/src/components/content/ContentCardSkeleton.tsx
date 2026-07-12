export function ContentCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm h-full flex flex-col justify-between animate-pulse">
      {/* Top Image area */}
      <div className="h-44 w-full bg-slate-200/80" />

      {/* Middle contents */}
      <div className="p-5 flex-1 space-y-4">
        {/* Title */}
        <div className="h-6 w-3/4 bg-slate-200 rounded" />

        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-5/6 bg-slate-200 rounded" />
        </div>

        {/* Collection & Tags */}
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-200 rounded" />
          <div className="h-5 w-16 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="p-5 border-t border-slate-100 flex items-center justify-between gap-4">
        <div className="h-5 w-24 bg-slate-200 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-200 rounded-lg" />
          <div className="h-8 w-8 bg-slate-200 rounded-lg" />
          <div className="h-8 w-8 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ContentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default ContentCardSkeleton;

export function SkeletonBookCard() {
  return (
    <div className="h-full rounded-lg border border-white/80 bg-white/75 p-3 shadow-card">
      <div className="grid grid-cols-[92px_1fr] gap-4">
        <div className="aspect-[2/3] w-[92px] animate-pulse rounded-lg bg-line" />
        <div className="min-w-0 space-y-3">
          <div className="flex gap-2">
            <div className="h-7 w-20 animate-pulse rounded-full bg-line" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-line" />
          </div>
          <div className="h-5 w-4/5 animate-pulse rounded bg-line" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-line" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full animate-pulse rounded bg-line" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-line" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-line" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_1fr_44px] gap-2">
        <div className="h-10 animate-pulse rounded-lg bg-line" />
        <div className="h-10 animate-pulse rounded-lg bg-line" />
        <div className="h-10 animate-pulse rounded-lg bg-line" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBookCard key={index} />
      ))}
    </div>
  );
}

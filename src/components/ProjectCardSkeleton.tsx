export function ProjectCardSkeleton() {
  return (
    <div className="relative bg-card-bg border border-card-border rounded-xl p-4 sm:p-5 animate-pulse">
      {/* Pin button skeleton */}
      <div className="absolute top-2 right-2 w-10 h-10 bg-muted/20 rounded-lg" />

      {/* Repo name */}
      <div className="h-6 bg-muted/20 rounded w-3/4 mb-2 pr-8" />

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-muted/20 rounded w-full" />
        <div className="h-4 bg-muted/20 rounded w-2/3" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-3">
        {/* Language badge */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted/20" />
          <div className="h-3 bg-muted/20 rounded w-16" />
        </div>
        {/* Star count */}
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 bg-muted/20 rounded" />
          <div className="h-3 bg-muted/20 rounded w-8" />
        </div>
        {/* Fork count */}
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 bg-muted/20 rounded" />
          <div className="h-3 bg-muted/20 rounded w-6" />
        </div>
      </div>

      {/* Last updated */}
      <div className="h-3 bg-muted/20 rounded w-32" />
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 h-11 bg-card-bg border border-card-border rounded-lg animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-card-border bg-card-bg p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-muted/20 rounded" />
              <div className="h-4 bg-muted/20 rounded w-20" />
            </div>
            <div className="h-8 bg-muted/20 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-2">
        <div className="h-11 w-32 bg-card-bg border border-card-border rounded-lg animate-pulse" />
        <div className="h-11 w-32 bg-card-bg border border-card-border rounded-lg animate-pulse" />
        <div className="h-11 w-32 bg-card-bg border border-card-border rounded-lg animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

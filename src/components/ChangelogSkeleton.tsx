export function ChangelogSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Controls skeleton */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-card-bg border border-card-border rounded-lg p-1 w-64 h-11 animate-pulse">
            <div className="flex gap-2 w-full px-2">
              <div className="h-8 bg-muted/20 rounded flex-1" />
              <div className="h-8 bg-muted/20 rounded flex-1" />
              <div className="h-8 bg-muted/20 rounded flex-1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-10 w-48 bg-card-bg border border-card-border rounded-lg animate-pulse" />
            <div className="h-10 w-36 bg-card-bg border border-card-border rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Day groups skeleton */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="bg-card-bg border border-card-border rounded-lg overflow-hidden animate-pulse"
          >
            {/* Day header */}
            <div className="flex items-center justify-between p-4 sm:px-6">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-4 h-4 bg-muted/20 rounded flex-shrink-0" />
                <div className="h-4 bg-muted/20 rounded w-48" />
                <div className="h-4 bg-muted/20 rounded w-20" />
              </div>
              <div className="w-4 h-4 bg-muted/20 rounded" />
            </div>

            {/* Expanded content (show on first item) */}
            {i === 0 && (
              <div className="border-t border-card-border p-4 sm:p-6 space-y-4">
                {/* Summary paragraph */}
                <div className="space-y-2">
                  <div className="h-4 bg-muted/20 rounded w-full" />
                  <div className="h-4 bg-muted/20 rounded w-5/6" />
                </div>

                {/* Bullet points */}
                <div className="space-y-3 pl-4">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-muted/20 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted/20 rounded w-full" />
                      <div className="h-3 bg-muted/20 rounded w-4/5" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-muted/20 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted/20 rounded w-full" />
                      <div className="h-3 bg-muted/20 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-muted/20 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-muted/20 rounded w-5/6" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

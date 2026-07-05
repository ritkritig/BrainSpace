/**
 * Loading skeleton components for various page states.
 * Uses the .skeleton CSS class for the shimmer animation.
 */

export function NoteCardSkeleton() {
  return (
    <div className="card p-5 space-y-3 animate-pulse">
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-5/6 rounded" />
      <div className="flex gap-2 pt-1">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700/40">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    </div>
  );
}

export function FolderCardSkeleton() {
  return (
    <div className="card p-5 flex items-center gap-4 animate-pulse">
      <div className="skeleton w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="skeleton h-8 w-12 rounded" />
            </div>
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        ))}
      </div>
      {/* Recent notes */}
      <div className="space-y-4">
        <div className="skeleton h-6 w-48 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="skeleton h-10 w-2/3 rounded-xl" />
      <div className="flex gap-2">
        <div className="skeleton h-7 w-16 rounded-full" />
        <div className="skeleton h-7 w-20 rounded-full" />
      </div>
      <div className="card p-4 space-y-3">
        <div className="flex gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/40">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton w-8 h-8 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3 pt-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

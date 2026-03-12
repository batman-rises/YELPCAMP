import { cn } from '../../lib/utils'

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />
}

export function CampgroundCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="w-full sm:w-64 h-48 rounded-none" />
        <div className="p-5 flex-1 flex flex-col gap-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="mt-auto flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

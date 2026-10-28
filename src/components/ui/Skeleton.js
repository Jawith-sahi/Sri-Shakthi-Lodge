import { cn } from "@/lib/utils/cn";

export function Skeleton({ className, ...props }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-md", className)} {...props} />;
}

export function RoomCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-11 w-1/2" />
          <Skeleton className="h-11 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container-page py-10" role="status" aria-label="Loading">
      <Skeleton className="mb-4 h-8 w-1/3" />
      <Skeleton className="mb-8 h-4 w-2/3" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <RoomCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from "@repo/ui";
import AuthCard from "./AuthCard";

export default function AuthPageSkeleton() {
  return (
    <AuthCard>
      <div className="space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-10 w-full" />
      </div>
    </AuthCard>
  )
};

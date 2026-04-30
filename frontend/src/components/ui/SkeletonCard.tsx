import { Card, CardHeader } from "@/components/ui/card";

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-square bg-muted relative shrink-0 animate-pulse" />
      <div className="flex flex-col flex-1 p-3 sm:p-4 pt-0">
        <CardHeader className="p-0 mb-2 space-y-2">
          <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
        </CardHeader>
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-between w-full mt-3">
          <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

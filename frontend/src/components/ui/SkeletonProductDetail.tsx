import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SkeletonProductDetail() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="relative w-full max-w-md mx-auto lg:max-w-none aspect-square lg:aspect-[4/3] bg-foreground/5 rounded-lg animate-pulse" />
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-5 w-24 bg-foreground/10 rounded animate-pulse" />
          <div className="h-8 w-3/4 bg-foreground/10 rounded animate-pulse" />
          <div className="h-9 w-1/3 bg-foreground/10 rounded animate-pulse" />
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="h-5 w-32 bg-foreground/10 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-foreground/10 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-foreground/10 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-foreground/10 rounded animate-pulse" />
          </div>
        </div>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle className="h-5 w-48 bg-foreground/10 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/10 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-foreground/10 rounded animate-pulse" />
                <div className="h-4 w-24 bg-foreground/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/10 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-12 bg-foreground/10 rounded animate-pulse" />
                <div className="h-4 w-32 bg-foreground/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/10 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-foreground/10 rounded animate-pulse" />
                <div className="h-4 w-28 bg-foreground/10 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 flex-wrap">
            <div className="h-10 flex-1 bg-foreground/10 rounded animate-pulse" />
            <div className="h-10 flex-1 bg-foreground/10 rounded animate-pulse" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

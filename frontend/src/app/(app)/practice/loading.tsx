import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function PracticeLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-48" />
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-12 rounded-lg" />)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

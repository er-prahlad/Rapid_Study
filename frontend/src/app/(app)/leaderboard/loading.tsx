import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return <div className="space-y-3">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>;
}

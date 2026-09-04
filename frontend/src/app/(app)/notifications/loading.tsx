import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
}

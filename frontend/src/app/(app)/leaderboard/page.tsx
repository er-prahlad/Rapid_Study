"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { leaderboardApi, LeaderboardPeriod, LeaderboardEntry } from "@/services/leaderboardApi";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getInitials } from "@/lib/utils";
import { Trophy } from "lucide-react";

const PERIODS: { label: string; value: LeaderboardPeriod }[] = [
  { label: "Today",     value: "DAILY" },
  { label: "This Week", value: "WEEKLY" },
  { label: "This Month",value: "MONTHLY" },
  { label: "All Time",  value: "ALL_TIME" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

function Row({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 transition-colors",
      entry.isCurrentUser ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/30",
      isTop3 && "bg-gradient-to-r from-yellow-50/60 to-transparent"
    )}>
      <span className="w-8 text-center text-sm font-bold shrink-0">
        {isTop3 ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
      </span>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={entry.profileImage} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(entry.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", entry.isCurrentUser && "text-primary")}>
          {entry.name}{entry.isCurrentUser && <span className="ml-1 text-xs font-normal opacity-60">(You)</span>}
        </p>
        <p className="text-xs text-muted-foreground">{entry.testsCompleted} tests</p>
      </div>
      <div className="text-right shrink-0 space-y-0.5">
        <p className="text-sm font-bold">{entry.averageScore.toFixed(1)}%</p>
        <p className="text-xs text-muted-foreground">{entry.accuracy.toFixed(1)}% acc</p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("ALL_TIME");

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => leaderboardApi.get(period),
    staleTime: 1000 * 60 * 5,
  });

  const lb = data?.data;
  const entries = lb?.entries ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />Leaderboard
          </h1>
          {lb?.currentUserRank && (
            <p className="text-sm text-muted-foreground mt-0.5">Your rank: #{lb.currentUserRank}</p>
          )}
        </div>
        {lb?.fromCache && <Badge variant="secondary" className="text-xs">Cached</Badge>}
      </div>

      {/* Period tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {PERIODS.map(p => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              period === p.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>
            {p.label}
          </button>
        ))}
      </div>

      {/* List */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-5 w-6 rounded" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No data for this period yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {entries.map(e => <Row key={e.userId} entry={e} />)}
          </div>
        )}
      </Card>
    </div>
  );
}

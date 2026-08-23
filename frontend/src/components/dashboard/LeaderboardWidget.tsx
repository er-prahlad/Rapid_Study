import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { LeaderboardEntry } from "@/types";
import { cn, getInitials } from "@/lib/utils";

interface Props {
  entries: LeaderboardEntry[];
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardWidget({ entries }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
        <Link
          href="/leaderboard"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Full <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <Trophy className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Attempt tests to appear on the leaderboard
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  entry.isCurrentUser
                    ? "bg-primary/5 border border-primary/20"
                    : "hover:bg-muted/40"
                )}
              >
                {/* Rank / medal */}
                <span className="w-6 text-center text-sm font-bold shrink-0">
                  {entry.rank <= 3 ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
                </span>

                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(entry.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      entry.isCurrentUser && "text-primary"
                    )}
                  >
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="text-xs font-normal ml-1">(You)</span>
                    )}
                  </p>
                </div>

                <span className="text-sm font-semibold shrink-0">
                  {Math.round(entry.accuracy)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

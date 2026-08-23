import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { RecentAttempt } from "@/types";
import { formatDate } from "@/lib/utils";

interface Props {
  attempts: RecentAttempt[];
}

function AccuracyBadge({ accuracy }: { accuracy: number }) {
  const pct = Math.round(accuracy);
  if (pct >= 70) return <Badge variant="success">{pct}%</Badge>;
  if (pct >= 50) return <Badge variant="warning">{pct}%</Badge>;
  return <Badge variant="destructive">{pct}%</Badge>;
}

export function RecentAttempts({ attempts }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-primary" />
          Recent Attempts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attempts.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <TrendingUp className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">No attempts yet</p>
            <Link
              href="/tests"
              className="text-sm text-primary hover:underline font-medium"
            >
              Take your first mock test →
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {attempts.map((a) => (
              <Link
                key={a.id}
                href={`/result/${a.id}`}
                className="flex items-center justify-between py-3 hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.testTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(a.submittedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <AccuracyBadge accuracy={a.accuracy} />
                  <span className="text-sm font-bold">
                    {Math.round(a.score)}/{Math.round(a.totalMarks)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

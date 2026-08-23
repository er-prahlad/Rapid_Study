import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { DashboardData } from "@/types";

interface Props {
  target?: DashboardData["dailyTarget"];
}

export function DailyTargetCard({ target }: Props) {
  const qTarget = target?.questionsTarget ?? 20;
  const qDone   = target?.questionsDone   ?? 0;
  const tTarget = target?.testsTarget     ?? 1;
  const tDone   = target?.testsDone       ?? 0;

  const qPct = Math.min(100, qTarget > 0 ? Math.round((qDone / qTarget) * 100) : 0);
  const tPct = Math.min(100, tTarget > 0 ? Math.round((tDone / tTarget) * 100) : 0);
  const allDone = qPct === 100 && tPct === 100;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-primary" />
          Daily Target
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Questions */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Questions practiced</span>
            <span className="font-semibold">
              {qDone} / {qTarget}
            </span>
          </div>
          <Progress value={qPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{qPct}% complete</p>
        </div>

        {/* Tests */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Mock tests taken</span>
            <span className="font-semibold">
              {tDone} / {tTarget}
            </span>
          </div>
          <Progress value={tPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{tPct}% complete</p>
        </div>

        {allDone && (
          <p className="text-sm text-green-600 font-medium text-center bg-green-50 rounded-lg py-2">
            🎉 Daily target complete!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

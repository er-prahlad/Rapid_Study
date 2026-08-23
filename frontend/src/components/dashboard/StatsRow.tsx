import React from "react";
import { BookOpen, Target, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardData } from "@/types";

interface Props {
  stats?: DashboardData["stats"];
}

const statConfig = [
  {
    key: "testsAttempted",
    label: "Tests Taken",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "averageScore",
    label: "Avg Score",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
    suffix: "%",
  },
  {
    key: "accuracy",
    label: "Accuracy",
    icon: Target,
    color: "text-purple-600",
    bg: "bg-purple-50",
    suffix: "%",
  },
  {
    key: "rank",
    label: "Current Rank",
    icon: Trophy,
    color: "text-orange-600",
    bg: "bg-orange-50",
    prefix: "#",
  },
] as const;

export function StatsRow({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statConfig.map(({ key, label, icon: Icon, color, bg, prefix, suffix }: {
        key: string;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        color: string;
        bg: string;
        prefix?: string;
        suffix?: string;
      }) => {
        const raw = stats?.[key as keyof typeof stats] as number | undefined;
        const value = raw !== undefined ? Math.round(raw) : undefined;

        return (
          <Card key={key} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {value !== undefined ? (
                  <>
                    {prefix}
                    {value}
                    {suffix}
                  </>
                ) : (
                  <span className="text-muted-foreground text-lg">—</span>
                )}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

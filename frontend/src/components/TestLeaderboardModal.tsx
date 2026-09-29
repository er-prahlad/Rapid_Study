"use client";

import { useQuery } from "@tanstack/react-query";
import { mockTestApi, TestLeaderboardDto } from "@/services/mockTestApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Award, Target, Users, Clock } from "lucide-react";

interface TestLeaderboardModalProps {
  testId: number | null;
  testTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestLeaderboardModal({
  testId,
  testTitle,
  open,
  onOpenChange,
}: TestLeaderboardModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["test-leaderboard", testId],
    queryFn: () => (testId ? mockTestApi.getLeaderboard(testId) : null),
    enabled: !!testId && open,
  });

  const lb: TestLeaderboardDto | undefined = data?.data;
  const resolvedTitle = lb?.testTitle || testTitle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <DialogTitle className="text-lg font-bold">
              {resolvedTitle ? `${resolvedTitle} — Leaderboard` : "Test Leaderboard"}
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Rank list, top scores, and percentile ranking for this test.
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : !lb || lb.rankings.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="font-semibold text-sm">No attempts yet</p>
            <p className="text-xs">Be the first student to take this test and claim Rank 1!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 py-3">
            {/* Stats Header */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/50 border border-border text-center text-xs">
              <div>
                <p className="text-muted-foreground">Participants</p>
                <p className="text-base font-bold text-foreground mt-0.5">{lb.totalParticipants}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Highest Score</p>
                <p className="text-base font-bold text-emerald-600 mt-0.5">{lb.highestScore} / {lb.totalMarks}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Average Score</p>
                <p className="text-base font-bold text-foreground mt-0.5">{lb.averageScore}</p>
              </div>
            </div>

            {/* My Rank Highlight Card */}
            {lb.myRank ? (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-sm">
                    #{lb.myRank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">Your Rank</p>
                      {lb.myPercentile && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary">
                          {lb.myPercentile}th Percentile
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Score: <strong className="text-foreground">{lb.myScore}</strong> • Accuracy: {lb.myAccuracy}%
                    </p>
                  </div>
                </div>
                {lb.myTimeTakenSeconds && (
                  <div className="text-right text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 justify-end font-mono">
                      <Clock className="h-3 w-3" />
                      {Math.floor(lb.myTimeTakenSeconds / 60)}m {lb.myTimeTakenSeconds % 60}s
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Rank list table */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Top Performers</p>
              {lb.rankings.map((r) => {
                const isPodium = r.rank <= 3;
                return (
                  <div
                    key={r.userId}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                      r.rank === 1
                        ? "bg-amber-500/10 border-amber-500/30"
                        : r.rank === 2
                        ? "bg-slate-200/50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700"
                        : r.rank === 3
                        ? "bg-amber-700/10 border-amber-700/20"
                        : "bg-card border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        r.rank === 1 ? "bg-amber-500 text-white" :
                        r.rank === 2 ? "bg-slate-400 text-white" :
                        r.rank === 3 ? "bg-amber-700 text-white" :
                        "bg-muted text-muted-foreground font-semibold"
                      }`}>
                        {r.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs truncate max-w-[180px]">{r.userName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Accuracy: {r.accuracy}% {r.timeTakenSeconds ? `• ${Math.floor(r.timeTakenSeconds / 60)}m ${r.timeTakenSeconds % 60}s` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">
                        {r.score} <span className="text-[10px] text-muted-foreground font-normal">/ {r.totalMarks}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

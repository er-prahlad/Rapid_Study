"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Sparkles, TrendingUp, BookOpen, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { studentApi } from "@/services/studentApi";

export default function AIPage() {
  const [explanation, setExplanation] = useState("");
  const [analysis, setAnalysis]       = useState("");
  const [studyPlan, setStudyPlan]     = useState("");
  const [questionText, setQuestion]   = useState("");
  const [correctAnswer, setAnswer]    = useState("");

  const { data: aiStatus } = useQuery({
    queryKey: ["ai-status"],
    queryFn: aiApi.status,
    staleTime: 1000 * 60 * 5,
  });

  const isAvailable = aiStatus?.data?.available ?? false;

  const explainMutation = useMutation({
    mutationFn: () => aiApi.explain({ questionText, correctAnswer }),
    onSuccess: d => setExplanation(d.data.explanation),
    onError: () => toast({ title: "Failed to get explanation", variant: "destructive" }),
  });

  const analysisMutation = useMutation({
    mutationFn: aiApi.analyzePerformance,
    onSuccess: d => setAnalysis(d.data.analysis),
    onError: () => toast({ title: "Failed to get analysis", variant: "destructive" }),
  });

  const studyPlanMutation = useMutation({
    mutationFn: () => aiApi.generateStudyPlan({
      examName: "SSC CGL", daysLeft: 30, weakAreas: "General Awareness, Quantitative Aptitude", currentAccuracy: 55,
    }),
    onSuccess: d => setStudyPlan(d.data.studyPlan),
    onError: () => toast({ title: "Failed to generate study plan", variant: "destructive" }),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />AI Assistant
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={isAvailable ? "success" : "secondary"} className="text-xs">
            {isAvailable ? <><Sparkles className="h-3 w-3 mr-1" />AI Active</> : "Rule-based mode"}
          </Badge>
          {!isAvailable && (
            <span className="text-xs text-muted-foreground">
              Add AI_API_KEY to enable AI. Rule-based responses are still helpful.
            </span>
          )}
        </div>
      </div>

      {/* Explain Question */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />Explain a Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y focus-visible:ring-2 focus-visible:ring-ring outline-none"
            placeholder="Paste your question here…"
            value={questionText}
            onChange={e => setQuestion(e.target.value)}
          />
          <textarea
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[50px] resize-y focus-visible:ring-2 focus-visible:ring-ring outline-none"
            placeholder="Correct answer or option…"
            value={correctAnswer}
            onChange={e => setAnswer(e.target.value)}
          />
          <Button size="sm" onClick={() => explainMutation.mutate()}
            disabled={!questionText.trim()} loading={explainMutation.isPending}>
            <Sparkles className="h-4 w-4 mr-2" />Get Explanation
          </Button>
          {explanation && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800 whitespace-pre-wrap">
              {explanation}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Get AI-powered insights based on your test history and accuracy.
          </p>
          <Button size="sm" onClick={() => analysisMutation.mutate()}
            loading={analysisMutation.isPending}>
            <Sparkles className="h-4 w-4 mr-2" />Analyze My Performance
          </Button>
          {analysis && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800 whitespace-pre-wrap">
              {analysis}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Plan */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />Generate Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Get a personalized study plan based on your target exam and performance.
          </p>
          <Button size="sm" onClick={() => studyPlanMutation.mutate()}
            loading={studyPlanMutation.isPending}>
            <Sparkles className="h-4 w-4 mr-2" />Generate Plan
          </Button>
          {studyPlan && (
            <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 text-sm text-purple-800 whitespace-pre-wrap">
              {studyPlan}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

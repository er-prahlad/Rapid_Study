"use client";
import { useQuery } from "@tanstack/react-query";
import { mockTestApi } from "@/services/mockTestApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock, FileText, Target, AlertTriangle,
  CheckCircle2, XCircle, MinusCircle, ArrowLeft, Play,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const INSTRUCTIONS = [
  "Read each question carefully before answering.",
  "Each question has only one correct answer unless stated otherwise.",
  "You can navigate between questions using the question palette.",
  "You can mark a question for review and come back to it later.",
  "Once you submit the test, you cannot change your answers.",
  "The timer is controlled by the server. The test will auto-submit when time expires.",
  "Do not refresh or close the browser during the test.",
  "Your score will be calculated on the server after submission.",
];

function StatBox({ icon: Icon, value, label, color }: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-4 rounded-xl ${color} text-center`}>
      <Icon className="h-5 w-5" />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

export default function TestInstructionsPage({ params }: { params: { id: string } }) {
  const id     = parseInt(params.id, 10);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["test-detail", id],
    queryFn:  () => mockTestApi.getById(id),
    enabled:  !isNaN(id),
  });

  const test = data?.data;

  const handleStart = () => {
    // Phase 23 will implement the actual attempt creation
    router.push(`/attempt/${id}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-12 rounded-lg w-full" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-20 space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto" />
        <p className="text-lg font-medium text-muted-foreground">Test not found</p>
        <Button variant="outline" asChild>
          <Link href="/tests"><ArrowLeft className="h-4 w-4 mr-2" />Back to Tests</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/tests"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to Tests
      </Link>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative">
          {test.examName && (
            <Badge className="bg-white/20 text-white border-0 mb-3 text-xs">{test.examName}</Badge>
          )}
          <h1 className="text-2xl font-bold mb-1">{test.title}</h1>
          {test.description && (
            <p className="text-blue-100 text-sm">{test.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox icon={FileText} value={test.totalQuestions} label="Questions"
          color="bg-blue-50 text-blue-700" />
        <StatBox icon={Target}   value={test.totalMarks}    label="Total Marks"
          color="bg-green-50 text-green-700" />
        <StatBox icon={Clock}    value={`${test.durationMinutes}m`} label="Duration"
          color="bg-orange-50 text-orange-700" />
        <StatBox icon={AlertTriangle} value={test.negativeMarks > 0 ? `-${test.negativeMarks}` : "None"} label="Neg. Marking"
          color={test.negativeMarks > 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-600"} />
      </div>

      {/* Marking Scheme */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Marking Scheme
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-semibold">Correct</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                +{test.totalMarks / test.totalQuestions}
              </p>
              <p className="text-xs text-muted-foreground">marks per question</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="font-semibold">Wrong</span>
              </div>
              <p className="text-lg font-bold text-red-600">
                {test.negativeMarks > 0 ? `-${test.negativeMarks}` : "0"}
              </p>
              <p className="text-xs text-muted-foreground">marks deducted</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-gray-500">
                <MinusCircle className="h-4 w-4" />
                <span className="font-semibold">Skipped</span>
              </div>
              <p className="text-lg font-bold text-gray-500">0</p>
              <p className="text-xs text-muted-foreground">no marks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4">Instructions</h2>
          <ol className="space-y-2">
            {INSTRUCTIONS.map((inst, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{inst}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Separator />

      {/* Start button */}
      <div className="flex flex-col sm:flex-row gap-3 pb-4">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/tests"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
        </Button>
        <Button onClick={handleStart} size="lg" className="flex-1 gap-2">
          <Play className="h-5 w-5" />
          Start Test
        </Button>
      </div>
    </div>
  );
}

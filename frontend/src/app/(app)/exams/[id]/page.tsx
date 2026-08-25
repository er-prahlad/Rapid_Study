"use client";
import { useQuery } from "@tanstack/react-query";
import { examApi } from "@/services/examApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap, BookOpen, Clock, Target, ChevronDown,
  ChevronRight, FileText, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SubjectDto, MockTestSummaryDto } from "@/types/exam";
import { cn } from "@/lib/utils";

// ── Subject accordion item ─────────────────────────────────────────────────

function SubjectAccordion({ subject }: { subject: SubjectDto }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{subject.name}</p>
            {subject.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{subject.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Badge variant="secondary" className="text-xs">
            {subject.topics?.length ?? 0} topics
          </Badge>
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && subject.topics && subject.topics.length > 0 && (
        <div className="border-t bg-muted/20 px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {subject.topics.map((topic) => (
              <div key={topic.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-background text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                {topic.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mock test card ──────────────────────────────────────────────────────────

function TestCard({ test }: { test: MockTestSummaryDto }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <h4 className="font-medium mb-3 line-clamp-2">{test.title}</h4>
        <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex flex-col items-center gap-1 bg-blue-50 rounded-lg p-2">
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-medium text-blue-700">{test.totalQuestions}</span>
            <span>Questions</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-green-50 rounded-lg p-2">
            <Target className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium text-green-700">{test.totalMarks}</span>
            <span>Marks</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-orange-50 rounded-lg p-2">
            <Clock className="h-3.5 w-3.5 text-orange-600" />
            <span className="font-medium text-orange-700">{test.durationMinutes}m</span>
            <span>Duration</span>
          </div>
        </div>
        {test.negativeMarks > 0 && (
          <p className="text-xs text-muted-foreground mb-3">
            Negative marking: -{test.negativeMarks} per wrong answer
          </p>
        )}
        <Button size="sm" className="w-full" asChild>
          <Link href={`/tests/${test.id}/instructions`}>Start Test</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ExamDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);

  const { data: examData, isLoading: examLoading } = useQuery({
    queryKey: ["exam", id],
    queryFn:  () => examApi.getById(id),
    enabled:  !isNaN(id),
  });

  const { data: testsData, isLoading: testsLoading } = useQuery({
    queryKey: ["exam-tests", id],
    queryFn:  () => examApi.getTests(id, { size: 20 }),
    enabled:  !isNaN(id),
  });

  const exam  = examData?.data;
  const tests = testsData?.data?.content ?? [];

  if (examLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-20 space-y-4">
        <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto" />
        <p className="text-lg font-medium">Exam not found</p>
        <Button variant="outline" asChild>
          <Link href="/exams"><ArrowLeft className="h-4 w-4 mr-2" />Back to Exams</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/exams" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        All Exams
      </Link>

      {/* Hero banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute right-20 bottom-0 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-3 text-xs">{exam.code}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{exam.name}</h1>
              {exam.description && (
                <p className="text-blue-100 text-sm max-w-xl">{exam.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div>
              <p className="text-2xl font-bold">{exam.totalSubjects}</p>
              <p className="text-blue-200 text-xs">Subjects</p>
            </div>
            <div className="border-l border-white/20" />
            <div>
              <p className="text-2xl font-bold">{exam.totalTests}</p>
              <p className="text-blue-200 text-xs">Mock Tests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Subjects + Topics — left 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Subjects & Topics
          </h2>

          {exam.subjects.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-10 text-center text-muted-foreground">
                No subjects added yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {exam.subjects.map((subject) => (
                <SubjectAccordion key={subject.id} subject={subject} />
              ))}
            </div>
          )}
        </div>

        {/* Mock Tests — right 1 col */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Mock Tests
            {tests.length > 0 && (
              <Badge variant="secondary">{tests.length}</Badge>
            )}
          </h2>

          {testsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36" />)}
            </div>
          ) : tests.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                No tests published yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => <TestCard key={test.id} test={test} />)}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tests">View all tests</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

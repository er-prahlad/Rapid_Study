"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/services/adminApi";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, GraduationCap, FileText, BookOpen, Target } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const deb = useDebounce(query, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["search", deb],
    queryFn:  () => searchApi.search(deb, 8),
    enabled:  deb.length >= 2,
  });

  const r = data?.data;
  const hasResults = r && (r.exams.length + r.tests.length + r.questions.length + r.topics.length) > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Search</h1>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Search exams, tests, topics, questions…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {isLoading && deb.length >= 2 && (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      )}

      {deb.length >= 2 && !isLoading && !hasResults && (
        <div className="text-center py-12 text-muted-foreground">
          No results for "{deb}"
        </div>
      )}

      {hasResults && (
        <div className="space-y-6">
          {/* Exams */}
          {r.exams.length > 0 && (
            <Section title="Exams" icon={GraduationCap}>
              {r.exams.map((e: any) => (
                <ResultItem key={e.id} href={`/exams/${e.id}`} title={e.name}
                  sub={e.code} badge={<Badge variant="outline" className="text-xs">{e.code}</Badge>} />
              ))}
            </Section>
          )}

          {/* Tests */}
          {r.tests.length > 0 && (
            <Section title="Mock Tests" icon={FileText}>
              {r.tests.map((t: any) => (
                <ResultItem key={t.id} href={`/tests/${t.id}/instructions`} title={t.title}
                  sub={`${t.totalQuestions} Qs · ${t.durationMinutes}m`}
                  badge={<Badge variant="secondary" className="text-xs">{t.examName}</Badge>} />
              ))}
            </Section>
          )}

          {/* Topics */}
          {r.topics.length > 0 && (
            <Section title="Topics" icon={Target}>
              {r.topics.map((t: any) => (
                <ResultItem key={t.id} href="/practice" title={t.name} sub={t.subjectName} />
              ))}
            </Section>
          )}

          {/* Questions */}
          {r.questions.length > 0 && (
            <Section title="Questions" icon={BookOpen}>
              {r.questions.map((q: any) => (
                <ResultItem key={q.id} href="/practice" title={q.questionText}
                  sub={`${q.difficulty} · ${q.topicName ?? ""}`} truncate />
              ))}
            </Section>
          )}
        </div>
      )}

      {deb.length < 2 && query.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">Type at least 2 characters to search</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
        <Icon className="h-4 w-4" />{title}
      </h2>
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="divide-y">{children}</div>
      </Card>
    </div>
  );
}

function ResultItem({ href, title, sub, badge, truncate }: {
  href: string; title: string; sub?: string; badge?: React.ReactNode; truncate?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", truncate ? "line-clamp-1" : "")}>{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      {badge}
    </Link>
  );
}

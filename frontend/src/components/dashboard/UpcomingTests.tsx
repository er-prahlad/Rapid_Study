import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MockTest } from "@/types";

interface Props {
  tests: MockTest[];
}

export function UpcomingTests({ tests }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-primary" />
          Mock Tests
        </CardTitle>
        <Link
          href="/tests"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {tests.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">No tests available yet</p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/tests">Browse Tests</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.slice(0, 3).map((test) => (
              <div
                key={test.id}
                className="p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
              >
                <p className="text-sm font-medium line-clamp-1 mb-2">
                  {test.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {test.durationMinutes}m
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {test.totalQuestions} Qs
                  </span>
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    {test.totalMarks} marks
                  </Badge>
                </div>
                <Button size="sm" className="h-7 text-xs w-full" asChild>
                  <Link href={`/tests/${test.id}/instructions`}>Start Test</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

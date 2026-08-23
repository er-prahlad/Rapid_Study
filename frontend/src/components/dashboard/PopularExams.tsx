import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Exam } from "@/types";

interface Props {
  exams: Exam[];
}

const EXAM_COLORS: Record<string, string> = {
  "SSC CGL":  "from-blue-500 to-blue-600",
  "SSC CHSL": "from-indigo-500 to-indigo-600",
  "UPSC":     "from-purple-500 to-purple-600",
  "UPSC CSE": "from-purple-500 to-purple-600",
  "BPSC":     "from-green-500 to-green-600",
  "Railway":  "from-orange-500 to-orange-600",
  "Bank PO":  "from-teal-500 to-teal-600",
};

const FALLBACK_EXAMS: Exam[] = [
  { id: 0, name: "SSC CGL",   code: "SSC_CGL",  isActive: true },
  { id: 0, name: "UPSC CSE",  code: "UPSC",     isActive: true },
  { id: 0, name: "Bank PO",   code: "BANK_PO",  isActive: true },
  { id: 0, name: "Railway",   code: "RAILWAY",  isActive: true },
  { id: 0, name: "BPSC",      code: "BPSC",     isActive: true },
  { id: 0, name: "SSC CHSL",  code: "SSC_CHSL", isActive: true },
];

export function PopularExams({ exams }: Props) {
  const list = exams.length > 0 ? exams.slice(0, 6) : FALLBACK_EXAMS;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-5 w-5 text-primary" />
          Popular Exams
        </CardTitle>
        <Link
          href="/exams"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {list.map((exam) => {
            const gradient = EXAM_COLORS[exam.name] ?? "from-gray-500 to-gray-600";
            const href = exam.id ? `/exams/${exam.id}` : "/exams";
            const shortCode = exam.code?.replace(/_/g, " ") ?? exam.name;

            return (
              <Link
                key={`${exam.id}-${exam.code}`}
                href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/40 hover:bg-muted transition-colors group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}
                >
                  <span className="text-white font-bold text-xs text-center leading-tight px-1">
                    {shortCode.length <= 4 ? shortCode : exam.name.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {exam.name}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, FileText, PenTool, BookOpen, CalendarCheck, Trophy } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  { label: "Mock Test",  href: "/tests",      icon: FileText,      bg: "bg-blue-50",   text: "text-blue-700",   hover: "hover:bg-blue-100" },
  { label: "Practice",   href: "/practice",   icon: PenTool,       bg: "bg-green-50",  text: "text-green-700",  hover: "hover:bg-green-100" },
  { label: "Bookmarks",  href: "/bookmarks",  icon: BookOpen,      bg: "bg-purple-50", text: "text-purple-700", hover: "hover:bg-purple-100" },
  { label: "Study Plan", href: "/study-plan", icon: CalendarCheck, bg: "bg-indigo-50", text: "text-indigo-700", hover: "hover:bg-indigo-100" },
  { label: "Leaderboard",href: "/leaderboard",icon: Trophy,        bg: "bg-orange-50", text: "text-orange-700", hover: "hover:bg-orange-100" },
  { label: "Exams",      href: "/exams",      icon: BookOpen,      bg: "bg-teal-50",   text: "text-teal-700",   hover: "hover:bg-teal-100" },
];

export function QuickActions() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {ACTIONS.map(({ label, href, icon: Icon, bg, text, hover }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${bg} ${text} ${hover}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

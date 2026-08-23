import { CalendarCheck } from "lucide-react";
export default function StudyPlanPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <CalendarCheck className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Study Plan</h2>
      <p className="text-muted-foreground">Coming in Phase 36 — Study Plan</p>
    </div>
  );
}

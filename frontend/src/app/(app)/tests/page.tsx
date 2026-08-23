import { FileText } from "lucide-react";
export default function TestsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Mock Tests</h2>
      <p className="text-muted-foreground">Coming in Phase 21 — Mock Test Listing</p>
    </div>
  );
}

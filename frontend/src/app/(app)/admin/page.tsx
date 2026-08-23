import { Shield } from "lucide-react";
export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Shield className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
      <p className="text-muted-foreground">Coming in Phase 38 — Admin Dashboard</p>
    </div>
  );
}

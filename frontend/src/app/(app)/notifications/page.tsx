import { Bell } from "lucide-react";
export default function NotificationsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Bell className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Notifications</h2>
      <p className="text-muted-foreground">Coming in Phase 37 — Notifications</p>
    </div>
  );
}

import { Bookmark } from "lucide-react";
export default function BookmarksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Bookmarks</h2>
      <p className="text-muted-foreground">Coming in Phase 33 — Bookmarks</p>
    </div>
  );
}

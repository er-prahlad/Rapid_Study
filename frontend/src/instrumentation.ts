/**
 * Next.js instrumentation hook — runs once at server startup.
 * Pre-warms all routes so Turbopack compiles them immediately,
 * making first-visit navigation instant for users.
 */
export async function register() {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof window !== "undefined") return; // server only

  const ROUTES = [
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/exams",
    "/tests",
    "/practice",
    "/bookmarks",
    "/leaderboard",
    "/study-plan",
    "/notifications",
    "/profile",
  ];

  // Wait for the server to fully initialize
  await new Promise((r) => setTimeout(r, 3000));

  const baseUrl = `http://localhost:${process.env.PORT ?? 3000}`;

  const warmRoute = async (path: string) => {
    try {
      await fetch(baseUrl + path, { signal: AbortSignal.timeout(120000) });
    } catch {
      // Ignore — route may not exist or server still starting
    }
  };

  // Warm critical routes first, then all others
  console.log("[prewarm] Warming routes in background...");
  warmRoute("/dashboard");
  warmRoute("/login");

  // Stagger the rest to avoid overwhelming the compiler
  setTimeout(() => ROUTES.slice(2).forEach(warmRoute), 5000);
}

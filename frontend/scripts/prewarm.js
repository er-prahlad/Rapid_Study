/**
 * Pre-warm all Next.js routes by hitting them right after the dev server starts.
 * This forces Turbopack to compile every route in parallel so first user visits are instant.
 *
 * Usage: node scripts/prewarm.js
 * Run after `npx next dev --turbo` is ready.
 */

const http = require("http");

const BASE = "http://localhost:3000";

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
  "/admin",
  "/admin/exams",
  "/admin/questions",
  "/admin/tests",
];

async function hit(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(BASE + path, { timeout: 120000 }, (res) => {
      res.resume();
      res.on("end", () => {
        const ms = Date.now() - start;
        console.log(`✓ ${path.padEnd(28)} ${ms}ms`);
        resolve();
      });
    });
    req.on("error", () => {
      console.log(`✗ ${path} (error)`);
      resolve();
    });
    req.on("timeout", () => {
      req.destroy();
      console.log(`✗ ${path} (timeout)`);
      resolve();
    });
  });
}

async function main() {
  console.log("Pre-warming routes...\n");

  // First batch: auth + dashboard (most critical)
  await Promise.all(["/login", "/register", "/dashboard"].map(hit));

  // Second batch: all other routes in parallel
  const rest = ROUTES.filter((r) => !["/login", "/register", "/dashboard"].includes(r));
  await Promise.all(rest.map(hit));

  console.log("\nAll routes pre-warmed! Navigation will be instant now.");
}

main();

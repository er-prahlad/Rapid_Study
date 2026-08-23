export default function AnalysisPage({ params }: { params: { attemptId: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-xl font-semibold mb-2">Analysis — Attempt #{params.attemptId}</h2>
      <p className="text-muted-foreground">Coming in Phase 30 — Detailed Analytics</p>
    </div>
  );
}

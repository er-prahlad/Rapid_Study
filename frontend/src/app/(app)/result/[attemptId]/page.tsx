export default function ResultPage({ params }: { params: { attemptId: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-xl font-semibold mb-2">Result — Attempt #{params.attemptId}</h2>
      <p className="text-muted-foreground">Coming in Phase 29 — Results</p>
    </div>
  );
}

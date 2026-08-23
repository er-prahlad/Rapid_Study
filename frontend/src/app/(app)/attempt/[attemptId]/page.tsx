export default function AttemptPage({ params }: { params: { attemptId: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-xl font-semibold mb-2">Test Attempt #{params.attemptId}</h2>
      <p className="text-muted-foreground">Coming in Phase 23 — Test Engine</p>
    </div>
  );
}

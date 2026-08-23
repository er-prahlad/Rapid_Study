export default function TestDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-xl font-semibold mb-2">Test #{params.id}</h2>
      <p className="text-muted-foreground">Coming in Phase 22 — Test Instructions</p>
    </div>
  );
}

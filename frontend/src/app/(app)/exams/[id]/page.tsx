export default function ExamDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-xl font-semibold mb-2">Exam #{params.id}</h2>
      <p className="text-muted-foreground">Coming in Phase 16 — Exam Module</p>
    </div>
  );
}

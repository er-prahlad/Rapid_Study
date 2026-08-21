export default function AdminHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">RapidStudy Admin</h1>
        <p className="text-xl text-gray-600 mb-2">Content Management Panel</p>
        <p className="text-gray-500">
          Administrative interface for managing exams, questions, and users
        </p>
        <div className="mt-8 text-sm text-gray-400">
          <p>Admin panel skeleton initialized successfully ✓</p>
        </div>
      </div>
    </main>
  );
}

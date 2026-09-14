export function LoadingSpinner() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-6 py-12">
      <div
        role="status"
        aria-label="Loading"
        className="h-8 w-8 animate-spin rounded-full border-2 border-panel border-t-ember"
      />
    </main>
  );
}

export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

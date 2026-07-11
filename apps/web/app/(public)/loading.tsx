export default function PublicLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
}

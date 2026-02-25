export default function Loading() {
  return (
    <div className="pt-24 pb-24 animate-pulse">
      <div className="container">
        <div className="h-10 w-48 bg-muted rounded mb-8" />
        <div className="h-4 w-full max-w-2xl bg-muted rounded mb-4" />
        <div className="h-4 w-full max-w-xl bg-muted rounded" />
      </div>
    </div>
  )
}

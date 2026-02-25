export default function Loading() {
  return (
    <article className="pt-16 pb-24 animate-pulse">
      <div className="container">
        <div className="h-12 w-3/4 bg-muted rounded mb-8" />
        <div className="h-4 w-full max-w-2xl bg-muted rounded mb-4" />
        <div className="h-4 w-full max-w-xl bg-muted rounded" />
      </div>
    </article>
  )
}

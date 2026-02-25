export default function Loading() {
  return (
    <div className="pt-24 pb-24 animate-pulse">
      <div className="container mb-16">
        <div className="h-10 w-36 bg-muted rounded" />
      </div>
      <div className="container mb-8">
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
      <div className="container grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-muted/50 p-4">
            <div className="h-40 w-full bg-muted rounded mb-4" />
            <div className="h-4 w-3/4 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

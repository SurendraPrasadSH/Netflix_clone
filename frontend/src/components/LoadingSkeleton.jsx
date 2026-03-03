export default function LoadingSkeleton() {
  return (
    <div className="px-4 md:px-12 space-y-10 pt-4">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <div className="h-5 w-40 bg-zinc-800 rounded mb-3 animate-pulse" />
          <div className="flex gap-3 overflow-hidden">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="flex-shrink-0 w-36 md:w-44 aspect-[2/3] bg-zinc-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

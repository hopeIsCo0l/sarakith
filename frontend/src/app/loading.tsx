export default function Loading() {
  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-20 space-y-6">
      <div className="h-3 w-40 bg-kith-subBg border border-kith-border animate-pulse" />
      <div className="h-10 w-2/3 bg-kith-subBg border border-kith-border animate-pulse" />
      <div className="h-4 w-full max-w-2xl bg-kith-subBg border border-kith-border animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-64 bg-kith-subBg border border-kith-border animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-[10px] font-mono tracking-superwide text-kith-muted uppercase">
        Loading…
      </p>
    </div>
  );
}

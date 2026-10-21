import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-24 space-y-6 text-center">
      <div className="text-[10px] font-mono tracking-superwide text-sara-red dark:text-red-400 uppercase">
        Error 404
      </div>
      <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-kith-bone uppercase">
        RECORD NOT FOUND
      </h1>
      <p className="text-xs font-mono text-kith-muted max-w-xl mx-auto">
        The page or equipment you requested is not in the registry. It may have
        been retired, renamed, or never existed.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          href="/catalog"
          className="px-6 py-3 bg-sara-red text-white hover:bg-sara-redLight text-xs font-mono font-bold tracking-widest uppercase rounded-sm transition-all"
        >
          Browse Catalog
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-kith-card border border-kith-border hover:border-kith-bone text-kith-bone text-xs font-mono font-bold tracking-widest uppercase rounded-sm transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

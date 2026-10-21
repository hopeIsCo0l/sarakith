'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-24 space-y-6 text-center">
      <div className="inline-flex p-3 bg-sara-red/10 border border-sara-red/30 rounded-full">
        <AlertTriangle className="w-6 h-6 text-sara-red dark:text-red-400" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-kith-bone uppercase">
        SYSTEM FAULT
      </h1>
      <p className="text-xs font-mono text-kith-muted max-w-xl mx-auto">
        The page could not be loaded. The catalog service may be temporarily
        unavailable. Try again, or contact us directly for assistance.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={reset}
          className="px-6 py-3 bg-sara-red text-white hover:bg-sara-redLight text-xs font-mono font-bold tracking-widest uppercase rounded-sm flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
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

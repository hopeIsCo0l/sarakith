import Link from 'next/link';
import type { ReactNode } from 'react';

export function LegalPage({ title, children, relatedHref, relatedTitle }: {
  title: string;
  children: ReactNode;
  relatedHref: string;
  relatedTitle: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16 text-kith-bone">
      <header className="mb-10 border-b border-kith-border pb-8 space-y-3">
        <p className="text-sm font-mono uppercase tracking-widest text-kith-muted">Legal</p>
        <h1 className="text-3xl sm:text-5xl font-bold">{title}</h1>
        <p className="text-sm text-kith-muted">Last updated <time dateTime="2026-09-09">9 September 2026</time></p>
      </header>
      <div className="space-y-8 text-base leading-7 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_p]:text-kith-muted [&_a]:text-kith-bone [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
      <nav aria-label="Related legal policy" className="mt-10 border-t border-kith-border pt-6">
        Also see our <Link href={relatedHref} className="underline underline-offset-4">{relatedTitle}</Link>.
      </nav>
    </article>
  );
}

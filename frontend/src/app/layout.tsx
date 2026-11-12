import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import {
  COMPANY_NAME,
  SITE_NAME,
  HOME_SEO_TITLE,
  HOME_SEO_DESCRIPTION,
  BRAND_TAGLINE,
  SEARCH_KEYWORDS,
  PHYSICAL_ADDRESS,
  PRIMARY_PHONE,
} from '@/lib/constants';
import { SITE_URL, JsonLd, localBusinessJsonLd } from '@/lib/server/seo';
import { getServerSiteSettings } from '@/lib/server/data';
import { SiteSetting } from '@/lib/types';

const fontMostin = localFont({
  src: [
    {
      path: '../../public/MostinRegular-516lZ.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/MostinBold-JRAOo.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/MostinBlack-qZJBd.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-mostin',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: HOME_SEO_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_SEO_DESCRIPTION,
  keywords: SEARCH_KEYWORDS,
  applicationName: SITE_NAME,
  category: 'technology',
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_SEO_TITLE,
    description: HOME_SEO_DESCRIPTION,
    url: SITE_URL || undefined,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_ET',
  },
  twitter: {
    card: 'summary',
    title: HOME_SEO_TITLE,
    description: HOME_SEO_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Rendered on the server so the navigation, footer and hero use the same
  // settings without an extra client-side round trip.
  const siteSettings = await getServerSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning className={fontMostin.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('sara-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  } else {
                    root.classList.add('light');
                    root.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={fontMostin.className}>
        <JsonLd data={localBusinessJsonLd()} />
        <ThemeProvider>
          <SiteSettingsProvider
            initialSettings={siteSettings as Record<string, SiteSetting>}
          >
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-20 sm:pt-24 print:pt-0 print:m-0">{children}</main>
              <Footer />
            </div>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

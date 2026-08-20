import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import {
  COMPANY_NAME,
  BRAND_TAGLINE,
  SEARCH_KEYWORDS,
  PHYSICAL_ADDRESS,
  PRIMARY_PHONE,
} from '@/lib/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${COMPANY_NAME} | Tier-1 Solar Inverters, Lithium Batteries & Panels`,
  description: `${BRAND_TAGLINE}. Discover high-efficiency hybrid solar inverters, LiFePO4 lithium batteries, and engineering installation services in Addis Ababa, Ethiopia.`,
  keywords: SEARCH_KEYWORDS,
  openGraph: {
    title: `${COMPANY_NAME} | Solar Energy Systems`,
    description: `Leading supplier of solar inverters, lithium batteries, and engineering installations in Addis Ababa, Ethiopia.`,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className={inter.className}>
        <ThemeProvider>
          <SiteSettingsProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-20 sm:pt-24">{children}</main>
              <Footer />
            </div>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

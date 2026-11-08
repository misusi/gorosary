import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  metadataBase: new URL('https://gorosary.app'),
  title: {
    default: 'GoRosary — the Rosary, novenas, and the prayers of the day',
    template: '%s · GoRosary',
  },
  description:
    'Pray the Rosary with the mystery of the day, keep track of your novenas, and find every prayer of the Catholic tradition in one place.',
  applicationName: 'GoRosary',
  openGraph: {
    type: 'website',
    siteName: 'GoRosary',
    url: 'https://gorosary.app',
    title: 'GoRosary',
    description:
      "Today's rosary, the novenas, and the prayers of the day — in one place.",
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f2' },
    { media: '(prefers-color-scheme: dark)', color: '#14120f' },
  ],
};

const themeScript = `
(function(){
  try {
    var stored = localStorage.getItem('gorosary-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored;
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="shell">
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

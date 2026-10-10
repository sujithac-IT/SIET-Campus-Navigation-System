import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { OfflineIndicator } from '@/components/layout/OfflineIndicator';
import { NotificationToast } from '@/components/notifications/NotificationToast';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Smart Campus Navigator - Real-Time Offline Navigation System',
  description: 'Digital campus navigation PWA with A* routing, indoor positioning, grounded AI assistant, and real-time classroom updates.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#080c14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-[#080c14] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-white pb-16 lg:pb-0">
        <Navbar />
        <NotificationToast />
        <main className="flex-1 w-full">
          {children}
        </main>
        <OfflineIndicator />
        <MobileNav />

        {/* PWA Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('PWA ServiceWorker registered with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('PWA ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}

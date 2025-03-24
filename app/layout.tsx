import type React from 'react';
import type { Metadata } from 'next';
import { Inter, Quicksand } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/error-boundary';
import OfflineNotice from '@/components/offline-notice';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quicksand',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Dog Breed Gallery',
  description: 'Browse dog images by breed',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${quicksand.className}`}>
        <ErrorBoundary>{children}</ErrorBoundary>
        <OfflineNotice />
      </body>
    </html>
  );
}

import './globals.css';

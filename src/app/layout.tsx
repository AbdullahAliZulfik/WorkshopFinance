import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppFooter } from '@/components/layout/app-footer';
import { AppHeader } from '@/components/layout/app-header';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinanceKu — Finance Management',
  description: 'Catat pemasukan dan pengeluaran dengan mudah.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <QueryProvider>
          <AppHeader />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <AppFooter />
        </QueryProvider>
      </body>
    </html>
  );
}

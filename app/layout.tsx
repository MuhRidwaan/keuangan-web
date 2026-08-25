import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Finance & Agenda Platform — Modern Keuangan & Jadwal',
  description: 'Kelola keuangan harian, budget bulanan, laporan analisis, agenda bersama, dan tabungan impian dengan mudah.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark h-full">
      <body className={`${inter.className} min-h-full flex flex-col antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

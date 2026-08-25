'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { auth } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.replace('/login');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          <p className="text-sm font-medium text-slate-400">Memuat Sesi FinAgenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64">
            <Sidebar collapsed={false} setCollapsed={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Right Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

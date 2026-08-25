'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  CalendarDays,
  Landmark,
  Users,
  Settings,
  Wallet,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ChevronDown,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/auth';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const [reportsSubmenuOpen, setReportsSubmenuOpen] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/reports')) {
      setReportsSubmenuOpen(true);
    }
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transaksi', href: '/transactions', icon: Receipt },
    { name: 'Budget Bulanan', href: '/budget', icon: Wallet },
    { name: 'Laporan Keuangan', href: '/reports', icon: TrendingUp },
    { name: 'Agenda & Jadwal', href: '/agendas', icon: CalendarDays },
    { name: 'Tabungan Bersama', href: '/savings', icon: Landmark },
    { name: 'Pusat Kontak', href: '/contacts', icon: Users },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    auth.removeSession();
    window.location.href = '/login';
  };

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen flex flex-col glass-nav border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 z-30 shrink-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 shadow-lg shadow-indigo-500/25">
            <PieChart className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight gradient-text">FinAgenda</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Pro Platform</span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-500 hover:text-indigo-500 transition"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const isReportsGroup = item.href === '/reports';

          if (isReportsGroup) {
            const isReportsActive = pathname?.startsWith('/reports');
            return (
              <div key="reports-group" className="space-y-1">
                <button
                  onClick={() => setReportsSubmenuOpen(!reportsSubmenuOpen)}
                  className={cn(
                    'group flex items-center justify-between w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                    isReportsActive
                      ? 'bg-indigo-600/10 text-indigo-500 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                  title={collapsed ? 'Laporan Keuangan' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp
                      className={cn(
                        'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                        isReportsActive ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-400'
                      )}
                    />
                    {!collapsed && <span>Laporan Keuangan</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        reportsSubmenuOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'
                      )}
                    />
                  )}
                </button>

                {/* Sub-menu Dropdown */}
                {reportsSubmenuOpen && !collapsed && (
                  <div className="pl-8 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Link
                      href="/reports"
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition',
                        pathname === '/reports'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Ikhtisar & Cashflow</span>
                    </Link>

                    <Link
                      href="/reports/details"
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition',
                        pathname === '/reports/details'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      <span>Detail Alokasi Kas (Tabel)</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href || (item.href !== '/reports' && pathname?.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-500'
                )}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-sm text-rose-500 hover:bg-rose-500/10 transition duration-200'
          )}
          title={collapsed ? 'Keluar' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Keluar App</span>}
        </button>
      </div>
    </aside>
  );
};
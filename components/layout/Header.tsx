'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Bell, User as UserIcon, LogOut, ShieldCheck, Menu } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { auth } from '@/lib/auth';
import { User, Notification } from '@/lib/types';
import { apiClient } from '@/lib/api';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    setUser(auth.getUser());
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch {
      // silent fallback
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // silent fallback
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    auth.removeSession();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between glass-nav px-4 md:px-8 border-b border-slate-200 dark:border-slate-800/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Selamat datang, <span className="gradient-text">{user?.name || 'User'}</span> 👋
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">Ringkasan aktivitas & analisis keuangan Anda</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Ubah Tema (Gelap/Terang)"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifikasi</h4>
                <span className="text-xs text-indigo-500 font-semibold">{unreadCount} belum dibaca</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 py-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center py-6 text-slate-400">Belum ada notifikasi baru</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 rounded-xl cursor-pointer text-xs transition ${
                        !n.is_read ? 'bg-indigo-500/10 dark:bg-indigo-500/15 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <p className="text-slate-900 dark:text-slate-100 font-medium">{n.title}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
              {user?.name || 'User'}
            </span>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <a
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                Pengaturan Akun
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition mt-1"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

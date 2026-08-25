'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sun, Moon, Lock, Calendar, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import { User } from '@/lib/types';
import { getCutOffDay, setCutOffDay, getCutOffPeriod } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  // Cut-Off Day state
  const [cutoffDay, setCutoffDayState] = useState<number>(1);
  const [activePeriodLabel, setActivePeriodLabel] = useState<string>('');

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(auth.getUser());
    const day = getCutOffDay();
    setCutoffDayState(day);
    const period = getCutOffPeriod(day);
    setActivePeriodLabel(period.label);
  }, []);

  const handleCutoffChange = (day: number) => {
    setCutoffDayState(day);
    setCutOffDay(day);
    const period = getCutOffPeriod(day);
    setActivePeriodLabel(period.label);
    toast('success', `Siklus gaji / cut-off berhasil diatur ke tanggal ${day}`);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast('error', 'Silakan isi kata sandi lama dan baru');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('error', 'Konfirmasi kata sandi baru tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast('success', 'Kata sandi berhasil diubah');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast('error', err.message || 'Gagal mengubah kata sandi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Pengaturan Akun & Tampilan
        </h1>
        <p className="text-xs text-slate-500 mt-1">Atur preferensi sistem, tema tampilan, dan siklus keuangan</p>
      </div>

      {/* User Profile Overview */}
      <Card className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-lg">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h3>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <span className="inline-block mt-2 text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
            Terverifikasi JWT Active
          </span>
        </div>
      </Card>

      {/* Financial Cut-Off Settings */}
      <Card className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" /> Siklus Keuangan & Cut-Off Gaji
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan tanggal gajian Anda. Filter laporan dan grafik akan otomatis menyesuaikan siklus tanggal ini.
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tanggal Cut-Off / Gajian Bulanan:
            </label>
            <select
              value={cutoffDay}
              onChange={(e) => handleCutoffChange(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>Default (Tanggal 1 - Akhir Bulan Kalender)</option>
              {Array.from({ length: 30 }, (_, i) => i + 2).map((day) => (
                <option key={day} value={day}>
                  Tanggal {day} {day === 25 ? '(Gaji Tgl 25)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Status Siklus Keuangan Saat Ini:
              </p>
              <p className="text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5">
                {activePeriodLabel}
              </p>
              <p className="text-slate-400 text-[11px] mt-1">
                {cutoffDay > 1
                  ? `Transaksi dari tanggal ${cutoffDay} bulan lalu hingga tanggal ${cutoffDay - 1} bulan ini dihitung dalam 1 periode gaji.`
                  : 'Transaksi dihitung secara standar dari tanggal 1 hingga akhir bulan kalender.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Preference Settings */}
      <Card className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Preferensi Tema Tampilan</h3>
          <p className="text-xs text-slate-500">Pilih tema antarmuka yang paling nyaman untuk Anda</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 p-4 rounded-xl border transition ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Moon className="h-5 w-5 text-indigo-400" />
            <div className="text-left">
              <p className="font-bold text-sm">Dark Mode (Default)</p>
              <p className="text-[11px] text-slate-400">Glassmorphism Gelap Elegant</p>
            </div>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 p-4 rounded-xl border transition ${
              theme === 'light'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Sun className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <p className="font-bold text-sm">Light Mode</p>
              <p className="text-[11px] text-slate-400">Tampilan Terang Bersih</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Change Password Form */}
      <Card className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Ubah Kata Sandi</h3>
          <p className="text-xs text-slate-500">Perbarui kata sandi Anda secara berkala demi keamanan</p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="Kata Sandi Lama"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <Input
            label="Kata Sandi Baru"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" isLoading={loading}>
            Perbarui Kata Sandi
          </Button>
        </form>
      </Card>
    </div>
  );
}
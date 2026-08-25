'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, PieChart, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('error', 'Silakan isi email dan kata sandi');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/login', { email, password });
      const { token, user } = res.data?.data || {};

      if (token) {
        auth.setToken(token);
        if (user) auth.setUser(user);
        toast('success', 'Berhasil masuk! Selamat datang.');
        router.replace('/dashboard');
      } else {
        toast('error', 'Token tidak ditemukan dari server');
      }
    } catch (err: any) {
      toast('error', err.message || 'Gagal masuk. Periksa email & kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <Card className="w-full max-w-md relative z-10 glass-card border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <PieChart className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight gradient-text">FinAgenda Pro</h2>
          <p className="text-xs text-slate-400 mt-1">Masuk ke akun Anda untuk mengelola keuangan & agenda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition font-medium"
            >
              Lupa kata sandi?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-sm font-semibold"
            isLoading={loading}
          >
            Masuk Akun <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            Belum memiliki akun?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

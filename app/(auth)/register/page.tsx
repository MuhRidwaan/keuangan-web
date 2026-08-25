'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, PieChart, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { apiClient } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast('error', 'Silakan isi seluruh formulir pendaftaran');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/register', { name, email, password });
      toast('success', 'Pendaftaran berhasil! Silakan masuk ke akun Anda.');
      router.replace('/login');
    } catch (err: any) {
      toast('error', err.message || 'Gagal mendaftar. Email mungkin sudah digunakan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <Card className="w-full max-w-md relative z-10 glass-card border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <PieChart className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight gradient-text">Buat Akun Baru</h2>
          <p className="text-xs text-slate-400 mt-1">Bergabung dengan FinAgenda Pro secara gratis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            type="text"
            placeholder="John Doe"
            icon={<UserIcon className="h-4 w-4" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            placeholder="Minimal 6 karakter"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full py-3 text-sm font-semibold mt-2"
            isLoading={loading}
          >
            Daftar Sekarang <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1">
              Masuk Akun
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

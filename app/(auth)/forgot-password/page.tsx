'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('error', 'Silakan masukkan email Anda');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/forgot-password', { email });
      setSent(true);
      toast('success', 'Instruksi reset kata sandi telah dikirim ke email Anda.');
    } catch (err: any) {
      toast('error', err.message || 'Gagal mengirim instruksi reset kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      <Card className="w-full max-w-md relative z-10 glass-card border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight gradient-text">Lupa Kata Sandi</h2>
          <p className="text-xs text-slate-400 mt-1">Masukkan email terdaftar untuk menerima token reset</p>
        </div>

        {sent ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Send className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-200">Email reset kata sandi telah dikirim!</p>
            <p className="text-xs text-slate-400">Periksa kotak masuk email Anda dan ikuti tautan yang diberikan.</p>
            <Link href="/login" className="inline-block pt-4">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Log In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Terdaftar"
              type="email"
              placeholder="nama@email.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full py-3 text-sm font-semibold mt-2"
              isLoading={loading}
            >
              Kirim Link Reset <Send className="h-4 w-4 ml-2" />
            </Button>

            <div className="text-center pt-4">
              <Link href="/login" className="text-xs text-slate-400 hover:text-slate-200 font-medium inline-flex items-center">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Kembali ke Log In
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

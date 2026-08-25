'use client';
import { PageSkeleton } from '@/components/ui/Skeleton';

import React, { useEffect, useState } from 'react';
import { Users, Mail, UserPlus, Search, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/providers/ToastProvider';
import { apiClient } from '@/lib/api';
import { Contact } from '@/lib/types';

export default function ContactsPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/contacts');
      const rawContacts = res.data?.data; setContacts(Array.isArray(rawContacts) ? rawContacts : (rawContacts?.items || []));
    } catch (err) {
      toast('error', 'Gagal memuat daftar kontak');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const copyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast('success', `Email ${email} disalin ke clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <PageSkeleton title="Memuat Data Pusat Kontak..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Pusat Kontak & Kolaborasi 👥
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar teman & relasi yang pernah diundang ke agenda atau tabungan bersama
          </p>
        </div>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Cari nama atau email kontak..."
          icon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {loading ? (
        <p className="text-xs text-slate-400">Memuat kontak...</p>
      ) : filteredContacts.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Belum Ada Kontak Terhubung</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Ketika Anda mengundang seseorang ke Agenda atau Tabungan Bersama, mereka akan otomatis muncul di sini.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((c) => (
            <Card key={c.id} gradientHover className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-500 font-bold flex items-center justify-center text-sm">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{c.name}</h4>
                  <p className="text-xs text-slate-400">{c.email}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copyEmail(c.email, c.id)}
                title="Salin Email"
              >
                {copiedId === c.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


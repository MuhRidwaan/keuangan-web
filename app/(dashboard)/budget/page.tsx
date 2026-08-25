'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, Plus, Trash2, Edit2, AlertTriangle, CheckCircle, PieChart, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/providers/ToastProvider';
import { formatIDR, getMonthName } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { Budget, Category, Transaction } from '@/lib/types';
import { PageSkeleton } from '@/components/ui/Skeleton';

export default function BudgetPage() {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes, tRes] = await Promise.all([
        apiClient.get('/budgets'),
        apiClient.get('/categories'),
        apiClient.get('/transactions'),
      ]);
      const rawBudgets = bRes.data?.data; setBudgets(Array.isArray(rawBudgets) ? rawBudgets : (rawBudgets?.items || []));
      const rawCats = cRes.data?.data; setCategories(Array.isArray(rawCats) ? rawCats : (rawCats?.items || []));
      setTransactions(tRes.data?.data || []);
    } catch (err: any) {
      toast('error', 'Gagal memuat data budget');
    } finally {
      setLoading(false);
    }
  };

  // Calculate spent amount for each budget based on category & date
  const enrichedBudgets = budgets.map((b) => {
    const spent = transactions
      .filter((t) => {
        const txDate = new Date(t.date);
        const matchesMonth = txDate.getMonth() + 1 === b.month;
        const matchesYear = txDate.getFullYear() === b.year;
        const matchesCategory = !b.category_id || t.category_id === b.category_id;
        return matchesMonth && matchesYear && matchesCategory && t.category?.type === 'expense';
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const limit = Number(b.amount);
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    return { ...b, spent_amount: spent, percentage };
  });

  const handleOpenCreateModal = () => {
    setEditingBudget(null);
    setFormData({
      category_id: '',
      amount: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Budget) => {
    setEditingBudget(b);
    setFormData({
      category_id: b.category_id || '',
      amount: b.amount.toString(),
      month: b.month,
      year: b.year,
    });
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    setIsSaving(true);
    e.preventDefault();
    if (!formData.amount) {
      toast('error', 'Silakan tentukan jumlah batasan budget');
      return;
    }

    const payload = {
      category_id: formData.category_id || null,
      amount: parseFloat(formData.amount),
      month: Number(formData.month),
      year: Number(formData.year),
    };

    try {
      if (editingBudget) {
        await apiClient.put(`/budgets/${editingBudget.id}`, payload);
        toast('success', 'Budget berhasil diperbarui');
      } else {
        await apiClient.post('/budgets', payload);
        toast('success', 'Budget baru berhasil ditetapkan');
      }
      setIsModalOpen(false);
      fetchBudgetData();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menyimpan budget');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus batasan budget ini?')) return;
    try {
      await apiClient.delete(`/budgets/${id}`);
      toast('success', 'Budget berhasil dihapus');
      fetchBudgetData();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menghapus budget');
    }
  };

  if (loading) return <PageSkeleton title="Memuat Data Budget Bulanan..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Pengelolaan Budget Bulanan 🎯
          </h1>
          <p className="text-xs text-slate-500 mt-1">Tetapkan batas pengeluaran & dapatkan notifikasi batas hemat</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4 mr-1" /> Tetapkan Budget Baru
        </Button>
      </div>

      {/* Budget Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-xs text-slate-400">Memuat budget...</p>
        ) : enrichedBudgets.length === 0 ? (
          <Card className="md:col-span-3 text-center py-12">
            <ShieldAlert className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Belum Ada Budget Ditentukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Buat batasan budget bulanan per kategori untuk mengontrol keuangan Anda agar tetap terencana.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
              Tetapkan Budget Pertama
            </Button>
          </Card>
        ) : (
          enrichedBudgets.map((b) => {
            const spent = b.spent_amount || 0;
            const limit = Number(b.amount);
            const pct = b.percentage || 0;

            let statusColor = 'bg-emerald-500';
            let badgeVariant: 'success' | 'warning' | 'danger' = 'success';
            let statusText = 'Aman (<80%)';

            if (pct >= 100) {
              statusColor = 'bg-rose-500';
              badgeVariant = 'danger';
              statusText = 'Limit Exceeded (≥100%)';
            } else if (pct >= 80) {
              statusColor = 'bg-amber-500';
              badgeVariant = 'warning';
              statusText = 'Peringatan (80-99%)';
            }

            return (
              <Card key={b.id} gradientHover className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {b.category?.name || 'Global (Semua Kategori)'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Periode: {getMonthName(b.month)} {b.year}
                    </p>
                  </div>
                  <Badge variant={badgeVariant}>{statusText}</Badge>
                </div>

                {/* Progress Bar & Amounts */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Terpakai: <strong className="text-slate-900 dark:text-slate-100">{formatIDR(spent)}</strong></span>
                    <span className="text-slate-500">Limit: <strong className="text-slate-900 dark:text-slate-100">{formatIDR(limit)}</strong></span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>{pct.toFixed(1)}% terpakai</span>
                    <span>Sisa: {formatIDR(Math.max(limit - spent, 0))}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-indigo-500 transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Add/Edit Budget */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Batasan Budget' : 'Tetapkan Budget Bulanan'}
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <Select
            label="Kategori (Opsional)"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            options={[
              { value: '', label: 'Global (Semua Pengeluaran)' },
              ...categories
                .filter((c) => c.type === 'expense')
                .map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <Input
            label="Batas Maksimal Budget (Rp)"
            type="number"
            placeholder="Contoh: 3000000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Bulan"
              value={formData.month.toString()}
              onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
              options={Array.from({ length: 12 }, (_, i) => ({
                value: (i + 1).toString(),
                label: getMonthName(i + 1),
              }))}
            />

            <Input
              label="Tahun"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Simpan Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


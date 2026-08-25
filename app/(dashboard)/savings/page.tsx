'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, Plus, ArrowUpRight, ArrowDownLeft, History, Users, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/providers/ToastProvider';
import { formatIDR, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { SavingGoal, SavingContribution } from '@/lib/types';
import { PageSkeleton } from '@/components/ui/Skeleton';

export default function SavingsPage() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    target_amount: '',
    deadline: new Date().toISOString().split('T')[0],
  });

  // Action Modal (Contribute / Withdraw)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'contribute' | 'withdraw'>('contribute');
  const [actionAmount, setActionAmount] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  // History Log Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [contributions, setContributions] = useState<SavingContribution[]>([]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/savings');
      const rawGoals = res.data?.data; setGoals(Array.isArray(rawGoals) ? rawGoals : (rawGoals?.items || []));
    } catch (err) {
      toast('error', 'Gagal memuat target tabungan');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    setGoalFormData({
      title: '',
      target_amount: '',
      deadline: new Date().toISOString().split('T')[0],
    });
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setGoalFormData({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      deadline: goal.deadline.split('T')[0],
    });
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalFormData.title || !goalFormData.target_amount || !goalFormData.deadline) {
      toast('error', 'Silakan isi seluruh formulir target tabungan');
      return;
    }

    const payload = {
      title: goalFormData.title,
      target_amount: parseFloat(goalFormData.target_amount),
      deadline: goalFormData.deadline,
    };

    try {
      if (editingGoal) {
        await apiClient.put(`/savings/${editingGoal.id}`, payload);
        toast('success', 'Target tabungan diperbarui');
      } else {
        await apiClient.post('/savings', payload);
        toast('success', 'Target tabungan baru berhasil dibuat');
      }
      setIsGoalModalOpen(false);
      fetchGoals();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menyimpan target tabungan');
    }
  };

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !actionAmount) return;

    const endpoint = actionType === 'contribute' ? 'contribute' : 'withdraw';
    try {
      await apiClient.post(`/savings/${selectedGoalId}/${endpoint}`, {
        amount: parseFloat(actionAmount),
        notes: actionNotes,
      });
      toast('success', `Berhasil melakukan ${actionType === 'contribute' ? 'setoran' : 'penarikan'} tabungan`);
      setIsActionModalOpen(false);
      setActionAmount('');
      setActionNotes('');
      fetchGoals();
    } catch (err: any) {
      toast('error', err.message || 'Gagal memproses transaksi tabungan');
    }
  };

  const handleOpenHistory = async (goalId: string) => {
    try {
      const res = await apiClient.get(`/savings/${goalId}/contributions`);
      const rawHistory = res.data?.data; setContributions(Array.isArray(rawHistory) ? rawHistory : (rawHistory?.history || []));
      setIsHistoryModalOpen(true);
    } catch (err: any) {
      toast('error', err.message || 'Gagal memuat riwayat kontribusi');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus target tabungan ini?')) return;
    try {
      await apiClient.delete(`/savings/${id}`);
      toast('success', 'Target tabungan berhasil dihapus');
      fetchGoals();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menghapus tabungan');
    }
  };

  if (loading) return <PageSkeleton title="Memuat Data Tabungan Bersama..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Tabungan Bersama & Goals 💰
          </h1>
          <p className="text-xs text-slate-500 mt-1">Pantau progres impian tabungan & riwayat kontribusi bersama</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreateGoal}>
          <Plus className="h-4 w-4 mr-1" /> Buat Target Tabungan
        </Button>
      </div>

      {/* Saving Goal Cards Grid */}
      {loading ? (
        <p className="text-xs text-slate-400">Memuat tabungan...</p>
      ) : goals.length === 0 ? (
        <Card className="text-center py-12">
          <Landmark className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Belum Ada Target Tabungan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Buat target tabungan seperti Liburan, Dana Darurat, atau Beli Laptop bersama teman & keluarga.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreateGoal}>
            Buat Target Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const current = Number(g.current_amount || 0);
            const target = Number(g.target_amount || 1);
            const pct = Math.min((current / target) * 100, 100);

            return (
              <Card key={g.id} gradientHover className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{g.title}</h3>
                    <p className="text-xs text-slate-400">Tenggat: {formatDate(g.deadline)}</p>
                  </div>
                  <Badge variant={pct >= 100 ? 'success' : 'info'}>
                    {pct >= 100 ? 'Tercapai 🎉' : `${pct.toFixed(1)}%`}
                  </Badge>
                </div>

                {/* Amount & Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Terkumpul: <strong className="text-emerald-500">{formatIDR(current)}</strong></span>
                    <span className="text-slate-500">Target: <strong className="text-slate-900 dark:text-slate-100">{formatIDR(target)}</strong></span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Sisa kekurangan: {formatIDR(Math.max(target - current, 0))}</p>
                </div>

                {/* Contribute & Withdraw buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setSelectedGoalId(g.id);
                      setActionType('contribute');
                      setIsActionModalOpen(true);
                    }}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Setor
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
                    onClick={() => {
                      setSelectedGoalId(g.id);
                      setActionType('withdraw');
                      setIsActionModalOpen(true);
                    }}
                  >
                    <ArrowDownLeft className="h-3.5 w-3.5 mr-1" /> Tarik
                  </Button>
                </div>

                {/* Footer history button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                  <button
                    onClick={() => handleOpenHistory(g.id)}
                    className="flex items-center gap-1.5 text-indigo-500 hover:underline font-semibold"
                  >
                    <History className="h-3.5 w-3.5" /> Riwayat Log
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditGoal(g)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-500 transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit Goal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={editingGoal ? 'Edit Target Tabungan' : 'Buat Target Tabungan Baru'}
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <Input
            label="Nama Target / Goal"
            type="text"
            placeholder="Contoh: Tabungan Liburan Bali"
            value={goalFormData.title}
            onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
            required
          />

          <Input
            label="Target Amount (Rp)"
            type="number"
            placeholder="Contoh: 10000000"
            value={goalFormData.target_amount}
            onChange={(e) => setGoalFormData({ ...goalFormData, target_amount: e.target.value })}
            required
          />

          <Input
            label="Tenggat Tanggal (Deadline)"
            type="date"
            value={goalFormData.deadline}
            onChange={(e) => setGoalFormData({ ...goalFormData, deadline: e.target.value })}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Simpan Target
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Contribute / Withdraw */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={actionType === 'contribute' ? 'Setor Dana Tabungan' : 'Tarik Dana Tabungan'}
      >
        <form onSubmit={handleSaveAction} className="space-y-4">
          <Input
            label="Nominal (Rp)"
            type="number"
            placeholder="Contoh: 100000"
            value={actionAmount}
            onChange={(e) => setActionAmount(e.target.value)}
            required
          />

          <Input
            label="Catatan (Opsional)"
            type="text"
            placeholder="Contoh: Setoran gajian bulan ini"
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsActionModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant={actionType === 'contribute' ? 'secondary' : 'danger'}>
              {actionType === 'contribute' ? 'Proses Setoran' : 'Proses Penarikan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Contribution History Log */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Riwayat Kontribusi & Log Mutasi Tabungan"
      >
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {contributions.length === 0 ? (
            <p className="text-xs text-center py-6 text-slate-400">Belum ada riwayat mutasi tabungan.</p>
          ) : (
            contributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{c.user?.name || 'Kontributor'}</p>
                  <p className="text-[11px] text-slate-400">{c.notes || formatDate(c.created_at || '')}</p>
                </div>
                <span
                  className={`font-black ${
                    c.type === 'withdraw' ? 'text-rose-500' : 'text-emerald-500'
                  }`}
                >
                  {c.type === 'withdraw' ? '-' : '+'} {formatIDR(Number(c.amount))}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}



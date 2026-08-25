'use client';
import { PageSkeleton } from '@/components/ui/Skeleton';

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, CheckCircle2, Clock, Trash2, Edit2, UserPlus, Users, List, Grid } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/providers/ToastProvider';
import { formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { Agenda, User } from '@/lib/types';

export default function AgendasPage() {
  const { toast } = useToast();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal Agenda
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date().toISOString().slice(0, 16),
  });

  // Invite Member Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetchAgendas();
  }, []);

  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/agendas');
      const rawAgendas = res.data?.data; setAgendas(Array.isArray(rawAgendas) ? rawAgendas : (rawAgendas?.items || []));
    } catch (err) {
      toast('error', 'Gagal memuat agenda');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAgenda(null);
    setFormData({
      title: '',
      description: '',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date().toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Agenda) => {
    setEditingAgenda(a);
    setFormData({
      title: a.title,
      description: a.description || '',
      start_date: a.start_date.slice(0, 16),
      end_date: a.end_date.slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast('error', 'Silakan isi judul dan waktu agenda');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    };

    try {
      if (editingAgenda) {
        await apiClient.put(`/agendas/${editingAgenda.id}`, payload);
        toast('success', 'Agenda berhasil diperbarui');
      } else {
        await apiClient.post('/agendas', payload);
        toast('success', 'Agenda baru berhasil dibuat');
      }
      setIsModalOpen(false);
      fetchAgendas();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menyimpan agenda');
    }
  };

  const toggleStatus = async (agenda: Agenda) => {
    const newStatus = agenda.status === 'completed' || agenda.status === 'terlaksana' ? 'pending' : 'completed';
    try {
      await apiClient.put(`/agendas/${agenda.id}/status`, { status: newStatus });
      toast('success', `Status agenda diubah menjadi ${newStatus === 'completed' ? 'Selesai' : 'Pending'}`);
      fetchAgendas();
    } catch (err: any) {
      toast('error', err.message || 'Gagal memperbarui status');
    }
  };

  const handleDeleteAgenda = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus agenda ini?')) return;
    try {
      await apiClient.delete(`/agendas/${id}`);
      toast('success', 'Agenda berhasil dihapus');
      fetchAgendas();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menghapus agenda');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgendaId || !inviteEmail) return;
    try {
      await apiClient.post(`/agendas/${selectedAgendaId}/members`, { email: inviteEmail });
      toast('success', `Undangan berhasil dikirim ke ${inviteEmail}`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      fetchAgendas();
    } catch (err: any) {
      toast('error', err.message || 'Gagal mengundang anggota');
    }
  };

  if (loading) return <PageSkeleton title="Memuat Data Agenda & Kalender..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Kalender & Agenda Management 📅
          </h1>
          <p className="text-xs text-slate-500 mt-1">Jadwalkan kegiatan, undang anggota, dan tandai tugas selesai</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Agenda
          </Button>
        </div>
      </div>

      {/* Agenda Items List / Grid */}
      {loading ? (
        <p className="text-xs text-slate-400">Memuat agenda...</p>
      ) : agendas.length === 0 ? (
        <Card className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Belum Ada Agenda Terjadwal</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Buat agenda kegiatan baru untuk memantau rapat, pembayaran, atau acara bersama.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            Buat Agenda Pertama
          </Button>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {agendas.map((a) => {
            const isCompleted = a.status === 'completed' || a.status === 'terlaksana';
            return (
              <Card key={a.id} gradientHover className="space-y-4 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className={`font-bold text-base ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {a.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" />
                      {formatDate(a.start_date)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleStatus(a)}
                    className={`p-2 rounded-xl transition ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-emerald-400'
                    }`}
                    title={isCompleted ? 'Tandai Belum Selesai' : 'Tandai Terlaksana'}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                </div>

                {a.description && <p className="text-xs text-slate-400 leading-relaxed">{a.description}</p>}

                {/* Members list */}
                {a.members && a.members.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-400 font-medium">
                      {a.members.length} Anggota Terlibat
                    </span>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <Badge variant={isCompleted ? 'success' : 'warning'}>
                    {isCompleted ? 'Terlaksana' : 'Pending'}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedAgendaId(a.id);
                        setIsInviteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-indigo-500 transition"
                      title="Undang Anggota"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-indigo-500 transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAgenda(a.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition"
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

      {/* Modal Add/Edit Agenda */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAgenda ? 'Edit Agenda' : 'Tambah Agenda Baru'}
      >
        <form onSubmit={handleSaveAgenda} className="space-y-4">
          <Input
            label="Judul Agenda"
            type="text"
            placeholder="Contoh: Rapat Evaluasi Bulanan"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Deskripsi / Catatan"
            type="text"
            placeholder="Contoh: Membahas alokasi kas & budget"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Waktu Mulai"
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />

            <Input
              label="Waktu Selesai"
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Simpan Agenda
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Invite Member */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Undang Anggota ke Agenda"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <Input
            label="Email Anggota"
            type="email"
            placeholder="nama.teman@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="secondary">
              Kirim Undangan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


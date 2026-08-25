'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  ArrowUpDown,
  Calendar as CalendarIcon,
  CheckSquare,
  Square,
  Tag,
  PlusCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/providers/ToastProvider';
import { formatIDR, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { Transaction, Category } from '@/lib/types';
import { PageSkeleton } from '@/components/ui/Skeleton';

export default function TransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Table State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Category Form State
  const [newCatData, setNewCatData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        apiClient.get('/transactions'),
        apiClient.get('/categories'),
      ]);
      const rawTx = txRes.data?.data;
      setTransactions(Array.isArray(rawTx) ? rawTx : (rawTx?.items || []));

      const rawCat = catRes.data?.data;
      const fetchedCats: Category[] = Array.isArray(rawCat) ? rawCat : (rawCat?.items || []);
      setCategories(fetchedCats);
      if (fetchedCats.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: fetchedCats[0].id }));
      }
    } catch (err: any) {
      toast('error', 'Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  // Handle Save / Update Transaction
  const handleSaveTransaction = async (e: React.FormEvent) => {
    setIsSaving(true);
    e.preventDefault();
    if (!formData.category_id || !formData.amount) {
      toast('error', 'Silakan lengkapi bidang kategori dan jumlah nominal');
      return;
    }

    try {
      const payload = {
        category_id: formData.category_id,
        amount: Number(formData.amount),
        date: formData.date,
        notes: formData.notes,
      };

      if (editingTx) {
        await apiClient.put(`/transactions/${editingTx.id}`, payload);
        toast('success', 'Transaksi berhasil diperbarui');
      } else {
        await apiClient.post('/transactions', payload);
        toast('success', 'Transaksi baru berhasil dibuat');
      }

      setIsModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Save Custom Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatData.name) {
      toast('error', 'Nama kategori wajib diisi');
      return;
    }

    try {
      await apiClient.post('/categories', newCatData);
      toast('success', 'Kategori baru berhasil dibuat');
      setNewCatData({ name: '', type: 'expense' });
      fetchInitialData();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menambah kategori');
    }
  };

  // Delete Single Transaction
  const handleDeleteTransaction = async () => {
    if (!txToDelete) return;
    try {
      await apiClient.delete(`/transactions/${txToDelete}`);
      toast('success', 'Transaksi berhasil dihapus');
      setIsDeleteModalOpen(false);
      setTxToDelete(null);
      fetchInitialData();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menghapus transaksi');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi terpilih?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => apiClient.delete(`/transactions/${id}`)));
      toast('success', `${selectedIds.length} transaksi berhasil dihapus`);
      setSelectedIds([]);
      fetchInitialData();
    } catch (err: any) {
      toast('error', 'Gagal menghapus beberapa transaksi');
    }
  };

  // Open Modals
  const handleOpenCreateModal = () => {
    setEditingTx(null);
    setFormData({
      category_id: categories.length > 0 ? categories[0].id : '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      category_id: tx.category_id,
      amount: String(tx.amount),
      date: tx.date ? tx.date.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: tx.notes || '',
    });
    setIsModalOpen(true);
  };

  // Filter & Sort Logic
  const filteredTransactions = transactions
    .filter((tx) => {
      const matchSearch =
        tx.notes?.toLowerCase().includes(search.toLowerCase()) ||
        tx.category?.name.toLowerCase().includes(search.toLowerCase()) ||
        String(tx.amount).includes(search);
      const matchCategory = categoryFilter === 'all' || tx.category_id === categoryFilter;
      const matchType = typeFilter === 'all' || tx.category?.type === typeFilter;
      return matchSearch && matchCategory && matchType;
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount);
      }
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Multi-Select Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTransactions.map((t) => t.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = (selectedIds.length > 0
      ? transactions.filter((t) => selectedIds.includes(t.id))
      : filteredTransactions
    ).map((t) => ({
      Tanggal: formatDate(t.date),
      Kategori: t.category?.name || '-',
      Tipe: t.category?.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Jumlah: Number(t.amount),
      Catatan: t.notes || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');
    XLSX.writeFile(workbook, `Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast('success', 'Data transaksi berhasil diekspor ke Excel');
  };

  if (loading) return <PageSkeleton title="Memuat Data Transaksi..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Pusat Transaksi Data 📊
          </h1>
          <p className="text-xs text-slate-500 mt-1">Kelola, saring, dan ekspor riwayat transaksi keuangan Anda</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsCategoryModalOpen(true)}>
            <Tag className="h-4 w-4 mr-1 text-indigo-500" /> Kelola Kategori ({categories.length})
          </Button>
          <Button variant="secondary" size="sm" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4 mr-1" /> Transaksi Baru
          </Button>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Multi-Export, Bulk Actions */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2">
            <Input
              placeholder="Cari transaksi atau catatan..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Category */}
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Kategori' },
              ...categories.map((c) => ({ value: c.id, label: `${c.name} (${c.type === 'income' ? '+' : '-'})` })),
            ]}
          />

          {/* Filter Type */}
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Tipe Kas' },
              { value: 'income', label: 'Pemasukan (+)' },
              { value: 'expense', label: 'Pengeluaran (-)' },
            ]}
          />
        </div>

        {/* Toolbar Actions: Sort, Export & Bulk Delete */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Urutkan:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSortField('date');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="text-xs"
            >
              Tanggal {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSortField('amount');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="text-xs"
            >
              Nominal {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus Terpilih ({selectedIds.length})
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Ekspor Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <button onClick={handleSelectAll}>
                    {selectedIds.length > 0 && selectedIds.length === paginatedTransactions.length ? (
                      <CheckSquare className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Catatan</th>
                <th className="p-3.5 text-right">Nominal</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat daftar transaksi...
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Belum ada data transaksi yang sesuai filter
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isSelected = selectedIds.includes(tx.id);
                  const isIncome = tx.category?.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-500/10' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <button onClick={() => handleSelectOne(tx.id)}>
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-500" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 font-medium whitespace-nowrap">{formatDate(tx.date)}</td>
                      <td className="p-3.5">
                        <Badge variant={isIncome ? 'success' : 'danger'}>
                          {tx.category?.name || 'Umum'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-400 max-w-xs truncate">{tx.notes || '-'}</td>
                      <td
                        className={`p-3.5 text-right font-extrabold whitespace-nowrap ${
                          isIncome ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatIDR(Number(tx.amount))}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setTxToDelete(tx.id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-400">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Add / Edit Transaction */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTx ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4">
          <Select
            label="Kategori"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            options={categories.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.type === 'income' ? 'Pemasukan +' : 'Pengeluaran -'})`,
            }))}
            required
          />

          <Input
            label="Nominal Rp"
            type="number"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          <Input
            label="Tanggal"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label="Catatan / Keterangan"
            type="text"
            placeholder="Contoh: Belanja Bulanan di Supermarket"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              {editingTx ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Category Management & Add New */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Kelola & Tambah Kategori Keuangan"
      >
        <div className="space-y-6">
          {/* List Existing Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Daftar Kategori Terdaftar ({categories.length})
            </h4>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              {categories.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada kategori</p>
              ) : (
                categories.map((cat) => (
                  <Badge key={cat.id} variant={cat.type === 'income' ? 'success' : 'danger'} className="text-xs py-1 px-2.5">
                    {cat.name} ({cat.type === 'income' ? '+' : '-'})
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Form Add New Category */}
          <form onSubmit={handleSaveCategory} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4 text-indigo-500" /> Tambah Kategori Kustom Baru
            </h4>

            <Input
              label="Nama Kategori"
              type="text"
              placeholder="Contoh: Transportasi, Bonus, Crypto, Hobi"
              value={newCatData.name}
              onChange={(e) => setNewCatData({ ...newCatData, name: e.target.value })}
              required
            />

            <Select
              label="Tipe Kategori"
              value={newCatData.type}
              onChange={(e) => setNewCatData({ ...newCatData, type: e.target.value as any })}
              options={[
                { value: 'expense', label: 'Pengeluaran (-)' },
                { value: 'income', label: 'Pemasukan (+)' },
              ]}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>
                Tutup
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Simpan Kategori Baru
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal Confirm Delete Single */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Apakah Anda yakin ingin menghapus catatan transaksi ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDeleteTransaction}>
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
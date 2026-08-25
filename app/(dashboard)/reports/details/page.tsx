'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Filter,
  RotateCcw,
  Search,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Sparkles,
  TrendingDown,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/providers/ToastProvider';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatIDR, formatDate, getCutOffPeriod } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { Transaction } from '@/lib/types';

export default function DetailedReportPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Date Filter State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [cutoffLabel, setCutoffLabel] = useState<string>('');

  // Table Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  useEffect(() => {
    const period = getCutOffPeriod();
    setStartDate(period.startDate);
    setEndDate(period.endDate);
    setCutoffLabel(period.label);

    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/transactions');
      const rawTx = res.data?.data;
      setTransactions(Array.isArray(rawTx) ? rawTx : (rawTx?.items || []));
    } catch (err: any) {
      toast('error', 'Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  // Filter Transactions by Date Range
  const periodTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const txDateStr = t.date.split('T')[0];
    if (startDate && txDateStr < startDate) return false;
    if (endDate && txDateStr > endDate) return false;
    return true;
  });

  // Calculate High-level Summary
  const totalIncome = periodTransactions
    .filter((t) => t.category?.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = periodTransactions
    .filter((t) => t.category?.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netCashFlow = totalIncome - totalExpense;

  // Separate Expenses Only for "Where Did Money Go"
  const expenseTransactions = periodTransactions.filter((t) => t.category?.type === 'expense');

  // Filter Ledger by Search & Category Select
  const filteredLedger = expenseTransactions.filter((t) => {
    const matchSearch =
      (t.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.category?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(t.amount).includes(search);
    const matchCategory = selectedCatFilter === 'all' || t.category_id === selectedCatFilter;
    return matchSearch && matchCategory;
  });

  // Group Expenses by Category for Summary Table
  const categorySummaryMap: Record<
    string,
    {
      catId: string;
      name: string;
      totalAmount: number;
      txCount: number;
    }
  > = {};

  expenseTransactions.forEach((t) => {
    const catName = t.category?.name || 'Lainnya';
    const catId = t.category_id || 'unknown';
    if (!categorySummaryMap[catName]) {
      categorySummaryMap[catName] = {
        catId,
        name: catName,
        totalAmount: 0,
        txCount: 0,
      };
    }
    categorySummaryMap[catName].totalAmount += Number(t.amount);
    categorySummaryMap[catName].txCount += 1;
  });

  const categorySummaryList = Object.values(categorySummaryMap)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map((item) => ({
      ...item,
      percentage: totalExpense > 0 ? (item.totalAmount / totalExpense) * 100 : 0,
      avgPerTx: item.txCount > 0 ? item.totalAmount / item.txCount : 0,
    }));

  const handleResetFilter = () => {
    const period = getCutOffPeriod();
    setStartDate(period.startDate);
    setEndDate(period.endDate);
    setSearch('');
    setSelectedCatFilter('all');
  };

  // Export PDF Report
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Laporan Audit Alokasi Pengeluaran Kas', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Periode: ${startDate || 'Awal'} s/d ${endDate || 'Hari Ini'} (${cutoffLabel})`, 14, 28);
    doc.text(`Total Pemasukan: ${formatIDR(totalIncome)} | Total Pengeluaran: ${formatIDR(totalExpense)}`, 14, 34);

    // Table 1: Category Allocation
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Ringkasan Alokasi Kas per Kategori', 14, 46);

    const catRows = categorySummaryList.map((item) => [
      item.name,
      `${item.txCount} Transaksi`,
      formatIDR(item.totalAmount),
      `${item.percentage.toFixed(1)}%`,
      formatIDR(item.avgPerTx),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Kategori', 'Frekuensi', 'Total Nominal (Rp)', 'Persentase Alokasi', 'Rata-rata / Transaksi']],
      body: catRows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    });

    // Table 2: Full Itemized Ledger
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Rincian Item Pengeluaran Kas ("Kemana Uang Pergi")', 14, finalY + 14);

    const ledgerRows = filteredLedger.map((t, index) => [
      index + 1,
      formatDate(t.date),
      t.category?.name || 'Umum',
      t.notes || '-',
      formatIDR(Number(t.amount)),
      `${totalExpense > 0 ? ((Number(t.amount) / totalExpense) * 100).toFixed(1) : 0}%`,
    ]);

    autoTable(doc, {
      startY: finalY + 18,
      head: [['No', 'Tanggal', 'Kategori', 'Catatan / Alokasi', 'Nominal (Rp)', '% Bobot']],
      body: ledgerRows,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
    });

    doc.save(`Laporan_Alokasi_Kas_${new Date().toISOString().split('T')[0]}.pdf`);
    toast('success', 'Laporan PDF Audit Alokasi Kas berhasil diunduh');
  };

  // Export Excel Report
  const handleExportExcel = () => {
    const summarySheetData = categorySummaryList.map((c) => ({
      Kategori: c.name,
      Jumlah_Transaksi: c.txCount,
      Total_Nominal: c.totalAmount,
      Persentase_Alokasi: `${c.percentage.toFixed(1)}%`,
      Rata_Rata_Transaksi: c.avgPerTx,
    }));

    const ledgerSheetData = filteredLedger.map((t) => ({
      Tanggal: formatDate(t.date),
      Kategori: t.category?.name || 'Umum',
      Catatan: t.notes || '-',
      Nominal: Number(t.amount),
      Persentase_Total: `${totalExpense > 0 ? ((Number(t.amount) / totalExpense) * 100).toFixed(1) : 0}%`,
    }));

    const workbook = XLSX.utils.book_new();

    const wsSummary = XLSX.utils.json_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan Kategori');

    const wsLedger = XLSX.utils.json_to_sheet(ledgerSheetData);
    XLSX.utils.book_append_sheet(workbook, wsLedger, 'Rincian Pengeluaran');

    XLSX.writeFile(workbook, `Detail_Alokasi_Kas_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast('success', 'File Excel Detail Alokasi Kas berhasil diunduh');
  };

  if (loading) return <PageSkeleton title="Memuat Detail Alokasi Kas..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Title & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Detail Alokasi Kas Keuangan 📑
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Laporan rinci & audit pengeluaran kas untuk melacak secara persis kemana saja uang Anda pergi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-1 text-emerald-500" /> Ekspor Excel
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-1" /> Unduh PDF Audit
          </Button>
        </div>
      </div>

      {/* Date Filter & Period Control Bar */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Rentang Tanggal Audit:
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Periode Aktif: {cutoffLabel}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium shrink-0">Dari:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium shrink-0">Sampai:</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={handleResetFilter} className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
        </div>
      </Card>

      {/* Hero Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card gradientHover>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Total Pemasukan</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{formatIDR(totalIncome)}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Arus kas masuk terverifikasi</span>
        </Card>

        <Card gradientHover>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Total Pengeluaran</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{formatIDR(totalExpense)}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Seluruh dana teralokasi keluar</span>
        </Card>

        <Card gradientHover>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Net Stance</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{formatIDR(netCashFlow)}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Sisa Kas Terjaga</span>
        </Card>

        <Card gradientHover>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Frekuensi Pengeluaran</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{expenseTransactions.length} Item</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Catatan transaksi keluar</span>
        </Card>
      </div>

      {/* TABEL 1: Ringkasan Alokasi Kas per Kategori ("Kemana Uang Pergi") */}
      <Card className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Ringkasan Alokasi Kas per Kategori
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Distribusi total pengeluaran beserta persentase bobot alokasi pada periode ini.
            </p>
          </div>
          <Badge variant="warning">{categorySummaryList.length} Kategori Terpakai</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="p-3">Kategori Pengeluaran</th>
                <th className="p-3 text-center">Jumlah Transaksi</th>
                <th className="p-3 text-right">Total Nominal (Rp)</th>
                <th className="p-3 text-center">Persentase Alokasi</th>
                <th className="p-3 text-right">Rata-rata / Transaksi</th>
                <th className="p-3 w-48">Bobot Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {categorySummaryList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500 dark:text-slate-400">
                    Belum ada pengeluaran kas pada periode ini
                  </td>
                </tr>
              ) : (
                categorySummaryList.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{item.name}</td>
                    <td className="p-3 text-center font-medium text-slate-700 dark:text-slate-300">{item.txCount} Transaksi</td>
                    <td className="p-3 text-right font-extrabold text-rose-600 dark:text-rose-400">{formatIDR(item.totalAmount)}</td>
                    <td className="p-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400">{item.percentage.toFixed(1)}%</td>
                    <td className="p-3 text-right text-slate-600 dark:text-slate-400 font-medium">{formatIDR(item.avgPerTx)}</td>
                    <td className="p-3">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* TABEL 2: Rincian Audit Lengkap Setiap Item Pengeluaran ("Kemana Uang Pergi") */}
      <Card className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" /> Rincian Item Audit Pengeluaran Kas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Tabel lengkap seluruh transaksi pengeluaran beserta catatan alokasi tujuan penggunaan uang.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-48">
              <Input
                placeholder="Cari item / catatan..."
                icon={<Search className="h-3.5 w-3.5" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="py-1 text-xs"
              />
            </div>
            <div className="w-44">
              <Select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua Kategori' },
                  ...categorySummaryList.map((c) => ({ value: c.catId, label: c.name })),
                ]}
                className="py-1 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Catatan / Alokasi Tujuan</th>
                <th className="p-3 text-right">Nominal Keluar (Rp)</th>
                <th className="p-3 text-center">% Terhadap Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Tidak ditemukan item pengeluaran yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredLedger.map((tx, idx) => {
                  const itemAmt = Number(tx.amount || 0);
                  const itemWeight = totalExpense > 0 ? (itemAmt / totalExpense) * 100 : 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 text-center text-slate-500 dark:text-slate-400 font-medium">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{formatDate(tx.date)}</td>
                      <td className="p-3">
                        <Badge variant="danger">{tx.category?.name || 'Umum'}</Badge>
                      </td>
                      <td className="p-3 text-slate-800 dark:text-slate-200 font-medium max-w-sm">
                        {tx.notes || <span className="text-slate-400 italic">Tanpa catatan</span>}
                      </td>
                      <td className="p-3 text-right font-extrabold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        - {formatIDR(itemAmt)}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">{itemWeight.toFixed(1)}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
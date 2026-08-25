'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatIDR, getMonthName } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { Transaction } from '@/lib/types';
import { PageSkeleton } from '@/components/ui/Skeleton';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/transactions');
      const rawTx = res.data?.data; setTransactions(Array.isArray(rawTx) ? rawTx : (rawTx?.items || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions by selected month & year
  const filteredTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === Number(selectedMonth) && d.getFullYear() === Number(selectedYear);
  });

  const totalIncome = filteredTxs
    .filter((t) => t.category?.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTxs
    .filter((t) => t.category?.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netCashFlow = totalIncome - totalExpense;
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dailyAverageExpense = totalExpense / (daysInMonth || 30);

  // Category Deep Dive Calculation
  const catSummaryMap: Record<string, { name: string; total: number; type: string }> = {};
  filteredTxs.forEach((t) => {
    const catName = t.category?.name || 'Lainnya';
    if (!catSummaryMap[catName]) {
      catSummaryMap[catName] = { name: catName, total: 0, type: t.category?.type || 'expense' };
    }
    catSummaryMap[catName].total += Number(t.amount);
  });

  const categoryBreakdown = Object.values(catSummaryMap).sort((a, b) => b.total - a.total);

  if (loading) return <PageSkeleton title="Memuat Laporan Keuangan..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Period Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Laporan Keuangan & Insights 📈
          </h1>
          <p className="text-xs text-slate-500 mt-1">Analisis mendalam arus kas, rata-rata pengeluaran, dan net income</p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedMonth.toString()}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: (i + 1).toString(),
              label: getMonthName(i + 1),
            }))}
            className="w-36"
          />
          <Select
            value={selectedYear.toString()}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            options={[
              { value: '2025', label: '2025' },
              { value: '2026', label: '2026' },
              { value: '2027', label: '2027' },
            ]}
            className="w-28"
          />
        </div>
      </div>

      {/* Net Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card gradientHover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo Bersih (Net)</span>
            <DollarSign className="h-5 w-5 text-indigo-500" />
          </div>
          <p className={`text-2xl font-black mt-3 tracking-tight ${netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatIDR(netCashFlow)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            {netCashFlow >= 0 ? '🟢 Surplus Keuangan' : '🔴 Defisit Keuangan'}
          </div>
        </Card>

        <Card gradientHover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pemasukan</span>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500 mt-3 tracking-tight">{formatIDR(totalIncome)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">Pemasukan bulan ini</div>
        </Card>

        <Card gradientHover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pengeluaran</span>
            <TrendingDown className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500 mt-3 tracking-tight">{formatIDR(totalExpense)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">Belanja & pengeluaran</div>
        </Card>

        <Card gradientHover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-Rata Harian</span>
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500 mt-3 tracking-tight">{formatIDR(dailyAverageExpense)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">Estimasi per hari</div>
        </Card>
      </div>

      {/* Category Deep Dive Breakdown */}
      <Card>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Deep Dive Breakdown per Kategori</h3>
          </div>
          <Badge variant="info">Detail Persentase</Badge>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-center py-8 text-slate-400">Tidak ada transaksi pada periode yang dipilih.</p>
        ) : (
          <div className="space-y-4">
            {categoryBreakdown.map((item) => {
              const baseTotal = item.type === 'income' ? totalIncome : totalExpense;
              const pct = baseTotal > 0 ? (item.total / baseTotal) * 100 : 0;

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Badge variant={item.type === 'income' ? 'success' : 'danger'}>{item.name}</Badge>
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 font-extrabold">
                      {formatIDR(item.total)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}


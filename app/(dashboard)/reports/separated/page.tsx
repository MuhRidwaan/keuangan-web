'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Scale,
  Receipt,
  Filter,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatIDR, formatDate, getMonthName, getCutOffPeriod } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { Transaction } from '@/lib/types';
import { PageSkeleton } from '@/components/ui/Skeleton';

export default function SeparatedReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Date Range Filter State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [cutoffInfo, setCutoffInfo] = useState<{ label: string; isCutOffSet: boolean; cutoffDay: number }>({
    label: '',
    isCutOffSet: false,
    cutoffDay: 1,
  });

  useEffect(() => {
    const period = getCutOffPeriod();
    setStartDate(period.startDate);
    setEndDate(period.endDate);
    setCutoffInfo({ label: period.label, isCutOffSet: period.isCutOffSet, cutoffDay: period.cutoffDay });
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/transactions');
      const rawTx = res.data?.data;
      setTransactions(Array.isArray(rawTx) ? rawTx : (rawTx?.items || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    const period = getCutOffPeriod();
    setStartDate(period.startDate);
    setEndDate(period.endDate);
  };

  // Filter transactions by selected cut-off period date range
  const filteredTxs = transactions.filter((t) => {
    if (!t.date) return false;
    const txDateStr = t.date.split('T')[0];
    if (startDate && txDateStr < startDate) return false;
    if (endDate && txDateStr > endDate) return false;
    return true;
  });

  // Separate Income and Expense Transactions
  const incomeTxs = filteredTxs.filter((t) => t.category?.type === 'income');
  const expenseTxs = filteredTxs.filter((t) => t.category?.type === 'expense');

  // Totals
  const totalIncome = incomeTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpense = expenseTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netFlow = totalIncome - totalExpense;
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // Breakdown per Category - Income
  const incomeCatMap: Record<string, { name: string; total: number; count: number }> = {};
  incomeTxs.forEach((t) => {
    const name = t.category?.name || 'Pemasukan Lain';
    if (!incomeCatMap[name]) {
      incomeCatMap[name] = { name, total: 0, count: 0 };
    }
    incomeCatMap[name].total += Number(t.amount || 0);
    incomeCatMap[name].count += 1;
  });
  const incomeCategories = Object.values(incomeCatMap).sort((a, b) => b.total - a.total);

  // Breakdown per Category - Expense
  const expenseCatMap: Record<string, { name: string; total: number; count: number }> = {};
  expenseTxs.forEach((t) => {
    const name = t.category?.name || 'Pengeluaran Lain';
    if (!expenseCatMap[name]) {
      expenseCatMap[name] = { name, total: 0, count: 0 };
    }
    expenseCatMap[name].total += Number(t.amount || 0);
    expenseCatMap[name].count += 1;
  });
  const expenseCategories = Object.values(expenseCatMap).sort((a, b) => b.total - a.total);

  // Top 5 Transactions
  const topIncomes = [...incomeTxs].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);
  const topExpenses = [...expenseTxs].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

  if (loading) return <PageSkeleton title="Memuat Laporan Terpisah..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          Laporan Pemasukan & Pengeluaran Terpisah ⚖️
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Analisis terpisah tanpa mencampurkan arus pemasukan dan pengeluaran Anda
        </p>
      </div>

      {/* Date Range Filter Control Bar */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Filter className="h-4 w-4 text-indigo-500" /> Filter Rentang Tanggal:
          </div>
          {cutoffInfo.isCutOffSet ? (
            <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Siklus Gajian (Cut-Off Tgl {cutoffInfo.cutoffDay}): {cutoffInfo.label}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">
              Periode Bulan Kalender (Tgl 1 - Akhir Bulan)
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium shrink-0">Dari:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-1.5 text-xs w-36"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium shrink-0">Sampai:</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-1.5 text-xs w-36"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilter}
            className="text-xs text-indigo-500 hover:text-indigo-400 border border-indigo-500/20"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Default Periode
          </Button>
        </div>
      </Card>

      {/* Financial Health Snapshot Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-600/30 border border-indigo-500/40 shrink-0">
            <Scale className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">
              Rasio Arus Kas: Pengeluaran {expenseRatio.toFixed(1)}% Dari Total Pemasukan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Net Surplus/Defisit Periode Ini: <strong className={netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatIDR(netFlow)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Badge variant={expenseRatio <= 70 ? 'success' : expenseRatio <= 90 ? 'warning' : 'danger'}>
            {expenseRatio <= 70 ? '🟢 Arus Sehat (<70%)' : expenseRatio <= 90 ? '🟡 Peringatan (70-90%)' : '🔴 Tinggi (>90%)'}
          </Badge>
        </div>
      </div>

      {/* Main 2-Column Grid: Income vs Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ==================== SEKSI PEMASUKAN ==================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Seksi Pemasukan 🟢</h2>
                <p className="text-[11px] text-slate-400">Seluruh sumber dana & kas masuk terverifikasi</p>
              </div>
            </div>
            <Badge variant="success">{incomeTxs.length} Transaksi</Badge>
          </div>

          {/* Income Summary Metric Card */}
          <Card gradientHover className="border-l-4 border-l-emerald-500 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pemasukan Periode Ini</span>
            <p className="text-3xl font-black text-emerald-500 tracking-tight">{formatIDR(totalIncome)}</p>
            <p className="text-xs text-slate-500">Dari {incomeCategories.length} kategori pemasukan aktif</p>
          </Card>

          {/* Income Category Breakdown */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-500" />
                Breakdown Kategori Pemasukan
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{incomeCategories.length} Kategori</span>
            </div>

            {incomeCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi pemasukan pada periode ini.</p>
            ) : (
              <div className="space-y-3">
                {incomeCategories.map((c) => {
                  const pct = totalIncome > 0 ? (c.total / totalIncome) * 100 : 0;
                  return (
                    <div key={c.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.name} <span className="text-[10px] text-slate-400 font-normal">({c.count} tx)</span>
                        </span>
                        <span className="font-extrabold text-emerald-500">
                          {formatIDR(c.total)} <span className="text-[11px] text-slate-400">({pct.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Top 5 Income Transactions */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                5 Pemasukan Terbesar
              </h3>
            </div>

            {topIncomes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Tidak ada data.</p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {topIncomes.map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{t.notes || t.category?.name}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(t.date)} • {t.category?.name}</p>
                    </div>
                    <span className="font-black text-emerald-500">{formatIDR(Number(t.amount))}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ==================== SEKSI PENGELUARAN ==================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Seksi Pengeluaran 🔴</h2>
                <p className="text-[11px] text-slate-400">Seluruh belanja, beban, & alokasi keluar</p>
              </div>
            </div>
            <Badge variant="danger">{expenseTxs.length} Transaksi</Badge>
          </div>

          {/* Expense Summary Metric Card */}
          <Card gradientHover className="border-l-4 border-l-rose-500 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pengeluaran Periode Ini</span>
            <p className="text-3xl font-black text-rose-500 tracking-tight">{formatIDR(totalExpense)}</p>
            <p className="text-xs text-slate-500">Dari {expenseCategories.length} kategori pengeluaran aktif</p>
          </Card>

          {/* Expense Category Breakdown */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-rose-500" />
                Breakdown Kategori Pengeluaran
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{expenseCategories.length} Kategori</span>
            </div>

            {expenseCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi pengeluaran pada periode ini.</p>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map((c) => {
                  const pct = totalExpense > 0 ? (c.total / totalExpense) * 100 : 0;
                  return (
                    <div key={c.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.name} <span className="text-[10px] text-slate-400 font-normal">({c.count} tx)</span>
                        </span>
                        <span className="font-extrabold text-rose-500">
                          {formatIDR(c.total)} <span className="text-[11px] text-slate-400">({pct.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Top 5 Expense Transactions */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-rose-500" />
                5 Pengeluaran Terbesar
              </h3>
            </div>

            {topExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Tidak ada data.</p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {topExpenses.map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{t.notes || t.category?.name}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(t.date)} • {t.category?.name}</p>
                    </div>
                    <span className="font-black text-rose-500">{formatIDR(Number(t.amount))}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}

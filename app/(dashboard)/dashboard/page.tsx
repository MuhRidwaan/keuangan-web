'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  PlusCircle,
  Receipt,
  Sparkles,
  Filter,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatIDR, formatDate, getCutOffPeriod, getCutOffDay } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { Transaction, Agenda, Budget } from '@/lib/types';
import { PageSkeleton } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartTimeframe, setChartTimeframe] = useState<'daily' | 'monthly'>('daily');

  // Date Range Filter State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [cutoffInfo, setCutoffInfo] = useState<{ label: string; isCutOffSet: boolean; cutoffDay: number }>({
    label: '',
    isCutOffSet: false,
    cutoffDay: 1,
  });

  useEffect(() => {
    // Apply automatic salary Cut-Off period on initial load
    const period = getCutOffPeriod();
    setStartDate(period.startDate);
    setEndDate(period.endDate);
    setCutoffInfo({ label: period.label, isCutOffSet: period.isCutOffSet, cutoffDay: period.cutoffDay });

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [txRes, agendaRes, budgetRes] = await Promise.all([
        apiClient.get('/transactions'),
        apiClient.get('/agendas'),
        apiClient.get('/budgets'),
      ]);

      const rawTxData = txRes.data?.data;
      const txItems = Array.isArray(rawTxData) ? rawTxData : (rawTxData?.items || []);
      setTransactions(txItems);

      const rawAgendaData = agendaRes.data?.data;
      setAgendas(Array.isArray(rawAgendaData) ? rawAgendaData : (rawAgendaData?.items || []));

      const rawBudgetData = budgetRes.data?.data;
      setBudgets(Array.isArray(rawBudgetData) ? rawBudgetData : (rawBudgetData?.items || []));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on date range selection
  const filteredTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const txDateStr = t.date.split('T')[0];
    if (startDate && txDateStr < startDate) return false;
    if (endDate && txDateStr > endDate) return false;
    return true;
  });

  // Calculations based on filtered transactions
  const totalIncome = filteredTransactions
    .filter((t) => t.category?.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.category?.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalBalance = totalIncome - totalExpense;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpense = filteredTransactions
    .filter((t) => t.category?.type === 'expense' && t.date.startsWith(todayStr))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Category Distribution for Pie Chart
  const categoryMap: Record<string, { name: string; value: number }> = {};
  filteredTransactions
    .filter((t) => t.category?.type === 'expense')
    .forEach((t) => {
      const catName = t.category?.name || 'Lainnya';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, value: 0 };
      }
      categoryMap[catName].value += Number(t.amount);
    });
  const pieData = Object.values(categoryMap);
  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];

  // Real Daily Cash Flow Aggregation (Per Tanggal)
  const dailyMap: Record<string, { dateKey: string; label: string; Pemasukan: number; Pengeluaran: number }> = {};
  filteredTransactions.forEach((tx) => {
    const rawDate = tx.date ? tx.date.split('T')[0] : '';
    if (!rawDate) return;
    const d = new Date(rawDate);
    const label = isNaN(d.getTime())
      ? rawDate
      : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d);
    
    if (!dailyMap[rawDate]) {
      dailyMap[rawDate] = { dateKey: rawDate, label, Pemasukan: 0, Pengeluaran: 0 };
    }
    const amt = Number(tx.amount || 0);
    if (tx.category?.type === 'income') {
      dailyMap[rawDate].Pemasukan += amt;
    } else if (tx.category?.type === 'expense') {
      dailyMap[rawDate].Pengeluaran += amt;
    }
  });

  const dailyChartData = Object.values(dailyMap)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map((item) => ({
      label: item.label,
      Pemasukan: item.Pemasukan,
      Pengeluaran: item.Pengeluaran,
    }));

  // Real Monthly Cash Flow Aggregation (Per Bulan)
  const monthlyMap: Record<string, { monthKey: string; label: string; Pemasukan: number; Pengeluaran: number }> = {};
  filteredTransactions.forEach((tx) => {
    const rawDate = tx.date ? tx.date.split('T')[0] : '';
    if (!rawDate) return;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return;
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(d);

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { monthKey, label, Pemasukan: 0, Pengeluaran: 0 };
    }
    const amt = Number(tx.amount || 0);
    if (tx.category?.type === 'income') {
      monthlyMap[monthKey].Pemasukan += amt;
    } else if (tx.category?.type === 'expense') {
      monthlyMap[monthKey].Pengeluaran += amt;
    }
  });

  const monthlyChartData = Object.values(monthlyMap)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map((item) => ({
      label: item.label,
      Pemasukan: item.Pemasukan,
      Pengeluaran: item.Pengeluaran,
    }));

  const activeChartData = chartTimeframe === 'daily' ? dailyChartData : monthlyChartData;

  // Budget Smart Alert
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const isBudgetNearLimit = totalBudgetLimit > 0 && totalExpense / totalBudgetLimit >= 0.8;
  const isBudgetExceeded = totalBudgetLimit > 0 && totalExpense >= totalBudgetLimit;

  const handleResetFilter = () => {
    const period = getCutOffPeriod();
    setStartDate(period.startDate);
    setEndDate(period.endDate);
  };

  if (loading) return <PageSkeleton title="Memuat Dashboard Analytics..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Dashboard Analytics ??
          </h1>
          <p className="text-xs text-slate-500 mt-1">Pantau seluruh arus kas keuangan & agenda terdekat Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/transactions">
            <Button variant="primary" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" /> Catat Transaksi
            </Button>
          </Link>
        </div>
      </div>

      {/* Smart Alert Banner if Budget Warning */}
      {totalBudgetLimit > 0 && (isBudgetNearLimit || isBudgetExceeded) && (
        <div
          className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between ${
            isBudgetExceeded
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0" />
            <p className="text-xs font-medium">
              {isBudgetExceeded
                ? `Peringatan: Total pengeluaran Anda (${formatIDR(totalExpense)}) telah MELEBIHI batas budget bulanan (${formatIDR(totalBudgetLimit)})!`
                : `Perhatian: Total pengeluaran Anda (${formatIDR(totalExpense)}) hampir mencapai batas budget bulanan (${formatIDR(totalBudgetLimit)}).`}
            </p>
          </div>
          <Link href="/budget">
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              Atur Budget
            </Button>
          </Link>
        </div>
      )}

      {/* Hero Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <Card gradientHover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Saldo Periode</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-3 tracking-tight">
            {formatIDR(totalBalance)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-500">
            <ArrowUpRight className="h-4 w-4" /> Net Financial Stance
          </div>
        </Card>

        {/* Pemasukan */}
        <Card gradientHover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pemasukan Periode Ini</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-3 tracking-tight">
            {formatIDR(totalIncome)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 font-medium">
            Total kas masuk terverifikasi
          </div>
        </Card>

        {/* Pengeluaran */}
        <Card gradientHover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pengeluaran Periode Ini</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-3 tracking-tight">
            {formatIDR(totalExpense)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 font-medium">
            Total belanja & kebutuhan
          </div>
        </Card>

        {/* Pengeluaran Hari Ini */}
        <Card gradientHover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pengeluaran Hari Ini</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-3 tracking-tight">
            {formatIDR(todayExpense)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 font-medium">
            Catatan transaksi harian
          </div>
        </Card>
      </div>

      {/* Filter Control Bar: Form Pilih Tanggal & Indicator Cutoff */}
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
              Periode Bulan Kalender (Ubah di Pengaturan untuk menyesuaikan tgl gajian)
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <span className="text-xs text-slate-400 font-medium shrink-0">Dari:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <span className="text-xs text-slate-400 font-medium shrink-0">Sampai:</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={handleResetFilter} className="text-xs text-slate-500 hover:text-indigo-500">
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Default Periode
          </Button>
        </div>
      </Card>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Smooth Wave Area Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Arus Kas Gelombang ({chartTimeframe === 'daily' ? 'Per Tanggal' : 'Per Bulan'})
              </h3>
              <p className="text-xs text-slate-500">
                {chartTimeframe === 'daily'
                  ? 'Grafik tren bergelombang berdasarkan tanggal pengeluaran & pemasukan'
                  : 'Grafik tren bergelombang berdasarkan akumulasi per bulan'}
              </p>
            </div>

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-1">
              <button
                onClick={() => setChartTimeframe('daily')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  chartTimeframe === 'daily'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Per Tanggal
              </button>
              <button
                onClick={() => setChartTimeframe('monthly')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  chartTimeframe === 'monthly'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Per Bulan
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {activeChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada riwayat transaksi pada rentang tanggal ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} width={75} tickFormatter={(val) => { if (val >= 1000000) return `Rp${(val/1000000).toFixed(1)}jt`; if (val >= 1000) return `Rp${(val/1000).toFixed(0)}rb`; return `Rp${val}`; }} />
                  <Tooltip
                    formatter={(val: any) => [formatIDR(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="Pemasukan"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Pengeluaran"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Category Pie Chart (1 col) */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Distribusi Kategori</h3>
              <p className="text-xs text-slate-500">Breakdown Pengeluaran</p>
            </div>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada data pengeluaran</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatIDR(Number(val))} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Widgets Grid: Recent Transactions & Upcoming Agendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Transaksi Terakhir</h3>
            </div>
            <Link href="/transactions" className="text-xs font-bold text-indigo-500 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <p className="text-xs text-center py-6 text-slate-400">Belum ada catatan transaksi</p>
            ) : (
              filteredTransactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-white text-xs ${
                        tx.category?.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    >
                      {tx.category?.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {tx.category?.name || 'Kategori'}
                      </p>
                      <p className="text-[11px] text-slate-400">{tx.notes || formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-extrabold ${
                      tx.category?.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {tx.category?.type === 'income' ? '+' : '-'} {formatIDR(Number(tx.amount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Agendas Widget */}
        <Card>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Agenda Mendatang</h3>
            </div>
            <Link href="/agendas" className="text-xs font-bold text-emerald-500 hover:underline">
              Kelola Kalender
            </Link>
          </div>

          <div className="space-y-3">
            {agendas.length === 0 ? (
              <p className="text-xs text-center py-6 text-slate-400">Belum ada agenda terjadwal</p>
            ) : (
              agendas.slice(0, 5).map((agenda) => (
                <div
                  key={agenda.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{agenda.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(agenda.start_date)} - {agenda.description || 'Tanpa deskripsi'}
                    </p>
                  </div>
                  <Badge variant={agenda.status === 'completed' || agenda.status === 'terlaksana' ? 'success' : 'warning'}>
                    {agenda.status === 'completed' || agenda.status === 'terlaksana' ? 'Selesai' : 'Pending'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

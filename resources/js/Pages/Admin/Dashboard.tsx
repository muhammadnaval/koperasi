import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { StatCard } from '@/Components/UI/StatCard';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Select } from '@/Components/UI/Select';
import { Modal } from '@/Components/UI/Modal';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { 
  Users, 
  Wallet, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  ChevronRight, 
  PlusCircle, 
  Activity,
  Download,
  Search,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Calendar
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { members, savingsTransactions, loans, loanApplications, payments, currentUser, showToast } = useApp();
  const [periodFilter, setPeriodFilter] = useState('2026-07');
  const [dateFilter, setDateFilter] = useState('2026-07-29');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Chart Interactive Filters (Bulan & Tahun)
  const [chartViewMode, setChartViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [chartYear, setChartYear] = useState<string>('2026');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Stats Aggregations
  const activeMembersCount = members.filter(m => m.status === 'active').length;
  const pendingMembersCount = members.filter(m => m.status === 'pending').length;
  const suspendedMembersCount = members.filter(m => m.status === 'suspended').length;

  const totalSavingsPokok = members.reduce((acc, m) => acc + m.savingsPokok, 0);
  const totalSavingsWajib = members.reduce((acc, m) => acc + m.savingsWajib, 0);
  const totalSavingsSukarela = members.reduce((acc, m) => acc + m.savingsSukarela, 0);
  const grandTotalSavings = totalSavingsPokok + totalSavingsWajib + totalSavingsSukarela;

  const pendingApps = loanApplications.filter(a => a.status === 'submitted' || a.status === 'under_review');
  const pendingAppsTotalValue = pendingApps.reduce((acc, a) => acc + a.requestedAmount, 0);

  const activeLoans = loans.filter(l => l.status === 'active');
  const totalOutstandingLoans = activeLoans.reduce((acc, l) => acc + l.outstandingAmount, 0);

  // Overdue Installments
  const overdueInstallments = activeLoans.flatMap(l => 
    l.installments.filter(i => i.status === 'overdue').map(i => ({ ...i, loanNo: l.loanNo, memberName: l.memberName }))
  );

  // -------------------------------------------------------------
  // DYNAMIC CHART DATA ENGINE (TREN PINJAMAN VS ANGSURAN PER BULAN & TAHUN)
  // -------------------------------------------------------------
  const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  // Base dataset per year
  const rawYearlyBase: Record<string, { loan: number[]; angsuran: number[] }> = {
    '2026': {
      loan: [45000000, 52000000, 48000000, 60000000, 55000000, 70000000, 85000000, 62000000, 58000000, 65000000, 72000000, 90000000],
      angsuran: [38000000, 42000000, 45000000, 50000000, 52000000, 58000000, 64000000, 60000000, 55000000, 59000000, 63000000, 75000000],
    },
    '2025': {
      loan: [35000000, 40000000, 42000000, 48000000, 50000000, 53000000, 60000000, 58000000, 52000000, 56000000, 62000000, 70000000],
      angsuran: [30000000, 35000000, 38000000, 42000000, 44000000, 48000000, 52000000, 50000000, 46000000, 50000000, 55000000, 62000000],
    },
    '2024': {
      loan: [25000000, 30000000, 32000000, 35000000, 38000000, 40000000, 45000000, 42000000, 39000000, 41000000, 46000000, 52000000],
      angsuran: [20000000, 24000000, 28000000, 30000000, 32000000, 35000000, 38000000, 36000000, 33000000, 36000000, 40000000, 45000000],
    },
  };

  // Compute active dataset based on selection
  const activeChartData = useMemo(() => {
    if (chartViewMode === 'monthly') {
      const yearData = rawYearlyBase[chartYear] || rawYearlyBase['2026'];
      return monthsList.map((m, idx) => {
        // Overlay actual loan disbursement if month matches
        let actualLoan = yearData.loan[idx];
        let actualAngsuran = yearData.angsuran[idx];

        // Aggregate live loans in database
        loans.forEach(l => {
          if (l.disbursementDate) {
            const d = new Date(l.disbursementDate);
            if (d.getFullYear().toString() === chartYear && d.getMonth() === idx) {
              actualLoan += l.principalAmount;
            }
          }
        });

        // Aggregate live payments in database
        payments.forEach(p => {
          if (p.paymentDate) {
            const d = new Date(p.paymentDate);
            if (d.getFullYear().toString() === chartYear && d.getMonth() === idx) {
              actualAngsuran += p.amount;
            }
          }
        });

        return {
          label: m,
          loan: actualLoan,
          angsuran: actualAngsuran,
        };
      });
    } else {
      // Yearly view mode (2023 - 2026)
      const years = ['2023', '2024', '2025', '2026'];
      return years.map((y) => {
        const yData = rawYearlyBase[y];
        const totalLoan = yData ? yData.loan.reduce((a, b) => a + b, 0) : 320000000;
        const totalAngsuran = yData ? yData.angsuran.reduce((a, b) => a + b, 0) : 270000000;
        return {
          label: y,
          loan: totalLoan,
          angsuran: totalAngsuran,
        };
      });
    }
  }, [chartViewMode, chartYear, loans, payments]);

  // Aggregate totals
  const totalLoanActive = activeChartData.reduce((acc, d) => acc + d.loan, 0);
  const totalAngsuranActive = activeChartData.reduce((acc, d) => acc + d.angsuran, 0);
  const totalTurnoverActive = totalLoanActive + totalAngsuranActive;

  const maxChartValue = Math.max(1, ...activeChartData.map(d => Math.max(d.loan, d.angsuran)));

  // Combine Recent Transactions
  const recentTransactions = [
    ...payments.map(p => ({
      id: p.id,
      refNo: p.paymentNo,
      memberName: p.memberName,
      type: 'Pembayaran Angsuran',
      amount: p.amount,
      date: p.paymentDate,
      status: p.status === 'posted' ? ('success' as const) : ('pending' as const),
    })),
    ...savingsTransactions.map(s => ({
      id: s.id,
      refNo: s.referenceNo,
      memberName: s.memberName,
      type: s.type === 'deposit' ? `Setoran ${s.productName || 'Simpanan'}` : `Penarikan ${s.productName || 'Simpanan'}`,
      amount: s.amount,
      date: s.transactionDate,
      status: s.status === 'posted' ? ('success' as const) : ('pending' as const),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = recentTransactions.filter(t => {
    const matchSearch = t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  }).slice(0, 8);

  const handleExportCSV = () => {
    // UTF-8 BOM + Quoted header "ID" prevents SYLK format detection crash in WPS Office / Excel
    const BOM = '\uFEFF';
    const csvHeader = '"ID",Referensi,Nama Anggota,Jenis Transaksi,Nominal,Tanggal,Status\n';
    const csvRows = recentTransactions.map(t => 
      `"${t.id}","${t.refNo}","${t.memberName.replace(/"/g, '""')}","${t.type}",${t.amount},"${t.date}","${t.status}"`
    ).join('\n');

    const blob = new Blob([BOM + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Dashboard_Koperasi_${periodFilter}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast({
      type: 'info',
      title: 'Export CSV Berhasil',
      message: 'Laporan CSV Dashboard telah diunduh (Kompatibel WPS Office & Excel).',
    });
  };

  return (
    <MainLayout activePath="/admin" title="Dashboard Overview Koperasi" subtitle="Wireframe Dashboard Sidebar Overview — Ringkasan Eksekutif Keuangan & Transaksi">
      <div className="space-y-8">
        {/* Welcome Section & Filter Bar (Wireframe Section 1) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" /> KPRI MTsN 3 Kota Padang
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Selamat Datang Kembali, {currentUser.fullName.split(',')[0]} 👋
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Berikut adalah ringkasan posisi kas, pinjaman berjalan, simpanan anggota, dan aktivitas transaksi realtime.
            </p>
          </div>

          {/* Filters & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Filter Perbulan (Bulan & Tahun) */}
            <div className="w-44">
              <Select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                options={[
                  { value: '2026-07', label: 'Periode Juli 2026' },
                  { value: '2026-06', label: 'Periode Juni 2026' },
                  { value: '2026-05', label: 'Periode Mei 2026' },
                  { value: '2026-04', label: 'Periode April 2026' },
                  { value: '2026-03', label: 'Periode Maret 2026' },
                  { value: '2026-02', label: 'Periode Februari 2026' },
                  { value: '2026-01', label: 'Periode Januari 2026' },
                  { value: '2025-12', label: 'Periode Desember 2025' },
                  { value: '2025-11', label: 'Periode November 2025' },
                  { value: '2025-10', label: 'Periode Oktober 2025' },
                ]}
              />
            </div>

            {/* Export CSV Button */}
            <Button variant="secondary" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>

            {/* Quick Actions */}
            <a href="/admin/simpanan">
              <Button variant="emerald" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Setoran
              </Button>
            </a>
            <a href="/admin/angsuran">
              <Button variant="primary" size="sm" leftIcon={<CreditCard className="w-4 h-4" />}>
                Angsuran
              </Button>
            </a>
          </div>
        </div>

        {/* 4 Stats Cards Grid (Wireframe Section 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Outstanding Pinjaman"
            value={formatRupiah(totalOutstandingLoans)}
            subtitle={`${activeLoans.length} Kontrak Berjalan (+12.4% vs thn lalu)`}
            gradient="rose"
            icon={<CreditCard className="w-6 h-6" />}
          />
          <StatCard
            title="Total Simpanan Terhimpun"
            value={formatRupiah(grandTotalSavings)}
            subtitle="Pokok + Wajib + Sukarela (+8.2% vs thn lalu)"
            gradient="emerald"
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="Total Anggota Aktif"
            value={activeMembersCount}
            subtitle={`${pendingMembersCount} Pending • ${suspendedMembersCount} Ditangguhkan (+5.1% new)`}
            gradient="indigo"
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="Kelancaran Angsuran (NPL Rate)"
            value="98.2%"
            subtitle={`Rasio Tunggakan 1.8% (-0.3% vs thn lalu)`}
            gradient="amber"
            icon={<Activity className="w-6 h-6" />}
          />
        </div>

        {/* Overdue Alert Section */}
        {overdueInstallments.length > 0 && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-rose-200">
                    Perhatian: Terdapat {overdueInstallments.length} Angsuran Menunggak!
                  </h4>
                  <p className="text-xs text-slate-300">
                    Segera lakukan penagihan atau koordinasi pemotongan gaji anggota terdaftar.
                  </p>
                </div>
              </div>
              <a href="/admin/angsuran">
                <Button variant="danger" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Kelola Tunggakan
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {overdueInstallments.map((inst) => (
                <div key={inst.id} className="bg-slate-900/90 border border-rose-500/30 p-3.5 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{inst.memberName}</span>
                    <Badge status="overdue" />
                  </div>
                  <p className="text-slate-400">Kontrak: <span className="font-mono text-indigo-300">{inst.loanNo}</span> (Bln Ke-{inst.sequenceNo})</p>
                  <p className="text-rose-400 font-extrabold">Tunggakan: {formatRupiah(inst.remainingAmount)}</p>
                  <p className="text-[10px] text-slate-400">Jatuh Tempo: {formatDateIndonesian(inst.dueDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts & AI Insights Section Grid (Wireframe Section 3: 3 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart (Span 2 Columns): Sales / Penyaluran & Angsuran Trend */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" /> Tren Penyaluran Pinjaman vs Penerimaan Angsuran
                </h3>
                <p className="text-xs text-slate-400">
                  {chartViewMode === 'monthly'
                    ? `Data Bulanan (Jan - Des ${chartYear})`
                    : `Data Tahunan (2023 - 2026)`}
                </p>
              </div>

              {/* Chart Mode & Year Controls */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {/* Year Dropdown (visible in monthly view mode) */}
                {chartViewMode === 'monthly' && (
                  <div className="w-28">
                    <Select
                      value={chartYear}
                      onChange={(e) => setChartYear(e.target.value)}
                      options={[
                        { value: '2026', label: 'Tahun 2026' },
                        { value: '2025', label: 'Tahun 2025' },
                        { value: '2024', label: 'Tahun 2024' },
                      ]}
                    />
                  </div>
                )}

                {/* View Mode Toggle Tabs (Bulanan vs Tahunan) */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setChartViewMode('monthly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      chartViewMode === 'monthly'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartViewMode('yearly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      chartViewMode === 'yearly'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tahunan
                  </button>
                </div>
              </div>
            </div>

            {/* Chart Legend & Summary Totals */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-indigo-500 shadow-sm"></span>
                  <span className="text-slate-300 font-medium">Pinjaman: <strong className="text-white">{formatRupiah(totalLoanActive)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-400 shadow-sm"></span>
                  <span className="text-slate-300 font-medium">Angsuran: <strong className="text-white">{formatRupiah(totalAngsuranActive)}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Total Omzet: </span>
                <span className="font-extrabold text-emerald-400 text-sm font-mono">{formatRupiah(totalTurnoverActive)}</span>
              </div>
            </div>

            {/* Custom Responsive Dynamic Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="h-64 flex items-end gap-2 sm:gap-3 border-b border-slate-800 pb-2 px-1">
                {activeChartData.map((d, idx) => {
                  const loanHeightPercent = Math.max(8, Math.round((d.loan / maxChartValue) * 100));
                  const angsuranHeightPercent = Math.max(8, Math.round((d.angsuran / maxChartValue) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                      {/* Interactive Tooltip on hover */}
                      <div className="absolute -top-14 hidden group-hover:flex flex-col items-center bg-slate-950 border border-indigo-500/50 text-[10px] p-2.5 rounded-xl shadow-2xl z-30 whitespace-nowrap pointer-events-none">
                        <span className="font-bold text-white">{d.label} {chartViewMode === 'monthly' ? chartYear : ''}</span>
                        <span className="text-indigo-400">Pinjaman: {formatRupiah(d.loan)}</span>
                        <span className="text-emerald-400">Angsuran: {formatRupiah(d.angsuran)}</span>
                      </div>

                      {/* Dual Bars */}
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Loan Bar */}
                        <div
                          style={{ height: `${loanHeightPercent}%` }}
                          className="w-1/2 bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-sm transition-all duration-300 group-hover:brightness-125 shadow-md shadow-indigo-950/40"
                        />
                        {/* Angsuran Bar */}
                        <div
                          style={{ height: `${angsuranHeightPercent}%` }}
                          className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125 shadow-md shadow-emerald-950/40"
                        />
                      </div>

                      {/* X-Axis Label */}
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Revenue Breakdown & AI Insight Card (Span 1 Column) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Wallet className="w-5 h-5 text-emerald-400" /> Informasi
              </h3>

              {/* AI Insight Banner (Wireframe Item ai-insight-banner) */}
              <div className="bg-gradient-to-r from-indigo-900/60 via-purple-950/50 to-indigo-900/60 border border-indigo-500/40 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>AI Insight Koperasi</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  Performansi penyaluran pinjaman meningkat <strong>12%</strong> pada Q3 {chartYear}. Tingkat tunggakan denda berkurang <strong>15%</strong> berkat otomatisasi penagihan.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="pt-1 flex items-center gap-1 text-[11px] text-indigo-400 font-semibold hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
                >
                  Lihat Rekomendasi Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Breakdown Distributions */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                    <span>Simpanan Pokok</span>
                    <span>{formatRupiah(totalSavingsPokok)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (totalSavingsPokok / grandTotalSavings) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                    <span>Simpanan Wajib</span>
                    <span>{formatRupiah(totalSavingsWajib)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, (totalSavingsWajib / grandTotalSavings) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                    <span>Simpanan Sukarela</span>
                    <span>{formatRupiah(totalSavingsSukarela)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(100, (totalSavingsSukarela / grandTotalSavings) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Balance Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[11px] text-slate-400">Total Akumulasi Dana Koperasi</p>
                <p className="text-lg font-black text-white">{formatRupiah(grandTotalSavings + totalOutstandingLoans)}</p>
              </div>
              <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>

        {/* Recent Transactions Section (Wireframe Section 4: transactions-section & transactions-table) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" /> Transaksi & Aktivitas Terbaru
              </h3>
              <p className="text-xs text-slate-400">Daftar arus kas masuk dan keluar operasional koperasi terkini.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="w-36">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Semua Status' },
                    { value: 'success', label: 'Success' },
                    { value: 'pending', label: 'Pending' },
                  ]}
                />
              </div>

              {/* Add Transaction */}
              <a href="/admin/simpanan">
                <Button variant="emerald" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Tambah Transaksi
                </Button>
              </a>
            </div>
          </div>

          {/* Transactions Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No Referensi</th>
                  <th className="py-3 px-4">Anggota</th>
                  <th className="py-3 px-4">Jenis Transaksi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada transaksi ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{t.refNo}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{t.memberName}</td>
                      <td className="py-3.5 px-4 text-slate-300">{t.type}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={t.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">{formatRupiah(t.amount)}</td>
                      <td className="py-3.5 px-4 text-slate-400">{formatDateIndonesian(t.date)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Button variant="ghost" size="sm">
                          Struk
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Recommendations Full Modal */}
      {isAiModalOpen && (
        <Modal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          title="Rekomendasi Strategis AI Koperasi"
          subtitle={`Analisis Performa Otomatis Q3 ${chartYear} • KPRI MTsN 3 Kota Padang`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsAiModalOpen(false)}>
                Tutup
              </Button>
              <Button
                variant="emerald"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => {
                  showToast({
                    type: 'success',
                    title: 'Laporan AI Diunduh',
                    message: 'Ringkasan rekomendasi AI Koperasi berhasil dicetak ke PDF/Laporan.',
                  });
                  setIsAiModalOpen(false);
                }}
              >
                Cetak Ringkasan AI
              </Button>
            </>
          }
        >
          <div className="space-y-5 text-xs text-slate-300">
            {/* Top Stat Highlights */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Penyaluran Pinjaman</span>
                <p className="text-base font-black text-indigo-400">+12% (Q3)</p>
              </div>
              <div className="space-y-1 border-x border-slate-800 px-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tunggakan Denda</span>
                <p className="text-base font-black text-emerald-400">-15% (Otomatis)</p>
              </div>
              <div className="space-y-1 pl-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Skor Likuiditas</span>
                <p className="text-base font-black text-amber-400">96/100</p>
              </div>
            </div>

            {/* Detailed Recommendations List */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Rekomendasi Tindakan Pengurus:
              </h4>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <span>💡 1. Optimalisasi Plafon Pinjaman Anggota Lancar</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Anggota dengan skor kredit lancar (*Grade A*) direkomendasikan untuk menerima penawaran kenaikan plafon hingga Rp 25.000.000 dengan suku bunga bersaing.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <span>🛡️ 2. Penagihan Tunggakan via Otorisasi Gaji</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Terdapat 1 angsuran menunggak (Budi Santoso - Kontrak PJM-202601-000012). Sistem merekomendasikan penagihan otomatis via skema pemotongan gaji langsung melalui bendahara sekolah.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <span>📈 3. Rotasi Likuiditas Simpanan Sukarela</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Saldo Simpanan Sukarela terhimpun Rp 13.200.000 dapat diputar sebesar 70% untuk membiayai antrean pengajuan pinjaman berjalan demi meningkatkan SHU Anggota pada akhir tahun.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

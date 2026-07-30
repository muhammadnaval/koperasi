import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Modal } from '@/Components/UI/Modal';
import { formatRupiah } from '@/utils/formatters';
import { 
  ShieldAlert, 
  Clock, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Sliders, 
  BookOpen, 
  Edit3, 
  ToggleLeft, 
  ToggleRight,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { LoanProduct } from '@/types';

export const AdminSettings: React.FC = () => {
  const { penaltySettings, updatePenaltySettings, loanProducts, saveLoanProduct } = useApp();

  // Form State for Global Settings
  const [gracePeriodDays, setGracePeriodDays] = useState<string>(String(penaltySettings.gracePeriodDays ?? 3));
  const [lateFeePercentage, setLateFeePercentage] = useState<string>(String(penaltySettings.lateFeePercentage ?? 0.13));
  const [lateFeeCalculationType, setLateFeeCalculationType] = useState<string>(penaltySettings.lateFeeCalculationType ?? 'percent_of_interest');
  const [enableAutoPenalty, setEnableAutoPenalty] = useState<boolean>(penaltySettings.enableAutoPenalty ?? true);
  const [lateFeeAccountCode, setLateFeeAccountCode] = useState<string>(penaltySettings.lateFeeAccountCode ?? '4020-PENDAPATAN-DENDA');
  const [earlyPayoffDiscountAmount, setEarlyPayoffDiscountAmount] = useState<number>(penaltySettings.earlyPayoffDiscountAmount ?? 800000);
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  // Simulator Tool State
  const [simDueDate, setSimDueDate] = useState<string>('2026-02-15');
  const [simPayDate, setSimPayDate] = useState<string>('2026-02-20');
  const [simPrincipal, setSimPrincipal] = useState<string>('1000000');
  const [simInterest, setSimInterest] = useState<string>('100000');

  // Product Edit Modal State
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [prodGraceDays, setProdGraceDays] = useState<string>('3');
  const [prodFeeRate, setProdFeeRate] = useState<string>('0.13');
  const [prodFeeType, setProdFeeType] = useState<string>('percent_of_interest');

  const handleSaveGlobal = (e: React.FormEvent) => {
    e.preventDefault();
    updatePenaltySettings({
      gracePeriodDays: parseInt(gracePeriodDays, 10) || 0,
      lateFeePercentage: parseFloat(lateFeePercentage) || 0,
      lateFeeCalculationType: lateFeeCalculationType as any,
      enableAutoPenalty,
      lateFeeAccountCode,
      earlyPayoffDiscountAmount,
    });

    // Also call backend route via fetch/Inertia form if submitting
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 4000);
  };

  // Live Simulator Calculation Logic
  const calculateSim = () => {
    const due = new Date(simDueDate);
    const pay = new Date(simPayDate);
    const graceDays = parseInt(gracePeriodDays, 10) || 0;
    const rate = parseFloat(lateFeePercentage) || 0;
    const interest = parseInt(simInterest, 10) || 0;
    const principal = parseInt(simPrincipal, 10) || 0;
    const totalInst = principal + interest;

    if (pay <= due) {
      return {
        daysOverdue: 0,
        isWithinGrace: true,
        penaltyAmount: 0,
        statusText: 'Tepat Waktu (Tidak Ada Denda)',
        statusColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/30'
      };
    }

    const diffTime = Math.abs(pay.getTime() - due.getTime());
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysOverdue <= graceDays) {
      return {
        daysOverdue,
        isWithinGrace: true,
        penaltyAmount: 0,
        statusText: `Terlambat ${daysOverdue} Hari — Masih Dalam Masa Tenggang (${graceDays} Hari)`,
        statusColor: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/30'
      };
    }

    let penalty = 0;
    if (lateFeeCalculationType === 'percent_of_installment') {
      penalty = Math.round((totalInst * rate) / 100);
    } else if (lateFeeCalculationType === 'flat_per_day') {
      const overGrace = daysOverdue - graceDays;
      penalty = Math.round(overGrace * rate);
    } else {
      // percent_of_interest
      penalty = Math.round((interest * rate) / 100);
    }

    return {
      daysOverdue,
      isWithinGrace: false,
      penaltyAmount: penalty,
      statusText: `Melewati Masa Tenggang (${daysOverdue} Hari Terlambat, > ${graceDays} Hari)`,
      statusColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30'
    };
  };

  const simResult = calculateSim();

  const openProductModal = (prod: LoanProduct) => {
    setSelectedProduct(prod);
    setProdGraceDays(String(prod.gracePeriodDays ?? penaltySettings.gracePeriodDays ?? 3));
    setProdFeeRate(String(prod.lateFeePercentage ?? penaltySettings.lateFeePercentage ?? 0.13));
    setProdFeeType(prod.lateFeeType ?? penaltySettings.lateFeeCalculationType ?? 'percent_of_interest');
  };

  const handleSaveProductOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    saveLoanProduct({
      ...selectedProduct,
      gracePeriodDays: parseInt(prodGraceDays, 10) || 0,
      lateFeePercentage: parseFloat(prodFeeRate) || 0,
      lateFeeType: prodFeeType as any,
    });

    setSelectedProduct(null);
  };

  return (
    <MainLayout 
      activePath="/admin/pengaturan" 
      title="Pengaturan Denda & Masa Tenggang (Grace Period)"
      subtitle="Kelola kebijakan denda keterlambatan angsuran, durasi masa tenggang, serta basis perhitungan pendapatan denda."
    >
      <div className="space-y-8">
        {/* Saved Toast Banner */}
        {isSavedNotice && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Pengaturan Berhasil Disimpan!</p>
              <p className="text-xs text-emerald-400/90">Aturan masa tenggang dan denda keterlambatan telah diperbarui di sistem.</p>
            </div>
          </div>
        )}

        {/* Overview Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Masa Tenggang (Grace)</p>
              <p className="text-2xl font-extrabold text-white">{penaltySettings.gracePeriodDays} Hari</p>
              <p className="text-[11px] text-amber-400/80 font-medium">Bebas denda s.d Hari ke-{penaltySettings.gracePeriodDays}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Tarif Denda Standar</p>
              <p className="text-2xl font-extrabold text-white">{penaltySettings.lateFeePercentage}%</p>
              <p className="text-[11px] text-indigo-300 font-medium capitalize">
                {penaltySettings.lateFeeCalculationType === 'percent_of_interest' ? 'Dari Bunga / Jasa' : 'Dari Total Angsuran'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Akun COA Pendapatan</p>
              <p className="text-sm font-bold text-white font-mono">{penaltySettings.lateFeeAccountCode.split('-')[0]}</p>
              <p className="text-[11px] text-slate-400 truncate">{penaltySettings.lateFeeAccountCode}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${penaltySettings.enableAutoPenalty ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Status Pembebanan</p>
              <p className="text-lg font-extrabold text-white">
                {penaltySettings.enableAutoPenalty ? 'Otomatis' : 'Manual'}
              </p>
              <p className={`text-[11px] font-semibold ${penaltySettings.enableAutoPenalty ? 'text-emerald-400' : 'text-slate-400'}`}>
                {penaltySettings.enableAutoPenalty ? 'Denda Aktif Menghitung' : 'Perlu Input Manual'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Configuration Form & Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Settings Left Column */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Konfigurasi Aturan Global Denda</h3>
                <p className="text-xs text-slate-400">Atur parameter dasar denda dan masa tenggang untuk semua produk pinjaman.</p>
              </div>
            </div>

            <form onSubmit={handleSaveGlobal} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Input 
                    label="Masa Tenggang / Grace Period (Hari Kerja)" 
                    type="number"
                    min="0"
                    max="90"
                    value={gracePeriodDays} 
                    onChange={(e) => setGracePeriodDays(e.target.value)} 
                    required 
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Hari toleransi setelah jatuh tempo tanpa dikenakan denda (Contoh PRD: 3 Hari).</p>
                </div>

                <div>
                  <Input 
                    label="Tarif Denda (% per bulan atau Nominal Flat)" 
                    type="number"
                    step="0.01"
                    min="0"
                    value={lateFeePercentage} 
                    onChange={(e) => setLateFeePercentage(e.target.value)} 
                    required 
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Besaran tarif denda (Contoh PRD: 0,13% per bulan dari jasa koperasi).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Select
                    label="Metode / Basis Perhitungan Denda"
                    value={lateFeeCalculationType}
                    onChange={(e) => setLateFeeCalculationType(e.target.value)}
                    options={[
                      { value: 'percent_of_interest', label: '% Dari Bunga / Jasa Koperasi (Sesuai PRD)' },
                      { value: 'percent_of_installment', label: '% Dari Total Angsuran (Pokok + Bunga)' },
                      { value: 'flat_per_day', label: 'Nominal Flat per Hari Keterlambatan' },
                    ]}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Basis nilai acuan pengalian denda keterlambatan.</p>
                </div>

                <div>
                  <Input 
                    label="Kode Akun COA Pendapatan Denda" 
                    value={lateFeeAccountCode} 
                    onChange={(e) => setLateFeeAccountCode(e.target.value)} 
                    required 
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Akun Buku Besar (GL) pencatatan penerimaan denda (Contoh: 4020-PENDAPATAN-DENDA).</p>
                </div>
              </div>

              {/* Early Payoff Interest Discount Configuration (T-204) */}
              <div className="border-t border-slate-800/80 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-xs uppercase text-slate-300 block">Nominal Diskon Bunga Pelunasan Dipercepat (Default Global)</label>
                    <p className="text-[11px] text-slate-400">Nominal flat Rupiah bunga belum berjalan yang digratiskan/didiskon saat anggota melunasi dipercepat.</p>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-sm font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                    {formatRupiah(earlyPayoffDiscountAmount)} Waived
                  </span>
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: 'Gratis Seluruh Bunga Sisa', val: 800000 },
                    { label: 'Rp 500.000', val: 500000 },
                    { label: 'Rp 250.000', val: 250000 },
                    { label: 'Rp 0 (Tanpa Diskon)', val: 0 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setEarlyPayoffDiscountAmount(preset.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        earlyPayoffDiscountAmount === preset.val
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-950/40'
                          : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-1/2 pt-1">
                  <Input
                    label="Nominal Custom Diskon Bunga (Rp)"
                    type="number"
                    min="0"
                    step="10000"
                    value={earlyPayoffDiscountAmount}
                    onChange={(e) => setEarlyPayoffDiscountAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  />
                </div>
              </div>

              {/* Auto Penalty Switch Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-slate-200 block">Otomatisasi Pembebanan Denda System</span>
                  <p className="text-xs text-slate-400">Jika aktif, denda dihitung otomatis saat tanggal melewati masa tenggang.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableAutoPenalty(!enableAutoPenalty)}
                  className="flex-shrink-0"
                >
                  {enableAutoPenalty ? (
                    <ToggleRight className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="emerald" size="md" type="submit" leftIcon={<Save className="w-4 h-4" />}>
                  Simpan Pengaturan Denda & Diskon
                </Button>
              </div>
            </form>
          </div>

          {/* Simulator Right Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Calculator className="w-5 h-5" />
                  <h4 className="font-bold text-base text-white">Kalkulator Simulasi Denda</h4>
                </div>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Uji Live Policy
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Simulasikan perhitungan denda dan verifikasi apakah tanggal pembayaran berada dalam masa tenggang (*grace period*).
              </p>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label="Tanggal Jatuh Tempo" 
                    type="date" 
                    value={simDueDate} 
                    onChange={(e) => setSimDueDate(e.target.value)} 
                  />
                  <Input 
                    label="Tanggal Pembayaran" 
                    type="date" 
                    value={simPayDate} 
                    onChange={(e) => setSimPayDate(e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label="Angsuran Pokok (Rp)" 
                    type="number" 
                    value={simPrincipal} 
                    onChange={(e) => setSimPrincipal(e.target.value)} 
                  />
                  <Input 
                    label="Angsuran Bunga / Jasa (Rp)" 
                    type="number" 
                    value={simInterest} 
                    onChange={(e) => setSimInterest(e.target.value)} 
                  />
                </div>
              </div>

              {/* Simulation Result Box */}
              <div className={`p-4 rounded-2xl border ${simResult.bgColor} space-y-3 transition-all`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Status Keterlambatan:</span>
                  <span className={`text-xs font-bold ${simResult.statusColor}`}>{simResult.statusText}</span>
                </div>

                <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Kalkulasi Denda Terhitung:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {formatRupiah(simResult.penaltyAmount)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 leading-tight space-y-1">
                  <p>• Hari keterlambatan: <strong>{simResult.daysOverdue} hari</strong></p>
                  <p>• Toleransi masa tenggang: <strong>{gracePeriodDays} hari</strong></p>
                  <p>• Basis pengalian: <strong>{lateFeePercentage}% ({lateFeeCalculationType})</strong></p>
                </div>
              </div>
            </div>

            {/* Explanatory Policy Card */}
            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-3xl p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <HelpCircle className="w-4 h-4" />
                Catatan Aturan Koperasi (PRD §1424)
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
                <li>Masa tenggang (*grace period*) ditetapkan <strong>3 hari kerja</strong> setelah tanggal jatuh tempo.</li>
                <li>Denda keterlambatan ditetapkan sebesar <strong>0,13% per bulan</strong> dari jasa untuk koperasi.</li>
                <li>Denda otomatis dibebankan ke tagihan angsuran setelah melewati batas toleransi 3 hari kerja.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Loan Products Override Table Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                Konfigurasi Denda per Produk Pinjaman
              </h3>
              <p className="text-xs text-slate-400">
                Atur toleransi masa tenggang dan persen denda khusus (*override*) untuk tiap jenis produk pinjaman.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Kode & Produk</th>
                  <th className="py-3 px-4">Bunga / Tahun</th>
                  <th className="py-3 px-4">Masa Tenggang</th>
                  <th className="py-3 px-4">Tarif Denda</th>
                  <th className="py-3 px-4">Basis Denda</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loanProducts.map((p) => {
                  const effectiveGrace = p.gracePeriodDays ?? penaltySettings.gracePeriodDays ?? 3;
                  const effectiveRate = p.lateFeePercentage ?? penaltySettings.lateFeePercentage ?? 0.13;
                  const effectiveType = p.lateFeeType ?? penaltySettings.lateFeeCalculationType ?? 'percent_of_interest';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{p.name}</div>
                        <div className="text-[11px] font-mono text-indigo-400">{p.code}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-emerald-400">{p.annualInterestRate}% / thn</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          {effectiveGrace} Hari
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-200">
                        {effectiveRate}%
                      </td>
                      <td className="py-4 px-4 text-slate-300 capitalize">
                        {effectiveType === 'percent_of_interest' ? '% Dari Bunga' : effectiveType === 'percent_of_installment' ? '% Dari Total' : 'Flat Daily'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge status={p.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openProductModal(p)}
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        >
                          Atur Override
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Product Override Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Override Denda: ${selectedProduct.name}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedProduct(null)}>Batal</Button>
              <Button variant="emerald" onClick={handleSaveProductOverride}>Simpan Override</Button>
            </>
          }
        >
          <form className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
              Setel aturan khusus denda dan masa tenggang untuk <strong>{selectedProduct.name} ({selectedProduct.code})</strong>.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Masa Tenggang / Grace Period (Hari)"
                type="number"
                min="0"
                value={prodGraceDays}
                onChange={(e) => setProdGraceDays(e.target.value)}
                required
              />
              <Input
                label="Tarif Denda (%)"
                type="number"
                step="0.01"
                min="0"
                value={prodFeeRate}
                onChange={(e) => setProdFeeRate(e.target.value)}
                required
              />
            </div>

            <Select
              label="Basis Perhitungan Denda Produk Ini"
              value={prodFeeType}
              onChange={(e) => setProdFeeType(e.target.value)}
              options={[
                { value: 'percent_of_interest', label: '% Dari Bunga / Jasa Koperasi' },
                { value: 'percent_of_installment', label: '% Dari Total Angsuran (Pokok + Bunga)' },
                { value: 'flat_per_day', label: 'Nominal Flat per Hari' },
              ]}
            />
          </form>
        </Modal>
      )}
    </MainLayout>
  );
};

export default AdminSettings;

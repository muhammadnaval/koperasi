import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Modal } from '@/Components/UI/Modal';
import { formatRupiah } from '@/utils/formatters';
import {
  PlusCircle, ToggleLeft, ToggleRight, Edit,
  Wallet, Landmark, CheckCircle, AlertCircle,
} from 'lucide-react';
import { LoanProduct, SavingsProduct, SavingsType } from '@/types';

export const AdminProducts: React.FC = () => {
  const {
    savingsProducts, loanProducts,
    toggleProductActive, saveLoanProduct, saveSavingsProduct,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'savings' | 'loan'>('savings');

  // ── Savings Product Modal ────────────────────────────────────
  const [savingsModal, setSavingsModal] = useState<Partial<SavingsProduct> | null>(null);
  const [savingsForm, setSavingsForm] = useState({
    code: '',
    name: '',
    type: 'voluntary' as SavingsType,
    defaultAmount: '50000',
    minimumBalance: '0',
    description: '',
  });
  const [savingsFormError, setSavingsFormError] = useState('');

  const typeLabelMap: Record<SavingsType, string> = {
    principal: 'Simpanan Pokok',
    mandatory: 'Simpanan Wajib',
    voluntary: 'Simpanan Sukarela',
  };

  const openSavingsModal = (prod?: SavingsProduct) => {
    setSavingsFormError('');
    if (prod) {
      setSavingsModal(prod);
      setSavingsForm({
        code: prod.code,
        name: prod.name,
        type: prod.type,
        defaultAmount: String(prod.defaultAmount),
        minimumBalance: String(prod.minimumBalance),
        description: prod.description || '',
      });
    } else {
      setSavingsModal({});
      setSavingsForm({ code: '', name: '', type: 'voluntary', defaultAmount: '50000', minimumBalance: '0', description: '' });
    }
  };

  const handleSaveSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingsFormError('');

    if (!savingsForm.code.trim()) { setSavingsFormError('Kode produk wajib diisi.'); return; }
    if (!savingsForm.name.trim()) { setSavingsFormError('Nama produk wajib diisi.'); return; }

    const defAmt = parseInt(savingsForm.defaultAmount, 10);
    const minBal = parseInt(savingsForm.minimumBalance, 10);
    if (isNaN(defAmt) || defAmt < 0) { setSavingsFormError('Nominal default harus berupa angka ≥ 0.'); return; }
    if (isNaN(minBal) || minBal < 0) { setSavingsFormError('Saldo minimum harus berupa angka ≥ 0.'); return; }

    const codeExists = savingsProducts.some(
      p => p.code.toLowerCase() === savingsForm.code.trim().toLowerCase() && p.id !== (savingsModal as SavingsProduct)?.id
    );
    if (codeExists) {
      setSavingsFormError(`Kode "${savingsForm.code}" sudah digunakan produk lain.`);
      return;
    }

    saveSavingsProduct({
      ...((savingsModal as SavingsProduct)?.id ? { id: (savingsModal as SavingsProduct).id } : {}),
      code: savingsForm.code.trim().toUpperCase(),
      name: savingsForm.name.trim(),
      type: savingsForm.type,
      defaultAmount: defAmt,
      minimumBalance: minBal,
      description: savingsForm.description.trim(),
    });
    setSavingsModal(null);
  };

  // ── Loan Product Modal ───────────────────────────────────────
  const [loanModalProduct, setLoanModalProduct] = useState<Partial<LoanProduct> | null>(null);
  const [loanCode, setLoanCode] = useState('');
  const [loanName, setLoanName] = useState('');
  const [minAmount, setMinAmount] = useState('1000000');
  const [maxAmount, setMaxAmount] = useState('25000000');
  const [minTerm, setMinTerm] = useState('6');
  const [maxTerm, setMaxTerm] = useState('36');
  const [rate, setRate] = useState('10.0');
  const [riskFeePct, setRiskFeePct] = useState('0.5');
  const [mandatorySavingPct, setMandatorySavingPct] = useState('0.5');
  const [earlyPayoffDiscountAmount, setEarlyPayoffDiscountAmount] = useState<number>(800000);

  const openLoanModal = (prod?: LoanProduct) => {
    if (prod) {
      setLoanModalProduct(prod);
      setLoanCode(prod.code);
      setLoanName(prod.name);
      setMinAmount(String(prod.minAmount));
      setMaxAmount(String(prod.maxAmount));
      setMinTerm(String(prod.minTermMonths));
      setMaxTerm(String(prod.maxTermMonths));
      setRate(String(prod.annualInterestRate));
      setRiskFeePct(String(prod.riskFeePercentage ?? 0.5));
      setMandatorySavingPct(String(prod.mandatorySavingPercentage ?? 0.5));
      setEarlyPayoffDiscountAmount(prod.earlyPayoffDiscountAmount ?? 800000);
    } else {
      setLoanModalProduct({});
      setLoanCode('LP-BARU');
      setLoanName('Produk Pinjaman Baru');
      setMinAmount('1000000');
      setMaxAmount('15000000');
      setMinTerm('6');
      setMaxTerm('24');
      setRate('9.5');
      setRiskFeePct('0.5');
      setMandatorySavingPct('0.5');
      setEarlyPayoffDiscountAmount(800000);
    }
  };

  const handleSaveLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveLoanProduct({
      id: loanModalProduct?.id,
      code: loanCode,
      name: loanName,
      minAmount: parseInt(minAmount, 10),
      maxAmount: parseInt(maxAmount, 10),
      minTermMonths: parseInt(minTerm, 10),
      maxTermMonths: parseInt(maxTerm, 10),
      annualInterestRate: parseFloat(rate),
      riskFeePercentage: parseFloat(riskFeePct),
      mandatorySavingPercentage: parseFloat(mandatorySavingPct),
      earlyPayoffDiscountAmount,
    });
    setLoanModalProduct(null);
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <MainLayout activePath="/admin/produk" title="Konfigurasi Produk Koperasi" subtitle="Kelola parameter produk simpanan dan produk pinjaman aktif.">
      <div className="space-y-6">

        {/* ── Tab Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl">
          {/* Tabs */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('savings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'savings'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Produk Simpanan
              <span className="bg-slate-700 text-slate-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {savingsProducts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('loan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'loan'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Landmark className="w-4 h-4" />
              Produk Pinjaman
              <span className="bg-slate-700 text-slate-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {loanProducts.length}
              </span>
            </button>
          </div>

          {/* Primary Action */}
          {activeTab === 'savings' ? (
            <Button variant="emerald" size="sm" onClick={() => openSavingsModal()} leftIcon={<PlusCircle className="w-4 h-4" />}>
              Tambah Produk Simpanan
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => openLoanModal()} leftIcon={<PlusCircle className="w-4 h-4" />}>
              Tambah Produk Pinjaman
            </Button>
          )}
        </div>

        {/* ── TAB: PRODUK SIMPANAN ──────────────────────────── */}
        {activeTab === 'savings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {savingsProducts.map((p) => {
              const typeStyles: Record<SavingsType, { badge: string; border: string; codeColor: string }> = {
                principal: {
                  badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
                  border: 'border-indigo-500/30',
                  codeColor: 'text-indigo-400',
                },
                mandatory: {
                  badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                  border: 'border-amber-500/30',
                  codeColor: 'text-amber-400',
                },
                voluntary: {
                  badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                  border: 'border-emerald-500/30',
                  codeColor: 'text-emerald-400',
                },
              };
              const ts = typeStyles[p.type];
              return (
                <div
                  key={p.id}
                  className={`bg-slate-900 border ${ts.border} rounded-3xl p-5 shadow-xl flex flex-col gap-4 transition-opacity ${!p.isActive ? 'opacity-60' : ''}`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`font-mono text-[11px] font-bold ${ts.codeColor}`}>{p.code}</span>
                      <h4 className="font-black text-sm text-white mt-0.5 leading-snug">{p.name}</h4>
                      <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${ts.badge}`}>
                        {typeLabelMap[p.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.isActive ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                          <CheckCircle className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                          <AlertCircle className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="border-t border-slate-800 pt-3 text-xs text-slate-300 space-y-1.5 flex-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nominal Default</span>
                      <strong className="text-emerald-400">{formatRupiah(p.defaultAmount)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Saldo Minimum</span>
                      <strong className="text-white">{formatRupiah(p.minimumBalance)}</strong>
                    </div>
                    {p.description && (
                      <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2">
                        {p.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-slate-800 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSavingsModal(p)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => toggleProductActive('savings', p.id)}
                      className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                      title={p.isActive ? 'Nonaktifkan produk' : 'Aktifkan produk'}
                    >
                      {p.isActive
                        ? <><ToggleRight className="w-6 h-6 text-emerald-400" /> Aktif</>
                        : <><ToggleLeft className="w-6 h-6 text-slate-600" /> Nonaktif</>
                      }
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add Card */}
            <button
              onClick={() => openSavingsModal()}
              className="bg-slate-900/40 border-2 border-dashed border-slate-700 hover:border-emerald-500 hover:bg-slate-900 rounded-3xl p-5 text-slate-500 hover:text-emerald-400 flex flex-col items-center justify-center gap-2 transition-all min-h-[180px] group"
            >
              <PlusCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Tambah Produk Simpanan</span>
            </button>
          </div>
        )}

        {/* ── TAB: PRODUK PINJAMAN ──────────────────────────── */}
        {activeTab === 'loan' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loanProducts.map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-indigo-400">{p.code}</span>
                    <h4 className="font-black text-sm text-white mt-0.5 leading-snug">{p.name}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.isActive
                      ? <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold"><CheckCircle className="w-3 h-3" /> Aktif</span>
                      : <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold"><AlertCircle className="w-3 h-3" /> Nonaktif</span>
                    }
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-slate-800 pt-3 text-xs text-slate-300 space-y-1.5 flex-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bunga Flat</span>
                    <strong className="text-emerald-400">{p.annualInterestRate}% / Tahun</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Potongan Dana Risiko</span>
                    <strong className="text-indigo-300">{p.riskFeePercentage ?? 0.5}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Potongan Simpanan Wajib</span>
                    <strong className="text-emerald-300">{p.mandatorySavingPercentage ?? 0.5}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Diskon Pelunasan Cepat</span>
                    <strong className="text-cyan-300">{formatRupiah(p.earlyPayoffDiscountAmount ?? 800000)} Waived</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Masa Tenggang Denda</span>
                    <strong className="text-amber-400">{p.gracePeriodDays ?? 3} Hari</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tarif Denda</span>
                    <strong className="text-rose-300">{p.lateFeePercentage ?? 0.13}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plafon</span>
                    <strong className="text-white">{formatRupiah(p.minAmount)} – {formatRupiah(p.maxAmount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tenor</span>
                    <strong className="text-white">{p.minTermMonths} – {p.maxTermMonths} Bulan</strong>
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2">{p.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t border-slate-800 pt-3">
                  <Button variant="outline" size="sm" onClick={() => openLoanModal(p)} leftIcon={<Edit className="w-3.5 h-3.5" />}>
                    Edit
                  </Button>
                  <button
                    onClick={() => toggleProductActive('loan', p.id)}
                    className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    {p.isActive
                      ? <><ToggleRight className="w-6 h-6 text-emerald-400" /> Aktif</>
                      : <><ToggleLeft className="w-6 h-6 text-slate-600" /> Nonaktif</>
                    }
                  </button>
                </div>
              </div>
            ))}

            {/* Add Card */}
            <button
              onClick={() => openLoanModal()}
              className="bg-slate-900/40 border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-900 rounded-3xl p-5 text-slate-500 hover:text-indigo-400 flex flex-col items-center justify-center gap-2 transition-all min-h-[180px] group"
            >
              <PlusCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Tambah Produk Pinjaman</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Modal: Tambah / Edit Produk Simpanan ─────────────── */}
      {savingsModal !== null && (
        <Modal
          isOpen={savingsModal !== null}
          onClose={() => setSavingsModal(null)}
          title={(savingsModal as SavingsProduct)?.id ? `Edit Produk — ${(savingsModal as SavingsProduct).name}` : 'Tambah Produk Simpanan Baru'}
          subtitle={
            (savingsModal as SavingsProduct)?.id
              ? 'Perubahan konfigurasi tidak mengubah histori transaksi yang sudah diposting.'
              : 'Kode & nama produk harus unik. Produk aktif dapat langsung dipakai untuk transaksi simpanan.'
          }
          footer={
            <>
              <Button variant="secondary" onClick={() => setSavingsModal(null)}>Batal</Button>
              <Button variant="emerald" onClick={handleSaveSavingsSubmit}>
                {(savingsModal as SavingsProduct)?.id ? 'Simpan Perubahan' : 'Buat Produk Simpanan'}
              </Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleSaveSavingsSubmit}>
            {savingsFormError && (
              <p className="text-xs text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                {savingsFormError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Kode Produk"
                placeholder="Contoh: SP-HARI-RAYA"
                value={savingsForm.code}
                onChange={e => setSavingsForm(f => ({ ...f, code: e.target.value }))}
                required
              />
              <Input
                label="Nama Produk"
                placeholder="Contoh: Simpanan Hari Raya"
                value={savingsForm.name}
                onChange={e => setSavingsForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <Select
              label="Jenis Simpanan"
              value={savingsForm.type}
              onChange={e => setSavingsForm(f => ({ ...f, type: e.target.value as SavingsType }))}
              options={[
                { value: 'principal', label: 'Simpanan Pokok — Sekali saat mendaftar' },
                { value: 'mandatory', label: 'Simpanan Wajib — Rutin bulanan' },
                { value: 'voluntary', label: 'Simpanan Sukarela — Fleksibel (dapat ditarik)' },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nominal Default (Rp)"
                type="number"
                placeholder="50000"
                value={savingsForm.defaultAmount}
                onChange={e => setSavingsForm(f => ({ ...f, defaultAmount: e.target.value }))}
                helperText="Nominal yang terisi otomatis saat input transaksi"
                required
              />
              <Input
                label="Saldo Minimum (Rp)"
                type="number"
                placeholder="0"
                value={savingsForm.minimumBalance}
                onChange={e => setSavingsForm(f => ({ ...f, minimumBalance: e.target.value }))}
                helperText="Saldo yang tidak boleh ditarik (untuk sukarela)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Deskripsi Produk <span className="text-slate-500 normal-case font-normal">(opsional)</span>
              </label>
              <textarea
                rows={2}
                value={savingsForm.description}
                onChange={e => setSavingsForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Jelaskan kegunaan dan kebijakan produk simpanan ini..."
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-[11px] text-emerald-300 leading-relaxed">
              💡 <strong>Catatan:</strong> Produk yang sudah memiliki transaksi <em>posted</em> tidak dapat dihapus — hanya bisa dinonaktifkan. Produk nonaktif tidak muncul di daftar pilihan transaksi baru.
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Tambah / Edit Produk Pinjaman ─────────────── */}
      {loanModalProduct !== null && (
        <Modal
          isOpen={loanModalProduct !== null}
          onClose={() => setLoanModalProduct(null)}
          title={loanModalProduct?.id ? 'Edit Produk Pinjaman' : 'Tambah Produk Pinjaman Baru'}
          footer={
            <>
              <Button variant="secondary" onClick={() => setLoanModalProduct(null)}>Batal</Button>
              <Button variant="primary" onClick={handleSaveLoanSubmit}>
                {loanModalProduct?.id ? 'Simpan Perubahan' : 'Buat Produk Pinjaman'}
              </Button>
            </>
          }
        >
          <form className="space-y-4 text-xs" onSubmit={handleSaveLoanSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Kode Produk" value={loanCode} onChange={(e) => setLoanCode(e.target.value)} required />
              <Input label="Bunga Flat (%/Tahun)" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} required />
            </div>
            <Input label="Nama Produk" value={loanName} onChange={(e) => setLoanName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Plafon (Rp)" type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} required />
              <Input label="Max Plafon (Rp)" type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Tenor (Bln)" type="number" value={minTerm} onChange={(e) => setMinTerm(e.target.value)} required />
              <Input label="Max Tenor (Bln)" type="number" value={maxTerm} onChange={(e) => setMaxTerm(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Potongan Dana Risiko (%)" type="number" step="0.1" value={riskFeePct} onChange={(e) => setRiskFeePct(e.target.value)} required />
              <Input label="Potongan Simpanan Wajib (%)" type="number" step="0.1" value={mandatorySavingPct} onChange={(e) => setMandatorySavingPct(e.target.value)} required />
            </div>

            {/* Diskon Pelunasan Dipercepat */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-300 text-xs">Default Nominal Diskon Bunga (Rp)</label>
                <span className="font-extrabold text-emerald-400 font-mono text-xs">{formatRupiah(earlyPayoffDiscountAmount)} Waived</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Rp 800.000', val: 800000 },
                  { label: 'Rp 500.000', val: 500000 },
                  { label: 'Rp 250.000', val: 250000 },
                  { label: 'Tanpa Diskon', val: 0 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setEarlyPayoffDiscountAmount(opt.val)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      earlyPayoffDiscountAmount === opt.val
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <Input
                label="Nominal Custom Diskon (Rp)"
                type="number"
                min="0"
                step="10000"
                value={earlyPayoffDiscountAmount}
                onChange={(e) => setEarlyPayoffDiscountAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
              />
            </div>
          </form>
        </Modal>
      )}
    </MainLayout>
  );
};

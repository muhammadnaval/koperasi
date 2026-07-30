import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Modal } from '@/Components/UI/Modal';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { CreditCard, DollarSign, Printer, ChevronRight, Search, CheckCircle2 } from 'lucide-react';
import { LoanApplication, Loan } from '@/types';

export const AdminLoans: React.FC = () => {
  const { loans, loanApplications, disburseLoan, processEarlyPayoff, loanProducts, penaltySettings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'approved_queue' | 'active_loans'>('approved_queue');

  // Disbursement Modal State
  const [disburseApp, setDisburseApp] = useState<LoanApplication | null>(null);
  const [disbursementDate, setDisbursementDate] = useState(new Date().toISOString().slice(0, 10));
  const [disbursementMethod, setDisbursementMethod] = useState<'transfer_bank' | 'kas_tunai'>('transfer_bank');
  const [disbursedLoanResult, setDisbursedLoanResult] = useState<Loan | null>(null);

  // Early Payoff Modal State
  const [earlyPayoffLoan, setEarlyPayoffLoan] = useState<Loan | null>(null);
  const [payoffMethod, setPayoffMethod] = useState<'kas_tunai' | 'transfer_bank'>('kas_tunai');
  const [payoffDiscountAmount, setPayoffDiscountAmount] = useState<number>(800000);

  // Print Disbursement Voucher Modal
  const [printLoanVoucher, setPrintLoanVoucher] = useState<Loan | null>(null);

  const approvedApps = loanApplications.filter(a => a.status === 'approved');

  const filteredLoans = loans.filter(l => {
    return l.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.loanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.memberNo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDisburseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseApp) return;
    try {
      const createdLoan = disburseLoan(disburseApp.id, {
        disbursementDate,
        paymentMethod: disbursementMethod,
      });
      setDisburseApp(null);
      setDisbursedLoanResult(createdLoan);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEarlyPayoffModal = (loan: Loan) => {
    setEarlyPayoffLoan(loan);
    const unpaid = loan.installments.filter(i => i.status !== 'paid');
    const totalInterest = unpaid.reduce((acc, i) => acc + i.interestDue, 0);
    const prod = loanProducts.find((p) => p.id === loan.productId);
    setPayoffDiscountAmount(prod?.earlyPayoffDiscountAmount ?? penaltySettings.earlyPayoffDiscountAmount ?? totalInterest);
  };

  const handleEarlyPayoffSubmit = () => {
    if (!earlyPayoffLoan) return;
    processEarlyPayoff(earlyPayoffLoan.id, payoffMethod, payoffDiscountAmount);
    setEarlyPayoffLoan(null);
  };

  return (
    <MainLayout activePath="/admin/pinjaman" title="Pinjaman & Pencairan Dana" subtitle="Proses pencairan pengajuan yang disetujui, penerbitan kontrak pinjaman, dan cetak voucher pencairan.">
      <div className="space-y-6">
        {/* Tab Header */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('approved_queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'approved_queue'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Antrean Pencairan ({approvedApps.length})
          </button>
          <button
            onClick={() => setActiveTab('active_loans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'active_loans'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Kontrak Pinjaman Berjalan ({loans.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Cari No Kontrak / Nama Anggota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftAddon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Tab Content: Approved Queue for Disbursement */}
        {activeTab === 'approved_queue' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-white">Daftar Pengajuan Disetujui Siap Dicairkan</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">No. Pengajuan</th>
                    <th className="py-3 px-4">Anggota</th>
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-4 text-right">Nilai Disetujui</th>
                    <th className="py-3 px-4 text-center">Tenor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {approvedApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada antrean pencairan.
                      </td>
                    </tr>
                  ) : (
                    approvedApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{app.applicationNo}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{app.memberName}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{app.productName}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">{formatRupiah(app.approvedAmount || app.requestedAmount)}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">{app.approvedTermMonths || app.requestedTermMonths} Bulan</td>
                        <td className="py-3.5 px-4 text-center"><Badge status={app.status} /></td>
                        <td className="py-3.5 px-4 text-center">
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => setDisburseApp(app)}
                            leftIcon={<DollarSign className="w-4 h-4" />}
                          >
                            Proses Pencairan
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Active Loans */}
        {activeTab === 'active_loans' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-white">Daftar Kontrak Pinjaman Berjalan</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">No. Kontrak</th>
                    <th className="py-3 px-4">Anggota</th>
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-4">Tgl Cair</th>
                    <th className="py-3 px-4 text-right">Pokok</th>
                    <th className="py-3 px-4 text-right">Outstanding</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada kontrak pinjaman ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{loan.loanNo}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{loan.memberName}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{loan.productName}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{formatDateIndonesian(loan.disbursementDate)}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-white">{formatRupiah(loan.principalAmount)}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-rose-400">{formatRupiah(loan.outstandingAmount)}</td>
                        <td className="py-3.5 px-4 text-center"><Badge status={loan.status} /></td>
                        <td className="py-3.5 px-4 text-center space-x-1">
                          <a href={`/pinjaman/${loan.id}`}>
                            <Button variant="ghost" size="sm">Jadwal</Button>
                          </a>
                          {loan.status === 'active' && (
                            <Button
                              variant="emerald"
                              size="sm"
                              onClick={() => openEarlyPayoffModal(loan)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Pelunasan Dipercepat
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => setPrintLoanVoucher(loan)} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                            Voucher
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Early Payoff Modal (T-204) */}
      {earlyPayoffLoan && (() => {
        const unpaid = earlyPayoffLoan.installments.filter(i => i.status !== 'paid');
        const remainingPrincipal = unpaid.reduce((acc, i) => acc + (i.principalDue - Math.min(i.principalDue, i.paidAmount)), 0);
        const unpaidLateFee = unpaid.reduce((acc, i) => acc + i.lateFeeDue, 0);
        const totalUnearnedInterest = unpaid.reduce((acc, i) => acc + i.interestDue, 0);

        const waivedInterest = Math.min(totalUnearnedInterest, Math.max(0, payoffDiscountAmount));
        const retainedInterest = totalUnearnedInterest - waivedInterest;
        const totalPayoff = remainingPrincipal + unpaidLateFee + retainedInterest;

        return (
          <Modal
            isOpen={!!earlyPayoffLoan}
            onClose={() => setEarlyPayoffLoan(null)}
            title="Pelunasan Dipercepat (Early Payoff)"
            subtitle={`Kontrak No: ${earlyPayoffLoan.loanNo} • ${earlyPayoffLoan.memberName}`}
            footer={
              <>
                <Button variant="secondary" onClick={() => setEarlyPayoffLoan(null)}>Batal</Button>
                <Button variant="emerald" onClick={handleEarlyPayoffSubmit} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Konfirmasi Pelunasan Dipercepat
                </Button>
              </>
            }
          >
            <div className="space-y-4 text-xs text-slate-300">
              {/* Preset Buttons */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Nominal Diskon Bunga Digratiskan (Rp)</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-sm">{formatRupiah(waivedInterest)} Waived</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: `Gratis Seluruh Bunga (${formatRupiah(totalUnearnedInterest)})`, val: totalUnearnedInterest },
                    { label: 'Rp 500.000', val: 500000 },
                    { label: 'Rp 250.000', val: 250000 },
                    { label: 'Rp 0 (Tanpa Diskon)', val: 0 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setPayoffDiscountAmount(preset.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        payoffDiscountAmount === preset.val
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-950/40'
                          : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <Input
                  label="Nominal Custom Diskon Bunga (Rp)"
                  type="number"
                  min="0"
                  max={totalUnearnedInterest}
                  step="10000"
                  value={payoffDiscountAmount}
                  onChange={(e) => setPayoffDiscountAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                />
              </div>

              {/* Rincian Finansial */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sisa Pokok Pinjaman:</span>
                  <span className="font-bold text-white text-sm">{formatRupiah(remainingPrincipal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Denda Keterlambatan Menunggak:</span>
                  <span className="font-bold text-rose-400 text-sm">{formatRupiah(unpaidLateFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Bunga Belum Berjalan:</span>
                  <span className="font-mono font-semibold text-slate-300">{formatRupiah(totalUnearnedInterest)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 border-t border-slate-800/80 pt-2">
                  <span className="font-semibold">Potongan Diskon Bunga Digratiskan:</span>
                  <span className="font-extrabold text-sm">- {formatRupiah(waivedInterest)}</span>
                </div>
                {retainedInterest > 0 && (
                  <div className="flex justify-between items-center text-amber-300">
                    <span className="font-semibold">Sisa Bunga Wajib Dibayar:</span>
                    <span className="font-extrabold text-sm">+ {formatRupiah(retainedInterest)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-slate-700/80 pt-2.5">
                  <span className="font-extrabold text-white text-sm">TOTAL WAJIB DIBAYAR:</span>
                  <span className="font-black text-xl text-emerald-400">{formatRupiah(totalPayoff)}</span>
                </div>
              </div>

              <Select
                label="Metode Pembayaran Pelunasan"
                value={payoffMethod}
                onChange={(e) => setPayoffMethod(e.target.value as any)}
                options={[
                  { value: 'kas_tunai', label: 'Kas Tunai Kantor Koperasi' },
                  { value: 'transfer_bank', label: 'Transfer Rekening Bank Koperasi' },
                ]}
              />
            </div>
          </Modal>
        );
      })()}

      {/* Disbursement Verification Modal */}
      {disburseApp && (
        <Modal
          isOpen={!!disburseApp}
          onClose={() => setDisburseApp(null)}
          title="Konfirmasi Pencairan Dana Pinjaman"
          subtitle={`Pemohon: ${disburseApp.memberName} (${disburseApp.memberNo})`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDisburseApp(null)}>Batal</Button>
              <Button variant="emerald" onClick={handleDisburseSubmit}>Eksekusi Pencairan Dana</Button>
            </>
          }
        >
          <form className="space-y-4 text-xs text-slate-300">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Nilai Pokok Dicairkan:</span>
                <span className="font-extrabold text-emerald-400 text-sm">{formatRupiah(disburseApp.approvedAmount || disburseApp.requestedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tenor:</span>
                <span className="font-bold text-white">{disburseApp.approvedTermMonths || disburseApp.requestedTermMonths} Bulan</span>
              </div>
            </div>

            <Input
              label="Tanggal Pencairan"
              type="date"
              value={disbursementDate}
              onChange={(e) => setDisbursementDate(e.target.value)}
              required
            />

            <Select
              label="Metode Pencairan Dana"
              value={disbursementMethod}
              onChange={(e) => setDisbursementMethod(e.target.value as any)}
              options={[
                { value: 'transfer_bank', label: 'Transfer Rekening Bank Anggota' },
                { value: 'kas_tunai', label: 'Pencairan Kas Tunai Kantor' },
              ]}
            />
          </form>
        </Modal>
      )}

      {/* Printable Disbursement Voucher Modal */}
      {printLoanVoucher && (
        <Modal
          isOpen={!!printLoanVoucher}
          onClose={() => setPrintLoanVoucher(null)}
          title="Voucher Pencairan Dana Pinjaman"
          footer={
            <>
              <Button variant="secondary" onClick={() => setPrintLoanVoucher(null)}>Tutup</Button>
              <Button variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>Cetak Voucher</Button>
            </>
          }
        >
          <div className="print-card p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs font-sans">
            <div className="text-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">KPRI MTsN 3 KOTA PADANG</h3>
              <p className="text-slate-400 text-[10px]">VOUCHER PENCAIRAN DANA PINJAMAN</p>
              <p className="font-mono text-indigo-400 font-bold text-sm mt-1">{printLoanVoucher.loanNo}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-slate-400 text-[10px] block">Penerima (Anggota):</span><span className="font-bold text-white">{printLoanVoucher.memberName}</span></div>
              <div><span className="text-slate-400 text-[10px] block">Tanggal Pencairan:</span><span className="font-bold text-white">{formatDateIndonesian(printLoanVoucher.disbursementDate)}</span></div>
              <div><span className="text-slate-400 text-[10px] block">Produk:</span><span className="font-bold text-white">{printLoanVoucher.productName}</span></div>
              <div><span className="text-slate-400 text-[10px] block">Tenor / Bunga:</span><span className="font-bold text-white">{printLoanVoucher.termMonths} Bulan ({printLoanVoucher.annualInterestRate}%)</span></div>
            </div>
            <div className="border-t border-b border-slate-800 py-3 flex justify-between items-center">
              <span className="font-bold">Nominal Pokok Pencairan:</span>
              <span className="text-xl font-extrabold text-emerald-400">{formatRupiah(printLoanVoucher.principalAmount)}</span>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

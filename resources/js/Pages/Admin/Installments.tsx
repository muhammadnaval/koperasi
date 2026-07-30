import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Modal } from '@/Components/UI/Modal';
import { formatRupiah, formatDateIndonesian, allocateOldestDuePayment } from '@/utils/formatters';
import { CreditCard, DollarSign, Printer, XCircle, Search, AlertTriangle } from 'lucide-react';
import { Payment, Loan } from '@/types';

export const AdminInstallments: React.FC = () => {
  const { loans, payments, postPayment, voidPayment } = useApp();

  const [activeTab, setActiveTab] = useState<'record' | 'history' | 'overdue'>('record');
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Recording State
  const [selectedLoanId, setSelectedLoanId] = useState(loans[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState('1100000');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'kas_tunai' | 'transfer_bank'>('kas_tunai');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('Pembayaran angsuran rutin');
  const [paymentError, setPaymentError] = useState('');

  // Void Modal State
  const [voidPay, setVoidPay] = useState<Payment | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Print Receipt Modal State
  const [printPay, setPrintPay] = useState<Payment | null>(null);

  const selectedLoan = loans.find(l => l.id === selectedLoanId) || loans[0];
  const numPayAmt = parseInt(paymentAmount, 10) || 0;

  // Calculate realtime oldest-due-first allocation preview
  const allocationPreview = selectedLoan
    ? allocateOldestDuePayment(selectedLoan.installments, numPayAmt)
    : { allocations: [], remainingPayment: 0 };

  const handlePostPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    if (!selectedLoan || numPayAmt <= 0) {
      setPaymentError('Nominal pembayaran tidak valid');
      return;
    }

    const res = postPayment({
      loanId: selectedLoan.id,
      amount: numPayAmt,
      paymentDate,
      method: paymentMethod,
      reference,
      notes,
    });

    if (!res.success) {
      setPaymentError(res.message);
    } else {
      alert('Pembayaran angsuran berhasil diposting!');
    }
  };

  const handleVoidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidPay || !voidReason) return;
    voidPayment(voidPay.id, voidReason);
    setVoidPay(null);
    setVoidReason('');
  };

  // Overdue Installments list
  const overdueItems = loans.flatMap(l =>
    l.installments.filter(i => i.status === 'overdue').map(i => ({
      ...i,
      loanNo: l.loanNo,
      memberName: l.memberName,
      memberNo: l.memberNo,
      productName: l.productName,
    }))
  );

  return (
    <MainLayout activePath="/admin/angsuran" title="Pencatatan Pembayaran Angsuran" subtitle="Alokasi otomatis Oldest-Due-First, pengelolaan tunggakan aging bucket, dan reversal pembayaran.">
      <div className="space-y-6">
        {/* Tab Header */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('record')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'record'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Input Pembayaran Angsuran
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Histori Pembayaran ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overdue'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Daftar Menunggak & Aging ({overdueItems.length})
          </button>
        </div>

        {/* Tab Content: Record Payment */}
        {activeTab === 'record' && selectedLoan && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 cols: Form Input */}
            <form onSubmit={handlePostPaymentSubmit} className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Form Pembayaran Angsuran
              </h3>

              {paymentError && <p className="text-xs text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">{paymentError}</p>}

              <Select
                label="Pilih Kontrak Pinjaman Anggota"
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                options={loans.map(l => ({
                  value: l.id,
                  label: `${l.loanNo} — ${l.memberName} (Outstanding: ${formatRupiah(l.outstandingAmount)})`,
                }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nominal Pembayaran (Rp)"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
                <Input
                  label="Tanggal Pembayaran"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Metode Kas / Bank"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  options={[
                    { value: 'kas_tunai', label: 'Kas Tunai Kantor' },
                    { value: 'transfer_bank', label: 'Transfer Rekening Bank BNI' },
                  ]}
                />
                <Input
                  label="No. Referensi Transfer / Struk (Opsional)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="TRF-BNI-XXXXX"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Catatan Pembayaran</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <Button type="submit" variant="emerald" size="lg" className="w-full">
                Post Pembayaran Angsuran
              </Button>
            </form>

            {/* Right 5 cols: Allocation Preview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" /> Preview Alokasi Oldest-Due-First
                </h3>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <p><span className="text-slate-400">Anggota:</span> <strong className="text-white">{selectedLoan.memberName}</strong></p>
                  <p><span className="text-slate-400">Nominal Diinput:</span> <strong className="text-emerald-400 font-extrabold text-sm">{formatRupiah(numPayAmt)}</strong></p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Hasil Alokasi Ke Jadwal:</h4>
                  {allocationPreview.allocations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">Masukkan nominal pembayaran untuk melihat alokasi.</p>
                  ) : (
                    <div className="space-y-2">
                      {allocationPreview.allocations.map((alloc) => (
                        <div key={alloc.installmentId} className="bg-slate-950/80 border border-indigo-500/30 p-3 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-indigo-300">Bulan Ke-{alloc.sequenceNo}</p>
                          <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400">
                            <div>Pokok: <span className="text-white font-bold">{formatRupiah(alloc.principalAmount)}</span></div>
                            <div>Bunga: <span className="text-white font-bold">{formatRupiah(alloc.interestAmount)}</span></div>
                            <div>Denda: <span className="text-amber-400 font-bold">{formatRupiah(alloc.lateFeeAmount)}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Payment History */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-white">Riwayat Transaksi Pembayaran Angsuran</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">No. Pembayaran</th>
                    <th className="py-3 px-4">No. Pinjaman</th>
                    <th className="py-3 px-4">Anggota</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{p.paymentNo}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{p.loanNo}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{p.memberName}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{formatDateIndonesian(p.paymentDate)}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">{formatRupiah(p.amount)}</td>
                      <td className="py-3.5 px-4 text-center"><Badge status={p.status} /></td>
                      <td className="py-3.5 px-4 text-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setPrintPay(p)} leftIcon={<Printer className="w-3.5 h-3.5" />}>Cetak</Button>
                        {p.status === 'posted' && (
                          <Button variant="danger" size="sm" onClick={() => setVoidPay(p)} leftIcon={<XCircle className="w-3.5 h-3.5" />}>Void</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Overdue & Aging */}
        {activeTab === 'overdue' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-white">Daftar Tagihan Menunggak (Overdue)</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">No. Pinjaman</th>
                    <th className="py-3 px-4">Anggota</th>
                    <th className="py-3 px-4">Angsuran Ke-</th>
                    <th className="py-3 px-4">Jatuh Tempo</th>
                    <th className="py-3 px-4 text-right">Tagihan Sisa</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {overdueItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada angsuran menunggak saat ini.
                      </td>
                    </tr>
                  ) : (
                    overdueItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{item.loanNo}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{item.memberName}</td>
                        <td className="py-3.5 px-4 font-mono">Bulan Ke-{item.sequenceNo}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-rose-400 font-bold">{formatDateIndonesian(item.dueDate)}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-rose-400">{formatRupiah(item.remainingAmount)}</td>
                        <td className="py-3.5 px-4 text-center"><Badge status="overdue" /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Void Modal */}
      {voidPay && (
        <Modal
          isOpen={!!voidPay}
          onClose={() => setVoidPay(null)}
          title={`Void Pembayaran — ${voidPay.paymentNo}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setVoidPay(null)}>Batal</Button>
              <Button variant="danger" onClick={handleVoidSubmit}>Konfirmasi Void Pembayaran</Button>
            </>
          }
        >
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Alasan Void Pembayaran</label>
              <textarea
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Tulis alasan pembatalan pembayaran..."
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Print Payment Receipt Modal */}
      {printPay && (
        <Modal
          isOpen={!!printPay}
          onClose={() => setPrintPay(null)}
          title="Struk Bukti Pembayaran Angsuran"
          footer={
            <>
              <Button variant="secondary" onClick={() => setPrintPay(null)}>Tutup</Button>
              <Button variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>Cetak Struk</Button>
            </>
          }
        >
          <div className="print-card p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs font-sans">
            <div className="text-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">KPRI MTsN 3 KOTA PADANG</h3>
              <p className="text-slate-400 text-[10px]">STRUK BUKTI PEMBAYARAN ANGSURAN PINJAMAN</p>
              <p className="font-mono text-indigo-400 font-bold text-sm mt-1">{printPay.paymentNo}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-slate-400 text-[10px] block">Anggota:</span><span className="font-bold text-white">{printPay.memberName}</span></div>
              <div><span className="text-slate-400 text-[10px] block">No Pinjaman:</span><span className="font-bold font-mono text-white">{printPay.loanNo}</span></div>
              <div><span className="text-slate-400 text-[10px] block">Tanggal Bayar:</span><span className="font-bold text-white">{formatDateIndonesian(printPay.paymentDate)}</span></div>
              <div><span className="text-slate-400 text-[10px] block">Metode:</span><span className="font-bold uppercase text-white">{printPay.method}</span></div>
            </div>
            <div className="border-t border-b border-slate-800 py-3 flex justify-between items-center">
              <span className="font-bold">Total Pembayaran:</span>
              <span className="text-xl font-extrabold text-emerald-400">{formatRupiah(printPay.amount)}</span>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { calculateFlatLoan, formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { Calculator, Upload, CheckCircle2, ArrowRight, Info } from 'lucide-react';

export const MemberLoanApply: React.FC = () => {
  const { loanProducts, submitLoanApplication } = useApp();

  const activeProducts = loanProducts.filter(p => p.isActive);
  const [selectedProductId, setSelectedProductId] = useState(activeProducts[0]?.id || 'lp-1');
  const [amount, setAmount] = useState('10000000');
  const [termMonths, setTermMonths] = useState('12');
  const [purpose, setPurpose] = useState('Biaya Renovasi Rumah & Modal Kerja Usaha');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submittedAppNo, setSubmittedAppNo] = useState<string | null>(null);

  const currentProduct = activeProducts.find(p => p.id === selectedProductId) || activeProducts[0];
  const numAmount = parseInt(amount, 10) || 0;
  const numTerm = parseInt(termMonths, 10) || 1;

  // Realtime Flat Loan Calculation using pure function
  const sim = calculateFlatLoan(numAmount, currentProduct?.annualInterestRate || 10.0, numTerm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) return;

    const newApp = submitLoanApplication({
      productId: currentProduct.id,
      requestedAmount: numAmount,
      requestedTermMonths: numTerm,
      purpose,
      attachments: [
        {
          id: `att-${Date.now()}`,
          fileName: 'KTP_Anggota.pdf',
          fileSize: '1.1 MB',
          fileType: 'application/pdf',
          category: 'KTP',
          uploadedAt: new Date().toISOString(),
        },
      ],
    });

    setSubmittedAppNo(newApp.applicationNo);
  };

  const riskFeePct = currentProduct?.riskFeePercentage ?? 0.5;
  const mandatorySavingPct = currentProduct?.mandatorySavingPercentage ?? 0.5;
  const riskFeeAmt = Math.round((numAmount * riskFeePct) / 100);
  const mandatorySavingAmt = Math.round((numAmount * mandatorySavingPct) / 100);
  const netDisbursementAmt = numAmount - (riskFeeAmt + mandatorySavingAmt);

  return (
    <MainLayout activePath="/pinjaman" title="Formulir Pengajuan Pinjaman Baru" subtitle="Simulasikan angsuran dan ajukan pinjaman koperasi secara digital.">
      {submittedAppNo ? (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white">Pengajuan Berhasil Dikirim!</h3>
            <p className="text-xs text-slate-300">
              Nomor pengajuan Anda: <span className="font-mono font-bold text-emerald-400">{submittedAppNo}</span>.
            </p>
            <p className="text-xs text-slate-400">
              Petugas koperasi akan meninjau kelengkapan dokumen dan persetujuan pengajuan Anda.
            </p>
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <a href="/pinjaman">
              <Button variant="emerald">Lihat Status Pengajuan</Button>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: 7 cols */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" /> Detail Parameter Pengajuan
            </h3>

            <Select
              label="Pilih Produk Pinjaman"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={activeProducts.map(p => ({
                value: p.id,
                label: `${p.name} (Bunga ${p.annualInterestRate}% / thn)`,
              }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Nominal Pinjaman (Rp)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                helperText={`Batas: ${formatRupiah(currentProduct.minAmount)} s.d ${formatRupiah(currentProduct.maxAmount)}`}
                required
              />

              <Input
                label="Tenor (Bulan)"
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                helperText={`Tenor: ${currentProduct.minTermMonths} s.d ${currentProduct.maxTermMonths} Bulan`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Tujuan / Penggunaan Pinjaman
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Jelaskan kebutuhan pengajuan pinjaman Anda..."
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            {/* Document Upload Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Unggah Dokumen Pendukung (PDF/JPG, max 5MB)
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">Klik atau seret file PDF / Slip Gaji / KTP ke sini</p>
                <p className="text-[11px] text-slate-400 mt-1">Dokumen awal otomatis disiapkan (KTP_Anggota.pdf)</p>
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20"
              />
              <span>Saya menyatakan bahwa data yang diisi adalah benar, sah, serta menyetujui pemotongan angsuran sesuai jadwal koperasi.</span>
            </label>

            <Button
              type="submit"
              variant="emerald"
              size="lg"
              className="w-full"
              disabled={!agreedTerms}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Kirim Pengajuan Pinjaman
            </Button>
          </form>

          {/* Right Simulation Preview: 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" /> Hasil Simulasi Flat Rate
              </h3>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Plafon Pinjaman:</span>
                  <span className="font-bold text-white">{formatRupiah(sim.principal)}</span>
                </div>

                {/* Rincian Potongan Pencairan */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Potongan Pencairan (Net Disbursement):</p>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">• Dana Risiko Koperasi ({riskFeePct}%):</span>
                    <span className="font-mono text-indigo-300">-{formatRupiah(riskFeeAmt)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">• Simpanan Wajib Peminjam ({mandatorySavingPct}%):</span>
                    <span className="font-mono text-emerald-300">-{formatRupiah(mandatorySavingAmt)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold border-t border-slate-800 pt-1.5 text-emerald-400">
                    <span>Estimasi Dana Bersih Dicairkan:</span>
                    <span>{formatRupiah(netDisbursementAmt)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-400">Bunga ({sim.annualRate}% / thn):</span>
                  <span className="font-bold text-white">{formatRupiah(sim.totalInterest)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm">
                  <span className="font-bold text-slate-200">Total Wajib Bayar:</span>
                  <span className="font-extrabold text-emerald-400">{formatRupiah(sim.totalPayable)}</span>
                </div>
                <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/30 text-center">
                  <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Estimasi Angsuran per Bulan:</p>
                  <p className="text-xl font-extrabold text-white mt-0.5">{formatRupiah(sim.monthlyInstallment)}</p>
                </div>
              </div>

              {/* Schedule Table Preview */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Preview Jadwal Angsuran:</h4>
                <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Bln</th>
                        <th className="py-2 px-3">Pokok</th>
                        <th className="py-2 px-3">Bunga</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {sim.schedule.map((sch) => (
                        <tr key={sch.sequenceNo} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-mono font-bold">Ke-{sch.sequenceNo}</td>
                          <td className="py-2 px-3">{formatRupiah(sch.principalDue)}</td>
                          <td className="py-2 px-3">{formatRupiah(sch.interestDue)}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400">{formatRupiah(sch.totalDue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-500 italic">* Selisih pembulatan rupiah otomatis dialokasikan pada angsuran bulan terakhir.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

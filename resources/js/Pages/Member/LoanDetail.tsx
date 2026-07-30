import React from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { CreditCard, Calendar, Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

export interface MemberLoanDetailProps {
  loanId?: string;
}

export const MemberLoanDetail: React.FC<MemberLoanDetailProps> = ({ loanId = 'loan-1' }) => {
  const { loans } = useApp();
  const loan = loans.find(l => l.id === loanId) || loans[0];

  if (!loan) {
    return (
      <MainLayout activePath="/pinjaman" title="Detail Pinjaman">
        <p className="text-slate-400 text-center py-12">Pinjaman tidak ditemukan.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout activePath="/pinjaman" title={`Detail Pinjaman ${loan.loanNo}`} subtitle={`Kontrak Pinjaman ${loan.productName} • Anggota: ${loan.memberName}`}>
      <div className="space-y-8">
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <a href="/pinjaman">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Kembali ke Daftar Pinjaman
            </Button>
          </a>
          <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
            Cetak Jadwal Angsuran
          </Button>
        </div>

        {/* Contract Parameter Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400">{loan.loanNo}</span>
                <Badge status={loan.status} />
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1">{loan.productName}</h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Sisa Kewajiban Tagihan:</span>
              <span className="text-2xl font-extrabold text-rose-400">{formatRupiah(loan.outstandingAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Pokok Pinjaman:</span>
              <span className="text-base font-bold text-white mt-0.5">{formatRupiah(loan.principalAmount)}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Bunga ({loan.annualInterestRate}% Flat):</span>
              <span className="text-base font-bold text-white mt-0.5">{formatRupiah(loan.totalInterest)}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Wajib Bayar:</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5">{formatRupiah(loan.totalPayable)}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Tenor Pinjaman:</span>
              <span className="text-base font-bold text-white mt-0.5">{loan.termMonths} Bulan</span>
            </div>
          </div>
        </div>

        {/* Installment Schedule Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Jadwal & Status Pembayaran Angsuran
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Bln Ke-</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">Angsuran Pokok</th>
                  <th className="py-3 px-4">Bunga</th>
                  <th className="py-3 px-4">Denda</th>
                  <th className="py-3 px-4">Total Tagihan</th>
                  <th className="py-3 px-4">Terbayar</th>
                  <th className="py-3 px-4">Sisa Tagihan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loan.installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">Bulan Ke-{inst.sequenceNo}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{formatDateIndonesian(inst.dueDate)}</td>
                    <td className="py-3.5 px-4">{formatRupiah(inst.principalDue)}</td>
                    <td className="py-3.5 px-4">{formatRupiah(inst.interestDue)}</td>
                    <td className="py-3.5 px-4 text-amber-400">{formatRupiah(inst.lateFeeDue)}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{formatRupiah(inst.totalDue)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{formatRupiah(inst.paidAmount)}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-400">{formatRupiah(inst.remainingAmount)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge status={inst.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

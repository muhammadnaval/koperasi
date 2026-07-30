import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { CreditCard, PlusCircle, ChevronRight, FileText } from 'lucide-react';

export const MemberLoans: React.FC = () => {
  const { currentUser, members, loans, loanApplications } = useApp();
  const member = members.find(m => m.profileId === currentUser.id) || members[0];

  const myLoans = loans.filter(l => l.memberId === member.id);
  const myApplications = loanApplications.filter(a => a.memberId === member.id);

  const [activeTab, setActiveTab] = useState<'applications' | 'loans'>('applications');

  return (
    <MainLayout activePath="/pinjaman" title="Pinjaman Saya" subtitle="Daftar pengajuan pinjaman dan pinjaman aktif Anda di Koperasi.">
      <div className="space-y-8">
        {/* Top Bar with Apply Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" /> Fasilitas Pinjaman Anggota
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Bunga flat transparan, perhitungan tenor fleksibel hingga 36 bulan.
            </p>
          </div>
          <a href="/pinjaman/ajukan">
            <Button variant="emerald" size="lg" leftIcon={<PlusCircle className="w-5 h-5" />}>
              Ajukan Pinjaman Baru
            </Button>
          </a>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Pengajuan Pinjaman ({myApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'loans'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Kontrak Pinjaman Aktif ({myLoans.length})
          </button>
        </div>

        {/* Applications Tab Content */}
        {activeTab === 'applications' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-white">Riwayat Status Pengajuan</h4>

            <div className="space-y-4">
              {myApplications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Belum ada pengajuan pinjaman.</p>
              ) : (
                myApplications.map((app) => (
                  <div key={app.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-indigo-400">{app.applicationNo}</span>
                          <Badge status={app.status} />
                        </div>
                        <h4 className="font-bold text-base text-white mt-1">{app.productName}</h4>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-400">Pengajuan Nominal:</p>
                        <p className="text-lg font-extrabold text-emerald-400">{formatRupiah(app.requestedAmount)}</p>
                        <p className="text-[11px] text-slate-400">{app.requestedTermMonths} Bulan Tenor</p>
                      </div>
                    </div>

                    <div className="text-xs space-y-2 text-slate-300">
                      <p><span className="text-slate-400">Tujuan Pinjaman:</span> {app.purpose}</p>
                      {app.reviewNotes && (
                        <p className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                          <strong className="text-indigo-400 block mb-0.5">Catatan Reviewer:</strong>
                          {app.reviewNotes}
                        </p>
                      )}
                      {app.decisionReason && (
                        <p className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                          <strong className="text-emerald-400 block mb-0.5">Alasan Decision:</strong>
                          {app.decisionReason}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Loans Tab Content */}
        {activeTab === 'loans' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-white">Daftar Kontrak Pinjaman Berjalan</h4>

            <div className="space-y-4">
              {myLoans.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Tidak ada kontrak pinjaman aktif.</p>
              ) : (
                myLoans.map((loan) => (
                  <div key={loan.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">{loan.loanNo}</span>
                        <Badge status={loan.status} />
                      </div>
                      <h4 className="font-bold text-base text-white">{loan.productName}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300 pt-2">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Pokok Pinjaman:</span>
                          <span className="font-bold text-white">{formatRupiah(loan.principalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Bunga ({loan.annualInterestRate}%):</span>
                          <span className="font-bold text-white">{formatRupiah(loan.totalInterest)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total Wajib Bayar:</span>
                          <span className="font-bold text-white">{formatRupiah(loan.totalPayable)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Sisa Tagihan:</span>
                          <span className="font-bold text-rose-400">{formatRupiah(loan.outstandingAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <a href={`/pinjaman/${loan.id}`}>
                      <Button variant="emerald" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                        Jadwal & Angsuran
                      </Button>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

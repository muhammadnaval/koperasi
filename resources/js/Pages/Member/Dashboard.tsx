import React from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { StatCard } from '@/Components/UI/StatCard';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { 
  Wallet, 
  CreditCard, 
  PlusCircle, 
  History, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  const { currentUser, members, savingsTransactions, loans, loanApplications } = useApp();

  // Find member profile connected to currentUser
  const member = members.find(m => m.profileId === currentUser.id) || members[0];
  
  // Member loans & apps
  const myLoans = loans.filter(l => l.memberId === member.id);
  const activeLoan = myLoans.find(l => l.status === 'active');
  const myApplications = loanApplications.filter(a => a.memberId === member.id);
  const latestApp = myApplications[0];

  // Upcoming / Overdue installment
  const nextInstallment = activeLoan?.installments.find(i => i.status === 'overdue' || i.status === 'unpaid' || i.status === 'partial');

  // Last 5 savings transactions
  const myTransactions = savingsTransactions.filter(t => t.memberId === member.id).slice(0, 5);

  return (
    <MainLayout activePath="/dashboard" title={`Selamat Datang, ${currentUser.fullName.split(',')[0]}!`} subtitle="Ringkasan saldo simpanan, pinjaman aktif, dan jadwal angsuran Anda.">
      <div className="space-y-8">
        {/* Overdue / Upcoming Alert Banner */}
        {nextInstallment && (
          <div className={`rounded-2xl p-5 border shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
            nextInstallment.status === 'overdue'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${
                nextInstallment.status === 'overdue'
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 animate-pulse'
                  : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-white">
                    {nextInstallment.status === 'overdue' ? 'Peringatan Angsuran Menunggak!' : 'Tagihan Angsuran Terdekat'}
                  </h4>
                  <Badge status={nextInstallment.status} />
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Angsuran Ke-{nextInstallment.sequenceNo} sebesar{' '}
                  <span className="font-bold text-white">{formatRupiah(nextInstallment.remainingAmount)}</span>{' '}
                  jatuh tempo pada <span className="font-bold text-white">{formatDateIndonesian(nextInstallment.dueDate)}</span>.
                </p>
              </div>
            </div>
            <a href={`/pinjaman/${activeLoan?.id}`}>
              <Button
                variant={nextInstallment.status === 'overdue' ? 'danger' : 'emerald'}
                size="sm"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Lihat Detail Tagihan
              </Button>
            </a>
          </div>
        )}

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Aksi Cepat Anggota:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href="/pinjaman/ajukan">
              <Button variant="emerald" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Ajukan Pinjaman
              </Button>
            </a>
            <a href="/simpanan">
              <Button variant="secondary" size="sm" leftIcon={<Wallet className="w-4 h-4" />}>
                Lihat Simpanan
              </Button>
            </a>
            <a href="/pinjaman">
              <Button variant="secondary" size="sm" leftIcon={<CreditCard className="w-4 h-4" />}>
                Riwayat Pinjaman
              </Button>
            </a>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Simpanan Saya"
            value={formatRupiah(member.totalSavings)}
            subtitle="Pokok + Wajib + Sukarela"
            gradient="emerald"
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="Simpanan Sukarela"
            value={formatRupiah(member.savingsSukarela)}
            subtitle="Dapat ditarik sewaktu-waktu"
            gradient="cyan"
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="Sisa Kewajiban Pinjaman"
            value={formatRupiah(member.totalOutstandingLoan)}
            subtitle={`${member.activeLoanCount} Pinjaman Aktif`}
            gradient="rose"
            icon={<CreditCard className="w-6 h-6" />}
          />
          <StatCard
            title="Angsuran Bulanan"
            value={activeLoan ? formatRupiah(activeLoan.installments[0]?.totalDue || 0) : 'Rp 0'}
            subtitle={activeLoan ? `${activeLoan.productName}` : 'Tidak Ada Tagihan'}
            gradient="indigo"
            icon={<History className="w-6 h-6" />}
          />
        </div>

        {/* 2 Column Layout: Savings Breakdown & Recent Loan Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Savings Breakdown & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Savings Breakdown Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> Rincian Jenis Simpanan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <p className="text-xs text-slate-400">Simpanan Pokok</p>
                  <p className="text-lg font-bold text-white mt-1">{formatRupiah(member.savingsPokok)}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Setoran 1x Awal</p>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <p className="text-xs text-slate-400">Simpanan Wajib</p>
                  <p className="text-lg font-bold text-white mt-1">{formatRupiah(member.savingsWajib)}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Rp 50.000 / Bulan</p>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <p className="text-xs text-slate-400">Simpanan Sukarela</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{formatRupiah(member.savingsSukarela)}</p>
                  <p className="text-[10px] text-emerald-500/80 mt-1">Fleksibel & Fleksibel</p>
                </div>
              </div>
            </div>

            {/* Recent 5 Transactions */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" /> Transaksi Simpanan Terakhir
                </h3>
                <a href="/simpanan" className="text-xs font-semibold text-indigo-400 hover:underline">
                  Lihat Semua
                </a>
              </div>

              <div className="divide-y divide-slate-800/60">
                {myTransactions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Belum ada riwayat transaksi.</p>
                ) : (
                  myTransactions.map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}>
                          {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{tx.productName}</p>
                          <p className="text-[10px] text-slate-400">{tx.referenceNo} • {formatDateIndonesian(tx.transactionDate)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}{formatRupiah(tx.amount)}
                        </p>
                        <Badge status={tx.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Latest Loan App Status */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" /> Status Pengajuan Pinjaman
              </h3>

              {latestApp ? (
                <div className="space-y-4">
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-slate-400">{latestApp.applicationNo}</span>
                      <Badge status={latestApp.status} />
                    </div>
                    <h4 className="font-bold text-sm text-white">{latestApp.productName}</h4>
                    <p className="text-xs text-slate-300 mt-1">Nominal: <span className="font-bold text-emerald-400">{formatRupiah(latestApp.requestedAmount)}</span> ({latestApp.requestedTermMonths} Bulan)</p>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">Tujuan: {latestApp.purpose}</p>
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Progress Timeline:</p>
                    {[
                      { step: 'submitted', label: 'Pengajuan Dikirim', desc: latestApp.submittedAt ? formatDateIndonesian(latestApp.submittedAt) : 'Pending' },
                      { step: 'under_review', label: 'Review Petugas', desc: latestApp.reviewNotes || 'Menunggu verifikasi' },
                      { step: 'approved', label: 'Keputusan Approver', desc: latestApp.decisionReason || 'Menunggu keputusan' },
                      { step: 'disbursed', label: 'Pencairan Dana', desc: latestApp.disbursedAt ? 'Dana telah cair' : 'Menunggu pencairan' },
                    ].map((st, idx) => {
                      const isCompleted = latestApp.status === 'disbursed' || 
                        (latestApp.status === 'approved' && idx <= 2) ||
                        (latestApp.status === 'under_review' && idx <= 1) ||
                        (latestApp.status === 'submitted' && idx === 0);

                      return (
                        <div key={st.step} className="flex items-start gap-3 text-xs">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                            isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className={`font-bold ${isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>{st.label}</p>
                            <p className="text-[10px] text-slate-400">{st.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-3">
                  <p className="text-xs">Anda belum memiliki pengajuan pinjaman aktif saat ini.</p>
                  <a href="/pinjaman/ajukan">
                    <Button variant="emerald" size="sm">Ajukan Sekarang</Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

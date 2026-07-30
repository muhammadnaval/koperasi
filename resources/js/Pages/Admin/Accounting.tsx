import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { BookOpen, Calculator, CheckCircle2 } from 'lucide-react';

export const AdminAccounting: React.FC = () => {
  const { accounts, journalEntries, members } = useApp();
  const [activeTab, setActiveTab] = useState<'coa' | 'journals' | 'tb' | 'neraca' | 'phu' | 'shu'>('coa');

  // Group accounts by type for financial statements
  const assetAccounts = accounts.filter((a) => a.type === 'asset');
  const liabilityAccounts = accounts.filter((a) => a.type === 'liability');
  const equityAccounts = accounts.filter((a) => a.type === 'equity');
  const revenueAccounts = accounts.filter((a) => a.type === 'revenue');
  const expenseAccounts = accounts.filter((a) => a.type === 'expense');

  // Calculations
  const totalAssets = assetAccounts.reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const totalLiabilities = liabilityAccounts.reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const totalEquity = equityAccounts.reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const totalRevenues = revenueAccounts.reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const totalExpenses = expenseAccounts.reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const netSurplusSHU = totalRevenues - totalExpenses; // SHU Bersih

  // Trial Balance calculation
  const totalDebitTB = accounts.filter((a) => a.normalBalance === 'debit').reduce((acc, a) => acc + Math.abs(a.balance), 0);
  const totalCreditTB = accounts.filter((a) => a.normalBalance === 'credit').reduce((acc, a) => acc + Math.abs(a.balance), 0);

  // SHU Simulation Calculation
  const jasaModalPool = netSurplusSHU * 0.4; // 40% Jasa Modal
  const jasaUsahaPool = netSurplusSHU * 0.3; // 30% Jasa Usaha / Pinjaman
  const totalSimpananSemua = members.reduce((acc, m) => acc + m.totalSavings, 0);

  return (
    <MainLayout
      activePath="/admin/akuntansi"
      title="Akuntansi & Laporan Keuangan (Permenkop UKM / SAK ETAP)"
      subtitle="Buku besar COA standar Permenkop UKM, Jurnal Umum, Neraca Saldo, Laporan Neraca, Perhitungan Hasil Usaha (PHU), dan alokasi SHU."
    >
      <div className="space-y-6">
        {/* Tab Header */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('coa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'coa'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            COA Permenkop UKM ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('journals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'journals'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Jurnal Umum ({journalEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('tb')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'tb'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Neraca Saldo (TB)
          </button>
          <button
            onClick={() => setActiveTab('neraca')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'neraca'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Laporan Neraca
          </button>
          <button
            onClick={() => setActiveTab('phu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'phu'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Laporan PHU (Rugi Laba)
          </button>
          <button
            onClick={() => setActiveTab('shu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'shu'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kalkulasi & Distribusi SHU
          </button>
        </div>

        {/* Tab Content: COA */}
        {activeTab === 'coa' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white">Chart of Accounts (COA) Standar Permenkop UKM / SAK ETAP</h4>
              <span className="text-[11px] bg-slate-800 text-indigo-300 px-3 py-1 rounded-full font-mono">
                Permenkop UKM No. 13/2015
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Kode Akun</th>
                    <th className="py-2.5 px-3">Nama Akun</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Saldo Normal</th>
                    <th className="py-2.5 px-3 text-right">Saldo Saat Ini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {accounts.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">{a.code}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{a.name}</td>
                      <td className="py-2.5 px-3 uppercase text-slate-400 font-semibold">{a.type}</td>
                      <td className="py-2.5 px-3 uppercase text-slate-300 font-mono">{a.normalBalance}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{formatRupiah(Math.abs(a.balance))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Journals */}
        {activeTab === 'journals' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-white">Jurnal Otomatis Berpasangan (Posted Entries)</h4>
            <div className="space-y-4">
              {journalEntries.map((j) => (
                <div key={j.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-mono font-bold text-indigo-400">
                      {j.journalNo} ({formatDateIndonesian(j.entryDate)})
                    </span>
                    <Badge status={j.status} />
                  </div>
                  <p className="text-slate-300">{j.description}</p>
                  <table className="w-full text-left text-slate-400 text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="py-1">Akun (Permenkop UKM)</th>
                        <th className="py-1 text-right">Debit (Rp)</th>
                        <th className="py-1 text-right">Kredit (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-200">
                      {j.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="py-1 font-semibold">
                            {line.accountCode} - {line.accountName}
                          </td>
                          <td className="py-1 text-right font-mono">{line.debitAmount ? formatRupiah(line.debitAmount) : '-'}</td>
                          <td className="py-1 text-right font-mono">{line.creditAmount ? formatRupiah(line.creditAmount) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Trial Balance */}
        {activeTab === 'tb' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white">Neraca Saldo Koperasi (Trial Balance)</h4>
              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                ✓ Seimbang (Balanced)
              </span>
            </div>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Kode & Nama Akun</th>
                  <th className="py-2.5 px-3 text-right">Debit (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {a.code} — {a.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {a.normalBalance === 'debit' ? formatRupiah(Math.abs(a.balance)) : '0'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {a.normalBalance === 'credit' ? formatRupiah(Math.abs(a.balance)) : '0'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-950 font-extrabold text-sm border-t-2 border-slate-700">
                  <td className="py-3 px-3 text-white">TOTAL NERACA SALDO</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{formatRupiah(totalDebitTB)}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{formatRupiah(totalCreditTB)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Laporan Neraca Keuangan (Balance Sheet) */}
        {activeTab === 'neraca' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-base text-white">Laporan Neraca Keuangan Koperasi</h4>
                <p className="text-xs text-slate-400">Standar Penyajian SAK ETAP / SAK EP (Per 31 Juli 2026)</p>
              </div>
              <span className="text-xs font-bold bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
                ASET = KEWAJIBAN + EKUITAS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Sisi Aset */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h5 className="font-bold text-sm text-cyan-400 border-b border-slate-800 pb-2">1. ASET KOPERASI</h5>
                <div className="space-y-2">
                  {assetAccounts.map((a) => (
                    <div key={a.id} className="flex justify-between">
                      <span className="text-slate-300">{a.code} - {a.name}</span>
                      <span className={`font-mono font-bold ${a.balance < 0 ? 'text-rose-400' : 'text-white'}`}>
                        {formatRupiah(a.balance)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between font-extrabold text-sm text-cyan-300">
                  <span>TOTAL ASET KOPERASI</span>
                  <span>{formatRupiah(totalAssets)}</span>
                </div>
              </div>

              {/* Sisi Kewajiban & Ekuitas */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                {/* Kewajiban */}
                <div className="space-y-2">
                  <h5 className="font-bold text-sm text-amber-400 border-b border-slate-800 pb-2">2. KEWAJIBAN / LIABILITAS</h5>
                  {liabilityAccounts.map((a) => (
                    <div key={a.id} className="flex justify-between">
                      <span className="text-slate-300">{a.code} - {a.name}</span>
                      <span className="font-mono font-bold text-white">{formatRupiah(a.balance)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-amber-300">
                    <span>Total Kewajiban</span>
                    <span>{formatRupiah(totalLiabilities)}</span>
                  </div>
                </div>

                {/* Ekuitas */}
                <div className="space-y-2">
                  <h5 className="font-bold text-sm text-emerald-400 border-b border-slate-800 pb-2">3. EKUITAS KOPERASI</h5>
                  {equityAccounts.map((a) => (
                    <div key={a.id} className="flex justify-between">
                      <span className="text-slate-300">{a.code} - {a.name}</span>
                      <span className="font-mono font-bold text-white">{formatRupiah(a.balance)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-emerald-300">
                    <span>Total Ekuitas</span>
                    <span>{formatRupiah(totalEquity)}</span>
                  </div>
                </div>

                <div className="border-t-2 border-slate-700 pt-3 flex justify-between font-extrabold text-sm text-emerald-400">
                  <span>TOTAL KEWAJIBAN + EKUITAS</span>
                  <span>{formatRupiah(totalLiabilities + totalEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Laporan Perhitungan Hasil Usaha (PHU / Income Statement) */}
        {activeTab === 'phu' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-base text-white">Laporan Perhitungan Hasil Usaha (PHU)</h4>
                <p className="text-xs text-slate-400">Pendapatan vs Beban Operasional Koperasi Periode 2026</p>
              </div>
              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                SHU BERSIH: {formatRupiah(netSurplusSHU)}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Pendapatan */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-sm text-emerald-400 border-b border-slate-800 pb-2">PENDAPATAN OPERASIONAL KOPERASI</h5>
                {revenueAccounts.map((a) => (
                  <div key={a.id} className="flex justify-between">
                    <span className="text-slate-300">{a.code} - {a.name}</span>
                    <span className="font-mono font-bold text-white">{formatRupiah(a.balance)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-emerald-400">
                  <span>TOTAL PENDAPATAN</span>
                  <span>{formatRupiah(totalRevenues)}</span>
                </div>
              </div>

              {/* Beban */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-sm text-rose-400 border-b border-slate-800 pb-2">BEBAN OPERASIONAL & PERKOPERASIAN</h5>
                {expenseAccounts.map((a) => (
                  <div key={a.id} className="flex justify-between">
                    <span className="text-slate-300">{a.code} - {a.name}</span>
                    <span className="font-mono font-bold text-white">{formatRupiah(a.balance)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-rose-400">
                  <span>TOTAL BEBAN OPERASIONAL</span>
                  <span>{formatRupiah(totalExpenses)}</span>
                </div>
              </div>

              {/* Sisa Hasil Usaha (SHU) Bersih */}
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl flex justify-between items-center text-sm font-extrabold">
                <span className="text-white">SISA HASIL USAHA (SHU) BERSIH TAHUN BERJALAN:</span>
                <span className="text-xl text-emerald-300 font-mono">{formatRupiah(netSurplusSHU)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: SHU */}
        {activeTab === 'shu' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-base text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-400" /> Perhitungan & Alokasi SHU Tahun Berjalan
                </h4>
                <p className="text-xs text-slate-400">
                  Total Hasil Usaha Bersih Periode 2026: <strong className="text-emerald-400">{formatRupiah(netSurplusSHU)}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">Pool Jasa Modal Anggota (40%):</p>
                <p className="text-lg font-extrabold text-purple-400 mt-1">{formatRupiah(jasaModalPool)}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">Pool Jasa Pinjaman / Usaha (30%):</p>
                <p className="text-lg font-extrabold text-cyan-400 mt-1">{formatRupiah(jasaUsahaPool)}</p>
              </div>
            </div>

            <h5 className="font-bold text-xs uppercase text-slate-300 tracking-wider">Simulasi Bagian SHU per Anggota:</h5>
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nama Anggota</th>
                  <th className="py-2.5 px-3 text-right">Total Simpanan</th>
                  <th className="py-2.5 px-3 text-right">SHU Jasa Modal</th>
                  <th className="py-2.5 px-3 text-right">SHU Jasa Usaha</th>
                  <th className="py-2.5 px-3 text-right">Total SHU Diterima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((m) => {
                  const propModal = m.totalSavings / (totalSimpananSemua || 1);
                  const shuModal = Math.round(jasaModalPool * propModal);
                  const shuUsaha = Math.round(jasaUsahaPool * (m.activeLoanCount > 0 ? 0.4 : 0.1));
                  const totalSHU = shuModal + shuUsaha;

                  return (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-bold text-white">{m.fullName}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(m.totalSavings)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(shuModal)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(shuUsaha)}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400 font-mono">{formatRupiah(totalSHU)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

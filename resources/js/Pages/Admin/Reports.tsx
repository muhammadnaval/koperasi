import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/Components/UI/Button';
import { Select } from '@/Components/UI/Select';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { PieChart, Download, Printer, Filter } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { members, savingsTransactions, loans, loanApplications } = useApp();

  const [reportType, setReportType] = useState('savings_summary');
  const [period, setPeriod] = useState('2026-07');
  const [exportMessage, setExportMessage] = useState('');

  const handleExportCSV = () => {
    const BOM = '\uFEFF';
    let csvHeader = '';
    let csvRows = '';

    if (reportType === 'savings_summary') {
      csvHeader = '"ID Anggota",No Anggota,Nama Anggota,Simpanan Pokok,Simpanan Wajib,Simpanan Sukarela,Total Simpanan\n';
      csvRows = members.map(m =>
        `"${m.id}","${m.memberNo}","${m.fullName.replace(/"/g, '""')}",${m.savingsPokok},${m.savingsWajib},${m.savingsSukarela},${m.totalSavings}`
      ).join('\n');
    } else if (reportType === 'loan_active') {
      csvHeader = '"ID Pinjaman",No Kontrak,Nama Anggota,Produk Pinjaman,Plafon Pokok,Total Tagihan,Sisa Outstanding\n';
      csvRows = loans.map(l =>
        `"${l.id}","${l.loanNo}","${l.memberName.replace(/"/g, '""')}","${l.productName}",${l.principalAmount},${l.totalPayable},${l.outstandingAmount}`
      ).join('\n');
    } else {
      csvHeader = '"ID",Referensi,Keterangan,Periode\n';
      csvRows = `"1","REKAP-${period}","Laporan Koperasi ${reportType}","${period}"`;
    }

    const blob = new Blob([BOM + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Koperasi_${reportType}_${period}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setExportMessage(`✓ File CSV Laporan (Laporan_Koperasi_${reportType}_${period}.csv) berhasil di-generate dan diunduh (Aman WPS Office & Excel).`);
    setTimeout(() => setExportMessage(''), 4000);
  };

  return (
    <MainLayout activePath="/admin/laporan" title="Laporan & Rekapitulasi Finansial" subtitle="Filter laporan operasional koperasi, cetak dokumen resmi, dan ekspor CSV.">
      <div className="space-y-6">
        {/* Filter & Export Bar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-3">
            <Filter className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Filter Parameter Laporan</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Jenis Laporan Koperasi"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'savings_summary', label: '1. Laporan Saldo Simpanan Anggota' },
                { value: 'savings_mutations', label: '2. Laporan Mutasi Setoran / Penarikan' },
                { value: 'loan_active', label: '3. Laporan Pinjaman Aktif & Outstanding' },
                { value: 'loan_overdue', label: '4. Laporan Tunggakan & Aging Tagihan' },
                { value: 'members_list', label: '5. Laporan Daftar Keanggotaan' },
              ]}
            />

            <Select
              label="Periode Laporan"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: '2026-07', label: 'Juli 2026' },
                { value: '2026-06', label: 'Juni 2026' },
                { value: '2026-05', label: 'Mei 2026' },
              ]}
            />

            <div className="flex items-end gap-2">
              <Button variant="emerald" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
                Ekspor CSV
              </Button>
              <Button variant="outline" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                Cetak Laporan
              </Button>
            </div>
          </div>

          {exportMessage && (
            <p className="text-xs text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
              {exportMessage}
            </p>
          )}
        </div>

        {/* Report Content View */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 print-card">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-extrabold text-white">KPRI MTsN 3 KOTA PADANG</h2>
              <p className="text-xs text-indigo-400 font-bold uppercase mt-0.5">
                {reportType === 'savings_summary' && 'REKAPITULASI SALDO SIMPANAN ANGGOTA'}
                {reportType === 'savings_mutations' && 'LAPORAN MUTASI SIMPANAN PER PERIODE'}
                {reportType === 'loan_active' && 'LAPORAN KONTRAK PINJAMAN AKTIF & OUTSTANDING'}
                {reportType === 'loan_overdue' && 'LAPORAN ANGSURAN MENUNGGAK & AGING BUCKET'}
                {reportType === 'members_list' && 'DAFTAR ANGGOTA KOPERASI TERDAFTAR'}
              </p>
              <p className="text-[11px] text-slate-400">Periode: {period} • Dicetak: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          {/* Table per report type */}
          {reportType === 'savings_summary' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">No. Anggota</th>
                    <th className="py-2.5 px-3">Nama Anggota</th>
                    <th className="py-2.5 px-3 text-right">Pokok</th>
                    <th className="py-2.5 px-3 text-right">Wajib</th>
                    <th className="py-2.5 px-3 text-right">Sukarela</th>
                    <th className="py-2.5 px-3 text-right">Total Simpanan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map(m => (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-300">{m.memberNo}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{m.fullName}</td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(m.savingsPokok)}</td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(m.savingsWajib)}</td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(m.savingsSukarela)}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{formatRupiah(m.totalSavings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'loan_active' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">No Kontrak</th>
                    <th className="py-2.5 px-3">Nama Anggota</th>
                    <th className="py-2.5 px-3">Produk</th>
                    <th className="py-2.5 px-3 text-right">Pokok</th>
                    <th className="py-2.5 px-3 text-right">Total Payable</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loans.map(l => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-300">{l.loanNo}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{l.memberName}</td>
                      <td className="py-2.5 px-3">{l.productName}</td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(l.principalAmount)}</td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(l.totalPayable)}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-rose-400">{formatRupiah(l.outstandingAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

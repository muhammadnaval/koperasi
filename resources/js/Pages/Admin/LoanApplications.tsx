import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Modal } from '@/Components/UI/Modal';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { FileText, CheckCircle, XCircle, Search, Eye, ShieldCheck } from 'lucide-react';
import { LoanApplication } from '@/types';

export const AdminLoanApplications: React.FC = () => {
  const { loanApplications, members, reviewLoanApplication, approveLoanApplication, rejectLoanApplication } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Decision Modal State
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [approvedTerm, setApprovedTerm] = useState('');
  const [approvedRate, setApprovedRate] = useState('10.0');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');

  const filteredApps = loanApplications.filter(a => {
    const matchesSearch = a.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.applicationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDecisionModal = (app: LoanApplication, type: 'approve' | 'reject') => {
    setSelectedApp(app);
    setDecisionType(type);
    setApprovedAmount(String(app.requestedAmount));
    setApprovedTerm(String(app.requestedTermMonths));
    setApprovedRate('10.0');
    setReviewNotes(app.reviewNotes || 'Dokumen identitas dan slip gaji valid.');
    setDecisionReason(type === 'approve' ? 'Memenuhi kriteria kelayakan kredit koperasi.' : 'Kapasitas angsuran belum memadai.');
  };

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (decisionType === 'approve') {
      approveLoanApplication(selectedApp.id, {
        approvedAmount: parseInt(approvedAmount, 10) || selectedApp.requestedAmount,
        approvedTermMonths: parseInt(approvedTerm, 10) || selectedApp.requestedTermMonths,
        approvedAnnualRate: parseFloat(approvedRate) || 10.0,
        reason: decisionReason,
      });
    } else {
      rejectLoanApplication(selectedApp.id, decisionReason);
    }

    setSelectedApp(null);
  };

  return (
    <MainLayout activePath="/admin/pengajuan" title="Review & Approval Pengajuan Pinjaman" subtitle="Verifikasi kelayakan berkas anggota, rekomendasi reviewer, dan keputusan persetujuan.">
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Cari No Pengajuan / Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftAddon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'submitted', label: 'Dikirim (Submitted)' },
                  { value: 'under_review', label: 'Ditinjau (Under Review)' },
                  { value: 'approved', label: 'Disetujui (Approved)' },
                  { value: 'rejected', label: 'Ditolak (Rejected)' },
                  { value: 'disbursed', label: 'Dicairkan (Disbursed)' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Pengajuan</th>
                  <th className="py-3 px-4">Anggota</th>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4 text-right">Nominal & Tenor</th>
                  <th className="py-3 px-4">Tanggal Masuk</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada pengajuan pinjaman ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const applicantMember = members.find(m => m.id === app.memberId);

                    return (
                      <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{app.applicationNo}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white text-sm">{app.memberName}</p>
                          <p className="text-[10px] text-slate-400">No: {app.memberNo}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{app.productName}</td>
                        <td className="py-3.5 px-4 text-right">
                          <p className="font-extrabold text-emerald-400">{formatRupiah(app.requestedAmount)}</p>
                          <p className="text-[10px] text-slate-400">{app.requestedTermMonths} Bulan Tenor</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{formatDateIndonesian(app.submittedAt || '')}</td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge status={app.status} />
                        </td>
                        <td className="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                          {(app.status === 'submitted' || app.status === 'under_review') && (
                            <>
                              <Button
                                variant="emerald"
                                size="sm"
                                onClick={() => openDecisionModal(app, 'approve')}
                                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                              >
                                Setujui
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => openDecisionModal(app, 'reject')}
                                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          {(app.status === 'approved' || app.status === 'disbursed' || app.status === 'rejected') && (
                            <span className="text-[11px] text-slate-400 italic">Selesai Ditinjau</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approval / Rejection Decision Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Keputusan Pengajuan — ${selectedApp.applicationNo}`}
          subtitle={`Pemohon: ${selectedApp.memberName} (${selectedApp.memberNo})`}
          maxWidth="xl"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedApp(null)}>Batal</Button>
              <Button
                variant={decisionType === 'approve' ? 'emerald' : 'danger'}
                onClick={handleDecisionSubmit}
              >
                Simpan Keputusan ({decisionType === 'approve' ? 'Setujui' : 'Tolak'})
              </Button>
            </>
          }
        >
          <form className="space-y-5 text-xs text-slate-300">
            {/* Applicant Summary */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white">Ringkasan Pengajuan Anggota:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><span className="text-slate-400 block">Nominal Diminta:</span><strong className="text-emerald-400 text-sm">{formatRupiah(selectedApp.requestedAmount)}</strong></div>
                <div><span className="text-slate-400 block">Tenor Diminta:</span><strong className="text-white text-sm">{selectedApp.requestedTermMonths} Bulan</strong></div>
                <div><span className="text-slate-400 block">Produk Pinjaman:</span><strong className="text-white">{selectedApp.productName}</strong></div>
              </div>
              <p className="text-slate-400 pt-1">Tujuan: <span className="text-white font-medium">{selectedApp.purpose}</span></p>
            </div>

            {decisionType === 'approve' ? (
              <div className="space-y-4 border-t border-slate-800 pt-4">
                <h4 className="font-bold text-sm text-emerald-400">Parameter Final Disetujui (Snapshot Kontrak):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Nominal Disetujui (Rp)"
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    required
                  />
                  <Input
                    label="Tenor Disetujui (Bulan)"
                    type="number"
                    value={approvedTerm}
                    onChange={(e) => setApprovedTerm(e.target.value)}
                    required
                  />
                  <Input
                    label="Bunga Tahun (%)"
                    type="number"
                    step="0.1"
                    value={approvedRate}
                    onChange={(e) => setApprovedRate(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Catatan / Alasan Keputusan ({decisionType === 'approve' ? 'Disetujui' : 'Alasan Penolakan Wajib'})
              </label>
              <textarea
                rows={3}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </MainLayout>
  );
};

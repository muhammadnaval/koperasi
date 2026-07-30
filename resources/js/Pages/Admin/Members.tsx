import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Modal } from '@/Components/UI/Modal';
import { formatRupiah, formatDateIndonesian, maskIdentityNo } from '@/utils/formatters';
import { Users, UserPlus, Search, Eye, EyeOff, Ban, CheckCircle, ShieldAlert } from 'lucide-react';
import { Member } from '@/types';

export const AdminMembers: React.FC = () => {
  const { members, addMember, updateMemberStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Register Member Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identityNo, setIdentityNo] = useState('');
  const [occupation, setOccupation] = useState('Guru PNS');
  const [address, setAddress] = useState('');

  // Selected Member Detail Modal State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Status Change Modal State
  const [statusModalMember, setStatusModalMember] = useState<Member | null>(null);
  const [targetStatus, setTargetStatus] = useState<Member['status']>('active');
  const [statusReason, setStatusReason] = useState('');

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !identityNo) return;
    addMember({
      fullName,
      email,
      phone,
      identityNo,
      occupation,
      address,
    });
    setIsRegisterOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setIdentityNo('');
    setAddress('');
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalMember) return;
    updateMemberStatus(statusModalMember.id, targetStatus, statusReason);
    setStatusModalMember(null);
    setStatusReason('');
  };

  return (
    <MainLayout activePath="/admin/anggota" title="Manajemen Anggota Koperasi" subtitle="Pendaftaran anggota baru, verifikasi status, dan audit profil keanggotaan.">
      <div className="space-y-6">
        {/* Action & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Cari Nama / No Anggota / Email..."
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
                  { value: 'active', label: 'Aktif' },
                  { value: 'pending', label: 'Menunggu' },
                  { value: 'suspended', label: 'Ditangguhkan' },
                  { value: 'inactive', label: 'Nonaktif' },
                ]}
              />
            </div>
          </div>

          <Button
            variant="emerald"
            onClick={() => setIsRegisterOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Registrasi Anggota Baru
          </Button>
        </div>

        {/* Members Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Anggota</th>
                  <th className="py-3 px-4">Nama Lengkap & NIK</th>
                  <th className="py-3 px-4">Kontak & Pekerjaan</th>
                  <th className="py-3 px-4">Tgl Bergabung</th>
                  <th className="py-3 px-4 text-right">Total Simpanan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data anggota ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{m.memberNo}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-sm">{m.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">NIK: {maskIdentityNo(m.identityNo)}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-200">{m.email}</p>
                        <p className="text-[11px] text-slate-400">{m.phone} • {m.occupation}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{formatDateIndonesian(m.joinDate)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{formatRupiah(m.totalSavings)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge status={m.status} />
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMember(m)}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setStatusModalMember(m);
                            setTargetStatus(m.status === 'active' ? 'suspended' : 'active');
                          }}
                        >
                          Status
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Register Member Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Registrasi Anggota Baru"
        subtitle="Nomor anggota unik akan diterbitkan secara otomatis oleh sistem."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRegisterOpen(false)}>Batal</Button>
            <Button variant="emerald" onClick={handleRegisterSubmit}>Simpan Anggota</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Nama Lengkap" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nomor Induk Kependudukan (NIK)" value={identityNo} onChange={(e) => setIdentityNo(e.target.value)} required />
            <Input label="Pekerjaan / Jabatan" value={occupation} onChange={(e) => setOccupation(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Nomor HP / WA" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Alamat Domisili</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </form>
      </Modal>

      {/* Member Detail Modal */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={`Detail Anggota — ${selectedMember.fullName}`}
          subtitle={`No. Anggota: ${selectedMember.memberNo}`}
          maxWidth="2xl"
          footer={<Button variant="secondary" onClick={() => setSelectedMember(null)}>Tutup</Button>}
        >
          <div className="space-y-6 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div><span className="text-slate-400 block">NIK KTP:</span> <span className="font-bold font-mono text-white">{selectedMember.identityNo}</span></div>
              <div><span className="text-slate-400 block">Status:</span> <Badge status={selectedMember.status} /></div>
              <div><span className="text-slate-400 block">Email:</span> <span className="text-white">{selectedMember.email}</span></div>
              <div><span className="text-slate-400 block">Telepon:</span> <span className="text-white">{selectedMember.phone}</span></div>
              <div><span className="text-slate-400 block">Pekerjaan:</span> <span className="text-white">{selectedMember.occupation}</span></div>
              <div><span className="text-slate-400 block">Tgl Bergabung:</span> <span className="text-white">{formatDateIndonesian(selectedMember.joinDate)}</span></div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white">Ringkasan Keuangan Anggota:</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><p className="text-[10px] text-slate-400">Simpanan Pokok</p><p className="font-bold text-white">{formatRupiah(selectedMember.savingsPokok)}</p></div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><p className="text-[10px] text-slate-400">Simpanan Wajib</p><p className="font-bold text-white">{formatRupiah(selectedMember.savingsWajib)}</p></div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800"><p className="text-[10px] text-slate-400">Simpanan Sukarela</p><p className="font-bold text-emerald-400">{formatRupiah(selectedMember.savingsSukarela)}</p></div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Change Modal */}
      {statusModalMember && (
        <Modal
          isOpen={!!statusModalMember}
          onClose={() => setStatusModalMember(null)}
          title={`Ubah Status Keanggotaan — ${statusModalMember.fullName}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setStatusModalMember(null)}>Batal</Button>
              <Button variant="danger" onClick={handleStatusSubmit}>Simpan Perubahan Status</Button>
            </>
          }
        >
          <form className="space-y-4">
            <Select
              label="Pilih Status Baru"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as any)}
              options={[
                { value: 'active', label: 'Aktif' },
                { value: 'pending', label: 'Menunggu' },
                { value: 'suspended', label: 'Ditangguhkan (Suspended)' },
                { value: 'inactive', label: 'Nonaktif (Keluar)' },
              ]}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Alasan Perubahan Status (Wajib untuk Audit Log)
              </label>
              <textarea
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Tuliskan alasan perubahan status..."
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </MainLayout>
  );
};

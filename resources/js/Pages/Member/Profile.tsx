import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { formatDateIndonesian, maskIdentityNo } from '@/utils/formatters';
import { User, Eye, EyeOff, Save, ShieldCheck } from 'lucide-react';

export const MemberProfile: React.FC = () => {
  const { currentUser, members } = useApp();
  const member = members.find(m => m.profileId === currentUser.id) || members[0];

  const [showNik, setShowNik] = useState(false);
  const [phone, setPhone] = useState(member.phone);
  const [address, setAddress] = useState(member.address);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    member.phone = phone;
    member.address = address;
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <MainLayout activePath="/profil" title="Profil Anggota Koperasi" subtitle="Informasi identitas resmi, nomor keanggotaan, dan kontak terdaftar.">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            {member.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold text-white">{member.fullName}</h2>
              <Badge status={member.status} />
            </div>
            <p className="text-xs font-mono text-indigo-400 font-bold">Nomor Anggota: {member.memberNo}</p>
            <p className="text-xs text-slate-400">{member.occupation} • Bergabung sejak {formatDateIndonesian(member.joinDate)}</p>
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" /> Data Identitas & Kontak
            </h3>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Terverifikasi Sistem
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Nama Lengkap Sesuai KTP" value={member.fullName} readOnly className="bg-slate-950/40 text-slate-400" />
            <Input label="Email Utama" value={member.email} readOnly className="bg-slate-950/40 text-slate-400" />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Nomor Induk Kependudukan (NIK)
              </label>
              <div className="relative">
                <Input
                  value={showNik ? member.identityNo : maskIdentityNo(member.identityNo)}
                  readOnly
                  className="bg-slate-950/40 text-slate-400 pr-12 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNik(!showNik)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showNik ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Input label="Pekerjaan / Jabatan" value={member.occupation} readOnly className="bg-slate-950/40 text-slate-400" />

            <Input
              label="Nomor Telepon / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
            />

            <Input
              label="Tanggal Lahir"
              value={formatDateIndonesian(member.birthDate)}
              readOnly
              className="bg-slate-950/40 text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Alamat Lengkap KTP / Domisili
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {isSaved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold">
              ✓ Data kontak berhasil diperbarui.
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button type="submit" variant="emerald" leftIcon={<Save className="w-4 h-4" />}>
              Simpan Perubahan Kontak
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { Building2, Mail, KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';

export const Login: React.FC = () => {
  const { switchRole } = useApp();
  const [email, setEmail] = useState('budi.santoso@mtsn3padang.sch.id');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('123456');
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      switchRole(selectedRole);
      const targetUrl = selectedRole === 'member' ? '/dashboard' : '/admin';
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new Event('popstate'));
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/30">
            <Building2 className="w-8 h-8 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-white">
          KPRI MTsN 3 Kota Padang
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Aplikasi Koperasi Simpan Pinjam Digital
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 backdrop-blur-sm">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <Input
                  label="Email Terdaftar Koperasi"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@mtsn3padang.sch.id"
                  leftAddon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Pilih Peran Masuk (Demo Simulation)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'member', label: 'Anggota Koperasi' },
                    { role: 'staff', label: 'Petugas / Staf' },
                    { role: 'approver', label: 'Manajer Approver' },
                    { role: 'admin', label: 'Admin System' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRole(r.role as UserRole)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        selectedRole === r.role
                          ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="emerald"
                size="lg"
                className="w-full"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Kirim Kode OTP Magic Link
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                <p className="text-xs text-emerald-400 font-semibold">
                  Kode OTP 6 Digit telah dikirimkan ke <br />
                  <span className="text-white font-bold">{email}</span>
                </p>
              </div>

              <div>
                <Input
                  label="Masukkan Kode OTP"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  leftAddon={<KeyRound className="w-4 h-4" />}
                  required
                  className="text-center tracking-widest text-lg font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">Gunakan kode demo: 123456</p>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Verifikasi & Masuk Sesi ({selectedRole.toUpperCase()})
                </Button>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-xs text-slate-400 hover:text-slate-200 py-1"
                >
                  ← Kembali ubah email / peran
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

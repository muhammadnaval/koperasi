import React from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/UI/Button';
import { useApp } from '@/context/AppContext';

export const Unauthorized: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <MainLayout activePath="/unauthorized">
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">403 — Akses Ditolak</h2>
          <p className="text-sm text-slate-400">
            Peran Anda saat ini adalah <span className="text-rose-400 font-bold uppercase">{currentUser.role}</span>. Halaman ini memerlukan hak akses yang lebih tinggi (Staff / Approver / Admin).
          </p>
        </div>
        <div className="pt-4 flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali Halaman Sebelumnya
          </Button>
          <a href="/dashboard">
            <Button variant="primary">Ke Dashboard Utama</Button>
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Modal } from '@/Components/UI/Modal';
import { ShieldCheck, UserCheck, Search, ShieldAlert } from 'lucide-react';
import { UserProfile, UserRole } from '@/types';

export const AdminUsers: React.FC = () => {
  const { users, updateUserRole, members } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('member');

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateUserRole(selectedUser.id, newRole);
    setSelectedUser(null);
  };

  return (
    <MainLayout activePath="/admin/pengguna" title="Pengelolaan Pengguna & Hak Akses (RBAC)" subtitle="Atur peran pengguna (Member, Staff, Approver, Admin) dan tautan ke profil anggota.">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Cari Pengguna / Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftAddon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Email Terdaftar</th>
                  <th className="py-3 px-4">Telepon</th>
                  <th className="py-3 px-4 text-center">Peran (Role)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi RBAC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{u.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-4 text-slate-400">{u.phone}</td>
                    <td className="py-3.5 px-4 text-center"><Badge status={u.role} /></td>
                    <td className="py-3.5 px-4 text-center"><Badge status={u.status} /></td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          setNewRole(u.role);
                        }}
                      >
                        Ubah Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Konfigurasi Peran — ${selectedUser.fullName}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedUser(null)}>Batal</Button>
              <Button variant="emerald" onClick={handleRoleSubmit}>Simpan Peran</Button>
            </>
          }
        >
          <form className="space-y-4">
            <Select
              label="Pilih Peran Hak Akses Baru"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              options={[
                { value: 'member', label: 'Anggota (Member)' },
                { value: 'staff', label: 'Petugas / Staf (Staff)' },
                { value: 'approver', label: 'Manajer Approver (Approver)' },
                { value: 'admin', label: 'Admin System (Admin)' },
              ]}
            />
          </form>
        </Modal>
      )}
    </MainLayout>
  );
};

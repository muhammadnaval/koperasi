import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Modal } from '@/Components/UI/Modal';
import { formatDateIndonesian } from '@/utils/formatters';
import { History, Eye, ShieldCheck } from 'lucide-react';
import { AuditLog } from '@/types';

export const AdminAuditLog: React.FC = () => {
  const { auditLogs } = useApp();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  return (
    <MainLayout activePath="/admin/audit-log" title="Audit Log Operasional" subtitle="Riwayat audit aktivitas finansial, perubahan status, dan keputusan sistem.">
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-3">
            <History className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Log Aktivitas Sistem Realtime</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Aktor & Peran</th>
                  <th className="py-3 px-4">Aksi / Event</th>
                  <th className="py-3 px-4">Entitas & ID</th>
                  <th className="py-3 px-4 text-center">IP Address</th>
                  <th className="py-3 px-4 text-center">Detail Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{log.actorName}</p>
                      <Badge status={log.actorRole} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{log.action}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{log.entityType}</p>
                      <p className="font-mono text-[11px] text-indigo-400">{log.entityId}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">{log.ipAddress}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Lihat JSON Diff
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* JSON Diff Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Detail Audit Log — ${selectedLog.action}`}
          subtitle={`Aktor: ${selectedLog.actorName} (${selectedLog.actorRole.toUpperCase()})`}
          maxWidth="xl"
          footer={<Button variant="secondary" onClick={() => setSelectedLog(null)}>Tutup</Button>}
        >
          <div className="space-y-4 text-xs font-mono">
            <div>
              <p className="font-bold text-rose-400 mb-1">State Sebelum (Before):</p>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto">
                {selectedLog.before ? JSON.stringify(selectedLog.before, null, 2) : 'null'}
              </pre>
            </div>
            <div>
              <p className="font-bold text-emerald-400 mb-1">State Sesudah (After):</p>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto">
                {selectedLog.after ? JSON.stringify(selectedLog.after, null, 2) : 'null'}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { StatCard } from '@/Components/UI/StatCard';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Modal } from '@/Components/UI/Modal';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import { Wallet, ArrowDownLeft, ArrowUpRight, Printer, PlusCircle } from 'lucide-react';

export const MemberSavings: React.FC = () => {
  const { currentUser, members, savingsTransactions, savingsProducts, postSavingsTransaction } = useApp();
  const member = members.find(m => m.profileId === currentUser.id) || members[0];

  const myTransactions = savingsTransactions.filter(t => t.memberId === member.id);
  const [filterType, setFilterType] = useState('all');

  // Withdrawal modal state
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('500000');
  const [withdrawDesc, setWithdrawDesc] = useState('Penarikan simpanan sukarela');
  const [withdrawMethod, setWithdrawMethod] = useState<'kas_tunai' | 'transfer_bank'>('transfer_bank');
  const [withdrawError, setWithdrawError] = useState('');
  const [selectedTxForPrint, setSelectedTxForPrint] = useState<any>(null);

  const filteredTransactions = myTransactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    const amt = parseInt(withdrawAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Nominal penarikan tidak valid');
      return;
    }

    const voluntaryProduct = savingsProducts.find(p => p.type === 'voluntary');
    if (!voluntaryProduct) return;

    const result = postSavingsTransaction({
      memberId: member.id,
      productId: voluntaryProduct.id,
      type: 'withdrawal',
      amount: amt,
      description: withdrawDesc,
      paymentMethod: withdrawMethod,
    });

    if (!result.success) {
      setWithdrawError(result.message);
    } else {
      setIsWithdrawOpen(false);
    }
  };

  return (
    <MainLayout activePath="/simpanan" title="Simpanan Anggota" subtitle="Kelola saldo simpanan pokok, simpanan wajib, dan simpanan sukarela Anda.">
      <div className="space-y-8">
        {/* Stat Cards Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Saldo Simpanan"
            value={formatRupiah(member.totalSavings)}
            subtitle="Seluruh Produk Simpanan"
            gradient="emerald"
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="Simpanan Pokok"
            value={formatRupiah(member.savingsPokok)}
            subtitle="Setoran Awal Reguler"
            gradient="indigo"
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="Simpanan Wajib"
            value={formatRupiah(member.savingsWajib)}
            subtitle="Rp 50.000 / bulan"
            gradient="purple"
            icon={<Wallet className="w-6 h-6" />}
          />
          <StatCard
            title="Simpanan Sukarela"
            value={formatRupiah(member.savingsSukarela)}
            subtitle="Saldo Siap Tarik"
            gradient="cyan"
            icon={<Wallet className="w-6 h-6" />}
          />
        </div>

        {/* Voluntary Withdrawal Button */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div>
            <h4 className="font-bold text-sm text-white">Penarikan Simpanan Sukarela</h4>
            <p className="text-xs text-slate-400">Saldo minimal yang wajib disisakan sebesar Rp 50.000</p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => setIsWithdrawOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Tarik Simpanan Sukarela
          </Button>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> Histori Mutasi Simpanan
            </h3>
            <div className="w-full sm:w-48">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua Jenis Mutasi' },
                  { value: 'deposit', label: 'Setoran Masuk (+)' },
                  { value: 'withdrawal', label: 'Penarikan (-)' },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Referensi</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Jenis & Deskripsi</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada transaksi simpanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{tx.referenceNo}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{formatDateIndonesian(tx.transactionDate)}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{tx.productName}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-lg ${tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {tx.type === 'deposit' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </span>
                          <span className="truncate max-w-xs">{tx.description}</span>
                        </div>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-extrabold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge status={tx.status} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTxForPrint(tx)}
                          leftIcon={<Printer className="w-3.5 h-3.5" />}
                        >
                          Cetak
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

      {/* Voluntary Withdrawal Modal */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Penarikan Simpanan Sukarela"
        subtitle={`Saldo Sukarela Saat Ini: ${formatRupiah(member.savingsSukarela)}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsWithdrawOpen(false)}>
              Batal
            </Button>
            <Button variant="emerald" onClick={handleWithdrawSubmit}>
              Konfirmasi Penarikan
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Nominal Penarikan (Rp)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            error={withdrawError}
            required
          />

          <Select
            label="Metode Pembayaran Pencairan"
            value={withdrawMethod}
            onChange={(e) => setWithdrawMethod(e.target.value as any)}
            options={[
              { value: 'transfer_bank', label: 'Transfer Rekening Bank' },
              { value: 'kas_tunai', label: 'Kas Tunai Kantor Koperasi' },
            ]}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Alasan / Keterangan Penarikan
            </label>
            <textarea
              rows={2}
              value={withdrawDesc}
              onChange={(e) => setWithdrawDesc(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Voucher Modal */}
      {selectedTxForPrint && (
        <Modal
          isOpen={!!selectedTxForPrint}
          onClose={() => setSelectedTxForPrint(null)}
          title="Bukti Transaksi Simpanan"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedTxForPrint(null)}>
                Tutup
              </Button>
              <Button variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                Cetak Cetakan
              </Button>
            </>
          }
        >
          <div className="print-card p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs font-sans">
            <div className="text-center border-b border-slate-800 pb-4">
              <h3 className="font-extrabold text-base text-white uppercase tracking-wider">KPRI MTsN 3 Kota Padang</h3>
              <p className="text-slate-400">BUKTI TRANSAKSI MUTASI SIMPANAN</p>
              <p className="font-mono text-indigo-400 font-bold mt-1">{selectedTxForPrint.referenceNo}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px]">Nama Anggota:</span>
                <span className="font-bold text-white">{selectedTxForPrint.memberName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tanggal Transaksi:</span>
                <span className="font-bold text-white">{formatDateIndonesian(selectedTxForPrint.transactionDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Jenis Produk:</span>
                <span className="font-bold text-white">{selectedTxForPrint.productName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Jenis Transaksi:</span>
                <span className="font-bold uppercase text-emerald-400">{selectedTxForPrint.type}</span>
              </div>
            </div>

            <div className="border-t border-b border-slate-800 py-3 flex justify-between items-center">
              <span className="font-bold text-slate-300">Jumlah Nominal:</span>
              <span className="text-lg font-extrabold text-emerald-400">{formatRupiah(selectedTxForPrint.amount)}</span>
            </div>

            <p className="text-[11px] text-slate-400 italic">Keterangan: {selectedTxForPrint.description}</p>
            <p className="text-[10px] text-slate-500 text-right">Diposting oleh: {selectedTxForPrint.postedBy}</p>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

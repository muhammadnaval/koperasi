import React, { useState } from 'react';
import { MainLayout } from '@/Layouts/MainLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Modal } from '@/Components/UI/Modal';
import { formatRupiah, formatDateIndonesian } from '@/utils/formatters';
import {
  Wallet, PlusCircle, Printer, XCircle, Search,
  Package, ToggleLeft, ToggleRight, Pencil, CheckCircle, AlertCircle,
} from 'lucide-react';
import { SavingsTransaction, SavingsTransactionType, SavingsProduct, SavingsType } from '@/types';

export const AdminSavings: React.FC = () => {
  const {
    members, savingsProducts, savingsTransactions,
    postSavingsTransaction, voidSavingsTransaction,
    saveSavingsProduct, toggleProductActive,
  } = useApp();

  // ── Active Tab ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'transactions' | 'products'>('transactions');

  // ── Transaction Filters ──────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  // ── Record Transaction Modal ─────────────────────────────────
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(savingsProducts[0]?.id || '');
  const [txType, setTxType] = useState<SavingsTransactionType>('deposit');
  const [amount, setAmount] = useState('50000');
  const [description, setDescription] = useState('Setoran Simpanan Wajib Bulanan');
  const [paymentMethod, setPaymentMethod] = useState<'kas_tunai' | 'transfer_bank'>('kas_tunai');
  const [recordError, setRecordError] = useState('');

  // ── Void Modal ───────────────────────────────────────────────
  const [voidTx, setVoidTx] = useState<SavingsTransaction | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // ── Print Receipt Modal ──────────────────────────────────────
  const [printTx, setPrintTx] = useState<SavingsTransaction | null>(null);

  // ── Add / Edit Product Modal ─────────────────────────────────
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SavingsProduct | null>(null);
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    type: 'voluntary' as SavingsType,
    defaultAmount: '50000',
    minimumBalance: '0',
    description: '',
  });
  const [productFormError, setProductFormError] = useState('');

  // ── Helpers ──────────────────────────────────────────────────
  const typeLabelMap: Record<SavingsType, string> = {
    principal: 'Simpanan Pokok',
    mandatory: 'Simpanan Wajib',
    voluntary: 'Simpanan Sukarela',
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ code: '', name: '', type: 'voluntary', defaultAmount: '50000', minimumBalance: '0', description: '' });
    setProductFormError('');
    setProductModalOpen(true);
  };

  const openEditProduct = (p: SavingsProduct) => {
    setEditingProduct(p);
    setProductForm({
      code: p.code,
      name: p.name,
      type: p.type,
      defaultAmount: String(p.defaultAmount),
      minimumBalance: String(p.minimumBalance),
      description: p.description || '',
    });
    setProductFormError('');
    setProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');

    if (!productForm.code.trim()) { setProductFormError('Kode produk wajib diisi.'); return; }
    if (!productForm.name.trim()) { setProductFormError('Nama produk wajib diisi.'); return; }

    const defAmt = parseInt(productForm.defaultAmount, 10);
    const minBal = parseInt(productForm.minimumBalance, 10);
    if (isNaN(defAmt) || defAmt < 0) { setProductFormError('Nominal default harus berupa angka positif.'); return; }
    if (isNaN(minBal) || minBal < 0) { setProductFormError('Saldo minimum harus berupa angka positif.'); return; }

    const codeExists = savingsProducts.some(
      p => p.code.toLowerCase() === productForm.code.trim().toLowerCase() && p.id !== editingProduct?.id
    );
    if (codeExists) {
      setProductFormError(`Kode produk "${productForm.code}" sudah digunakan oleh produk lain.`);
      return;
    }

    saveSavingsProduct({
      ...(editingProduct ? { id: editingProduct.id } : {}),
      code: productForm.code.trim().toUpperCase(),
      name: productForm.name.trim(),
      type: productForm.type,
      defaultAmount: defAmt,
      minimumBalance: minBal,
      description: productForm.description.trim(),
    });

    setProductModalOpen(false);
  };

  // ── Transaction Handlers ─────────────────────────────────────
  const filteredTransactions = savingsTransactions.filter(t => {
    const matchesSearch =
      t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesProduct = productFilter === 'all' || t.productId === productFilter;
    return matchesSearch && matchesStatus && matchesProduct;
  });

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecordError('');
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) {
      setRecordError('Nominal transaksi harus lebih besar dari Rp 0');
      return;
    }
    const res = postSavingsTransaction({ memberId: selectedMemberId, productId: selectedProductId, type: txType, amount: amt, description, paymentMethod });
    if (!res.success) {
      setRecordError(res.message);
    } else {
      setIsRecordOpen(false);
    }
  };

  const handleVoidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidTx || !voidReason) return;
    voidSavingsTransaction(voidTx.id, voidReason);
    setVoidTx(null);
    setVoidReason('');
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <MainLayout activePath="/admin/simpanan" title="Simpanan Koperasi" subtitle="Kelola produk simpanan dan catat transaksi setoran / penarikan anggota.">
      <div className="space-y-6">

        {/* ── Tab Bar & Primary Actions ──────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl">
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-2xl gap-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" /> Daftar Transaksi
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" /> Produk Simpanan
              <span className="bg-slate-700 text-slate-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {savingsProducts.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'transactions' ? (
              <Button variant="emerald" onClick={() => setIsRecordOpen(true)} leftIcon={<PlusCircle className="w-4 h-4" />}>
                Catat Setoran / Penarikan
              </Button>
            ) : (
              <Button variant="emerald" onClick={openAddProduct} leftIcon={<PlusCircle className="w-4 h-4" />}>
                Tambah Produk Simpanan
              </Button>
            )}
          </div>
        </div>

        {/* ── TAB: TRANSAKSI ─────────────────────────────────── */}
        {activeTab === 'transactions' && (
          <>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Cari Ref / Nama..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftAddon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="w-44">
                <Select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Semua Produk' },
                    ...savingsProducts.map(p => ({ value: p.id, label: p.name })),
                  ]}
                />
              </div>
              <div className="w-40">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Semua Status' },
                    { value: 'posted', label: 'Posted' },
                    { value: 'void', label: 'Void / Batal' },
                  ]}
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">No. Referensi</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Anggota</th>
                      <th className="py-3 px-4">Produk & Jenis</th>
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
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{tx.referenceNo}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">{formatDateIndonesian(tx.transactionDate)}</td>
                          <td className="py-3.5 px-4 font-semibold text-white">{tx.memberName}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-200">{tx.productName}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{tx.type} • {tx.paymentMethod}</p>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-extrabold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}{formatRupiah(tx.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge status={tx.status} />
                          </td>
                          <td className="py-3.5 px-4 text-center space-x-1.5">
                            <Button variant="ghost" size="sm" onClick={() => setPrintTx(tx)} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                              Cetak
                            </Button>
                            {tx.status === 'posted' && (
                              <Button variant="danger" size="sm" onClick={() => setVoidTx(tx)} leftIcon={<XCircle className="w-3.5 h-3.5" />}>
                                Void
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── TAB: PRODUK SIMPANAN ──────────────────────────── */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Summary Bar */}
            <div className="grid grid-cols-3 gap-4">
              {(['principal', 'mandatory', 'voluntary'] as SavingsType[]).map(type => {
                const prod = savingsProducts.find(p => p.type === type);
                const borderColor: Record<SavingsType, string> = {
                  principal: 'border-l-indigo-500',
                  mandatory: 'border-l-amber-500',
                  voluntary: 'border-l-emerald-500',
                };
                return (
                  <div key={type} className={`bg-slate-900 border border-slate-800 border-l-4 ${borderColor[type]} rounded-2xl p-4`}>
                    <p className="text-[10px] font-bold uppercase text-slate-400">{typeLabelMap[type]}</p>
                    <p className="text-lg font-black text-white mt-1">{prod ? prod.name : '—'}</p>
                    <p className={`text-xs font-bold mt-1 ${prod?.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {prod ? (prod.isActive ? '● Aktif' : '○ Nonaktif') : 'Belum dibuat'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {savingsProducts.map(p => {
                const typeStyles: Record<SavingsType, { badge: string; border: string; icon: string }> = {
                  principal: {
                    badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
                    border: 'border-indigo-500/40',
                    icon: 'text-indigo-400',
                  },
                  mandatory: {
                    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                    border: 'border-amber-500/40',
                    icon: 'text-amber-400',
                  },
                  voluntary: {
                    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                    border: 'border-emerald-500/40',
                    icon: 'text-emerald-400',
                  },
                };
                const tc = typeStyles[p.type];
                return (
                  <div
                    key={p.id}
                    className={`bg-slate-900 border ${tc.border} rounded-3xl p-5 shadow-xl space-y-4 flex flex-col transition-opacity ${!p.isActive ? 'opacity-60' : ''}`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-slate-800 ${tc.icon}`}>
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-white leading-tight">{p.name}</p>
                          <p className="font-mono text-[10px] text-slate-400 mt-0.5">{p.code}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.badge}`}>
                          {typeLabelMap[p.type]}
                        </span>
                        {p.isActive ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                            <CheckCircle className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                            <AlertCircle className="w-3 h-3" /> Nonaktif
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="space-y-2 border-t border-slate-800 pt-3 flex-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Nominal Default</span>
                        <span className="font-bold text-white">{formatRupiah(p.defaultAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Saldo Minimum</span>
                        <span className="font-bold text-white">{formatRupiah(p.minimumBalance)}</span>
                      </div>
                      {p.description && (
                        <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2">
                          {p.description}
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                      <Button variant="outline" size="sm" onClick={() => openEditProduct(p)} leftIcon={<Pencil className="w-3.5 h-3.5" />}>
                        Edit
                      </Button>
                      <Button
                        variant={p.isActive ? 'danger' : 'secondary'}
                        size="sm"
                        onClick={() => toggleProductActive('savings', p.id)}
                        leftIcon={p.isActive ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                      >
                        {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Add Card */}
              <button
                onClick={openAddProduct}
                className="bg-slate-900/40 border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-900 rounded-3xl p-5 text-slate-500 hover:text-indigo-400 flex flex-col items-center justify-center gap-2 transition-all min-h-[200px] group"
              >
                <PlusCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Tambah Produk Baru</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Modal: Tambah / Edit Produk Simpanan ─────────────── */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? `Edit Produk — ${editingProduct.name}` : 'Tambah Produk Simpanan Baru'}
        subtitle={
          editingProduct
            ? 'Perubahan tidak mengubah histori transaksi yang sudah diposting.'
            : 'Kode & nama produk harus unik. Produk aktif dapat langsung dipakai untuk transaksi.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setProductModalOpen(false)}>Batal</Button>
            <Button variant="emerald" onClick={handleProductSubmit}>
              {editingProduct ? 'Simpan Perubahan' : 'Buat Produk Simpanan'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleProductSubmit}>
          {productFormError && (
            <p className="text-xs text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
              {productFormError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kode Produk"
              placeholder="Contoh: SP-SUKARELA-2"
              value={productForm.code}
              onChange={e => setProductForm(f => ({ ...f, code: e.target.value }))}
              required
            />
            <Input
              label="Nama Produk"
              placeholder="Contoh: Simpanan Hari Raya"
              value={productForm.name}
              onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <Select
            label="Jenis Simpanan"
            value={productForm.type}
            onChange={e => setProductForm(f => ({ ...f, type: e.target.value as SavingsType }))}
            options={[
              { value: 'principal', label: 'Simpanan Pokok — Sekali saat mendaftar' },
              { value: 'mandatory', label: 'Simpanan Wajib — Rutin bulanan' },
              { value: 'voluntary', label: 'Simpanan Sukarela — Fleksibel (dapat ditarik)' },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nominal Default (Rp)"
              type="number"
              placeholder="50000"
              value={productForm.defaultAmount}
              onChange={e => setProductForm(f => ({ ...f, defaultAmount: e.target.value }))}
              required
            />
            <Input
              label="Saldo Minimum (Rp)"
              type="number"
              placeholder="0"
              value={productForm.minimumBalance}
              onChange={e => setProductForm(f => ({ ...f, minimumBalance: e.target.value }))}
              helperText="Saldo minimum yang tidak boleh ditarik (untuk sukarela)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Deskripsi Produk <span className="text-slate-500 normal-case font-normal">(opsional)</span>
            </label>
            <textarea
              rows={2}
              value={productForm.description}
              onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Jelaskan kegunaan dan kebijakan produk simpanan ini..."
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 text-[11px] text-indigo-300 leading-relaxed">
            💡 <strong>Catatan:</strong> Produk yang sudah memiliki transaksi <em>posted</em> tidak dapat dihapus, hanya dapat dinonaktifkan. Produk nonaktif tidak dapat dipakai untuk transaksi baru.
          </div>
        </form>
      </Modal>

      {/* ── Modal: Catat Setoran / Penarikan ─────────────────── */}
      <Modal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        title="Input Transaksi Simpanan Baru"
        subtitle="Nomor referensi SIM-202607-XXXXXX akan diterbitkan otomatis."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRecordOpen(false)}>Batal</Button>
            <Button variant="emerald" onClick={handleRecordSubmit}>Post Transaksi</Button>
          </>
        }
      >
        <form className="space-y-4">
          {recordError && (
            <p className="text-xs text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
              {recordError}
            </p>
          )}

          <Select
            label="Pilih Anggota Koperasi"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            options={members.map(m => ({ value: m.id, label: `${m.memberNo} — ${m.fullName}` }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Produk Simpanan"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={savingsProducts.filter(p => p.isActive).map(p => ({ value: p.id, label: p.name }))}
            />
            <Select
              label="Jenis Transaksi"
              value={txType}
              onChange={(e) => setTxType(e.target.value as SavingsTransactionType)}
              options={[
                { value: 'deposit', label: 'Setoran Simpanan (+)' },
                { value: 'withdrawal', label: 'Penarikan Simpanan (-)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nominal (Rp)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Select
              label="Metode Kas / Bank"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'kas_tunai' | 'transfer_bank')}
              options={[
                { value: 'kas_tunai', label: 'Kas Tunai Operasional' },
                { value: 'transfer_bank', label: 'Transfer Rekening Bank BNI' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Keterangan Transaksi</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </form>
      </Modal>

      {/* ── Modal: Void Transaksi ─────────────────────────────── */}
      {voidTx && (
        <Modal
          isOpen={!!voidTx}
          onClose={() => setVoidTx(null)}
          title={`Void Transaksi — ${voidTx.referenceNo}`}
          subtitle="Transaksi yang sudah diposting tidak dihapus, melainkan dibatalkan dengan catatan reversal."
          footer={
            <>
              <Button variant="secondary" onClick={() => setVoidTx(null)}>Batal</Button>
              <Button variant="danger" onClick={handleVoidSubmit}>Konfirmasi Void Transaksi</Button>
            </>
          }
        >
          <form className="space-y-4">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <p><span className="text-slate-400">Anggota:</span> <strong className="text-white">{voidTx.memberName}</strong></p>
              <p><span className="text-slate-400">Nominal:</span> <strong className="text-rose-400">{formatRupiah(voidTx.amount)}</strong></p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Alasan Pembatalan / Void (Wajib Alasan Operasional)
              </label>
              <textarea
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Jelaskan alasan void..."
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Print Receipt ──────────────────────────────── */}
      {printTx && (
        <Modal
          isOpen={!!printTx}
          onClose={() => setPrintTx(null)}
          title="Voucher Bukti Transaksi Cetak"
          footer={
            <>
              <Button variant="secondary" onClick={() => setPrintTx(null)}>Tutup</Button>
              <Button variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>Cetak Bukti</Button>
            </>
          }
        >
          <div className="print-card p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs font-sans">
            <div className="text-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">KPRI MTsN 3 KOTA PADANG</h3>
              <p className="text-slate-400 text-[10px]">BUKTI PENERIMAAN / PENARIKAN SIMPANAN</p>
              <p className="font-mono text-indigo-400 font-bold text-sm mt-1">{printTx.referenceNo}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-slate-400 text-[10px] block">Anggota:</span><span className="font-bold text-white">{printTx.memberName}</span></div>
              <div><span className="text-slate-400 text-[10px] block">Tanggal:</span><span className="font-bold text-white">{formatDateIndonesian(printTx.transactionDate)}</span></div>
              <div><span className="text-slate-400 text-[10px] block">Produk:</span><span className="font-bold text-white">{printTx.productName}</span></div>
              <div><span className="text-slate-400 text-[10px] block">Metode:</span><span className="font-bold uppercase text-white">{printTx.paymentMethod}</span></div>
            </div>
            <div className="border-t border-b border-slate-800 py-3 flex justify-between items-center">
              <span className="font-bold">Total Nominal:</span>
              <span className="text-xl font-extrabold text-emerald-400">{formatRupiah(printTx.amount)}</span>
            </div>
            <p className="text-[10px] text-slate-400">Petugas Pemroses: {printTx.createdBy}</p>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

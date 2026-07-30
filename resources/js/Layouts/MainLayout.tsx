import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { Badge } from '@/Components/UI/Badge';
import { 
  Building2, 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  FileText, 
  Users, 
  Package, 
  PieChart, 
  ShieldCheck, 
  History, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  BookOpen,
  Pin,
  PinOff,
  Sliders
} from 'lucide-react';

import { ToastContainer } from '@/Components/UI/Toast';

export interface MainLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  title?: string;
  subtitle?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activePath = '/dashboard',
  title,
  subtitle,
}) => {
  const { currentUser, switchRole, notifications, markNotificationRead, markAllNotificationsRead, toasts, removeToast } = useApp();
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead);
  const isMember = currentUser.role === 'member';

  const memberNav = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Simpanan Saya', path: '/simpanan', icon: <Wallet className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Pinjaman Saya', path: '/pinjaman', icon: <CreditCard className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Profil Saya', path: '/profil', icon: <User className="w-5 h-5 flex-shrink-0" /> },
  ];

  const adminNav = [
    { label: 'Dashboard Admin', path: '/admin', icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Anggota', path: '/admin/anggota', icon: <Users className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Simpanan', path: '/admin/simpanan', icon: <Wallet className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Pengajuan Pinjaman', path: '/admin/pengajuan', icon: <FileText className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Pinjaman & Pencairan', path: '/admin/pinjaman', icon: <CreditCard className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Pembayaran Angsuran', path: '/admin/angsuran', icon: <CreditCard className="w-5 h-5 text-emerald-400 flex-shrink-0" /> },
    { label: 'Produk Koperasi', path: '/admin/produk', icon: <Package className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Pengaturan Denda', path: '/admin/pengaturan', icon: <Sliders className="w-5 h-5 text-amber-400 flex-shrink-0" /> },
    { label: 'Laporan Hub', path: '/admin/laporan', icon: <PieChart className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Akuntansi (GL & SHU)', path: '/admin/akuntansi', icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Pengguna & Role', path: '/admin/pengguna', icon: <ShieldCheck className="w-5 h-5 flex-shrink-0" /> },
    { label: 'Audit Log', path: '/admin/audit-log', icon: <History className="w-5 h-5 flex-shrink-0" /> },
  ];

  const activeNav = isMember ? memberNav : adminNav;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Simulation Bar */}
      <div className="no-print bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border-b border-indigo-500/20 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 z-50 relative">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-indigo-200">Mode Simulasi Frontend (PRD v1.2):</span>
          <span className="text-slate-300">Ganti Peran Pengguna untuk Menguji Hak Akses</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {(['member', 'staff', 'approver', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs uppercase tracking-wider ${
                currentUser.role === r
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Top Header (no sidebar-shift, always full width) */}
      <header className="no-print bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile Toggle & Logo */}
            <div className="flex items-center gap-4">
              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo (offset for sidebar on desktop) */}
              <div className="flex items-center gap-3 lg:pl-[4.5rem]">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                  <Building2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                    KPRI MTsN 3 Kota Padang
                    <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      Koperasi
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-400">Sistem Simpan Pinjam Digital</p>
                </div>
              </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => { setIsNotifOpen(!isNotifOpen); setIsUserMenuOpen(false); }}
                  className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                  aria-label="Notifikasi"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white animate-bounce">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-400" /> Notifikasi System
                      </h4>
                      {unreadNotifs.length > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-xs text-indigo-400 hover:underline font-medium">
                          Tandai Semua Dibaca
                        </button>
                      )}
                    </div>
                    <div className="space-y-2.5 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Tidak ada notifikasi.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                              n.isRead
                                ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                                : 'bg-indigo-950/30 border-indigo-500/30 text-slate-200 font-medium'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-indigo-300">{n.title}</span>
                              <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                            <p className="leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar Badge */}
              <div className="relative">
                <button
                  onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotifOpen(false); }}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all"
                >
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-inner">
                    {currentUser.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-200 leading-none">{currentUser.fullName.split(',')[0]}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{currentUser.role}</p>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-3">
                    <div className="px-3 py-2 border-b border-slate-800 mb-2">
                      <p className="font-bold text-xs text-white">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <div className="mt-1.5">
                        <Badge status={currentUser.role} />
                      </div>
                    </div>
                    <a href="/profil" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                      <User className="w-4 h-4" /> Edit Profil Saya
                    </a>
                    <a href="/login" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Keluar Sesi
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Body */}
      <div className="flex flex-1 relative">

        {/* ── DESKTOP AUTOHIDE SIDEBAR (CSS group-hover driven) ── */}
        <aside
          className={`
            no-print hidden lg:flex flex-col
            fixed top-[calc(2.25rem+4rem)] left-0 bottom-0 z-30
            bg-slate-900 border-r border-slate-800 shadow-2xl
            transition-all duration-300 ease-in-out
            ${isSidebarPinned ? 'w-64' : 'w-16 hover:w-64'}
            group/sidebar
          `}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-b border-slate-800/80 flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              {isMember ? <User className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div className="flex-1 overflow-hidden opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              <p className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                {isMember ? 'Menu Anggota' : 'Menu Pengurus'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isSidebarPinned ? 'Sidebar Terpasang' : 'Auto-Hide Aktif'}
              </p>
            </div>
            <button
              onClick={() => setIsSidebarPinned(!isSidebarPinned)}
              title={isSidebarPinned ? 'Lepas Pin Sidebar' : 'Pin Sidebar'}
              className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity text-slate-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-slate-800 flex-shrink-0"
            >
              {isSidebarPinned
                ? <Pin className="w-4 h-4 text-indigo-400" />
                : <PinOff className="w-4 h-4" />
              }
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1 mt-1">
            {activeNav.map((nav) => {
              const isActive = activePath === nav.path;
              return (
                <a
                  key={nav.path}
                  href={nav.path}
                  title={nav.label}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold
                    transition-all duration-150 relative overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                    }
                  `}
                >
                  {/* Icon always visible */}
                  <span className="flex-shrink-0">{nav.icon}</span>
                  {/* Label reveals on hover/pinned */}
                  <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                    {nav.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Footer User Info */}
          <div className="p-2 border-t border-slate-800/80">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                {currentUser.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 overflow-hidden whitespace-nowrap">
                <p className="text-xs font-bold text-white">{currentUser.fullName.split(',')[0]}</p>
                <p className="text-[10px] text-emerald-400 font-semibold capitalize tracking-wider">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer (Overlay) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-72 bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black">
                    <Building2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">MTsN 3 Kota Padang</h3>
                    <p className="text-[10px] text-slate-400">Navigasi Koperasi</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {activeNav.map((nav) => (
                  <a
                    key={nav.path}
                    href={nav.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                      activePath === nav.path
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">{nav.icon}{nav.label}</div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </a>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-800">
                <a href="/login" className="flex items-center gap-2 w-full p-3 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 justify-center">
                  <LogOut className="w-4 h-4" /> Keluar Sesi
                </a>
              </div>
            </div>
            <div className="flex-1 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* Main Page Content — offset by collapsed sidebar width on desktop */}
        <main className="flex-1 min-w-0 lg:pl-16 px-4 sm:px-6 lg:pr-8 py-8 transition-all duration-300 max-w-full">
          {(title || subtitle) && (
            <div className="mb-8 border-b border-slate-800/80 pb-5 no-print">
              {title && <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{title}</h2>}
              {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="no-print bg-slate-950 border-t border-slate-800/80 py-6 text-xs text-slate-400 lg:pl-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KPRI MTsN 3 Kota Padang — Koperasi Simpan Pinjam Digital.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Zona Waktu: Asia/Jakarta (WIB)</span>
            <span>•</span>
            <span>Laravel 13 + React 19 + TypeScript</span>
          </div>
        </div>
      </footer>

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

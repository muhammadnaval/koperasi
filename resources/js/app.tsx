import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '@/../css/app.css';
import { AppProvider } from '@/context/AppContext';

// Auth Pages
import { Login } from '@/Pages/Auth/Login';
import { Unauthorized } from '@/Pages/Auth/Unauthorized';

// Member Pages
import { MemberDashboard } from '@/Pages/Member/Dashboard';
import { MemberProfile } from '@/Pages/Member/Profile';
import { MemberSavings } from '@/Pages/Member/Savings';
import { MemberLoans } from '@/Pages/Member/Loans';
import { MemberLoanApply } from '@/Pages/Member/LoanApply';
import { MemberLoanDetail } from '@/Pages/Member/LoanDetail';

// Admin Pages
import { AdminDashboard } from '@/Pages/Admin/Dashboard';
import { AdminMembers } from '@/Pages/Admin/Members';
import { AdminSavings } from '@/Pages/Admin/Savings';
import { AdminLoanApplications } from '@/Pages/Admin/LoanApplications';
import { AdminLoans } from '@/Pages/Admin/Loans';
import { AdminInstallments } from '@/Pages/Admin/Installments';
import { AdminProducts } from '@/Pages/Admin/Products';
import { AdminSettings } from '@/Pages/Admin/Settings';
import { AdminReports } from '@/Pages/Admin/Reports';
import { AdminAccounting } from '@/Pages/Admin/Accounting';
import { AdminUsers } from '@/Pages/Admin/Users';
import { AdminAuditLog } from '@/Pages/Admin/AuditLog';

const Router: React.FC = () => {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);

    // Intercept internal link clicks for single-page app navigation
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        const href = anchor.getAttribute('href')!;
        window.history.pushState({}, '', href);
        setPathname(href);
      }
    };
    document.addEventListener('click', handleLinkClick);

    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  // Route matching logic
  const renderRoute = () => {
    if (pathname === '/login') return <Login />;
    if (pathname === '/unauthorized') return <Unauthorized />;

    // Member Routes
    if (pathname === '/dashboard') return <MemberDashboard />;
    if (pathname === '/profil') return <MemberProfile />;
    if (pathname === '/simpanan') return <MemberSavings />;
    if (pathname === '/pinjaman') return <MemberLoans />;
    if (pathname === '/pinjaman/ajukan') return <MemberLoanApply />;
    if (pathname.startsWith('/pinjaman/')) return <MemberLoanDetail loanId={pathname.replace('/pinjaman/', '')} />;

    // Admin Routes
    if (pathname === '/admin') return <AdminDashboard />;
    if (pathname === '/admin/anggota' || pathname.startsWith('/admin/anggota/')) return <AdminMembers />;
    if (pathname === '/admin/simpanan') return <AdminSavings />;
    if (pathname === '/admin/pengajuan' || pathname.startsWith('/admin/pengajuan/')) return <AdminLoanApplications />;
    if (pathname === '/admin/pinjaman' || pathname.startsWith('/admin/pinjaman/')) return <AdminLoans />;
    if (pathname === '/admin/angsuran') return <AdminInstallments />;
    if (pathname === '/admin/produk') return <AdminProducts />;
    if (pathname === '/admin/pengaturan') return <AdminSettings />;
    if (pathname === '/admin/laporan') return <AdminReports />;
    if (pathname === '/admin/akuntansi') return <AdminAccounting />;
    if (pathname === '/admin/pengguna') return <AdminUsers />;
    if (pathname === '/admin/audit-log') return <AdminAuditLog />;

    // Default fallback to Member Dashboard
    return <MemberDashboard />;
  };

  return <AppProvider>{renderRoute()}</AppProvider>;
};

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<Router />);
}

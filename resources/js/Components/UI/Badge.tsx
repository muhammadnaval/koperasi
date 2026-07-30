import React from 'react';
import { clsx } from 'clsx';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  UserCheck, 
  Ban, 
  DollarSign, 
  FileText 
} from 'lucide-react';

export type BadgeVariant = 
  | 'active' 
  | 'pending' 
  | 'suspended' 
  | 'inactive' 
  | 'posted' 
  | 'void' 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'disbursed' 
  | 'paid' 
  | 'partial' 
  | 'overdue' 
  | 'paid_off' 
  | 'admin' 
  | 'approver' 
  | 'staff' 
  | 'member';

interface BadgeConfig {
  label: string;
  className: string;
  icon: React.ReactNode;
}

const badgeConfigs: Record<BadgeVariant, BadgeConfig> = {
  active: {
    label: 'Aktif',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  pending: {
    label: 'Menunggu',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: <Clock className="w-3 h-3" />,
  },
  suspended: {
    label: 'Ditangguhkan',
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    icon: <Ban className="w-3 h-3" />,
  },
  inactive: {
    label: 'Nonaktif',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    icon: <XCircle className="w-3 h-3" />,
  },
  posted: {
    label: 'Posted',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  void: {
    label: 'Void / Batal',
    className: 'bg-slate-500/20 text-slate-400 border-slate-600/40 line-through',
    icon: <XCircle className="w-3 h-3" />,
  },
  draft: {
    label: 'Draft',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    icon: <FileText className="w-3 h-3" />,
  },
  submitted: {
    label: 'Dikirim',
    className: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    icon: <Clock className="w-3 h-3" />,
  },
  under_review: {
    label: 'Ditinjau',
    className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    icon: <Clock className="w-3 h-3" />,
  },
  approved: {
    label: 'Disetujui',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    icon: <XCircle className="w-3 h-3" />,
  },
  disbursed: {
    label: 'Dicairkan',
    className: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    icon: <DollarSign className="w-3 h-3" />,
  },
  paid: {
    label: 'Lunas',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  partial: {
    label: 'Bayar Sebagian',
    className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    icon: <Clock className="w-3 h-3" />,
  },
  overdue: {
    label: 'Menunggak',
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  paid_off: {
    label: 'Selesai Lunas',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  admin: {
    label: 'Admin System',
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    icon: <Shield className="w-3 h-3" />,
  },
  approver: {
    label: 'Approver / Manajer',
    className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    icon: <UserCheck className="w-3 h-3" />,
  },
  staff: {
    label: 'Petugas / Staf',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: <UserCheck className="w-3 h-3" />,
  },
  member: {
    label: 'Anggota',
    className: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    icon: <UserCheck className="w-3 h-3" />,
  },
};

export interface BadgeProps {
  status: BadgeVariant | string;
  customLabel?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, customLabel, className }) => {
  const config = badgeConfigs[status as BadgeVariant] || {
    label: customLabel || status,
    className: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: null,
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm',
        config.className,
        className
      )}
    >
      {config.icon}
      {customLabel || config.label}
    </span>
  );
};

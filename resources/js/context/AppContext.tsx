import React, { createContext, useContext, useState } from 'react';
import { 
  UserProfile, 
  UserRole,
  Member, 
  SavingsProduct, 
  SavingsTransaction, 
  LoanProduct, 
  LoanApplication, 
  Loan, 
  Payment, 
  AuditLog, 
  AppNotification, 
  Account, 
  JournalEntry,
  SavingsTransactionType,
  PenaltySettings
} from '@/types';
import { 
  mockUsers, 
  mockMembers, 
  mockSavingsProducts, 
  mockSavingsTransactions, 
  mockLoanProducts, 
  mockLoanApplications, 
  mockLoans, 
  mockPayments, 
  mockAuditLogs, 
  mockNotifications, 
  mockAccounts, 
  mockJournalEntries,
  mockPenaltySettings
} from '@/data/mockData';
import { calculateFlatLoan, allocateOldestDuePayment } from '@/utils/formatters';
import { ToastMessage, ToastType } from '@/Components/UI/Toast';

interface AppContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  users: UserProfile[];
  members: Member[];
  savingsProducts: SavingsProduct[];
  savingsTransactions: SavingsTransaction[];
  loanProducts: LoanProduct[];
  loanApplications: LoanApplication[];
  loans: Loan[];
  payments: Payment[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  penaltySettings: PenaltySettings;
  toasts: ToastMessage[];

  // Toast Actions
  showToast: (toast: { type: ToastType; title: string; message: string; duration?: number }) => void;
  removeToast: (id: string) => void;

  // Actions
  addMember: (memberData: Partial<Member>) => Member;
  updateMemberStatus: (memberId: string, status: Member['status'], reason: string) => void;
  postSavingsTransaction: (params: {
    memberId: string;
    productId: string;
    type: SavingsTransactionType;
    amount: number;
    description: string;
    paymentMethod: 'kas_tunai' | 'transfer_bank';
  }) => { success: boolean; message: string; transaction?: SavingsTransaction };
  voidSavingsTransaction: (transactionId: string, reason: string) => void;
  
  submitLoanApplication: (params: {
    productId: string;
    requestedAmount: number;
    requestedTermMonths: number;
    purpose: string;
    attachments: any[];
  }) => LoanApplication;
  reviewLoanApplication: (applicationId: string, notes: string) => void;
  approveLoanApplication: (applicationId: string, params: { approvedAmount: number; approvedTermMonths: number; approvedAnnualRate: number; reason: string }) => void;
  rejectLoanApplication: (applicationId: string, reason: string) => void;
  cancelLoanApplication: (applicationId: string) => void;
  disburseLoan: (applicationId: string, params: { disbursementDate: string; paymentMethod: string }) => Loan;
  processEarlyPayoff: (loanId: string, paymentMethod: 'kas_tunai' | 'transfer_bank', customDiscountAmount?: number) => void;

  postPayment: (params: {
    loanId: string;
    amount: number;
    paymentDate: string;
    method: 'kas_tunai' | 'transfer_bank';
    reference?: string;
    notes?: string;
  }) => { success: boolean; message: string; payment?: Payment };
  voidPayment: (paymentId: string, reason: string) => void;

  toggleProductActive: (type: 'savings' | 'loan', id: string) => void;
  saveLoanProduct: (product: Partial<LoanProduct>) => void;
  saveSavingsProduct: (product: Partial<SavingsProduct>) => void;
  updatePenaltySettings: (settings: Partial<PenaltySettings>) => void;
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[0]);
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [savingsProducts, setSavingsProducts] = useState<SavingsProduct[]>(mockSavingsProducts);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>(mockSavingsTransactions);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>(mockLoanProducts);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>(mockLoanApplications);
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [penaltySettings, setPenaltySettings] = useState<PenaltySettings>(mockPenaltySettings);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (toast: { type: ToastType; title: string; message: string; duration?: number }) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: toast.type,
      title: toast.title,
      message: toast.message,
      duration: toast.duration ?? 4000,
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAudit = (action: string, entityType: string, entityId: string, before?: any, after?: any) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      before,
      after,
      createdAt: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    const foundUser = users.find(u => u.role === role) || { ...currentUser, role };
    setCurrentUser(foundUser);
    const targetUrl = role === 'member' ? '/dashboard' : '/admin';
    window.history.pushState({}, '', targetUrl);
    window.dispatchEvent(new Event('popstate'));
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    logAudit('UPDATE_USER_ROLE', 'UserProfile', userId, { role: currentUser.role }, { role: newRole });
  };

  const addMember = (memberData: Partial<Member>): Member => {
    const nextSeq = members.length + 101;
    const memberNo = `AGT-2026-${String(nextSeq).padStart(6, '0')}`;
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      memberNo,
      fullName: memberData.fullName || '',
      email: memberData.email || '',
      phone: memberData.phone || '',
      identityNo: memberData.identityNo || '',
      birthDate: memberData.birthDate || '1990-01-01',
      joinDate: new Date().toISOString().slice(0, 10),
      occupation: memberData.occupation || 'Pegawai',
      address: memberData.address || '',
      status: 'pending',
      savingsPokok: 0,
      savingsWajib: 0,
      savingsSukarela: 0,
      totalSavings: 0,
      activeLoanCount: 0,
      totalOutstandingLoan: 0,
    };
    setMembers(prev => [newMember, ...prev]);
    logAudit('CREATE_MEMBER', 'Member', newMember.memberNo, null, newMember);
    return newMember;
  };

  const updateMemberStatus = (memberId: string, status: Member['status'], reason: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        logAudit('UPDATE_MEMBER_STATUS', 'Member', m.memberNo, { status: m.status }, { status, reason });
        return { ...m, status };
      }
      return m;
    }));
  };

  const postSavingsTransaction = (params: {
    memberId: string;
    productId: string;
    type: SavingsTransactionType;
    amount: number;
    description: string;
    paymentMethod: 'kas_tunai' | 'transfer_bank';
  }) => {
    const member = members.find(m => m.id === params.memberId);
    const product = savingsProducts.find(p => p.id === params.productId);

    if (!member || !product) {
      return { success: false, message: 'Anggota atau produk simpanan tidak ditemukan.' };
    }

    if (params.type === 'withdrawal') {
      const currentVoluntary = member.savingsSukarela;
      if (currentVoluntary - params.amount < product.minimumBalance) {
        return { 
          success: false, 
          message: `Penarikan gagal. Saldo minimal simpanan sukarela harus disisakan Rp ${product.minimumBalance.toLocaleString('id-ID')}.` 
        };
      }
    }

    const nextSeq = savingsTransactions.length + 1;
    const referenceNo = `SIM-202607-${String(nextSeq).padStart(6, '0')}`;
    const newTx: SavingsTransaction = {
      id: `st-${Date.now()}`,
      referenceNo,
      memberId: member.id,
      memberName: member.fullName,
      productId: product.id,
      productName: product.name,
      type: params.type,
      amount: params.amount,
      transactionDate: new Date().toISOString().slice(0, 10),
      description: params.description,
      paymentMethod: params.paymentMethod,
      status: 'posted',
      createdBy: currentUser.fullName,
      postedBy: currentUser.fullName,
      postedAt: new Date().toISOString(),
    };

    setSavingsTransactions(prev => [newTx, ...prev]);

    // Update member savings balance
    setMembers(prev => prev.map(m => {
      if (m.id === member.id) {
        let { savingsPokok, savingsWajib, savingsSukarela } = m;
        const change = params.type === 'deposit' ? params.amount : -params.amount;
        if (product.type === 'principal') savingsPokok += change;
        if (product.type === 'mandatory') savingsWajib += change;
        if (product.type === 'voluntary') savingsSukarela += change;
        const totalSavings = savingsPokok + savingsWajib + savingsSukarela;
        return { ...m, savingsPokok, savingsWajib, savingsSukarela, totalSavings };
      }
      return m;
    }));

    logAudit('POST_SAVINGS_TRANSACTION', 'SavingsTransaction', referenceNo, null, newTx);
    return { success: true, message: 'Transaksi simpanan berhasil diposting.', transaction: newTx };
  };

  const voidSavingsTransaction = (transactionId: string, reason: string) => {
    const tx = savingsTransactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== 'posted') return;

    setSavingsTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'void',
          voidedBy: currentUser.fullName,
          voidedAt: new Date().toISOString(),
          voidReason: reason,
        };
      }
      return t;
    }));

    // Reverse member savings balance
    const product = savingsProducts.find(p => p.id === tx.productId);
    if (product) {
      setMembers(prev => prev.map(m => {
        if (m.id === tx.memberId) {
          let { savingsPokok, savingsWajib, savingsSukarela } = m;
          const reverseChange = tx.type === 'deposit' ? -tx.amount : tx.amount;
          if (product.type === 'principal') savingsPokok += reverseChange;
          if (product.type === 'mandatory') savingsWajib += reverseChange;
          if (product.type === 'voluntary') savingsSukarela += reverseChange;
          const totalSavings = savingsPokok + savingsWajib + savingsSukarela;
          return { ...m, savingsPokok, savingsWajib, savingsSukarela, totalSavings };
        }
        return m;
      }));
    }

    logAudit('VOID_SAVINGS_TRANSACTION', 'SavingsTransaction', tx.referenceNo, { status: 'posted' }, { status: 'void', reason });
  };

  const submitLoanApplication = (params: {
    productId: string;
    requestedAmount: number;
    requestedTermMonths: number;
    purpose: string;
    attachments: any[];
  }) => {
    const product = loanProducts.find(p => p.id === params.productId);
    const member = members.find(m => m.profileId === currentUser.id) || members[0];
    const nextSeq = loanApplications.length + 1;
    const applicationNo = `PNG-202607-${String(nextSeq).padStart(6, '0')}`;

    const newApp: LoanApplication = {
      id: `app-${Date.now()}`,
      applicationNo,
      memberId: member.id,
      memberName: member.fullName,
      memberNo: member.memberNo,
      productId: product?.id || 'lp-1',
      productName: product?.name || 'Pinjaman Reguler',
      requestedAmount: params.requestedAmount,
      requestedTermMonths: params.requestedTermMonths,
      purpose: params.purpose,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      attachments: params.attachments || [],
    };

    setLoanApplications(prev => [newApp, ...prev]);
    logAudit('SUBMIT_LOAN_APPLICATION', 'LoanApplication', applicationNo, null, newApp);
    return newApp;
  };

  const reviewLoanApplication = (applicationId: string, notes: string) => {
    setLoanApplications(prev => prev.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: 'under_review',
          reviewNotes: notes,
          reviewedBy: currentUser.fullName,
        };
      }
      return a;
    }));
    logAudit('REVIEW_LOAN_APPLICATION', 'LoanApplication', applicationId);
  };

  const approveLoanApplication = (applicationId: string, params: { approvedAmount: number; approvedTermMonths: number; approvedAnnualRate: number; reason: string }) => {
    setLoanApplications(prev => prev.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: 'approved',
          approvedAmount: params.approvedAmount,
          approvedTermMonths: params.approvedTermMonths,
          approvedAnnualRate: params.approvedAnnualRate,
          decisionReason: params.reason,
          approvedBy: currentUser.fullName,
          decidedAt: new Date().toISOString(),
        };
      }
      return a;
    }));
    logAudit('APPROVE_LOAN_APPLICATION', 'LoanApplication', applicationId, null, params);
  };

  const rejectLoanApplication = (applicationId: string, reason: string) => {
    setLoanApplications(prev => prev.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: 'rejected',
          decisionReason: reason,
          approvedBy: currentUser.fullName,
          decidedAt: new Date().toISOString(),
        };
      }
      return a;
    }));
    logAudit('REJECT_LOAN_APPLICATION', 'LoanApplication', applicationId, null, { reason });
  };

  const cancelLoanApplication = (applicationId: string) => {
    setLoanApplications(prev => prev.map(a => {
      if (a.id === applicationId) {
        return { ...a, status: 'cancelled' };
      }
      return a;
    }));
    logAudit('CANCEL_LOAN_APPLICATION', 'LoanApplication', applicationId);
  };

  const disburseLoan = (applicationId: string, params: { disbursementDate: string; paymentMethod: string }): Loan => {
    const app = loanApplications.find(a => a.id === applicationId);
    if (!app || app.status !== 'approved') throw new Error('Pengajuan tidak valid untuk dicairkan');

    const nextLoanSeq = loans.length + 1;
    const loanNo = `PJM-202607-${String(nextLoanSeq).padStart(6, '0')}`;
    const principalAmount = app.approvedAmount || app.requestedAmount;
    const termMonths = app.approvedTermMonths || app.requestedTermMonths;
    const annualRate = app.approvedAnnualRate || 10.0;

    const calc = calculateFlatLoan(principalAmount, annualRate, termMonths, params.disbursementDate);
    const installments = calc.schedule.map(sch => ({
      id: `inst-${Date.now()}-${sch.sequenceNo}`,
      loanId: `loan-${Date.now()}`,
      sequenceNo: sch.sequenceNo,
      dueDate: sch.dueDate,
      principalDue: sch.principalDue,
      interestDue: sch.interestDue,
      lateFeeDue: 0,
      totalDue: sch.totalDue,
      paidAmount: 0,
      remainingAmount: sch.totalDue,
      status: 'unpaid' as const,
    }));

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      loanNo,
      applicationId: app.id,
      memberId: app.memberId,
      memberName: app.memberName,
      memberNo: app.memberNo,
      productId: app.productId,
      productName: app.productName,
      principalAmount,
      termMonths,
      annualInterestRate: annualRate,
      totalInterest: calc.totalInterest,
      totalPayable: calc.totalPayable,
      outstandingAmount: calc.totalPayable,
      disbursementDate: params.disbursementDate,
      firstDueDate: installments[0]?.dueDate || params.disbursementDate,
      status: 'active',
      installments,
    };

    setLoans(prev => [newLoan, ...prev]);

    // Mark application as disbursed
    setLoanApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status: 'disbursed', disbursedAt: new Date().toISOString() } : a));

    // Update member active loan count & outstanding
    setMembers(prev => prev.map(m => m.id === app.memberId ? {
      ...m,
      activeLoanCount: m.activeLoanCount + 1,
      totalOutstandingLoan: m.totalOutstandingLoan + calc.totalPayable,
    } : m));

    logAudit('DISBURSE_LOAN', 'Loan', loanNo, null, newLoan);
    return newLoan;
  };

  const processEarlyPayoff = (loanId: string, paymentMethod: 'kas_tunai' | 'transfer_bank', customDiscountAmount?: number) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const unpaidInsts = loan.installments.filter((i) => i.status !== 'paid');
    const remainingPrincipal = unpaidInsts.reduce((acc, i) => acc + i.principalDue - Math.min(i.principalDue, i.paidAmount), 0);
    const unpaidLateFee = unpaidInsts.reduce((acc, i) => acc + i.lateFeeDue, 0);
    const totalUnearnedInterest = unpaidInsts.reduce((acc, i) => acc + i.interestDue, 0);

    const loanProd = loanProducts.find((p) => p.id === loan.productId);
    const effectiveDiscountAmount = customDiscountAmount
      ?? loanProd?.earlyPayoffDiscountAmount
      ?? penaltySettings.earlyPayoffDiscountAmount
      ?? totalUnearnedInterest;

    const waivedInterest = Math.min(totalUnearnedInterest, Math.max(0, effectiveDiscountAmount));
    const retainedInterest = totalUnearnedInterest - waivedInterest;
    const totalPayoff = remainingPrincipal + unpaidLateFee + retainedInterest;

    const updatedInstallments = loan.installments.map((inst) => ({
      ...inst,
      paidAmount: inst.totalDue,
      remainingAmount: 0,
      status: 'paid' as const,
    }));

    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          return {
            ...l,
            outstandingAmount: 0,
            status: 'paid_off' as const,
            installments: updatedInstallments,
          };
        }
        return l;
      })
    );

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === loan.memberId) {
          return {
            ...m,
            activeLoanCount: Math.max(0, m.activeLoanCount - 1),
            totalOutstandingLoan: Math.max(0, m.totalOutstandingLoan - loan.outstandingAmount),
          };
        }
        return m;
      })
    );

    logAudit('EARLY_PAYOFF_LOAN', 'Loan', loan.loanNo, { outstandingAmount: loan.outstandingAmount }, { totalPayoff, waivedInterest, retainedInterest, effectiveDiscountAmount, paymentMethod });

    showToast({
      type: 'success',
      title: 'Pelunasan Dipercepat Berhasil!',
      message: `Pinjaman ${loan.loanNo} telah lunas. Diskon Bunga Digratiskan: Rp ${waivedInterest.toLocaleString('id-ID')}. Total Bayar: Rp ${totalPayoff.toLocaleString('id-ID')}.`,
      duration: 6000,
    });
  };

  const postPayment = (params: {
    loanId: string;
    amount: number;
    paymentDate: string;
    method: 'kas_tunai' | 'transfer_bank';
    reference?: string;
    notes?: string;
  }) => {
    const loan = loans.find(l => l.id === params.loanId);
    if (!loan) return { success: false, message: 'Pinjaman tidak ditemukan.' };

    const { allocations, remainingPayment, updatedInstallments } = allocateOldestDuePayment(loan.installments, params.amount);

    if (allocations.length === 0) {
      return { success: false, message: 'Tidak ada angsuran yang dapat dialokasikan.' };
    }

    const nextSeq = payments.length + 1;
    const paymentNo = `BYR-202607-${String(nextSeq).padStart(6, '0')}`;
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNo,
      loanId: loan.id,
      loanNo: loan.loanNo,
      memberId: loan.memberId,
      memberName: loan.memberName,
      paymentDate: params.paymentDate,
      amount: params.amount - remainingPayment,
      method: params.method,
      reference: params.reference,
      notes: params.notes,
      status: 'posted',
      receivedBy: currentUser.fullName,
      postedAt: new Date().toISOString(),
      allocations,
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update Loan outstanding & installments
    const totalPaid = updatedInstallments.reduce((acc, i) => acc + i.paidAmount, 0);
    const newOutstanding = Math.max(0, loan.totalPayable - totalPaid);
    const isPaidOff = newOutstanding === 0;

    setLoans(prev => prev.map(l => {
      if (l.id === loan.id) {
        return {
          ...l,
          outstandingAmount: newOutstanding,
          status: isPaidOff ? 'paid_off' : l.status,
          installments: updatedInstallments,
        };
      }
      return l;
    }));

    // Update member outstanding
    setMembers(prev => prev.map(m => m.id === loan.memberId ? {
      ...m,
      totalOutstandingLoan: Math.max(0, m.totalOutstandingLoan - (params.amount - remainingPayment)),
      activeLoanCount: isPaidOff ? Math.max(0, m.activeLoanCount - 1) : m.activeLoanCount,
    } : m));

    logAudit('POST_PAYMENT', 'Payment', paymentNo, null, newPayment);
    return { success: true, message: 'Pembayaran angsuran berhasil diposting.', payment: newPayment };
  };

  const voidPayment = (paymentId: string, reason: string) => {
    const pay = payments.find(p => p.id === paymentId);
    if (!pay || pay.status !== 'posted') return;

    setPayments(prev => prev.map(p => p.id === paymentId ? {
      ...p,
      status: 'void',
      voidedAt: new Date().toISOString(),
      voidReason: reason,
    } : p));

    // Revert loan installments
    setLoans(prev => prev.map(l => {
      if (l.id === pay.loanId) {
        const restoredInstallments = l.installments.map(inst => {
          const alloc = pay.allocations.find(a => a.installmentId === inst.id);
          if (alloc) {
            const newPaidAmount = Math.max(0, inst.paidAmount - alloc.totalAllocated);
            const newRemaining = inst.totalDue - newPaidAmount;
            return {
              ...inst,
              paidAmount: newPaidAmount,
              remainingAmount: newRemaining,
              status: (newPaidAmount === 0 ? 'unpaid' : 'partial') as any,
            };
          }
          return inst;
        });

        const totalPaid = restoredInstallments.reduce((acc, i) => acc + i.paidAmount, 0);
        return {
          ...l,
          outstandingAmount: l.totalPayable - totalPaid,
          status: 'active',
          installments: restoredInstallments,
        };
      }
      return l;
    }));

    logAudit('VOID_PAYMENT', 'Payment', pay.paymentNo, { status: 'posted' }, { status: 'void', reason });
  };

  const toggleProductActive = (type: 'savings' | 'loan', id: string) => {
    if (type === 'savings') {
      setSavingsProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    } else {
      setLoanProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    }
  };

  const saveLoanProduct = (prod: Partial<LoanProduct>) => {
    if (prod.id) {
      setLoanProducts(prev => prev.map(p => p.id === prod.id ? { ...p, ...prod } as LoanProduct : p));
      showToast({ type: 'success', title: 'Produk Pinjaman Diperbarui', message: `Produk pinjaman ${prod.name || ''} berhasil disimpan.` });
    } else {
      const newProd: LoanProduct = {
        id: `lp-${Date.now()}`,
        code: prod.code || 'LP-NEW',
        name: prod.name || 'Produk Baru',
        minAmount: prod.minAmount || 1000000,
        maxAmount: prod.maxAmount || 10000000,
        minTermMonths: prod.minTermMonths || 6,
        maxTermMonths: prod.maxTermMonths || 24,
        annualInterestRate: prod.annualInterestRate || 10.0,
        lateFeePercentage: prod.lateFeePercentage || 1.0,
        isActive: true,
        description: prod.description,
      };
      setLoanProducts(prev => [...prev, newProd]);
      showToast({ type: 'success', title: 'Produk Pinjaman Ditambahkan', message: `Produk pinjaman baru ${newProd.name} berhasil dibuat.` });
    }
  };

  const saveSavingsProduct = (prod: Partial<SavingsProduct>) => {
    if (prod.id) {
      setSavingsProducts(prev => prev.map(p => p.id === prod.id ? { ...p, ...prod } as SavingsProduct : p));
      showToast({ type: 'success', title: 'Produk Simpanan Diperbarui', message: `Produk simpanan ${prod.name || ''} berhasil disimpan.` });
    } else {
      const newProd: SavingsProduct = {
        id: `sp-${Date.now()}`,
        code: prod.code || 'SP-NEW',
        name: prod.name || 'Produk Simpanan',
        type: prod.type || 'voluntary',
        defaultAmount: prod.defaultAmount || 50000,
        minimumBalance: prod.minimumBalance || 0,
        isActive: true,
        description: prod.description,
      };
      setSavingsProducts(prev => [...prev, newProd]);
      showToast({ type: 'success', title: 'Produk Simpanan Ditambahkan', message: `Produk simpanan baru ${newProd.name} berhasil dibuat.` });
    }
  };

  const updatePenaltySettings = (newSettings: Partial<PenaltySettings>) => {
    setPenaltySettings(prev => {
      const updated = { ...prev, ...newSettings };
      logAudit('UPDATE_PENALTY_SETTINGS', 'Setting', 'loan_penalty', prev, updated);
      return updated;
    });
    showToast({
      type: 'success',
      title: 'Pengaturan Denda Disimpan',
      message: 'Aturan denda Koperasi & masa tenggang (grace period) berhasil diperbarui.',
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        users,
        members,
        savingsProducts,
        savingsTransactions,
        loanProducts,
        loanApplications,
        loans,
        payments,
        auditLogs,
        notifications,
        accounts,
        journalEntries,
        penaltySettings,
        toasts,
        showToast,
        removeToast,
        addMember,
        updateMemberStatus,
        postSavingsTransaction,
        voidSavingsTransaction,
        submitLoanApplication,
        reviewLoanApplication,
        approveLoanApplication,
        rejectLoanApplication,
        cancelLoanApplication,
        disburseLoan,
        processEarlyPayoff,
        postPayment,
        voidPayment,
        toggleProductActive,
        saveLoanProduct,
        saveSavingsProduct,
        updatePenaltySettings,
        markNotificationRead,
        markAllNotificationsRead,
        updateUserRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

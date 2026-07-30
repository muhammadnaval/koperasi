export type UserRole = 'member' | 'staff' | 'approver' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  memberId?: string;
}

export type MemberStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export interface Member {
  id: string;
  memberNo: string; // e.g. AGT-2026-000101
  profileId?: string;
  fullName: string;
  email: string;
  phone: string;
  identityNo: string; // NIK
  birthDate: string;
  joinDate: string;
  occupation: string;
  address: string;
  status: MemberStatus;
  savingsPokok: number;
  savingsWajib: number;
  savingsSukarela: number;
  totalSavings: number;
  activeLoanCount: number;
  totalOutstandingLoan: number;
}

export type SavingsType = 'principal' | 'mandatory' | 'voluntary';

export interface SavingsProduct {
  id: string;
  code: string;
  name: string;
  type: SavingsType;
  defaultAmount: number;
  minimumBalance: number;
  isActive: boolean;
  description?: string;
}

export type TransactionStatus = 'pending' | 'posted' | 'void';
export type SavingsTransactionType = 'deposit' | 'withdrawal' | 'adjustment';

export interface SavingsTransaction {
  id: string;
  referenceNo: string; // SIM-202607-000001
  memberId: string;
  memberName: string;
  productId: string;
  productName: string;
  type: SavingsTransactionType;
  amount: number;
  transactionDate: string;
  description: string;
  paymentMethod: 'kas_tunai' | 'transfer_bank';
  status: TransactionStatus;
  createdBy: string;
  postedBy?: string;
  postedAt?: string;
  voidedBy?: string;
  voidedAt?: string;
  voidReason?: string;
}

export interface PenaltySettings {
  gracePeriodDays: number;
  lateFeePercentage: number;
  lateFeeCalculationType: 'percent_of_interest' | 'percent_of_installment' | 'flat_per_day';
  enableAutoPenalty: boolean;
  lateFeeAccountCode: string;
  earlyPayoffDiscountAmount?: number;
}

export interface LoanProduct {
  id: string;
  code: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  annualInterestRate: number; // e.g. 10.0 for 10% flat/yr
  lateFeePercentage: number;
  riskFeePercentage?: number; // e.g. 0.5 for 0.5%
  mandatorySavingPercentage?: number; // e.g. 0.5 for 0.5%
  gracePeriodDays?: number;
  lateFeeType?: 'percent_of_interest' | 'percent_of_installment' | 'flat_per_day';
  earlyPayoffDiscountAmount?: number;
  isActive: boolean;
  description?: string;
}

export type LoanAppStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled' 
  | 'disbursed';

export interface LoanAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  category: 'KTP' | 'Slip Gaji' | 'Surat Pendukung' | 'Lainnya';
  uploadedAt: string;
  fileUrl?: string;
}

export interface LoanApplication {
  id: string;
  applicationNo: string; // PNG-202607-000001
  memberId: string;
  memberName: string;
  memberNo: string;
  productId: string;
  productName: string;
  requestedAmount: number;
  requestedTermMonths: number;
  purpose: string;
  status: LoanAppStatus;
  approvedAmount?: number;
  approvedTermMonths?: number;
  approvedAnnualRate?: number;
  reviewNotes?: string;
  decisionReason?: string;
  reviewedBy?: string;
  approvedBy?: string;
  submittedAt?: string;
  decidedAt?: string;
  disbursedAt?: string;
  attachments: LoanAttachment[];
}

export type LoanStatus = 'active' | 'paid_off' | 'delinquent' | 'written_off';
export type InstallmentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface Installment {
  id: string;
  loanId: string;
  sequenceNo: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  lateFeeDue: number;
  totalDue: number;
  paidAmount: number;
  remainingAmount: number;
  status: InstallmentStatus;
  paidAt?: string;
}

export interface Loan {
  id: string;
  loanNo: string; // PJM-202607-000001
  applicationId: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  productId: string;
  productName: string;
  principalAmount: number;
  termMonths: number;
  annualInterestRate: number;
  riskFeePercentage?: number;
  mandatorySavingPercentage?: number;
  riskFeeAmount?: number;
  mandatorySavingAmount?: number;
  netDisbursementAmount?: number;
  totalInterest: number;
  totalPayable: number;
  outstandingAmount: number;
  disbursementDate: string;
  firstDueDate: string;
  status: LoanStatus;
  installments: Installment[];
}

export interface PaymentAllocation {
  installmentId: string;
  sequenceNo: number;
  principalAmount: number;
  interestAmount: number;
  lateFeeAmount: number;
  totalAllocated: number;
}

export interface Payment {
  id: string;
  paymentNo: string; // BYR-202607-000001
  loanId: string;
  loanNo: string;
  memberId: string;
  memberName: string;
  paymentDate: string;
  amount: number;
  method: 'kas_tunai' | 'transfer_bank';
  reference?: string;
  notes?: string;
  status: TransactionStatus;
  receivedBy: string;
  allocations: PaymentAllocation[];
  postedAt?: string;
  voidedAt?: string;
  voidReason?: string;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  createdAt: string;
  ipAddress: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  type: 'loan' | 'savings' | 'installment' | 'system';
  title: string;
  message: string;
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  normalBalance: 'debit' | 'credit';
  balance: number;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
}

export interface JournalEntry {
  id: string;
  journalNo: string;
  entryDate: string;
  description: string;
  sourceType: 'savings' | 'disbursement' | 'payment' | 'shu' | 'manual';
  sourceId: string;
  status: 'posted' | 'reversed';
  lines: JournalLine[];
  postedBy: string;
  postedAt: string;
}

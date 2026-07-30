import { Installment, PaymentAllocation } from '@/types';

/**
 * Format integer amount to Indonesian Rupiah currency string.
 * Example: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string or Date to Indonesian readable date.
 * Example: "2026-07-29" -> "29 Juli 2026"
 */
export function formatDateIndonesian(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format ISO datetime string to Indonesian readable date and time.
 * Example: "2026-07-29T08:30:00" -> "29 Juli 2026, 08:30 WIB"
 */
export function formatDateTimeIndonesian(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const dateFormatted = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(date);
    return `${dateFormatted} WIB`;
  } catch {
    return dateString;
  }
}

/**
 * Mask NIK/Identity number for privacy protection in general lists.
 * Example: "1371012304880002" -> "137101******0002"
 */
export function maskIdentityNo(identityNo: string): string {
  if (!identityNo || identityNo.length < 8) return identityNo || '-';
  const first6 = identityNo.substring(0, 6);
  const last4 = identityNo.substring(identityNo.length - 4);
  const maskedCount = identityNo.length - 10;
  return `${first6}${'*'.repeat(Math.max(maskedCount, 4))}${last4}`;
}

/**
 * Pure function flat loan calculation per PRD Section 7 & 6B specs.
 * totalInterest = round(principal * annualRate * termMonths / 12)
 * totalPayable = principal + totalInterest
 * basePrincipal = floor(principal / termMonths)
 * baseInterest = floor(totalInterest / termMonths)
 * Rounding difference allocated to the last installment.
 */
export interface FlatLoanCalculation {
  principal: number;
  annualRate: number;
  termMonths: number;
  totalInterest: number;
  totalPayable: number;
  monthlyInstallment: number;
  schedule: Array<{
    sequenceNo: number;
    dueDate: string;
    principalDue: number;
    interestDue: number;
    totalDue: number;
  }>;
}

export function calculateFlatLoan(
  principal: number,
  annualRate: number, // percentage e.g. 10 for 10%
  termMonths: number,
  startDateStr: string = new Date().toISOString().slice(0, 10)
): FlatLoanCalculation {
  if (!principal || !termMonths || termMonths <= 0) {
    return {
      principal: 0,
      annualRate,
      termMonths: 0,
      totalInterest: 0,
      totalPayable: 0,
      monthlyInstallment: 0,
      schedule: [],
    };
  }

  const rateFraction = annualRate / 100;
  const totalInterest = Math.round((principal * rateFraction * termMonths) / 12);
  const totalPayable = principal + totalInterest;

  const basePrincipal = Math.floor(principal / termMonths);
  const baseInterest = Math.floor(totalInterest / termMonths);

  const principalDiff = principal - basePrincipal * termMonths;
  const interestDiff = totalInterest - baseInterest * termMonths;

  const startDate = new Date(startDateStr);
  const schedule = [];

  for (let i = 1; i <= termMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const isLast = i === termMonths;
    const principalDue = isLast ? basePrincipal + principalDiff : basePrincipal;
    const interestDue = isLast ? baseInterest + interestDiff : baseInterest;
    const totalDue = principalDue + interestDue;

    schedule.push({
      sequenceNo: i,
      dueDate: dueDate.toISOString().slice(0, 10),
      principalDue,
      interestDue,
      totalDue,
    });
  }

  const monthlyInstallment = schedule.length > 0 ? schedule[0].totalDue : 0;

  return {
    principal,
    annualRate,
    termMonths,
    totalInterest,
    totalPayable,
    monthlyInstallment,
    schedule,
  };
}

/**
 * Oldest-due-first installment payment allocation helper.
 * Allocates payment across unpaid/partial installments in chronological sequence.
 * Allocation priority: late fee -> interest -> principal.
 */
export function allocateOldestDuePayment(
  installments: Installment[],
  paymentAmount: number
): { allocations: PaymentAllocation[]; remainingPayment: number; updatedInstallments: Installment[] } {
  let paymentLeft = paymentAmount;
  const allocations: PaymentAllocation[] = [];
  
  // Clone installments
  const updatedInstallments = installments.map(inst => ({ ...inst }));

  // Sort by sequenceNo ascending (chronological due order)
  updatedInstallments.sort((a, b) => a.sequenceNo - b.sequenceNo);

  for (const inst of updatedInstallments) {
    if (paymentLeft <= 0) break;
    if (inst.remainingAmount <= 0) continue;

    // Determine dues breakdown remaining for this installment
    const unpaidLateFee = Math.max(0, inst.lateFeeDue - (inst.paidAmount > inst.interestDue + inst.principalDue ? inst.paidAmount - (inst.interestDue + inst.principalDue) : 0));
    const unpaidInterest = Math.max(0, inst.interestDue - (inst.paidAmount > inst.principalDue ? Math.min(inst.interestDue, inst.paidAmount - inst.principalDue) : 0));
    const unpaidPrincipal = Math.max(0, inst.remainingAmount - unpaidInterest - unpaidLateFee);

    let lateFeeAlloc = 0;
    let interestAlloc = 0;
    let principalAlloc = 0;

    // 1. Late fee allocation
    if (unpaidLateFee > 0 && paymentLeft > 0) {
      lateFeeAlloc = Math.min(paymentLeft, unpaidLateFee);
      paymentLeft -= lateFeeAlloc;
    }

    // 2. Interest allocation
    if (unpaidInterest > 0 && paymentLeft > 0) {
      interestAlloc = Math.min(paymentLeft, unpaidInterest);
      paymentLeft -= interestAlloc;
    }

    // 3. Principal allocation
    if (unpaidPrincipal > 0 && paymentLeft > 0) {
      principalAlloc = Math.min(paymentLeft, unpaidPrincipal);
      paymentLeft -= principalAlloc;
    }

    const totalAllocated = lateFeeAlloc + interestAlloc + principalAlloc;

    if (totalAllocated > 0) {
      allocations.push({
        installmentId: inst.id,
        sequenceNo: inst.sequenceNo,
        principalAmount: principalAlloc,
        interestAmount: interestAlloc,
        lateFeeAmount: lateFeeAlloc,
        totalAllocated,
      });

      inst.paidAmount += totalAllocated;
      inst.remainingAmount = Math.max(0, inst.totalDue - inst.paidAmount);
      inst.status = inst.remainingAmount === 0 ? 'paid' : 'partial';
      if (inst.status === 'paid') {
        inst.paidAt = new Date().toISOString();
      }
    }
  }

  return {
    allocations,
    remainingPayment: paymentLeft,
    updatedInstallments,
  };
}

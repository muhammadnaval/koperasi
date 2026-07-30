<?php

declare(strict_types=1);

namespace App\Services\Accounting;

use App\Models\Account;
use App\Models\AuditLog;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class JournalService
{
    /**
     * Post a balanced, idempotent double-entry journal record.
     *
     * @param array{
     *   description: string,
     *   source_type: string,
     *   source_id: string,
     *   entry_date?: string,
     *   lines: array<int, array{account_code: string, debit: int, credit: int}>
     * } $params
     */
    public function postJournal(array $params, string $actorName = 'System'): JournalEntry
    {
        $totalDebit = 0;
        $totalCredit = 0;
        foreach ($params['lines'] as $line) {
            $totalDebit += (int) $line['debit'];
            $totalCredit += (int) $line['credit'];
        }

        // Enforce double-entry accounting rule BEFORE DB transaction
        if ($totalDebit !== $totalCredit) {
            throw new InvalidArgumentException("Jurnal tidak seimbang! Total Debit (Rp {$totalDebit}) != Total Kredit (Rp {$totalCredit}).");
        }

        return DB::transaction(function () use ($params, $actorName) {
            // Check idempotency: unique (source_type, source_id, status)
            $existing = JournalEntry::where('source_type', $params['source_type'])
                ->where('source_id', $params['source_id'])
                ->where('status', 'posted')
                ->first();

            if ($existing) {
                return $existing;
            }

            $nextCount = JournalEntry::count() + 1;
            $journalNo = sprintf('JRN-%s-%06d', date('Ym'), $nextCount);

            $entry = JournalEntry::create([
                'journal_no' => $journalNo,
                'entry_date' => $params['entry_date'] ?? date('Y-m-d'),
                'description' => $params['description'],
                'source_type' => $params['source_type'],
                'source_id' => $params['source_id'],
                'status' => 'posted',
                'posted_by' => $actorName,
                'posted_at' => now(),
            ]);

            foreach ($params['lines'] as $lineData) {
                /** @var Account $account */
                $account = Account::firstOrCreate(
                    ['code' => $lineData['account_code']],
                    [
                        'name' => 'Akun '.$lineData['account_code'],
                        'type' => 'asset',
                        'normal_balance' => 'debit',
                        'balance' => 0,
                    ]
                );

                JournalLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $account->id,
                    'debit_amount' => (int) $lineData['debit'],
                    'credit_amount' => (int) $lineData['credit'],
                ]);

                // Update account balance
                $netChange = ($account->normal_balance === 'debit')
                    ? ((int) $lineData['debit'] - (int) $lineData['credit'])
                    : ((int) $lineData['credit'] - (int) $lineData['debit']);

                $account->increment('balance', $netChange);
            }

            AuditLog::create([
                'actor_name' => $actorName,
                'actor_role' => 'system',
                'action' => 'POST_JOURNAL_ENTRY',
                'entity_type' => 'JournalEntry',
                'entity_id' => $entry->journal_no,
                'after' => $entry->toArray(),
            ]);

            return $entry;
        });
    }

    /**
     * Reverse a posted journal entry for voided transactions.
     */
    public function reverseJournal(string $sourceType, string $sourceId, string $actorName = 'Admin'): ?JournalEntry
    {
        return DB::transaction(function () use ($sourceType, $sourceId, $actorName) {
            /** @var JournalEntry|null $original */
            $original = JournalEntry::where('source_type', $sourceType)
                ->where('source_id', $sourceId)
                ->where('status', 'posted')
                ->lockForUpdate()
                ->first();

            if (! $original) {
                return null;
            }

            $original->update(['status' => 'reversed']);

            $reverseLines = [];
            foreach ($original->lines as $line) {
                $account = $line->account;
                $reverseLines[] = [
                    'account_code' => $account->code,
                    'debit' => $line->credit_amount,
                    'credit' => $line->debit_amount,
                ];
            }

            return $this->postJournal([
                'description' => "Pembalikan Jurnal {$original->journal_no}",
                'source_type' => $sourceType.'_reversal',
                'source_id' => $sourceId,
                'lines' => $reverseLines,
            ], $actorName);
        });
    }

    /**
     * Get Trial Balance (Neraca Saldo) report.
     *
     * @return array<int, array{code: string, name: string, debit: int, credit: int, balance: int}>
     */
    public function getTrialBalance(): array
    {
        $accounts = Account::where('is_active', true)->orderBy('code')->get();
        $trialBalance = [];

        foreach ($accounts as $acc) {
            $trialBalance[] = [
                'code' => $acc->code,
                'name' => $acc->name,
                'normal_balance' => $acc->normal_balance,
                'debit' => $acc->normal_balance === 'debit' ? max(0, $acc->balance) : 0,
                'credit' => $acc->normal_balance === 'credit' ? max(0, $acc->balance) : 0,
                'balance' => $acc->balance,
            ];
        }

        return $trialBalance;
    }
}

<?php

namespace Database\Seeders;

use App\Enums\MemberStatus;
use App\Enums\UserRole;
use App\Models\Account;
use App\Models\Member;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with initial roles and members.
     */
    public function run(): void
    {
        // 1. Member Demo User
        $memberUser = User::updateOrCreate(
            ['email' => 'budi.santoso@mtsn3padang.sch.id'],
            [
                'name' => 'Budi Santoso',
                'password' => bcrypt('secret123'),
            ]
        );

        $memberProfile = Profile::updateOrCreate(
            ['user_id' => $memberUser->id],
            [
                'full_name' => 'Budi Santoso, S.Pd',
                'email' => $memberUser->email,
                'phone' => '081234567890',
                'role' => UserRole::MEMBER,
                'status' => 'active',
            ]
        );

        Member::updateOrCreate(
            ['email' => $memberUser->email],
            [
                'member_no' => 'KPR-2026-0001',
                'profile_id' => $memberProfile->id,
                'full_name' => $memberProfile->full_name,
                'identity_no' => '1371011508820001',
                'phone' => '081234567890',
                'join_date' => '2025-01-15',
                'status' => MemberStatus::ACTIVE,
                'savings_pokok' => 500000,
                'savings_wajib' => 1200000,
                'savings_sukarela' => 3000000,
                'total_savings' => 4700000,
            ]
        );

        // 2. Staff User
        $staffUser = User::updateOrCreate(
            ['email' => 'petugas@mtsn3padang.sch.id'],
            [
                'name' => 'Petugas Kasir',
                'password' => bcrypt('secret123'),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $staffUser->id],
            [
                'full_name' => 'Siti Kasir Koperasi',
                'email' => $staffUser->email,
                'role' => UserRole::STAFF,
                'status' => 'active',
            ]
        );

        // 3. Approver User
        $approverUser = User::updateOrCreate(
            ['email' => 'approver@mtsn3padang.sch.id'],
            [
                'name' => 'Manajer Approver',
                'password' => bcrypt('secret123'),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $approverUser->id],
            [
                'full_name' => 'Drs. Ahmad Pengurus',
                'email' => $approverUser->email,
                'role' => UserRole::APPROVER,
                'status' => 'active',
            ]
        );

        // 4. Admin System User
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@mtsn3padang.sch.id'],
            [
                'name' => 'Admin System',
                'password' => bcrypt('secret123'),
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $adminUser->id],
            [
                'full_name' => 'Administrator KPRI',
                'email' => $adminUser->email,
                'role' => UserRole::ADMIN,
                'status' => 'active',
            ]
        );

        // 5. Permenkop UKM Standard Chart of Accounts (COA)
        $accounts = [
            ['code' => '1110', 'name' => 'Kas Kantor Koperasi', 'type' => 'asset', 'normal_balance' => 'debit', 'balance' => 45000000],
            ['code' => '1120', 'name' => 'Bank Rekening Utama Koperasi', 'type' => 'asset', 'normal_balance' => 'debit', 'balance' => 285000000],
            ['code' => '1130', 'name' => 'Piutang Pinjaman Reguler Anggota', 'type' => 'asset', 'normal_balance' => 'debit', 'balance' => 140000000],
            ['code' => '1131', 'name' => 'Piutang Pinjaman Darurat Anggota', 'type' => 'asset', 'normal_balance' => 'debit', 'balance' => 15000000],
            ['code' => '1132', 'name' => 'Piutang Pinjaman Pendidikan', 'type' => 'asset', 'normal_balance' => 'debit', 'balance' => 25000000],
            ['code' => '1140', 'name' => 'Penyisihan Penghapusan Piutang (KAP)', 'type' => 'asset', 'normal_balance' => 'credit', 'balance' => -2500000],
            ['code' => '1210', 'name' => 'Aset Tetap - Peralatan & Komputer', 'type' => 'asset', 'normal_balance' => 'debit', 'balance' => 35000000],
            ['code' => '1211', 'name' => 'Akumulasi Penyusutan Aset Tetap', 'type' => 'asset', 'normal_balance' => 'credit', 'balance' => -7000000],
            ['code' => '2110', 'name' => 'Simpanan Sukarela Anggota', 'type' => 'liability', 'normal_balance' => 'credit', 'balance' => 185500000],
            ['code' => '2120', 'name' => 'Utang Bunga Simpanan Anggota', 'type' => 'liability', 'normal_balance' => 'credit', 'balance' => 4500000],
            ['code' => '2130', 'name' => 'Titipan Dana Bagian SHU Anggota', 'type' => 'liability', 'normal_balance' => 'credit', 'balance' => 12000000],
            ['code' => '2140', 'name' => 'Utang Bank / Pihak Ketiga', 'type' => 'liability', 'normal_balance' => 'credit', 'balance' => 50000000],
            ['code' => '3110', 'name' => 'Simpanan Pokok Anggota', 'type' => 'equity', 'normal_balance' => 'credit', 'balance' => 65000000],
            ['code' => '3120', 'name' => 'Simpanan Wajib Anggota', 'type' => 'equity', 'normal_balance' => 'credit', 'balance' => 145000000],
            ['code' => '3130', 'name' => 'Modal Penyertaan / Hibah', 'type' => 'equity', 'normal_balance' => 'credit', 'balance' => 20000000],
            ['code' => '3210', 'name' => 'Cadangan Koperasi', 'type' => 'equity', 'normal_balance' => 'credit', 'balance' => 32000000],
            ['code' => '3310', 'name' => 'SHU Belum Dibagi (Tahun Berjalan)', 'type' => 'equity', 'normal_balance' => 'credit', 'balance' => 21500000],
            ['code' => '4110', 'name' => 'Pendapatan Jasa Pinjaman Anggota', 'type' => 'revenue', 'normal_balance' => 'credit', 'balance' => 28500000],
            ['code' => '4120', 'name' => 'Pendapatan Denda Keterlambatan', 'type' => 'revenue', 'normal_balance' => 'credit', 'balance' => 1250000],
            ['code' => '4130', 'name' => 'Pendapatan Administrasi & Provisi', 'type' => 'revenue', 'normal_balance' => 'credit', 'balance' => 1800000],
            ['code' => '5110', 'name' => 'Beban Bunga Simpanan Sukarela', 'type' => 'expense', 'normal_balance' => 'debit', 'balance' => 4500000],
            ['code' => '5120', 'name' => 'Beban Penyisihan Penghapusan Piutang', 'type' => 'expense', 'normal_balance' => 'debit', 'balance' => 1200000],
            ['code' => '5210', 'name' => 'Beban Gaji & Honor Pengurus/Karyawan', 'type' => 'expense', 'normal_balance' => 'debit', 'balance' => 14500000],
            ['code' => '5220', 'name' => 'Beban Operasional Kantor & ATK', 'type' => 'expense', 'normal_balance' => 'debit', 'balance' => 3800000],
            ['code' => '5230', 'name' => 'Beban Penyusutan Aset Tetap', 'type' => 'expense', 'normal_balance' => 'debit', 'balance' => 1500000],
            ['code' => '5310', 'name' => 'Beban Perkoperasian & RAT', 'type' => 'expense', 'normal_balance' => 'debit', 'balance' => 4550000],
        ];

        foreach ($accounts as $acc) {
            Account::updateOrCreate(
                ['code' => $acc['code']],
                array_merge($acc, ['is_active' => true])
            );
        }
    }
}

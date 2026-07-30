<?php

namespace App\Http\Controllers;

use App\Enums\MemberStatus;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberStatusRequest;
use App\Models\Member;
use App\Services\Members\MemberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function __construct(private readonly MemberService $memberService) {}

    public function index(Request $request): Response
    {
        $members = Member::query()
            ->when($request->search, fn ($q, $s) => $q->where('full_name', 'ilike', "%{$s}%")->orWhere('member_no', 'ilike', "%{$s}%"))
            ->when($request->status, fn ($q, $st) => $q->where('status', $st))
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('Admin/Members', [
            'members' => $members,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(StoreMemberRequest $request): RedirectResponse
    {
        $actorName = $request->user()?->name ?? 'Staff';
        $this->memberService->registerMember($request->validated(), $actorName);

        return back()->with('success', 'Anggota berhasil didaftarkan.');
    }

    public function updateStatus(UpdateMemberStatusRequest $request, Member $member): RedirectResponse
    {
        $actorName = $request->user()?->name ?? 'Admin';
        $newStatus = MemberStatus::from($request->status);

        $this->memberService->updateMemberStatus($member->id, $newStatus, $request->reason, $actorName);

        return back()->with('success', 'Status anggota berhasil diperbarui.');
    }
}

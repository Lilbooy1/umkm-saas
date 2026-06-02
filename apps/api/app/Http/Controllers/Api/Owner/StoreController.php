<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $stores = $request->user()
            ->stores()
            ->latest('stores.created_at')
            ->get();

        return response()->json([
            'message' => 'Daftar toko milik user berhasil diambil.',
            'data' => $stores,
        ]);
    }

    public function show(Request $request, Store $store): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);

        return response()->json([
            'message' => 'Detail toko berhasil diambil.',
            'data' => $store,
        ]);
    }

    public function update(Request $request, Store $store): JsonResponse
    {
        $this->ensureUserIsStoreOwner($request, $store);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'string', 'max:255'],
            'banner_url' => ['nullable', 'string', 'max:255'],
        ]);

        if (isset($validated['email'])) {
            $validated['email'] = strtolower($validated['email']);
        }

        $store->update($validated);

        return response()->json([
            'message' => 'Profil toko berhasil diperbarui.',
            'data' => $store->fresh(),
        ]);
    }

    private function ensureUserHasAccessToStore(Request $request, Store $store): void
    {
        $hasAccess = $request->user()
            ->stores()
            ->where('stores.id', $store->id)
            ->exists();

        abort_if(! $hasAccess, 403, 'Kamu tidak punya akses ke toko ini.');
    }

    private function ensureUserIsStoreOwner(Request $request, Store $store): void
    {
        $isOwner = $request->user()
            ->stores()
            ->where('stores.id', $store->id)
            ->wherePivot('role', 'owner')
            ->exists();

        abort_if(! $isOwner, 403, 'Hanya owner toko yang boleh mengubah profil toko.');
    }
}

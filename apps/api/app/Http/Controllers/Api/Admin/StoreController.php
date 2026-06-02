<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    public function index(): JsonResponse
    {
        $stores = Store::query()
            ->with(['users:id,name,email,role'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'Daftar toko berhasil diambil.',
            'data' => $stores,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],

            'owner.name' => ['required', 'string', 'max:100'],
            'owner.email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'owner.password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $store = Store::create([
                'name' => $validated['name'],
                'slug' => $this->makeUniqueSlug($validated['name']),
                'category' => $validated['category'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => isset($validated['email'])
                    ? strtolower($validated['email'])
                    : null,
                'address' => $validated['address'] ?? null,
                'description' => $validated['description'] ?? null,
                'is_active' => true,
            ]);

            $owner = User::create([
                'name' => $validated['owner']['name'],
                'email' => strtolower($validated['owner']['email']),
                'password' => $validated['owner']['password'],
                'role' => 'owner',
            ]);

            $store->users()->attach($owner->id, [
                'role' => 'owner',
            ]);

            return [
                'store' => $store->load('users:id,name,email,role'),
                'owner' => $owner,
            ];
        });

        return response()->json([
            'message' => 'Toko UMKM berhasil dibuat.',
            'data' => $result,
        ], 201);
    }

    public function show(Store $store): JsonResponse
    {
        return response()->json([
            'message' => 'Detail toko berhasil diambil.',
            'data' => $store->load('users:id,name,email,role'),
        ]);
    }

    public function update(Request $request, Store $store): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['name']) && $validated['name'] !== $store->name) {
            $validated['slug'] = $this->makeUniqueSlug($validated['name'], $store->id);
        }

        if (isset($validated['email'])) {
            $validated['email'] = strtolower($validated['email']);
        }

        $store->update($validated);

        return response()->json([
            'message' => 'Toko berhasil diperbarui.',
            'data' => $store->fresh()->load('users:id,name,email,role'),
        ]);
    }

    public function destroy(Store $store): JsonResponse
    {
        $store->update([
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'Toko berhasil dinonaktifkan.',
        ]);
    }

    private function makeUniqueSlug(string $name, ?int $ignoreStoreId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 2;

        while (
            Store::query()
                ->where('slug', $slug)
                ->when($ignoreStoreId, fn ($query) => $query->where('id', '!=', $ignoreStoreId))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}

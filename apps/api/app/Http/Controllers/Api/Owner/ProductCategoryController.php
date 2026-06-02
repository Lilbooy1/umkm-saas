<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductCategoryController extends Controller
{
    public function index(Request $request, Store $store): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);

        $categories = $store->productCategories()
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'Daftar kategori produk berhasil diambil.',
            'data' => $categories,
        ]);
    }

    public function store(Request $request, Store $store): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('product_categories', 'name')
                    ->where('store_id', $store->id),
            ],
        ]);

        $category = $store->productCategories()->create([
            'name' => $validated['name'],
            'slug' => $this->makeUniqueSlug($store, $validated['name']),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Kategori produk berhasil dibuat.',
            'data' => $category,
        ], 201);
    }

    public function show(Request $request, Store $store, ProductCategory $category): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);
        $this->ensureCategoryBelongsToStore($store, $category);

        return response()->json([
            'message' => 'Detail kategori produk berhasil diambil.',
            'data' => $category,
        ]);
    }

    public function update(Request $request, Store $store, ProductCategory $category): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);
        $this->ensureCategoryBelongsToStore($store, $category);

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:120',
                Rule::unique('product_categories', 'name')
                    ->where('store_id', $store->id)
                    ->ignore($category->id),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['name']) && $validated['name'] !== $category->name) {
            $validated['slug'] = $this->makeUniqueSlug($store, $validated['name'], $category->id);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Kategori produk berhasil diperbarui.',
            'data' => $category->fresh(),
        ]);
    }

    public function destroy(Request $request, Store $store, ProductCategory $category): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);
        $this->ensureCategoryBelongsToStore($store, $category);

        $category->update([
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'Kategori produk berhasil dinonaktifkan.',
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

    private function ensureCategoryBelongsToStore(Store $store, ProductCategory $category): void
    {
        abort_if(
            $category->store_id !== $store->id,
            404,
            'Kategori produk tidak ditemukan di toko ini.'
        );
    }

    private function makeUniqueSlug(Store $store, string $name, ?int $ignoreCategoryId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 2;

        while (
            ProductCategory::query()
                ->where('store_id', $store->id)
                ->where('slug', $slug)
                ->when($ignoreCategoryId, fn ($query) => $query->where('id', '!=', $ignoreCategoryId))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}

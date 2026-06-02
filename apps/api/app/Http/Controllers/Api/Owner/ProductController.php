<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request, Store $store): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);

        $products = $store->products()
            ->with('category:id,name,slug')
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'Daftar produk berhasil diambil.',
            'data' => $products,
        ]);
    }

    public function store(Request $request, Store $store): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);

        $validated = $request->validate([
            'product_category_id' => [
                'nullable',
                'integer',
                Rule::exists('product_categories', 'id')
                    ->where('store_id', $store->id),
            ],
            'name' => [
                'required',
                'string',
                'max:160',
                Rule::unique('products', 'name')
                    ->where('store_id', $store->id),
            ],
            'sku' => ['nullable', 'string', 'max:80'],
            'description' => ['nullable', 'string'],
            'product_type' => ['required', Rule::in(['physical', 'service', 'digital'])],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'track_stock' => ['sometimes', 'boolean'],
            'is_preorder' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'image_url' => ['nullable', 'string', 'max:255'],
        ]);

        $product = $store->products()->create([
            'product_category_id' => $validated['product_category_id'] ?? null,
            'name' => $validated['name'],
            'slug' => $this->makeUniqueSlug($store, $validated['name']),
            'sku' => $validated['sku'] ?? null,
            'description' => $validated['description'] ?? null,
            'product_type' => $validated['product_type'],
            'price' => $validated['price'],
            'compare_at_price' => $validated['compare_at_price'] ?? null,
            'stock_quantity' => $validated['stock_quantity'] ?? 0,
            'track_stock' => $validated['track_stock'] ?? true,
            'is_preorder' => $validated['is_preorder'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
            'image_url' => $validated['image_url'] ?? null,
        ]);

        return response()->json([
            'message' => 'Produk berhasil dibuat.',
            'data' => $product->load('category:id,name,slug'),
        ], 201);
    }

    public function show(Request $request, Store $store, Product $product): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);
        $this->ensureProductBelongsToStore($store, $product);

        return response()->json([
            'message' => 'Detail produk berhasil diambil.',
            'data' => $product->load('category:id,name,slug'),
        ]);
    }

    public function update(Request $request, Store $store, Product $product): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);
        $this->ensureProductBelongsToStore($store, $product);

        $validated = $request->validate([
            'product_category_id' => [
                'nullable',
                'integer',
                Rule::exists('product_categories', 'id')
                    ->where('store_id', $store->id),
            ],
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:160',
                Rule::unique('products', 'name')
                    ->where('store_id', $store->id)
                    ->ignore($product->id),
            ],
            'sku' => ['nullable', 'string', 'max:80'],
            'description' => ['nullable', 'string'],
            'product_type' => ['sometimes', Rule::in(['physical', 'service', 'digital'])],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'track_stock' => ['sometimes', 'boolean'],
            'is_preorder' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'image_url' => ['nullable', 'string', 'max:255'],
        ]);

        if (isset($validated['name']) && $validated['name'] !== $product->name) {
            $validated['slug'] = $this->makeUniqueSlug($store, $validated['name'], $product->id);
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data' => $product->fresh()->load('category:id,name,slug'),
        ]);
    }

    public function destroy(Request $request, Store $store, Product $product): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);
        $this->ensureProductBelongsToStore($store, $product);

        $product->update([
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'Produk berhasil dinonaktifkan.',
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

    private function ensureProductBelongsToStore(Store $store, Product $product): void
    {
        abort_if(
            $product->store_id !== $store->id,
            404,
            'Produk tidak ditemukan di toko ini.'
        );
    }

    private function makeUniqueSlug(Store $store, string $name, ?int $ignoreProductId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 2;

        while (
            Product::query()
                ->where('store_id', $store->id)
                ->where('slug', $slug)
                ->when($ignoreProductId, fn ($query) => $query->where('id', '!=', $ignoreProductId))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}

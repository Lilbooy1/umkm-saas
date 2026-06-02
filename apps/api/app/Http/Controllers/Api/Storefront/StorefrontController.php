<?php

namespace App\Http\Controllers\Api\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StorefrontController extends Controller
{
    public function showStore(Store $store): JsonResponse
    {
        $this->ensureStoreIsActive($store);

        return response()->json([
            'message' => 'Detail toko berhasil diambil.',
            'data' => $store,
        ]);
    }

    public function categories(Store $store): JsonResponse
    {
        $this->ensureStoreIsActive($store);

        $categories = $store->productCategories()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'message' => 'Kategori toko berhasil diambil.',
            'data' => $categories,
        ]);
    }

    public function products(Request $request, Store $store): JsonResponse
    {
        $this->ensureStoreIsActive($store);

        $products = $store->products()
            ->with('category:id,name,slug')
            ->where('is_active', true)
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->whereHas('category', function ($categoryQuery) use ($request) {
                    $categoryQuery->where('slug', $request->query('category'));
                });
            })
            ->when($request->boolean('featured'), function ($query) {
                $query->where('is_featured', true);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->query('search');

                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(12);

        return response()->json([
            'message' => 'Daftar produk toko berhasil diambil.',
            'data' => $products,
        ]);
    }

    public function showProduct(Store $store, Product $product): JsonResponse
    {
        $this->ensureStoreIsActive($store);
        $this->ensureProductBelongsToStore($store, $product);

        abort_if(! $product->is_active, 404, 'Produk tidak ditemukan.');

        return response()->json([
            'message' => 'Detail produk berhasil diambil.',
            'data' => $product->load('category:id,name,slug'),
        ]);
    }

    private function ensureStoreIsActive(Store $store): void
    {
        abort_if(! $store->is_active, 404, 'Toko tidak ditemukan atau sedang tidak aktif.');
    }

    private function ensureProductBelongsToStore(Store $store, Product $product): void
    {
        abort_if(
            $product->store_id !== $store->id,
            404,
            'Produk tidak ditemukan di toko ini.'
        );
    }
}

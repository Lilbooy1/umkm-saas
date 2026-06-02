"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

type Product = {
  id: number;
  store_id: number;
  product_category_id: number | null;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  product_type: string;
  price: string;
  compare_at_price: string | null;
  stock_quantity: number;
  track_stock: boolean;
  is_preorder: boolean;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

type ProductsResponse = {
  message: string;
  data: {
    data: Product[];
  };
};

function formatRupiah(value: string | number) {
  const numberValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export default function OwnerProductsPage() {
  const router = useRouter();
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingProductId, setProcessingProductId] = useState<number | null>(
    null,
  );

  async function loadProducts() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await apiFetch<ProductsResponse>(
        `/owner/stores/${storeId}/products`,
        {
          token,
        },
      );

      setProducts(response.data.data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setError("Kamu tidak punya akses ke toko ini.");
        return;
      }

      removeAuthToken();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  async function handleDeactivateProduct(productId: number) {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setProcessingProductId(productId);
    setError("");

    try {
      await apiFetch(`/owner/stores/${storeId}/products/${productId}`, {
        method: "DELETE",
        token,
      });

      await loadProducts();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Gagal menonaktifkan produk.");
      }
    } finally {
      setProcessingProductId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/owner"
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke dashboard owner
        </Link>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-medium text-zinc-400">Owner Products</p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Kelola Produk</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Lihat produk toko, stok, harga, dan status aktif produk.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadProducts}
                className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
              >
                Refresh
              </button>

              <Link
                href={`/owner/stores/${storeId}/products/create`}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Tambah Produk
              </Link>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400">Memuat produk toko...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const isProcessing = processingProductId === product.id;

                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
                  >
                    <div className="flex h-44 items-center justify-center bg-zinc-800 text-sm text-zinc-500">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "Belum ada gambar"
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {product.category ? (
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                              {product.category.name}
                            </p>
                          ) : (
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                              Tanpa kategori
                            </p>
                          )}

                          <h2 className="mt-2 text-lg font-bold">
                            {product.name}
                          </h2>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            product.is_active
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          {product.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-zinc-400">
                        <p>SKU: {product.sku ?? "-"}</p>
                        <p>Tipe: {product.product_type}</p>
                        <p>Stok: {product.track_stock ? product.stock_quantity : "Tidak dilacak"}</p>
                      </div>

                      <div className="mt-5">
                        <p className="text-xl font-bold">
                          {formatRupiah(product.price)}
                        </p>

                        {product.compare_at_price ? (
                          <p className="text-sm text-zinc-500 line-through">
                            {formatRupiah(product.compare_at_price)}
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/owner/stores/${storeId}/products/${product.id}`}
                          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                        >
                          Detail
                        </Link>

                        <Link
                          href={`/toko/${product.slug}`}
                          className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                        >
                          Lihat Publik
                        </Link>

                        {product.is_active ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivateProduct(product.id)}
                            disabled={isProcessing}
                            className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isProcessing ? "Memproses..." : "Nonaktifkan"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <h2 className="text-xl font-semibold">Belum ada produk</h2>
              <p className="mt-2 text-zinc-400">
                Produk toko akan muncul di sini setelah dibuat.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
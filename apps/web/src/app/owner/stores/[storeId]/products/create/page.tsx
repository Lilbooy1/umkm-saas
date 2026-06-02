"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
};

type CategoriesResponse = {
  message: string;
  data: {
    data: ProductCategory[];
  };
};

type CreateProductResponse = {
  message: string;
  data: {
    id: number;
    name: string;
    slug: string;
  };
};

export default function OwnerCreateProductPage() {
  const router = useRouter();
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;

  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [productCategoryId, setProductCategoryId] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState("physical");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [trackStock, setTrackStock] = useState(true);
  const [isPreorder, setIsPreorder] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadCategories() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await apiFetch<CategoriesResponse>(
        `/owner/stores/${storeId}/categories`,
        {
          token,
        },
      );

      setCategories(response.data.data.filter((category) => category.is_active));
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
    void loadCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await apiFetch<CreateProductResponse>(
        `/owner/stores/${storeId}/products`,
        {
          method: "POST",
          token,
          body: {
            product_category_id: productCategoryId
              ? Number(productCategoryId)
              : null,
            name,
            sku: sku || null,
            description: description || null,
            product_type: productType,
            price: Number(price),
            compare_at_price: compareAtPrice
              ? Number(compareAtPrice)
              : null,
            stock_quantity: Number(stockQuantity),
            track_stock: trackStock,
            is_preorder: isPreorder,
            is_active: isActive,
            is_featured: isFeatured,
            image_url: imageUrl || null,
          },
        },
      );

      router.push(`/owner/stores/${storeId}/products`);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        setFieldErrors(error.errors ?? {});
      } else {
        setError("Gagal membuat produk.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/owner/stores/${storeId}/products`}
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke produk
        </Link>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
        >
          <p className="text-sm font-medium text-zinc-400">Create Product</p>

          <h1 className="mt-3 text-3xl font-bold">Tambah Produk Baru</h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Produk yang dibuat akan langsung masuk ke katalog toko sesuai status
            aktifnya.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400">Memuat kategori...</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Nama Produk
                  </label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="Contoh: Es Kopi Susu Aren"
                    required
                  />
                  {fieldErrors.name ? (
                    <p className="mt-2 text-xs text-red-300">
                      {fieldErrors.name[0]}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Kategori
                  </label>
                  <select
                    value={productCategoryId}
                    onChange={(event) =>
                      setProductCategoryId(event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  >
                    <option value="">Tanpa kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    SKU
                  </label>
                  <input
                    value={sku}
                    onChange={(event) => setSku(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="Contoh: KOPI-AREN-001"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Deskripsi
                  </label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="mt-2 min-h-32 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="Deskripsi produk"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    URL Gambar
                  </label>
                  <input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="https://example.com/product.jpg"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Tipe Produk
                  </label>
                  <select
                    value={productType}
                    onChange={(event) => setProductType(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  >
                    <option value="physical">Produk Fisik</option>
                    <option value="service">Jasa</option>
                    <option value="digital">Produk Digital</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Harga
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="18000"
                    required
                  />
                  {fieldErrors.price ? (
                    <p className="mt-2 text-xs text-red-300">
                      {fieldErrors.price[0]}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Harga Coret
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={compareAtPrice}
                    onChange={(event) =>
                      setCompareAtPrice(event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="22000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Stok
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="50"
                  />
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm font-medium text-zinc-300">
                    Pengaturan Produk
                  </p>

                  <div className="mt-4 space-y-3 text-sm text-zinc-300">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={trackStock}
                        onChange={(event) =>
                          setTrackStock(event.target.checked)
                        }
                      />
                      Track stok produk
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(event) =>
                          setIsActive(event.target.checked)
                        }
                      />
                      Produk aktif
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(event) =>
                          setIsFeatured(event.target.checked)
                        }
                      />
                      Produk unggulan
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isPreorder}
                        onChange={(event) =>
                          setIsPreorder(event.target.checked)
                        }
                      />
                      Pre-order
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
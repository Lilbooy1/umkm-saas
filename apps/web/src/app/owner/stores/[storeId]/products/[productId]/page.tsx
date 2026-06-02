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

type ProductResponse = {
  message: string;
  data: Product;
};

type CategoriesResponse = {
  message: string;
  data: {
    data: ProductCategory[];
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

export default function OwnerProductDetailPage() {
  const router = useRouter();
  const params = useParams<{
    storeId: string;
    productId: string;
  }>();

  const storeId = params.storeId;
  const productId = params.productId;

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

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
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadProductDetail() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const [productResponse, categoriesResponse] = await Promise.all([
        apiFetch<ProductResponse>(
          `/owner/stores/${storeId}/products/${productId}`,
          {
            token,
          },
        ),
        apiFetch<CategoriesResponse>(`/owner/stores/${storeId}/categories`, {
          token,
        }),
      ]);

      const productData = productResponse.data;

      setProduct(productData);
      setCategories(
        categoriesResponse.data.data.filter((category) => category.is_active),
      );

      setProductCategoryId(
        productData.product_category_id
          ? String(productData.product_category_id)
          : "",
      );
      setName(productData.name);
      setSku(productData.sku ?? "");
      setDescription(productData.description ?? "");
      setProductType(productData.product_type);
      setPrice(productData.price);
      setCompareAtPrice(productData.compare_at_price ?? "");
      setStockQuantity(String(productData.stock_quantity));
      setTrackStock(productData.track_stock);
      setIsPreorder(productData.is_preorder);
      setIsActive(productData.is_active);
      setIsFeatured(productData.is_featured);
      setImageUrl(productData.image_url ?? "");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setError("Kamu tidak punya akses ke produk ini.");
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
    void loadProductDetail();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, productId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setSuccessMessage("");
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await apiFetch<ProductResponse>(
        `/owner/stores/${storeId}/products/${productId}`,
        {
          method: "PATCH",
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

      setProduct(response.data);
      setSuccessMessage("Produk berhasil diperbarui.");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        setFieldErrors(error.errors ?? {});
      } else {
        setError("Gagal memperbarui produk.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivateProduct() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await apiFetch(`/owner/stores/${storeId}/products/${productId}`, {
        method: "DELETE",
        token,
      });

      setIsActive(false);
      setSuccessMessage("Produk berhasil dinonaktifkan.");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Gagal menonaktifkan produk.");
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

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          {isLoading ? (
            <p className="text-sm text-zinc-400">Memuat detail produk...</p>
          ) : error && !product ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
              {error}
            </div>
          ) : product ? (
            <>
              <p className="text-sm font-medium text-zinc-400">
                Owner Product Detail
              </p>

              <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{product.name}</h1>

                  <p className="mt-2 text-sm text-zinc-500">
                    Slug: {product.slug}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {isActive ? "Aktif" : "Nonaktif"}
                    </span>

                    {isFeatured ? (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 lg:min-w-80">
                  <p className="text-sm text-zinc-500">Harga Produk</p>
                  <p className="mt-2 text-3xl font-bold">
                    {formatRupiah(price || 0)}
                  </p>
                </div>
              </div>

              {error ? (
                <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                  {successMessage}
                </div>
              ) : null}

              <form
                onSubmit={handleSubmit}
                className="mt-8 grid gap-6 lg:grid-cols-2"
              >
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-zinc-300">
                      Nama Produk
                    </label>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
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

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>

                    {isActive ? (
                      <button
                        type="button"
                        onClick={handleDeactivateProduct}
                        disabled={isSubmitting}
                        className="w-full rounded-full border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Nonaktifkan
                      </button>
                    ) : null}
                  </div>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
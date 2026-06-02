"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

type ProductCategory = {
  id: number;
  store_id: number;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
};

type CategoriesResponse = {
  message: string;
  data: {
    data: ProductCategory[];
  };
};

type CategoryResponse = {
  message: string;
  data: ProductCategory;
};

export default function OwnerCategoriesPage() {
  const router = useRouter();
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [editingName, setEditingName] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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

      setCategories(response.data.data);
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

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
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
      await apiFetch<CategoryResponse>(`/owner/stores/${storeId}/categories`, {
        method: "POST",
        token,
        body: {
          name: newCategoryName,
        },
      });

      setNewCategoryName("");
      setSuccessMessage("Kategori berhasil dibuat.");
      await loadCategories();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        setFieldErrors(error.errors ?? {});
      } else {
        setError("Gagal membuat kategori.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(category: ProductCategory) {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
    setError("");
    setSuccessMessage("");
    setFieldErrors({});
  }

  function cancelEditing() {
    setEditingCategoryId(null);
    setEditingName("");
  }

  async function handleUpdateCategory(categoryId: number) {
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
      await apiFetch<CategoryResponse>(
        `/owner/stores/${storeId}/categories/${categoryId}`,
        {
          method: "PATCH",
          token,
          body: {
            name: editingName,
          },
        },
      );

      setEditingCategoryId(null);
      setEditingName("");
      setSuccessMessage("Kategori berhasil diperbarui.");
      await loadCategories();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        setFieldErrors(error.errors ?? {});
      } else {
        setError("Gagal memperbarui kategori.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivateCategory(categoryId: number) {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await apiFetch(`/owner/stores/${storeId}/categories/${categoryId}`, {
        method: "DELETE",
        token,
      });

      setSuccessMessage("Kategori berhasil dinonaktifkan.");
      await loadCategories();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Gagal menonaktifkan kategori.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleActivateCategory(categoryId: number) {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await apiFetch<CategoryResponse>(
        `/owner/stores/${storeId}/categories/${categoryId}`,
        {
          method: "PATCH",
          token,
          body: {
            is_active: true,
          },
        },
      );

      setSuccessMessage("Kategori berhasil diaktifkan.");
      await loadCategories();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Gagal mengaktifkan kategori.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/owner"
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke dashboard owner
        </Link>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-medium text-zinc-400">
            Owner Categories
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Kelola Kategori Produk</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Kategori dipakai untuk mengelompokkan produk di toko publik.
              </p>
            </div>

            <Link
              href={`/owner/stores/${storeId}/products`}
              className="w-fit rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
            >
              Kelola Produk
            </Link>
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
            onSubmit={handleCreateCategory}
            className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <h2 className="font-semibold">Tambah Kategori Baru</h2>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                  placeholder="Contoh: Minuman"
                  required
                />

                {fieldErrors.name ? (
                  <p className="mt-2 text-xs text-red-300">
                    {fieldErrors.name[0]}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Menyimpan..." : "Tambah"}
              </button>
            </div>
          </form>

          {isLoading ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400">Memuat kategori...</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="mt-8 space-y-4">
              {categories.map((category) => {
                const isEditing = editingCategoryId === category.id;

                return (
                  <article
                    key={category.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            value={editingName}
                            onChange={(event) =>
                              setEditingName(event.target.value)
                            }
                            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                          />
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center gap-3">
                              <h2 className="text-lg font-bold">
                                {category.name}
                              </h2>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  category.is_active
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : "bg-red-500/10 text-red-300"
                                }`}
                              >
                                {category.is_active ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-zinc-500">
                              Slug: {category.slug}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateCategory(category.id)
                              }
                              disabled={isSubmitting}
                              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Simpan
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={isSubmitting}
                              className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(category)}
                              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                            >
                              Edit
                            </button>

                            {category.is_active ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeactivateCategory(category.id)
                                }
                                disabled={isSubmitting}
                                className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Nonaktifkan
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleActivateCategory(category.id)
                                }
                                disabled={isSubmitting}
                                className="rounded-full border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Aktifkan
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <h2 className="text-xl font-semibold">Belum ada kategori</h2>
              <p className="mt-2 text-zinc-400">
                Tambahkan kategori pertama untuk mengelompokkan produk toko.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
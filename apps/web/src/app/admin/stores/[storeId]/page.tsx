"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Store = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type MeResponse = {
  user: User;
};

type StoreResponse = {
  message: string;
  data: Store;
};

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminStoreDetailPage() {
  const router = useRouter();
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;

  const [store, setStore] = useState<Store | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadStore() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const meResponse = await apiFetch<MeResponse>("/me", {
        token,
      });

      if (meResponse.user.role !== "super_admin") {
        setError("Akun ini tidak punya akses ke halaman super admin.");
        return;
      }

      const response = await apiFetch<StoreResponse>(
        `/admin/stores/${storeId}`,
        {
          token,
        },
      );

      const storeData = response.data;

      setStore(storeData);
      setName(storeData.name);
      setCategory(storeData.category ?? "");
      setPhone(storeData.phone ?? "");
      setEmail(storeData.email ?? "");
      setAddress(storeData.address ?? "");
      setDescription(storeData.description ?? "");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setError("Kamu tidak punya akses ke detail UMKM ini.");
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
    void loadStore();

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
    setSuccessMessage("");
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await apiFetch<StoreResponse>(
        `/admin/stores/${storeId}`,
        {
          method: "PATCH",
          token,
          body: {
            name,
            category: category || null,
            phone: phone || null,
            email: email || null,
            address: address || null,
            description: description || null,
          },
        },
      );

      const storeData = response.data;

      setStore(storeData);
      setName(storeData.name);
      setCategory(storeData.category ?? "");
      setPhone(storeData.phone ?? "");
      setEmail(storeData.email ?? "");
      setAddress(storeData.address ?? "");
      setDescription(storeData.description ?? "");

      setSuccessMessage("Data UMKM berhasil diperbarui.");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        setFieldErrors(error.errors ?? {});
      } else {
        setError("Gagal memperbarui data UMKM.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivateStore() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await apiFetch(`/admin/stores/${storeId}`, {
        method: "DELETE",
        token,
      });

      setStore((currentStore) =>
        currentStore ? { ...currentStore, is_active: false } : currentStore,
      );

      setSuccessMessage("UMKM berhasil dinonaktifkan.");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Gagal menonaktifkan UMKM.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleActivateStore() {
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
      const response = await apiFetch<StoreResponse>(
        `/admin/stores/${storeId}`,
        {
          method: "PATCH",
          token,
          body: {
            name,
            category: category || null,
            phone: phone || null,
            email: email || null,
            address: address || null,
            description: description || null,
            is_active: true,
          },
        },
      );

      setStore(response.data);
      setSuccessMessage("UMKM berhasil diaktifkan.");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        setFieldErrors(error.errors ?? {});
      } else {
        setError("Gagal mengaktifkan UMKM.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/stores"
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke daftar toko
        </Link>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          {isLoading ? (
            <p className="text-sm text-zinc-400">Memuat detail UMKM...</p>
          ) : error && !store ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
              {error}
            </div>
          ) : store ? (
            <>
              <p className="text-sm font-medium text-zinc-400">
                Admin Store Detail
              </p>

              <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{store.name}</h1>

                  <p className="mt-2 text-sm text-zinc-500">
                    /toko/{store.slug}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        store.is_active
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {store.is_active ? "Aktif" : "Nonaktif"}
                    </span>

                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                      Store ID: {store.id}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/toko/${store.slug}`}
                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                  >
                    Lihat Toko
                  </Link>

                  <Link
                    href={`/owner/stores/${store.id}/orders`}
                    className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                  >
                    Order
                  </Link>

                  <Link
                    href={`/owner/stores/${store.id}/products`}
                    className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                  >
                    Produk
                  </Link>
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
                className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]"
              >
                <section className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-zinc-300">
                      Nama Toko
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
                      Kategori Usaha
                    </label>

                    <input
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    />

                    {fieldErrors.category ? (
                      <p className="mt-2 text-xs text-red-300">
                        {fieldErrors.category[0]}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-300">
                      Deskripsi Toko
                    </label>

                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="mt-2 min-h-36 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    />

                    {fieldErrors.description ? (
                      <p className="mt-2 text-xs text-red-300">
                        {fieldErrors.description[0]}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-300">
                      Alamat
                    </label>

                    <textarea
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      className="mt-2 min-h-28 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    />

                    {fieldErrors.address ? (
                      <p className="mt-2 text-xs text-red-300">
                        {fieldErrors.address[0]}
                      </p>
                    ) : null}
                  </div>
                </section>

                <aside className="space-y-5">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <h2 className="font-semibold">Kontak Toko</h2>

                    <div className="mt-5 space-y-5">
                      <div>
                        <label className="text-sm font-medium text-zinc-300">
                          Nomor WhatsApp
                        </label>

                        <input
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                        />

                        {fieldErrors.phone ? (
                          <p className="mt-2 text-xs text-red-300">
                            {fieldErrors.phone[0]}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-zinc-300">
                          Email Toko
                        </label>

                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                        />

                        {fieldErrors.email ? (
                          <p className="mt-2 text-xs text-red-300">
                            {fieldErrors.email[0]}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <h2 className="font-semibold">Info Sistem</h2>

                    <div className="mt-5 space-y-3 text-sm text-zinc-300">
                      <div>
                        <p className="text-zinc-500">Slug</p>
                        <p className="mt-1 font-medium">/toko/{store.slug}</p>
                      </div>

                      <div>
                        <p className="text-zinc-500">Dibuat</p>
                        <p className="mt-1 font-medium">
                          {formatDate(store.created_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-zinc-500">Terakhir Update</p>
                        <p className="mt-1 font-medium">
                          {formatDate(store.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>

                  {store.is_active ? (
                    <button
                      type="button"
                      onClick={handleDeactivateStore}
                      disabled={isSubmitting}
                      className="w-full rounded-full border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Nonaktifkan UMKM
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleActivateStore}
                      disabled={isSubmitting}
                      className="w-full rounded-full border border-emerald-500/30 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Aktifkan UMKM
                    </button>
                  )}
                </aside>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
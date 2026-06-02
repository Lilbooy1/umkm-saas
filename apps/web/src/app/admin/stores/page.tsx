"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
};

type MeResponse = {
  user: User;
};

type AdminStoresResponse = {
  message: string;
  data:
    | Store[]
    | {
        data: Store[];
      };
};

function resolveStoresPayload(response: AdminStoresResponse): Store[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.data;
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminStoresPage() {
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadStores() {
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

      const storesResponse = await apiFetch<AdminStoresResponse>(
        "/admin/stores",
        {
          token,
        },
      );

      setStores(resolveStoresPayload(storesResponse));
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setError("Kamu tidak punya akses ke halaman toko admin.");
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
    void loadStores();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const keyword = searchKeyword.toLowerCase().trim();

      const matchesKeyword =
        !keyword ||
        store.name.toLowerCase().includes(keyword) ||
        store.slug.toLowerCase().includes(keyword) ||
        store.category?.toLowerCase().includes(keyword) ||
        store.email?.toLowerCase().includes(keyword) ||
        store.phone?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && store.is_active) ||
        (statusFilter === "inactive" && !store.is_active);

      return matchesKeyword && matchesStatus;
    });
  }, [stores, searchKeyword, statusFilter]);

  const totalActiveStores = useMemo(() => {
    return stores.filter((store) => store.is_active).length;
  }, [stores]);

  const totalInactiveStores = useMemo(() => {
    return stores.filter((store) => !store.is_active).length;
  }, [stores]);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke dashboard admin
        </Link>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">
                Admin Stores
              </p>

              <h1 className="mt-3 text-3xl font-bold">Kelola Toko UMKM</h1>

              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Pantau semua tenant UMKM yang terdaftar di platform, termasuk
                status aktif, kontak toko, dan akses storefront publik.
              </p>
            </div>

            <Link
              href="/admin/stores/create"
              className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Tambah UMKM
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">Total UMKM</p>
              <p className="mt-2 text-2xl font-bold">{stores.length}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">UMKM Aktif</p>
              <p className="mt-2 text-2xl font-bold">{totalActiveStores}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">UMKM Nonaktif</p>
              <p className="mt-2 text-2xl font-bold">{totalInactiveStores}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px_120px]">
              <input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                placeholder="Cari nama toko, slug, kategori, email, atau nomor..."
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>

              <button
                type="button"
                onClick={loadStores}
                className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
              >
                Refresh
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400">Memuat daftar UMKM...</p>
            </div>
          ) : filteredStores.length > 0 ? (
            <div className="mt-8 space-y-4">
              {filteredStores.map((store) => (
                <article
                  key={store.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold">{store.name}</h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            store.is_active
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          {store.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-zinc-500">
                        /toko/{store.slug}
                      </p>

                      <div className="mt-4 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
                        <p>Kategori: {store.category ?? "-"}</p>
                        <p>Email: {store.email ?? "-"}</p>
                        <p>WhatsApp: {store.phone ?? "-"}</p>
                        <p>Dibuat: {formatDate(store.created_at)}</p>
                      </div>

                      {store.address ? (
                        <p className="mt-3 text-sm text-zinc-500">
                          Alamat: {store.address}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3 lg:justify-end">
                      <Link
                        href={`/admin/stores/${store.id}`}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                      >
                        Detail UMKM
                      </Link>

                      <Link
                        href={`/owner/stores/${store.id}/products`}
                        className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                      >
                        Produk
                      </Link>

                      <Link
                        href={`/owner/stores/${store.id}/orders`}
                        className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                      >
                        Order
                      </Link>

                      <Link
                        href={`/toko/${store.slug}`}
                        className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                      >
                        Lihat Toko
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <h2 className="text-xl font-semibold">Data toko tidak ditemukan</h2>

              <p className="mt-2 text-zinc-400">
                Belum ada UMKM, atau filter pencarian tidak menemukan data yang
                sesuai.
              </p>

              <Link
                href="/admin/stores/create"
                className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Tambah UMKM
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
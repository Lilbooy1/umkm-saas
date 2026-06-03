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

export default function AdminDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const totalActiveStores = useMemo(() => {
    return stores.filter((store) => store.is_active).length;
  }, [stores]);

  const totalInactiveStores = useMemo(() => {
    return stores.filter((store) => !store.is_active).length;
  }, [stores]);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadAdminDashboard() {
      try {
        const meResponse = await apiFetch<MeResponse>("/me", {
          token,
        });

        if (meResponse.user.role !== "super_admin") {
          setError("Akun ini tidak punya akses ke dashboard super admin.");
          return;
        }

        const storesResponse = await apiFetch<AdminStoresResponse>(
          "/admin/stores",
          {
            token,
          },
        );

        setUser(meResponse.user);
        setStores(resolveStoresPayload(storesResponse));
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          setError("Kamu tidak punya akses ke halaman super admin.");
          return;
        }

        removeAuthToken();
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    void loadAdminDashboard();
  }, [router]);

  async function handleLogout() {
    const token = getAuthToken();

    setIsLoggingOut(true);

    if (token) {
      await apiFetch<{ message: string }>("/logout", {
        method: "POST",
        token,
      }).catch(() => null);
    }

    removeAuthToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">
                Super Admin Dashboard
              </p>

              <h1 className="mt-3 text-3xl font-bold">
                Dashboard Platform UMKM
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Kelola semua toko UMKM, owner, dan status tenant dari satu
                dashboard platform.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logout..." : "Logout"}
            </button>
          </div>

          {error ? (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400">
                Memuat dashboard super admin...
              </p>
            </div>
          ) : user ? (
            <>
              <div className="mt-8 grid gap-5 md:grid-cols-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">Super Admin</p>
                  <p className="mt-2 font-semibold">{user.name}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">Total UMKM</p>
                  <p className="mt-2 text-2xl font-bold">{stores.length}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">UMKM Aktif</p>
                  <p className="mt-2 text-2xl font-bold">
                    {totalActiveStores}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">UMKM Nonaktif</p>
                  <p className="mt-2 text-2xl font-bold">
                    {totalInactiveStores}
                  </p>
                </div>
              </div>

              <section className="mt-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-400">
                      Tenant UMKM
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      Daftar Toko Terbaru
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/admin/stores"
                      className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                    >
                      Lihat Semua Toko
                    </Link>

                    <Link
                      href="/admin/stores/create"
                      className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                    >
                      Tambah UMKM
                    </Link>
                  </div>
                </div>

                {stores.length > 0 ? (
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    {stores.slice(0, 6).map((store) => (
                      <article
                        key={store.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-zinc-500">
                              {store.category ?? "UMKM Store"}
                            </p>

                            <h3 className="mt-2 text-xl font-bold">
                              {store.name}
                            </h3>

                            <p className="mt-2 text-sm text-zinc-500">
                              /toko/{store.slug}
                            </p>
                          </div>

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

                        <div className="mt-5 space-y-1 text-sm text-zinc-400">
                          <p>Owner Email: {store.email ?? "-"}</p>
                          <p>WhatsApp: {store.phone ?? "-"}</p>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            href={`/admin/stores/${store.id}`}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                          >
                            Detail UMKM
                          </Link>

                          <Link
                            href={`/toko/${store.slug}`}
                            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                          >
                            Lihat Toko
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
                    <h3 className="text-xl font-semibold">
                      Belum ada toko UMKM
                    </h3>

                    <p className="mt-2 text-zinc-400">
                      Tambahkan UMKM pertama untuk mulai memakai platform.
                    </p>

                    <Link
                      href="/admin/stores/create"
                      className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                    >
                      Tambah UMKM
                    </Link>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
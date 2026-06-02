"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
};

type MeResponse = {
  user: User;
};

type StoresResponse = {
  message: string;
  data: Store[];
};

export default function OwnerDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    async function loadOwnerDashboard() {
      try {
        const meResponse = await apiFetch<MeResponse>("/me", {
          token,
        });

        const allowedRoles = ["owner", "staff", "super_admin"];

        if (!allowedRoles.includes(meResponse.user.role)) {
          setError("Akun ini tidak punya akses ke dashboard owner.");
          return;
        }

        const storesResponse = await apiFetch<StoresResponse>("/owner/stores", {
          token,
        });

        setUser(meResponse.user);
        setStores(storesResponse.data);
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          setError("Kamu tidak punya akses ke halaman owner.");
          return;
        }

        removeAuthToken();
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadOwnerDashboard();
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
                Owner Dashboard
              </p>

              <h1 className="mt-3 text-3xl font-bold">
                Dashboard UMKM
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Kelola toko, lihat order masuk, dan pantau aktivitas penjualan
                dari satu dashboard.
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
                Memuat dashboard owner...
              </p>
            </div>
          ) : user ? (
            <>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">Nama</p>
                  <p className="mt-2 font-semibold">{user.name}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="mt-2 font-semibold">{user.email}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">Role</p>
                  <p className="mt-2 font-semibold">{user.role}</p>
                </div>
              </div>

              <section className="mt-10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-400">
                      Toko UMKM
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      Toko yang kamu kelola
                    </h2>
                  </div>

                  <p className="text-sm text-zinc-500">
                    Total toko: {stores.length}
                  </p>
                </div>

                {stores.length > 0 ? (
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    {stores.map((store) => (
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

                        {store.description ? (
                          <p className="mt-4 line-clamp-2 text-sm text-zinc-400">
                            {store.description}
                          </p>
                        ) : null}

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            href={`/owner/stores/${store.id}/orders`}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                          >
                            Lihat Order
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
                      Belum ada toko
                    </h3>
                    <p className="mt-2 text-zinc-400">
                      Toko akan muncul di sini setelah dibuat oleh super admin.
                    </p>
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
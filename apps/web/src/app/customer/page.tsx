"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type MeResponse = {
  user: User;
};

export default function CustomerPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch<MeResponse>("/me", {
      token,
    })
      .then((response) => {
        setUser(response.user);
      })
      .catch(() => {
        removeAuthToken();
        setError("Sesi login tidak valid. Silakan login ulang.");
        router.push("/login");
      })
      .finally(() => {
        setIsLoading(false);
      });
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
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-medium text-zinc-400">
            Customer Dashboard
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Akun Customer</h1>

              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Kelola akun, lihat riwayat pesanan, dan lanjutkan belanja di
                toko UMKM.
              </p>
            </div>

            <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
              Customer
            </span>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400">Memuat data akun...</p>
            </div>
          ) : user ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:col-span-2">
                <p className="text-sm text-zinc-500">Informasi Akun</p>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-600">
                      Nama
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {user.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-600">
                      Email
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-600">
                      Role
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-sm text-zinc-500">Status</p>

                <div className="mt-5 rounded-2xl bg-zinc-900 p-4">
                  <p className="text-sm font-semibold text-emerald-300">
                    Login Aktif
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Akun ini sudah bisa melakukan checkout dan melihat pesanan.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400">
                Data user tidak ditemukan.
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              href="/toko/kopi-nusantara"
              className="rounded-full border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
            >
              Lihat Toko
            </Link>

            <Link
              href="/customer/orders"
              className="rounded-full border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
            >
              Riwayat Pesanan
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logout..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
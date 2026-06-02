"use client";

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
      });
  }, [router]);

  async function handleLogout() {
    const token = getAuthToken();

    if (token) {
      await apiFetch("/logout", {
        method: "POST",
        token,
      }).catch(() => null);
    }

    removeAuthToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-sm font-medium text-zinc-400">
          Customer Dashboard
        </p>

        <h1 className="mt-3 text-3xl font-bold">Akun Customer</h1>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {user ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">User login:</p>

            <pre className="mt-3 overflow-auto text-sm text-emerald-400">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="mt-6 text-zinc-400">Memuat data user...</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/toko/kopi-nusantara"
            className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            Lihat Toko
          </a>

          <button
            onClick={handleLogout}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
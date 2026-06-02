"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { saveAuthToken } from "@/lib/auth";

type LoginResponse = {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("customer@test.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiFetch<LoginResponse>("/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      saveAuthToken(response.token);

      if (response.user.role === "super_admin") {
        router.push("/admin");
        return;
      }

      if (response.user.role === "owner" || response.user.role === "staff") {
        router.push("/owner");
        return;
      }

      router.push("/customer");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-sm font-medium text-zinc-400">
          UMKM SaaS Ecommerce
        </p>

        <h1 className="mt-3 text-3xl font-bold">Login Customer</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Masuk untuk lanjut checkout dan melihat riwayat pesanan.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
              placeholder="customer@test.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
              placeholder="password123"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Masuk..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Belum punya akun?{" "}
          <a href="/register" className="font-semibold text-white">
            Daftar
          </a>
        </p>
      </div>
    </main>
  );
}
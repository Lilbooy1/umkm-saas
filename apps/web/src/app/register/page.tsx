"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { saveAuthToken } from "@/lib/auth";

type RegisterResponse = {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await apiFetch<RegisterResponse>("/register", {
        method: "POST",
        body: {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });

      saveAuthToken(response.token);

      router.push("/customer");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        setFieldErrors(error.errors ?? {});
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

        <h1 className="mt-3 text-3xl font-bold">Daftar Customer</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Akun customer wajib dibuat sebelum checkout.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-zinc-300">Nama</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
              placeholder="Nama kamu"
              required
            />
            {fieldErrors.name ? (
              <p className="mt-2 text-xs text-red-300">
                {fieldErrors.name[0]}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
              placeholder="email@test.com"
              required
            />
            {fieldErrors.email ? (
              <p className="mt-2 text-xs text-red-300">
                {fieldErrors.email[0]}
              </p>
            ) : null}
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
              placeholder="Minimal 8 karakter"
              required
            />
            {fieldErrors.password ? (
              <p className="mt-2 text-xs text-red-300">
                {fieldErrors.password[0]}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
              placeholder="Ulangi password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Sudah punya akun?{" "}
          <a href="/login" className="font-semibold text-white">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
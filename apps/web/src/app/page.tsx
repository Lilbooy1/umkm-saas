"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type HealthResponse = {
  status: string;
  message: string;
  app: string;
};

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<HealthResponse>("/health")
      .then(setHealth)
      .catch((error) => setError(error.message));
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-sm font-medium text-zinc-400">
          UMKM SaaS Ecommerce
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Front-End dan Back-End sudah terhubung
        </h1>

        <div className="mt-8 rounded-xl bg-zinc-950 p-5">
          <p className="text-sm text-zinc-400">API Health Check</p>

          {error ? (
            <p className="mt-3 text-red-400">{error}</p>
          ) : health ? (
            <pre className="mt-3 overflow-auto text-sm text-emerald-400">
              {JSON.stringify(health, null, 2)}
            </pre>
          ) : (
            <p className="mt-3 text-zinc-300">Loading API...</p>
          )}
        </div>
      </div>
    </main>
  );
}
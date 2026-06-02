"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

type Order = {
  id: number;
  invoice_number: string;
  status: string;
  total: string;
  created_at: string;
  store: {
    id: number;
    name: string;
    slug: string;
  };
  payment: {
    id: number;
    method: string;
    status: string;
    amount: string;
  } | null;
};

type OrdersResponse = {
  message: string;
  data: {
    data: Order[];
  };
};

function formatRupiah(value: string | number) {
  const numberValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CustomerOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch<OrdersResponse>("/customer/orders", {
      token,
    })
      .then((response) => {
        setOrders(response.data.data);
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

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <a
          href="/customer"
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke akun
        </a>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-medium text-zinc-400">
            Customer Orders
          </p>

          <h1 className="mt-3 text-3xl font-bold">Riwayat Pesanan</h1>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <p className="mt-8 text-zinc-400">Memuat pesanan...</p>
          ) : orders.length > 0 ? (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">
                        {order.store.name}
                      </p>

                      <h2 className="mt-1 font-semibold">
                        {order.invoice_number}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold">
                        {formatRupiah(order.total)}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                          {order.status}
                        </span>

                        {order.payment ? (
                          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                            {order.payment.status}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={`/customer/orders/${order.id}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                    >
                      Detail Order
                    </a>

                    <a
                      href={`/toko/${order.store.slug}`}
                      className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                    >
                      Kunjungi Toko
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <h2 className="text-xl font-semibold">Belum ada pesanan</h2>
              <p className="mt-2 text-zinc-400">
                Pesanan yang berhasil dibuat akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
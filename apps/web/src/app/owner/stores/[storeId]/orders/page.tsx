"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

type Customer = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Payment = {
  id: number;
  order_id: number;
  method: string;
  status: string;
  amount: string;
  paid_at: string | null;
};

type Order = {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: string;
  status: string;
  created_at: string;
  customer: Customer;
  payment: Payment | null;
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

export default function OwnerOrdersPage() {
  const router = useRouter();
  const params = useParams<{ storeId: string }>();
  const storeId = params.storeId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(
    null,
  );

  async function loadOrders() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await apiFetch<OrdersResponse>(
        `/owner/stores/${storeId}/orders`,
        {
          token,
        },
      );

      setOrders(response.data.data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setError("Kamu tidak punya akses ke toko ini.");
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
    void loadOrders();
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);
    
  async function handleConfirmPayment(orderId: number) {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setProcessingOrderId(orderId);
    setError("");

    try {
      await apiFetch(`/owner/stores/${storeId}/orders/${orderId}/payment/confirm`, {
        method: "PATCH",
        token,
      });

      await loadOrders();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Gagal mengonfirmasi pembayaran.");
      }
    } finally {
      setProcessingOrderId(null);
    }
  }

  async function handleUpdateStatus(orderId: number, status: string) {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setProcessingOrderId(orderId);
    setError("");

    try {
      await apiFetch(`/owner/stores/${storeId}/orders/${orderId}/status`, {
        method: "PATCH",
        token,
        body: {
          status,
        },
      });

      await loadOrders();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Gagal mengubah status order.");
      }
    } finally {
      setProcessingOrderId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/owner"
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke dashboard owner
        </Link>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-medium text-zinc-400">Owner Orders</p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Masuk</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Kelola order, pembayaran, dan status pesanan toko.
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              className="w-fit rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
            >
              Refresh
            </button>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400">Memuat order toko...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="mt-8 space-y-4">
              {orders.map((order) => {
                const isProcessing = processingOrderId === order.id;
                const canConfirmPayment =
                  order.payment &&
                  order.payment.status !== "paid" &&
                  order.payment.method !== "cod";

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm text-zinc-500">
                          {formatDate(order.created_at)}
                        </p>

                        <h2 className="mt-2 text-xl font-bold">
                          {order.invoice_number}
                        </h2>

                        <div className="mt-4 space-y-1 text-sm text-zinc-400">
                          <p>Customer: {order.customer_name}</p>
                          <p>Email: {order.customer_email}</p>
                          <p>WhatsApp: {order.customer_phone}</p>
                        </div>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-2xl font-bold">
                          {formatRupiah(order.total)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 lg:justify-end">
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

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/owner/stores/${storeId}/orders/${order.id}`}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                      >
                        Detail Order
                      </Link>

                      {canConfirmPayment ? (
                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(order.id)}
                          disabled={isProcessing}
                          className="rounded-full border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isProcessing ? "Memproses..." : "Konfirmasi Bayar"}
                        </button>
                      ) : null}

                      {order.status !== "processing" &&
                      order.status !== "completed" ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(order.id, "processing")
                          }
                          disabled={isProcessing}
                          className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Proses Order
                        </button>
                      ) : null}

                      {order.status !== "completed" ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(order.id, "completed")
                          }
                          disabled={isProcessing}
                          className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Selesaikan
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <h2 className="text-xl font-semibold">Belum ada order</h2>
              <p className="mt-2 text-zinc-400">
                Order customer akan muncul di sini setelah checkout berhasil.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
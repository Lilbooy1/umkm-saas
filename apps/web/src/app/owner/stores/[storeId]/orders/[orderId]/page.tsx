"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

type OrderDetail = {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  notes: string | null;
  subtotal: string;
  total: string;
  status: string;
  created_at: string;
  customer: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  store: {
    id: number;
    name: string;
    slug: string;
  };
  items: {
    id: number;
    product_id: number | null;
    product_name: string;
    product_slug: string | null;
    product_sku: string | null;
    quantity: number;
    price: string;
    total: string;
  }[];
  payment: {
    id: number;
    method: string;
    provider: string;
    status: string;
    amount: string;
    proof_image_url: string | null;
    paid_at: string | null;
  } | null;
};

type OrderDetailResponse = {
  message: string;
  data: OrderDetail;
};

const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "confirmed",
  "processing",
  "ready",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
];

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

export default function OwnerOrderDetailPage() {
  const router = useRouter();
  const params = useParams<{
    storeId: string;
    orderId: string;
  }>();

  const storeId = params.storeId;
  const orderId = params.orderId;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  async function loadOrder() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await apiFetch<OrderDetailResponse>(
        `/owner/stores/${storeId}/orders/${orderId}`,
        {
          token,
        },
      );

      setOrder(response.data);
      setSelectedStatus(response.data.status);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setError("Kamu tidak punya akses ke order ini.");
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
    void loadOrder();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, orderId]);

  async function handleConfirmPayment() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiFetch(
        `/owner/stores/${storeId}/orders/${orderId}/payment/confirm`,
        {
          method: "PATCH",
          token,
        },
      );

      setSuccessMessage("Pembayaran berhasil dikonfirmasi.");
      await loadOrder();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Gagal mengonfirmasi pembayaran.");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdateStatus() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiFetch(`/owner/stores/${storeId}/orders/${orderId}/status`, {
        method: "PATCH",
        token,
        body: {
          status: selectedStatus,
        },
      });

      setSuccessMessage("Status order berhasil diperbarui.");
      await loadOrder();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Gagal memperbarui status order.");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/owner/stores/${storeId}/orders`}
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke daftar order
        </Link>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          {isLoading ? (
            <p className="text-sm text-zinc-400">Memuat detail order...</p>
          ) : error && !order ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
              {error}
            </div>
          ) : order ? (
            <>
              <p className="text-sm font-medium text-zinc-400">
                Owner Order Detail
              </p>

              <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">
                    {order.invoice_number}
                  </h1>

                  <p className="mt-2 text-sm text-zinc-500">
                    {formatDate(order.created_at)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                      Order: {order.status}
                    </span>

                    {order.payment ? (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                        Payment: {order.payment.status}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 lg:min-w-80">
                  <p className="text-sm text-zinc-500">Total Order</p>
                  <p className="mt-2 text-3xl font-bold">
                    {formatRupiah(order.total)}
                  </p>
                </div>
              </div>

              {error ? (
                <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                  {successMessage}
                </div>
              ) : null}

              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
                <section className="space-y-6">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <h2 className="font-semibold">Item Pesanan</h2>

                    <div className="mt-5 space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-4 border-b border-zinc-800 pb-4 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-semibold">
                              {item.product_name}
                            </p>

                            {item.product_sku ? (
                              <p className="mt-1 text-xs text-zinc-500">
                                SKU: {item.product_sku}
                              </p>
                            ) : null}

                            <p className="mt-1 text-sm text-zinc-400">
                              {item.quantity} × {formatRupiah(item.price)}
                            </p>
                          </div>

                          <p className="font-semibold">
                            {formatRupiah(item.total)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <h2 className="font-semibold">Data Customer</h2>

                    <div className="mt-4 space-y-3 text-sm text-zinc-300">
                      <p>Nama: {order.customer_name}</p>
                      <p>Email: {order.customer_email}</p>
                      <p>WhatsApp: {order.customer_phone}</p>
                      <p>Alamat: {order.shipping_address}</p>

                      {order.notes ? <p>Catatan: {order.notes}</p> : null}
                    </div>
                  </div>
                </section>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <h2 className="font-semibold">Kelola Status</h2>

                    <div className="mt-5">
                      <label className="text-sm text-zinc-400">
                        Status Order
                      </label>

                      <select
                        value={selectedStatus}
                        onChange={(event) =>
                          setSelectedStatus(event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleUpdateStatus}
                        disabled={isProcessing}
                        className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing ? "Menyimpan..." : "Update Status"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <h2 className="font-semibold">Pembayaran</h2>

                    {order.payment ? (
                      <div className="mt-4 space-y-3 text-sm text-zinc-300">
                        <p>Method: {order.payment.method}</p>
                        <p>Provider: {order.payment.provider}</p>
                        <p>Status: {order.payment.status}</p>
                        <p>Amount: {formatRupiah(order.payment.amount)}</p>

                        {order.payment.paid_at ? (
                          <p>Dibayar: {formatDate(order.payment.paid_at)}</p>
                        ) : null}

                        {order.payment.status !== "paid" &&
                        order.payment.method !== "cod" ? (
                          <button
                            type="button"
                            onClick={handleConfirmPayment}
                            disabled={isProcessing}
                            className="mt-3 w-full rounded-full border border-emerald-500/30 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isProcessing
                              ? "Memproses..."
                              : "Konfirmasi Pembayaran"}
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-zinc-400">
                        Data pembayaran tidak ditemukan.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <h2 className="font-semibold">Ringkasan</h2>

                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Subtotal</span>
                        <span>{formatRupiah(order.subtotal)}</span>
                      </div>

                      <div className="flex justify-between border-t border-zinc-800 pt-3">
                        <span className="text-zinc-400">Total</span>
                        <span className="text-xl font-bold">
                          {formatRupiah(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
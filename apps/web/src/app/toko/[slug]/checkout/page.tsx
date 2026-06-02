"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import {
  CartItem,
  clearCart,
  getCartItems,
  getCartTotal,
} from "@/lib/cart";

type CheckoutResponse = {
  message: string;
  data: {
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
    store: {
      id: number;
      name: string;
      slug: string;
    };
    items: {
      id: number;
      product_name: string;
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
    };
  };
};

function formatRupiah(value: number | string) {
  const numberValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const storeSlug = params.slug;

  const [items, setItems] = useState<CartItem[]>(() =>
    getCartItems(storeSlug),
  );

  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("manual_transfer");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] =
    useState<CheckoutResponse["data"] | null>(null);

  const total = useMemo(() => getCartTotal(items), [items]);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }

    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await apiFetch<CheckoutResponse>(
        `/customer/stores/${storeSlug}/checkout`,
        {
          method: "POST",
          token,
          body: {
            customer_phone: customerPhone,
            shipping_address: shippingAddress,
            notes: notes || null,
            payment_method: paymentMethod,
            items: items.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      );

      clearCart(storeSlug);
      setItems([]);
      setCreatedOrder(response.data);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        setFieldErrors(error.errors ?? {});
      } else {
        setError("Terjadi kesalahan saat checkout.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdOrder) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-medium text-emerald-300">
            Checkout Berhasil
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Order berhasil dibuat
          </h1>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-zinc-500">Invoice</p>
                <p className="mt-1 font-semibold">
                  {createdOrder.invoice_number}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Status Order</p>
                <p className="mt-1 font-semibold">
                  {createdOrder.status}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Metode Pembayaran</p>
                <p className="mt-1 font-semibold">
                  {createdOrder.payment.method}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Status Pembayaran</p>
                <p className="mt-1 font-semibold">
                  {createdOrder.payment.status}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-800 pt-5">
              <p className="text-zinc-500">Total Pembayaran</p>
              <p className="mt-1 text-2xl font-bold">
                {formatRupiah(createdOrder.total)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-100">
            <p className="font-semibold">Instruksi pembayaran manual</p>
            <p className="mt-2 text-amber-100/80">
              Silakan lakukan pembayaran sesuai instruksi toko. Fitur upload
              bukti pembayaran akan kita sambungkan di step berikutnya.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`/toko/${storeSlug}`}
              className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
            >
              Kembali ke toko
            </a>

            <a
              href="/customer"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Lihat akun customer
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <a
          href={`/toko/${storeSlug}/cart`}
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke keranjang
        </a>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form
            onSubmit={handleCheckout}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
          >
            <p className="text-sm font-medium text-zinc-400">Checkout</p>

            <h1 className="mt-3 text-3xl font-bold">
              Lengkapi data pengiriman
            </h1>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <div className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Nomor WhatsApp
                </label>
                <input
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  placeholder="081234567890"
                  required
                />
                {fieldErrors.customer_phone ? (
                  <p className="mt-2 text-xs text-red-300">
                    {fieldErrors.customer_phone[0]}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Alamat Pengiriman
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(event) =>
                    setShippingAddress(event.target.value)
                  }
                  className="mt-2 min-h-32 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  placeholder="Alamat lengkap pengiriman"
                  required
                />
                {fieldErrors.shipping_address ? (
                  <p className="mt-2 text-xs text-red-300">
                    {fieldErrors.shipping_address[0]}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Catatan
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  placeholder="Contoh: dikirim sore hari"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                >
                  <option value="manual_transfer">Transfer Manual</option>
                  <option value="qris_manual">QRIS Manual</option>
                  <option value="cod">COD</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Memproses checkout..." : "Buat Order"}
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm font-medium text-zinc-400">
              Ringkasan Pesanan
            </p>

            {items.length > 0 ? (
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between gap-4 border-b border-zinc-800 pb-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 text-zinc-500">
                        {item.quantity} × {formatRupiah(item.price)}
                      </p>
                    </div>

                    <p className="font-semibold">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-zinc-400">Total</span>
                  <span className="text-2xl font-bold">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-zinc-400">
                Keranjang masih kosong.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
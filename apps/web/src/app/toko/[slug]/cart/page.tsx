"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CartItem,
  getCartItems,
  getCartTotal,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart";
import { getAuthToken } from "@/lib/auth";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const storeSlug = params.slug;

  const [items, setItems] = useState<CartItem[]>(() =>
    getCartItems(storeSlug),
  );

  const total = useMemo(() => getCartTotal(items), [items]);

  function handleQuantityChange(productId: number, quantity: number) {
    const updatedItems = updateCartItemQuantity(storeSlug, productId, quantity);
    setItems(updatedItems);
  }

  function handleRemove(productId: number) {
    const updatedItems = removeCartItem(storeSlug, productId);
    setItems(updatedItems);
  }

  function handleCheckout() {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    router.push(`/toko/${storeSlug}/checkout`);
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <a
          href={`/toko/${storeSlug}`}
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke toko
        </a>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm font-medium text-zinc-400">Keranjang</p>

          <h1 className="mt-3 text-3xl font-bold">Produk yang dipilih</h1>

          {items.length > 0 ? (
            <div className="mt-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-xs text-zinc-500">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : (
                        "No Image"
                      )}
                    </div>

                    <div>
                      <a
                        href={`/toko/${storeSlug}/produk/${item.productSlug}`}
                        className="font-semibold text-white hover:underline"
                      >
                        {item.name}
                      </a>

                      <p className="mt-1 text-sm text-zinc-400">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity - 1)
                      }
                      className="h-9 w-9 rounded-full border border-zinc-700 text-zinc-300"
                    >
                      -
                    </button>

                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity + 1)
                      }
                      className="h-9 w-9 rounded-full border border-zinc-700 text-zinc-300"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId)}
                      className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total</span>
                  <span className="text-2xl font-bold">
                    {formatRupiah(total)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  Lanjut Checkout
                </button>

                <p className="mt-3 text-center text-sm text-zinc-500">
                  Checkout wajib login untuk keamanan transaksi.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <h2 className="text-xl font-semibold">Keranjang kosong</h2>
              <p className="mt-2 text-zinc-400">
                Tambahkan produk terlebih dahulu dari halaman toko.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
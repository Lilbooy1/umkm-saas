"use client";

import { useState } from "react";
import { addCartItem } from "@/lib/cart";

type AddToCartButtonProps = {
  storeSlug: string;
  product: {
    id: number;
    slug: string;
    name: string;
    price: string;
    image_url: string | null;
    stock_quantity: number;
    track_stock: boolean;
  };
};

export function AddToCartButton({ storeSlug, product }: AddToCartButtonProps) {
  const [message, setMessage] = useState("");

  const isOutOfStock = product.track_stock && product.stock_quantity <= 0;

  function handleAddToCart() {
    addCartItem(storeSlug, {
      productId: product.id,
      storeSlug,
      productSlug: product.slug,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.image_url,
    });

    setMessage("Produk berhasil ditambahkan ke keranjang.");

    window.setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
      </button>

      {message ? (
        <p className="mt-3 text-sm text-emerald-300">{message}</p>
      ) : null}
    </div>
  );
}
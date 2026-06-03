import Link from "next/link";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

type Store = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  is_active: boolean;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  product_type: string;
  price: string;
  compare_at_price: string | null;
  stock_quantity: number;
  track_stock: boolean;
  is_preorder: boolean;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

type ApiResponse<T> = {
  message: string;
  data: T;
};

type PageProps = {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

function formatRupiah(value: string | number) {
  const numberValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

async function getStore(slug: string) {
  const response = await fetch(`${API_URL}/storefront/stores/${slug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Store not found");
  }

  const json = (await response.json()) as ApiResponse<Store>;

  return json.data;
}

async function getProduct(slug: string, productSlug: string) {
  const response = await fetch(
    `${API_URL}/storefront/stores/${slug}/products/${productSlug}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Product not found");
  }

  const json = (await response.json()) as ApiResponse<Product>;

  return json.data;
}

function ProductImage({ product }: { product: Product }) {
  return (
    <div
      aria-label={product.name}
      className="flex items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900 bg-cover bg-center text-sm text-zinc-500"
      style={{
        height: 420,
        backgroundImage: product.image_url
          ? `url(${product.image_url})`
          : undefined,
      }}
    >
      {!product.image_url ? "Belum ada gambar produk" : null}
    </div>
  );
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  const [store, product] = await Promise.all([
    getStore(resolvedParams.slug),
    getProduct(resolvedParams.slug, resolvedParams.productSlug),
  ]);

  const stockLabel = product.track_stock
    ? `${product.stock_quantity} stok tersedia`
    : "Stok tidak dilacak";

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/toko/${store.slug}`}
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke toko
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_460px]">
          <ProductImage product={product} />

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="text-sm font-medium text-zinc-400">
              {product.category?.name ?? store.name}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              {product.is_featured ? (
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                  Featured
                </span>
              ) : null}

              {product.is_preorder ? (
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                  Pre-order
                </span>
              ) : null}

              <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                {stockLabel}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-3xl font-bold">
                {formatRupiah(product.price)}
              </p>

              {product.compare_at_price ? (
                <p className="mt-1 text-sm text-zinc-500 line-through">
                  {formatRupiah(product.compare_at_price)}
                </p>
              ) : null}
            </div>

            {product.description ? (
              <p className="mt-6 text-sm leading-7 text-zinc-400">
                {product.description}
              </p>
            ) : (
              <p className="mt-6 text-sm leading-7 text-zinc-400">
                Produk ini tersedia di {store.name}. Silakan tambahkan ke
                keranjang untuk melanjutkan checkout.
              </p>
            )}

            <div className="mt-8 space-y-3">
              <AddToCartButton
                product={{
                  productId: product.id,
                  storeSlug: store.slug,
                  productSlug: product.slug,
                  name: product.name,
                  price: Number(product.price),
                  imageUrl: product.image_url,
                }}
              />

              <Link
                href={`/toko/${store.slug}/cart`}
                className="flex w-full justify-center rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
              >
                Lihat Keranjang
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="font-semibold">Info Toko</h2>

              <div className="mt-4 space-y-2 text-sm text-zinc-400">
                <p>{store.name}</p>

                {store.phone ? <p>WhatsApp: {store.phone}</p> : null}

                {store.address ? <p>Alamat: {store.address}</p> : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
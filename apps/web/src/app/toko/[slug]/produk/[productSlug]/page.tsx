import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

type Product = {
  id: number;
  store_id: number;
  product_category_id: number | null;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchApi<T>(path: string): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function formatRupiah(value: string | number) {
  const numberValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug, productSlug } = await params;

  const productResponse = await fetchApi<ApiResponse<Product>>(
    `/storefront/stores/${slug}/products/${productSlug}`,
  );

  const product = productResponse.data;

  const isOutOfStock = product.track_stock && product.stock_quantity <= 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <a
          href={`/toko/${slug}`}
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke toko
        </a>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
            <div className="flex h-[420px] items-center justify-center bg-zinc-800 text-zinc-500">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>Belum ada gambar produk</span>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            {product.category ? (
              <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                {product.category.name}
              </p>
            ) : null}

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {product.name}
            </h1>

            {product.sku ? (
              <p className="mt-3 text-sm text-zinc-500">SKU: {product.sku}</p>
            ) : null}

            <div className="mt-6">
              <p className="text-3xl font-bold">
                {formatRupiah(product.price)}
              </p>

              {product.compare_at_price ? (
                <p className="mt-1 text-lg text-zinc-500 line-through">
                  {formatRupiah(product.compare_at_price)}
                </p>
              ) : null}
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm font-medium text-zinc-400">Status Produk</p>

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                  {product.product_type === "physical"
                    ? "Produk Fisik"
                    : product.product_type === "service"
                      ? "Jasa"
                      : "Produk Digital"}
                </span>

                {product.is_preorder ? (
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-300">
                    Pre-order
                  </span>
                ) : null}

                {isOutOfStock ? (
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-300">
                    Stok Habis
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">
                    Tersedia
                  </span>
                )}
              </div>

              {product.track_stock ? (
                <p className="mt-4 text-sm text-zinc-400">
                  Stok: {product.stock_quantity}
                </p>
              ) : null}
            </div>

            {product.description ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Deskripsi</h2>
                <p className="mt-2 leading-7 text-zinc-300">
                  {product.description}
                </p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <AddToCartButton storeSlug={slug} product={product} />

                <a
                  href={`/toko/${slug}/cart`}
                  className="rounded-full border border-zinc-700 px-6 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
                >
                  Lihat Keranjang
                </a>
              

              <a
                href={`/toko/${slug}`}
                className="rounded-full border border-zinc-700 px-6 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
              >
                Lihat Produk Lain
              </a>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              Checkout akan diwajibkan login untuk keamanan transaksi.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
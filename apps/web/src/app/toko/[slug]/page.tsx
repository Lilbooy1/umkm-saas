import Link from "next/link";

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

type ProductCategory = {
  id: number;
  name: string;
  slug: string;
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
  }>;
  searchParams?: Promise<{
    category?: string;
    search?: string;
    featured?: string;
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

async function getCategories(slug: string) {
  const response = await fetch(
    `${API_URL}/storefront/stores/${slug}/categories`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  const json = (await response.json()) as ApiResponse<ProductCategory[]>;

  return json.data;
}

async function getProducts(
  slug: string,
  filters: {
    category?: string;
    search?: string;
    featured?: string;
  },
) {
  const query = new URLSearchParams();

  if (filters.category) {
    query.set("category", filters.category);
  }

  if (filters.search) {
    query.set("search", filters.search);
  }

  if (filters.featured) {
    query.set("featured", filters.featured);
  }

  const url = query.toString()
    ? `${API_URL}/storefront/stores/${slug}/products?${query.toString()}`
    : `${API_URL}/storefront/stores/${slug}/products`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const json = (await response.json()) as ApiResponse<Product[]>;

  return json.data;
}

function ProductImage({ product }: { product: Product }) {
  return (
    <div
      aria-label={product.name}
      className="flex h-48 items-center justify-center bg-zinc-800 bg-cover bg-center text-sm text-zinc-500"
      style={
        product.image_url
          ? {
              backgroundImage: `url(${product.image_url})`,
            }
          : undefined
      }
    >
      {!product.image_url ? "Belum ada gambar" : null}
    </div>
  );
}

export default async function StorefrontPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const store = await getStore(resolvedParams.slug);
  const categories = await getCategories(resolvedParams.slug);
  const products = await getProducts(resolvedParams.slug, resolvedSearchParams);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          <div className="relative p-8 md:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-medium text-zinc-400">
                {store.category ?? "UMKM Store"}
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                {store.name}
              </h1>

              {store.description ? (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                  {store.description}
                </p>
              ) : (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                  Temukan produk terbaik dari UMKM lokal langsung dari toko
                  resminya.
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-400">
                {store.phone ? (
                  <span className="rounded-full bg-zinc-950 px-4 py-2">
                    WhatsApp: {store.phone}
                  </span>
                ) : null}

                {store.address ? (
                  <span className="rounded-full bg-zinc-950 px-4 py-2">
                    {store.address}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Katalog</p>

              <h2 className="mt-2 text-2xl font-bold">Produk Pilihan</h2>
            </div>

            <Link
              href={`/toko/${store.slug}/cart`}
              className="w-fit rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Lihat Keranjang
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/toko/${store.slug}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Semua
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/toko/${store.slug}?category=${category.slug}`}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {products.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                >
                  <ProductImage product={product} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          {product.category?.name ?? "Produk"}
                        </p>

                        <h3 className="mt-2 text-lg font-bold">
                          {product.name}
                        </h3>
                      </div>

                      {product.is_featured ? (
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                          Featured
                        </span>
                      ) : null}
                    </div>

                    {product.description ? (
                      <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
                        {product.description}
                      </p>
                    ) : null}

                    <div className="mt-5">
                      <p className="text-xl font-bold">
                        {formatRupiah(product.price)}
                      </p>

                      {product.compare_at_price ? (
                        <p className="text-sm text-zinc-500 line-through">
                          {formatRupiah(product.compare_at_price)}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/toko/${store.slug}/produk/${product.slug}`}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                      >
                        Detail Produk
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <h3 className="text-xl font-semibold">
                Produk belum ditemukan
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                Belum ada produk aktif atau filter kategori tidak menemukan
                produk yang sesuai.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
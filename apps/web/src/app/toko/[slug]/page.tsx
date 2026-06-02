import { notFound } from "next/navigation";

type Store = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_active: boolean;
};

type ProductCategory = {
  id: number;
  store_id: number;
  name: string;
  slug: string;
  is_active: boolean;
};

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

type PaginatedResponse<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    category?: string;
    search?: string;
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

export default async function StorefrontPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};

  const productQuery = new URLSearchParams();

  if (query.category) {
    productQuery.set("category", query.category);
  }

  if (query.search) {
    productQuery.set("search", query.search);
  }

  const productQueryString = productQuery.toString();

  const [storeResponse, categoriesResponse, productsResponse] =
    await Promise.all([
      fetchApi<ApiResponse<Store>>(`/storefront/stores/${slug}`),
      fetchApi<ApiResponse<ProductCategory[]>>(
        `/storefront/stores/${slug}/categories`,
      ),
      fetchApi<ApiResponse<PaginatedResponse<Product>>>(
        `/storefront/stores/${slug}/products${
          productQueryString ? `?${productQueryString}` : ""
        }`,
      ),
    ]);

  const store = storeResponse.data;
  const categories = categoriesResponse.data;
  const products = productsResponse.data.data;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <p className="text-sm font-medium text-zinc-400">
              {store.category ?? "UMKM Store"}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {store.name}
            </h1>

            {store.description ? (
              <p className="mt-4 max-w-2xl text-zinc-300">
                {store.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-400">
              {store.phone ? <span>WhatsApp: {store.phone}</span> : null}
              {store.address ? <span>Alamat: {store.address}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-wrap gap-3">
          <a
            href={`/toko/${store.slug}`}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
          >
            Semua Produk
          </a>

          {categories.map((category) => (
            <a
              key={category.id}
              href={`/toko/${store.slug}?category=${category.slug}`}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
            >
              {category.name}
            </a>
          ))}
        </div>

        {products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
              >
                <div className="flex h-48 items-center justify-center bg-zinc-800 text-sm text-zinc-500">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>Belum ada gambar</span>
                  )}
                </div>

                <div className="p-5">
                  {product.category ? (
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {product.category.name}
                    </p>
                  ) : null}

                  <h2 className="mt-2 text-lg font-semibold">
                    {product.name}
                  </h2>

                  {product.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                      {product.description}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-white">
                        {formatRupiah(product.price)}
                      </p>

                      {product.compare_at_price ? (
                        <p className="text-sm text-zinc-500 line-through">
                          {formatRupiah(product.compare_at_price)}
                        </p>
                      ) : null}
                    </div>

                    <a
                      href={`/toko/${store.slug}/produk/${product.slug}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                    >
                      Detail
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h2 className="text-xl font-semibold">Produk belum tersedia</h2>
            <p className="mt-2 text-zinc-400">
              Toko ini belum memiliki produk aktif.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
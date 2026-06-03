import Link from "next/link";

const stats = [
  {
    label: "Platform",
    value: "Multi UMKM",
    description: "Satu sistem untuk banyak toko.",
  },
  {
    label: "Storefront",
    value: "URL Toko",
    description: "Mudah dibagikan ke customer.",
  },
  {
    label: "Checkout",
    value: "Login Aman",
    description: "Order lebih mudah dilacak.",
  },
];

const features = [
  {
    title: "Toko Online Rapi",
    description: "Setiap UMKM punya storefront publik yang terlihat profesional.",
    tone: "peach",
  },
  {
    title: "Order Terpusat",
    description: "Pesanan masuk langsung ke dashboard owner.",
    tone: "teal",
  },
  {
    title: "Produk Mudah Diatur",
    description: "Kelola kategori, harga, stok, dan status produk.",
    tone: "blue",
  },
];

const workflows = [
  "Super admin membuat toko dan akun owner.",
  "Owner mengatur profil, kategori, dan produk.",
  "Customer login lalu checkout.",
  "Owner memproses order masuk.",
];

const roles = [
  {
    name: "Customer",
    description: "Belanja, checkout, dan melihat riwayat pesanan.",
  },
  {
    name: "Owner UMKM",
    description: "Mengelola toko, produk, order, dan pembayaran.",
  },
  {
    name: "Super Admin",
    description: "Mengatur semua UMKM dari dashboard platform.",
  },
];

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 10h16l-1.2-5.2A1 1 0 0 0 17.83 4H6.17a1 1 0 0 0-.97.8L4 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 19v-5h6v5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M7 4h10v16H7V4Z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.5 8h5M9.5 12h5M9.5 16h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m4.5 8 7.5 4.2L19.5 8M12 12.2V21"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 3 19 6v5.8c0 4.2-2.8 7.6-7 9.2-4.2-1.6-7-5-7-9.2V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m9 12 2 2 4-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SoftPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="soft-grid"
          width="52"
          height="52"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M52 0H0V52"
            fill="none"
            stroke="#5484A4"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#soft-grid)" />
    </svg>
  );
}

function FeatureIcon({ tone }: { tone: string }) {
  if (tone === "peach") {
    return <StoreIcon />;
  }

  if (tone === "teal") {
    return <OrderIcon />;
  }

  return <ProductIcon />;
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D396A6]/30 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-[#09A1A1]/20 blur-3xl" />

      <div className="relative rounded-[2rem] border border-[#ACC0D3]/50 bg-white/75 p-4 shadow-2xl shadow-[#30525C]/10 backdrop-blur">
        <div className="rounded-[1.5rem] bg-[#FFF9F1] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#5484A4]">
                Dashboard Owner
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-[#30525C]">
                Kopi Nusantara
              </h2>
            </div>

            <span className="rounded-full bg-[#09A1A1]/10 px-3 py-1 text-xs font-bold text-[#087F7F]">
              Aktif
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Order", "128"],
              ["Produk", "42"],
              ["Revenue", "8.4jt"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-[#ACC0D3]/45 bg-white p-4"
              >
                <p className="text-xs font-semibold text-[#5484A4]">
                  {label}
                </p>
                <p className="mt-2 text-lg font-extrabold text-[#30525C]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[#ACC0D3]/45 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#5484A4]">
                  Order Masuk
                </p>
                <p className="mt-1 font-extrabold text-[#30525C]">
                  Pesanan terbaru
                </p>
              </div>

              <span className="rounded-full bg-[#30525C] px-3 py-1 text-xs font-bold text-white">
                Live
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ["INV-2401", "pending", "Rp 72.000"],
                ["INV-2402", "processing", "Rp 120.000"],
                ["INV-2403", "completed", "Rp 54.000"],
              ].map(([invoice, status, total]) => (
                <div
                  key={invoice}
                  className="flex items-center justify-between rounded-2xl bg-[#FDF3E6] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-extrabold text-[#30525C]">
                      {invoice}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#5484A4]">
                      {status}
                    </p>
                  </div>

                  <p className="text-sm font-extrabold text-[#087F7F]">
                    {total}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F6C992]/35 p-4 text-[#8A5A1D]">
              <StoreIcon />
              <p className="mt-3 text-sm font-extrabold">Storefront publik</p>
            </div>

            <div className="rounded-2xl bg-[#ACC0D3]/45 p-4 text-[#30525C]">
              <ShieldIcon />
              <p className="mt-3 text-sm font-extrabold">Checkout aman</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-bold text-[#5484A4]">{eyebrow}</p>

      <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-[#30525C] md:text-4xl">
        {title}
      </h2>

      {description ? (
        <p className="mt-4 text-base font-medium leading-7 text-[#5D7480]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF9F1] text-[#30525C]">
      <section className="relative overflow-hidden px-6 pb-20 pt-6">
        <SoftPattern />

        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#ACC0D3]/40 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-[#F6C992]/45 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#D396A6]/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-[#09A1A1]/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <nav className="flex items-center justify-between rounded-full border border-[#ACC0D3]/45 bg-white/75 px-5 py-4 shadow-sm backdrop-blur">
            <Link
              href="/"
              className="text-sm font-extrabold tracking-[-0.02em] text-[#30525C]"
            >
              UMKM SaaS
            </Link>

            <div className="hidden items-center gap-8 text-sm font-bold text-[#5484A4] md:flex">
              <Link href="#fitur" className="transition hover:text-[#30525C]">
                Fitur
              </Link>
              <Link href="#alur" className="transition hover:text-[#30525C]">
                Alur
              </Link>
              <Link href="#role" className="transition hover:text-[#30525C]">
                Role
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border border-[#ACC0D3] px-5 py-2.5 text-sm font-extrabold text-[#30525C] transition hover:bg-[#ACC0D3]/20"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-[#30525C] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#27434B]"
              >
                Daftar
              </Link>
            </div>
          </nav>

          <div className="grid items-center gap-16 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#09A1A1]/10 px-4 py-2 text-sm font-extrabold text-[#087F7F]">
                <ShieldIcon />
                Ecommerce SaaS untuk UMKM
              </div>

              <h1 className="mt-7 max-w-3xl text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] text-[#30525C] md:text-6xl">
                Toko online UMKM yang rapi dan mudah dikelola.
              </h1>

              <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[#5D7480]">
                Satu platform untuk banyak UMKM. Kelola produk, checkout, dan
                order dari dashboard yang sederhana.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-[#30525C] px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-[#30525C]/20 transition hover:bg-[#27434B]"
                >
                  Mulai Sekarang
                </Link>

                <Link
                  href="/toko/kopi-nusantara"
                  className="rounded-full border border-[#ACC0D3] bg-white/70 px-6 py-4 text-sm font-extrabold text-[#30525C] transition hover:bg-white"
                >
                  Lihat Contoh Toko
                </Link>
              </div>
            </div>

            <HeroMockup />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-[#ACC0D3]/45 bg-white/75 p-6 shadow-sm"
              >
                <p className="text-sm font-bold text-[#5484A4]">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-[#30525C]">
                  {stat.value}
                </p>

                <p className="mt-2 text-sm font-medium text-[#5D7480]">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fitur" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Fitur Utama"
            title="Semua yang dibutuhkan untuk mulai jualan online."
            description="Ringkas, jelas, dan fokus ke kebutuhan operasional UMKM."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-[#ACC0D3]/45 bg-white/75 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#30525C]/10"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    feature.tone === "peach"
                      ? "bg-[#F6C992]/45 text-[#8A5A1D]"
                      : feature.tone === "teal"
                        ? "bg-[#09A1A1]/12 text-[#087F7F]"
                        : "bg-[#ACC0D3]/45 text-[#30525C]"
                  }`}
                >
                  <FeatureIcon tone={feature.tone} />
                </div>

                <h3 className="mt-6 text-xl font-extrabold tracking-[-0.02em] text-[#30525C]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm font-medium leading-7 text-[#5D7480]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="alur" className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#ACC0D3]/45 bg-white/75 p-8 shadow-sm md:p-10">
          <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="text-sm font-bold text-[#5484A4]">Alur Kerja</p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-[#30525C]">
                Dari toko dibuat sampai order diproses.
              </h2>
            </div>

            <div className="space-y-3">
              {workflows.map((item, index) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-2xl bg-[#FFF9F1] p-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D396A6] text-sm font-extrabold text-white">
                    {index + 1}
                  </div>

                  <p className="pt-2 text-sm font-medium leading-6 text-[#5D7480]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="role" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Role System"
            title="Akses dibuat sederhana dan jelas."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.name}
                className="rounded-3xl border border-[#ACC0D3]/45 bg-white/75 p-6 shadow-sm"
              >
                <p className="text-lg font-extrabold tracking-[-0.02em] text-[#30525C]">
                  {role.name}
                </p>

                <p className="mt-3 text-sm font-medium leading-7 text-[#5D7480]">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-gradient-to-br from-[#30525C] via-[#5484A4] to-[#09A1A1] p-8 text-center text-white shadow-xl shadow-[#30525C]/20 md:p-12">
          <p className="text-sm font-bold text-white/75">
            Siap dikembangkan ke subscription
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
            Fondasi ecommerce sudah siap untuk masuk ke paket langganan UMKM.
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-4 text-sm font-extrabold text-[#30525C] transition hover:bg-[#FFF9F1]"
            >
              Masuk Dashboard
            </Link>

            <Link
              href="/admin"
              className="rounded-full border border-white/35 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-white/10"
            >
              Super Admin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
"use client";


import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

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

type MeResponse = {
  user: User;
};

type StoreResponse = {
  message: string;
  data: Store;
};

export default function AdminCreateStorePage() {
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [storeCategory, setStoreCategory] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeDescription, setStoreDescription] = useState("");

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("password123");
  const [ownerPasswordConfirmation, setOwnerPasswordConfirmation] =
    useState("password123");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    async function checkAccess() {
      try {
        const response = await apiFetch<MeResponse>("/me", {
          token,
        });

        if (response.user.role !== "super_admin") {
          setError("Akun ini tidak punya akses ke halaman super admin.");
          return;
        }
      } catch {
        removeAuthToken();
        router.push("/login");
      } finally {
        setIsCheckingAccess(false);
      }
    }

    void checkAccess();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setFieldErrors({});

    if (ownerPassword !== ownerPasswordConfirmation) {
      setError("Password owner dan konfirmasi password tidak sama.");
      return;
    }

    setIsSubmitting(true);

    try {
        await apiFetch<StoreResponse>("/admin/stores", {
            method: "POST",
            token,
            body: {
              name: storeName,
              category: storeCategory || null,
              phone: storePhone || null,
              email: storeEmail || null,
              address: storeAddress || null,
              description: storeDescription || null,
              owner: {
                name: ownerName,
                email: ownerEmail,
                password: ownerPassword,
                password_confirmation: ownerPasswordConfirmation,
              },
            },
          });
          
          router.push("/admin/stores");

    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        setFieldErrors(error.errors ?? {});
      } else {
        setError("Gagal membuat toko UMKM.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/stores"
          className="inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          ← Kembali ke daftar toko
        </Link>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
        >
          <p className="text-sm font-medium text-zinc-400">
            Create UMKM Tenant
          </p>

          <h1 className="mt-3 text-3xl font-bold">Tambah UMKM Baru</h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Buat tenant toko baru sekaligus akun owner yang akan mengelola toko
            tersebut.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {isCheckingAccess ? (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-sm text-zinc-400">
                Memeriksa akses super admin...
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold">Data Toko</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Informasi ini akan tampil di storefront publik.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Nama Toko
                  </label>

                  <input
                    value={storeName}
                    onChange={(event) => setStoreName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="Contoh: Kopi Nusantara"
                    required
                  />

                  {fieldErrors.name ? (
                    <p className="mt-2 text-xs text-red-300">
                      {fieldErrors.name[0]}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Kategori Usaha
                  </label>

                  <input
                    value={storeCategory}
                    onChange={(event) => setStoreCategory(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="Contoh: Food & Beverage"
                  />

                  {fieldErrors.category ? (
                    <p className="mt-2 text-xs text-red-300">
                      {fieldErrors.category[0]}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Nomor WhatsApp Toko
                  </label>

                  <input
                    value={storePhone}
                    onChange={(event) => setStorePhone(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="081234567890"
                  />

                  {fieldErrors.phone ? (
                    <p className="mt-2 text-xs text-red-300">
                      {fieldErrors.phone[0]}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Email Toko
                  </label>

                  <input
                    type="email"
                    value={storeEmail}
                    onChange={(event) => setStoreEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="toko@email.com"
                  />

                  {fieldErrors.email ? (
                    <p className="mt-2 text-xs text-red-300">
                      {fieldErrors.email[0]}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Alamat Toko
                  </label>

                  <textarea
                    value={storeAddress}
                    onChange={(event) => setStoreAddress(event.target.value)}
                    className="mt-2 min-h-28 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="Alamat lengkap toko"
                  />

                  {fieldErrors.address ? (
                    <p className="mt-2 text-xs text-red-300">
                      {fieldErrors.address[0]}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Deskripsi Toko
                  </label>

                  <textarea
                    value={storeDescription}
                    onChange={(event) =>
                      setStoreDescription(event.target.value)
                    }
                    className="mt-2 min-h-32 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                    placeholder="Deskripsi singkat toko"
                  />

                  {fieldErrors.description ? (
                    <p className="mt-2 text-xs text-red-300">
                      {fieldErrors.description[0]}
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold">Akun Owner</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Akun ini dipakai owner untuk login ke dashboard toko.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <div>
                    <label className="text-sm font-medium text-zinc-300">
                      Nama Owner
                    </label>

                    <input
                      value={ownerName}
                      onChange={(event) => setOwnerName(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                      placeholder="Contoh: Owner Kopi Nusantara"
                      required
                    />

                    {fieldErrors["owner.name"] ? (
                      <p className="mt-2 text-xs text-red-300">
                        {fieldErrors["owner.name"][0]}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-medium text-zinc-300">
                      Email Owner
                    </label>

                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(event) => setOwnerEmail(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                      placeholder="owner@email.com"
                      required
                    />

                    {fieldErrors["owner.email"] ? (
                      <p className="mt-2 text-xs text-red-300">
                        {fieldErrors["owner.email"][0]}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-medium text-zinc-300">
                      Password Owner
                    </label>

                    <input
                      type="password"
                      value={ownerPassword}
                      onChange={(event) => setOwnerPassword(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                      required
                    />

                    {fieldErrors["owner.password"] ? (
                      <p className="mt-2 text-xs text-red-300">
                        {fieldErrors["owner.password"][0]}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-medium text-zinc-300">
                      Konfirmasi Password Owner
                    </label>

                    <input
                      type="password"
                      value={ownerPasswordConfirmation}
                      onChange={(event) =>
                        setOwnerPasswordConfirmation(event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white"
                      required
                    />

                    {fieldErrors["owner.password_confirmation"] ? (
                      <p className="mt-2 text-xs text-red-300">
                        {fieldErrors["owner.password_confirmation"][0]}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-200">
                  <p className="font-semibold">Catatan keamanan</p>
                  <p className="mt-2 text-amber-100/80">
                    Password default boleh dipakai untuk testing. Untuk
                    produksi, owner sebaiknya diminta mengganti password setelah
                    login.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Membuat UMKM..." : "Buat UMKM"}
                </button>
              </section>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
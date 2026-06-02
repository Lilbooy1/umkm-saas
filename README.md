# UMKM SaaS Ecommerce

Platform SaaS ecommerce multi-UMKM dengan Front-End dan Back-End terpisah.

## Architecture

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS

Backend:
- Laravel API
- MySQL
- Laravel Sanctum
- Spatie Permission

## Folder Structure

apps/api = Laravel API Backend
apps/web = Next.js Frontend
docs     = Project documentation

## Main Concept

Satu sistem untuk banyak UMKM tanpa subdomain.
Setiap UMKM punya halaman toko berbasis slug.

Contoh:
domain.com/toko/nama-toko

## Important Rules

- Front-End dan Back-End dipisah.
- Laravel hanya digunakan sebagai API.
- Semua data toko wajib punya store_id.
- Customer wajib login sebelum checkout.
- Order masuk dashboard dan WhatsApp hanya sebagai reminder/backup.
- Pembayaran mendukung manual transfer dan payment gateway.

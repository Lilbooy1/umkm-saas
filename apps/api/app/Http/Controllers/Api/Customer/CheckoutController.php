<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CheckoutController extends Controller
{
    public function store(Request $request, Store $store): JsonResponse
    {
        abort_if(! $store->is_active, 404, 'Toko tidak ditemukan atau sedang tidak aktif.');

        $validated = $request->validate([
            'customer_phone' => ['required', 'string', 'max:30'],
            'shipping_address' => ['required', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:1000'],

            'payment_method' => [
                'required',
                Rule::in(['manual_transfer', 'qris_manual', 'cod']),
            ],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        $order = DB::transaction(function () use ($validated, $store, $user) {
            $subtotal = 0;
            $resolvedItems = [];

            foreach ($validated['items'] as $item) {
                $product = Product::query()
                    ->where('store_id', $store->id)
                    ->where('is_active', true)
                    ->where('id', $item['product_id'])
                    ->lockForUpdate()
                    ->first();

                abort_if(! $product, 422, 'Produk tidak valid atau tidak tersedia.');

                $quantity = (int) $item['quantity'];

                if ($product->track_stock && $product->stock_quantity < $quantity) {
                    abort(422, "Stok produk {$product->name} tidak mencukupi.");
                }

                $price = (float) $product->price;
                $itemTotal = $price * $quantity;
                $subtotal += $itemTotal;

                $resolvedItems[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total' => $itemTotal,
                ];
            }

            $order = Order::create([
                'store_id' => $store->id,
                'customer_id' => $user->id,
                'invoice_number' => $this->generateInvoiceNumber(),
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'notes' => $validated['notes'] ?? null,
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'status' => 'pending_payment',
            ]);

            foreach ($resolvedItems as $resolvedItem) {
                /** @var Product $product */
                $product = $resolvedItem['product'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_slug' => $product->slug,
                    'product_sku' => $product->sku,
                    'quantity' => $resolvedItem['quantity'],
                    'price' => $resolvedItem['price'],
                    'total' => $resolvedItem['total'],
                ]);

                if ($product->track_stock) {
                    $product->decrement('stock_quantity', $resolvedItem['quantity']);
                }
            }

            $order->payment()->create([
                'method' => $validated['payment_method'],
                'provider' => 'manual',
                'status' => $validated['payment_method'] === 'cod'
                    ? 'unpaid'
                    : 'waiting_confirmation',
                'amount' => $subtotal,
            ]);

            return $order->load([
                'store:id,name,slug',
                'items',
                'payment',
            ]);
        });

        return response()->json([
            'message' => 'Checkout berhasil. Order berhasil dibuat.',
            'data' => $order,
        ], 201);
    }

    private function generateInvoiceNumber(): string
    {
        do {
            $invoiceNumber = 'INV-' . now()->format('Ymd') . '-' . strtoupper(str()->random(8));
        } while (Order::query()->where('invoice_number', $invoiceNumber)->exists());

        return $invoiceNumber;
    }
}

<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request, Store $store): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);

        $orders = $store->orders()
            ->with([
                'customer:id,name,email,role',
                'payment:id,order_id,method,status,amount,paid_at',
            ])
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'Daftar order toko berhasil diambil.',
            'data' => $orders,
        ]);
    }

    public function show(Request $request, Store $store, Order $order): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);
        $this->ensureOrderBelongsToStore($store, $order);

        return response()->json([
            'message' => 'Detail order toko berhasil diambil.',
            'data' => $order->load([
                'customer:id,name,email,role',
                'store:id,name,slug',
                'items',
                'payment',
            ]),
        ]);
    }

    public function updateStatus(Request $request, Store $store, Order $order): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);
        $this->ensureOrderBelongsToStore($store, $order);

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'pending_payment',
                    'paid',
                    'confirmed',
                    'processing',
                    'ready',
                    'shipped',
                    'completed',
                    'cancelled',
                    'refunded',
                ]),
            ],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Status order berhasil diperbarui.',
            'data' => $order->fresh()->load([
                'customer:id,name,email,role',
                'items',
                'payment',
            ]),
        ]);
    }

    public function confirmPayment(Request $request, Store $store, Order $order): JsonResponse
    {
        $this->ensureUserHasAccessToStore($request, $store);
        $this->ensureOrderBelongsToStore($store, $order);

        $payment = $order->payment;

        abort_if(! $payment, 404, 'Data pembayaran tidak ditemukan.');

        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        if ($order->status === 'pending_payment') {
            $order->update([
                'status' => 'paid',
            ]);
        }

        return response()->json([
            'message' => 'Pembayaran berhasil dikonfirmasi.',
            'data' => $order->fresh()->load([
                'customer:id,name,email,role',
                'items',
                'payment',
            ]),
        ]);
    }

    private function ensureUserHasAccessToStore(Request $request, Store $store): void
    {
        $hasAccess = $request->user()
            ->stores()
            ->where('stores.id', $store->id)
            ->exists();

        abort_if(! $hasAccess, 403, 'Kamu tidak punya akses ke toko ini.');
    }

    private function ensureOrderBelongsToStore(Store $store, Order $order): void
    {
        abort_if(
            $order->store_id !== $store->id,
            404,
            'Order tidak ditemukan di toko ini.'
        );
    }
}

<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['store:id,name,slug', 'payment:id,order_id,method,status,amount'])
            ->where('customer_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'Daftar order customer berhasil diambil.',
            'data' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_if(
            $order->customer_id !== $request->user()->id,
            403,
            'Kamu tidak punya akses ke order ini.'
        );

        return response()->json([
            'message' => 'Detail order berhasil diambil.',
            'data' => $order->load([
                'store:id,name,slug',
                'items',
                'payment',
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        abort(405, 'Gunakan endpoint checkout untuk membuat order.');
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        abort(405, 'Customer tidak dapat mengubah order dari endpoint ini.');
    }

    public function destroy(Order $order): JsonResponse
    {
        abort(405, 'Customer tidak dapat menghapus order dari endpoint ini.');
    }
}

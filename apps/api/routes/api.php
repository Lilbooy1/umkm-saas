<?php

use App\Http\Controllers\Api\Admin\StoreController as AdminStoreController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Customer\CheckoutController;
use App\Http\Controllers\Api\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\Owner\OrderController as OwnerOrderController;
use App\Http\Controllers\Api\Owner\ProductCategoryController;
use App\Http\Controllers\Api\Owner\ProductController;
use App\Http\Controllers\Api\Owner\StoreController as OwnerStoreController;
use App\Http\Controllers\Api\Storefront\StorefrontController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'UMKM SaaS API is running',
        'app' => config('app.name'),
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::prefix('storefront')
    ->scopeBindings()
    ->group(function () {
        Route::get('/stores/{store:slug}', [StorefrontController::class, 'showStore']);
        Route::get('/stores/{store:slug}/categories', [StorefrontController::class, 'categories']);
        Route::get('/stores/{store:slug}/products', [StorefrontController::class, 'products']);
        Route::get('/stores/{store:slug}/products/{product:slug}', [StorefrontController::class, 'showProduct']);
    });

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/role-test/customer', function () {
        return response()->json([
            'message' => 'Akses customer berhasil.',
        ]);
    })->middleware('role:customer');

    Route::get('/role-test/owner', function () {
        return response()->json([
            'message' => 'Akses owner berhasil.',
        ]);
    })->middleware('role:owner');

    Route::get('/role-test/super-admin', function () {
        return response()->json([
            'message' => 'Akses super admin berhasil.',
        ]);
    })->middleware('role:super_admin');
});

Route::middleware(['auth:sanctum', 'role:super_admin'])
    ->prefix('admin')
    ->group(function () {
        Route::apiResource('stores', AdminStoreController::class);
    });

Route::middleware(['auth:sanctum', 'role:owner,staff'])
    ->prefix('owner')
    ->group(function () {
        Route::get('/stores', [OwnerStoreController::class, 'index']);
        Route::get('/stores/{store}', [OwnerStoreController::class, 'show']);
        Route::patch('/stores/{store}', [OwnerStoreController::class, 'update']);

        Route::apiResource('stores.categories', ProductCategoryController::class)
            ->parameters([
                'categories' => 'category',
            ]);

        Route::apiResource('stores.products', ProductController::class)
            ->parameters([
                'products' => 'product',
            ]);

        Route::get('/stores/{store}/orders', [OwnerOrderController::class, 'index']);
        Route::get('/stores/{store}/orders/{order}', [OwnerOrderController::class, 'show']);
        Route::patch('/stores/{store}/orders/{order}/status', [OwnerOrderController::class, 'updateStatus']);
        Route::patch('/stores/{store}/orders/{order}/payment/confirm', [OwnerOrderController::class, 'confirmPayment']);
    });

Route::middleware(['auth:sanctum', 'role:customer'])
    ->prefix('customer')
    ->group(function () {
        Route::post('/stores/{store:slug}/checkout', [CheckoutController::class, 'store']);

        Route::apiResource('orders', CustomerOrderController::class)
            ->only(['index', 'show']);
    });

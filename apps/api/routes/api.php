<?php

use App\Http\Controllers\Api\AuthController;
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

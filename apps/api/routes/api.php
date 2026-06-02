<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'UMKM SaaS API is running',
        'app' => config('app.name'),
    ]);
});

<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\BulkImportController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

// Public health check
Route::get('/health', [HealthController::class, 'index']);

// Admin routes (authenticated)
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Reports
    Route::get('/reports/bookings', [ReportController::class, 'bookingsByPeriod']);
    Route::get('/reports/revenue', [ReportController::class, 'revenueByPeriod']);
    Route::get('/reports/cancellation-stats', [ReportController::class, 'cancellationStats']);

    // Invoices
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::put('/invoices/{id}', [InvoiceController::class, 'update']);
    Route::get('/invoices/{id}/export-pdf', [InvoiceController::class, 'exportPdf']);

    // Audit logs
    Route::get('/audit-logs', [AuditLogController::class, 'index']);

    // Bulk import
    Route::post('/bulk-import/customers', [BulkImportController::class, 'importCustomers']);

    // Staff CRUD
    Route::apiResource('/staff', StaffController::class);
});

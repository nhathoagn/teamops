<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function bookingsByPeriod(Request $request): JsonResponse
    {
        $period = $request->query('period', 'day');
        $query = Booking::query();

        $grouped = match ($period) {
            'day' => $query->selectRaw('DATE(created_at) as period, count(*) as total')
                ->groupBy('period')
                ->orderByDesc('period')
                ->limit(30)
                ->get(),
            'week' => $query->selectRaw("strftime('%Y-%W', created_at) as period, count(*) as total")
                ->groupBy('period')
                ->orderByDesc('period')
                ->limit(12)
                ->get(),
            'month' => $query->selectRaw("strftime('%Y-%m', created_at) as period, count(*) as total")
                ->groupBy('period')
                ->orderByDesc('period')
                ->limit(12)
                ->get(),
            default => $query->selectRaw('DATE(created_at) as period, count(*) as total')
                ->groupBy('period')
                ->orderByDesc('period')
                ->limit(30)
                ->get(),
        };

        return response()->json(['period' => $period, 'data' => $grouped]);
    }

    public function revenueByPeriod(Request $request): JsonResponse
    {
        $period = $request->query('period', 'month');

        $query = Invoice::where('status', 'paid');

        $grouped = match ($period) {
            'day' => $query->selectRaw('DATE(paid_at) as period, sum(amount_cents) as revenue_cents')
                ->groupBy('period')
                ->orderByDesc('period')
                ->limit(30)
                ->get(),
            'week' => $query->selectRaw("strftime('%Y-%W', paid_at) as period, sum(amount_cents) as revenue_cents")
                ->groupBy('period')
                ->orderByDesc('period')
                ->limit(12)
                ->get(),
            'month' => $query->selectRaw("strftime('%Y-%m', paid_at) as period, sum(amount_cents) as revenue_cents")
                ->groupBy('period')
                ->orderByDesc('period')
                ->limit(12)
                ->get(),
            default => $query->selectRaw("strftime('%Y-%m', paid_at) as period, sum(amount_cents) as revenue_cents")
                ->groupBy('period')
                ->orderByDesc('period')
                ->limit(12)
                ->get(),
        };

        return response()->json(['period' => $period, 'data' => $grouped]);
    }

    public function cancellationStats(): JsonResponse
    {
        $totalBookings = Booking::count();
        $cancelledBookings = Booking::where('status', 'cancelled')->count();
        $cancellationRate = $totalBookings > 0
            ? round(($cancelledBookings / $totalBookings) * 100, 2)
            : 0;

        $cancellationsByMonth = Booking::where('status', 'cancelled')
            ->selectRaw("strftime('%Y-%m', cancelled_at) as month, count(*) as count")
            ->groupBy('month')
            ->orderByDesc('month')
            ->limit(12)
            ->get();

        return response()->json([
            'total_bookings' => $totalBookings,
            'cancelled_bookings' => $cancelledBookings,
            'cancellation_rate' => $cancellationRate,
            'by_month' => $cancellationsByMonth,
        ]);
    }
}

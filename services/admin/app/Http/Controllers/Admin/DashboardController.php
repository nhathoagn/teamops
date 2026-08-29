<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Incident;
use App\Models\Invoice;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $now = Carbon::now();
        $startOfDay = $now->copy()->startOfDay();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfMonth = $now->copy()->startOfMonth();

        $totalBookingsToday = Booking::where('created_at', '>=', $startOfDay)->count();
        $totalBookingsWeek = Booking::where('created_at', '>=', $startOfWeek)->count();
        $totalBookingsMonth = Booking::where('created_at', '>=', $startOfMonth)->count();

        $revenueThisMonth = Invoice::where('status', 'paid')
            ->where('paid_at', '>=', $startOfMonth)
            ->sum('amount_cents');

        $activeIncidents = Incident::where('status', '!=', 'resolved')->count();

        $totalBookingsAll = Booking::count();
        $cancelledBookings = Booking::where('status', 'cancelled')->count();
        $cancellationRate = $totalBookingsAll > 0
            ? round(($cancelledBookings / $totalBookingsAll) * 100, 2)
            : 0;

        return response()->json([
            'total_bookings_today' => $totalBookingsToday,
            'total_bookings_week' => $totalBookingsWeek,
            'total_bookings_month' => $totalBookingsMonth,
            'revenue_this_month' => $revenueThisMonth,
            'active_incidents' => $activeIncidents,
            'cancellation_rate' => $cancellationRate,
        ]);
    }
}

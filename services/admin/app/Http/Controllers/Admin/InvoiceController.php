<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with('customer', 'items');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($customerId = $request->query('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        $invoices = $query->orderByDesc('created_at')->paginate($request->query('per_page', 25));

        return response()->json($invoices);
    }

    public function show(int $id): JsonResponse
    {
        $invoice = Invoice::with('customer', 'items')->findOrFail($id);

        return response()->json($invoice);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|string|in:draft,sent,paid,overdue,cancelled',
            'due_date' => 'sometimes|date',
            'amount_cents' => 'sometimes|integer|min:0',
        ]);

        $invoice->update($validated);

        return response()->json($invoice->fresh());
    }

    public function exportPdf(int $id): JsonResponse
    {
        $invoice = Invoice::with('customer', 'items')->findOrFail($id);

        // Placeholder — PDF generation to be implemented
        return response()->json([
            'message' => 'PDF export not yet implemented',
            'invoice' => $invoice,
        ]);
    }
}

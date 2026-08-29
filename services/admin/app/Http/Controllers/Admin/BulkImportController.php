<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ImportCustomersJob;
use App\Http\Requests\StoreBulkImportRequest;
use Illuminate\Http\JsonResponse;

class BulkImportController extends Controller
{
    public function importCustomers(StoreBulkImportRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $path = $file->store('imports');

        ImportCustomersJob::dispatch($path, $request->user()->id);

        return response()->json([
            'message' => 'Import queued successfully',
            'file' => $path,
        ], 202);
    }
}

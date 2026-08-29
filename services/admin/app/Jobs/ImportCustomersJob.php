<?php

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImportCustomersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public string $filePath,
        public int $userId,
    ) {}

    public function handle(): void
    {
        if (!Storage::exists($this->filePath)) {
            Log::error('Import file not found', ['path' => $this->filePath]);
            return;
        }

        $contents = Storage::get($this->filePath);
        $rows = array_map('str_getcsv', explode("\n", trim($contents)));

        if (count($rows) < 2) {
            Log::warning('Import file is empty or has no data rows', ['path' => $this->filePath]);
            return;
        }

        $headers = array_map('strtolower', array_map('trim', $rows[0]));
        $errors = [];
        $imported = 0;

        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            if (count($row) !== count($headers) || empty(array_filter($row))) {
                continue;
            }

            $data = array_combine($headers, $row);

            try {
                Customer::create([
                    'org_id' => $data['org_id'] ?? null,
                    'name' => $data['name'] ?? '',
                    'email' => $data['email'] ?? null,
                    'phone' => $data['phone'] ?? null,
                ]);
                $imported++;
            } catch (\Throwable $e) {
                $errors[] = [
                    'row' => $i + 1,
                    'error' => $e->getMessage(),
                ];
                Log::warning('Import row failed', ['row' => $i + 1, 'error' => $e->getMessage()]);
            }
        }

        Log::info('Import completed', [
            'file' => $this->filePath,
            'imported' => $imported,
            'errors' => count($errors),
        ]);

        // Clean up the file after processing
        Storage::delete($this->filePath);
    }
}

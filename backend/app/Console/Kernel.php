<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\ScheduleSetting;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $setting = ScheduleSetting::where('is_active', true)
        //     ->where('start_time', '<=', now())
        //     ->where('end_time', '>=', now())
        //     ->first();

        // if ($setting) {
        //     $interval = $setting->interval;
        //     $schedule->command('app:fetch-data')->cron($interval);
        // }else{
        //     Log::info('No active schedule setting');
        // }
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}

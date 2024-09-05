<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\ScheduleSetting;
use App\Models\Objective;
use App\Models\root_accounts;
use App\Models\logs_root_accounts;
use App\Models\logs_objectives;
use App\Models\logs_local;
use App\Models\logs_permission_groups;
use App\Models\locals;
use App\Models\permission_groups;

class FetchData extends Command
{
    protected $signature = 'app:fetch-data';
    protected $description = 'Command description';

    public function handle()
    {
        $setting = ScheduleSetting::where('is_active', true)
            ->where('start_time', '<=', date_format(now(), 'H:i:s'))
            ->where('end_time', '>=', date_format(now(), 'H:i:s'))
            ->first();

        if ($setting) {
            $interval = $setting->interval; // ช่วงเวลาในการ sync (นาที)

            // ตรวจสอบว่านาทีปัจจุบันสามารถหารด้วยช่วงเวลาได้ลงตัวหรือไม่
            $currentMinute = now()->minute;
            if ($currentMinute % $interval === 0) {
                $this->root_account();
                $this->objective();
                $this->local();
                $this->permission_group();
            } else {
                $file = fopen(public_path('logs/schedule.log'), 'a');
                fwrite($file, 'ไม่สามารถ sync ข้อมูลในนาทีนี้ ' . now() . PHP_EOL);
                fclose($file);
            }
        } else {
            $file = fopen(public_path('logs/schedule.log'), 'a');
            fwrite($file, 'ไม่สามารถ sync ข้อมูลในช่วงเวลานี้ ' . now() . PHP_EOL);
            fclose($file);
        }
    }

    public function root_account()
    {
        $response = Http::get(env('API_SYNC_URL') . '/sync/out/root_account/1');
        $data = $response->json();
        // ดึงข้อมูลทั้งหมดจากฐานข้อมูลและจัดกลุ่มตาม _id
        $existingRootAccounts = root_accounts::all()->keyBy('_id');

        // ควบคุมการเพิ่มและการอัปเดตข้อมูล
        foreach ($data as $item) {
            $rootAccount = $existingRootAccounts->get($item['_id']);

            if (!$rootAccount) {
                // เพิ่มข้อมูลใหม่
                $data = new root_accounts();
                $data->_id = $item['_id'];
                $data->site = $item['site'];
                $data->permission_group = $item['permission_group'];
                $data->username = $item['username'];
                $data->password = $item['password'];
                $data->fullname = $item['fullname'];
                $data->save();

                $log = new logs_root_accounts();
                $log->log = 'เพิ่มข้อมูลใหม่ ' . $item;
                $log->save();
            } else {
                // ตรวจสอบการเปลี่ยนแปลง
                $isUpdated = false;
                $log = new logs_root_accounts();
                if ($rootAccount->site !== $item['site']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $rootAccount->site . ' เป็น ' . $item['site'];
                    $rootAccount->site = $item['site'];
                    $isUpdated = true;
                }

                if ($rootAccount->permission_group !== $item['permission_group']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $rootAccount->permission_group . ' เป็น ' . $item['permission_group'];
                    $rootAccount->permission_group = $item['permission_group'];
                    $isUpdated = true;
                }

                if ($rootAccount->username !== $item['username']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $rootAccount->username . ' เป็น ' . $item['username'];
                    $rootAccount->username = $item['username'];
                    $isUpdated = true;
                }

                if ($rootAccount->password !== $item['password']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $rootAccount->password . ' เป็น ' . $item['password'];
                    $rootAccount->password = $item['password'];
                    $isUpdated = true;
                }

                if ($rootAccount->fullname !== $item['fullname']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $rootAccount->fullname . ' เป็น ' . $item['fullname'];
                    $rootAccount->fullname = $item['fullname'];
                    $isUpdated = true;
                }

                // อัปเดตข้อมูลหากมีการเปลี่ยนแปลง
                if ($isUpdated) {
                    $rootAccount->save();
                    $log->save();
                }
                // ลบออกจากรายการที่ต้องลบ
                $existingRootAccounts->forget($item['_id']);
            }
        }

        // ลบข้อมูลที่ไม่พบในข้อมูลที่นำเข้ามา
        foreach ($existingRootAccounts as $rootAccount) {
            $rootAccount->delete();
            $log = new logs_root_accounts();
            $log->log = 'ลบข้อมูล ' . $rootAccount . ' ออกจากรายการ';
            $log->save();
        }
    }

    public function objective()
    {
        $response = Http::get(env('API_SYNC_URL') . '/sync/out/objectives/1');
        $data = $response->json();
        // ดึงข้อมูลทั้งหมดจากฐานข้อมูลและจัดกลุ่มตาม _id
        $existingObjectives = Objective::all()->keyBy('_id');

        // ควบคุมการเพิ่มและการอัปเดตข้อมูล
        foreach ($data as $item) {
            $objective = $existingObjectives->get($item['_id']);

            if (!$objective) {

                // เพิ่มข้อมูลใหม่
                $data = new Objective();
                $data->_id = $item['_id'];
                $data->site = $item['site'];
                $data->objective = $item['obj_name'];
                $data->save();

                $log = new logs_objectives();
                $log->log = 'เพิ่มข้อมูลใหม่ ' . $item;
                $log->save();
            } else {
                // ตรวจสอบการเปลี่ยนแปลง
                $isUpdated = false;
                $log = new logs_objectives();
                if ($objective->site !== $item['site']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $objective->site . ' เป็น ' . $item['site'];
                    $objective->site = $item['site'];
                    $isUpdated = true;
                }

                if ($objective->objective !== $item['obj_name']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $objective->objective . ' เป็น ' . $item['obj_name'];
                    $objective->objective = $item['obj_name'];
                    $isUpdated = true;
                }

                // อัปเดตข้อมูลหากมีการเปลี่ยนแปลง
                if ($isUpdated) {
                    $objective->save();
                    $log->save();
                }
                // ลบออกจากรายการที่ต้องลบ
                $existingObjectives->forget($item['_id']);
            }
        }

        // ลบข้อมูลที่ไม่พบในข้อมูลที่นำเข้ามา
        foreach ($existingObjectives as $objective) {
            $objective->delete();
            $log = new logs_objectives();
            $log->log = 'ลบข้อมูล ' . $objective . ' ออกจากรายการ';
            $log->save();
        }
    }

    public function local()
    {
        $response = Http::get(env('API_SYNC_URL') . '/sync/out/local/1');
        $data = $response->json();

        $existingObjectives = locals::all()->keyBy('_id');

        foreach ($data as $item) {
            $local = $existingObjectives->get($item['_id']);

            if (!$local) {
                $data = new locals();
                $data->_id = $item['_id'];
                $data->site = $item['site'];
                $data->local_name = $item['local_name'];
                $data->save();

                $log = new logs_local();
                $log->log = 'เพิ่มข้อมูลใหม่ ' . json_encode($item);
                $log->save();
            } else {
                $isUpdated = false;
                $log = new logs_local();
                if ($local->site !== $item['site']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $local->site . ' เป็น ' . $item['site'];
                    $local->site = $item['site'];
                    $isUpdated = true;
                }

                if ($local->local_name !== $item['local_name']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $local->local_name . ' เป็น ' . $item['local_name'];
                    $local->local_name = $item['local_name'];
                    $isUpdated = true;
                }

                if ($isUpdated) {
                    $local->save();
                    $log->save();
                }
                $existingObjectives->forget($item['_id']);
            }
        }

        foreach ($existingObjectives as $local) {
            $local->delete();
            $log = new logs_local();
            $log->log = 'ลบข้อมูล ' . $local . ' ออกจากรายการ';
            $log->save();
        }


    }

    public function permission_group(){
        $response = Http::get(env('API_SYNC_URL') . '/sync/out/permission_group/1');
        $data = $response->json();

        $existingPermissionGroups = permission_groups::all()->keyBy('_id');

        foreach($data as $item){
            $permissionGroup = $existingPermissionGroups->get($item['_id']);

            if (!$permissionGroup) {
                $data = new permission_groups();
                $data->_id = $item['_id'];
                $data->group_name = $item['group_name'];
                $data->save();

                $log = new logs_permission_groups();
                $log->log = 'เพิ่มข้อมูลใหม่ ' . $item;
                $log->save();
            } else {
                $isUpdated = false;
                $log = new logs_permission_groups();
                if ($permissionGroup->group_name !== $item['group_name']) {
                    $log->log = 'เปลี่ยนแปลงข้อมูลจาก ' . $permissionGroup->group_name . ' เป็น ' . $item['group_name'];
                    $permissionGroup->group_name = $item['group_name'];
                    $isUpdated = true;
                }

                if ($isUpdated) {
                    $permissionGroup->save();
                    $log->save();
                }
                $existingPermissionGroups->forget($item['_id']);
            }
        }

        foreach ($existingPermissionGroups as $permissionGroup) {
            $permissionGroup->delete();
            $log = new logs_permission_groups();
            $log->log = 'ลบข้อมูล ' . $permissionGroup . ' ออกจากรายการ';
            $log->save();
        }
    }

}

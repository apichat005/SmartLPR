<?php

namespace App\Http\Controllers;

use App\Models\historys;
use App\Models\lists;
use App\Models\webhook;
use App\Models\log_webhook;
use App\Models\log_lpr_diffs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class HistorysController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/history/{date_start}/{date_end}/{gate}/{page}/{limit}",
     *     operationId="history",
     *     tags={"History"},
     *     summary="Get history of items",
     *     description="Retrieve a history of items based on date range, gate, pagination, and limit",
     *     @OA\Parameter(
     *         name="date_start",
     *         in="path",
     *         required=true,
     *         @OA\Schema(
     *             type="string",
     *             format="datetime",
     *             example="2024-09-01 00:00:00"
     *         ),
     *         description="Start date for filtering the list"
     *     ),
     *     @OA\Parameter(
     *         name="date_end",
     *         in="path",
     *         required=true,
     *         @OA\Schema(
     *             type="string",
     *             format="datetime",
     *             example="2024-09-05 23:59:59"
     *         ),
     *         description="End date for filtering the list"
     *     ),
     *     @OA\Parameter(
     *         name="gate",
     *         in="path",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="66d9965ec312805ebe04d8bd"
     *         ),
     *         description="Gate number for filtering the list"
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="path",
     *         required=false,
     *         @OA\Schema(
     *             type="integer",
     *             example=1
     *         ),
     *         description="Page number for pagination"
     *     ),
     *     @OA\Parameter(
     *         name="limit",
     *         in="path",
     *         required=false,
     *         @OA\Schema(
     *             type="integer",
     *             example=10
     *         ),
     *         description="Number of items per page"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List retrieved successfully"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     )
     * )
     */
    public function index($date_start, $date_end, $gate, $page, $limit)
    {
        // Step 1: Convert string dates into proper formats for comparison
        $date_start = date('Y-m-d H:i:s', strtotime($date_start));
        $date_end = date('Y-m-d H:i:s', strtotime($date_end));

        // Step 2: Convert string gate IDs into an array
        $gateArray = array_filter(explode(',', $gate)); // Filter out any empty values

        // Step 3: Query the database for the correct date range and gate IDs
        $history = historys::whereBetween('timestamp', [$date_start, $date_end])
            ->whereIn('gate_id', $gateArray) // Use whereIn for array comparison
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'status' => 200,
            'data' => $history,
            'date_start' => $date_start,
            'date_end' => $date_end,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/history",
     *     summary="Store a newly created history in storage",
     *     tags={"History"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *             @OA\Property(
     *                 property="lpr",
     *                 type="string",
     *                 description="License plate recognition (LPR) value",
     *                 example="ABC1234"
     *             ),
     *             @OA\Property(
     *                 property="type",
     *                 type="string",
     *                 description="Type of the list entry",
     *                 example="Vehicle"
     *             ),
     *             @OA\Property(
     *                 property="traffic_type",
     *                 type="string",
     *                 description="Type of traffic (e.g., 'Entry' or 'Exit')",
     *                 example="Entry"
     *             ),
     *             @OA\Property(
     *                 property="image",
     *                 type="string",
     *                 format="binary",
     *                 description="Image file associated with the entry"
     *             ),
     *             @OA\Property(
     *                 property="gate_id",
     *                 type="integer",
     *                 description="ID of the gate where the traffic occurred",
     *                 example=1
     *             ),
     *             @OA\Property(
     *                 property="timestamp",
     *                 type="string",
     *                 format="date-time",
     *                 description="Timestamp when the entry was recorded",
     *                 example="2024-09-04T10:00:00Z"
     *             )
     *           )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="History created successfully"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     )
     * )
     */
    public function store(Request $request)
    {
        if ($request->hasFile('image')) {
            // check lpr for required
            if (empty($request->lpr)) {
                return response()->json(['status' => 400, 'message' => 'ไม่พบข้อมูลป้ายทะเบียน']);
            } else {
                // ตรวจสอบป้ายทะเบียนตามเงื่อนไขที่กำหนด
                $lpr = $this->compareLicensePlate($request->lpr);
                if ($lpr['status']) {
                    return response()->json([
                        'status' => 400,
                        'message' => $lpr['status_txt'],
                        'lpr' => $lpr['lpr_right'],
                        'type_name' => $lpr['type_name'],
                        'exp_date' => $lpr['exp_date']
                    ]);
                }

                // $lpr = (string)$lpr['lpr_right'];
                // $type_name = (string)$lpr['type_name'];
                // $exp_date = (string)$lpr['exp_date'];

                $image = $request->file('image');
                $image_name = time();
                $image->move(public_path('images'), $image_name);

                $history = new historys();
                $history->lpr = $lpr['lpr_right'];
                $history->type = $lpr['type_name'];
                $history->traffic_type = ['IN', 'OUT'][rand(0, 1)];
                $history->image = $image_name;
                $history->gate_id = $request->gate_id;
                $history->timestamp = date('Y-m-d H:i:s');
                $history->save();

                // เช็ค webhook ว่ามีการตั้งค่าหรือไม่ ถ้ามีให้ส่งข้อมูลไปยัง webhook จากฐานข้อมูล
                // ส่งข้อมูลไปยัง webhook ที่ตั้งค่าไว้
                // ดึงรายการ webhook ทั้งหมด
                $webhooks = Webhook::all();

                if ($webhooks->isNotEmpty()) {
                    // ส่งข้อมูลไปยัง webhook ล่าสุดที่ตั้งค่าไว้
                    foreach ($webhooks as $webhook) {
                        try {
                            // ส่งข้อมูลไปยัง webhook
                            $response = Http::post($webhook->webhook, [
                                'lpr' => $lpr['lpr_right'],
                                'type' => $request->type,
                                'traffic_type' => $request->traffic_type,
                                'image' => $request->image_name, // สมมติว่า $image_name เป็นตัวแปรที่เก็บชื่อภาพ
                                'gate_id' => $request->gate_id,
                                'timestamp' => now()->toDateTimeString()
                            ]);

                            // บันทึก log ตามผลลัพธ์ของการส่งข้อมูล
                            $logWebhook = new log_webhook();
                            $logWebhook->webhook_id = $webhook->id;
                            $logWebhook->response = $response->status();
                            $logWebhook->timestamp = now()->toDateTimeString();
                            $logWebhook->save();

                            // ตรวจสอบสถานะของการตอบสนอง
                            if ($response->failed()) {
                                // หากการส่งข้อมูลล้มเหลว ให้บันทึกข้อผิดพลาดใน log
                                $logWebhook->response = 'Failed';
                                $logWebhook->save();
                                // ข้าม webhook นี้และดำเนินการต่อไป
                                continue;
                            }
                        } catch (\Illuminate\Http\Client\ConnectionException $e) {
                            // จัดการกับข้อผิดพลาดที่เกิดขึ้นในการเชื่อมต่อ
                            $logWebhook = new log_webhook();
                            $logWebhook->webhook_id = $webhook->id;
                            $logWebhook->response = 'Connection Error';
                            $logWebhook->timestamp = now()->toDateTimeString();
                            $logWebhook->save();

                            // ข้าม webhook นี้และดำเนินการต่อไป
                            continue;
                        } catch (\Exception $e) {
                            // จัดการกับข้อผิดพลาดอื่น ๆ
                            $logWebhook = new log_webhook();
                            $logWebhook->webhook_id = $webhook->id;
                            $logWebhook->response = 'Error';
                            $logWebhook->timestamp = now()->toDateTimeString();
                            $logWebhook->save();
                            // ข้าม webhook นี้และดำเนินการต่อไป
                            continue;
                        }
                    }
                }

                return response()->json([
                    'status' => '200',
                    'message' => 'บันทึกประวัติสำเร็จ',
                    'lpr' => $lpr['lpr_right'],
                    'type_name' => $lpr['type_name'],
                    'exp_date' => $lpr['exp_date'],
                    'data' => $lpr
                ]);
            }
        } else {
            return response()->json(['status' => '400', 'message' => 'ไม่พบไฟล์รูปภาพ']);
        }
    }

    private function compareLicensePlate($lpr)
    {
        /**
         * 1. รับ lpr มาจาก request
         * 2. ค้นหาป้ายทะเบียนในตาราง historys ว่ามีป้ายทะเบียนนี้อยู่แล้วหรือไม่ โดยหาค่าที่ใกล้เคียงด้วย Algorithm ที่กำหนด 
         *    2.1 ถ้ามีอยู่ให้ตรวจสอบว่าเวลาล่าสุดเกิน 3 นาทีหรือไม่ ถ้าเกินบันทึกประวัติใหม่ ถ้าไม่ให้ return true
         * 3. ตรวจสอบอีกครั้งว่าป้ายทะเบียนนี้อยู่ในตาราง lists หรือไม่ โดยหาค่าที่ใกล้เคียงด้วย Algorithm ที่กำหนด
         *    3.1 ถ้าอยู่ให้ตรวจสอบว่าป้ายทะเบียนนี้อยู่ใน blacklist หรือ whitelist
         * 
         * ใช้ ai หรือ algorithm ในการเปรียบเทียบป้ายทะเบียน โดยใช้ library ที่เหมาะสม
         */

        // กำหนดค่า maxDistance สำหรับการเปรียบเทียบ
        $maxDistance = 1;
        $status = false;
        $status_txt = '';
        $lpr_right = '';
        $type_name = '';
        $exp_date = '';
        // ค้นหาป้ายทะเบียนที่อยู่ในตาราง historys และตรวจสอบเวลาสุดท้าย
        $existingPlates = historys::select('lpr', 'timestamp')
            ->where('timestamp', '>', date('Y-m-d H:i:s', strtotime('-1 minutes')))
            ->get();

        foreach ($existingPlates as $plate) {
            if (levenshtein($lpr, $plate->lpr) <= $maxDistance) {
                $status = true; // ถ้ามีป้ายทะเบียนใกล้เคียงให้ตั้งสถานะเป็นจริง
                $status_txt = 'ป้ายทะเบียนใกล้เคียงใน historys';
                break; // ไม่มีความจำเป็นต้องตรวจสอบเพิ่มเติมใน historys
            }
        }

        // ค้นหาป้ายทะเบียนในตาราง lists
        // $lists = lists::select('lpr')->get();
        $lists = lists::raw(function ($collection) {
            return $collection->aggregate([
                [
                    '$lookup' => [
                        'from' => 'list_types',    // ชื่อคอลเลกชันที่ต้องการ join
                        'let' => ['type_list_id' => ['$toObjectId' => '$type_list_id']],
                        'pipeline' => [
                            [
                                '$match' => [
                                    '$expr' => [
                                        '$eq' => ['$_id', '$$type_list_id']
                                    ]
                                ]
                            ]
                        ],
                        'as' => 'list_type'   // ชื่อฟิลด์ที่จะเก็บข้อมูลที่ lookup
                    ]
                ]
            ]);
        });

        foreach ($lists as $list) {
            if (levenshtein($lpr, $list->lpr) <= $maxDistance) {
                // หาและบันทึกข้อผิดพลาดระหว่างป้ายทะเบียน
                $diff = '';
                $similarity = 0;
                // หาข้อแตกต่างระหว่างป้ายทะเบียน
                similar_text($lpr, $list->lpr, $similarity);
                $similarity = number_format($similarity, 2);
                $diff .= "ความคล้ายกัน: $similarity%\n";
                $diff .= "ป้ายทะเบียน: $lpr\n";
                $diff .= "ป้ายทะเบียนใน lists: {$list->lpr}\n";

                // ถ้ามีข้อแตกต่าง บันทึกข้อผิดพลาดลงในไฟล์
                if (!empty($diff) && $similarity < 100) {
                    $logLprDiff = new log_lpr_diffs();
                    $logLprDiff->lpr1 = $lpr;
                    $logLprDiff->lpr2 = $list->lpr;
                    $logLprDiff->diff = $diff;
                    $logLprDiff->timestamp = now()->toDateTimeString();
                    $logLprDiff->save();
                }

                $status = false; // ตั้งสถานะเป็นจริงถ้าพบป้ายทะเบียนที่ใกล้เคียงใน lists
                $lpr_right = $list->lpr; // ตั้งค่าป้ายทะเบียนใหม่เป็นป้ายทะเบียนใน lists
                $type_name = $list->list_type[0]->type_name;
                $exp_date = $list->end;
                $status_txt = 'ป้ายทะเบียนใกล้เคียงใน lists';
                break; // ไม่มีความจำเป็นต้องตรวจสอบเพิ่มเติมใน lists
            }
        }

        // คืนค่าสถานะว่าเจอป้ายทะเบียนที่ใกล้เคียงหรือไม่ ป้ายทะเบียนที่ถูกต้อง
        return [
            'status' => $status,
            'status_txt' => $status_txt,
            'log' =>  $diff ?? '',
            'lpr_right' => $lpr_right,
            'type_name' => $type_name,
            'exp_date' => $exp_date
        ];
    }

    /**
     * @OA\Get(
     *    path="/api/history/{id}",
     *    summary="Display the specified history",
     *    tags={"History"},
     *    @OA\Parameter(
     *       name="id",
     *       in="path",
     *       required=true,
     *       @OA\Schema(
     *          type="string",
     *          example=""
     *       ),
     *       description="ID of the history to retrieve"
     *    ),
     *    @OA\Response(
     *       response=200,
     *       description="History retrieved successfully"
     *    ),
     *    @OA\Response(
     *       response=400,
     *       description="Invalid input"
     *    )
     * )
     */
    public function show($id)
    {
        $history = historys::find($id);
        return response()->json($history);
    }

    private function send_line() {}
}

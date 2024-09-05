<?php

namespace App\Http\Controllers;

use App\Models\historys;
use App\Models\lists;
use App\Models\webhook;
use App\Models\log_webhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class HistorysController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/history/{date_start}/{date_end}/{gate}/{page}/{limit}",
     *     operationId="index",
     *     tags={"History"},
     *     summary="Get history of items",
     *     description="Retrieve a history of items based on date range, gate, pagination, and limit",
     *     @OA\Parameter(
     *         name="date_start",
     *         in="query",
     *         required=true,
     *         @OA\Schema(
     *             type="string",
     *             format="date",
     *             example="2023-01-01"
     *         ),
     *         description="Start date for filtering the list"
     *     ),
     *     @OA\Parameter(
     *         name="date_end",
     *         in="query",
     *         required=true,
     *         @OA\Schema(
     *             type="string",
     *             format="date",
     *             example="2023-01-31"
     *         ),
     *         description="End date for filtering the list"
     *     ),
     *     @OA\Parameter(
     *         name="gate",
     *         in="query",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             example="A1"
     *         ),
     *         description="Gate number for filtering the list"
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         required=false,
     *         @OA\Schema(
     *             type="integer",
     *             example=1
     *         ),
     *         description="Page number for pagination"
     *     ),
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
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
        /**
         * 1. ค้นหาประวัติโดยกรองข้อมูลด้วยวันที่เริ่มต้นและสิ้นสุด
         * 2. join กับตาราง gates
         */
        $historys = historys::whereBetween('timestamp', [$date_start, $date_end])
            ->join('gates', 'historys.gate_id', '=', 'gates._id')
            ->select('historys.*', 'gates.gate')
            ->get();

        return response()->json($historys);
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

                // check lpr for duplicate
                if ($this->compareLicensePlate($request->lpr)) {
                    return response()->json(['status' => 400, 'message' => 'ป้ายทะเบียนซ้ำ']);
                }

                $image = $request->file('image');
                $image_name = time();
                $image->move(public_path('images'), $image_name);

                $history = new historys();
                $history->lpr = $request->lpr;
                $history->type = $request->type;
                $history->traffic_type = $request->traffic_type;
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
                                'lpr' => $request->lpr,
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
                            $logWebhook->response = 'Connection Failed';
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

                return response()->json(['status' => '200', 'message' => 'บันทึกประวัติสำเร็จ']);
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

        //  levenshtein
        $maxDistance = 1;
        $status = false;
        $existingPlates = historys::select('lpr')->where('timestamp', '>', date('Y-m-d H:i:s', strtotime('-3 minutes')))->get();
        foreach ($existingPlates as $plate) {
            if (levenshtein($lpr, $plate->lpr) <= $maxDistance) {
                $status = true;
            }
        }

        $lists = lists::select('lpr')->get();
        foreach ($lists as $list) {
            if (levenshtein($lpr, $list->lpr) <= $maxDistance) {
                $status = true;
            }
        }

        return $status;
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

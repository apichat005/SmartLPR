<?php

namespace App\Http\Controllers;

use App\Models\historys;
use App\Models\gates;
use App\Models\lists;
use App\Models\webhook;
use App\Models\log_webhook;
use App\Models\log_lpr_diffs;
use App\Models\list_types;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class HistorysController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/history/{date_start}/{date_end}/{gate}/{page}/{limit}",
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
     *     path="/api/v1/history",
     *     summary="Store a newly created history in storage",
     *     tags={"History"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *             @OA\Property(
     *                 property="list_id",
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
            $maxDistance = 1;
            $status = false;
            $status_txt = '';
            $lpr_right = '';
            $open_gate = '';
            $send_line = '';
            $type_id = '';
            $type_name = '';
            $exp_date = '';
            //ค้นหาจากฐานข้อมูล list ว่ามีป้ายทะเบียนนี้หรือไม่ Levenshtein Distance
            $lists = lists::raw(function ($collection) {
                return $collection->aggregate([
                    [
                        '$lookup' => [
                            'from' => 'list_types', // ชื่อคอลเลกชันที่ต้องการ join
                            'let' => ['type_list_id' => ['$toObjectId' => '$type_list_id']],
                            'pipeline' => [
                                [
                                    '$match' => [
                                        '$expr' => [
                                            '$eq' => ['$_id', '$$type_list_id'],
                                        ],
                                    ],
                                ],
                            ],
                            'as' => 'list_type', // ชื่อฟิลด์ที่จะเก็บข้อมูลที่ lookup
                        ],
                    ],
                ]);
            });

            // วนลูปเพื่อเปรียบเทียบป้ายทะเบียน
            foreach ($lists as $list) {
                $distance = levenshtein($request->list_id, $list['lpr']);
                if ($distance <= $maxDistance) {
                    $status = true;
                    $status_txt = 'ป้ายทะเบียนถูกต้อง';
                    $lpr_right = $list['lpr'];
                    $type_name = $list['list_type'][0]['type_name'];
                    $type_id = $list['list_type'][0]['_id']['$oid'];
                    $exp_date = $list['exp_date'];
                    $open_gate = $list['list_type'][0]['open_gate'];
                    $send_line = $list['list_type'][0]['send_line'];
                    break;
                }
            }

            // ถ้าพบใน list
            if ($status == true) {
                // เช็คในประวัติ หากไม่พบภายใน เวลา 3 นาที ให้บันทึกประวัติ
                $find = historys::where('lpr', $lpr_right)
                    ->where('timestamp', '>=', date('Y-m-d H:i:s', strtotime('-3 minutes')))
                    ->first();

                if ($find == null) {
                    $image = $request->file('image');
                    $image_name = time();
                    $image->move(public_path('images'), $image_name);
                    $gate_id = $request->gate;
                    $gate = gates::where('_id', (string) $gate_id)->first();
                    $gate_name = $gate['gate_name'];
                    $short = $gate['short'];



                    $history = new historys();
                    $history->lpr = $lpr_right;
                    $history->type = $type_id;
                    $history->image = $image_name;
                    $history->gate_id = $gate_id;
                    $history->timestamp = date('Y-m-d H:i:s');
                    $history->save();

                    return response()->json([
                        'status' => '200',
                        'message' => 'บันทึกประวัติสำเร็จ',
                        'lpr' => $lpr_right,
                        'type_name' => $type_name,
                        'exp_date' => $exp_date,
                        'open_gate' => $open_gate,
                        'send_line' => $send_line,
                    ]);
                } else {
                    return response()->json([
                        'status' => '200',
                        'message' => 'บันทึกประวัติสำเร็จ',
                        'lpr' => $lpr_right,
                        'type_name' => $type_name,
                        'exp_date' => $exp_date,
                        'open_gate' => $open_gate,
                        'send_line' => $send_line,
                    ]);
                }
            } else {
                // ถ้าไม่พบใน list
                $find = historys::where('lpr', $request->list_id)
                    ->where('timestamp', '>=', date('Y-m-d H:i:s', strtotime('-3 minutes')))
                    ->first();

                $list_type = list_types::where('_id', '66dad747ded2d1c0e4053a0b')->first();
                $type_name = $list_type['type_name'];
                $open_gate = $list_type['open_gate'];
                $send_line = $list_type['send_line'];

                if ($find == null) {
                    $image = $request->file('image');
                    $image_name = time();
                    $image->move(public_path('images'), $image_name);
                    $gate_id = $request->gate;
                    $gate = gates::where('_id', (string) $gate_id)->first();
                    $gate_name = $gate['gate_name'];
                    $short = $gate['short'];

                    $history = new historys();
                    $history->lpr = $request->list_id;
                    $history->type = '66dad747ded2d1c0e4053a0b';
                    $history->image = $image_name;
                    $history->gate_id = $gate_id;
                    $history->timestamp = date('Y-m-d H:i:s');
                    $history->save();

                    return response()->json([
                        'status' => '200',
                        'message' => 'บันทึกประวัติสำเร็จ',
                        'lpr' => $request->list_id,
                        'type_name' => $type_name,
                        'open_gate' => $open_gate,
                        'send_line' => $send_line,
                    ]);
                } else {
                    return response()->json([
                        'status' => '200',
                        'message' => 'บันทึกประวัติสำเร็จ',
                        'lpr' => $request->list_id,
                        'type_name' => $type_name,
                        'open_gate' => $open_gate,
                        'send_line' => $send_line,
                    ]);
                }
            }
        }
    }
    /**
     * @OA\Get(
     *    path="/api/v1/history/{id}",
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

    private function send_line()
    {
    }
}

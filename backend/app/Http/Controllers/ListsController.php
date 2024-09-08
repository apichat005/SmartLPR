<?php

namespace App\Http\Controllers;

use App\Models\lists;
use App\Models\log_lists;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ListsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/list/{page}/{limit}",
     *     operationId="index",
     *     tags={"Lists"},
     *     summary="Get history of items",
     *     description="Retrieve a list of items based on date range, gate, pagination, and limit",
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
    public function index($page, $limit, Request $request)
    {
        // ตรวจสอบว่ามีการส่งค่า type_list_id มาหรือไม่ แปลงเป็น array


        if ($request->type_list_id) {
            $array = [];
            if ($request->type_list_id) {
                $array = explode(',', $request->type_list_id);
                $array = array_map(function ($item) {
                    return new \MongoDB\BSON\ObjectId($item);
                }, $array);
            }

            $list = DB::collection('lists')->raw(function ($collection) use ($limit, $page, $array) {
                return $collection->aggregate([
                    [
                        '$addFields' => [
                            'type_list_id' => ['$toObjectId' => '$type_list_id'] // แปลง type_list_id ให้เป็น ObjectId
                        ]
                    ],
                    [
                        '$match' => [
                            'type_list_id' => ['$in' => $array]
                        ]
                    ],
                    [
                        '$lookup' => [
                            'from' => 'list_types',       // ชื่อ collection ที่จะเชื่อมโยง
                            'localField' => 'type_list_id', // ฟิลด์ที่ถูกแปลงเป็น ObjectId
                            'foreignField' => '_id',       // ฟิลด์ใน collection list_types
                            'as' => 'data'                // ฟิลด์ที่จะเก็บผลลัพธ์ที่เชื่อมโยง
                        ]
                    ],
                    [
                        '$skip' => ((int)$page - 1) * (int)$limit
                    ],
                    [
                        '$limit' => (int) $limit
                    ]
                ]);
            });

            $listArray = iterator_to_array($list);
            return response()->json([
                'status' => 200,
                'data' => $listArray,
                'params' => $request->all(),
                'array' => $array
            ]);
        } else {
            $list = DB::collection('lists')->raw(function ($collection) use ($limit, $page) {
                return $collection->aggregate([
                    [
                        '$addFields' => [
                            'type_list_id' => ['$toObjectId' => '$type_list_id'] // แปลง type_list_id ให้เป็น ObjectId
                        ]
                    ],
                    [
                        '$lookup' => [
                            'from' => 'list_types',       // ชื่อ collection ที่จะเชื่อมโยง
                            'localField' => 'type_list_id', // ฟิลด์ที่ถูกแปลงเป็น ObjectId
                            'foreignField' => '_id',       // ฟิลด์ใน collection list_types
                            'as' => 'data'                // ฟิลด์ที่จะเก็บผลลัพธ์ที่เชื่อมโยง
                        ]
                    ],
                    [
                        '$skip' => ((int)$page - 1) * (int)$limit
                    ],
                    [
                        '$limit' => (int) $limit
                    ]
                ]);
            });

            $listArray = iterator_to_array($list);
            return response()->json($listArray);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/list",
     *     operationId="createLists",
     *     tags={"Lists"},
     *     summary="Create a new list with dynamic fields",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="fullname",
     *                     type="string",
     *                     description="Full name of the person",
     *                     example="John Doe"
     *                 ),
     *                 @OA\Property(
     *                     property="lpr",
     *                     type="string",
     *                     description="License plate number",
     *                     example="ABC123"
     *                 ),
     *                 @OA\Property(
     *                     property="note",
     *                     type="string",
     *                     description="Additional notes",
     *                     example="Some notes"
     *                 ),
     *                 @OA\Property(
     *                     property="type_list_id",
     *                     type="string",
     *                     description="List type id",
     *                     example="123"
     *                 ),
     *                 @OA\Property(
     *                     property="start_date",
     *                     type="string",
     *                     format="date",
     *                     description="Start date",
     *                     example="2024-09-01"
     *                 ),
     *                 @OA\Property(
     *                     property="end_date",
     *                     type="string",
     *                     format="date",
     *                     description="End date",
     *                     example="2024-09-30"
     *                 ),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List created successfully"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     )
     * )
     */
    public function store(Request $request)
    {
        /**
         * 1. ค้นหาว่ามีข้อมูลป้ายทะเบียนนี้อยู่ในระบบหรือไม่
         * 2. ถ้าไม่มีให้เพิ่มข้อมูลใหม่ และบันทึกข้อมูลลงใน log_lists
         * 3. ถ้ามีให้แจ้งเตือนว่ามีข้อมูลนี้อยู่ในระบบแล้ว
         * 4. ส่งข้อมูลกลับไปให้ผู้ใช้งาน
         */
        $lpr = $request->lpr;
        if (lists::where('lpr', $lpr)->exists()) {
            return response()->json([
                'status' => 400,
                'message' => 'มีข้อมูลป้ายทะเบียนนี้อยู่ในระบบแล้ว'
            ]);
        } else {
            $list = new lists();
            foreach ($request->all() as $key => $value) {
                $list->$key = $value;
            }
            $list->save();

            $log = new log_lists();
            $log->ref_id = $list->_id;
            $log->type = 'Add';
            $log->msg = 'เพิ่มข้อมูลรายการ';
            $log->timestamp = date('Y-m-d H:i:s');
            $log->save();

            return response()->json([
                'status' => 200,
                'message' => 'เพิ่มข้อมูลเรียบร้อยแล้ว',
                'data' => $request->all()
            ]);
        }
    }

    /**
     * /**
     * @OA\Get(
     *      path="/api/v1/list/{id}",
     *      operationId="getListsById",
     *      tags={"Lists"},
     *      summary="Get list of lists",
     *      description="Returns list of lists",
     *    @OA\Parameter(    
     *        name="id",
     *       in="path",
     *      required=true,
     *     @OA\Schema(
     *       type="string"
     *   ),
     * description="The ID of the list to be retrieved"
     * ),
     *      @OA\Response(
     *          response=200,
     *          description="Response Message",
     *       ),
     *     )
     */
    public function show($id)
    {
        if (lists::where('_id', $id)->exists()) {
            return lists::find($id);
        } else {
            return response()->json([
                'status' => 400,
                'message' => 'ไม่พบข้อมูลรายการ'
            ]);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/list/update",
     *     operationId="updateLists",
     *     tags={"Lists"},
     *     summary="Create a new list with dynamic fields",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="id",
     *                     type="string",
     *                     description="ID of the list",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="fullname",
     *                     type="string",
     *                     description="Full name of the person",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="lpr",
     *                     type="string",
     *                     description="License plate number",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="note",
     *                     type="string",
     *                     description="Additional notes",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="type_list_id",
     *                     type="string",
     *                     description="List type id",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="start_date",
     *                     type="string",
     *                     description="Start date",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="end_date",
     *                     type="string",
     *                     description="end date",
     *                     example=""
     *                 ),
     *                 @OA\AdditionalProperties(
     *                     type="string",
     *                     description="Any additional fields provided dynamically"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List created successfully"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     )
     * )
     */
    public function update(Request $request)
    {
        $id = $request->id;
        $list = lists::find($id);
        if ($list) {
            foreach ($request->all() as $key => $value) {
                // เป็นการอัพเดทข้อมูลทีละ field โดยใช้คำสั่ง $list->$key = $value;
                if ($key != 'id') {
                    // เปรียบเทียบว่าข้อมูลใหม่ที่ส่งเข้ามามีการเปลี่ยนแปลงหรือไม่
                    if ($list->$key != $value) {
                        $log = new log_lists();
                        $log->ref_id = $list->_id;
                        $log->type = 'update';
                        $log->msg = 'อัพเดทข้อมูลรายการ ' . $key . ' จาก ' . $list->$key . ' เป็น ' . $value;
                        $log->timestamp = date('Y-m-d H:i:s');
                        $log->save();

                        $list->$key = $value;
                    }
                }
            }
            $list->save();

            return response()->json([
                'status' => 200,
                'message' => 'แก้ไขข้อมูลเรียบร้อยแล้ว'
            ]);
        } else {
            return response()->json([
                'status' => 400,
                'message' => 'ไม่พบข้อมูลรายการ',
                'data' => $request->all()
            ]);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/list/{id}",
     *     operationId="deleteLists",
     *     tags={"Lists"},
     *     summary="Delete a list",
     *     description="Delete a list by its ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(
     *             type="string"
     *         ),
     *         description="The ID of the list to be deleted"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List deleted successfully"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="List not found"
     *     )
     * )
     */
    public function destroy($id)
    {
        $list = lists::find($id);
        if ($list) {
            $list->delete();

            $log = new log_lists();
            $log->ref_id = $list->_id;
            $log->type = 'delete';
            $log->msg = 'ลบข้อมูลรายการ';
            $log->timestamp = date('Y-m-d H:i:s');
            $log->save();

            return response()->json([
                'status' => 200,
                'message' => 'ลบข้อมูลเรียบร้อยแล้ว'
            ]);
        } else {
            return response()->json([
                'status' => 400,
                'message' => 'ไม่พบข้อมูลรายการ'
            ]);
        }
    }
}

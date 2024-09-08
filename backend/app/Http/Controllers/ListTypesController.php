<?php

namespace App\Http\Controllers;

use App\Models\list_types;
use App\Models\log_list_type;
use Illuminate\Http\Request;

class ListTypesController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/type_list",
     *    summary="Get list of list types",
     *    tags={"list_types"},
     *   description="Returns list of list types",
     *   @OA\Response(
     *      response=200,
     *     description="Response Message",
     * ),
     * )
     * Display a listing of the resource.
     */
    public function index()
    {
        return list_types::all();
    }

    /**
     * @OA\Post(
     *    path="/api/v1/type_list",
     *    summary="Create a new list type",
     *    tags={"list_types"},
     *    @OA\RequestBody(
     *        required=true,
     *        @OA\MediaType(
     *            mediaType="multipart/form-data",
     *            @OA\Schema(
     *                @OA\Property(
     *                    property="type_name",
     *                    type="string",
     *                    description="List type name",
     *                    example=""
     *                ),
     *                @OA\Property(
     *                    property="send_line",
     *                    type="string",
     *                    description="Send line",
     *                    example=""
     *                ),
     *               @OA\Property(
     *                    property="open_gate",
     *                    type="string",
     *                    description="Open gate",
     *                    example=""
     *                )
     *            )
     *        )
     *    ),
     *   @OA\Response(
     *     response=200,    
     *    description="Response Message",
     * ),
     * )
     */
    public function store(Request $request)
    {
        $list_types = new list_types();
        $list_types->type_name = $request->type_name;
        $list_types->send_line = $request->send_line;
        $list_types->open_gate = $request->open_gate;
        $list_types->save();

        // save to log
        $log_list_type = new log_list_type();
        $log_list_type->ref_id = $list_types->id;
        $log_list_type->msg = "เพิ่มประเภทรายการ";
        $log_list_type->type = "Add";
        $log_list_type->timestamp = date('Y-m-d H:i:s');
        $log_list_type->save();

        return response()->json([
            'message' => 'List type created successfully',
            'data' => $list_types
        ]);
    }

    /**
     * @OA\Get(
     *    path="/api/v1/type_list/{id}",
     *   summary="Get list type by id",
     *  tags={"list_types"},
     * description="Returns list type by id",
     * @OA\Parameter(
     *    name="id",
     *  in="path",
     * required=true,
     * description="ID of the list type",
     * @OA\Schema(
     *   type="string"
     * )
     * ),
     * @OA\Response(
     *   response=200,
     * description="Response Message",
     * ),
     * )
     * Display the specified resource.
     */
    public function show($id)
    {
        return list_types::find($id);
    }

    /**
     * @OA\Post(
     *    path="/api/v1/type_list/update",
     *    summary="Create a new list type",
     *    tags={"list_types"},
     *    @OA\RequestBody(
     *        required=true,
     *        @OA\MediaType(
     *            mediaType="multipart/form-data",
     *            @OA\Schema(
     *                @OA\Property(
     *                    property="id",
     *                    type="string",
     *                    description="List type name",
     *                    example=""
     *                ),
     *                @OA\Property(
     *                    property="type_name",
     *                    type="string",
     *                    description="List type name",
     *                    example=""
     *                ),
     *                @OA\Property(
     *                    property="send_line",
     *                    type="string",
     *                    description="Send line",
     *                    example=""
     *                ),
     *               @OA\Property(
     *                    property="open_gate",
     *                    type="string",
     *                    description="Open gate",
     *                    example=""
     *                )
     *            )
     *        )
     *    ),
     *   @OA\Response(
     *     response=200,    
     *    description="Response Message",
     * ),
     * )
     */
    public function update(Request $request)
    {
        $list_types = list_types::find($request->id);
        // loop data and update and save to log
        foreach ($request->all() as $key => $value) {
            if ($key != 'id') {
                // หากมีการเปลี่ยนแปลงข้อมูล
                if ($list_types->$key != $value) {
                    $log_list_type = new log_list_type();
                    $log_list_type->ref_id = $list_types->id;
                    $log_list_type->msg = "แก้ไขข้อมูลประเภทรายการ";
                    $log_list_type->type = "Edit";
                    $log_list_type->timestamp = date('Y-m-d H:i:s');
                    $log_list_type->save();
                }
                $list_types->$key = $value;
            }
        }
        $list_types->save();
        if ($list_types) {
            return response()->json([
                'status' => 200,
                'message' => 'List type updated successfully'
            ]);
        } else {
            return response()->json([
                'status' => 400,
                'message' => 'List type not found'
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(list_types $list_types)
    {
        //
    }
}

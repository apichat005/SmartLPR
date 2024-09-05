<?php

namespace App\Http\Controllers;

use App\Models\lines;
use App\Models\log_lines;
use Illuminate\Http\Request;

class LinesController extends Controller
{
    /**
     * Show data line token by id
     */

    /**
     * @OA\Info(
     *  title="Smart LPR API",
     * version="1.0.0",
     * description="Open API for Smart LPR",
     * )
     * 
     * /

    /**
     * @OA\Get(
     *    path="/api/lines",
     *  summary="Get all lines",
     * tags={"lines"},
     * @OA\Response(
     *   response=200,
     *  description="List all lines"
     * )
     * )
     */
    public function index()
    {
        $lines = lines::all();
        return response()->json($lines);
    }


    // form data
    /**
     * @OA\Post(
     *   path="/api/lines",
     *  summary="Create a new line",
     * tags={"lines"},
     * @OA\RequestBody(
     *   required=true,
     * @OA\MediaType(
     *  mediaType="multipart/form-data",
     * @OA\Schema(
     * @OA\Property(
     * property="line_token",
     * type="string",
     * description="Line token",
     * example="line_token"
     * )
     * )
     * )
     * ),
     * @OA\Response(
     *  response=200,
     * description="Create a new line"
     * )
     * )
     */

    public function store(Request $request)
    {
        // return response()->json($request->line_token);
        try {
            $line = new lines();
            $line->line_token = $request->line_token;
            $line->save();

            $log_line = new log_lines();
            $log_line->ref_id = $line->id;
            $log_line->msg = "เพิ่ม Line ใหม่";
            $log_line->timestamp = date('Y-m-d H:i:s');
            $log_line->save();

            return response()->json([
                'status' => 200,
                'message' => 'Line created successfully',
                'data' => $line
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     *   path="/api/lines/{id}",
     *  summary="Get line by id",
     * tags={"lines"},
     * @OA\Parameter(
     *   name="id",
     * in="path",
     * required=true,
     * description="ID of the line",
     * @OA\Schema(
     *  type="string"
     * )
     * ),
     * @OA\Response(
     *  response=200,
     * description="Get line by id"
     * )
     * )
     */
    public function show($id)
    {
        $line = lines::find($id);
        return response()->json($line);
    }

    /**
     * @OA\Post(
     *     path="/api/lines/update",
     *     summary="Update line by id",
     *     tags={"lines"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="line_token",
     *                     type="string",
     *                     description="Line token",
     *                     example="line_token"
     *                 ),
     *                @OA\Property( 
     *                    property="id",
     *                    type="string",
     *                    description="ID of the line",
     *                    example="id"
     *               )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Update line by id"
     *     )
     * )
     */

    public function update(Request $request)
    {
        try {

            $line = lines::find($request->id);

            $log_line = new log_lines();
            $log_line->ref_id = $request->id;
            $log_line->msg = "แก้ไข Line จาก " . $line->line_token . " เป็น " . $request->line_token;
            $log_line->timestamp = date('Y-m-d H:i:s');
            $log_line->save();

            $line->line_token = $request->line_token;
            $line->save();



            return response()->json([
                'status' => 200,
                'message' => 'Line updated successfully',
                'data' => $line
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }


    /**
     * @OA\Delete(
     *     path="/api/lines/{id}",
     *     summary="Delete line by id",
     *     tags={"lines"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the line",
     *         @OA\Schema(
     *             type="string"
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Delete line by id"
     *     )
     * )
     */

    public function destroy($id)
    {
        try {
            $line = lines::find($id);
            $line->delete();
            $log_line = new log_lines();
            $log_line->ref_id = $id;
            $log_line->msg = "ลบ Line " . $line->line_token;
            $log_line->timestamp = date('Y-m-d H:i:s');
            $log_line->save();


            return response()->json([
                'status' => 200,
                'message' => 'Line deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }
}

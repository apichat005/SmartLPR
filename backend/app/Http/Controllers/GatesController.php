<?php

namespace App\Http\Controllers;

use App\Models\gates;
use App\Models\log_gates;
use Illuminate\Http\Request;

class GatesController extends Controller
{
    /**
     * /**
     * @OA\Get(
     *      path="/api/gates",
     *      operationId="getGatesList",
     *      tags={"gates"},
     *      summary="Get list of gates",
     *      description="Returns list of gates",
     *      @OA\Response(
     *          response=200,
     *          description="Response Message",
     *       ),
     *     )
     */
    public function index()
    {
        return gates::all();
    }

    /**
     * @OA\Post(
     *     path="/api/gates",
     *     summary="Create a new gate",
     *     tags={"gates"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="gate_name",
     *                     type="string",
     *                     description="Gate name",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="gate_ip",
     *                     type="string",
     *                     description="Gate IP",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="gate_port",
     *                     type="string",
     *                     description="Gate Port",
     *                      example=""
     *                 ),
     *                 @OA\Property(
     *                     property="LoginName",
     *                     type="string",
     *                     description="Login Name",
     *                    example=""    
     *                 ),
     *                 @OA\Property(
     *                     property="LoginPassword",
     *                     type="string",
     *                     description="Login Password",
     *                    example=""
     *                 ),
     *                 @OA\Property(
     *                     property="LoginPasswordgz",
     *                     type="string",
     *                     description="Compressed Login Password",
     *                    example=""
     *                 ),
     *                 @OA\Property(
     *                     property="short",
     *                     type="string",
     *                     description="I = In, O = Out",
     *                   example=""
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response with creation message"
     *     )
     * )
     */
    public function store(Request $request)
    {
        // create a new gate record
        if ($request->has('gate_name')) {
            $gate = new gates;
            $gate->gate_name = $request->gate_name;
            $gate->gate_ip = $request->gate_ip;
            $gate->gate_port = $request->gate_port;
            $gate->LoginName = $request->LoginName;
            $gate->LoginPassword = $request->LoginPassword;
            $gate->LoginPasswordgz = $request->LoginPasswordgz;
            $gate->short = $request->short;
            $gate->save();

            // save to log_gates
            $log_gates = new log_gates;
            $log_gates->ref_id = $gate->_id;
            $log_gates->msg = "เพิ่มประตู " . $gate->gate_name;
            $log_gates->msg_type = "Add";
            $log_gates->timestamp = date('Y-m-d H:i:s');
            $log_gates->save();

            return response()->json([
                "status" => 200,
                "message" => "gate record created"
            ], 200);
        } else {
            return response()->json([
                "status" => 400,
                "message" => "gate_name is required"
            ], 400);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/gates/{id}",
     *    summary="Get gate by id",
     *    tags={"gates"},
     *   @OA\Parameter(
     *        name="id",
     *       in="path",
     *     required=true,
     *    description="ID of the gate to return",
     *   @OA\Schema(
     *        type="string"
     *    )
     * ),
     * @OA\Response(
     *    response=200,
     *   description="Successful response with gate details"
     * ),
     * @OA\Response(
     *   response=404,
     * description="Gate not found"
     * )
     * )
     * Display the specified resource.
     */
    public function show($id)
    {
        $gate = gates::find($id);
        if ($gate) {
            return $gate;
        } else {
            return response()->json([
                "message" => "gate not found"
            ], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(gates $gates)
    {
        //
    }

    /**
     * @OA\Post(
     *     path="/api/gates/update",
     *     summary="Create a update gate",
     *     tags={"gates"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                @OA\Property(
     *                    property="id",
     *                   type="string",
     *                 description="ID of the gate to update",
     *               example=""
     *            ),
     *                 @OA\Property(
     *                     property="gate_name",
     *                     type="string",
     *                     description="Gate name",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="gate_ip",
     *                     type="string",
     *                     description="Gate IP",
     *                     example=""
     *                 ),
     *                 @OA\Property(
     *                     property="gate_port",
     *                     type="string",
     *                     description="Gate Port",
     *                      example=""
     *                 ),
     *                 @OA\Property(
     *                     property="LoginName",
     *                     type="string",
     *                     description="Login Name",
     *                    example=""    
     *                 ),
     *                 @OA\Property(
     *                     property="LoginPassword",
     *                     type="string",
     *                     description="Login Password",
     *                    example=""
     *                 ),
     *                 @OA\Property(
     *                     property="LoginPasswordgz",
     *                     type="string",
     *                     description="Compressed Login Password",
     *                    example=""
     *                 ),
     *                 @OA\Property(
     *                     property="short",
     *                     type="string",
     *                     description="I = In, O = Out",
     *                   example=""
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response with update message"
     *     )
     * )
     */
    public function update(Request $request)
    {
        // update a gate record
        if ($request->has('id')) {
            $gate = gates::find($request->id);

            // loop data to update and save to log_gates
            foreach ($request->all() as $key => $value) {
                if ($key != 'id') {
                    // หากมีการเปลี่ยนแปลงข้อมูล
                    if ($gate->$key != $value) {
                        $log_gates = new log_gates;
                        $log_gates->ref_id = $gate->_id;
                        $log_gates->msg = "แก้ไขข้อมูลประตู จาก " . $gate->$key . " เป็น " . $value;
                        $log_gates->msg_type = "Edit";
                        $log_gates->timestamp = date('Y-m-d H:i:s');
                        $log_gates->save();
                    }
                    $gate->$key = $value;
                }
            }

            $gate->save();
            return response()->json([
                "message" => "gate record updated"
            ], 200);
        } else {
            return response()->json([
                "message" => "gate_name is required"
            ], 400);
        }
    }

    /**
     * @OA\Delete(
     *    path="/api/gates/{id}",
     *   summary="Delete gate by id",
     * tags={"gates"},
     * @OA\Parameter(
     *   name="id",
     * in="path",
     * required=true,
     * description="ID of the gate to delete",
     * @OA\Schema(
     *  type="string"
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Successful response with delete message"
     * )
     * )
     */
    public function destroy($id)
    {
        $gate = gates::find($id);
        if ($gate) {
            $gate->delete();

            // save to log_gates
            $log_gates = new log_gates;
            $log_gates->ref_id = $id;
            $log_gates->msg = "ลบประตู " . $gate->gate_name;
            $log_gates->msg_type = "Delete";
            $log_gates->timestamp = date('Y-m-d H:i:s');
            $log_gates->save();

            return response()->json([
                "message" => "gate record deleted"
            ], 200);
        } else {
            return response()->json([
                "message" => "gate not found"
            ], 404);
        }
    }
}

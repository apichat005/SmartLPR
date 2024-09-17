<?php

namespace App\Http\Controllers;

use App\Models\account;
use App\Models\token;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;


class AccountController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/accounts/{page}/{limit}",
     *     operationId="accounts",
     *     tags={"accounts"},
     *     summary="Get accounts of items",
     *     description="Retrieve a accounts of items based on date range, gate, pagination, and limit",
     *     @OA\Parameter(
     *         name="page",
     *         in="path",
     *         description="Page number",
     *         required=true,
     *         @OA\Schema(
     *             type="integer"
     *         )
     *     ),
     *     @OA\Parameter(
     *         name="limit",
     *         in="path",
     *         description="Limit number",
     *         required=true,
     *         @OA\Schema(
     *             type="integer"
     *         )
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
        if ($request->group) {
            $array = [];
            $array = explode(',', $request->group);
            $array = array_map(function ($item) {
                return new \MongoDB\BSON\ObjectId($item);
            }, $array);

            $data = account::raw(function ($collection) use ($page, $limit, $array) {
                return $collection->aggregate([
                    [
                        '$skip' => ((int)$page - 1) * (int)$limit
                    ],
                    [
                        '$limit' => (int)$limit
                    ],
                    [
                        '$addFields' => [
                            'a_role' => ['$toObjectId' => '$a_role'] // แปลง type_list_id ให้เป็น ObjectId
                        ]
                    ],
                    [
                        '$match' => [
                            'a_role' => ['$in' => $array]
                        ]
                    ],
                    [
                        '$lookup' => [
                            'from' => 'role_groups',
                            'localField' => 'a_role',
                            'foreignField' => '_id',
                            'as' => 'role'
                        ]
                    ]
                ]);
            });

            $listArray = iterator_to_array($data);
            // count total
            $total = account::count();
            return response()->json([
                'data' => $listArray,
                'total' => $total,
                'array' => $array
            ]);
        } else {
            $data = account::raw(function ($collection) use ($page, $limit) {
                return $collection->aggregate([
                    [
                        '$skip' => ((int)$page - 1) * (int)$limit
                    ],
                    [
                        '$limit' => (int)$limit
                    ],
                    [
                        '$lookup' => [
                            'from' => 'role_groups',
                            'let' => ['a_role' => ['$toObjectId' => '$a_role']],
                            'pipeline' => [
                                [
                                    '$match' => [
                                        '$expr' => [
                                            '$eq' => ['$_id', '$$a_role']
                                        ]
                                    ]
                                ]
                            ],
                            'as' => 'role'
                        ]
                    ]
                ]);
            });

            $listArray = iterator_to_array($data);
            // count total
            $total = account::count();
            return response()->json([
                'data' => $listArray,
                'total' => $total,
                'array' => []
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * @OA\Get(
     *    path="/api/v1/accounts/{id}",
     *   summary="Get account by ID",
     *  tags={"accounts"},
     * @OA\Parameter(
     *   name="id",
     * in="path",
     * description="ID of account to return",
     * required=true,
     * @OA\Schema(
     *  type="string"
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="successful operation"
     * ),
     * @OA\Response(
     * response=404,
     * description="account not found"
     * )
     * )
     * Display the specified resource.
     */
    public function show($id)
    {
        $data = account::find($id);
        return response()->json($data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(account $account)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, account $account)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(account $account)
    {
        //
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login",
     *     tags={"login"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="username",
     *                     type="string",
     *                     description="Username",
     *                     example="username"
     *                 ),
     *                 @OA\Property(
     *                     property="password",
     *                     type="string",
     *                     description="Password",
     *                     example="password"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successfully"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     )
     * )
     */
    public function login(Request $request)
    {
        // สร้าง token ใหม่ และส่งกลับไป
        $res = account::raw(function ($collection) use ($request) {
            return $collection->aggregate([
                [
                    '$match' => [
                        'a_username' => $request->username,
                        'a_password' => $request->password
                    ]
                ],
                [
                    '$lookup' => [
                        'from' => 'role_lists',
                        'let' => ['a_role' => ['$toObjectId' => '$a_role']],
                        'pipeline' => [
                            [
                                '$match' => [
                                    '$expr' => [
                                        '$eq' => ['$_id', '$$a_role']
                                    ]
                                ]
                            ]
                        ],
                        'as' => 'role'
                    ]
                ]
            ]);
        });

        if ($res) {
            $token = bin2hex(random_bytes(32));

            $db_token = new token();
            $db_token->t_token = $token;
            $db_token->t_account = $res[0]['_id'];
            $db_token->t_date = now()->toDateTimeString();
            $db_token->t_ip = $request->header('X-Forwarded-For') ?? $request->server('REMOTE_ADDR');
            $db_token->save();

            return response()->json(['status' => 200, 'token' => $token, 'account' => $res]);
        } else {
            return response()->json(['status' => 400]);
        }
    }
}

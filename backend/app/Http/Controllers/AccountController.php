<?php

namespace App\Http\Controllers;

use App\Models\account;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/accounts/{page}/{limit}",
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
    public function index($page, $limit)
    {
        $data = account::paginate($limit, ['*'], 'page', $page);
        return response()->json($data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(account $account)
    {
        //
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
}

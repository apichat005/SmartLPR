<?php

namespace App\Http\Controllers;

use App\Models\role_group;
use Illuminate\Http\Request;

class RoleGroupController extends Controller
{
    /**
     * @OA\Get(
     *    path="/api/v1/role_group",
     *   summary="Get list of role groups",
     *  tags={"role_groups"},
     * description="Returns list of role groups",
     * @OA\Response(
     *   response=200,
     * description="Response Message",
     * ),
     * )
     * Display a listing of the resource.
     */
    public function index()
    {
        return role_group::all();
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\role_list;
use Illuminate\Http\Request;

class RoleListController extends Controller
{
    public function index()
    {
        return role_list::all();
    }

    public function store(Request $request)
    {
        return role_list::create($request->all());
    }
}

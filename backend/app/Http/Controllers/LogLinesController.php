<?php

namespace App\Http\Controllers;

use App\Models\log_lines;
use Illuminate\Http\Request;

class LogLinesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($page , $limit)
    {
        $log_lines = log_lines::orderBy('id', 'desc')->paginate($limit, ['*'], 'page', $page);
        return response()->json($log_lines);
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
    public function show(log_lines $log_lines)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(log_lines $log_lines)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, log_lines $log_lines)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(log_lines $log_lines)
    {
        //
    }
}

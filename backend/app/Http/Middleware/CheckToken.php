<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Token;

class CheckToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // $token = $request->header('Authorization');

        // if (!$token) {
        //     return response()->json(['status' => 401, 'message' => 'No token provided'], 401);
        // }

        // $token = str_replace('Bearer ', '', $token);
        // $tokenRecord = Token::where('t_token', $token)->first();

        // if (!$tokenRecord) {
        //     return response()->json(['status' => 401, 'message' => 'Invalid token'], 401);
        // }

        // // Optionally, add token details to the request
        // $request->attributes->set('token', $tokenRecord);
        return $next($request);
    }
}

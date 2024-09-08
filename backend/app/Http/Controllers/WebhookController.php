<?php

namespace App\Http\Controllers;

use App\Models\webhook;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    /**
     * @OA\Get(
     *    path="/api/v1/webhook",
     * summary="Get all webhooks",
     * tags={"webhook"},
     * @OA\Response(
     *  response=200,
     * description="List all webhooks"
     * )
     * )
     */
    public function index()
    {
        $webhook = webhook::all();
        return response()->json($webhook);
    }

    /**
     * @OA\Post(
     *    path="/api/v1/webhook",
     *    summary="Retrieve the specified webhook using form data",
     *    tags={"webhook"},
     *    @OA\RequestBody(
     *       required=true,
     *       @OA\MediaType(
     *          mediaType="multipart/form-data",
     *          @OA\Schema(
     *             @OA\Property(
     *                property="webhook",
     *                type="string",
     *                description="ID of the history to retrieve",
     *                example=""
     *             )
     *          )
     *       )
     *    ),
     *    @OA\Response(
     *       response=200,
     *       description="Retrieve the specified webhook"
     *    ),
     *    @OA\Response(
     *       response=400,
     *       description="webhook not found"
     *    )
     * )
     */
    public function store(Request $request)
    {
        $webhook = new webhook();
        $webhook->webhook = $request->webhook;
        $webhook->save();

        return response()->json(['status' => 200, 'message' => 'webhook created successfully']);
    }

    /**
     * @OA\Post(
     *    path="/api/v1/webhook/update",
     *    summary="Update the specified webhook using form data",
     *    tags={"webhook"},
     *    @OA\RequestBody(
     *       required=true,
     *       @OA\MediaType(
     *          mediaType="multipart/form-data",
     *          @OA\Schema(
     *             @OA\Property(
     *                property="webhook",
     *                type="string",
     *                description="Webhook URL to update",
     *                example=""
     *             ),
     *             @OA\Property(
     *                property="id",
     *                type="string",
     *                description="ID of the webhook to update",
     *                example=""
     *             )
     *          )
     *       )
     *    ),
     *    @OA\Response(
     *       response=200,
     *       description="Webhook updated successfully"
     *    ),
     *    @OA\Response(
     *       response=400,
     *       description="Invalid input"
     *    )
     * )
     */
    public function update(Request $request)
    {
        $webhook = webhook::find($request->id);
        $webhook->webhook = $request->webhook;
        $webhook->save();

        return response()->json(['status' => 200, 'message' => 'webhook updated successfully']);
    }

    /**
     * @OA\Delete(
     *    path="/api/v1/webhook/{id}",
     *    summary="Delete the specified webhook",
     *    tags={"webhook"},
     *    @OA\Parameter(
     *       name="id",
     *       in="path",
     *       required=true,
     *       description="ID of the webhook to delete",
     *       @OA\Schema(
     *          type="string",
     *          example="1a2b3c4d"
     *       )
     *    ),
     *    @OA\Response(
     *       response=200,
     *       description="Webhook deleted successfully"
     *    ),
     *    @OA\Response(
     *       response=400,
     *       description="Invalid input"
     *    ),
     *    @OA\Response(
     *       response=404,
     *       description="Webhook not found"
     *    )
     * )
     */
    public function destroy($id)
    {
        $webhook = webhook::find($id);
        $webhook->delete();

        return response()->json(['status' => 200, 'message' => 'webhook deleted successfully']);
    }
}

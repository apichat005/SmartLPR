<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LinesController;
use App\Http\Controllers\GatesController;
use App\Http\Controllers\ListTypesController;
use App\Http\Controllers\ListsController;
use App\Http\Controllers\HistorysController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\AccountController;
use App\Models\lists;

Route::prefix('/lines')->group(function () {
    Route::get('/', [LinesController::class, 'index']);
    Route::post('/', [LinesController::class, 'store']);
    Route::get('/{id}', [LinesController::class, 'show']);
    Route::post('/update', [LinesController::class, 'update']);
    Route::delete('/{id}', [LinesController::class, 'destroy']);
});

Route::prefix('/gates')->group(function () {
    Route::get('/', [GatesController::class, 'index']);
    Route::post('/', [GatesController::class, 'store']);
    Route::get('/{id}', [GatesController::class, 'show']);
    Route::post('/update', [GatesController::class, 'update']);
    Route::delete('/{id}', [GatesController::class, 'destroy']);
});

Route::prefix('/type_list')->group(function () {
    Route::get('/', [ListTypesController::class, 'index']);
    Route::post('/', [ListTypesController::class, 'store']);
    Route::get('/{id}', [ListTypesController::class, 'show']);
    Route::post('/update', [ListTypesController::class, 'update']);
    Route::delete('/{id}', [ListTypesController::class, 'destroy']);
});

Route::prefix('/list')->group(function () {
    Route::get('/{date_start}/{date_end}/{page}/{limit}', [ListsController::class, 'index']);
    Route::post('/', [ListsController::class, 'store']);
    Route::get('/{id}', [ListsController::class, 'show']);
    Route::post('/update', [ListsController::class, 'update']);
    Route::delete('/{id}', [ListsController::class, 'destroy']);
});

Route::prefix('/history')->group(function () {
    Route::get('/{date_start}/{date_end}/{gate}/{page}/{limit}', [HistorysController::class, 'index']);
    Route::post('/', [HistorysController::class, 'store']);
    Route::get('/{id}', [HistorysController::class, 'show']);
});

Route::prefix('/webhook')->group(function () {
    Route::post('/', [WebhookController::class, 'store']);
    Route::get('/', [WebhookController::class, 'index']);
    Route::post('/update', [WebhookController::class, 'update']);
    Route::delete('/{id}', [WebhookController::class, 'destroy']);
});

Route::prefix('/accounts')->group(function () {
    Route::get('/{page}/{limit}', [AccountController::class, 'index']);
    Route::post('/', [AccountController::class, 'store']);
    Route::get('/{id}', [AccountController::class, 'show']);
    Route::post('/update', [AccountController::class, 'update']);
    Route::delete('/{id}', [AccountController::class, 'destroy']);
});

Route::get('/test', function () {
    $res = lists::raw(function($collection) {
        return $collection->aggregate([
            [
                '$lookup' => [
                    'from' => 'list_types',    // ชื่อคอลเลกชันที่ต้องการ join
                    'let' => [ 'type_list_id' => [ '$toObjectId' => '$type_list_id' ] ],
                    'pipeline' => [
                        [
                            '$match' => [
                                '$expr' => [
                                    '$eq' => ['$_id', '$$type_list_id']
                                ]
                            ]
                        ]
                    ],
                    'as' => 'list_type'   // ชื่อฟิลด์ที่จะเก็บข้อมูลที่ lookup
                ]
            ]
        ]);
    });

    return response()->json($res->toArray());
});
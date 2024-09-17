<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LinesController;
use App\Http\Controllers\GatesController;
use App\Http\Controllers\ListTypesController;
use App\Http\Controllers\ListsController;
use App\Http\Controllers\HistorysController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\RoleListController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\RoleGroupController;
use App\Http\Controllers\LogListsController;
use App\Http\Controllers\LogGatesController;
use App\Http\Controllers\LogLinesController;

Route::prefix('/login')->group(function () {
    Route::post('/', [AccountController::class, 'login']);
});
Route::middleware(['check.token'])->prefix('/v1')->group(function () {

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
        Route::any('/{page}/{limit}', [ListsController::class, 'index']);
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
        Route::any('/{page}/{limit}', [AccountController::class, 'index']);
        Route::post('/', [AccountController::class, 'store']);
        Route::get('/{id}', [AccountController::class, 'show']);
        Route::post('/update', [AccountController::class, 'update']);
        Route::delete('/{id}', [AccountController::class, 'destroy']);
    });

    Route::prefix('/role_list')->group(function () {
        Route::get('/', [RoleListController::class, 'index']);
        Route::post('/', [RoleListController::class, 'store']);
    });

    Route::prefix('/role_group')->group(function(){
        Route::get('/', [RoleGroupController::class, 'index']);
        Route::post('/', [RoleGroupController::class, 'store']);
        Route::get('/{id}', [RoleGroupController::class, 'show']);
        Route::post('/update', [RoleGroupController::class, 'update']);
        Route::delete('/{id}', [RoleGroupController::class, 'destroy']);
    });

    Route::prefix('/logs')->group(function(){
        Route::prefix('/lists')->group(function(){
            Route::get('/{page}/{limit}', [LogListsController::class, 'index']);
        });
        Route::prefix('/gates')->group(function(){
            Route::get('/{page}/{limit}', [LogGatesController::class, 'index']);
        });
        Route::prefix('/lines')->group(function(){
            Route::get('/{page}/{limit}', [LogLinesController::class, 'index']);
        });
    });

});

Route::prefix('/openapi')->group(function () {
    Route::get('/lines', [LinesController::class, 'index']);
    Route::get('/gates', [GatesController::class, 'index']);
    Route::get('/type_list', [ListTypesController::class, 'index']);
    Route::get('/list/{date_start}/{date_end}/{page}/{limit}', [ListsController::class, 'index']);
    Route::get('/history/{date_start}/{date_end}/{gate}/{page}/{limit}', [HistorysController::class, 'index']);
    Route::get('/webhook', [WebhookController::class, 'index']);
    Route::get('/accounts/{page}/{limit}', [AccountController::class, 'index']);
    Route::get('/role_list', [RoleListController::class, 'index']);
});

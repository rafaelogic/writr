<?php

use Illuminate\Support\Facades\Route;
use Rafaelogic\Writr\Http\Controllers\WritrController;

/*
|--------------------------------------------------------------------------
| Writr Package Routes
|--------------------------------------------------------------------------
|
| Here are the routes for the Writr editor package functionality.
| These routes handle file uploads, URL fetching, and other editor operations.
|
*/

Route::group([
    'prefix' => config('writr.routes.prefix', 'writr'),
    'middleware' => config('writr.routes.middleware', ['web']),
    'as' => config('writr.routes.name_prefix', 'writr.'),
], function () {

    // File upload endpoints
    Route::post('upload-image', [WritrController::class, 'uploadImage'])->name('upload-image');
    Route::post('upload-file', [WritrController::class, 'uploadFile'])->name('upload-file');
    
    // URL fetching endpoints
    Route::post('fetch-url', [WritrController::class, 'fetchUrl'])->name('fetch-url');
    Route::post('fetch-image', [WritrController::class, 'fetchImage'])->name('fetch-image');
    
    // Content processing endpoints
    Route::post('preview', [WritrController::class, 'preview'])->name('preview');
    Route::post('export', [WritrController::class, 'export'])->name('export');
    Route::post('import', [WritrController::class, 'import'])->name('import');
    
    // Auto-save functionality
    Route::post('auto-save', [WritrController::class, 'autoSave'])->name('auto-save');
    
    // Collaboration endpoints (if enabled)
    Route::group(['middleware' => 'auth'], function () {
        Route::post('collaborate/join', [WritrController::class, 'joinCollaboration'])->name('collaborate.join');
        Route::post('collaborate/leave', [WritrController::class, 'leaveCollaboration'])->name('collaborate.leave');
        Route::post('collaborate/update', [WritrController::class, 'updateCollaboration'])->name('collaborate.update');
        Route::get('collaborate/users/{document}', [WritrController::class, 'getCollaborators'])->name('collaborate.users');
    });
    
    // Comments endpoints (if enabled)
    Route::group(['middleware' => 'auth'], function () {
        Route::post('comments', [WritrController::class, 'createComment'])->name('comments.create');
        Route::put('comments/{comment}', [WritrController::class, 'updateComment'])->name('comments.update');
        Route::delete('comments/{comment}', [WritrController::class, 'deleteComment'])->name('comments.delete');
        Route::get('comments/{document}', [WritrController::class, 'getComments'])->name('comments.index');
    });
    
    // Version history endpoints (if enabled)
    Route::group(['middleware' => 'auth'], function () {
        Route::get('versions/{document}', [WritrController::class, 'getVersions'])->name('versions.index');
        Route::post('versions/{document}', [WritrController::class, 'createVersion'])->name('versions.create');
        Route::get('versions/{document}/{version}', [WritrController::class, 'getVersion'])->name('versions.show');
        Route::post('versions/{document}/{version}/restore', [WritrController::class, 'restoreVersion'])->name('versions.restore');
    });
    
    // Health check endpoint
    Route::get('health', [WritrController::class, 'health'])->name('health');
});

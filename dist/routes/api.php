<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('signin', 'API\AuthController@signin');
Route::post('registration', 'API\RegController@register');
Route::post('forgot', 'API\RegController@changePassword');
Route::get('refresh', function () { })->middleware('jwt.refresh');
Route::middleware('jwt.auth')->group(function () {
    // API protected by authentication
    Route::delete('signout', 'API\AuthController@signout');
    Route::delete('unregistration', 'API\RegController@unregister');
});



Route::middleware('check.role:user')->group(function () {
    // API protected by role-based user authentication

    // Get what's new contents
    Route::post('home/user', 'API\HomeController@userIndex');
    // Get all galleries owned by a user
    Route::get('galleries', 'API\GalleryController@index');
    // Get all items in a gallery chosen by id
    Route::get('galleries/{id}', 'API\GalleryController@getItems');
    // Create a new gallery
    Route::post('galleries/create', 'API\GalleryController@createGallery');
    // Delete a gallery with content
    Route::delete('galleries/delete/{id}', 'API\GalleryController@deleteGallery');
    // Rename a gallery by id
    Route::put('galleries/rename/{id}', 'API\GalleryController@renameGallery');
    // Download an archive representing the whole gallery
    Route::get('galleries/download/{id}', 'API\GalleryController@downloadGallery');
    // Get a single item by id
    Route::get('items/{id}', 'API\ItemController@getItem');
    // Get a single thumbnail by item's id
    Route::get('items/thumbnails/{id}', 'API\ItemController@getItemThumb');
    // Upload an item to a specific gallery
    Route::post('items/upload/{gallery_id}', 'API\ItemController@uploadItem');
    // Download an item by id
    Route::get('items/download/{id}', 'API\ItemController@downloadItem');
    // Delete an item by id
    Route::delete('items/delete/{id}', 'API\ItemController@deleteItem');
    // Rename an item by id
    Route::put('items/rename/{id}', 'API\ItemController@renameItem');
    // Share a gallery generating public token
    Route::post('share/galleries/{id}', 'API\SharedGalleryController@share');
    // Share an item generating public token
    Route::post('share/items/{id}', 'API\SharedItemController@share');
    // Add sharer to a shared gallery
    Route::get('share/galleries/{token}', 'API\SharedGalleryController@add');
    // Get a shared item by public token
    Route::get('share/items/{token}', 'API\SharedItemController@get');
    // Unshare a gallery retrieved by id
    Route::delete('unshare/galleries/{token}', 'API\SharedGalleryController@unshare');
    // Unshare an item retrieved by id
    Route::delete('unshare/items/{token}', 'API\SharedItemController@unshare');
    // Get storage plans informations
    Route::get('storages', 'API\StorageController@getAllStorages');
    // Get usage of actual storage
    Route::get('storage', 'API\StorageController@getActualStorage');
    // Change user's storage plan
    Route::put('storage/change/{new_id}', 'API\StorageController@changePlan');
    // Verify password
    Route::post('password/check', 'API\AuthController@checkPassword');
    // Update user informations and data
    Route::post('registration/update', 'API\RegController@updateRegistration');
});


// First
Route::post('home/admin', 'API\HomeController@adminIndex')->middleware('check.role:admin');

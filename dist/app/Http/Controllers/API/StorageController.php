<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Storage;
use JWTAuth;

class StorageController extends Controller
{
    public function getActualStorage()
    {
        try {
            $user = JWTAuth::user();
            return response()->json([
                'id' => $user->storage->id,
                'usedSpace' => $user->used_space,
                'availableSpace' => $user->storage->size
            ], 200);
        } catch (Exception $e) {
            abort(500, "Internal server error.");
        }
    }

    public function getAllStorages()
    {
        try {
            $plans = Storage::all();
            return response($plans, 200);
        } catch (Exception $e) {
            abort(500, "Internal server error.");
        }
    }

    public function changePlan($new_id)
    {
        $plan = Storage::findOrFail($new_id);
        $user = JWTAuth::user();
        $user->storage_id = $new_id;
        $user->save();
        return response()->json([
            'id' => $new_id,
            'usedSpace' => $user->used_space,
            'availableSpace' => $plan->size
        ], 200);
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Item;
use App\SharedItem;

class SharedItemController extends Controller
{

    public function share($id)
    {
        $item = Item::findOrFail($id);
        $this->authorize('manage', $item);
        if ($item->shared) {
            return response(SharedItem::where('item_id', '=', $id)->first()->token, 200)->header('Content-Type', 'text/plain');
        }
        $token = \str_random(20);

        try {
            SharedItem::insert(["item_id" => $item->id, "token" => $token]);
            $item->update(['shared' => 1]);
            return response($token, 200)->header('Content-Type', 'text/plain');
        } catch (Exception $q) {
            abort(500, "Unable to share item, please try again.");
        }
    }

    public function unshare($id)
    {
        try {
            $item = Item::findOrFail($id);
            $this->authorize('manage', $item);
            $item->update(['shared' => 0]);
            SharedItem::where('item_id', '=', $id)->delete();
            return response('', 200)->header('Content-Type', 'text/plain');;
        } catch (Exception $q) {
            abort(500, "Unable to unshare item");
        }
    }

    public function get($token)
    {
        $sharedItem = SharedItem::where('token', '=', $token)->first();
        if (!$sharedItem) {
            abort(400, "Not found");
        }
        if (!$sharedItem) {
            abort(404, "Item not found.");
        }

        $item = Item::findOrFail($sharedItem->item_id);
        return response()->json([
            'id' => $item->id,
            'name' => $item->name,
            'uploader' => $item->uploader,
            'type' => $item->type,
            'token' => $token,
            'size' => $item->size,
            'shared' => true,
            'date' => $item->updated_at
        ]);
    }
}

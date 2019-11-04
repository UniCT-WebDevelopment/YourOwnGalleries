<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Item;
use App\Gallery;
use JWTAuth;

class HomeController extends Controller
{

    public function adminIndex()
    {
        return 'henlo admin'; // Example
    }

    public function userIndex(Request $request)
    {
        try {
            $user = JWTAuth::user();
            $newsMaxSize = \Config::get("constants.newsMaxSize");
            $galleries = Gallery::whereJsonContains('meta->owners', $user->id)->orWhere('user_id', '=', $user->id);
            $news = Item::whereIn('gallery_id', $galleries->pluck('id'))->leftJoin('shared_items', 'items.id', '=', 'shared_items.item_id')->orderBy('items.updated_at', 'desc')->offset($request->offset)->limit($request->limit < $newsMaxSize && $request->limit > 0 ? $request->limit : $newsMaxSize)->select('items.id', 'name', 'type', 'uploader', 'shared', 'shared_items.token')->get();
            return response($news, 200);
        } catch (JWTException $e) {
            abort(401, "Unauthorized.");
        } catch (Exception $e) {
            abort(500, "Unable to fetch news.");
        }
    }
}

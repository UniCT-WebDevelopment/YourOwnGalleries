<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Gallery;
use App\SharedGallery;
use JWTAuth;

class SharedGalleryController extends Controller
{

    public function share($id)
    {
        $gallery = Gallery::findOrFail($id);
        $this->authorize('manage', $gallery);
        if ($gallery->shared) {
            return response(SharedGallery::where('gallery_id', '=', $id)->first()->token, 200)->header('Content-Type', 'text/plain');;
        }
        $token = \str_random(20);

        try {
            SharedGallery::insert(["gallery_id" => $gallery->id, "token" => $token]);
            $gallery->update(['shared' => 1]);
            return response($token, 200)->header('Content-Type', 'text/plain');
        } catch (QueryException $q) {
            abort(500, "Unable to share gallery, please try again.");
        }
    }

    public function unshare($token)
    {
        try {

            $sharedGallery = SharedGallery::where('token', '=', $token)->first();
            $gallery = $sharedGallery->gallery;
            $user = JWTAuth::user();
            $this->authorize('manage', $gallery);

            $size = $gallery->meta['size'];
            if ($gallery->user_id == $user->id) {
                $isOwner = true;
                $sharedGallery->delete();
                $meta = json_encode(['size' => $size, 'owners' => []]);
                Gallery::where('id', $gallery->id)->update(['shared' => 0, 'meta' => $meta]);
            } else {
                $isOwner = false;
                $owners = $gallery->meta['owners'];
                $owners = array_diff($owners, [$user->id]); // Remove sharer
                $meta = json_encode(['size' => $size, 'owners' => $owners]);
                Gallery::where("id", $gallery->id)->update(['meta' => $meta]);
            }
            return response()->json([
                "wasOwner" => $isOwner
            ]);
        } catch (QueryException $q) {
            abort(500, "Unable to unshare gallery, please try again.");
        }
    }



    public function add($token)
    {
        $sharedGallery = SharedGallery::where('token', '=', $token)->first();
        if (!$sharedGallery) {
            abort(400, "Not found");
        }
        $gallery = Gallery::findOrFail($sharedGallery->gallery_id);

        if ($gallery->user->id == JWTAuth::user()->id) {
            abort(500, "You are the owner of this gallery");
        }

        $size = $gallery->meta['size'];
        $owners = $gallery->meta['owners'];
        if (in_array(JWTAuth::user()->id, $owners)) {
            abort(500, "You already are a sharer of this gallery");
        }
        array_push($owners, JWTAuth::user()->id);
        $meta = json_encode(['size' => $size, 'owners' => $owners]);
        Gallery::where('id', $gallery->id)->update(['meta' => $meta]);
        return response()->json([
            'id' => $gallery->id,
            'name' => $gallery->name,
            'owner' => $gallery->user->name,
            'token' => $token,
            'size' => $size,
            'shared' => $gallery->shared
        ]);
    }
}

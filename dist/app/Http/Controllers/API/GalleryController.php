<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Gallery;
use JWTAuth;
use ZipArchive;
use Validator;

class GalleryController extends Controller
{

    public function index(Request $request)
    {
        try {
            $user = JWTAuth::user();
            $search = $request->search;
            $galleries = Gallery::whereJsonContains('meta->owners', $user->id)
                ->orWhere('user_id', '=', $user->id)
                ->where('galleries.name', 'like', '%' . $search . '%')
                ->leftJoin('users', 'galleries.user_id', '=', 'users.id')
                ->leftJoin('shared_galleries', 'galleries.id', '=', 'shared_galleries.gallery_id')
                ->orderBy('galleries.updated_at', 'desc')
                ->select('galleries.id', 'galleries.name', 'users.name as owner', 'shared_galleries.token', 'meta->size as size', 'galleries.shared', 'galleries.updated_at as updated')
                ->simplePaginate(\Config::get("constants.galleriesPageSize"));
            return response($galleries, 200);
        } catch (Exception $e) {
            //abort(500, "Unable to fetch news, try again.");
            response('', 500);
        }
    }

    public function createGallery(Request $request)
    {
        $name = $request->name;
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:25',
        ]);
        if ($validator->fails()) {
            abort(400, $validator->errors()->first());
        }
        $user = JWTAuth::user();
        try {
            $gallery = Gallery::create(['user_id' => $user->id, 'name' => $name, 'meta' => ["size" => 0, "owners" => []]]);
            return response()->json([
                "id" => $gallery->id,
                "updated" => "" . $gallery->updated_at, // Ensures that current_timestamp is used in a string context
                "name" => $name,
                "owner" => $user->name,
                "token" => null,
                "size" => 0,
                "shared"  => false

            ], 200);
        } catch (QueryException $q) {
            abort(500, "A '" . $name . "' gallery already exists");
        }
    }


    public function getItems(Request $request, $id)
    {
        try {
            $gallery = Gallery::findOrFail($id);
            $owner = $gallery->user;
            $search = $request->search;
            $this->authorize('manage', $gallery);
            $items = $gallery->items()->where('name', 'like', '%' . $search . '%')->leftJoin('shared_items', 'items.id', '=', 'shared_items.item_id')->orderBy('items.updated_at', 'desc')->select('items.id', 'name', 'type', 'size', 'shared', 'items.updated_at as date', 'uploader', 'shared_items.token')->simplePaginate(\Config::get('constants.itemsPageSize'));
            return response($items, 200);
        } catch (Exception $e) {
            abort(500, "Unable to fetch gallery's items, try again.");
        }
    }


    public function downloadGallery($id)
    {
        $gallery = Gallery::findOrFail($id);
        $owner = $gallery->user;
        $this->authorize('manage', $gallery);

        $items = $gallery->items;

        if ($items->isEmpty()) {
            abort(500, "Gallery is empty.");
        } else {
            $path = \storage_path("app/uploads/" . $owner->id . "/" . $gallery->id . "/");
            $zip = new ZipArchive;
            $zipFileName = $gallery->name;
            $zipPath = \storage_path("app/zip_tmp") . "/" . $zipFileName;

            $mimesExtensions = \Config::get('constants.mimesExtensions');
            if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
                foreach ($items as $item) {
                    $name = $item->name;
                    if (!pathinfo($item->name, PATHINFO_EXTENSION)) {
                        $mimeExtensions = \Config::get('constants.mimesExtensions');
                        $name = $name . $mimesExtensions[$item->type];
                    }
                    $zip->addFile($path . md5($item->id) . $mimesExtensions[$item->type], $name);
                }
                $zip->close();
            }

            $headers = array(
                'Content-Type' => 'application/octet-stream',
                'Content-disposition' => 'attachment; filename=' . $zipFileName . ".zip"
            );

            if (file_exists($zipPath)) {
                return response()->file($zipPath, $headers)->deleteFileAfterSend();
            }
            return abort(404, "Unable to get zip file.");
        }
    }

    /**
     * Try to change the name of a gallery selected by id
     * @param Request $request
     * @return JsonResponse
     */
    public function renameGallery(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);
        $owner = $gallery->user;
        $this->authorize('manage', $gallery);

        $validator = Validator::make($request->all(), [
            'name' => 'required|max:25',
        ]);
        if ($validator->fails()) {
            abort(400, $validator->errors()->first());
        }
        try {
            $gallery->update(['name' => $request->name]);
            return response('', 200);
        } catch (QueryException $q) {
            abort(500, "A '" . $request->name . "' gallery already exists");
        }
    }


    /**
     * Try to delete a gallery by id
     * @return void
     */
    public function deleteGallery($id)
    {
        $gallery = Gallery::findOrFail($id);
        $name = $gallery->name;
        $owner = $gallery->user;
        $user = JWTAuth::user();
        $this->authorize('manage', $gallery);

        $size = $gallery->meta['size'];
        try {
            if ($owner->id == $user->id) {
                $gallery->delete();
                Storage::disk('myDisk')->deleteDirectory($owner->id . "/" . $gallery->id);
                $owner->decrement('used_space', $size);
            } else {
                $owners = $gallery->meta['owners'];
                $owners = array_diff($owners, [$user->id]);
                $meta = json_encode(['size' => $size, 'owners' => $owners]);
                Gallery::where('id', $id)->update(['meta' => $meta]);
            }
            return response($id, 200);
        } catch (Exception $e) {
            abort(500, "Unable to delete $name");
        }
    }
}

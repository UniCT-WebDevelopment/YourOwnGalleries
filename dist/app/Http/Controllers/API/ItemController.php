<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Database\QueryException;
use App\Item;
use App\Gallery;
use JWTAuth;
use Image; // For image thumbnails
use Thumbnail; // For video thumbnails
use Validator;


class ItemController extends Controller
{

    public function renameItem(Request $request, $id)
    {
        $item = Item::findOrFail($id);
        $gallery = $item->gallery;
        $owner = $gallery->user;
        $this->authorize('manage', $item);
        error_log("ciao " . $request->name);

        $validator = Validator::make($request->all(), [
            'name' => 'required|max:100',
        ]);
        if ($validator->fails()) {
            abort(400, $validator->errors()->first());
        }
        try {
            $item->update(['name' => $request->name]);
        } catch (QueryException $q) {
            abort(500, "A '" . $request->name . "' item already exists.");
        }
    }


    public function getItemThumb($id)
    {
        $item = Item::findOrFail($id);
        $gallery = $item->gallery;
        $owner = $gallery->user;
        $this->authorize('manage', $gallery);

        $thumbsExtension = \Config::get('constants.thumbsExtension');
        $name = md5($item->id) . $thumbsExtension;
        $path = Storage::disk('myDisk')->path($owner->id . "/" . $gallery->id . "/thumbnails/" . $name);
        return response()->file($path);
    }

    public function getItem($id)
    {
        try {
            $item = Item::findOrFail($id);
            $gallery = $item->gallery;
            $owner = $gallery->user;
            $this->authorize('manage', $gallery);

            $mimesExtensions = \Config::get('constants.mimesExtensions');
            $hashedName = md5($item->id) . $mimesExtensions[$item->type];
            $path = Storage::disk('myDisk')->path($owner->id . "/" . $gallery->id . "/" . $hashedName);
            $headers = [
                'Content-Type'        => $item->type,
                'Content-Length'      => File::size($path),
                'Content-Disposition' => 'attachment; filename=' . $item->name
            ];
            return Response::stream(function () use ($path) {
                try {
                    $stream = fopen($path, 'r');
                    fpassthru($stream);
                } catch (Exception $e) {
                    abort(500, "Error during item streaming.");
                }
            }, 200, $headers);
        } catch (Exception $e) {
            return abort(500, 'Unable to fetch item.');
        }
    }


    public function uploadItem(Request $request, $galleryId)
    {
        $gallery = Gallery::findOrFail($galleryId);
        $owner = $gallery->user;
        $this->authorize('manage', $gallery);

        // Upload file
        try {
            if ($request->hasFile('item')) {
                $uploadedFile = $request->item;
                if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
                    abort(500, $uploadedFile->getErrorMessage());
                }
            } else {
                abort(400, "No provided file(s)");
            }
            $mimeType = $uploadedFile->getClientMimeType();
            $isImage = in_array($mimeType, \Config::get('constants.mimes.image'));
            $isVideo = in_array($mimeType, \Config::get('constants.mimes.video'));
            if ($isImage || $isVideo) {
                $path = $owner->id . "/" . $galleryId . "/";
                $size = File::size($uploadedFile);
                if ($owner['used_space'] + $size > $owner->storage->size) {
                    abort(500, "Insufficient storage");
                }

                $originalName =  $uploadedFile->getClientOriginalName();
                $name = $originalName;
                $onlyName = pathinfo($name, PATHINFO_FILENAME);
                $extension =  pathinfo($name, PATHINFO_EXTENSION);

                $number = 1;
                while (Item::where('gallery_id', '=', $galleryId)->where('name', '=', $name)->get()->isNotEmpty()) {
                    $name = $onlyName . " (" . $number++ . ")" . "." . $extension;
                }
                $item = Item::create(['gallery_id' => $galleryId, 'name' => $name, 'type' => $mimeType, "size" => 0, "uploader" => JWTAuth::user()->name]);
                $hashedName = md5($item->id) . "." . $extension;


                if ($isImage) {
                    $img = Image::make($uploadedFile)->orientate();
                    Storage::disk('myDisk')->put($path . $hashedName, $img->encode($extension, 100));
                    $img->resize(400, null, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    });
                    Storage::disk('myDisk')->put($path . "thumbnails/" . $hashedName, $img->encode($extension, 90));
                } else {
                    $thumbsExtension = \Config::get('constants.thumbsExtension');
                    Storage::disk('myDisk')->putFileAs($path, $uploadedFile, $hashedName);
                    $videoThumbName = pathinfo($hashedName, PATHINFO_FILENAME) . $thumbsExtension;
                    $tmpPath = \storage_path("app/public/thumb_tmp");
                    $thumbnail = Thumbnail::getThumbnail($uploadedFile, $tmpPath, $videoThumbName);
                    if ($thumbnail) {
                        $thumbnail = File::get($tmpPath . "/" . $videoThumbName);
                        Storage::disk('myDisk')->put($path . "thumbnails/" . $videoThumbName, $thumbnail);
                        File::delete($tmpPath . "/" . $videoThumbName);
                    }
                }

                $size = Storage::disk('myDisk')->size($path . $hashedName);
                Gallery::where('id', $galleryId)->update(['meta->size' => $gallery->meta['size'] + $size]);
                $owner->increment('used_space', $size);

                return response()->json([
                    'id' => $item->id,
                    'name' => $name,
                    'type' => $mimeType,
                    'date' => $item->updated_at,
                    'uploader' => JWTAuth::user()->name,
                    'token' => null,
                    'shared' => false,
                    'size' => $size
                ]);
            } else {
                return abort(415, "Unsupported mime type");
            }
            return;
        } catch (Exception $e) {
            if (isset($item)) {
                $item->delete();
            }
            abort(500, 'Internal Server Error.');
        }
    }

    public function downloadItem($id)
    {
        $item = Item::findOrFail($id);
        $gallery = $item->gallery;
        $owner = $item->gallery->user;
        $this->authorize('manage', $gallery);

        $mimesExtensions = \Config::get('constants.mimesExtensions');
        $hashedName = md5($item->id) . $mimesExtensions[$item->type];
        $path = Storage::disk('myDisk')->path($owner->id . "/" . $gallery->id . "/" . $hashedName);

        $headers = array(
            'Content-Type' => 'application/octet-stream',
            'Content-disposition' => 'attachment; filename=' . pathinfo($item->name, PATHINFO_FILENAME) . $mimesExtensions[$item->type]
        );
        return response()->file($path, $headers);
    }

    public function deleteItem($id)
    {
        $item = Item::findOrFail($id);
        $name = $item->name;
        $gallery = $item->gallery;
        $owner = $item->gallery->user;
        $this->authorize('manage', $gallery);

        try {
            $path = $owner->id . "/" . $gallery->id . "/";
            $mimesExtensions = \Config::get('constants.mimesExtensions');
            $hashedName = md5($item->id) . $mimesExtensions[$item->type];
            $size = Storage::disk('myDisk')->size($path . $hashedName);
            Storage::disk('myDisk')->delete($path . $hashedName);
            Storage::disk('myDisk')->delete($path . "thumbnails/" . $hashedName);
            Gallery::where('id', $gallery->id)->update(['meta->size' => $gallery->meta['size'] - $size]);
            $owner->decrement('used_space', $size);
            $item->delete();
            return response($id, 200);
        } catch (Exception $e) {
            abort(500, "Unable to delete $name");
        }
    }
}

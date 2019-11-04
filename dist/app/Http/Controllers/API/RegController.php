<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Exceptions\TimeNotElapsedException;
use App\Exceptions\EmailNotFoundException;
use \Illuminate\Database\QueryException;
use App\User;
use Illuminate\Support\Facades\Hash;
use Validator;
use Mail;
use JWTAuth;
use Illuminate\Support\Facades\Storage;

class RegController extends Controller
{

    public function register(Request $request)
    {
        $forbiddenEmails = \Config::get("constants.forbiddenEmails");
        $forbiddenEmails = implode(",", $forbiddenEmails);
        $forbiddenNames = \Config::get("constants.forbiddenNames");
        $forbiddenNames = implode(",", $forbiddenNames);
        $validator = Validator::make(array_map("strtolower", $request->all()), [
            'name' => 'required|max:20|unique:users|not_in:' . $forbiddenNames,
            'email' => 'required|email|unique:users|max:50|not_in:' .  $forbiddenEmails,
            'password' => 'required|min:8|max:255',
            'c_password' => 'required|same:password',
        ]);
        if ($validator->fails()) {
            abort(400, $validator->errors()->first());
        }
        $input = $request->all();
        $input['password'] = Hash::make($input['password']);

        try {
            User::create($input);
            return response()->json(['status' => 'success', 'message' => 'User successfully registered.'], 200);
        } catch (QueryException $q) {
            return abort(500, "Unable to create user.");
        }
    }


    public function unregister(Request $request)
    {
        // Get JWT Token from the request header key "Authorization"
        $token = $request->header('Authorization');
        // Invalidate the token
        try {
            $user = JWTAuth::user();
            JWTAuth::invalidate($token);
            User::findOrFail($user->id)->delete();
            Storage::disk('myDisk')->deleteDirectory($user->id);
            return response('', 200);
        } catch (JWTException $e) {
            // Something went wrong whilst attempting to encode the token
            return response('', 400);
        } catch (QueryException $q) {
            // Something went wrong whilst attempting to delete user
            return response('', 500);
        }
    }

    public function changePassword(Request $request)
    {
        $rules = [
            'email' => 'required|email',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            abort(400, $validator->errors()->first());
        }

        try {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                throw new EmailNotFoundException();
            }

            $updated_date = $user->updated_at;
            $current_date = date('Y-m-d H:i:s');
            $diff = strtotime($current_date) - strtotime($updated_date);
            if ($diff < 30) {
                //La richiesta e' stata effettuata prima che fossero trascorsi 30 secondi dalla prededente... errore!
                $this->difference = 30 - (int) ($diff);
                if ($this->difference === 0) {
                    $this->difference = 1;
                }
                throw new TimeNotElapsedException();
            }

            $newPass = \uniqid(str_random(8));
            $user->update(['password' => Hash::make($newPass)]);

            $to = $request->email;
            $subject = 'Password reset';
            $txt = sprintf(\Config::get('constants.restorePasswordEmail'), $user->name, $newPass);
            Mail::raw($txt, function ($message) use ($to, $subject) {
                $message->to($to)->subject($subject);
                /*
                $message->attach('C:\laravel-master\laravel\public\uploads\image.png'); examples of attachments
                $message->attach('C:\laravel-master\laravel\public\uploads\test.txt');
                */
                $message->from('yourowngalleriesstaff@gmail.com', 'YourOwnGalleries');
            });
            return response('', 200);
        } catch (TimeNotElapsedException $t) {
            abort(403, "Wait $this->difference seconds for a new change attempt");
        } catch (EmailNotFoundException $m) {
            abort(404, "Email not found");
        } catch (Exception $e) {
            abort(500, "Error");
        }
    }


    public function updateRegistration(Request $request)
    {
        $forbiddenEmails = \Config::get("constants.forbiddenEmails");
        $forbiddenEmails = implode(",", $forbiddenEmails);
        $forbiddenNames = \Config::get("constants.forbiddenNames");
        $forbiddenNames = implode(",", $forbiddenNames);
        $data = array_filter($request->all());
        if ($data['email'] == JWTAuth::user()->email) {
            unset($data['email']);
        }
        if ($data['name'] == JWTAuth::user()->name) {
            unset($data['name']);
        }
        $validator = Validator::make($data, [
            'name' => 'max:20|unique:users|not_in:' . $forbiddenNames,
            'email' => 'email|unique:users|max:50|not_in:' .  $forbiddenEmails,
            'password' => 'min:8|max:255',
            'confirmPass' => 'same:password',
        ]);

        if ($validator->fails()) {
            abort(400, $validator->errors()->first());
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
            unset($data['confirmPass']);
        }


        try {
            $user = User::findOrFail(JWTAuth::user()->id);
            $user->update($data);
            return response()->json([
                'email' => $user->email,
                'username' => $user->name,
            ]);
        } catch (QueryException $q) {
            return abort(500, "Unable to update");
        }
    }
}

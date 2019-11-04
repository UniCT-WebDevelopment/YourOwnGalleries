<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use JWTAuth;
use Validator;

class AuthController extends Controller
{

    public function signin(Request $request)
    {
        $credentials = $request->only('email', 'password');
        $rules = [
            'email' => 'required|email|max:255',
            'password' => 'required|min:8|max:255',
        ];

        $validator = Validator::make($credentials, $rules);
        if ($validator->fails()) {
            abort(400, $validator->errors()->first());
        }
        try {
            // Attempt to verify the credentials and create a token for the user
            if (!$token = JWTAuth::attempt($credentials)) {
                return response("We can't find an account with this credentials", 401);
            }
        } catch (JWTException $e) {
            // Something went wrong with Auth.
            abort(501, "Something went wrong");
        }

        /*
        if (JWTAuth::user()->blocked) {
            To do
        }
        */

        // All good, so return the token
        $user = JWTAuth::user();
        return response()->json([
            'token' => "Bearer " . $token,
            'name' => $user->name,
            'email' => $user->email
        ], 200);
    }

    public function signout(Request $request)
    {
        // Get JWT Token from the request header key "Authorization"
        $token = $request->header('Authorization');
        // Invalidate the token
        try {
            JWTAuth::invalidate($token);
            return response('', 200);
        } catch (JWTException $e) {
            // Something went wrong whilst attempting to encode the token
            abort(500, "Something went wrong");
        }
    }


    public function checkPassword(Request $request)
    {
        $user = JWTAuth::user();
        $password = $request->password;
        if (Hash::check($password, $user->password)) {
            return response('', 200);
        }
        abort(401, "Unauthorized");
    }
}

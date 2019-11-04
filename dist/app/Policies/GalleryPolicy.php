<?php

namespace App\Policies;

use App\User;
use App\Gallery;
use Illuminate\Auth\Access\HandlesAuthorization;

class GalleryPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine if the given user can manage the gallery
     *
     * @param  \App\Gallery  $gallery
     * @param  \App\User  $user
     * @return bool
     */
    public function manage(User $user, Gallery $gallery)
    {
        return ($user->id === $gallery->user_id || in_array($user->id, $gallery->meta['owners']));
    }
}

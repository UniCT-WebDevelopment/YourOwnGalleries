<?php

namespace App\Policies;

use App\User;
use App\Item;
use Illuminate\Auth\Access\HandlesAuthorization;

class ItemPolicy
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
     * Determine if the given user can manage the item
     *
     * @param  \App\Item  $item
     * @param  \App\User  $user
     * @return bool
     */
    public function manage(User $user, Item $item)
    {
        return ($user->id === $item->gallery->user_id || in_array($user->id, $item->gallery->meta['owners']));
    }
}

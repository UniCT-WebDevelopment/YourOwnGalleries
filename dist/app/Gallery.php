<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $casts = [
        'meta' => 'array'
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'shared', 'meta', 'user_id'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    /**
     * Get gallery user owner
     */
    public function user()
    {
        return $this->belongsTo('App\User');
    }

    /**
     * Get gallery's items
     */
    public function items()
    {
        return $this->hasMany('App\Item');
    }


    /**
     * Get gallery's share
     */
    public function share()
    {
        $this->hasOne('App\SharedGallery');
    }
}

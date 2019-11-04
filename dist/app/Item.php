<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'shared', 'gallery_id', 'type', 'size', 'uploader'
    ];

    /**
     * Get the gallery that owns the item.
     */
    public function gallery()
    {
        return $this->belongsTo('App\Gallery');
    }

    public function items()
    {
        return $this->hasMany('App\Item');
    }
}

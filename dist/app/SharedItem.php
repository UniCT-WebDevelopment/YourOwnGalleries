<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SharedItem extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [];

    public function items()
    {
        return $this->hasMany('App\Item');
    }
}

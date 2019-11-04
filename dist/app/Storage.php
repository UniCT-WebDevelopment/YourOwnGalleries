<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Storage extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [];

     /**
     * Get users that share same storage type
     */
    public function users()
    {
        return $this->hasMany('App\Users');
    }
}

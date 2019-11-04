<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SharedGallery extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [];


    /**
     * Get shared gallery
     */
    public function gallery()
    {
        return $this->belongsTo("App\Gallery");
    }
}

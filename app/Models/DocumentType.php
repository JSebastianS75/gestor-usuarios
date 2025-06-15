<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $fillable = [
        'name',
        'status',
        'created_by',
        'updated_by',
        'inactivated_by',
        'reactivated_by',
    ];
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('reactivated_by');
        });
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('reactivated_by');
        });
        Schema::table('document_types', function (Blueprint $table) {
            $table->dropColumn('reactivated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('reactivated_by')->nullable();
        });
        Schema::table('roles', function (Blueprint $table) {
            $table->unsignedBigInteger('reactivated_by')->nullable();
        });
        Schema::table('document_types', function (Blueprint $table) {
            $table->unsignedBigInteger('reactivated_by')->nullable();
        });
    }

};

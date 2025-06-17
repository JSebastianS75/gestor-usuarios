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
            $table->timestamp('inactivated_at')->nullable();
        });
        Schema::table('roles', function (Blueprint $table) {
            $table->timestamp('inactivated_at')->nullable();
        });
        Schema::table('document_types', function (Blueprint $table) { // <--- nombre correcto
            $table->timestamp('inactivated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('inactivated_at');
        });
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('inactivated_at');
        });
        Schema::table('document_types', function (Blueprint $table) { // <--- nombre correcto
            $table->dropColumn('inactivated_at');
        });
    }
};

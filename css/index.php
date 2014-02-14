<?php

/** This file is part of KCFinder project
  *
  *      @desc Join all CSS files in current directory
  *   @package KCFinder
  *   @version 3.0-dev
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

namespace kcfinder;

chdir("..");

require "config.php";
require "lib/helper_httpCache.php";
require "lib/helper_path.php";
require "lib/helper_dir.php";

// CHECK MODIFICATION TIME FILES
$mtFiles = array(
    __FILE__,
    "config.php"
);

// GET SOURCE FILES
$files = dir::content(dirname(__FILE__), array(
    'types' => "file",
    'pattern' => '/^.*\.css$/'
));

// GET NEWEST MODIFICATION TIME
$mtime = 0;
foreach (array_merge($mtFiles, $files) as $file) {
    $fmtime = filemtime($file);
    if ($fmtime > $mtime)
        $mtime = $fmtime;
}

// GET SOURCE FROM CLIENT HTTP CACHE IF EXISTS
httpCache::checkMTime($mtime);

// OUTPUT SOURCE
header("Content-Type: text/css; charset=utf-8");

// GET SOURCE FROM SERVER-SIDE CACHE
$cacheFile = "cache/base.css";
if (file_exists($cacheFile) && (filemtime($cacheFile) >= $mtime)) {
    readfile($cacheFile);
    die;
}

// MINIFY AND OUTPUT SOURCE
$min = isset($_CONFIG['_cssMinCmd']);
$source = "";

foreach ($files as $file) {
    $min = $min && (substr($file, 4, 1) != "_");

    if ($min) {
        $cmd = str_replace("{file}", $file, $_CONFIG['_cssMinCmd']);
        $source .= `$cmd`;

    } else
        $source .= file_get_contents($file);
}

// IF CACHE DIR EXISTS AND CAN CREATE FILES THERE, THEN WRITE SERVER-SIDE CACHE
if (is_dir("cache") && dir::isWritable("cache")) {
    file_put_contents($cacheFile, $source);
    touch($cacheFile, $mtime);
}

// OUTPUT SOURCE
echo $source;

?>
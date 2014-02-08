<?php

/** This file is part of KCFinder project
  *
  *      @desc Join all JavaScript files in current directory
  *   @package KCFinder
  *   @version 3.0-dev
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

namespace kcfinder;

chdir(".."); // For compatibility
chdir("..");
require "lib/helper_httpCache.php";
require "lib/helper_dir.php";
$files = dir::content("js/browser", array(
    'types' => "file",
    'pattern' => '/^.*\.js$/'
));

foreach ($files as $file) {
    $fmtime = filemtime($file);
    if (!isset($mtime) || ($fmtime > $mtime))
        $mtime = $fmtime;
}

httpCache::checkMTime($mtime);
header("Content-Type: text/javascript");
foreach ($files as $file)
    require $file;

?>
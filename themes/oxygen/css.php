<?php

namespace kcfinder;

chdir("..");
chdir("..");
require "core/autoload.php";
$min = new minifier("css");
$min->minify("cache/theme_oxygen.css");

?>
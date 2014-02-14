<?php

function kcfinder_autoload($path) {
    $path = explode("\\", $path);

    if (count($path) == 1)
        return;

    list($ns, $class) = $path;

    if ($ns == "kcfinder") {

        if ($class == "uploader")
            require "core/class/uploader.php";
        elseif ($class == "browser")
            require "core/class/browser.php";
        elseif ($class == "minifier")
            require "core/class/minifier.php";

        elseif (file_exists("core/types/$class.php"))
            require "core/types/$class.php";
        elseif (file_exists("lib/class_$class.php"))
            require "lib/class_$class.php";
        elseif (file_exists("lib/helper_$class.php"))
            require "lib/helper_$class.php";
    }
}
spl_autoload_register("kcfinder_autoload");

?>
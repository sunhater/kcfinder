<?php

namespace kcfinder;

class minifier {

    protected $config;
    protected $type = "js";
    protected $minCmd = "";

    public function __construct($type=null) {
        require "config.php";
        $this->config = $_CONFIG;
        $type = strtolower($type);
        if (in_array($type, array("js", "css")))
            $this->type = $type;
        if (isset($_CONFIG["_{$this->type}MinCmd"]))
            $this->minCmd = $_CONFIG["_{$this->type}MinCmd"];
    }

    public function minify($cacheFile=null, $dir=null) {
        if ($dir === null)
            $dir = dirname($_SERVER['SCRIPT_FILENAME']);

        // MODIFICATION TIME FILES
        $mtFiles = array(
            __FILE__,
            $_SERVER['SCRIPT_FILENAME'],
            "config.php"
        );

        // GET SOURCE CODE FILES
        $files = dir::content($dir, array(
            'types' => "file",
            'pattern' => '/^.*\.' . $this->type . '$/'
        ));

        // GET NEWEST MODIFICATION TIME
        $mtime = 0;
        foreach (array_merge($mtFiles, $files) as $file) {
            $fmtime = filemtime($file);
            if ($fmtime > $mtime)
                $mtime = $fmtime;
        }

        // GET SOURCE CODE FROM CLIENT HTTP CACHE IF EXISTS
        httpCache::checkMTime($mtime);

        // OUTPUT SOURCE CODE
        header("Content-Type: text/{$this->type}; charset=utf-8");

        // GET SOURCE CODE FROM SERVER-SIDE CACHE
        if (($cacheFile !== null) &&
            file_exists($cacheFile) &&
            (
                (filemtime($cacheFile) >= $mtime) ||
                !is_writable($cacheFile)                // if cache file cannot be modified
            )                                           // the script will output it always
        ) {                                             // with its distribution content
            readfile($cacheFile);
            die;
        }

        // MINIFY AND JOIN SOURCE CODE
        $source = "";
        foreach ($files as $file) {

            if (strlen($this->minCmd) && (substr($file, 4, 1) != "_")) {
                $cmd = str_replace("{file}", $file, $this->minCmd);
                $source .= `$cmd`;

            } else
                $source .= file_get_contents($file);
        }

        // UPDATE SERVER-SIDE CACHE
        if (($cacheFile !== null) &&
            (
                is_writable($cacheFile) ||
                (
                    !file_exists($cacheFile) &&
                    dir::isWritable(dirname($cacheFile))
                )
            )
        ) {
            file_put_contents($cacheFile, $source);
            touch($cacheFile, $mtime);
        }

        // OUTPUT SOURCE CODE
        echo $source;

    }
}

?>
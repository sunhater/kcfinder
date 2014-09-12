<?php namespace kcfinder\integration;

/** This file is part of KCFinder project
  *
  *      @desc Integration code: Laravel Administrator (https://github.com/FrozenNode/Laravel-Administrator)
  *   @package KCFinder
  *   @version 3.12
  *    @author Zsombor Franczia <zsombor.franczia@gmail.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

class LaravelAdministrator {
    protected static $authenticated = false;
    protected static $bootstrapAutoload = '/bootstrap/autoload.php';
    protected static $bootstrapStart = '/bootstrap/start.php';

    static function getLaravelPath() {

        //absolute path method
        if (!empty($_SERVER['SCRIPT_FILENAME'])) {
            $laravelPath = dirname(dirname(dirname(dirname(dirname(dirname(dirname(dirname($_SERVER['SCRIPT_FILENAME']))))))));
            if (!file_exists($laravelPath . self::$bootstrapAutoload)) {
                $laravelPath = dirname(dirname(dirname(dirname($_SERVER['SCRIPT_FILENAME']))));
                $depth = 3;
                do {
                    $laravelPath = dirname($laravelPath);
                    $depth++;
                    $autoloadFound = file_exists($laravelPath . self::$bootstrapAutoload);
                } while (!$autoloadFound && $depth < 10);
            }
            else {
                $autoloadFound = true;
            }
        }

        //relative path method
        if (!isset($autoloadFound) || !$autoloadFound) {
            $laravelPath = '../../../../../../..';
            if (!file_exists($laravelPath . self::$bootstrapAutoload)) {
                $laravelPath = '../../..';
                $depth = 3;
                do {
                    $laravelPath .= '/..';
                    $depth++;
                } while (!($autoloadFound = file_exists($laravelPath . self::$bootstrapAutoload)) && $depth < 10);
            }
            else {
                $autoloadFound = true;
            }
        }

        return $laravelPath;
    }

    static function runIntegration() {

        $laravelPath = self::getLaravelPath();

        if(file_exists($laravelPath . '/bootstrap/autoload.php')) {
            $currentCwd = getcwd();

            // Simulate being in the laravel root folder so we can share the session (is this really needed?)
            // chdir($laravelPath);

            // bootstrap
            require $laravelPath.'/bootstrap/autoload.php';
            $app = require_once $laravelPath.'/bootstrap/start.php';
            $app->boot(); //Boot the application's service providers. 

            //get the admin check closure that should be supplied in the admin config
            $permission = \Illuminate\Support\Facades\Config::get('administrator::administrator.permission');
            $hasPermission = $permission();
            self::$authenticated = $hasPermission;

            //start session if not started already 
            if (session_id() == "") {
                session_start();
                $iStartedTheSession = true;
            }

            if (!isset($_SESSION['KCFINDER'])) {
                $_SESSION['KCFINDER'] = array();
            }

            //if this is a simple true value, user is logged in
            if ($hasPermission == true) {

                $configFactory = \Illuminate\Support\Facades\App::make('admin_config_factory');
                $modelName = \Illuminate\Support\Facades\Input::get('model');
                $fieldName = \Illuminate\Support\Facades\Input::get('field');

                if(!empty($modelName) && !empty($fieldName)) {

                    $modelConfig = $configFactory->make($modelName, true);
                    $modelConfigOptions = $modelConfig->getOption('edit_fields');
                    $kcfinderOptions = $modelConfigOptions[$fieldName]["kcfinder"];

                    //allow users to use an option called 'enabled' instead of 'disabled'
                    if(isset($kcfinderOptions["enabled"])) {
                        $kcfinderOptions["disabled"] = !$kcfinderOptions["enabled"];
                    }

                    //save all options to the session
                    foreach ($kcfinderOptions as $optKey => $optValue) {
                        $_SESSION['KCFINDER'][$optKey] = $optValue;
                    }

                    self::$authenticated = !$_SESSION['KCFINDER']['disabled'];

                }
            }
            else {
                //clean and reset the session variable
                $_SESSION['KCFINDER'] = array();
            }

            //close the session if I started it
            if (isset($iStartedTheSession)) {
                session_write_close();
            }

            // chdir($currentCwd);
            return self::$authenticated;
        }
        else {
            die("The integration service for 'Laravel Administrator' failed. Laravel root path not found!");
        }

    }

}

\kcfinder\integration\LaravelAdministrator::runIntegration();

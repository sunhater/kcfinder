<?php

namespace kcfinder;

class session
{

	const SESSION_VAR = '_sessionVar';

	/** @var array */
	private $config;

	/** @var array|\Traversable */
	private $session;

	public function __construct(array $config)
	{
		$this->config = $config;
		$this->initSession();
		$this->initConfig();
	}

	/**
	 * @return array
	 */
	public function & getSession()
	{
		return $this->session;
	}

	/**
	 * @return array
	 */
	public function & getConfig()
	{
		return $this->config;
	}

	/***/
	private function initSession()
	{
		if (isset($this->config[self::SESSION_VAR])) {
			$session = & $this->config[self::SESSION_VAR];

			if (!is_array($session) && !$session instanceof \Traversable) {
				$session = $this->getDefaultSession()[$session];

				if (!is_array($session)) {
					$session = array();
				}
			}
		} else {
			$session = $this->getDefaultSession();
		}

		$this->session = & $session;
	}

	/**
	 * @return array
	 */
	private function & getDefaultSession()
	{
		// start default
		if (!session_id()) {
			if (isset($this->config['_sessionLifetime'])) {
				ini_set('session.gc_maxlifetime', $this->config['_sessionLifetime'] * 60);
			}

			if (isset($this->config['_sessionDir'])) {
				ini_set('session.save_path', $this->config['_sessionDir']);
			}

			if (isset($this->config['_sessionDomain'])) {
				ini_set('session.cookie_domain', $this->config['_sessionDomain']);
			}

			session_start();
		}

		return $_SESSION;
	}

	/***/
	private function initConfig()
	{
		foreach ($this->session as $key => $val) {
			if ((substr($key, 0, 1) != "_") && isset($this->config[$key])) {
				$this->config[$key] = $val;
			}
		}
	}

}

<?php
    NAMESPACE kcfinder;
?>
<script src="js/index.php" type="text/javascript"></script>
<script src="js_localize.php?lng=<?php echo $this->lang ?>" type="text/javascript"></script>
<?php
    IF ($this->opener['name'] == "tinymce"):
?>
<script src="<?php echo $this->config['_tinyMCEPath'] ?>/tiny_mce_popup.js" type="text/javascript"></script>
<?php
    ENDIF;

    IF (file_exists("themes/{$this->config['theme']}/js.php")):
?>
<script src="themes/<?php echo $this->config['theme'] ?>/js.php" type="text/javascript"></script>
<?php
    ENDIF;
?>
<script type="text/javascript">
browser.version = "<?php echo self::VERSION ?>";
browser.support.zip = <?php echo (class_exists('ZipArchive') && !$this->config['denyZipDownload']) ? "true" : "false" ?>;
browser.support.check4Update = <?php echo ((!isset($this->config['denyUpdateCheck']) || !$this->config['denyUpdateCheck']) && (ini_get("allow_url_fopen") || function_exists("http_get") || function_exists("curl_init") || function_exists('socket_create'))) ? "true" : "false" ?>;
browser.lang = "<?php echo text::jsValue($this->lang) ?>";
browser.type = "<?php echo text::jsValue($this->type) ?>";
browser.theme = "<?php echo text::jsValue($this->config['theme']) ?>";
browser.access = <?php echo json_encode($this->config['access']) ?>;
browser.dir = "<?php echo text::jsValue($this->session['dir']) ?>";
browser.uploadURL = "<?php echo text::jsValue($this->config['uploadURL']) ?>";
browser.thumbsURL = browser.uploadURL + "/<?php echo text::jsValue($this->config['thumbsDir']) ?>";
browser.opener = <?php echo json_encode($this->opener) ?>;
browser.cms = "<?php echo text::jsValue($this->cms) ?>";
$.$.kuki.domain = "<?php echo text::jsValue($this->config['cookieDomain']) ?>";
$.$.kuki.path = "<?php echo text::jsValue($this->config['cookiePath']) ?>";
$.$.kuki.prefix = "<?php echo text::jsValue($this->config['cookiePrefix']) ?>";
$(document).ready(function() {
    browser.resize();
    browser.init();
});
$(window).resize(browser.resize);
</script>

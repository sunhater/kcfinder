/** This file is part of KCFinder project
  *
  *      @desc Object initializations
  *   @package KCFinder
  *   @version 3.0-dev
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

browser.init = function() {
    if (!this.checkAgent()) return;

    $('body').click(function() {
        browser.hideDialog();
    });
    $('body').rightClick();
    $('#shadow').click(function() {
        return false;
    });
    $('#dialog').unbind();
    $('#dialog').click(function() {
        return false;
    });
    $('#alert').unbind();
    $('#alert').click(function() {
        return false;
    });
    this.initOpeners();
    this.initSettings();
    this.initContent();
    this.initToolbar();
    this.initResizer();
    this.initDropUpload();
};

browser.checkAgent = function() {
    if (($.agent.msie && !$.agent.opera && !$.agent.chromeframe && (parseInt($.agent.msie) < 7)) ||
        ($.agent.opera && (parseInt($.agent.version) < 10)) ||
        ($.agent.firefox && (parseFloat($.agent.firefox) < 1.8))
    ) {
        var html = '<div style="padding:10px">Your browser is not capable to display KCFinder. Please update your browser or install another one: <a href="http://www.mozilla.com/firefox/" target="_blank">Mozilla Firefox</a>, <a href="http://www.apple.com/safari" target="_blank">Apple Safari</a>, <a href="http://www.google.com/chrome" target="_blank">Google Chrome</a>, <a href="http://www.opera.com/browser" target="_blank">Opera</a>.';
        if ($.agent.msie && !$.agent.opera)
            html += ' You may also install <a href="http://www.google.com/chromeframe" target="_blank">Google Chrome Frame ActiveX plugin</a> to get Internet Explorer 6 working.';
        html += '</div>';
        $('body').html(html);
        return false;
    }
    return true;
};

browser.initOpeners = function() {
    if (this.opener.TinyMCE && (typeof(tinyMCEPopup) == 'undefined'))
        this.opener.TinyMCE = null;

    if (this.opener.TinyMCE)
        this.opener.callBack = true;

    if ((!this.opener.name || (this.opener.name == 'fckeditor')) &&
        window.opener && window.opener.SetUrl
    ) {
        this.opener.FCKeditor = true;
        this.opener.callBack = true;
    }

    if (this.opener.CKEditor) {
        if (window.parent && window.parent.CKEDITOR)
            this.opener.CKEditor.object = window.parent.CKEDITOR;
        else if (window.opener && window.opener.CKEDITOR) {
            this.opener.CKEditor.object = window.opener.CKEDITOR;
            this.opener.callBack = true;
        } else
            this.opener.CKEditor = null;
    }

    if (!this.opener.CKEditor && !this.opener.FCKEditor && !this.TinyMCE) {
        if ((window.opener && window.opener.KCFinder && window.opener.KCFinder.callBack) ||
            (window.parent && window.parent.KCFinder && window.parent.KCFinder.callBack)
        )
            this.opener.callBack = window.opener
                ? window.opener.KCFinder.callBack
                : window.parent.KCFinder.callBack;

        if ((
                window.opener &&
                window.opener.KCFinder &&
                window.opener.KCFinder.callBackMultiple
            ) || (
                window.parent &&
                window.parent.KCFinder &&
                window.parent.KCFinder.callBackMultiple
            )
        )
            this.opener.callBackMultiple = window.opener
                ? window.opener.KCFinder.callBackMultiple
                : window.parent.KCFinder.callBackMultiple;
    }
};

browser.initContent = function() {
    $('div#folders').html(this.label("Loading folders..."));
    $('div#files').html(this.label("Loading files..."));
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: browser.baseGetData('init'),
        async: false,
        success: function(data) {
            if (browser.check4errors(data))
                return;
            browser.dirWritable = data.dirWritable;
            $('#folders').html(browser.buildTree(data.tree));
            browser.setTreeData(data.tree);
            browser.initFolders();
            browser.files = data.files ? data.files : [];
            browser.orderFiles();
        },
        error: function() {
            $('div#folders').html(browser.label("Unknown error."));
            $('div#files').html(browser.label("Unknown error."));
        }
    });
};

browser.initResizer = function() {
    var cursor = ($.agent.opera) ? 'move' : 'col-resize';
    $('#resizer').css('cursor', cursor);


    $('#resizer').draggable({
        axis: "x",
        start: function() {
            $(this).css({opacity:'0.4', filter:'alpha(opacity=40)'});
            $('#all').css('cursor', cursor);
        },
        drag: function(e) {
            var left = e.pageX - parseInt(parseInt($(this).css('width')) / 2);
            left = (left >= 0) ? left : 0;
            left = (left + parseInt($(this).css('width')) < $(window).width())
                ? left : $(window).width() - parseInt($(this).css('width'));
            $(this).css('left', left);
        },
        stop: function() {
            $(this).css({opacity:'0', filter:'alpha(opacity=0)'});
            $('#all').css('cursor', '');
            var left = parseInt($(this).css('left')) + parseInt($(this).css('width'));
            var right = $(window).width() - left;
            $('#left').css('width', left + 'px');
            $('#right').css('width', right + 'px');
            $('#files').css('width', $('#right').innerWidth() - $('#files').outerHSpace() + 'px');
            $('#resizer').css('left', $('#left').outerWidth() - $('#folders').outerRightSpace('m') + 'px');
            $('#resizer').css('width', $('#folders').outerRightSpace('m') + $('#files').outerLeftSpace('m') + 'px');
            browser.fixFilesHeight();
        }
    });
};

browser.resize = function() {
    $('#left').css('width', '25%');
    $('#right').css('width', '75%');
    $('#toolbar').css('height', $('#toolbar a').outerHeight() + 'px');
    $('#shadow').css('width', $(window).width() + 'px');
    $('#shadow').css('height', $(window).height() + 'px');
    $('#resizer').css('height', $(window).height() + 'px');
    $('#left').css('height', $(window).height() - $('#status').outerHeight() + 'px');
    $('#right').css('height', $(window).height() - $('#status').outerHeight() + 'px');
    $('#folders').css('height', $('#left').outerHeight() - $('#folders').outerVSpace() + 'px');
    browser.fixFilesHeight();
    var width = $('#left').outerWidth() + $('#right').outerWidth();
    $('#status').css('width', width + 'px');
    while ($('#status').outerWidth() > width)
        $('#status').css('width', parseInt($('#status').css('width')) - 1 + 'px');
    while ($('#status').outerWidth() < width)
        $('#status').css('width', parseInt($('#status').css('width')) + 1 + 'px');
    if ($.agent.msie && !$.agent.opera && !$.agent.chromeframe && (parseInt($.agent.msie) < 8))
        $('#right').css('width', $(window).width() - $('#left').outerWidth() + 'px');
    $('#files').css('width', $('#right').innerWidth() - $('#files').outerHSpace() + 'px');
    $('#resizer').css('left', $('#left').outerWidth() - $('#folders').outerRightSpace('m') + 'px');
    $('#resizer').css('width', $('#folders').outerRightSpace('m') + $('files').outerLeftSpace('m') + 'px');
};

browser.fixFilesHeight = function() {
    $('#files').css('height',
        $('#left').outerHeight() - $('#toolbar').outerHeight() - $('#files').outerVSpace() -
        (($('#settings').css('display') != "none") ? $('#settings').outerHeight() : 0) + 'px'
    );
};

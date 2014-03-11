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

_.init = function() {
    if (!_.checkAgent()) return;

    $('body').click(function() {
        _.hideDialog();
    }).rightClick();
    $('#shadow').click(function() {
        return false;
    });
    $('#dialog').unbind().click(function() {
        return false;
    });
    _.initOpeners();
    _.initSettings();
    _.initContent();
    _.initToolbar();
    _.initResizer();
    _.initDropUpload();

    var div = $('<div></div>')
        .css({width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000})
        .prependTo('body').append('<div></div>').find('div').css({width: '100%', height: 200});
    _.scrollbarWidth = 100 - div.width();
    div.parent().remove();

    $.each($.agent, function(i) {
        if (i != "platform")
            $('body').addClass(i)
    });

    if ($.agent.platform)
        $.each($.agent.platform, function(i) {
            $('body').addClass(i)
        });
};

_.checkAgent = function() {
    if (($.agent.msie && !$.agent.opera && !$.agent.chromeframe && (parseInt($.agent.msie) < 9)) ||
        ($.agent.opera && (parseInt($.agent.version) < 10)) ||
        ($.agent.firefox && (parseFloat($.agent.firefox) < 1.8))
    ) {
        var html = '<div style="padding:10px">Your browser is not capable to display KCFinder. Please update your browser or install another one: <a href="http://www.mozilla.com/firefox/" target="_blank">Mozilla Firefox</a>, <a href="http://www.apple.com/safari" target="_blank">Apple Safari</a>, <a href="http://www.google.com/chrome" target="_blank">Google Chrome</a>, <a href="http://www.opera.com/browser" target="_blank">Opera</a>.';
        if ($.agent.msie && !$.agent.opera)
            html += ' You may also install <a href="http://www.google.com/chromeframe" target="_blank">Google Chrome Frame ActiveX plugin</a> to get Internet Explorer 6, 7, 8 working.';
        html += '</div>';
        $('body').html(html);
        return false;
    }
    return true;
};

_.initOpeners = function() {

    try {

        // TinyMCE 3
        if (_.opener.name == "tinymce") {
            if (typeof tinyMCEPopup == "undefined")
                _.opener.name = null;
            else
                _.opener.callBack = true;

        // TinyMCE 4
        } else if (_.opener.name == "tinymce4")
            _.opener.callBack = true;

        // CKEditor
        else if (_.opener.name == "ckeditor") {
            if (window.parent && window.parent.CKEDITOR)
                _.opener.CKEditor.object = window.parent.CKEDITOR;
            else if (window.opener && window.opener.CKEDITOR) {
                _.opener.CKEditor.object = window.opener.CKEDITOR;
                _.opener.callBack = true;
            } else
                _.opener.CKEditor = null;

        // FCKeditor
        } else if ((!_.opener.name || (_.opener.name == "fckeditor")) && window.opener && window.opener.SetUrl) {
            _.opener.name = "fckeditor";
            _.opener.callBack = true;
        }

        // Custom callback
        if (!_.opener.callBack) {
            if ((window.opener && window.opener.KCFinder && window.opener.KCFinder.callBack) ||
                (window.parent && window.parent.KCFinder && window.parent.KCFinder.callBack)
            )
                _.opener.callBack = window.opener
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
                _.opener.callBackMultiple = window.opener
                    ? window.opener.KCFinder.callBackMultiple
                    : window.parent.KCFinder.callBackMultiple;
        }

    } catch(e) {}
};

_.initContent = function() {
    $('div#folders').html(_.label("Loading folders..."));
    $('div#files').html(_.label("Loading files..."));
    $.ajax({
        type: "get",
        dataType: "json",
        url: _.baseGetData("init"),
        async: false,
        success: function(data) {
            if (_.check4errors(data))
                return;
            _.dirWritable = data.dirWritable;
            $('#folders').html(_.buildTree(data.tree));
            _.setTreeData(data.tree);
            _.initFolders();
            _.files = data.files ? data.files : [];
            _.orderFiles();
        },
        error: function() {
            $('div#folders').html(_.label("Unknown error."));
            $('div#files').html(_.label("Unknown error."));
        }
    });
};

_.initResizer = function() {
    var cursor = ($.agent.opera) ? 'move' : 'col-resize';
    $('#resizer').css('cursor', cursor).draggable({
        axis: 'x',
        start: function() {
            $(this).css({
                opacity: "0.4",
                filter: "alpha(opacity=40)"
            });
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
            $(this).css({
                opacity: "0",
                filter: "alpha(opacity=0)"
            });
            $('#all').css('cursor', "");
            var left = parseInt($(this).css('left')) + parseInt($(this).css('width'));
            var right = $(window).width() - left;
            $('#left').css('width', left);
            $('#right').css('width', right);
            $('#files').css('width', $('#right').innerWidth() - $('#files').outerHSpace());
            $('#resizer').css({
                left: $('#left').outerWidth() - $('#folders').outerRightSpace('m'),
                width: $('#folders').outerRightSpace('m') + $('#files').outerLeftSpace('m')
            });
            _.fixFilesHeight();
        }
    });
};

_.resize = function() {
    $('#left').css({
        width: "25%",
        height: $(window).height() - $('#status').outerHeight()
    });
    $('#right').css({
        width: "75%",
        height: $(window).height() - $('#status').outerHeight()
    });
    $('#toolbar').css('height', $('#toolbar a').outerHeight());
    $('#shadow').css({
        width: $(window).width()
    });
    $('#shadow').css('height', $(window).height());
    $('#resizer').css('height', $(window).height());


    $('#folders').css('height', $('#left').outerHeight() - $('#folders').outerVSpace());
    _.fixFilesHeight();
    var width = $('#left').outerWidth() + $('#right').outerWidth();
    $('#status').css('width', width);
    while ($('#status').outerWidth() > width)
        $('#status').css('width', parseInt($('#status').css('width')) - 1);
    while ($('#status').outerWidth() < width)
        $('#status').css('width', parseInt($('#status').css('width')) + 1);
    $('#files').css('width', $('#right').innerWidth() - $('#files').outerHSpace());
    $('#resizer').css({
        left: $('#left').outerWidth() - $('#folders').outerRightSpace('m'),
        width: $('#folders').outerRightSpace('m') + $('files').outerLeftSpace('m')
    });
};

_.fixFilesHeight = function() {
    $('#files').css('height',
        $('#left').outerHeight() - $('#toolbar').outerHeight() - $('#files').outerVSpace() -
        (($('#settings').css('display') != "none") ? $('#settings').outerHeight() : 0)
    );
};

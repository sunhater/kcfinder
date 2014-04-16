/** This file is part of KCFinder project
  *
  *      @desc File related functionality
  *   @package KCFinder
  *   @version 3.10
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

_.initFiles = function() {
    $(document).unbind('keydown').keydown(function(e) {
        return !_.selectAll(e);
    });
    $('#files').unbind().scroll(function() {
        _.menu.hide();
    }).disableTextSelect();

    $('.file').unbind().click(function(e) {
        _.selectFile($(this), e);

    }).rightClick(function(el, e) {
        _.menuFile($(el), e);

    }).dblclick(function() {
        _.returnFile($(this));
    });

    $.each(_.shows, function(i, val) {
        $('#files .file div.' + val).css('display', ($.$.kuki.get('show' + val) == "off") ? "none" : "block");
    });
    _.statusDir();
};

_.showFiles = function(callBack, selected) {
    _.fadeFiles();
    setTimeout(function() {
        var html = '';
        $.each(_.files, function(i, file) {
            var icon, stamp = [];
            $.each(file, function(key, val) {
                stamp[stamp.length] = key + "|" + val;
            });
            stamp = encodeURIComponent(stamp.join("|"));
            if ($.$.kuki.get('view') == "list") {
                if (!i) html += '<table>';
                icon = $.$.getFileExtension(file.name);
                if (file.thumb)
                    icon = ".image";
                else if (!icon.length || !file.smallIcon)
                    icon = ".";
                icon = "themes/" + _.theme + "/img/files/small/" + icon + ".png";
                html += '<tr class="file"><td class="name" style="background-image:url(' + icon + ')">' + $.$.htmlData(file.name) + '</td><td class="time">' + file.date + '</td><td class="size">' + _.humanSize(file.size) + '</td></tr>';
                if (i == _.files.length - 1) html += '</table>';
            } else {
                if (file.thumb)
                    icon = _.getURL('thumb') + "&file=" + encodeURIComponent(file.name) + "&dir=" + encodeURIComponent(_.dir) + "&stamp=" + stamp;
                else if (file.smallThumb) {
                    icon = _.uploadURL + "/" + _.dir + "/" + file.name;
                    icon = $.$.escapeDirs(icon).replace(/\'/g, "%27");
                } else {
                    icon = file.bigIcon ? $.$.getFileExtension(file.name) : ".";
                    if (!icon.length) icon = ".";
                    icon = "themes/" + _.theme + "/img/files/big/" + icon + ".png";
                }
                html += '<div class="file"><div class="thumb" style="background-image:url(\'' + icon + '\')" ></div><div class="name">' + $.$.htmlData(file.name) + '</div><div class="time">' + file.date + '</div><div class="size">' + _.humanSize(file.size) + '</div></div>';
            }
        });
        $('#files').html('<div>' + html + '<div>');
        $.each(_.files, function(i, file) {
            var item = $('#files .file').get(i);
            $(item).data(file);
            if ((file.name === selected) ||
                $.$.inArray(file.name, selected)
            )
                $(item).addClass('selected');
        });
        $('#files > div').css({opacity:'', filter:''});
        if (callBack) callBack();
        _.initFiles();
    }, 200);
};

_.selectFile = function(file, e) {
    if (e.ctrlKey || e.metaKey) {
        if (file.hasClass('selected'))
            file.removeClass('selected');
        else
            file.addClass('selected');
        var files = $('.file.selected').get(),
            size = 0, data;
        if (!files.length)
            _.statusDir();
        else {
            $.each(files, function(i, cfile) {
                size += $(cfile).data('size');
            });
            size = _.humanSize(size);
            if (files.length > 1)
                $('#fileinfo').html(files.length + " " + _.label("selected files") + " (" + size + ")");
            else {
                data = $(files[0]).data();
                $('#fileinfo').html(data.name + " (" + _.humanSize(data.size) + ", " + data.date + ")");
            }
        }
    } else {
        data = file.data();
        $('.file').removeClass('selected');
        file.addClass('selected');
        $('#fileinfo').html(data.name + " (" + _.humanSize(data.size) + ", " + data.date + ")");
    }
};

_.selectAll = function(e) {
    if ((!e.ctrlKey && !e.metaKey) || ((e.keyCode != 65) && (e.keyCode != 97))) // Ctrl-A
        return false;

    var files = $('.file'),
        size = 0;

    if (files.length) {

        files.addClass('selected').each(function() {
            size += $(this).data('size');
        });

        $('#fileinfo').html(files.length + " " + _.label("selected files") + " (" + _.humanSize(size) + ")");
    }

    return true;
};

_.returnFile = function(file) {

    var button, win, fileURL = file.substr
        ? file : _.uploadURL + "/" + _.dir + "/" + file.data('name');
    fileURL = $.$.escapeDirs(fileURL);

    if (_.opener.name == "ckeditor") {
        _.opener.CKEditor.object.tools.callFunction(_.opener.CKEditor.funcNum, fileURL, "");
        window.close();

    } else if (_.opener.name == "fckeditor") {
        window.opener.SetUrl(fileURL) ;
        window.close() ;

    } else if (_.opener.name == "tinymce") {
        win = tinyMCEPopup.getWindowArg('window');
        win.document.getElementById(tinyMCEPopup.getWindowArg('input')).value = fileURL;
        if (win.getImageData) win.getImageData();
        if (typeof(win.ImageDialog) != "undefined") {
            if (win.ImageDialog.getImageData)
                win.ImageDialog.getImageData();
            if (win.ImageDialog.showPreviewImage)
                win.ImageDialog.showPreviewImage(fileURL);
        }
        tinyMCEPopup.close();

    } else if (_.opener.name == "tinymce4") {
        win = (window.opener ? window.opener : window.parent);
        $(win.document).find('#' + _.opener.TinyMCE.field).val(fileURL);
        win.tinyMCE.activeEditor.windowManager.close();

    } else if (_.opener.callBack) {

        if (window.opener && window.opener.KCFinder) {
            _.opener.callBack(fileURL);
            window.close();
        }

        if (window.parent && window.parent.KCFinder) {
            button = $('#toolbar a[href="kcact:maximize"]');
            if (button.hasClass('selected'))
                _.maximize(button);
            _.opener.callBack(fileURL);
        }

    } else if (_.opener.callBackMultiple) {
        if (window.opener && window.opener.KCFinder) {
            _.opener.callBackMultiple([fileURL]);
            window.close();
        }

        if (window.parent && window.parent.KCFinder) {
            button = $('#toolbar a[href="kcact:maximize"]');
            if (button.hasClass('selected'))
                _.maximize(button);
            _.opener.callBackMultiple([fileURL]);
        }

    }
};

_.returnFiles = function(files) {
    if (_.opener.callBackMultiple && files.length) {
        var rfiles = [];
        $.each(files, function(i, file) {
            rfiles[i] = _.uploadURL + "/" + _.dir + "/" + $(file).data('name');
            rfiles[i] = $.$.escapeDirs(rfiles[i]);
        });
        _.opener.callBackMultiple(rfiles);
        if (window.opener) window.close()
    }
};

_.returnThumbnails = function(files) {
    if (_.opener.callBackMultiple) {
        var rfiles = [], j = 0;
        $.each(files, function(i, file) {
            if ($(file).data('thumb')) {
                rfiles[j] = _.thumbsURL + "/" + _.dir + "/" + $(file).data('name');
                rfiles[j] = $.$.escapeDirs(rfiles[j++]);
            }
        });
        _.opener.callBackMultiple(rfiles);
        if (window.opener) window.close()
    }
};

/** This file is part of KCFinder project
  *
  *      @desc Miscellaneous functionality
  *   @package KCFinder
  *   @version 3.0-dev1
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

_.drag = function(ev, dd) {

    var top = dd.offsetY,
        left = dd.offsetX,
        t = $(this),
        win = $(window);

    if (top < 0) top = 0;
    if (left < 0) left = 0;

    if (top + t.outerHeight() > win.height())
        top = win.height() - t.outerHeight();

    if (left + t.outerWidth() > win.width())
        left = win.width() - t.outerWidth();

    t.css({
        top: top,
        left: left
    });
};

_.showDialog = function(e) {
    var dlg = $('#dialog'), left, top;

    dlg.css({left: 0, top: 0, width: ""});
    _.shadow();
    dlg.css('display', "block");

    if (e) {
        left = e.pageX - parseInt(dlg.outerWidth() / 2);
        top = e.pageY - parseInt(dlg.outerHeight() / 2);

        if (left < 0) left = 0;
        if (top < 0) top = 0;

        if ((dlg.outerWidth() + left) > $(window).width())
            left = $(window).width() - dlg.outerWidth();

        if ((dlg.outerHeight() + top) > $(window).height())
            top = $(window).height() - dlg.outerHeight();

        dlg.css({
            left: left,
            top: top
        });

    } else
        dlg.css({
            left: parseInt(($(window).width() - dlg.outerWidth()) / 2),
            top: parseInt(($(window).height() - dlg.outerHeight()) / 2)
        });

    $(document).unbind('keydown').keydown(function(e) {
        if (e.keyCode == 27)
            _.hideDialog();
    });
};

_.hideDialog = function() {
    _.unshadow();
    $('#clipboard').removeClass('selected');
    $('div.folder > a > span.folder').removeClass('context');
    $('#dialog').css({display: "none", width: ""}).html("").data('title', null).unbind().click(function() {
        return false;
    });
    $(document).unbind('keydown').keydown(function(e) {
        return !_.selectAll(e);
    });
};

_.shadow = function() {
    $('#shadow').css('display', "block");
};

_.unshadow = function() {
    $('#shadow').css('display', "none");
};

_.showMenu = function(e) {

    var left = e.pageX,
        top = e.pageY,
        dlg = $('#dialog'),
        win = $(window);

    if ((dlg.outerWidth() + left) > win.width())
        left = win.width() - dlg.outerWidth();

    if ((dlg.outerHeight() + top) > win.height())
        top = win.height() - dlg.outerHeight();

    dlg.css({
        left: left,
        top: top,
        display: "none",
        width: ""
    }).fadeIn('fast');
};

_.fileNameDialog = function(e, post, inputName, inputValue, url, labels, callBack, selectAll) {
    _.hideDialog();
    var html = '<form method="post" action="javascript:;"><input name="' + inputName + '" type="text" /></form>',
        submit = function() {
            var name = dlg.find('[type="text"]').get(0);
            name.value = $.trim(name.value);
            if (name.value == "") {
                _.alert(_.label(labels.errEmpty), function() {
                    name.focus();
                });
                return false;
            } else if (/[\/\\]/g.test(name.value)) {
                _.alert(_.label(labels.errSlash), function() {
                    name.focus();
                });
                return false;
            } else if (name.value.substr(0, 1) == ".") {
                _.alert(_.label(labels.errDot), function() {
                    name.focus();
                });
                return false;
            }
            post[inputName] = name.value;
            $.ajax({
                type: "post",
                dataType: "json",
                url: url,
                data: post,
                async: false,
                success: function(data) {
                    if (_.check4errors(data, false))
                        return;
                    if (callBack) callBack(data);
                    dlg.dialog("destroy").detach();
                },
                error: function() {
                    _.alert(_.label("Unknown error."));
                }
            });
            return false;
        },
        dlg = _.dialog(_.label(labels.title), html, {
            width: 351,
            buttons: [
                {
                    text: _.label("OK"),
                    click: function() {
                        submit();
                    }
                },
                {
                    text: _.label("Cancel"),
                    click: function() {
                        $(this).dialog('destroy').detach();
                    }
                }
            ]
        }),

        field = dlg.find('[type="text"]');

    field.uniform().attr('value', inputValue).css('width', 310);
    dlg.find('form').submit(submit);

    if (!selectAll && /^(.+)\.[^\.]+$/ .test(inputValue))
        field.selection(0, inputValue.replace(/^(.+)\.[^\.]+$/, "$1").length);
    else {
        field.get(0).focus();
        field.get(0).select();
    }
};

_.orderFiles = function(callBack, selected) {
    var order = $.$.kuki.get('order'),
        desc = ($.$.kuki.get('orderDesc') == "on"),
        a1, b1, arr;

    if (!_.files || !_.files.sort)
        _.files = [];

    _.files = _.files.sort(function(a, b) {
        if (!order) order = "name";

        if (order == "date") {
            a1 = a.mtime;
            b1 = b.mtime;
        } else if (order == "type") {
            a1 = $.$.getFileExtension(a.name);
            b1 = $.$.getFileExtension(b.name);
        } else if (order == "size") {
            a1 = a.size;
            b1 = b.size;
        } else {
            a1 = a[order].toLowerCase();
            b1 = b[order].toLowerCase();
        }

        if ((order == "size") || (order == "date")) {
            if (a1 < b1) return desc ? 1 : -1;
            if (a1 > b1) return desc ? -1 : 1;
        }

        if (a1 == b1) {
            a1 = a.name.toLowerCase();
            b1 = b.name.toLowerCase();
            arr = [a1, b1];
            arr = arr.sort();
            return (arr[0] == a1) ? -1 : 1;
        }

        arr = [a1, b1];
        arr = arr.sort();
        if (arr[0] == a1) return desc ? 1 : -1;
        return desc ? -1 : 1;
    });

    _.showFiles(callBack, selected);
    _.initFiles();
};

_.humanSize = function(size) {
    if (size < 1024) {
        size = size.toString() + " B";
    } else if (size < 1048576) {
        size /= 1024;
        size = parseInt(size).toString() + " KB";
    } else if (size < 1073741824) {
        size /= 1048576;
        size = parseInt(size).toString() + " MB";
    } else if (size < 1099511627776) {
        size /= 1073741824;
        size = parseInt(size).toString() + " GB";
    } else {
        size /= 1099511627776;
        size = parseInt(size).toString() + " TB";
    }
    return size;
};

_.baseGetData = function(act) {
    var data = "browse.php?type=" + encodeURIComponent(_.type) + "&lng=" + _.lang;
    if (act)
        data += "&act=" + act;
    if (_.cms)
        data += "&cms=" + _.cms;
    return data;
};

_.label = function(index, data) {
    var label = _.labels[index] ? _.labels[index] : index;
    if (data)
        $.each(data, function(key, val) {
            label = label.replace("{" + key + "}", val);
        });
    return label;
};

_.check4errors = function(data) {
    if (!data.error)
        return false;
    var msg;
    if (data.error.join)
        msg = data.error.join("\n");
    else
        msg = data.error;
    _.alert(msg);
    return true;
};

_.post = function(url, data) {
    var html = '<form id="postForm" method="post" action="' + url + '">';
    $.each(data, function(key, val) {
        if ($.isArray(val))
            $.each(val, function(i, aval) {
                html += '<input type="hidden" name="' + $.$.htmlValue(key) + '[]" value="' + $.$.htmlValue(aval) + '" />';
            });
        else
            html += '<input type="hidden" name="' + $.$.htmlValue(key) + '" value="' + $.$.htmlValue(val) + '" />';
    });
    html += '</form>';
    $('#dialog').html(html).css('display', "block");
    $('#postForm').get(0).submit();
};

_.fadeFiles = function() {
    $('#files > div').css({
        opacity: "0.4",
        filter: "alpha(opacity=40)"
    });
};

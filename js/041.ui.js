/** This file is part of KCFinder project
  *
  *      @desc Dialog boxes functionality
  *   @package KCFinder
  *   @version 3.0-dev1
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

_.alert = function(text, field) {
    var close = !field
        ? function() {}
        : ($.isFunction(field)
            ? field
            : function() { setTimeout(function() {field.focus(); }, 1); }
        );

    return _.dialog(_.label("Warning"), text.replace("\n", "<br />\n"), {
        close: function() {
            close();
            if ($(this).hasClass('ui-dialog-content'))
                $(this).dialog('destroy').detach();
        }
    });
};

_.confirm = function(text, callback, options) {

    var o = {
        buttons: [
            {
                text: _.label("Yes"),
                click: function() {
                    callback();
                    $(this).dialog('destroy').detach();
                }
            },
            {
                text: _.label("No"),
                click: function() {
                    $(this).dialog('destroy').detach();
                }
            }
        ]
    };

    if (options)
        $.each(o, function(key, val) {
            if (typeof options[key] == "undefined")
                options[key] = val;
        });
    else
        options = o;

    return _.dialog(_.label("Question"), text, options);
};

_.dialog = function(title, content, options) {

    if (!options) options = {};
    var dlg = $('<div></div>');
    dlg.css('display', "none").attr('title', title).html(content).appendTo('body');
    if (dlg.find('form').get(0) && !dlg.find('form [type="submit"]').get(0))
        dlg.find('form').append('<button type="submit" style="width:0;height:0;padding:0;margin:0;border:0;visibility:hidden">Submit</button>');

    var defaultOptions = {
        resizable: false,
        minHeight: false,
        modal: true,
        width: 351,
        show: 'fade',
        buttons: [
            {
                text: _.label("OK"),
                click: function() {
                    if (typeof options.close != "undefined")
                        options.close();
                    if ($(this).hasClass('ui-dialog-content'))
                        $(this).dialog('destroy').detach();
                }
            }
        ],
        close: function() {
            if ($(this).hasClass('ui-dialog-content'))
                $(this).dialog('destroy').detach();
        },
        closeText: false,
        zindex: 1000000,
        alone: false,
        legend: false
    };

    var padding = options.nopadding ? false : true;

    $.each(defaultOptions, function(key, val) {
        if (typeof options[key] == "undefined") options[key] = val;
    });

    if (options.alone) {
        $('.ui-dialog .ui-dialog-content').dialog('destroy').detach();
    }

    dlg.dialog(options);
    if (!padding)
        $('.ui-dialog').last().find('.ui-dialog-content').css({
            padding: 0,
            overflow: "hidden"
        });
    if (options.legend)
        dlg.parent().find('.ui-dialog-buttonpane').prepend('<div style="float:left;padding:10px 0 0 10px">' + options.legend + '</div>');
    if ($.agent && $.agent.mozilla)
        dlg.css('overflow', "hidden");
    return dlg;
};

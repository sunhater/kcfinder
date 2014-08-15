/** This file is part of KCFinder project
  *
  *      @desc Image viewer
  *   @package KCFinder
  *   @version 3.12
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

_.viewImage = function(data) {

    var ts = new Date().getTime(),
        dlg = false,
        images = [],
        min_h = 100,
        min_w, dd, dv, dh;

    showImage = function(data) {
        _.lock = true;

        var url = $.$.escapeDirs(_.uploadURL + "/" + _.dir + "/" + data.name) + "?ts=" + ts,
            img = new Image(),
            i = $(img),
            w = $(window),
            d = $(document),

        onImgLoad = function() {
            _.lock = false;

            $('#files .file').each(function() {
                if ($(this).data('name') == data.name) {
                    _.ssImage = this;
                    return false;
                }
            });

            i.hide().appendTo('body');

            var w_w = w.width(),
                w_h = w.height(),
                o_w = i.width(),
                o_h = i.height(),
                i_w = o_w,
                i_h = o_h,
                openDlg = false,

                goTo = function(i) {
                    if (!_.lock) {
                        var nimg = images[i];
                        _.currImg = i;
                        showImage(nimg);
                    }
                },

                nextFunc = function() {
                    goTo((_.currImg >= images.length - 1) ? 0 : (_.currImg + 1));
                },

                prevFunc = function() {
                    goTo((_.currImg ? _.currImg : images.length) - 1);
                },

                t = $('<div class="img"></div>');

            i.detach().appendTo(t);

            if (!dlg) {
                openDlg = true;

                var closeFunc = function() {
                    d.unbind('keydown').keydown(function(e) {
                        return !_.selectAll(e);
                    });
                    dlg.dialog('destroy').detach();
                };

                dlg = _.dialog(".", "", {
                    draggable: false,
                    nopadding: true,
                    close: closeFunc,
                    show: false,
                    hide: false,
                    buttons: [
                        {
                            text: _.label("Previous"),
                            icons: {primary: "ui-icon-triangle-1-w"},
                            click: prevFunc

                        }, {
                            text: _.label("Next"),
                            icons: {secondary: "ui-icon-triangle-1-e"},
                            click: nextFunc

                        }, {
                            text: _.label("Select"),
                            icons: {primary: "ui-icon-check"},
                            click: function(e) {
                                d.unbind('keydown').keydown(function(e) {
                                    return !_.selectAll(e);
                                });
                                if (_.ssImage) {
                                    _.selectFile($(_.ssImage), e);
                                }
                                dlg.dialog('destroy').detach();
                            }

                        }, {
                            text: _.label("Close"),
                            icons: {primary: "ui-icon-closethick"},
                            click: closeFunc
                        }
                    ]
                });

                dd = dlg.parent();
                dd.addClass('kcfImageViewer');
                dlg.css({overflow: "hidden"}).parent().css({width:"auto", height:"auto"}).find('.ui-dialog-buttonpane button').get(2).focus();
                dv = dd.find('.ui-dialog-titlebar').outerHeight() + dd.find('.ui-dialog-buttonpane').outerHeight() + dd.outerVSpace('b');
                dh = dd.outerHSpace('b');
                min_w = dd.outerWidth() - dh;
            }

            var max_w = w_w - dh,
                max_h = w_h - dv + 1,
                width, height, top, left;

            if ((o_w > max_w) || (o_h > max_h)) {

                if ((max_h / max_w) < (o_h / o_w)) {
                    height = max_h;
                    width = ((o_w * height) / o_h);
                } else {
                    width = max_w;
                    height = ((o_h * width) / o_w);
                }

                i_w = width;
                i_h = height;

            } else if ((o_w < min_w) || (o_h < min_h)) {
                width = (o_w < min_w) ? min_w : o_w;
                height = (o_h < min_h) ? min_h : o_h;
                left = (o_w < min_w) ? (min_w - o_w) / 2 : 0;
                top = (o_h < min_h) ? (min_h - o_h) / 2 : 0;

            } else {
                width = o_w;
                height = o_h;
                left = top = 0;
            }

            var show = function() {
                dlg.animate({width: width, height: height}, 100);
                dlg.parent().animate({top: (w_h - height - dv) / 2, left: (w_w - width - dh) / 2}, 100, function() {
                    dlg.html(t.get(0));
                    i.css({paddingTop: top, paddingLeft: left, width: i_w, height: i_h}).show();
                    dlg.children().first().css({width: width, height: height, display: "none"}).fadeIn(100, function() {
                        loadingStop();
                        dlg.prev().find('.ui-dialog-title').css({width:width - dlg.prev().find('.ui-dialog-titlebar-close').outerWidth() - 20}).text(data.name + " (" + o_w + " x " + o_h + ")");
                    });
                });
            }

            if (openDlg)
                show();
            else
                dlg.children().first().fadeOut(100, show);

            dlg.unbind('click').click(nextFunc).disableTextSelect();

            d.unbind('keydown').keydown(function(e) {
                if (!_.lock) {
                    var kc = e.keyCode;
                    if ((kc == 37)) prevFunc();
                    if ((kc == 39)) nextFunc();
                }
            });
        },

        loadingStart = function() {
            if (dlg)
                dlg.prev().addClass("loading").find('.ui-dialog-title').html(_.label("Loading image...")).css({width: "auto"});
            else
                $('#loading').html(_.label("Loading image...")).show();
        },

        loadingStop = function() {
            if (dlg)
                dlg.prev().removeClass("loading");
            $('#loading').hide();
        };

        loadingStart();
        img.src = url;

        if (img.complete)
            onImgLoad();
        else {
            img.onload = onImgLoad;
            img.onerror = function() {
                _.lock = false;
                loadingStop();
                _.alert(_.label("Unknown error."));
                d.unbind('keydown').keydown(function(e) {
                    return !_.selectAll(e);
                });
                _.refresh();
            };
        }
    };

    $.each(_.files, function(i, file) {
        var i = images.length;
        if (file.thumb || file.smallThumb)
            images[i] = file;
        if (file.name == data.name)
            _.currImg = i;
    });

    showImage(data);
    return false;
};

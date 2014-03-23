/** This file is part of KCFinder project
  *
  *      @desc Image viewer
  *   @package KCFinder
  *   @version 3.0-dev1
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

_.viewImage = function(data) {
    _.hideDialog();
    var ts = new Date().getTime(),
    showImage = function(data) {
        var url = $.$.escapeDirs(_.uploadURL + "/" + _.dir + "/" + data.name) + "?ts=" + ts,
            img = new Image();

        $('#loading').html(_.label("Loading image...")).show();
        img.src = url;
        img.onerror = function() {
            _.lock = false;
            $('#loading').hide();
            _.alert(_.label("Unknown error."));
            $(document).unbind('keydown').keydown(function(e) {
                return !_.selectAll(e);
            });
            _.refresh();
        };
        var onImgLoad = function() {
            _.lock = false;
            $('#files .file').each(function() {
                if ($(this).data('name') == data.name)
                    _.ssImage = this;
            });
            $('#loading').hide();
            $('#dialog').html('<div class="slideshow"><img /></div>');
            $('#dialog img').attr({
                src: url,
                title: data.name
            }).fadeIn('fast', function() {
                var o_w = $('#dialog').outerWidth();
                var o_h = $('#dialog').outerHeight();
                var f_w = $(window).width() - 30;
                var f_h = $(window).height() - 30;
                if ((o_w > f_w) || (o_h > f_h)) {
                    if ((f_w / f_h) > (o_w / o_h))
                        f_w = parseInt((o_w * f_h) / o_h);
                    else if ((f_w / f_h) < (o_w / o_h))
                        f_h = parseInt((o_h * f_w) / o_w);
                    $('#dialog img').attr({
                        width: f_w,
                        height: f_h
                    });
                }
                $('#dialog').unbind('click').click(function(e) {
                    _.hideDialog();
                    $(document).unbind('keydown');
                    $(document).keydown(function(e) {
                        return !_.selectAll(e);
                    });
                    if (_.ssImage) {
                        _.selectFile($(_.ssImage), e);
                    }
                });
                _.showDialog();
                var images = [];
                $.each(_.files, function(i, file) {
                    if (file.thumb || file.smallThumb)
                        images[images.length] = file;
                });
                if (images.length)
                    $.each(images, function(i, image) {
                        if (image.name == data.name) {
                            $(document).unbind('keydown').keydown(function(e) {
                                if (images.length > 1) {
                                    if (!_.lock && (e.keyCode == 37)) {
                                        var nimg = i
                                            ? images[i - 1]
                                            : images[images.length - 1];
                                        _.lock = true;
                                        showImage(nimg);
                                    }
                                    if (!_.lock && (e.keyCode == 39)) {
                                        var nimg = (i >= images.length - 1)
                                            ? images[0]
                                            : images[i + 1];
                                        _.lock = true;
                                        showImage(nimg);
                                    }
                                }
                                if (e.keyCode == 27) {
                                    _.hideDialog();
                                    $(document).unbind('keydown').keydown(function(e) {
                                        return !_.selectAll(e);
                                    });
                                }
                            });
                        }
                    });
            });
        };
        if (img.complete)
            onImgLoad();
        else
            img.onload = onImgLoad;
    };
    showImage(data);
    return false;
};
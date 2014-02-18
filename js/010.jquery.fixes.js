(function($) {

    $.fn.oldMenu = $.fn.menu;
    $.fn.menu = function(p1, p2, p3) {
        var ret = $(this).oldMenu(p1, p2, p3);
        $(this).each(function() {
            if (!$(this).hasClass('sh-menu')) {
                $(this).addClass('sh-menu')
                       .children().first().addClass('ui-menu-item-first');
                $(this).children().last().addClass('ui-menu-item-last');
                $(this).find('.ui-menu').addClass('sh-menu').each(function() {
                    $(this).children().first().addClass('ui-menu-item-first');
                    $(this).children().last().addClass('ui-menu-item-last');
                });
            }
        });
        return ret;
    };

    $.fn.oldUniform = $.fn.uniform;
    $.fn.uniform = function(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) {
        var ret = $(this).oldUniform(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10);

        $(this).each(function() {
            var t = $(this);

            if (!t.hasClass('sh-uniform')) {
                t.addClass('sh-uniform');

                // Fix upload filename width
                if (t.is('input[type="file"]')) {
                    var f = t.parent().find('.filename');
                    f.css('width', f.innerWidth());
                }

                // Add an icon into select boxes
                if (t.is('select') && !t.attr('multiple')) {

                    var p = t.parent(),
                        height = p.height(),
                        width = p.outerWidth(),
                        width2 = p.find('span').outerWidth();

                    $('<div></div>').addClass('ui-icon').css({
                        'float': "right",
                        marginTop: - parseInt((height / 2) + 8),
                        marginRight: - parseInt((width - width2) / 2) - 7
                    }).appendTo(p);
                }
            }
        });
        return ret;
    };

})(jQuery);
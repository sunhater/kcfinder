/** This file is part of KCFinder project
  *
  *      @desc Folder related functionality
  *   @package KCFinder
  *   @version 3.0-dev1
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

_.initFolders = function() {
    $('#folders').scroll(function() {
        _.hideDialog();
    });
    $('div.folder > a').unbind().click(function() {
        _.hideDialog();
        return false;
    });
    $('div.folder > a > span.brace').unbind().click(function() {
        if ($(this).hasClass('opened') || $(this).hasClass('closed'))
            _.expandDir($(this).parent());
    });
    $('div.folder > a > span.folder').unbind().click(function() {
        _.changeDir($(this).parent());
    }).rightClick(function(el, e) {
        $.$.unselect();
        _.menuDir($(el).parent(), e);
    });
};

_.setTreeData = function(data, path) {
    if (!path)
        path = "";
    else if (path.length && (path.substr(path.length - 1, 1) != '/'))
        path += "/";
    path += data.name;
    var selector = '#folders a[href="kcdir:/' + $.$.escapeDirs(path) + '"]';
    $(selector).data({
        name: data.name,
        path: path,
        readable: data.readable,
        writable: data.writable,
        removable: data.removable,
        hasDirs: data.hasDirs
    });
    $(selector + ' span.folder').addClass(data.current ? 'current' : 'regular');
    if (data.dirs && data.dirs.length) {
        $(selector + ' span.brace').addClass('opened');
        $.each(data.dirs, function(i, cdir) {
            _.setTreeData(cdir, path + "/");
        });
    } else if (data.hasDirs)
        $(selector + ' span.brace').addClass('closed');
};

_.buildTree = function(root, path) {
    if (!path) path = "";
    path += root.name;
    var cdir, html = '<div class="folder"><a href="kcdir:/' + $.$.escapeDirs(path) + '"><span class="brace">&nbsp;</span><span class="folder">' + $.$.htmlData(root.name) + '</span></a>';
    if (root.dirs) {
        html += '<div class="folders">';
        for (var i = 0; i < root.dirs.length; i++) {
            cdir = root.dirs[i];
            html += _.buildTree(cdir, path + "/");
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
};

_.expandDir = function(dir) {
    var path = dir.data('path');
    if (dir.children('.brace').hasClass('opened')) {
        dir.parent().children('.folders').hide(500, function() {
            if (path == _.dir.substr(0, path.length))
                _.changeDir(dir);
        });
        dir.children('.brace').removeClass('opened').addClass('closed');
    } else {
        if (dir.parent().children('.folders').get(0)) {
            dir.parent().children('.folders').show(500);
            dir.children('.brace').removeClass('closed').addClass('opened');
        } else if (!$('#loadingDirs').get(0)) {
            dir.parent().append('<div id="loadingDirs">' + _.label("Loading folders...") + '</div>');
            $('#loadingDirs').css('display', "none").show(200, function() {
                $.ajax({
                    type: "post",
                    dataType: "json",
                    url: _.baseGetData("expand"),
                    data: {dir: path},
                    async: false,
                    success: function(data) {
                        $('#loadingDirs').hide(200, function() {
                            $('#loadingDirs').detach();
                        });
                        if (_.check4errors(data))
                            return;

                        var html = "";
                        $.each(data.dirs, function(i, cdir) {
                            html += '<div class="folder"><a href="kcdir:/' + $.$.escapeDirs(path + '/' + cdir.name) + '"><span class="brace">&nbsp;</span><span class="folder">' + $.$.htmlData(cdir.name) + '</span></a></div>';
                        });
                        if (html.length) {
                            dir.parent().append('<div class="folders">' + html + '</div>');
                            var folders = $(dir.parent().children('.folders').first());
                            folders.css('display', "none");
                            $(folders).show(500);
                            $.each(data.dirs, function(i, cdir) {
                                _.setTreeData(cdir, path);
                            });
                        }
                        if (data.dirs.length)
                            dir.children('.brace').removeClass('closed').addClass('opened');
                        else
                            dir.children('.brace').removeClass('opened closed');
                        _.initFolders();
                        _.initDropUpload();
                    },
                    error: function() {
                        $('#loadingDirs').detach();
                        _.alert(_.label("Unknown error."));
                    }
                });
            });
        }
    }
};

_.changeDir = function(dir) {
    if (dir.children('span.folder').hasClass('regular')) {
        $('div.folder > a > span.folder').removeClass('current regular').addClass('regular');
        dir.children('span.folder').removeClass('regular').addClass('current');
        $('#files').html(_.label("Loading files..."));
        $.ajax({
            type: "post",
            dataType: "json",
            url: _.baseGetData("chDir"),
            data: {dir: dir.data('path')},
            async: false,
            success: function(data) {
                if (_.check4errors(data))
                    return;
                _.files = data.files;
                _.orderFiles();
                _.dir = dir.data('path');
                _.dirWritable = data.dirWritable;
                var title = "KCFinder: /" + _.dir;
                document.title = title;
                if (_.opener.name == "tinymce")
                    tinyMCEPopup.editor.windowManager.setTitle(window, title);
                _.statusDir();
            },
            error: function() {
                $('#files').html(_.label("Unknown error."));
            }
        });
    }
};

_.statusDir = function() {
    var i = 0, size = 0;
    for (; i < _.files.length; i++)
        size += _.files[i].size;
    size = _.humanSize(size);
    $('#fileinfo').html(_.files.length + " " + _.label("files") + " (" + size + ")");
};

_.menuDir = function(dir, e) {
    var data = dir.data();
    var html = '<ul>';
    if (_.clipboard && _.clipboard.length) {
        if (_.access.files.copy)
            html += '<li><a href="kcact:cpcbd"' + (!data.writable ? ' class="denied"' : "") + '><span>' +
                _.label("Copy {count} files", {count: _.clipboard.length}) + '</span></a></li>';
        if (_.access.files.move)
            html += '<li><a href="kcact:mvcbd"' + (!data.writable ? ' class="denied"' : "") + '><span>' +
                _.label("Move {count} files", {count: _.clipboard.length}) + '</span></a></li>';
        if (_.access.files.copy || _.access.files.move)
            html += '<li>-</li>';
    }
    html +=
        '<li><a href="kcact:refresh"><span>' + _.label("Refresh") + '</span></a></li>';
    if (_.support.zip) html +=
        '<li>-</li>' +
        '<li><a href="kcact:download"><span>' + _.label("Download") + '</span></a></li>';
    if (_.access.dirs.create || _.access.dirs.rename || _.access.dirs['delete'])
        html += '<li>-</li>';
    if (_.access.dirs.create)
        html += '<li><a href="kcact:mkdir"' + (!data.writable ? ' class="denied"' : "") + '><span>' +
            _.label("New Subfolder...") + '</span></a></li>';
    if (_.access.dirs.rename)
        html += '<li><a href="kcact:mvdir"' + (!data.removable ? ' class="denied"' : "") + '><span>' +
            _.label("Rename...") + '</span></a></li>';
    if (_.access.dirs['delete'])
        html += '<li><a href="kcact:rmdir"' + (!data.removable ? ' class="denied"' : "") + '><span>' +
            _.label("Delete") + '</span></a></li>';
    html += '</ul>';

    $('#dialog').html(html).find('ul').menu();
    _.showMenu(e);
    $('div.folder > a > span.folder').removeClass('context');
    if (dir.children('span.folder').hasClass('regular'))
        dir.children('span.folder').addClass('context');

    if (_.clipboard && _.clipboard.length && data.writable) {

        $('#dialog a[href="kcact:cpcbd"]').click(function() {
            _.hideDialog();
            _.copyClipboard(data.path);
            return false;
        });

        $('#dialog a[href="kcact:mvcbd"]').click(function() {
            _.hideDialog();
            _.moveClipboard(data.path);
            return false;
        });
    }

    $('#dialog a[href="kcact:refresh"]').click(function() {
        _.hideDialog();
        _.refreshDir(dir);
        return false;
    });

    $('#dialog a[href="kcact:download"]').click(function() {
        _.hideDialog();
        _.post(_.baseGetData("downloadDir"), {dir:data.path});
        return false;
    });

    $('#dialog a[href="kcact:mkdir"]').click(function(e) {
        if (!data.writable) return false;
        _.hideDialog();
        _.fileNameDialog(
            e, {dir: data.path},
            "newDir", "", _.baseGetData("newDir"), {
                title: "New folder name:",
                errEmpty: "Please enter new folder name.",
                errSlash: "Unallowable characters in folder name.",
                errDot: "Folder name shouldn't begins with '.'"
            }, function() {
                _.refreshDir(dir);
                _.initDropUpload();
                if (!data.hasDirs) {
                    dir.data('hasDirs', true);
                    dir.children('span.brace').addClass('closed');
                }
            }
        );
        return false;
    });

    $('#dialog a[href="kcact:mvdir"]').click(function(e) {
        if (!data.removable) return false;
        _.hideDialog();
        _.fileNameDialog(
            e, {dir: data.path},
            "newName", data.name, _.baseGetData("renameDir"), {
                title: "New folder name:",
                errEmpty: "Please enter new folder name.",
                errSlash: "Unallowable characters in folder name.",
                errDot: "Folder name shouldn't begins with '.'"
            }, function(dt) {
                if (!dt.name) {
                    _.alert(_.label("Unknown error."));
                    return;
                }
                var currentDir = (data.path == _.dir);
                dir.children('span.folder').html($.$.htmlData(dt.name));
                dir.data('name', dt.name);
                dir.data('path', $.$.dirname(data.path) + '/' + dt.name);
                if (currentDir)
                    _.dir = dir.data('path');
                _.initDropUpload();
            },
            true
        );
        return false;
    });

    $('#dialog a[href="kcact:rmdir"]').click(function() {
        if (!data.removable) return false;
        _.hideDialog();
        _.confirm(
            _.label("Are you sure you want to delete this folder and all its content?"),
            function(callBack) {
                 $.ajax({
                    type: "post",
                    dataType: "json",
                    url: _.baseGetData("deleteDir"),
                    data: {dir: data.path},
                    async: false,
                    success: function(data) {
                        if (callBack) callBack();
                        if (_.check4errors(data))
                            return;
                        dir.parent().hide(500, function() {
                            var folders = dir.parent().parent();
                            var pDir = folders.parent().children('a').first();
                            dir.parent().detach();
                            if (!folders.children('div.folder').get(0)) {
                                pDir.children('span.brace').first().removeClass('opened closed');
                                pDir.parent().children('.folders').detach();
                                pDir.data('hasDirs', false);
                            }
                            if (pDir.data('path') == _.dir.substr(0, pDir.data('path').length))
                                _.changeDir(pDir);
                            _.initDropUpload();
                        });
                    },
                    error: function() {
                        if (callBack) callBack();
                        _.alert(_.label("Unknown error."));
                    }
                });
            }
        );
        return false;
    });
};

_.refreshDir = function(dir) {
    var path = dir.data('path');
    if (dir.children('.brace').hasClass('opened') || dir.children('.brace').hasClass('closed'))
        dir.children('.brace').removeClass('opened').addClass('closed');
    dir.parent().children('.folders').first().detach();
    if (path == _.dir.substr(0, path.length))
        _.changeDir(dir);
    _.expandDir(dir);
    return true;
};

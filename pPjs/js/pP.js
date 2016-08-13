/**
 * @author shuxun.yin
 * picture preview 
 */
+function ($, global) {
    var Pp = function (opts) {
        this._opts = $.extend(this._defaults, opts);
        this._setting();
        this._initEvents();
        this.renderOutView().domInitialized(function () {
            this.render(this._picList[this._currPic.currIndex]);
            this.next();
            this.previous();
            this.imgEvent();
            this.triggerHide();
        })
    };
    /**
     * @type {string}
     */
    Pp.Version = '0.0.1';

    /**
     * Extend
     * @public
     */
    Pp.extend = function () {
        var main, extend, args = arguments;

        switch (args.length) {
            case 0:
                return;
            case 1:
                main = Pp.prototype;
                extend = args[0];
                break;
            case 2:
                main = args[0];
                extend = args[1];
                break;
        }

        for (var property in extend) {
            if (extend.hasOwnProperty(property)) {
                main[property] = extend[property];
            }
        }
    };
    /**
     *
     * @type {{
         *          id: string,
         *          zIndex: string,
         *          picList: *[],
         *          startIndex: number
         *}}
     * @private
     */
    Pp._defaults = {
        id: "",
        zIndex: "",
        picList: [{
            pictureName: "",
            pictureUrl: "",
            pictureSize: "",
            pictureMem: "",
            picTeam: "",
            createTime: ""
        }],
        currIndex: 0
    }

    Pp.prototype._setting = function () {
        var self = this,
            opts = self._opts;
        self._events = {};
        self._$el = $(".picZoom");
        self._loading = 'off';
        self._picList = opts.picList;
        self._zIndex = '10000';
        self._id = opts.id;
        self._currPic = {
            currIndex: opts.currIndex
        }
        Pp.extend(self._currPic, self._picList[self._currPic.currIndex])
    }
    /**
     * @type {string[]}
     */
    Pp.EVENTS = [
        'initialize',
        'initialized',
        'destroy',
        'onShow',
        'prePic',
        'nextPic'
    ];

    // 简单实现了一下 subscribe 和 dispatch
    Pp.prototype.dispatch = function (event, data) {
        if (!this._events[event]) { // 没有监听事件
            return;
        }
        for (var i = 0; i < this._events[event].length; i++) {
            this._events[event][i](data);
        }
    };

    Pp.prototype.subscribe = function (event, callback) {
        // 创建一个新事件数组
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(callback.bind(this));
    };

    /**
     * @param dataIndex
     * @param opts
     */
    Pp.prototype._initEvents = function () {
        this.subscribe("goTo", this._goTo);
        this.subscribe("goTo1", this._goTo);
    }

    Pp.prototype._goTo = function (dataIndex) {
        if (this._loading === 'on')return;
        var newCurrIndex = (this._picList.length + dataIndex) % this._picList.length;
        this._currPic.currIndex = newCurrIndex;
        this.render(this._picList[newCurrIndex]);
    }

    Pp.prototype.domInitialized = function (callback) {
        this._$el.ready(callback.call(this));
        return this;
    }

    Pp.extend({
        renderOutView: function () {
            var $body = $("body").addClass('lay-on'),
                html = "<div class='picZoom'";
            this._id && (html += " id='" + this._id + "' ");
            this._zIndex && (html += " style='z-index:" + this._zIndex + "'> ");
            html += '<a class="previous"></a>';
            html += '<a class="next"></a>';
            html += '<div class="content" style="width: 632px; height: 422px;">';
            html += '<img src="' +this._currPic.pictureUrl + '" style="width: 631.565px; height: 422px;"/>';
            html += '<table>';
            html += '<tr><td>名&emsp;&emsp;称:</td><td class="picTdValue">' + this._currPic.pictureId + '</td></tr>';
            html += '<tr><td>分&emsp;&emsp;类:</td><td class="picTdValue">' + this._currPic.pictureUrl + '</td></tr>';
            html += '<tr><td>大&emsp;&emsp;小:</td><td class="picTdValue">' + this._currPic.pictureSize + '</td></tr>';
            // html += '<tr><td>所占内存:</td><td class="picTdValue">'+this._currPic.pictureMem+'</td></tr>';
            html += '<tr><td>上传时间:</td><td class="picTdValue">' + this._currPic.createTime + '</td></tr>';
            html += '</table>';
            html += "</div>";
            $(html).appendTo($body).show();
            return this;
        },
        render: function (picture) {
            var img = new Image(),
                src = picture.pictureUrl,
                name = picture.pictureName,
                time = picture.createTime,
                team = picture.picTeam;

            img.src = src;
            this._loading = "on";
            $(".picZoom .content").addClass("loading");
            $(".picZoom .content img,.picZoom .content table").hide();
            img.onload = function () {
                var width = img.width,
                    height = img.height;
                $(".picZoom img").attr("src", src);
                this.algorithm(width, height);
                $(".picZoom .content").removeClass("loading");
                $(".picZoom .content .picTdValue:eq(0)").text(name);
                $(".picZoom .content .picTdValue:eq(1)").text(team);
                $(".picZoom .content .picTdValue:eq(2)").text(width + "x" + height + "像素");
                $(".picZoom .content .picTdValue:eq(3)").text(time);
                $(".picZoom .content img,.picZoom .content table").show();
                this._loading = "off";
            }.bind(this)
        },
        algorithm: function (width, height) {
            var winW = $(window).width(),
                winH = $(window).height(),
                newH = winH * 0.8,
                newW = newH / height * width;
            //针对大图
            if (newW > winW * 0.6) {
                newW = winW * 0.6;
                newH = newW / width * height;
            }
            //针对小图
            if (width < 0.2 * winW && height < 0.2 * winH) {
                newW = winW * 0.2;
                newH = newW / width * height;
            }
            $(".picZoom .content").css({width: newW + 20, height: newH + 95});
            $(".picZoom img").css({width: newW, height: newH});
        },
        next: function () {
            $(".picZoom").on("click", ".next", function (e) {
                e.stopPropagation();
                this.dispatch("goTo", this._currPic.currIndex + 1)
            }.bind(this))
            return this;
        },
        previous: function () {
            $(".picZoom").on("click", ".previous", function (e) {
                e.stopPropagation();
                this.dispatch("goTo", this._currPic.currIndex - 1)
            }.bind(this))
            return this;
        },
        imgEvent: function () {
            $(".picZoom").on("click", ".content", function (e) {
                e.stopPropagation();
            }.bind(this))
            return this;
        },
        triggerHide: function () {
            $(".picZoom").on("click", function () {
                this.hide(this._opts)
            }.bind(this))
            return this;
        },
        hide: function (opt) {
            var selector = "div[class='picZoom']";
            !!opt.id && (selector += "[id='" + opt.id + "']");
            $(selector).remove();
            $("body").removeClass('lay-on')
        }.bind(this)
    })

    global['Pp'] = global['Pp'] || Pp;
}($, window)
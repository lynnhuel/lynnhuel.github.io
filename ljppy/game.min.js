var cc = cc || {};
cc._tmp = cc._tmp || {};
cc._LogInfos = {};
_p = window;
_p = Object.prototype;
delete window._p;
cc.newElement = function (a) {
    return document.createElement(a)
};
cc._addEventListener = function (a, b, c, d) {
    a.addEventListener(b, c, d)
};
cc._isNodeJs = "undefined" !== typeof require && require("fs");
cc.each = function (a, b, c) {
    if (a)
        if (a instanceof Array)
            for (var d = 0, e = a.length; d < e && !1 !== b.call(c, a[d], d); d++); else
            for (d in a)
                if (!1 === b.call(c, a[d], d))break
};
cc.extend = function (a) {
    var b = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [];
    cc.each(b, function (b) {
        for (var d in b)b.hasOwnProperty(d) && (a[d] = b[d])
    });
    return a
};
cc.isFunction = function (a) {
    return "function" === typeof a
};
cc.isNumber = function (a) {
    return "number" === typeof a || "[object Number]" === Object.prototype.toString.call(a)
};
cc.isString = function (a) {
    return "string" === typeof a || "[object String]" === Object.prototype.toString.call(a)
};
cc.isArray = function (a) {
    return Array.isArray(a) || "object" === typeof a && "[object Array]" === Object.prototype.toString.call(a)
};
cc.isUndefined = function (a) {
    return "undefined" === typeof a
};
cc.isObject = function (a) {
    return "object" === typeof a && "[object Object]" === Object.prototype.toString.call(a)
};
cc.isCrossOrigin = function (a) {
    if (!a)return cc.log("invalid URL"), !1;
    var b = a.indexOf("://");
    if (-1 === b)return !1;
    b = a.indexOf("/", b + 3);
    return (-1 === b ? a : a.substring(0, b)) !== location.origin
};
cc.AsyncPool = function (a, b, c, d, e) {
    var f = this;
    f._srcObj = a;
    f._limit = b;
    f._pool = [];
    f._iterator = c;
    f._iteratorTarget = e;
    f._onEnd = d;
    f._onEndTarget = e;
    f._results = a instanceof Array ? [] : {};
    f._isErr = !1;
    cc.each(a, function (a, b) {
        f._pool.push({index: b, value: a})
    });
    f.size = f._pool.length;
    f.finishedSize = 0;
    f._workingSize = 0;
    f._limit = f._limit || f.size;
    f.onIterator = function (a, b) {
        f._iterator = a;
        f._iteratorTarget = b
    };
    f.onEnd = function (a, b) {
        f._onEnd = a;
        f._onEndTarget = b
    };
    f._handleItem = function () {
        var a = this;
        if (!(0 === a._pool.length || a._workingSize >= a._limit)) {
            var b = a._pool.shift(), c = b.value, d = b.index;
            a._workingSize++;
            a._iterator.call(a._iteratorTarget, c, d, function (b) {
                if (!a._isErr)
                    if (a.finishedSize++, a._workingSize--, b)a._isErr = !0, a._onEnd && a._onEnd.call(a._onEndTarget, b); else {
                        var c = Array.prototype.slice.call(arguments, 1);
                        a._results[this.index] = c[0];
                        a.finishedSize === a.size ? a._onEnd && a._onEnd.call(a._onEndTarget, null, a._results) : a._handleItem()
                    }
            }.bind(b), a)
        }
    };
    f.flow = function () {
        if (0 === this._pool.length)this._onEnd && this._onEnd.call(this._onEndTarget, null, []); else
            for (var a = 0; a < this._limit; a++)this._handleItem()
    }
};
cc.async = {
    series: function (a, b, c) {
        a = new cc.AsyncPool(a, 1, function (a, b, f) {
            a.call(c, f)
        }, b, c);
        a.flow();
        return a
    }, parallel: function (a, b, c) {
        a = new cc.AsyncPool(a, 0, function (a, b, f) {
            a.call(c, f)
        }, b, c);
        a.flow();
        return a
    }, waterfall: function (a, b, c) {
        var d = [], e = [null], f = new cc.AsyncPool(a, 1, function (b, f, k) {
            d.push(function (b) {
                d = Array.prototype.slice.call(arguments, 1);
                a.length - 1 === f && (e = e.concat(d));
                k.apply(null, arguments)
            });
            b.apply(c, d)
        }, function (a) {
            if (b) {
                if (a)return b.call(c, a);
                b.apply(c, e)
            }
        });
        f.flow();
        return f
    }, map: function (a, b, c, d) {
        var e = b;
        "object" === typeof b && (c = b.cb, d = b.iteratorTarget, e = b.iterator);
        a = new cc.AsyncPool(a, 0, e, c, d);
        a.flow();
        return a
    }, mapLimit: function (a, b, c, d, e) {
        a = new cc.AsyncPool(a, b, c, d, e);
        a.flow();
        return a
    }
};
cc.path = {
    join: function () {
        for (var a = arguments.length, b = "", c = 0; c < a; c++)b = (b + ("" === b ? "" : "/") + arguments[c]).replace(/(\/|\\\\)$/, "");
        return b
    }, extname: function (a) {
        return (a = /(\.[^\.\/\?\\]*)(\?.*)?$/.exec(a)) ? a[1] : null
    }, mainFileName: function (a) {
        if (a) {
            var b = a.lastIndexOf(".");
            if (-1 !== b)return a.substring(0, b)
        }
        return a
    }, basename: function (a, b) {
        var c = a.indexOf("?");
        0 < c && (a = a.substring(0, c));
        c = /(\/|\\\\)([^(\/|\\\\)]+)$/g.exec(a.replace(/(\/|\\\\)$/, ""));
        if (!c)return null;
        c = c[2];
        return b && a.substring(a.length -
            b.length).toLowerCase() === b.toLowerCase() ? c.substring(0, c.length - b.length) : c
    }, dirname: function (a) {
        return a.replace(/((.*)(\/|\\|\\\\))?(.*?\..*$)?/, "$2")
    }, changeExtname: function (a, b) {
        b = b || "";
        var c = a.indexOf("?"), d = "";
        0 < c && (d = a.substring(c), a = a.substring(0, c));
        c = a.lastIndexOf(".");
        return 0 > c ? a + b + d : a.substring(0, c) + b + d
    }, changeBasename: function (a, b, c) {
        if (0 === b.indexOf("."))return this.changeExtname(a, b);
        var d = a.indexOf("?"), e = "";
        c = c ? this.extname(a) : "";
        0 < d && (e = a.substring(d), a = a.substring(0, d));
        d = a.lastIndexOf("/");
        return a.substring(0, 0 >= d ? 0 : d + 1) + b + c + e
    }
};
cc.loader = {
    _jsCache: {},
    _register: {},
    _langPathCache: {},
    _aliases: {},
    resPath: "",
    audioPath: "",
    cache: {},
    getXMLHttpRequest: function () {
        return window.XMLHttpRequest ? new window.XMLHttpRequest : new ActiveXObject("MSXML2.XMLHTTP")
    },
    _getArgs4Js: function (a) {
        var b = a[0], c = a[1], d = a[2], e = ["", null, null];
        if (1 === a.length)e[1] = b instanceof Array ? b : [b]; else if (2 === a.length)"function" === typeof c ? (e[1] = b instanceof Array ? b : [b], e[2] = c) : (e[0] = b || "", e[1] = c instanceof Array ? c : [c]); else if (3 === a.length)e[0] = b || "", e[1] = c instanceof
        Array ? c : [c], e[2] = d; else throw"arguments error to load js!";
        return e
    },
    loadJs: function (a, b, c) {
        var d = this, e = d._jsCache, f = d._getArgs4Js(arguments), g = f[0], h = f[1], f = f[2];
        -1 < navigator.userAgent.indexOf("Trident/5") ? d._loadJs4Dependency(g, h, 0, f) : cc.async.map(h, function (a, b, c) {
            a = cc.path.join(g, a);
            if (e[a])return c(null);
            d._createScript(a, !1, c)
        }, f)
    },
    loadJsWithImg: function (a, b, c) {
        var d = this._loadJsImg(), e = this._getArgs4Js(arguments);
        this.loadJs(e[0], e[1], function (a) {
            if (a)throw a;
            d.parentNode.removeChild(d);
            if (e[2])e[2]()
        })
    },
    _createScript: function (a, b, c) {
        var d = document, e = cc.newElement("script");
        e.async = b;
        this._jsCache[a] = !0;
        cc.game.config.noCache && "string" === typeof a ? this._noCacheRex.test(a) ? e.src = a + "\x26_t\x3d" + (new Date - 0) : e.src = a + "?_t\x3d" + (new Date - 0) : e.src = a;
        cc._addEventListener(e, "load", function () {
            e.parentNode.removeChild(e);
            this.removeEventListener("load", arguments.callee, !1);
            c()
        }, !1);
        cc._addEventListener(e, "error", function () {
            e.parentNode.removeChild(e);
            c("Load " + a + " failed!")
        }, !1);
        d.body.appendChild(e)
    },
    _loadJs4Dependency: function (a, b, c, d) {
        if (c >= b.length)d && d(); else {
            var e = this;
            e._createScript(cc.path.join(a, b[c]), !1, function (f) {
                if (f)return d(f);
                e._loadJs4Dependency(a, b, c + 1, d)
            })
        }
    },
    _loadJsImg: function () {
        var a = document, b = a.getElementById("cocos2d_loadJsImg");
        if (!b) {
            b = cc.newElement("img");
            cc._loadingImage && (b.src = cc._loadingImage);
            a = a.getElementById(cc.game.config.id);
            a.style.backgroundColor = "white";
            a.parentNode.appendChild(b);
            var c = getComputedStyle ? getComputedStyle(a) : a.currentStyle;
            c || (c = {width: a.width, height: a.height});
            b.style.left = a.offsetLeft + (parseFloat(c.width) - b.width) / 2 + "px";
            b.style.top = a.offsetTop + (parseFloat(c.height) - b.height) / 2 + "px";
            b.style.position = "absolute"
        }
        return b
    },
    loadTxt: function (a, b) {
        if (cc._isNodeJs)require("fs").readFile(a, function (a, c) {
            a ? b(a) : b(null, c.toString())
        }); else {
            var c = this.getXMLHttpRequest(), d = "load " + a + " failed!";
            c.open("GET", a, !0);
            /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent) ? (c.setRequestHeader("Accept-Charset", "utf-8"), c.onreadystatechange = function () {
                4 === c.readyState && (200 === c.status ? b(null, c.responseText) : b(d))
            }) : (c.overrideMimeType && c.overrideMimeType("text/plain; charset\x3dutf-8"), c.onload = function () {
                4 === c.readyState && (200 === c.status ? b(null, c.responseText) : b(d))
            });
            c.send(null)
        }
    },
    _loadTxtSync: function (a) {
        if (cc._isNodeJs)return require("fs").readFileSync(a).toString();
        var b = this.getXMLHttpRequest();
        b.open("GET", a, !1);
        /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent) ? b.setRequestHeader("Accept-Charset", "utf-8") : b.overrideMimeType && b.overrideMimeType("text/plain; charset\x3dutf-8");
        b.send(null);
        return 4 === !b.readyState || 200 !== b.status ? null : b.responseText
    },
    loadCsb: function (a, b) {
        var c = new XMLHttpRequest;
        c.open("GET", a, !0);
        c.responseType = "arraybuffer";
        c.onload = function () {
            var d = c.response;
            d && (window.msg = d);
            4 === c.readyState && (200 === c.status ? b(null, c.response) : b("load " + a + " failed!"))
        };
        c.send(null)
    },
    loadJson: function (a, b) {
        this.loadTxt(a, function (c, d) {
            if (c)b(c); else {
                try {
                    var e = JSON.parse(d)
                } catch (f) {
                    throw"parse json [" + a + "] failed : " + f;
                }
                b(null, e)
            }
        })
    },
    _checkIsImageURL: function (a) {
        return null != /(\.png)|(\.jpg)|(\.bmp)|(\.jpeg)|(\.gif)/.exec(a)
    },
    loadImg: function (a, b, c) {
        var d = {isCrossOrigin: !0};
        void 0 !== c ? d.isCrossOrigin = null === b.isCrossOrigin ? d.isCrossOrigin : b.isCrossOrigin : void 0 !== b && (c = b);
        var e = this.getRes(a);
        if (e)return c && c(null, e), e;
        e = new Image;
        d.isCrossOrigin && "file://" !== location.origin && (e.crossOrigin = "Anonymous");
        var f = function () {
            this.removeEventListener("load", f, !1);
            this.removeEventListener("error", h, !1);
            cc.loader.cache[a] = e;
            c && c(null, e)
        }, g = this, h = function () {
            this.removeEventListener("error", h, !1);
            e.crossOrigin && "anonymous" === e.crossOrigin.toLowerCase() ? (d.isCrossOrigin = !1, g.release(a), cc.loader.loadImg(a, d, c)) : "function" === typeof c && c("load image failed")
        };
        cc._addEventListener(e, "load", f);
        cc._addEventListener(e, "error", h);
        e.src = a;
        return e
    },
    _loadResIterator: function (a, b, c) {
        var d = this, e = null, f = a.type;
        f ? (f = "." + f.toLowerCase(), e = a.src ? a.src : a.name + f) : (e = a, f = cc.path.extname(e));
        if (b = d.getRes(e))return c(null, b);
        b = null;
        f && (b = d._register[f.toLowerCase()]);
        if (!b)return cc.error("loader for [" +
            f + "] not exists!"), c();
        f = b.getBasePath ? b.getBasePath() : d.resPath;
        f = d.getUrl(f, e);
        cc.game.config.noCache && "string" === typeof f && (f = d._noCacheRex.test(f) ? f + ("\x26_t\x3d" + (new Date - 0)) : f + ("?_t\x3d" + (new Date - 0)));
        b.load(f, e, a, function (a, b) {
            a ? (cc.log(a), d.cache[e] = null, delete d.cache[e], c()) : (d.cache[e] = b, c(null, b))
        })
    },
    _noCacheRex: /\?/,
    getUrl: function (a, b) {
        var c = this._langPathCache, d = cc.path;
        if (void 0 !== a && void 0 === b) {
            b = a;
            var e = d.extname(b), e = e ? e.toLowerCase() : "";
            a = (e = this._register[e]) ? e.getBasePath ? e.getBasePath() : this.resPath : this.resPath
        }
        b = cc.path.join(a || "", b);
        if (b.match(/[\/(\\\\)]lang[\/(\\\\)]/i)) {
            if (c[b])return c[b];
            d = d.extname(b) || "";
            b = c[b] = b.substring(0, b.length - d.length) + "_" + cc.sys.language + d
        }
        return b
    },
    load: function (a, b, c) {
        var d = this, e = arguments.length;
        if (0 === e)throw"arguments error!";
        3 === e ? "function" === typeof b && (b = "function" === typeof c ? {trigger: b, cb: c} : {
            cb: b,
            cbTarget: c
        }) : 2 === e ? "function" === typeof b && (b = {cb: b}) : 1 === e && (b = {});
        a instanceof Array || (a = [a]);
        e = new cc.AsyncPool(a, 0, function (a, c, e, k) {
            d._loadResIterator(a, c, function (a) {
                if (a)return e(a);
                var c = Array.prototype.slice.call(arguments, 1);
                b.trigger && b.trigger.call(b.triggerTarget, c[0], k.size, k.finishedSize);
                e(null, c[0])
            })
        }, b.cb, b.cbTarget);
        e.flow();
        return e
    },
    _handleAliases: function (a, b) {
        var c = this._aliases, d = [], e;
        for (e in a) {
            var f = a[e];
            c[e] = f;
            d.push(f)
        }
        this.load(d, b)
    },
    loadAliases: function (a, b) {
        var c = this, d = c.getRes(a);
        d ? c._handleAliases(d.filenames, b) : c.load(a, function (a, d) {
            c._handleAliases(d[0].filenames, b)
        })
    },
    register: function (a, b) {
        if (a && b) {
            if ("string" === typeof a)return this._register[a.trim().toLowerCase()] = b;
            for (var c = 0, d = a.length; c < d; c++)this._register["." + a[c].trim().toLowerCase()] = b
        }
    },
    getRes: function (a) {
        return this.cache[a] || this.cache[this._aliases[a]]
    },
    release: function (a) {
        var b = this.cache, c = this._aliases;
        delete b[a];
        delete b[c[a]];
        delete c[a]
    },
    releaseAll: function () {
        var a = this.cache, b = this._aliases, c;
        for (c in a)delete a[c];
        for (c in b)delete b[c]
    }
};
cc.formatStr = function () {
    var a = arguments, b = a.length;
    if (1 > b)return "";
    var c = a[0], d = !0;
    "object" === typeof c && (d = !1);
    for (var e = 1; e < b; ++e) {
        var f = a[e];
        if (d)
            for (; ;) {
                var g = null;
                if ("number" === typeof f && (g = c.match(/(%d)|(%s)/))) {
                    c = c.replace(/(%d)|(%s)/, f);
                    break
                }
                c = (g = c.match(/%s/)) ? c.replace(/%s/, f) : c + ("    " + f);
                break
            } else c += "    " + f
    }
    return c
};
(function () {
    var a = window, b, c;
    cc.isUndefined(document.hidden) ? cc.isUndefined(document.mozHidden) ? cc.isUndefined(document.msHidden) ? cc.isUndefined(document.webkitHidden) || (b = "webkitHidden", c = "webkitvisibilitychange") : (b = "msHidden", c = "msvisibilitychange") : (b = "mozHidden", c = "mozvisibilitychange") : (b = "hidden", c = "visibilitychange");
    var d = function () {
        cc.eventManager && cc.game._eventHide && cc.eventManager.dispatchEvent(cc.game._eventHide)
    }, e = function () {
        cc.eventManager && cc.game._eventShow && cc.eventManager.dispatchEvent(cc.game._eventShow);
        cc.game._intervalId && (window.cancelAnimationFrame(cc.game._intervalId), cc.game._runMainLoop())
    };
    b ? cc._addEventListener(document, c, function () {
        document[b] ? d() : e()
    }, !1) : (cc._addEventListener(a, "blur", d, !1), cc._addEventListener(a, "focus", e, !1));
    -1 < navigator.userAgent.indexOf("MicroMessenger") && (a.onfocus = function () {
        e()
    });
    "onpageshow"in window && "onpagehide"in window && (cc._addEventListener(a, "pagehide", d, !1), cc._addEventListener(a, "pageshow", e, !1));
    c = a = null
})();
cc.log = cc.warn = cc.error = cc.assert = function () {
};
cc.create3DContext = function (a, b) {
    for (var c = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"], d = null, e = 0; e < c.length; ++e) {
        try {
            d = a.getContext(c[e], b)
        } catch (f) {
        }
        if (d)break
    }
    return d
};
cc._initSys = function (a, b) {
    cc._RENDER_TYPE_CANVAS = 0;
    cc._RENDER_TYPE_WEBGL = 1;
    cc.sys = {};
    var c = cc.sys;
    c.LANGUAGE_ENGLISH = "en";
    c.LANGUAGE_CHINESE = "zh";
    c.LANGUAGE_FRENCH = "fr";
    c.LANGUAGE_ITALIAN = "it";
    c.LANGUAGE_GERMAN = "de";
    c.LANGUAGE_SPANISH = "es";
    c.LANGUAGE_DUTCH = "du";
    c.LANGUAGE_RUSSIAN = "ru";
    c.LANGUAGE_KOREAN = "ko";
    c.LANGUAGE_JAPANESE = "ja";
    c.LANGUAGE_HUNGARIAN = "hu";
    c.LANGUAGE_PORTUGUESE = "pt";
    c.LANGUAGE_ARABIC = "ar";
    c.LANGUAGE_NORWEGIAN = "no";
    c.LANGUAGE_POLISH = "pl";
    c.OS_IOS = "iOS";
    c.OS_ANDROID = "Android";
    c.OS_WINDOWS = "Windows";
    c.OS_MARMALADE = "Marmalade";
    c.OS_LINUX = "Linux";
    c.OS_BADA = "Bada";
    c.OS_BLACKBERRY = "Blackberry";
    c.OS_OSX = "OS X";
    c.OS_WP8 = "WP8";
    c.OS_WINRT = "WINRT";
    c.OS_UNKNOWN = "Unknown";
    c.UNKNOWN = 0;
    c.IOS = 1;
    c.ANDROID = 2;
    c.WIN32 = 3;
    c.MARMALADE = 4;
    c.LINUX = 5;
    c.BADA = 6;
    c.BLACKBERRY = 7;
    c.MACOS = 8;
    c.NACL = 9;
    c.EMSCRIPTEN = 10;
    c.TIZEN = 11;
    c.QT5 = 12;
    c.WP8 = 13;
    c.WINRT = 14;
    c.MOBILE_BROWSER = 100;
    c.DESKTOP_BROWSER = 101;
    c.BROWSER_TYPE_WECHAT = "wechat";
    c.BROWSER_TYPE_ANDROID = "androidbrowser";
    c.BROWSER_TYPE_IE = "ie";
    c.BROWSER_TYPE_QQ = "qqbrowser";
    c.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
    c.BROWSER_TYPE_UC = "ucbrowser";
    c.BROWSER_TYPE_360 = "360browser";
    c.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
    c.BROWSER_TYPE_BAIDU = "baidubrowser";
    c.BROWSER_TYPE_MAXTHON = "maxthon";
    c.BROWSER_TYPE_OPERA = "opera";
    c.BROWSER_TYPE_OUPENG = "oupeng";
    c.BROWSER_TYPE_MIUI = "miuibrowser";
    c.BROWSER_TYPE_FIREFOX = "firefox";
    c.BROWSER_TYPE_SAFARI = "safari";
    c.BROWSER_TYPE_CHROME = "chrome";
    c.BROWSER_TYPE_LIEBAO = "liebao";
    c.BROWSER_TYPE_QZONE = "qzone";
    c.BROWSER_TYPE_SOUGOU = "sogou";
    c.BROWSER_TYPE_UNKNOWN = "unknown";
    c.isNative = !1;
    var d = window, e = d.navigator, f = document, g = f.documentElement, h = e.userAgent.toLowerCase();
    c.isMobile = -1 !== h.indexOf("mobile") || -1 !== h.indexOf("android");
    c.platform = c.isMobile ? c.MOBILE_BROWSER : c.DESKTOP_BROWSER;
    var k = e.language, k = (k = k ? k : e.browserLanguage) ? k.split("-")[0] : c.LANGUAGE_ENGLISH;
    c.language = k;
    var k = c.BROWSER_TYPE_UNKNOWN, m = h.match(/sogou|qzone|liebao|micromessenger|qqbrowser|ucbrowser|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|trident|oupeng|opera|miuibrowser|firefox/i) || h.match(/chrome|safari/i);
    m && 0 < m.length ? (k = m[0], "micromessenger" === k ? k = c.BROWSER_TYPE_WECHAT : "safari" === k && h.match(/android.*applewebkit/) ? k = c.BROWSER_TYPE_ANDROID : "trident" === k ? k = c.BROWSER_TYPE_IE : "360 aphone" === k && (k = c.BROWSER_TYPE_360)) : h.indexOf("iphone") && h.indexOf("mobile") && (k = "safari");
    c.browserType = k;
    k = h.match(/(iPad|iPhone|iPod)/i) ? !0 : !1;
    h = h.match(/android/i) || e.platform.match(/android/i) ? !0 : !1;
    m = c.OS_UNKNOWN;
    -1 !== e.appVersion.indexOf("Win") ? m = c.OS_WINDOWS : k ? m = c.OS_IOS : -1 !== e.appVersion.indexOf("Mac") ? m = c.OS_OSX : -1 !== e.appVersion.indexOf("X11") && -1 === e.appVersion.indexOf("Linux") ? m = c.OS_UNIX : h ? m = c.OS_ANDROID : -1 !== e.appVersion.indexOf("Linux") && (m = c.OS_LINUX);
    c.os = m;
    c._supportMultipleAudio = -1 < [c.BROWSER_TYPE_BAIDU, c.BROWSER_TYPE_OPERA, c.BROWSER_TYPE_FIREFOX, c.BROWSER_TYPE_CHROME, c.BROWSER_TYPE_BAIDU_APP, c.BROWSER_TYPE_SAFARI, c.BROWSER_TYPE_UC, c.BROWSER_TYPE_QQ, c.BROWSER_TYPE_MOBILE_QQ, c.BROWSER_TYPE_IE].indexOf(c.browserType);
    (function (a, c) {
        var e = c[b.renderMode] - 0;
        if (isNaN(e) || 2 < e || 0 > e)e = 0;
        var f = [a.OS_ANDROID], g = [], h = cc.newElement("canvas");
        cc._renderType = cc._RENDER_TYPE_CANVAS;
        cc._supportRender = !1;
        var k = d.WebGLRenderingContext;
        if (2 === e || 0 === e && k && -1 === f.indexOf(a.os) && -1 === g.indexOf(a.browserType))try {
            cc.create3DContext(h, {
                stencil: !0,
                preserveDrawingBuffer: !0
            }) && (cc._renderType = cc._RENDER_TYPE_WEBGL, cc._supportRender = !0)
        } catch (m) {
        }
        if (1 === e || 0 === e && !1 === cc._supportRender)try {
            h.getContext("2d"), cc._renderType = cc._RENDER_TYPE_CANVAS, cc._supportRender = !0
        } catch (n) {
        }
    })(c, a);
    c._canUseCanvasNewBlendModes = function () {
        var a = document.createElement("canvas");
        a.width = 1;
        a.height = 1;
        a = a.getContext("2d");
        a.fillStyle = "#000";
        a.fillRect(0, 0, 1, 1);
        a.globalCompositeOperation = "multiply";
        var b = document.createElement("canvas");
        b.width = 1;
        b.height = 1;
        var c = b.getContext("2d");
        c.fillStyle = "#fff";
        c.fillRect(0, 0, 1, 1);
        a.drawImage(b, 0, 0, 1, 1);
        return 0 === a.getImageData(0, 0, 1, 1).data[0]
    };
    c._supportCanvasNewBlendModes = c._canUseCanvasNewBlendModes();
    try {
        c._supportWebAudio = !!(d.AudioContext || d.webkitAudioContext || d.mozAudioContext)
    } catch (n) {
        c._supportWebAudio = !1
    }
    try {
        var p = c.localStorage = d.localStorage;
        p.setItem("storage", "");
        p.removeItem("storage");
        p = null
    } catch (s) {
        "SECURITY_ERR" !== s.name && "QuotaExceededError" !== s.name || cc.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option"), c.localStorage = function () {
        }
    }
    p = c.capabilities = {canvas: !0};
    cc._renderType === cc._RENDER_TYPE_WEBGL && (p.opengl = !0);
    if (void 0 !== g.ontouchstart || void 0 !== f.ontouchstart || e.msPointerEnabled)p.touches = !0;
    void 0 !== g.onmouseup && (p.mouse = !0);
    void 0 !== g.onkeyup &&
    (p.keyboard = !0);
    if (d.DeviceMotionEvent || d.DeviceOrientationEvent)p.accelerometer = !0;
    c.garbageCollect = function () {
    };
    c.dumpRoot = function () {
    };
    c.restartVM = function () {
    };
    c.cleanScript = function (a) {
    };
    c.isObjectValid = function (a) {
        return a ? !0 : !1
    };
    c.dump = function () {
        var a;
        a = "" + ("isMobile : " + this.isMobile + "\r\n");
        a += "language : " + this.language + "\r\n";
        a += "browserType : " + this.browserType + "\r\n";
        a += "capabilities : " + JSON.stringify(this.capabilities) + "\r\n";
        a += "os : " + this.os + "\r\n";
        a += "platform : " + this.platform + "\r\n";
        cc.log(a)
    };
    c.openURL = function (a) {
       
    }
};
cc.ORIENTATION_PORTRAIT = 0;
cc.ORIENTATION_PORTRAIT_UPSIDE_DOWN = 1;
cc.ORIENTATION_LANDSCAPE_LEFT = 2;
cc.ORIENTATION_LANDSCAPE_RIGHT = 3;
cc._drawingUtil = null;
cc._renderContext = null;
cc._canvas = null;
cc._gameDiv = null;
cc._rendererInitialized = !1;
cc._setupCalled = !1;
cc._setup = function (a, b, c) {
    if (!cc._setupCalled) {
        cc._setupCalled = !0;
        var d = window, e = cc.$(a) || cc.$("#" + a), f;
        cc.game._setAnimFrame();
        "CANVAS" === e.tagName ? (b = b || e.width, c = c || e.height, f = cc.container = cc.newElement("DIV"), a = cc._canvas = e, a.parentNode.insertBefore(f, a), a.appendTo(f), f.setAttribute("id", "Cocos2dGameContainer")) : ("DIV" !== e.tagName && cc.log("Warning: target element is not a DIV or CANVAS"), b = b || e.clientWidth, c = c || e.clientHeight, f = cc.container = e, a = cc._canvas = cc.$(cc.newElement("CANVAS")), e.appendChild(a));
        a.addClass("gameCanvas");
        a.setAttribute("width", b || 480);
        a.setAttribute("height", c || 320);
        a.setAttribute("tabindex", 99);
        a.style.outline = "none";
        e = f.style;
        e.width = (b || 480) + "px";
        e.height = (c || 320) + "px";
        e.margin = "0 auto";
        e.position = "relative";
        e.overflow = "hidden";
        f.top = "100%";
        cc._renderType === cc._RENDER_TYPE_WEBGL && (cc._renderContext = cc.webglContext = cc.create3DContext(a, {
            stencil: !0,
            preserveDrawingBuffer: !0,
            antialias: !cc.sys.isMobile,
            alpha: !1
        }));
        cc._renderContext ? (d.gl = cc._renderContext, cc._drawingUtil = new cc.DrawingPrimitiveWebGL(cc._renderContext), cc._rendererInitialized = !0, cc.textureCache._initializingRenderer(), cc.shaderCache._init()) : (cc._renderContext = new cc.CanvasContextWrapper(a.getContext("2d")), cc._drawingUtil = cc.DrawingPrimitiveCanvas ? new cc.DrawingPrimitiveCanvas(cc._renderContext) : null);
        cc._gameDiv = f;
        cc.log(cc.ENGINE_VERSION);
        cc._setContextMenuEnable(!1);
        cc.sys.isMobile && (b = cc.newElement("style"), b.type = "text/css", document.body.appendChild(b), b.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;-webkit-tap-highlight-color:rgba(0,0,0,0);}");
        cc.view = cc.EGLView._getInstance();
        cc.inputManager.registerSystemEvent(cc._canvas);
        cc.director = cc.Director._getInstance();
        cc.director.setOpenGLView && cc.director.setOpenGLView(cc.view);
        cc.winSize = cc.director.getWinSize();
        cc.saxParser = new cc.SAXParser;
        cc.plistParser = new cc.PlistParser
    }
};
cc._checkWebGLRenderMode = function () {
    if (cc._renderType !== cc._RENDER_TYPE_WEBGL)throw"This feature supports WebGL render mode only.";
};
cc._isContextMenuEnable = !1;
cc._setContextMenuEnable = function (a) {
    cc._isContextMenuEnable = a;
    cc._canvas.oncontextmenu = function () {
        if (!cc._isContextMenuEnable)return !1
    }
};
cc.game = {
    DEBUG_MODE_NONE: 0,
    DEBUG_MODE_INFO: 1,
    DEBUG_MODE_WARN: 2,
    DEBUG_MODE_ERROR: 3,
    DEBUG_MODE_INFO_FOR_WEB_PAGE: 4,
    DEBUG_MODE_WARN_FOR_WEB_PAGE: 5,
    DEBUG_MODE_ERROR_FOR_WEB_PAGE: 6,
    EVENT_HIDE: "game_on_hide",
    EVENT_SHOW: "game_on_show",
    _eventHide: null,
    _eventShow: null,
    _onBeforeStartArr: [],
    CONFIG_KEY: {
        engineDir: "engineDir",
        dependencies: "dependencies",
        debugMode: "debugMode",
        showFPS: "showFPS",
        frameRate: "frameRate",
        id: "id",
        renderMode: "renderMode",
        jsList: "jsList",
        classReleaseMode: "classReleaseMode"
    },
    _prepareCalled: !1,
    _prepared: !1,
    _paused: !0,
    _intervalId: null,
    _lastTime: null,
    _frameTime: null,
    config: null,
    onStart: null,
    onStop: null,
    setFrameRate: function (a) {
        this.config[this.CONFIG_KEY.frameRate] = a;
        this._intervalId && window.cancelAnimationFrame(this._intervalId);
        this._paused = !0;
        this._setAnimFrame();
        this._runMainLoop()
    },
    _setAnimFrame: function () {
        this._lastTime = new Date;
        this._frameTime = 1E3 / cc.game.config[cc.game.CONFIG_KEY.frameRate];
        cc.sys.os === cc.sys.OS_IOS && cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT || 60 !== cc.game.config[cc.game.CONFIG_KEY.frameRate] ? (window.requestAnimFrame = this._stTime, window.cancelAnimationFrame = this._ctTime) : (window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || this._stTime, window.cancelAnimationFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.oCancelAnimationFrame || this._ctTime)
    },
    _stTime: function (a) {
        var b = (new Date).getTime(), c = Math.max(0, cc.game._frameTime - (b - cc.game._lastTime)), d = window.setTimeout(function () {
            a()
        }, c);
        cc.game._lastTime = b + c;
        return d
    },
    _ctTime: function (a) {
        window.clearTimeout(a)
    },
    _runMainLoop: function () {
        var a = this, b, c = cc.director;
        c.setDisplayStats(a.config[a.CONFIG_KEY.showFPS]);
        b = function () {
            a._paused || (c.mainLoop(), a._intervalId && window.cancelAnimationFrame(a._intervalId), a._intervalId = window.requestAnimFrame(b))
        };
        window.requestAnimFrame(b);
        a._paused = !1
    },
    restart: function () {
        cc.director.popToSceneStackLevel(0);
        cc.audioEngine && cc.audioEngine.end();
        cc.game.onStart()
    },
    run: function (a) {
        var b = this, c = function () {
            a && (b.config[b.CONFIG_KEY.id] = a);
            b._prepareCalled || b.prepare(function () {
                b._prepared = !0
            });
            cc._supportRender && (b._checkPrepare = setInterval(function () {
                b._prepared && (cc._setup(b.config[b.CONFIG_KEY.id]), b._runMainLoop(), b._eventHide = b._eventHide || new cc.EventCustom(b.EVENT_HIDE), b._eventHide.setUserData(b), b._eventShow = b._eventShow || new cc.EventCustom(b.EVENT_SHOW), b._eventShow.setUserData(b), b.onStart(), clearInterval(b._checkPrepare))
            }, 10))
        };
        document.body ? c() : cc._addEventListener(window, "load", function () {
            this.removeEventListener("load", arguments.callee, !1);
            c()
        }, !1)
    },
    _initConfig: function () {
        var a = this.CONFIG_KEY, b = function (b) {
            b[a.engineDir] = b[a.engineDir] || "frameworks/cocos2d-html5";
            null == b[a.debugMode] && (b[a.debugMode] = 0);
            b[a.frameRate] = b[a.frameRate] || 60;
            null == b[a.renderMode] && (b[a.renderMode] = 1);
            return b
        };
        if (document.ccConfig)this.config = b(document.ccConfig); else try {
            for (var c = document.getElementsByTagName("script"), d = 0; d < c.length; d++) {
                var e = c[d].getAttribute("cocos");
                if ("" === e || e)break
            }
            var f, g, h;
            if (d < c.length) {
                if (f = c[d].src)h = /(.*)\//.exec(f)[0], cc.loader.resPath = h, f = cc.path.join(h, "project.json");
                g = cc.loader._loadTxtSync(f)
            }
            g || (g = cc.loader._loadTxtSync("project.json"));
            var k = JSON.parse(g);
            this.config = b(k || {})
        } catch (m) {
            cc.log("Failed to read or parse project.json"), this.config = b({})
        }
        cc._initSys(this.config, a)
    },
    _jsAddedCache: {},
    _getJsListOfModule: function (a, b, c) {
        var d = this._jsAddedCache;
        if (d[b])return null;
        c = c || "";
        var e = [], f = a[b];
        if (!f)throw"can not find module [" + b + "]";
        b = cc.path;
        for (var g = 0, h = f.length; g < h; g++) {
            var k = f[g];
            if (!d[k]) {
                var m = b.extname(k);
                m ? ".js" === m.toLowerCase() && e.push(b.join(c, k)) : (m = this._getJsListOfModule(a, k, c)) && (e = e.concat(m));
                d[k] = 1
            }
        }
        return e
    },
    prepare: function (a) {
        var b = this, c = b.config, d = b.CONFIG_KEY, e = c[d.engineDir], f = cc.loader;
        if (!cc._supportRender)throw"The renderer doesn't support the renderMode " +
        c[d.renderMode];
        b._prepareCalled = !0;
        var g = c[d.jsList] || [];
        cc.Class ? f.loadJsWithImg("", g, function (c) {
            if (c)throw c;
            b._prepared = !0;
            a && a()
        }) : (d = cc.path.join(e, "moduleConfig.json"), f.loadJson(d, function (d, f) {
            if (d)throw d;
            var m = c.modules || [], n = f.module, p = [];
            cc._renderType === cc._RENDER_TYPE_WEBGL ? m.splice(0, 0, "shaders") : 0 > m.indexOf("core") && m.splice(0, 0, "core");
            for (var s = 0, r = m.length; s < r; s++) {
                var u = b._getJsListOfModule(n, m[s], e);
                u && (p = p.concat(u))
            }
            p = p.concat(g);
            cc.loader.loadJsWithImg(p, function (c) {
                if (c)throw c;
                b._prepared = !0;
                a && a()
            })
        }))
    }
};
cc.game._initConfig();
Function.prototype.bind = Function.prototype.bind || function (a) {
        if (!cc.isFunction(this))throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        var b = Array.prototype.slice.call(arguments, 1), c = this, d = function () {
        }, e = function () {
            return c.apply(this instanceof d && a ? this : a, b.concat(Array.prototype.slice.call(arguments)))
        };
        d.prototype = this.prototype;
        e.prototype = new d;
        return e
    };
cc._LogInfos = {
    ActionManager_addAction: "cc.ActionManager.addAction(): action must be non-null",
    ActionManager_removeAction: "cocos2d: removeAction: Target not found",
    ActionManager_removeActionByTag: "cc.ActionManager.removeActionByTag(): an invalid tag",
    ActionManager_removeActionByTag_2: "cc.ActionManager.removeActionByTag(): target must be non-null",
    ActionManager_getActionByTag: "cc.ActionManager.getActionByTag(): an invalid tag",
    ActionManager_getActionByTag_2: "cocos2d : getActionByTag(tag \x3d %s): Action not found",
    configuration_dumpInfo: "cocos2d: **** WARNING **** CC_ENABLE_PROFILERS is defined. Disable it when you finish profiling (from ccConfig.js)",
    configuration_loadConfigFile: "Expected 'data' dict, but not found. Config file: %s",
    configuration_loadConfigFile_2: "Please load the resource first : %s",
    Director_resume: "cocos2d: Director: Error in gettimeofday",
    Director_setProjection: "cocos2d: Director: unrecognized projection",
    Director_popToSceneStackLevel: "cocos2d: Director: unrecognized projection",
    Director_popToSceneStackLevel_2: "cocos2d: Director: Error in gettimeofday",
    Director_popScene: "running scene should not null",
    Director_pushScene: "the scene should not null",
    arrayVerifyType: "element type is wrong!",
    Scheduler_scheduleCallbackForTarget: "CCSheduler#scheduleCallback. Callback already scheduled. Updating interval from:%s to %s",
    Scheduler_scheduleCallbackForTarget_2: "cc.scheduler.scheduleCallbackForTarget(): callback_fn should be non-null.",
    Scheduler_scheduleCallbackForTarget_3: "cc.scheduler.scheduleCallbackForTarget(): target should be non-null.",
    Scheduler_pauseTarget: "cc.Scheduler.pauseTarget():target should be non-null",
    Scheduler_resumeTarget: "cc.Scheduler.resumeTarget():target should be non-null",
    Scheduler_isTargetPaused: "cc.Scheduler.isTargetPaused():target should be non-null",
    Node_getZOrder: "getZOrder is deprecated. Please use getLocalZOrder instead.",
    Node_setZOrder: "setZOrder is deprecated. Please use setLocalZOrder instead.",
    Node_getRotation: "RotationX !\x3d RotationY. Don't know which one to return",
    Node_getScale: "ScaleX !\x3d ScaleY. Don't know which one to return",
    Node_addChild: "An Node can't be added as a child of itself.",
    Node_addChild_2: "child already added. It can't be added again",
    Node_addChild_3: "child must be non-null",
    Node_removeFromParentAndCleanup: "removeFromParentAndCleanup is deprecated. Use removeFromParent instead",
    Node_boundingBox: "boundingBox is deprecated. Use getBoundingBox instead",
    Node_removeChildByTag: "argument tag is an invalid tag",
    Node_removeChildByTag_2: "cocos2d: removeChildByTag(tag \x3d %s): child not found!",
    Node_removeAllChildrenWithCleanup: "removeAllChildrenWithCleanup is deprecated. Use removeAllChildren instead",
    Node_stopActionByTag: "cc.Node.stopActionBy(): argument tag an invalid tag",
    Node_getActionByTag: "cc.Node.getActionByTag(): argument tag is an invalid tag",
    Node_resumeSchedulerAndActions: "resumeSchedulerAndActions is deprecated, please use resume instead.",
    Node_pauseSchedulerAndActions: "pauseSchedulerAndActions is deprecated, please use pause instead.",
    Node__arrayMakeObjectsPerformSelector: "Unknown callback function",
    Node_reorderChild: "child must be non-null",
    Node_runAction: "cc.Node.runAction(): action must be non-null",
    Node_schedule: "callback function must be non-null",
    Node_schedule_2: "interval must be positive",
    Node_initWithTexture: "cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.",
    AtlasNode_updateAtlasValues: "cc.AtlasNode.updateAtlasValues(): Shall be overridden in subclasses",
    AtlasNode_initWithTileFile: "",
    AtlasNode__initWithTexture: "cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.",
    _EventListenerKeyboard_checkAvailable: "cc._EventListenerKeyboard.checkAvailable(): Invalid EventListenerKeyboard!",
    _EventListenerTouchOneByOne_checkAvailable: "cc._EventListenerTouchOneByOne.checkAvailable(): Invalid EventListenerTouchOneByOne!",
    _EventListenerTouchAllAtOnce_checkAvailable: "cc._EventListenerTouchAllAtOnce.checkAvailable(): Invalid EventListenerTouchAllAtOnce!",
    _EventListenerAcceleration_checkAvailable: "cc._EventListenerAcceleration.checkAvailable(): _onAccelerationEvent must be non-nil",
    EventListener_create: "Invalid parameter.",
    __getListenerID: "Don't call this method if the event is for touch.",
    eventManager__forceAddEventListener: "Invalid scene graph priority!",
    eventManager_addListener: "0 priority is forbidden for fixed priority since it's used for scene graph based priority.",
    eventManager_removeListeners: "Invalid listener type!",
    eventManager_setPriority: "Can't set fixed priority with scene graph based listener.",
    eventManager_addListener_2: "Invalid parameters.",
    eventManager_addListener_3: "listener must be a cc.EventListener object when adding a fixed priority listener",
    eventManager_addListener_4: "The listener has been registered, please don't register it again.",
    LayerMultiplex_initWithLayers: "parameters should not be ending with null in Javascript",
    LayerMultiplex_switchTo: "Invalid index in MultiplexLayer switchTo message",
    LayerMultiplex_switchToAndReleaseMe: "Invalid index in MultiplexLayer switchTo message",
    LayerMultiplex_addLayer: "cc.Layer.addLayer(): layer should be non-null",
    EGLView_setDesignResolutionSize: "Resolution not valid",
    EGLView_setDesignResolutionSize_2: "should set resolutionPolicy",
    inputManager_handleTouchesBegin: "The touches is more than MAX_TOUCHES, nUnusedIndex \x3d %s",
    swap: "cc.swap is being modified from original macro, please check usage",
    checkGLErrorDebug: "WebGL error %s",
    animationCache__addAnimationsWithDictionary: "cocos2d: cc.AnimationCache: No animations were found in provided dictionary.",
    animationCache__addAnimationsWithDictionary_2: "cc.AnimationCache. Invalid animation format",
    animationCache_addAnimations: "cc.AnimationCache.addAnimations(): File could not be found",
    animationCache__parseVersion1: "cocos2d: cc.AnimationCache: Animation '%s' found in dictionary without any frames - cannot add to animation cache.",
    animationCache__parseVersion1_2: "cocos2d: cc.AnimationCache: Animation '%s' refers to frame '%s' which is not currently in the cc.SpriteFrameCache. This frame will not be added to the animation.",
    animationCache__parseVersion1_3: "cocos2d: cc.AnimationCache: None of the frames for animation '%s' were found in the cc.SpriteFrameCache. Animation is not being added to the Animation Cache.",
    animationCache__parseVersion1_4: "cocos2d: cc.AnimationCache: An animation in your dictionary refers to a frame which is not in the cc.SpriteFrameCache. Some or all of the frames for the animation '%s' may be missing.",
    animationCache__parseVersion2: "cocos2d: CCAnimationCache: Animation '%s' found in dictionary without any frames - cannot add to animation cache.",
    animationCache__parseVersion2_2: "cocos2d: cc.AnimationCache: Animation '%s' refers to frame '%s' which is not currently in the cc.SpriteFrameCache. This frame will not be added to the animation.",
    animationCache_addAnimations_2: "cc.AnimationCache.addAnimations(): Invalid texture file name",
    Sprite_reorderChild: "cc.Sprite.reorderChild(): this child is not in children list",
    Sprite_ignoreAnchorPointForPosition: "cc.Sprite.ignoreAnchorPointForPosition(): it is invalid in cc.Sprite when using SpriteBatchNode",
    Sprite_setDisplayFrameWithAnimationName: "cc.Sprite.setDisplayFrameWithAnimationName(): Frame not found",
    Sprite_setDisplayFrameWithAnimationName_2: "cc.Sprite.setDisplayFrameWithAnimationName(): Invalid frame index",
    Sprite_setDisplayFrame: "setDisplayFrame is deprecated, please use setSpriteFrame instead.",
    Sprite__updateBlendFunc: "cc.Sprite._updateBlendFunc(): _updateBlendFunc doesn't work when the sprite is rendered using a cc.CCSpriteBatchNode",
    Sprite_initWithSpriteFrame: "cc.Sprite.initWithSpriteFrame(): spriteFrame should be non-null",
    Sprite_initWithSpriteFrameName: "cc.Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null",
    Sprite_initWithSpriteFrameName1: " is null, please check.",
    Sprite_initWithFile: "cc.Sprite.initWithFile(): filename should be non-null",
    Sprite_setDisplayFrameWithAnimationName_3: "cc.Sprite.setDisplayFrameWithAnimationName(): animationName must be non-null",
    Sprite_reorderChild_2: "cc.Sprite.reorderChild(): child should be non-null",
    Sprite_addChild: "cc.Sprite.addChild(): cc.Sprite only supports cc.Sprites as children when using cc.SpriteBatchNode",
    Sprite_addChild_2: "cc.Sprite.addChild(): cc.Sprite only supports a sprite using same texture as children when using cc.SpriteBatchNode",
    Sprite_addChild_3: "cc.Sprite.addChild(): child should be non-null",
    Sprite_setTexture: "cc.Sprite.texture setter: Batched sprites should use the same texture as the batchnode",
    Sprite_updateQuadFromSprite: "cc.SpriteBatchNode.updateQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
    Sprite_insertQuadFromSprite: "cc.SpriteBatchNode.insertQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
    Sprite_addChild_4: "cc.SpriteBatchNode.addChild(): cc.SpriteBatchNode only supports cc.Sprites as children",
    Sprite_addChild_5: "cc.SpriteBatchNode.addChild(): cc.Sprite is not using the same texture",
    Sprite_initWithTexture: "Sprite.initWithTexture(): Argument must be non-nil ",
    Sprite_setSpriteFrame: "Invalid spriteFrameName",
    Sprite_setTexture_2: "Invalid argument: cc.Sprite.texture setter expects a CCTexture2D.",
    Sprite_updateQuadFromSprite_2: "cc.SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null",
    Sprite_insertQuadFromSprite_2: "cc.SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null",
    SpriteBatchNode_addSpriteWithoutQuad: "cc.SpriteBatchNode.addQuadFromSprite(): SpriteBatchNode only supports cc.Sprites as children",
    SpriteBatchNode_increaseAtlasCapacity: "cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from %s to %s.",
    SpriteBatchNode_increaseAtlasCapacity_2: "cocos2d: WARNING: Not enough memory to resize the atlas",
    SpriteBatchNode_reorderChild: "cc.SpriteBatchNode.addChild(): Child doesn't belong to Sprite",
    SpriteBatchNode_removeChild: "cc.SpriteBatchNode.addChild(): sprite batch node should contain the child",
    SpriteBatchNode_addSpriteWithoutQuad_2: "cc.SpriteBatchNode.addQuadFromSprite(): child should be non-null",
    SpriteBatchNode_reorderChild_2: "cc.SpriteBatchNode.addChild(): child should be non-null",
    spriteFrameCache__getFrameConfig: "cocos2d: WARNING: originalWidth/Height not found on the cc.SpriteFrame. AnchorPoint won't work as expected. Regenrate the .plist",
    spriteFrameCache_addSpriteFrames: "cocos2d: WARNING: an alias with name %s already exists",
    spriteFrameCache__checkConflict: "cocos2d: WARNING: Sprite frame: %s has already been added by another source, please fix name conflit",
    spriteFrameCache_getSpriteFrame: "cocos2d: cc.SpriteFrameCahce: Frame %s not found",
    spriteFrameCache__getFrameConfig_2: "Please load the resource first : %s",
    spriteFrameCache_addSpriteFrames_2: "cc.SpriteFrameCache.addSpriteFrames(): plist should be non-null",
    spriteFrameCache_addSpriteFrames_3: "Argument must be non-nil",
    CCSpriteBatchNode_updateQuadFromSprite: "cc.SpriteBatchNode.updateQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
    CCSpriteBatchNode_insertQuadFromSprite: "cc.SpriteBatchNode.insertQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
    CCSpriteBatchNode_addChild: "cc.SpriteBatchNode.addChild(): cc.SpriteBatchNode only supports cc.Sprites as children",
    CCSpriteBatchNode_initWithTexture: "Sprite.initWithTexture(): Argument must be non-nil ",
    CCSpriteBatchNode_addChild_2: "cc.Sprite.addChild(): child should be non-null",
    CCSpriteBatchNode_setSpriteFrame: "Invalid spriteFrameName",
    CCSpriteBatchNode_setTexture: "Invalid argument: cc.Sprite texture setter expects a CCTexture2D.",
    CCSpriteBatchNode_updateQuadFromSprite_2: "cc.SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null",
    CCSpriteBatchNode_insertQuadFromSprite_2: "cc.SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null",
    CCSpriteBatchNode_addChild_3: "cc.SpriteBatchNode.addChild(): child should be non-null",
    TextureAtlas_initWithFile: "cocos2d: Could not open file: %s",
    TextureAtlas_insertQuad: "cc.TextureAtlas.insertQuad(): invalid totalQuads",
    TextureAtlas_initWithTexture: "cc.TextureAtlas.initWithTexture():texture should be non-null",
    TextureAtlas_updateQuad: "cc.TextureAtlas.updateQuad(): quad should be non-null",
    TextureAtlas_updateQuad_2: "cc.TextureAtlas.updateQuad(): Invalid index",
    TextureAtlas_insertQuad_2: "cc.TextureAtlas.insertQuad(): Invalid index",
    TextureAtlas_insertQuads: "cc.TextureAtlas.insertQuad(): Invalid index + amount",
    TextureAtlas_insertQuadFromIndex: "cc.TextureAtlas.insertQuadFromIndex(): Invalid newIndex",
    TextureAtlas_insertQuadFromIndex_2: "cc.TextureAtlas.insertQuadFromIndex(): Invalid fromIndex",
    TextureAtlas_removeQuadAtIndex: "cc.TextureAtlas.removeQuadAtIndex(): Invalid index",
    TextureAtlas_removeQuadsAtIndex: "cc.TextureAtlas.removeQuadsAtIndex(): index + amount out of bounds",
    TextureAtlas_moveQuadsFromIndex: "cc.TextureAtlas.moveQuadsFromIndex(): move is out of bounds",
    TextureAtlas_moveQuadsFromIndex_2: "cc.TextureAtlas.moveQuadsFromIndex(): Invalid newIndex",
    TextureAtlas_moveQuadsFromIndex_3: "cc.TextureAtlas.moveQuadsFromIndex(): Invalid oldIndex",
    textureCache_addPVRTCImage: "TextureCache:addPVRTCImage does not support on HTML5",
    textureCache_addETCImage: "TextureCache:addPVRTCImage does not support on HTML5",
    textureCache_textureForKey: "textureForKey is deprecated. Please use getTextureForKey instead.",
    textureCache_addPVRImage: "addPVRImage does not support on HTML5",
    textureCache_addUIImage: "cocos2d: Couldn't add UIImage in TextureCache",
    textureCache_dumpCachedTextureInfo: "cocos2d: '%s' id\x3d%s %s x %s",
    textureCache_dumpCachedTextureInfo_2: "cocos2d: '%s' id\x3d HTMLCanvasElement %s x %s",
    textureCache_dumpCachedTextureInfo_3: "cocos2d: TextureCache dumpDebugInfo: %s textures, HTMLCanvasElement for %s KB (%s MB)",
    textureCache_addUIImage_2: "cc.Texture.addUIImage(): image should be non-null",
    Texture2D_initWithETCFile: "initWithETCFile does not support on HTML5",
    Texture2D_initWithPVRFile: "initWithPVRFile does not support on HTML5",
    Texture2D_initWithPVRTCData: "initWithPVRTCData does not support on HTML5",
    Texture2D_addImage: "cc.Texture.addImage(): path should be non-null",
    Texture2D_initWithImage: "cocos2d: cc.Texture2D. Can't create Texture. UIImage is nil",
    Texture2D_initWithImage_2: "cocos2d: WARNING: Image (%s x %s) is bigger than the supported %s x %s",
    Texture2D_initWithString: "initWithString isn't supported on cocos2d-html5",
    Texture2D_initWithETCFile_2: "initWithETCFile does not support on HTML5",
    Texture2D_initWithPVRFile_2: "initWithPVRFile does not support on HTML5",
    Texture2D_initWithPVRTCData_2: "initWithPVRTCData does not support on HTML5",
    Texture2D_bitsPerPixelForFormat: "bitsPerPixelForFormat: %s, cannot give useful result, it's a illegal pixel format",
    Texture2D__initPremultipliedATextureWithImage: "cocos2d: cc.Texture2D: Using RGB565 texture since image has no alpha",
    Texture2D_addImage_2: "cc.Texture.addImage(): path should be non-null",
    Texture2D_initWithData: "NSInternalInconsistencyException",
    MissingFile: "Missing file: %s",
    radiansToDegress: "cc.radiansToDegress() should be called cc.radiansToDegrees()",
    RectWidth: "Rect width exceeds maximum margin: %s",
    RectHeight: "Rect height exceeds maximum margin: %s",
    EventManager__updateListeners: "If program goes here, there should be event in dispatch.",
    EventManager__updateListeners_2: "_inDispatch should be 1 here."
};
cc._logToWebPage = function (a) {
    if (cc._canvas) {
        var b = cc._logList, c = document;
        if (!b) {
            var d = c.createElement("Div"), b = d.style;
            d.setAttribute("id", "logInfoDiv");
            cc._canvas.parentNode.appendChild(d);
            d.setAttribute("width", "200");
            d.setAttribute("height", cc._canvas.height);
            b.zIndex = "99999";
            b.position = "absolute";
            b.top = "0";
            b.left = "0";
            b = cc._logList = c.createElement("textarea");
            c = b.style;
            b.setAttribute("rows", "20");
            b.setAttribute("cols", "30");
            b.setAttribute("disabled", !0);
            d.appendChild(b);
            c.backgroundColor = "transparent";
            c.borderBottom = "1px solid #cccccc";
            c.borderRightWidth = "0px";
            c.borderLeftWidth = "0px";
            c.borderTopWidth = "0px";
            c.borderTopStyle = "none";
            c.borderRightStyle = "none";
            c.borderLeftStyle = "none";
            c.padding = "0px";
            c.margin = 0
        }
        b.value = b.value + a + "\r\n";
        b.scrollTop = b.scrollHeight
    }
};
cc._formatString = function (a) {
    if (cc.isObject(a))try {
        return JSON.stringify(a)
    } catch (b) {
        return ""
    } else return a
};
cc._initDebugSetting = function (a) {
    var b = cc.game;
    if (a !== b.DEBUG_MODE_NONE) {
        var c;
        a > b.DEBUG_MODE_ERROR ? (c = cc._logToWebPage.bind(cc), cc.error = function () {
            c("ERROR :  " + cc.formatStr.apply(cc, arguments))
        }, cc.assert = function (a, b) {
            if (!a && b) {
                for (var f = 2; f < arguments.length; f++)b = b.replace(/(%s)|(%d)/, cc._formatString(arguments[f]));
                c("Assert: " + b)
            }
        }, a !== b.DEBUG_MODE_ERROR_FOR_WEB_PAGE && (cc.warn = function () {
            c("WARN :  " + cc.formatStr.apply(cc, arguments))
        }), a === b.DEBUG_MODE_INFO_FOR_WEB_PAGE && (cc.log = function () {
            c(cc.formatStr.apply(cc, arguments))
        })) : console && console.log.apply && (cc.error = function () {
            return console.error.apply(console, arguments)
        }, cc.assert = function (a, b) {
            if (!a && b) {
                for (var c = 2; c < arguments.length; c++)b = b.replace(/(%s)|(%d)/, cc._formatString(arguments[c]));
                throw b;
            }
        }, a !== b.DEBUG_MODE_ERROR && (cc.warn = function () {
            return console.warn.apply(console, arguments)
        }), a === b.DEBUG_MODE_INFO && (cc.log = function () {
            return console.log.apply(console, arguments)
        }))
    }
};
cc._initDebugSetting(cc.game.config[cc.game.CONFIG_KEY.debugMode]);
cc.loader.loadBinary = function (a, b) {
    var c = this, d = this.getXMLHttpRequest(), e = "load " + a + " failed!";
    d.open("GET", a, !0);
    /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent) ? (d.setRequestHeader("Accept-Charset", "x-user-defined"), d.onreadystatechange = function () {
        if (4 === d.readyState && 200 === d.status) {
            var a = cc._convertResponseBodyToText(d.responseBody);
            b(null, c._str2Uint8Array(a))
        } else b(e)
    }) : (d.overrideMimeType && d.overrideMimeType("text/plain; charset\x3dx-user-defined"), d.onload = function () {
        4 === d.readyState && 200 === d.status ? b(null, c._str2Uint8Array(d.responseText)) : b(e)
    });
    d.send(null)
};
cc.loader._str2Uint8Array = function (a) {
    if (!a)return null;
    for (var b = new Uint8Array(a.length), c = 0; c < a.length; c++)b[c] = a.charCodeAt(c) & 255;
    return b
};
cc.loader.loadBinarySync = function (a) {
    var b = this.getXMLHttpRequest(), c = "load " + a + " failed!";
    b.open("GET", a, !1);
    a = null;
    if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
        b.setRequestHeader("Accept-Charset", "x-user-defined");
        b.send(null);
        if (200 !== b.status)return cc.log(c), null;
        (b = cc._convertResponseBodyToText(b.responseBody)) && (a = this._str2Uint8Array(b))
    } else {
        b.overrideMimeType && b.overrideMimeType("text/plain; charset\x3dx-user-defined");
        b.send(null);
        if (200 !== b.status)return cc.log(c), null;
        a = this._str2Uint8Array(b.responseText)
    }
    return a
};
var Uint8Array = Uint8Array || Array;
if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
    var IEBinaryToArray_ByteStr_Script = '\x3c!-- IEBinaryToArray_ByteStr --\x3e\r\nFunction IEBinaryToArray_ByteStr(Binary)\r\n   IEBinaryToArray_ByteStr \x3d CStr(Binary)\r\nEnd Function\r\nFunction IEBinaryToArray_ByteStr_Last(Binary)\r\n   Dim lastIndex\r\n   lastIndex \x3d LenB(Binary)\r\n   if lastIndex mod 2 Then\r\n       IEBinaryToArray_ByteStr_Last \x3d Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n   Else\r\n       IEBinaryToArray_ByteStr_Last \x3d ""\r\n   End If\r\nEnd Function\r\n', myVBScript = cc.newElement("script");
    myVBScript.type = "text/vbscript";
    myVBScript.textContent = IEBinaryToArray_ByteStr_Script;
    document.body.appendChild(myVBScript);
    cc._convertResponseBodyToText = function (a) {
        for (var b = {}, c = 0; 256 > c; c++)
            for (var d = 0; 256 > d; d++)b[String.fromCharCode(c + 256 * d)] = String.fromCharCode(c) + String.fromCharCode(d);
        c = IEBinaryToArray_ByteStr(a);
        a = IEBinaryToArray_ByteStr_Last(a);
        return c.replace(/[\s\S]/g, function (a) {
                return b[a]
            }) + a
    }
}
;
cc = cc || {};
cc._loadingImage = "data:image/gif;base64,R0lGODlhEAAQALMNAD8/P7+/vyoqKlVVVX9/fxUVFUBAQGBgYMDAwC8vL5CQkP///wAAAP///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAANACwAAAAAEAAQAAAEO5DJSau9OOvNex0IMnDIsiCkiW6g6BmKYlBFkhSUEgQKlQCARG6nEBwOgl+QApMdCIRD7YZ5RjlGpCUCACH5BAUAAA0ALAAAAgAOAA4AAAQ6kLGB0JA4M7QW0hrngRllkYyhKAYqKUGguAws0ypLS8JxCLQDgXAIDg+FRKIA6v0SAECCBpXSkstMBAAh+QQFAAANACwAAAAACgAQAAAEOJDJORAac6K1kDSKYmydpASBUl0mqmRfaGTCcQgwcxDEke+9XO2WkxQSiUIuAQAkls0n7JgsWq8RACH5BAUAAA0ALAAAAAAOAA4AAAQ6kMlplDIzTxWC0oxwHALnDQgySAdBHNWFLAvCukc215JIZihVIZEogDIJACBxnCSXTcmwGK1ar1hrBAAh+QQFAAANACwAAAAAEAAKAAAEN5DJKc4RM+tDyNFTkSQF5xmKYmQJACTVpQSBwrpJNteZSGYoFWjIGCAQA2IGsVgglBOmEyoxIiMAIfkEBQAADQAsAgAAAA4ADgAABDmQSVZSKjPPBEDSGucJxyGA1XUQxAFma/tOpDlnhqIYN6MEAUXvF+zldrMBAjHoIRYLhBMqvSmZkggAIfkEBQAADQAsBgAAAAoAEAAABDeQyUmrnSWlYhMASfeFVbZdjHAcgnUQxOHCcqWylKEohqUEAYVkgEAMfkEJYrFA6HhKJsJCNFoiACH5BAUAAA0ALAIAAgAOAA4AAAQ3kMlJq704611SKloCAEk4lln3DQgyUMJxCBKyLAh1EMRR3wiDQmHY9SQslyIQUMRmlmVTIyRaIgA7";
cc._fpsImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAAgCAYAAAD9qabkAAAKQ2lDQ1BJQ0MgcHJvZmlsZQAAeNqdU3dYk/cWPt/3ZQ9WQtjwsZdsgQAiI6wIyBBZohCSAGGEEBJAxYWIClYUFRGcSFXEgtUKSJ2I4qAouGdBiohai1VcOO4f3Ke1fXrv7e371/u855zn/M55zw+AERImkeaiagA5UoU8Otgfj09IxMm9gAIVSOAEIBDmy8JnBcUAAPADeXh+dLA//AGvbwACAHDVLiQSx+H/g7pQJlcAIJEA4CIS5wsBkFIAyC5UyBQAyBgAsFOzZAoAlAAAbHl8QiIAqg0A7PRJPgUA2KmT3BcA2KIcqQgAjQEAmShHJAJAuwBgVYFSLALAwgCgrEAiLgTArgGAWbYyRwKAvQUAdo5YkA9AYACAmUIszAAgOAIAQx4TzQMgTAOgMNK/4KlfcIW4SAEAwMuVzZdL0jMUuJXQGnfy8ODiIeLCbLFCYRcpEGYJ5CKcl5sjE0jnA0zODAAAGvnRwf44P5Dn5uTh5mbnbO/0xaL+a/BvIj4h8d/+vIwCBAAQTs/v2l/l5dYDcMcBsHW/a6lbANpWAGjf+V0z2wmgWgrQevmLeTj8QB6eoVDIPB0cCgsL7SViob0w44s+/zPhb+CLfvb8QB7+23rwAHGaQJmtwKOD/XFhbnauUo7nywRCMW735yP+x4V//Y4p0eI0sVwsFYrxWIm4UCJNx3m5UpFEIcmV4hLpfzLxH5b9CZN3DQCshk/ATrYHtctswH7uAQKLDljSdgBAfvMtjBoLkQAQZzQyefcAAJO/+Y9AKwEAzZek4wAAvOgYXKiUF0zGCAAARKCBKrBBBwzBFKzADpzBHbzAFwJhBkRADCTAPBBCBuSAHAqhGJZBGVTAOtgEtbADGqARmuEQtMExOA3n4BJcgetwFwZgGJ7CGLyGCQRByAgTYSE6iBFijtgizggXmY4EImFINJKApCDpiBRRIsXIcqQCqUJqkV1II/ItchQ5jVxA+pDbyCAyivyKvEcxlIGyUQPUAnVAuagfGorGoHPRdDQPXYCWomvRGrQePYC2oqfRS+h1dAB9io5jgNExDmaM2WFcjIdFYIlYGibHFmPlWDVWjzVjHVg3dhUbwJ5h7wgkAouAE+wIXoQQwmyCkJBHWExYQ6gl7CO0EroIVwmDhDHCJyKTqE+0JXoS+cR4YjqxkFhGrCbuIR4hniVeJw4TX5NIJA7JkuROCiElkDJJC0lrSNtILaRTpD7SEGmcTCbrkG3J3uQIsoCsIJeRt5APkE+S+8nD5LcUOsWI4kwJoiRSpJQSSjVlP+UEpZ8yQpmgqlHNqZ7UCKqIOp9aSW2gdlAvU4epEzR1miXNmxZDy6Qto9XQmmlnafdoL+l0ugndgx5Fl9CX0mvoB+nn6YP0dwwNhg2Dx0hiKBlrGXsZpxi3GS+ZTKYF05eZyFQw1zIbmWeYD5hvVVgq9ip8FZHKEpU6lVaVfpXnqlRVc1U/1XmqC1SrVQ+rXlZ9pkZVs1DjqQnUFqvVqR1Vu6k2rs5Sd1KPUM9RX6O+X/2C+mMNsoaFRqCGSKNUY7fGGY0hFsYyZfFYQtZyVgPrLGuYTWJbsvnsTHYF+xt2L3tMU0NzqmasZpFmneZxzQEOxrHg8DnZnErOIc4NznstAy0/LbHWaq1mrX6tN9p62r7aYu1y7Rbt69rvdXCdQJ0snfU6bTr3dQm6NrpRuoW623XP6j7TY+t56Qn1yvUO6d3RR/Vt9KP1F+rv1u/RHzcwNAg2kBlsMThj8MyQY+hrmGm40fCE4agRy2i6kcRoo9FJoye4Ju6HZ+M1eBc+ZqxvHGKsNN5l3Gs8YWJpMtukxKTF5L4pzZRrmma60bTTdMzMyCzcrNisyeyOOdWca55hvtm82/yNhaVFnMVKizaLx5balnzLBZZNlvesmFY+VnlW9VbXrEnWXOss623WV2xQG1ebDJs6m8u2qK2brcR2m23fFOIUjynSKfVTbtox7PzsCuya7AbtOfZh9iX2bfbPHcwcEh3WO3Q7fHJ0dcx2bHC866ThNMOpxKnD6VdnG2ehc53zNRemS5DLEpd2lxdTbaeKp26fesuV5RruutK10/Wjm7ub3K3ZbdTdzD3Ffav7TS6bG8ldwz3vQfTw91jicczjnaebp8LzkOcvXnZeWV77vR5Ps5wmntYwbcjbxFvgvct7YDo+PWX6zukDPsY+Ap96n4e+pr4i3z2+I37Wfpl+B/ye+zv6y/2P+L/hefIW8U4FYAHBAeUBvYEagbMDawMfBJkEpQc1BY0FuwYvDD4VQgwJDVkfcpNvwBfyG/ljM9xnLJrRFcoInRVaG/owzCZMHtYRjobPCN8Qfm+m+UzpzLYIiOBHbIi4H2kZmRf5fRQpKjKqLupRtFN0cXT3LNas5Fn7Z72O8Y+pjLk722q2cnZnrGpsUmxj7Ju4gLiquIF4h/hF8ZcSdBMkCe2J5MTYxD2J43MC52yaM5zkmlSWdGOu5dyiuRfm6c7Lnnc8WTVZkHw4hZgSl7I/5YMgQlAvGE/lp25NHRPyhJuFT0W+oo2iUbG3uEo8kuadVpX2ON07fUP6aIZPRnXGMwlPUit5kRmSuSPzTVZE1t6sz9lx2S05lJyUnKNSDWmWtCvXMLcot09mKyuTDeR55m3KG5OHyvfkI/lz89sVbIVM0aO0Uq5QDhZML6greFsYW3i4SL1IWtQz32b+6vkjC4IWfL2QsFC4sLPYuHhZ8eAiv0W7FiOLUxd3LjFdUrpkeGnw0n3LaMuylv1Q4lhSVfJqedzyjlKD0qWlQyuCVzSVqZTJy26u9Fq5YxVhlWRV72qX1VtWfyoXlV+scKyorviwRrjm4ldOX9V89Xlt2treSrfK7etI66Trbqz3Wb+vSr1qQdXQhvANrRvxjeUbX21K3nShemr1js20zcrNAzVhNe1bzLas2/KhNqP2ep1/XctW/a2rt77ZJtrWv913e/MOgx0VO97vlOy8tSt4V2u9RX31btLugt2PGmIbur/mft24R3dPxZ6Pe6V7B/ZF7+tqdG9s3K+/v7IJbVI2jR5IOnDlm4Bv2pvtmne1cFoqDsJB5cEn36Z8e+NQ6KHOw9zDzd+Zf7f1COtIeSvSOr91rC2jbaA9ob3v6IyjnR1eHUe+t/9+7zHjY3XHNY9XnqCdKD3x+eSCk+OnZKeenU4/PdSZ3Hn3TPyZa11RXb1nQ8+ePxd07ky3X/fJ897nj13wvHD0Ivdi2yW3S609rj1HfnD94UivW2/rZffL7Vc8rnT0Tes70e/Tf/pqwNVz1/jXLl2feb3vxuwbt24m3Ry4Jbr1+Hb27Rd3Cu5M3F16j3iv/L7a/eoH+g/qf7T+sWXAbeD4YMBgz8NZD+8OCYee/pT/04fh0kfMR9UjRiONj50fHxsNGr3yZM6T4aeypxPPyn5W/3nrc6vn3/3i+0vPWPzY8Av5i8+/rnmp83Lvq6mvOscjxx+8znk98ab8rc7bfe+477rfx70fmSj8QP5Q89H6Y8en0E/3Pud8/vwv94Tz+4A5JREAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfcAgcQLxxUBNp/AAAQZ0lEQVR42u2be3QVVZbGv1N17829eRLyIKAEOiISEtPhJTJAYuyBDmhWjAEx4iAGBhxA4wABbVAMWUAeykMCM+HRTcBRWkNH2l5moS0LCCrQTkYeQWBQSCAIgYRXEpKbW/XNH5zS4noR7faPEeu31l0h4dSpvc+t/Z199jkFWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY/H9D/MR9qfKnLj/00U71aqfJn9+HCkCR/Wk36ddsgyJ/1wF4fkDfqqm9/gPsUeTnVr6a2xlQfnxdI7zs0W7irzD17Ytb2WT7EeNv/r4ox1O3Quf2QP2pgt9utwfout4FQE8AVBSlnaRmfvAURQkg2RlAbwB9AThlW5L0GaiKojhJhgOIBqDa7XaPrusdPtr5kQwF0BVAAoBIABRCKDd5aFUhRDAAw57eAOwAhKIoupft3zoqhB1AqLwuHIBut9uFt02qqvqRDJR2dAEQJj/BAOjn56dqmma+xiaECAEQAWAggLsB6A6HQ2iaZggBhBAqgEAAnQB0kzaEmT4hAITT6VQ8Ho/HJAKKECJQtr8LwD1y/A1/vcdfEUIEyfZ9AcQbYvZ942Px88L2UwlJR0dH0EMPPbRj5syZPUeNGrXR7Xb/641xIwJ1XY9NSUlZm52dfW+XLl1w8uRJzJ8//+OGhoYJqqqe1TSt1Wsm9NN1PSIqKmr12rVrR5WUlHy1bdu2AQCumWc3IYRD1/UwVVXnFRQUTIuNjUVzczN2797dWFJSkq8oymZd15sAGAEnFEUJ1nX9nzIzM1dnZmZGh4SE4OTJk5g5c+Zf29vbp9pstrMej6fVOyhIhgAYU1hY+B+hoaGoqKg4XVlZea+XTULTNFdCQsLGiRMnPuR2u3UhBOV9eeDAAWXTpk095DUe6WsoyRE5OTlr0tLSAux2O/bs2cO5c+e+pijKUpIXSHaQVAGkvPLKK++6XK4OksJLCFlXV2cvKSlJBFAjhU+x2WwhHo9nUHp6+urMzMy7wsLCUF9fjxdffPHjxsbGiTab7WuPx9NiEutOuq4PyMjI+M+srKyYqKgoHD58GDNmzNjq8XhyVFU9b/q+LH7hBAEYu3PnTlZVVRFAGgCX6f/tAHoOHDjwa0p27txp/JO9e/f+QM7cipw9nfL3kQBKt2zZQpJ87rnn6mQmoHilw2EACs+cOUOSrK+vZ1NTE0nyo48+IoBpxswoBcMJ4Ndjx471kOTFixe5d+9ekqTH42H//v13A4jyzpAURfEH0H/OnDnthu1z5sw558MmFUCPWbNmnaMP3nrrLZoyDmP8Hl68eDFJ8siRI9/Yc+zYMQKYKdtAztrTrl27xptRXV1NAKMAOAyBBBA/Y8aMdpLs6Ojgxx9//E37+++//29yvFXppwvAwMcee8xjtDHsuXLlCqOjo//ia3wsfpkoALqFhoZuIckJEyackimm3dQmEMDUmpoakmRISMhhAHOHDx/eQJIbN24kgKEyMAHAFRMTs2XXrl1saWkhSZ0kp0+ffhrAr3wEW/S8efOukORLL72kA1gKYMPWrVtJkk899dRJAHeYrgsEsIQkjx8/TgDvAPjd448/3kaSb7zxBmUa7vC6z53BwcFbSHL9+vU6Sc6aNes8gF5ewWAH0PfVV18lSQL4DMBGIcQ6AKtcLleBFC2jXtFt8ODBe0iyoqKCAJYByC8qKmJDQwOzsrK+MAmqo1OnTveHhoa+GRkZ+XZkZOSWiIiIvzgcjk9mzpypkWRmZuZpmbYbGV4AgPnNzc1sa2sjgN0A5iQmJtaSZHl5OQHcb/K3s81mW0uSTU1NBFAFYFbfvn1Pk+Tbb79NAA8IIVzW42/hByA+Pz/fLR/2ZXIda05NI/z9/TeR5J49ewhgqlxTrtI0jY2NjQQw3zTLuWJiYjaUlJToS5Ys6fjkk080kwDEeAmADcA9GzZsIElGRUW9CyAWwLApU6Y0kOSKFSsog9QICGdERMTGsrIyZmVlEcC9AB4IDw/fTpLbtm0jgN94CUAnAJmVlZVcs2aNZ/LkyRdJcvbs2b4EwAkgZfPmzTxw4AABFAN4BkC6vFeUSewcAO5duXIlSTIhIaEawGMAxgKYAmAGgCS73e5vrKVk/yGythANYEhCQsIhkly+fDkBpKqqGmL6DgIALDKN/3yZpVWQZGVlJQE8aPI3KiMjo5okV61aRQAjAPQBMPfIkSN0u90EUCBtsPiFEwpgbn19PdetW2fM5N4zQ9ekpKQqkty0aRMBpMjiWM6JEydIkoqirJUFJ6iq6pAPVy8A6cZMehMBUACEuVyuFwG8HBwcPEIWx367ZMkSjSQXLVrUJouTRorrkAHdA8BdQogsAOsKCwtJkmPGjDkvMw2bDDo/ADEjRoz4XylyFbm5uY0mAbjLyyZ/AOOrq6tZVlbWsWDBgo69e/eyoqKCgwcPPg4gSQaoIRbp27dvN7KF+tLSUr28vJwFBQXtMpvpYRIM7+wrAkDeqVOnePbsWQIoNKfzpiXPg8uXLydJJicnNwF4f+nSpW6STEtLq5fjYwhk1wkTJtSQ5Ouvv04AqTKj+N2xY8dIkgEBAW/Ie1v8wncRegwZMmQvSfbr12+3Ua33WqPfOWbMmP0kWVpaSgCDZAqcfejQIWNZsEGKgvnh9gfQb9myZd8nAEJVVZtMkUNk8CcNHTq0liR1XWdYWNhmH1mJIme80OnTp18x1rp5eXkEsNJms92Fb7e/IgEsvHz5Mp999tkmAI/l5uZeMC0B7vEqqAYAyL106RJJsra2lpWVld+sucePH38ZQG+5NncBeOrgwYMkqbe3t/Po0aOsra011wAWyl0H7x0JJ4DE+fPnu0kyPT29DsDdUrBuyNKEEAkAdpw/f/6GeoEM8GUmfwEgPCIiopwkGxsbabPZPgOw6L777vvm4p49e26VGYjFLxUhhD+ApLKyMp44ccIoVnXybgbgzkcfffRzklyzZg0BDJYCMMmoCwQFBXkLgLGWvvcWAgBToSsKwNPTp09vMR7UuLi4rwH0lgU8c/Db5ezbeeTIkRWzZ8++aMxu+fn5BPCADBwHgP4LFy701NXVEUAJgAnPP/98kyxMNgHo53A4zH77BQQETMvPz7+Um5vbBuAlAFMSExPPmdbVL0qh8Acw8fDhw5SCchVAEYAVb775JknyhRdeaJYztHfxMwLAaqNwCGC2FArv8x0hAHKNLGPKlCme5OTk/Zs3bzb7O0wKiiG8KXl5ed8IxenTp0mSR48e1UmyW7duWywBuD2xyQcgFECgoih+8H1gyJgZV5Lkyy+/3CbTRIePtl2HDBmyw1QBHyGDdXZdXR1JUghRKkXBjOMHCoBdpr0L3nvvPZLkF198wejo6O0A4lVVDTb74HQ6AwD8Wq7Jh8rgGgDgQ13XjVR8qaxJuADMbmlpYXl5uV5UVNRWUFDgfv/993Vj/ZydnU1c37eHXML4S3viAcQqitJD2l104cIFY8lTKsXSBWBMVVWVcd9yed2A1NTUQ6Zl00CvLMMOoHdubm6zFIlWOf5+PsY/Kj09vdrU11QAwwGsv3jxIk21m2DZr10I0RXAuAcffPBgaWkpV69eTYfDcdiwUxY0w6xw+flX8L1xApjevXv3lREREaW6rofB93aPDUDQpEmTMgHgtddeqwBwEd/utZvpqK6uPgEAcXFxkA94NwB9unfvjrNnz4LklwDcf08iIqv66Zs2bXrl4YcfxooVKxAbG7uqrq5uAYA2TdOEqqpGYIi2tjbl6aeffu/YsWPv5uTk7JaC1wHg4Pnz542MwoVvTx+21dbWYvjw4WLixIl+2dnZ9lGjRgmSTE1NRUpKCkwFTGiaxtTU1OXTpk3707Bhw/6g67pDipnT4biuj7qut+Lbk3Vf1tTUXI9qu91Pjq1QFEUBgJaWFgBo8yGOQ8eNGxcAAOvXr/8QwBUfYygAKL169eoCABcuXACAWtn2hOGv0+kMNO1KiPDw8F4A4rZv3/7R1KlTR0+bNu1ht9u9r1+/fqitrQXJgwDarRC6/QjPzs4+QJIffPCB9/aQmSAA43ft2mW0e1QGoi8CAPyLsZccExNTC2BlRkbGRdOyYJCP2csBIN6UAZzCd7cBbQCijYp/dXU1ExMTz6SmptaMHj36f9LS0vYlJCRsl6mxIWSdu3fv/g5J7t+/nwC2AShMTk6+SJKff/45AWRLYbD7+fndAeDf5BJnLoCCyZMnt5JkdnZ2C4B/F0KEm1Pu+Pj4rST55ZdfEsBWAK+mpaVdMo3raDn7KwDuSEpK+m+S3LBhAwG8DuCtHTt2UBbpjgC408vvcFVV15HkuXPnjMp+p5uMf0RcXNyHJNnQ0EBVVfcCWBQXF3fG+Jv0yxABPwB5LS0tRmFxN4BlTzzxxGWSXLx4sS5F3GGFy+1Hp5SUlJq6ujoWFxdTpsZ2H+0iIyMj/0iSWVlZX5mr5jfJFroPGzasxlhTnjp1iiTZ3NxMl8tlrCd9pfa9SkpKSJI5OTmnZOageLUZZqxvfVFWVkZcPwdgNwnSCKPqb17jkmR8fPzfZMDZ5CRsFBmNI7h95s2b1yhT7/MAYmStwCx4vy0uLqa3v5qmEcCfvSr1QQAeXb16NY3Cm3HQ55133iGAp+SxZTNhKSkpfzUddkrFjYevzAQCeGjp0qXfsYckY2NjTwD4leGDLCL2HTdunNtoY+zWSHFcIHdsFCtcfuZ1vO9Eqs3m7/F47sb1k2qX/f3997W2tl7BjWfpBYDOzzzzzIVJkyZh0KBBCwEsB3AJvl9AETabLcDj8dwRFRW1ctasWb8JCgpSzp07d62wsPC/Wltb8xRFadR1/ZqPXYbgAQMGbI2Pjw/+6quv9ldVVT0r01ezuPRJSUn5Y9euXXVd11WzDaqq6kePHm3+7LPPRgO4KlNuxWazhXo8nuTk5OSXMjIyEl0uFxoaGtqKior+dPXq1VdUVT0jj7r68ieoT58+vx8yZMjdx48fP1JVVTVF9m20VW02WyfZf97YsWPjXS4X6urqWvPy8jYCWCyEuEDS8FdVFKWzruv//OSTTy5OTk7uqWkaPv3007qysrJ8RVH+LI8ym8/rB3Tu3HnRI488knLo0KG2ffv2ZQI4C98vP6mqqoZqmpaclpa2cOTIkX39/f3R0NDQUVxc/G5TU9PLqqrWa5rWLH1QVFUN0TStX1JSUvH48eP7BwYG4uDBg1cKCgpeBbBe2u+2Qug2EwD5N5sMPuNtMe8XP4TT6Qxoa2sbIGeXvUKIK7d4IISiKC5d1wPljOfA9bPwzYqiXNV13dd6Uqiq6qdpml2mpe02m63d4/G4vcTF5fF47LJf71nJA6BZVVW3pmntuPHlmAD5wk6Q9NnbHp9vHaqq6tA0zU/64PZhk1FfCZB9G/23ALiqKEqzD39tpvbGUqoFwFUhRLP3yzpCCDtJpxyXDulfG27+pqRR3DXsUWVd4Yq0x/taVQjhIhksC8L+ABpM9ljBf5sKwI8pIBr75L5E4vvu+UNeG/a+hv+AL7yFH8qPtOfHjtOP6V/Bja8D6z/B2Nys/1u9Xv33tLf4GfF/LC4GCJwByWIAAAAASUVORK5CYII\x3d";
cc._loaderImage = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAlAAD/4QMpaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjAtYzA2MCA2MS4xMzQ3NzcsIDIwMTAvMDIvMTItMTc6MzI6MDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjM4MDBEMDY2QTU1MjExRTFBQTAzQjEzMUNFNzMxRkQwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM4MDBEMDY1QTU1MjExRTFBQTAzQjEzMUNFNzMxRkQwIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzUgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU2RTk0OEM4OERCNDExRTE5NEUyRkE3M0M3QkE1NTlEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU2RTk0OEM5OERCNDExRTE5NEUyRkE3M0M3QkE1NTlEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQADQkJCQoJDQoKDRMMCwwTFhENDREWGhUVFhUVGhkUFhUVFhQZGR0fIB8dGScnKionJzk4ODg5QEBAQEBAQEBAQAEODAwOEA4RDw8RFA4RDhQVERISERUfFRUXFRUfKB0ZGRkZHSgjJiAgICYjLCwoKCwsNzc1NzdAQEBAQEBAQEBA/8AAEQgAyACgAwEiAAIRAQMRAf/EALAAAAEFAQEAAAAAAAAAAAAAAAQAAgMFBgcBAQEAAwEBAAAAAAAAAAAAAAAAAQMEAgUQAAIBAgIEBwoLBgQGAwAAAAECAwAEEQUhMRIGQVFxsTITFGGBwdEiQlKSMzWRoeFicqKyI1NzFYJjJDQWB9KjVCbxwkNkJWXik3QRAAIBAgMFBQcDBQEAAAAAAAABAhEDIRIEMUFRcTJhwVIUBZGhsSJyEzOB0ULhYpIjUxX/2gAMAwEAAhEDEQA/AMJSpUqAVKlXuFAeUq9wpUB5XuFe4V6ooDzZHDox0CnGMinzwl7Z8NajaHeoO3vmTBZBtp9YUIqTEV5ROxHKnWRnaU8VRMhFBUjpV7hSoSeUq9pUB5Sr2lhQHlKvcK8oBV7hSFSRrtaKAZs07YNPM1pG2xJIAw1jSeandry/8X4m8VCKkWwaWwam7Xl/4v1W8VLtmX/i/VbxUoKkWwakSM407tmX/i/VbxUmzGwjQsjdY41IARie/U0IbZO0kNtCXnOCkEBeFu4KI3Bs7DNb27ya+jDx3kJeEnpJJEcQVbWDsk17u5urd591ucZkWhym2Vnd9RkCDEpFxDRpbw0bunu5mlp2De2FMLYXOD2wB2xbOeraUcYGJ72mlSUiqzzdzMd3Z3mixltA2yzcK/NlHM1DQyRXce1HocdNOEfJXZ88y9ZojOqhiBszIRiHQ8Y4cK5TvHuzLljHNMqxNoDjLFraHHnjPxcNCGVbxEUzYNTx5jZSxhpW6qTzlwJ+DCvO2Zf+L9VvFSgqyHYNLYNTdssPxfibxUu15f8Ai/VPiqCakOwa82DU/a8v/F+JvFTDdWPBL8R8VKCvYRYV5UzoMAy6QdIIqI0B4KJtxiRQwou16QoGUkntH5Tz0RbZbmF2hktraSVBo2lUkY8tDye0flPPXTslVUyiyVRsjqUOA4yMT8dW2ram2m6UVTNq9S7EIyUVJydMTn/6DnP+im9Wl+g5z/opvVrpteEhQWY4AaSTwAVf5WPiZh/9S5/zj7zltzlmYWkfWXNvJDGTgGcYDHirR7i7mSbwXParsFMrgb7w6jKw/wCmnc9I14kF3vpvCljbMyWMOJL4aEiB8qU/ObUK7HYWVrl1pFZWiCOCBQqKOLjPGTrNZZqKbUXVHq2nNwTuJRk1VpbgXN8s7Rk5ym0UQQzhIG2NAjhxHWbI+gCBVjBBFbwxwQqEiiUJGg1BVGAFe7dV28WYLYZFmF2Th1UD7JGjymGyn1iK5OyzIBGB1HgrLZhamzumQAGJwSqnSCh1q3GOCodxt4cxurdcpzuN4cyhiWaF5Bg09udUmnWw1H/jV9nFuJ7Quo+8h8peThFA+047vduyMtk7fYqTl07YFdfUufMPzT5p71UdtlmYXaGS2t3mQHAsgxANdadYJopLe4QS2867EsZ4QfCNYrCFbjdDPmgkYyWFxgVf04ifJf6ScNdRUW1XBb6FU5TjF5EpSSrGu/s5lN+g5z/opvVpfoOc/wCim9WtdHnatvObJXDW7xLGhB8nrPaY9/HCr+tEdPCVaSeDoYLnqF63lzW4/PFSW3ecxbI84VSzWUwUaSdg0DXXK5nvAipnd6qgKvWnQO7pri9ZUEmm3Vl2j1kr8pRlFRyquBNZjGxQ/S56Y1S2fu9OVueon11Szahoou06QoQUXadIVCD2FJJ7R+U89dMydv8Axdn+TH9muZye0flPPXQstlK5Tbka1gUjlC1q0vVLkeb6r+O3Tx9xcY1nt8c0NrZCyiOE1108NYjGv1joo7Js1jzKyScYLIvkzL6LDwHXVJksH9Sb49dKNq0tj1jA6uriOCL+02FWX7iVtZX1/AzaHTyeoauKn2MX9W79zebiZCuR5MjSrhfXuEtwTrUeZH+yNfdrRNcxI6IzhXlJEak6WIGJ2Rw4ChWnChndtlVBLMdQA0k1gbXNMzzDfDLs6mjaPKppJbWwJ1bOwwxw43OnHh71YT3DpfWUJmFlb5jHHDdeXBHIsrRea5TSqvxqG04cNN62vetoCS4tre5mgnkGE9q+3DKOkuI2WX6LDQRRHWDh1UCtwj7QRg2wdl8Djgw1qe7XvW0BQ3kfZ7mSLgU+T9E6RVbnuVrnWVSWqj+Lt8ZbRuHEdKPkYVcZ2MJY5fSGyeVar45+rkWQHAqccalPE5km1htWK5nK4Wnt5FuUBUwOMG4nGkA/BXUrW4S6torlOjMgcd/xVn7rLo7zKs0uEjCNeSvdwoBhgsZxX1l2j36k3Lu+uyprdj5Vs5A+i/lD48a0aaVJOPi7jB6lbzWozpjB48pf1NDXNN4vfl7+Z4BXS65pvF78vfzPAK71XTHmZ/S/yT+jvJ7L3fHytz1E+upbL+Qj5W56jfXWRnsIYKLtekKEFGWvSFQgyjk9o/Keet3YthlMP/5x9msJJ7R+U89biyb/AMXEv7gD6tadL1T+kwepRrC39ZkLDMbiwMvUHRPG0bjlGg8ore/23sxBldxfMPLupNhT8yL/AORNZbdzJ484scytxgLqJY5LZj6Q2sV5G1Vud1mjjyG0ij0NEGSZToKyhjtqw4waztuiXA3qKTbSxltfGhbZlE95ZtZqxVbgiOZhrER9ph3Svk9+pJILZ4Y4DGBFCUMKjRsGPobPFhUfW0NJmljE2xJcIrcI2vFUEln1lRXd6lrazXT9GCNpD+yNqoI7mOVduNw6nzlOIoPOUa6yye1XXcbMR5GdQ3xY0BSbj31/FcTQZirJ+q431q7anbHCTZ72Bw7lbPrKBMcBWNNgbMBBh+bsjBdni0VJ1lARZs6yWiupxCuMDy6KpS2IwOo6DTr3Mre3e5tZZVUM4ZBjqOOJoWO4jkXajcOOMHGgDISvWIrdAkKR80+TzVl908bPPL3LzxOuHdifxVfiTAg92qI/w+/8gGgSyN/mR7XPVlp0lF/3L3mbVKtu5Hjbk/8AHE2Fc03i9+Xv5ngFdKNc13i9+Xv5ngFaNV0x5nn+l/kn9HeEWXu+PlbnqJ9dS2Xu9OVueon11kZ7CGCjLXpCgxRlr0hUIPYUcntH5Tz1s8vb+Bt1/dqPirGSe0flPPWusG/g4Py15q06XqlyMWvVYQ+ruI9xJOqzO9hOto/sP8tbGOFIrmWeM7IuMDMnAXXQJOUjQeOsJk0nY96ip0CYunrjaHx1t+srPJUbXBm2LrFPikwTOb+T+VhbZxGMrDXp83x1QSy2tucJpUjPETp+Cn5/ftaRvKvtp3Kx48HG3erHMzOxZiWZtLMdJNQSbbL71Vk6yynViOkqnEEfOWtPbXi3EQkGg6mXiNckjeSJxJGxR10qw0GtxuxmvbImD4CZMFlA4fRfv0BqesqqzTMZNMEDbIHtHH2QeCiZJSqMQdOGiue53mz3czQwsRbIcNHnkec3c4qAMuriz68gTIToxwOOnlp0MjxMJYW741Gs3RVldtbygE/dMcHX/moDaxTiWNZB53B3arb8/wC+4SOF4sf/AKxU9kcBsfOGHfoUHtG/RbzY5Die5HHhXdvavqiZ9Q8Jdlq4/gbKua7xe/L38zwCuhpf2Uk/Zo50kmwJKIdogDjw1VzzeL35e/meAVp1LTgqY4nn+mRauzqmqwrjzCLL3fHytz1E+upLL+Qj5W56jfXWRnroYKLtekKEFF2vSFQg9hSSe0flPPWosm/hIfoLzVl5PaPynnrRWb/w0X0F5q06XqlyM2sVYx5gmbFre/t71NY2T+0h8VbSO5SWNJUOKSAMp7jDGspmMPaLRlXS6eWve1/FRO7WYdbZm1Y/eW/R7qHxHRXGojlm3ulid6aVbaW+OALvgCLq2Hm9WxHKWqjhj6xsK1e8dm15l4niG1LZkswGsxtrPeOmsvayBJA1VItlWjptLuTdPMo7LtjRDq9naK4+WF9IrUW7BaHOljGqVHB7w2hzVoZt87d8vaNYSLl02CcRsDEbJbj71Uu7UBkvJ7/D7q2QoDxySaAO8MTXdxRVMpRp5XZOWdF/ms7R5XdyKfKWJsO/5PhrG5XlNxmEywW6bTnTxAAcJNbGSMXkM1pjgbiNo1PziPJ+Os7u7m/6ReM00ZOgxSpqYYHT3wRXMKN4ll9zUG4bQfNshu8sZVuEA2hirA4qe/VOwwrVbzbww5mI44UKRRYkbWG0S3JWctbd7u5WFfOOLHiUdJqmaipfLsIsObhWe001lMkMVvJNjhghIALMcBxCs7fxXQmkupx1bXDswGPlaTidVaEyKNXkoo4eBV+Sq7L7Vs9zcBgeyQ4GQ/MB1crmoim2orezqcowTuSeEY48jQ7oZX2PLzdyLhNd6RjrEY6I7+uspvH78vfzPAK6UAAAFGAGgAcArmu8Xvy9/M8ArTfio24RW5nnaG67uou3H/KPuqT2X8hHytz1G+upLL3enK3PUb66ys9RDBRdr0hQgou06QqEGUkntH5Tz1e238vF9BeaqKT2j8p56vbb+Xi+gvNWjTdUuRn1XTHmTh8KrJTJlt8t1CPIY44cGnpJVjTJYkmjaN9Ib4u7V923njTethRauZJV3PaW1rfLIiXEDYg6R4VYc9CXW7thfOZbKdbGZtLW8uPVY/u3GrkNUkM9zlcxUjbhfWOA90cRq4gv4LhdqN+VToNYWmnRm9NNVWNTyHc6VWBv8wt4YeHqm6xyPmroq1Z7WGFLSxTq7WLSuPSdjrkfumq5yHXDUeA92oO2SKpVumNAaoJLMXH3myp0rpJ4uKhc3tbDM5BMri1zAj79j7KTiY8TcdBpcsith0286o+sPCagEX9Pzg4zXUCp6QYse8oouCG3tk6m1BYv05W6T+IdyolxbHDAAa2OgDlNCz3ryN2WxBd5PJMg1t81eId2ukqnLlTBbfcuY+9uJLiRcvtPvHdsHK+cfRHcHDWsyawjyy0WBcDI3lTP6TeIcFV+S5OmXx9bJg1048o8Cj0V8Jq2DVu09nL80up7OxHi+oal3P8AXB/IsZS8T/YOV65zvCcc7vfzPAK3ivWCz445zeH954BXOr6I8yfSfyz+jvCLP3fHytz1G+upLP3fHytz1E+usbPaQ0UXadIUIKLtekKhB7Ckk9o/Keer22/l4/oLzVRSe0flPPV7b/y8X0F5q0abqlyM+q6Y8yQsBTDMor1o8aiaE1pbluMqS3sbLLHIhSRQyngqukhaJ9uBjo+H5aOa3ao2t34qouRlLajTalGP8v0IY8ylXQ+PKPFU/bYXOLPge6CKia0LaxTOxHu1Q7cuBd9yPEJ7TbjXKO8CajbMIF6CNIeNvJHjqIWJ7tSpYkalqVblwIdyG+RGXur0hXYJFxal+Dhq5y3slkv3Y2pD0pTr+QUClpJRUdo9XW4OLrTHtM16cZLLWkeC7y4jvlNEpcRtw1Ux27Ci448NZrTFy3nn3IQWxlgGrDZ3pza7/M8ArZo+ArF5171uvp+CqdV0R5l/psUrs2vB3hdl7vTlbnqJ9dS2Xu+PlbnqJ9dY2eshooq16QoQUXa9IVCD2FLJ7RuU89WNtmUSQqkgYMgw0accKrpPaPynnrZWG4Vi+VWmY5tnMWXG+XrIYnA0rhj0mdcTgdNdwnKDqjmduM1SRR/qlr8/4KX6pa8T/BVzDuLZXudRZblmbxXcPUNPc3KqCIwrbOzgrHEnHjoyD+3eSXkht7DeKG4umDGOJVUklfouThXfmbnZ7Cvy1vt9pmv1W1+d8FL9VteJvgq5yrcOGfLmzHN80iyyETPbptAEFo2ZG8pmUa1OFNn3Ky6W/sbDKM5hv5bx2WTZA+7RF2y52WOPJTzE+z2Dy1vt9pT/AKpacTerS/U7Tib1a04/t7kDXPY03jhN0W6sQ7K7W3q2dnrMccaDy/8At80kuZfqWYxWNtlcvUPPhiGYhWDeUy7IwYU8xPs9g8tb7faUn6pacTerTxm9oOBvVq3v9z927aynuId44LiWKNnjhAXF2UYhRg516qpsryjLr21665zFLSTaK9U2GOA87SwqY37knRU+BzOzags0s1Oyr+BKM6sxwP6tSDPLMen6vy0rvdm3Sxlu7K/S7WDDrFUDUTxgnTU826eXW7KlxmqQuwDBXUKcD+1Xee/wXuKX5XDGWLapSVcOyhEM/seJ/V+WnjeGx4pPV+Wkm6kKZlFay3Jlt7iFpYZY8ASVK6DjtDDA0f8A0Tl340/1f8Ndx8xJVWXB0KbktFFpNzdVXAC/qOwA0CQni2flrO3Vwbm5lnI2TKxbDirX/wBE5d+NcfV/wVR7xZPa5U9utvI8nWhmbbw0YEAYYAVxfhfy5rlKR4Fulu6X7mW1mzT8S4Yis/5CPlbnqJ9dSWfu9OVueon11mZvQ2i7XpChKKtekKhBlNJ7R+U89bDfGTb3a3ZX0Lcj6kdY+T2j8p560288m1kWQr6MJ+ylSAr+2cnV5renjs3H1loX+3j9XvbbtxLN9lqW4UnV5jdnjtXHxihtyZNjeSBu5J9k1BJe7xy7W5CJ/wCzuD/mTVTf2+fq97LJuLrPsNRueS7W6aJ/38x+vLVXuY+xvHaNxbf2GoCezf8A36j/APsSf8w1sLnqczTefJluYoLm5uo5F61sBshItP1cNFYe1f8A3ir/APfE/wCZUe9bB94r5jwuPsrQFhmG4l/Z2M17HdW90tuu3IkTHaCjWdIw0VVZdks9/C06yJFEp2dp+E1bbqybGTZ8vpQD7L1XRv8A7blT96Oda7tpNuuNE37Cq9KSisjyuUoxrStKllHbLlWTXsMs8chuSuwEPDqwoLe5y+YRE/gLzmqRekvKKtd4327yM/ulHxmrHJStySWVRyrjxKI2XC/CTlnlPPKTpTdFbP0L1bgrf5Lp0G3dPhQHwV0S1lzBsns3sESR8Crh9WAJGjSOKuU3E+zdZQ3oJh8IArdZXFDmOTpHa3i2+YrI2KtKy4ricBsBuHHgFXSo440+Wa2qqxjvM9uMoy+WvzWpLCWWWE28HxL6e43ojgkeSCBY1Ri5BGIUDT51cl3vm276BBqSEH4WbxV0tlkyXJcxTMb+OW6uY9mGHrCzDQwwAbTp2uKuTZ9N1uYsfRRR8WPhrm419mSSjRyiqxVK7y23B/ftuTm2oSdJyzNVw3BFn7vTlbnqF9dS2fu9OVueon11lZuQ2iLdsGFD05H2dNQGV0ntG5Tz1dWm9N1b2kVq8EVwsI2UaQaQOKhmitZGLOmk68DhSFvY+gfWNSAg7z3Qvo7yKCKIohiaNR5LKxx8qpxvjcqS0VpbxvwOAcRQPZ7D0G9Y0uz2HoH1jUCpLY7zXlpbm3eKO5QuzjrBqZji3x17PvNcyT288VvDBJbMWUovS2hslW7mFQ9nsPQPrGl2ew9A+saCod/WNxtbYsrfb17WBxx5ddD2281xC88klvDcSXEnWuzrqOGGC9zRUPZ7D0G9Y0uzWHoH1jQVCLreq6ntZbaO3it1mGy7RjTs1X2mYy20ZiCq8ZOODcdEdmsPQb1jS7PYegfWNdJuLqnQiSUlRqpFLmryxtH1Ma7Qw2gNNPOdSt0oI27p007s9h6B9Y0uz2HoH1jXX3Z+I4+1b8IJdX89xLHKQFMXQUahpxoiPN5P+onfU+A0/s9h6DesaXZ7D0D6xpG7OLbUtu0StW5JJx2bBsmbtiSiEk+cxoCWWSaVpZOk2vDVo0VYdnsPQb1jSNvZcCH1jSd2c+p1XAmFqEOmOPEfaH+BQd1ueo211IzrgFUYKNAAqI1WztCpUqVCRUqVKgFSpUqAVKlSoBUqVKgFSpUqAVKlSoBUqVKgFSpUqAVKlSoD/9k\x3d";
var cc = cc || {}, ClassManager = {
    id: 0 | 998 * Math.random(), instanceId: 0 | 998 * Math.random(), compileSuper: function (a, b, c) {
        a = a.toString();
        var d = a.indexOf("("), e = a.indexOf(")"), d = a.substring(d + 1, e), d = d.trim(), e = a.indexOf("{"), f = a.lastIndexOf("}");
        for (a = a.substring(e + 1, f); -1 !== a.indexOf("this._super");) {
            var e = a.indexOf("this._super"), f = a.indexOf("(", e), g = a.indexOf(")", f), g = a.substring(f + 1, g), g = (g = g.trim()) ? "," : "";
            a = a.substring(0, e) + "ClassManager[" + c + "]." + b + ".call(this" + g + a.substring(f + 1)
        }
        return Function(d, a)
    }, getNewID: function () {
        return this.id++
    }, getNewInstanceId: function () {
        return this.instanceId++
    }
};
ClassManager.compileSuper.ClassManager = ClassManager;
(function () {
    var a = /\b_super\b/, b = cc.game.config[cc.game.CONFIG_KEY.classReleaseMode];
    b && console.log("release Mode");
    cc.Class = function () {
    };
    cc.Class.extend = function (c) {
        function d() {
            this.__instanceId = ClassManager.getNewInstanceId();
            this.ctor && this.ctor.apply(this, arguments)
        }

        var e = this.prototype, f = Object.create(e), g = ClassManager.getNewID();
        ClassManager[g] = e;
        var h = {writable: !0, enumerable: !1, configurable: !0};
        f.__instanceId = null;
        d.id = g;
        h.value = g;
        Object.defineProperty(f, "__pid", h);
        d.prototype = f;
        h.value = d;
        Object.defineProperty(d.prototype, "constructor", h);
        this.__getters__ && (d.__getters__ = cc.clone(this.__getters__));
        this.__setters__ && (d.__setters__ = cc.clone(this.__setters__));
        for (var k = 0, m = arguments.length; k < m; ++k) {
            var n = arguments[k], p;
            for (p in n) {
                var s = "function" === typeof n[p], r = "function" === typeof e[p], u = a.test(n[p]);
                b && s && r && u ? (h.value = ClassManager.compileSuper(n[p], p, g), Object.defineProperty(f, p, h)) : s && r && u ? (h.value = function (a, b) {
                    return function () {
                        var c = this._super;
                        this._super = e[a];
                        var d = b.apply(this, arguments);
                        this._super = c;
                        return d
                    }
                }(p, n[p]), Object.defineProperty(f, p, h)) : s ? (h.value = n[p], Object.defineProperty(f, p, h)) : f[p] = n[p];
                if (s) {
                    var t, v;
                    if (this.__getters__ && this.__getters__[p]) {
                        var s = this.__getters__[p], w;
                        for (w in this.__setters__)
                            if (this.__setters__[w] === s) {
                                v = w;
                                break
                            }
                        cc.defineGetterSetter(f, s, n[p], n[v] ? n[v] : f[v], p, v)
                    }
                    if (this.__setters__ && this.__setters__[p]) {
                        s = this.__setters__[p];
                        for (w in this.__getters__)
                            if (this.__getters__[w] === s) {
                                t = w;
                                break
                            }
                        cc.defineGetterSetter(f, s, n[t] ? n[t] : f[t], n[p], t, p)
                    }
                }
            }
        }
        d.extend = cc.Class.extend;
        d.implement = function (a) {
            for (var b in a)f[b] = a[b]
        };
        return d
    }
})();
cc.defineGetterSetter = function (a, b, c, d, e, f) {
    if (a.__defineGetter__)c && a.__defineGetter__(b, c), d && a.__defineSetter__(b, d); else if (Object.defineProperty) {
        var g = {enumerable: !1, configurable: !0};
        c && (g.get = c);
        d && (g.set = d);
        Object.defineProperty(a, b, g)
    } else throw Error("browser does not support getters");
    if (!e && !f)
        for (var g = null != c, h = void 0 != d, k = Object.getOwnPropertyNames(a), m = 0; m < k.length; m++) {
            var n = k[m];
            if ((a.__lookupGetter__ ? !a.__lookupGetter__(n) : !Object.getOwnPropertyDescriptor(a, n)) && "function" === typeof a[n]) {
                var p = a[n];
                if (g && p === c && (e = n, !h || f))break;
                if (h && p === d && (f = n, !g || e))break
            }
        }
    a = a.constructor;
    e && (a.__getters__ || (a.__getters__ = {}), a.__getters__[e] = b);
    f && (a.__setters__ || (a.__setters__ = {}), a.__setters__[f] = b)
};
cc.clone = function (a) {
    var b = a.constructor ? new a.constructor : {}, c;
    for (c in a) {
        var d = a[c];
        b[c] = "object" !== typeof d || !d || d instanceof cc.Node || d instanceof HTMLElement ? d : cc.clone(d)
    }
    return b
};
cc.inject = function (a, b) {
    for (var c in a)b[c] = a[c]
};
cc = cc || {};
cc._tmp = cc._tmp || {};
cc.associateWithNative = function (a, b) {
};
cc.KEY = {
    none: 0,
    back: 6,
    menu: 18,
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pause: 19,
    capslock: 20,
    escape: 27,
    space: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    select: 41,
    insert: 45,
    Delete: 46,
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
    num0: 96,
    num1: 97,
    num2: 98,
    num3: 99,
    num4: 100,
    num5: 101,
    num6: 102,
    num7: 103,
    num8: 104,
    num9: 105,
    "*": 106,
    "+": 107,
    "-": 109,
    numdel: 110,
    "/": 111,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    numlock: 144,
    scrolllock: 145,
    ";": 186,
    semicolon: 186,
    equal: 187,
    "\x3d": 187,
    ",": 188,
    comma: 188,
    dash: 189,
    ".": 190,
    period: 190,
    forwardslash: 191,
    grave: 192,
    "[": 219,
    openbracket: 219,
    backslash: 220,
    "]": 221,
    closebracket: 221,
    quote: 222,
    dpadLeft: 1E3,
    dpadRight: 1001,
    dpadUp: 1003,
    dpadDown: 1004,
    dpadCenter: 1005
};
cc.FMT_JPG = 0;
cc.FMT_PNG = 1;
cc.FMT_TIFF = 2;
cc.FMT_RAWDATA = 3;
cc.FMT_WEBP = 4;
cc.FMT_UNKNOWN = 5;
cc.getImageFormatByData = function (a) {
    return 8 < a.length && 137 === a[0] && 80 === a[1] && 78 === a[2] && 71 === a[3] && 13 === a[4] && 10 === a[5] && 26 === a[6] && 10 === a[7] ? cc.FMT_PNG : 2 < a.length && (73 === a[0] && 73 === a[1] || 77 === a[0] && 77 === a[1] || 255 === a[0] && 216 === a[1]) ? cc.FMT_TIFF : cc.FMT_UNKNOWN
};
cc.inherits = function (a, b) {
    function c() {
    }

    c.prototype = b.prototype;
    a.superClass_ = b.prototype;
    a.prototype = new c;
    a.prototype.constructor = a
};
cc.base = function (a, b, c) {
    var d = arguments.callee.caller;
    if (d.superClass_)return ret = d.superClass_.constructor.apply(a, Array.prototype.slice.call(arguments, 1));
    for (var e = Array.prototype.slice.call(arguments, 2), f = !1, g = a.constructor; g; g = g.superClass_ && g.superClass_.constructor)
        if (g.prototype[b] === d)f = !0; else if (f)return g.prototype[b].apply(a, e);
    if (a[b] === d)return a.constructor.prototype[b].apply(a, e);
    throw Error("cc.base called from a method of one name to a method of a different name");
};
cc.Point = function (a, b) {
    this.x = a || 0;
    this.y = b || 0
};
cc.p = function (a, b) {
    return void 0 === a ? {x: 0, y: 0} : void 0 === b ? {x: a.x, y: a.y} : {x: a, y: b}
};
cc.pointEqualToPoint = function (a, b) {
    return a && b && a.x === b.x && a.y === b.y
};
cc.Size = function (a, b) {
    this.width = a || 0;
    this.height = b || 0
};
cc.size = function (a, b) {
    return void 0 === a ? {width: 0, height: 0} : void 0 === b ? {width: a.width, height: a.height} : {
        width: a,
        height: b
    }
};
cc.sizeEqualToSize = function (a, b) {
    return a && b && a.width === b.width && a.height === b.height
};
cc.Rect = function (a, b, c, d) {
    this.x = a || 0;
    this.y = b || 0;
    this.width = c || 0;
    this.height = d || 0
};
cc.rect = function (a, b, c, d) {
    return void 0 === a ? {x: 0, y: 0, width: 0, height: 0} : void 0 === b ? {
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height
    } : {x: a, y: b, width: c, height: d}
};
cc.rectEqualToRect = function (a, b) {
    return a && b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
};
cc._rectEqualToZero = function (a) {
    return a && 0 === a.x && 0 === a.y && 0 === a.width && 0 === a.height
};
cc.rectContainsRect = function (a, b) {
    return a && b ? !(a.x >= b.x || a.y >= b.y || a.x + a.width <= b.x + b.width || a.y + a.height <= b.y + b.height) : !1
};
cc.rectGetMaxX = function (a) {
    return a.x + a.width
};
cc.rectGetMidX = function (a) {
    return a.x + a.width / 2
};
cc.rectGetMinX = function (a) {
    return a.x
};
cc.rectGetMaxY = function (a) {
    return a.y + a.height
};
cc.rectGetMidY = function (a) {
    return a.y + a.height / 2
};
cc.rectGetMinY = function (a) {
    return a.y
};
cc.rectContainsPoint = function (a, b) {
    return b.x >= cc.rectGetMinX(a) && b.x <= cc.rectGetMaxX(a) && b.y >= cc.rectGetMinY(a) && b.y <= cc.rectGetMaxY(a)
};
cc.rectIntersectsRect = function (a, b) {
    var c = a.y + a.height, d = b.x + b.width, e = b.y + b.height;
    return !(a.x + a.width < b.x || d < a.x || c < b.y || e < a.y)
};
cc.rectOverlapsRect = function (a, b) {
    return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y)
};
cc.rectUnion = function (a, b) {
    var c = cc.rect(0, 0, 0, 0);
    c.x = Math.min(a.x, b.x);
    c.y = Math.min(a.y, b.y);
    c.width = Math.max(a.x + a.width, b.x + b.width) - c.x;
    c.height = Math.max(a.y + a.height, b.y + b.height) - c.y;
    return c
};
cc.rectIntersection = function (a, b) {
    var c = cc.rect(Math.max(cc.rectGetMinX(a), cc.rectGetMinX(b)), Math.max(cc.rectGetMinY(a), cc.rectGetMinY(b)), 0, 0);
    c.width = Math.min(cc.rectGetMaxX(a), cc.rectGetMaxX(b)) - cc.rectGetMinX(c);
    c.height = Math.min(cc.rectGetMaxY(a), cc.rectGetMaxY(b)) - cc.rectGetMinY(c);
    return c
};
cc.SAXParser = cc.Class.extend({
    _parser: null, _isSupportDOMParser: null, ctor: function () {
        window.DOMParser ? (this._isSupportDOMParser = !0, this._parser = new DOMParser) : this._isSupportDOMParser = !1
    }, parse: function (a) {
        return this._parseXML(a)
    }, _parseXML: function (a) {
        var b;
        this._isSupportDOMParser ? b = this._parser.parseFromString(a, "text/xml") : (b = new ActiveXObject("Microsoft.XMLDOM"), b.async = "false", b.loadXML(a));
        return b
    }
});
cc.PlistParser = cc.SAXParser.extend({
    parse: function (a) {
        a = this._parseXML(a).documentElement;
        if ("plist" !== a.tagName)throw"Not a plist file!";
        for (var b = null, c = 0, d = a.childNodes.length; c < d && (b = a.childNodes[c], 1 !== b.nodeType); c++);
        return this._parseNode(b)
    }, _parseNode: function (a) {
        var b = null, c = a.tagName;
        if ("dict" === c)b = this._parseDict(a); else if ("array" === c)b = this._parseArray(a); else if ("string" === c)
            if (1 === a.childNodes.length)b = a.firstChild.nodeValue; else
                for (b = "", c = 0; c < a.childNodes.length; c++)b += a.childNodes[c].nodeValue; else"false" === c ? b = !1 : "true" === c ? b = !0 : "real" === c ? b = parseFloat(a.firstChild.nodeValue) : "integer" === c && (b = parseInt(a.firstChild.nodeValue, 10));
        return b
    }, _parseArray: function (a) {
        for (var b = [], c = 0, d = a.childNodes.length; c < d; c++) {
            var e = a.childNodes[c];
            1 === e.nodeType && b.push(this._parseNode(e))
        }
        return b
    }, _parseDict: function (a) {
        for (var b = {}, c = null, d = 0, e = a.childNodes.length; d < e; d++) {
            var f = a.childNodes[d];
            1 === f.nodeType && ("key" === f.tagName ? c = f.firstChild.nodeValue : b[c] = this._parseNode(f))
        }
        return b
    }
});
cc._txtLoader = {
    load: function (a, b, c, d) {
        cc.loader.loadTxt(a, d)
    }
};
cc.loader.register(["txt", "xml", "vsh", "fsh", "atlas"], cc._txtLoader);
cc._jsonLoader = {
    load: function (a, b, c, d) {
        cc.loader.loadJson(a, d)
    }
};
cc.loader.register(["json", "ExportJson"], cc._jsonLoader);
cc._jsLoader = {
    load: function (a, b, c, d) {
        cc.loader.loadJs(a, d)
    }
};
cc.loader.register(["js"], cc._jsLoader);
cc._imgLoader = {
    load: function (a, b, c, d) {
        cc.loader.cache[b] = cc.loader.loadImg(a, function (a, c) {
            if (a)return d(a);
            cc.textureCache.handleLoadedTexture(b);
            d(null, c)
        })
    }
};
cc.loader.register("png jpg bmp jpeg gif ico".split(" "), cc._imgLoader);
cc._serverImgLoader = {
    load: function (a, b, c, d) {
        cc.loader.cache[b] = cc.loader.loadImg(c.src, function (a, c) {
            if (a)return d(a);
            cc.textureCache.handleLoadedTexture(b);
            d(null, c)
        })
    }
};
cc.loader.register(["serverImg"], cc._serverImgLoader);
cc._plistLoader = {
    load: function (a, b, c, d) {
        cc.loader.loadTxt(a, function (a, b) {
            if (a)return d(a);
            d(null, cc.plistParser.parse(b))
        })
    }
};
cc.loader.register(["plist"], cc._plistLoader);
cc._fontLoader = {
    TYPE: {".eot": "embedded-opentype", ".ttf": "truetype", ".woff": "woff", ".svg": "svg"},
    _loadFont: function (a, b, c) {
        var d = document, e = cc.path, f = this.TYPE, g = cc.newElement("style");
        g.type = "text/css";
        d.body.appendChild(g);
        var h = "@font-face { font-family:" + a + "; src:";
        if (b instanceof Array)
            for (var k = 0, m = b.length; k < m; k++)c = e.extname(b[k]).toLowerCase(), h += "url('" + b[k] + "') format('" + f[c] + "')", h += k === m - 1 ? ";" : ","; else h += "url('" + b + "') format('" + f[c] + "');";
        g.textContent += h + "};";
        b = cc.newElement("div");
        c = b.style;
        c.fontFamily = a;
        b.innerHTML = ".";
        c.position = "absolute";
        c.left = "-100px";
        c.top = "-100px";
        d.body.appendChild(b)
    },
    load: function (a, b, c, d) {
        b = c.type;
        a = c.name;
        b = c.srcs;
        cc.isString(c) ? (b = cc.path.extname(c), a = cc.path.basename(c, b), this._loadFont(a, c, b)) : this._loadFont(a, b);
        d(null, !0)
    }
};
cc.loader.register(["font", "eot", "ttf", "woff", "svg"], cc._fontLoader);
cc._binaryLoader = {
    load: function (a, b, c, d) {
        cc.loader.loadBinary(a, d)
    }
};
cc._csbLoader = {
    load: function (a, b, c, d) {
        cc.loader.loadCsb(a, d)
    }
};
cc.loader.register(["csb"], cc._csbLoader);
window.CocosEngine = cc.ENGINE_VERSION = "Cocos2d-JS v3.6";
cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL = 0;
cc.DIRECTOR_STATS_POSITION = cc.p(0, 0);
cc.DIRECTOR_FPS_INTERVAL = 0.5;
cc.COCOSNODE_RENDER_SUBPIXEL = 1;
cc.SPRITEBATCHNODE_RENDER_SUBPIXEL = 1;
cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA = 0;
cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP = 0;
cc.TEXTURE_ATLAS_USE_VAO = 0;
cc.TEXTURE_NPOT_SUPPORT = 0;
cc.RETINA_DISPLAY_SUPPORT = 1;
cc.RETINA_DISPLAY_FILENAME_SUFFIX = "-hd";
cc.USE_LA88_LABELS = 1;
cc.SPRITE_DEBUG_DRAW = 0;
cc.SPRITEBATCHNODE_DEBUG_DRAW = 0;
cc.LABELBMFONT_DEBUG_DRAW = 0;
cc.LABELATLAS_DEBUG_DRAW = 0;
cc.IS_RETINA_DISPLAY_SUPPORTED = 1;
cc.DEFAULT_ENGINE = cc.ENGINE_VERSION + "-canvas";
cc.ENABLE_STACKABLE_ACTIONS = 1;
cc.ENABLE_GL_STATE_CACHE = 1;
cc.$ = function (a) {
    var b = this === cc ? document : this;
    if (a = a instanceof HTMLElement ? a : b.querySelector(a))a.find = a.find || cc.$, a.hasClass = a.hasClass || function (a) {
            return this.className.match(RegExp("(\\s|^)" + a + "(\\s|$)"))
        }, a.addClass = a.addClass || function (a) {
            this.hasClass(a) || (this.className && (this.className += " "), this.className += a);
            return this
        }, a.removeClass = a.removeClass || function (a) {
            this.hasClass(a) && (this.className = this.className.replace(a, ""));
            return this
        }, a.remove = a.remove || function () {
            this.parentNode && this.parentNode.removeChild(this);
            return this
        }, a.appendTo = a.appendTo || function (a) {
            a.appendChild(this);
            return this
        }, a.prependTo = a.prependTo || function (a) {
            a.childNodes[0] ? a.insertBefore(this, a.childNodes[0]) : a.appendChild(this);
            return this
        }, a.transforms = a.transforms || function () {
            this.style[cc.$.trans] = cc.$.translate(this.position) + cc.$.rotate(this.rotation) + cc.$.scale(this.scale) + cc.$.skew(this.skew);
            return this
        }, a.position = a.position || {x: 0, y: 0}, a.rotation = a.rotation || 0, a.scale = a.scale || {
            x: 1,
            y: 1
        }, a.skew = a.skew || {x: 0, y: 0}, a.translates = function (a, b) {
        this.position.x = a;
        this.position.y = b;
        this.transforms();
        return this
    }, a.rotate = function (a) {
        this.rotation = a;
        this.transforms();
        return this
    }, a.resize = function (a, b) {
        this.scale.x = a;
        this.scale.y = b;
        this.transforms();
        return this
    }, a.setSkew = function (a, b) {
        this.skew.x = a;
        this.skew.y = b;
        this.transforms();
        return this
    };
    return a
};
switch (cc.sys.browserType) {
    case cc.sys.BROWSER_TYPE_FIREFOX:
        cc.$.pfx = "Moz";
        cc.$.hd = !0;
        break;
    case cc.sys.BROWSER_TYPE_CHROME:
    case cc.sys.BROWSER_TYPE_SAFARI:
        cc.$.pfx = "webkit";
        cc.$.hd = !0;
        break;
    case cc.sys.BROWSER_TYPE_OPERA:
        cc.$.pfx = "O";
        cc.$.hd = !1;
        break;
    case cc.sys.BROWSER_TYPE_IE:
        cc.$.pfx = "ms";
        cc.$.hd = !1;
        break;
    default:
        cc.$.pfx = "webkit", cc.$.hd = !0
}
cc.$.trans = cc.$.pfx + "Transform";
cc.$.translate = cc.$.hd ? function (a) {
    return "translate3d(" + a.x + "px, " + a.y + "px, 0) "
} : function (a) {
    return "translate(" + a.x + "px, " + a.y + "px) "
};
cc.$.rotate = cc.$.hd ? function (a) {
    return "rotateZ(" + a + "deg) "
} : function (a) {
    return "rotate(" + a + "deg) "
};
cc.$.scale = function (a) {
    return "scale(" + a.x + ", " + a.y + ") "
};
cc.$.skew = function (a) {
    return "skewX(" + -a.x + "deg) skewY(" + a.y + "deg)"
};
cc.$new = function (a) {
    return cc.$(document.createElement(a))
};
cc.$.findpos = function (a) {
    var b = 0, c = 0;
    do b += a.offsetLeft, c += a.offsetTop; while (a = a.offsetParent);
    return {x: b, y: c}
};
cc.INVALID_INDEX = -1;
cc.PI = Math.PI;
cc.FLT_MAX = parseFloat("3.402823466e+38F");
cc.FLT_MIN = parseFloat("1.175494351e-38F");
cc.RAD = cc.PI / 180;
cc.DEG = 180 / cc.PI;
cc.UINT_MAX = 4294967295;
cc.swap = function (a, b, c) {
    if (!cc.isObject(c) || cc.isUndefined(c.x) || cc.isUndefined(c.y))cc.log(cc._LogInfos.swap); else {
        var d = c[a];
        c[a] = c[b];
        c[b] = d
    }
};
cc.lerp = function (a, b, c) {
    return a + (b - a) * c
};
cc.rand = function () {
    return 16777215 * Math.random()
};
cc.randomMinus1To1 = function () {
    return 2 * (Math.random() - 0.5)
};
cc.random0To1 = Math.random;
cc.degreesToRadians = function (a) {
    return a * cc.RAD
};
cc.radiansToDegrees = function (a) {
    return a * cc.DEG
};
cc.radiansToDegress = function (a) {
    cc.log(cc._LogInfos.radiansToDegress);
    return a * cc.DEG
};
cc.REPEAT_FOREVER = Number.MAX_VALUE - 1;
cc.BLEND_SRC = cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA ? 1 : 770;
cc.BLEND_DST = 771;
cc.nodeDrawSetup = function (a) {
    a._shaderProgram && (a._shaderProgram.use(), a._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4())
};
cc.enableDefaultGLStates = function () {
};
cc.disableDefaultGLStates = function () {
};
cc.incrementGLDraws = function (a) {
    cc.g_NumberOfDraws += a
};
cc.FLT_EPSILON = 1.192092896E-7;
cc.contentScaleFactor = cc.IS_RETINA_DISPLAY_SUPPORTED ? function () {
    return cc.director.getContentScaleFactor()
} : function () {
    return 1
};
cc.pointPointsToPixels = function (a) {
    var b = cc.contentScaleFactor();
    return cc.p(a.x * b, a.y * b)
};
cc.pointPixelsToPoints = function (a) {
    var b = cc.contentScaleFactor();
    return cc.p(a.x / b, a.y / b)
};
cc._pointPixelsToPointsOut = function (a, b) {
    var c = cc.contentScaleFactor();
    b.x = a.x / c;
    b.y = a.y / c
};
cc.sizePointsToPixels = function (a) {
    var b = cc.contentScaleFactor();
    return cc.size(a.width * b, a.height * b)
};
cc.sizePixelsToPoints = function (a) {
    var b = cc.contentScaleFactor();
    return cc.size(a.width / b, a.height / b)
};
cc._sizePixelsToPointsOut = function (a, b) {
    var c = cc.contentScaleFactor();
    b.width = a.width / c;
    b.height = a.height / c
};
cc.rectPixelsToPoints = cc.IS_RETINA_DISPLAY_SUPPORTED ? function (a) {
    var b = cc.contentScaleFactor();
    return cc.rect(a.x / b, a.y / b, a.width / b, a.height / b)
} : function (a) {
    return a
};
cc.rectPointsToPixels = cc.IS_RETINA_DISPLAY_SUPPORTED ? function (a) {
    var b = cc.contentScaleFactor();
    return cc.rect(a.x * b, a.y * b, a.width * b, a.height * b)
} : function (a) {
    return a
};
cc.ONE = 1;
cc.ZERO = 0;
cc.SRC_ALPHA = 770;
cc.SRC_ALPHA_SATURATE = 776;
cc.SRC_COLOR = 768;
cc.DST_ALPHA = 772;
cc.DST_COLOR = 774;
cc.ONE_MINUS_SRC_ALPHA = 771;
cc.ONE_MINUS_SRC_COLOR = 769;
cc.ONE_MINUS_DST_ALPHA = 773;
cc.ONE_MINUS_DST_COLOR = 775;
cc.ONE_MINUS_CONSTANT_ALPHA = 32772;
cc.ONE_MINUS_CONSTANT_COLOR = 32770;
cc.LINEAR = 9729;
cc.REPEAT = 10497;
cc.CLAMP_TO_EDGE = 33071;
cc.MIRRORED_REPEAT = 33648;
cc.checkGLErrorDebug = function () {
    if (cc.renderMode === cc._RENDER_TYPE_WEBGL) {
        var a = cc._renderContext.getError();
        a && cc.log(cc._LogInfos.checkGLErrorDebug, a)
    }
};
cc.DEVICE_ORIENTATION_PORTRAIT = 0;
cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT = 1;
cc.DEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN = 2;
cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT = 3;
cc.DEVICE_MAX_ORIENTATIONS = 2;
cc.VERTEX_ATTRIB_FLAG_NONE = 0;
cc.VERTEX_ATTRIB_FLAG_POSITION = 1;
cc.VERTEX_ATTRIB_FLAG_COLOR = 2;
cc.VERTEX_ATTRIB_FLAG_TEX_COORDS = 4;
cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX = cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS;
cc.GL_ALL = 0;
cc.VERTEX_ATTRIB_POSITION = 0;
cc.VERTEX_ATTRIB_COLOR = 1;
cc.VERTEX_ATTRIB_TEX_COORDS = 2;
cc.VERTEX_ATTRIB_MAX = 3;
cc.UNIFORM_PMATRIX = 0;
cc.UNIFORM_MVMATRIX = 1;
cc.UNIFORM_MVPMATRIX = 2;
cc.UNIFORM_TIME = 3;
cc.UNIFORM_SINTIME = 4;
cc.UNIFORM_COSTIME = 5;
cc.UNIFORM_RANDOM01 = 6;
cc.UNIFORM_SAMPLER = 7;
cc.UNIFORM_MAX = 8;
cc.SHADER_POSITION_TEXTURECOLOR = "ShaderPositionTextureColor";
cc.SHADER_POSITION_TEXTURECOLORALPHATEST = "ShaderPositionTextureColorAlphaTest";
cc.SHADER_POSITION_COLOR = "ShaderPositionColor";
cc.SHADER_POSITION_TEXTURE = "ShaderPositionTexture";
cc.SHADER_POSITION_TEXTURE_UCOLOR = "ShaderPositionTexture_uColor";
cc.SHADER_POSITION_TEXTUREA8COLOR = "ShaderPositionTextureA8Color";
cc.SHADER_POSITION_UCOLOR = "ShaderPosition_uColor";
cc.SHADER_POSITION_LENGTHTEXTURECOLOR = "ShaderPositionLengthTextureColor";
cc.UNIFORM_PMATRIX_S = "CC_PMatrix";
cc.UNIFORM_MVMATRIX_S = "CC_MVMatrix";
cc.UNIFORM_MVPMATRIX_S = "CC_MVPMatrix";
cc.UNIFORM_TIME_S = "CC_Time";
cc.UNIFORM_SINTIME_S = "CC_SinTime";
cc.UNIFORM_COSTIME_S = "CC_CosTime";
cc.UNIFORM_RANDOM01_S = "CC_Random01";
cc.UNIFORM_SAMPLER_S = "CC_Texture0";
cc.UNIFORM_ALPHA_TEST_VALUE_S = "CC_alpha_value";
cc.ATTRIBUTE_NAME_COLOR = "a_color";
cc.ATTRIBUTE_NAME_POSITION = "a_position";
cc.ATTRIBUTE_NAME_TEX_COORD = "a_texCoord";
cc.ITEM_SIZE = 32;
cc.CURRENT_ITEM = 3233828865;
cc.ZOOM_ACTION_TAG = 3233828866;
cc.NORMAL_TAG = 8801;
cc.SELECTED_TAG = 8802;
cc.DISABLE_TAG = 8803;
cc.arrayVerifyType = function (a, b) {
    if (a && 0 < a.length)
        for (var c = 0; c < a.length; c++)
            if (!(a[c]instanceof b))return cc.log("element type is wrong!"), !1;
    return !0
};
cc.arrayRemoveObject = function (a, b) {
    for (var c = 0, d = a.length; c < d; c++)
        if (a[c] === b) {
            a.splice(c, 1);
            break
        }
};
cc.arrayRemoveArray = function (a, b) {
    for (var c = 0, d = b.length; c < d; c++)cc.arrayRemoveObject(a, b[c])
};
cc.arrayAppendObjectsToIndex = function (a, b, c) {
    a.splice.apply(a, [c, 0].concat(b));
    return a
};
cc.copyArray = function (a) {
    var b, c = a.length, d = Array(c);
    for (b = 0; b < c; b += 1)d[b] = a[b];
    return d
};
cc = cc || {};
cc._tmp = cc._tmp || {};
cc._tmp.WebGLColor = function () {
    cc.color = function (a, c, d, e, f, g) {
        return void 0 === a ? new cc.Color(0, 0, 0, 255, f, g) : cc.isString(a) ? (a = cc.hexToColor(a), new cc.Color(a.r, a.g, a.b, a.a)) : cc.isObject(a) ? new cc.Color(a.r, a.g, a.b, a.a, a.arrayBuffer, a.offset) : new cc.Color(a, c, d, e, f, g)
    };
    cc.Color = function (a, c, d, e, f, g) {
        this._arrayBuffer = f || new ArrayBuffer(cc.Color.BYTES_PER_ELEMENT);
        this._offset = g || 0;
        f = this._arrayBuffer;
        g = this._offset;
        var h = Uint8Array.BYTES_PER_ELEMENT;
        this._rU8 = new Uint8Array(f, g, 1);
        this._gU8 = new Uint8Array(f, g + h, 1);
        this._bU8 = new Uint8Array(f, g + 2 * h, 1);
        this._aU8 = new Uint8Array(f, g + 3 * h, 1);
        this._rU8[0] = a || 0;
        this._gU8[0] = c || 0;
        this._bU8[0] = d || 0;
        this._aU8[0] = null == e ? 255 : e;
        void 0 === e && (this.a_undefined = !0)
    };
    cc.Color.BYTES_PER_ELEMENT = 4;
    var a = cc.Color.prototype;
    a._getR = function () {
        return this._rU8[0]
    };
    a._setR = function (a) {
        this._rU8[0] = 0 > a ? 0 : a
    };
    a._getG = function () {
        return this._gU8[0]
    };
    a._setG = function (a) {
        this._gU8[0] = 0 > a ? 0 : a
    };
    a._getB = function () {
        return this._bU8[0]
    };
    a._setB = function (a) {
        this._bU8[0] = 0 > a ? 0 : a
    };
    a._getA = function () {
        return this._aU8[0]
    };
    a._setA = function (a) {
        this._aU8[0] = 0 > a ? 0 : a
    };
    cc.defineGetterSetter(a, "r", a._getR, a._setR);
    cc.defineGetterSetter(a, "g", a._getG, a._setG);
    cc.defineGetterSetter(a, "b", a._getB, a._setB);
    cc.defineGetterSetter(a, "a", a._getA, a._setA);
    cc.Vertex2F = function (a, c, d, e) {
        this._arrayBuffer = d || new ArrayBuffer(cc.Vertex2F.BYTES_PER_ELEMENT);
        this._offset = e || 0;
        this._xF32 = new Float32Array(this._arrayBuffer, this._offset, 1);
        this._yF32 = new Float32Array(this._arrayBuffer, this._offset + 4, 1);
        this._xF32[0] = a || 0;
        this._yF32[0] = c || 0
    };
    cc.Vertex2F.BYTES_PER_ELEMENT = 8;
    a = cc.Vertex2F.prototype;
    a._getX = function () {
        return this._xF32[0]
    };
    a._setX = function (a) {
        this._xF32[0] = a
    };
    a._getY = function () {
        return this._yF32[0]
    };
    a._setY = function (a) {
        this._yF32[0] = a
    };
    cc.defineGetterSetter(a, "x", a._getX, a._setX);
    cc.defineGetterSetter(a, "y", a._getY, a._setY);
    cc.Vertex3F = function (a, c, d, e, f) {
        this._arrayBuffer = e || new ArrayBuffer(cc.Vertex3F.BYTES_PER_ELEMENT);
        this._offset = f || 0;
        e = this._arrayBuffer;
        f = this._offset;
        this._xF32 = new Float32Array(e, f, 1);
        this._xF32[0] = a || 0;
        this._yF32 = new Float32Array(e, f + Float32Array.BYTES_PER_ELEMENT, 1);
        this._yF32[0] = c || 0;
        this._zF32 = new Float32Array(e, f + 2 * Float32Array.BYTES_PER_ELEMENT, 1);
        this._zF32[0] = d || 0
    };
    cc.Vertex3F.BYTES_PER_ELEMENT = 12;
    a = cc.Vertex3F.prototype;
    a._getX = function () {
        return this._xF32[0]
    };
    a._setX = function (a) {
        this._xF32[0] = a
    };
    a._getY = function () {
        return this._yF32[0]
    };
    a._setY = function (a) {
        this._yF32[0] = a
    };
    a._getZ = function () {
        return this._zF32[0]
    };
    a._setZ = function (a) {
        this._zF32[0] = a
    };
    cc.defineGetterSetter(a, "x", a._getX, a._setX);
    cc.defineGetterSetter(a, "y", a._getY, a._setY);
    cc.defineGetterSetter(a, "z", a._getZ, a._setZ);
    cc.Tex2F = function (a, c, d, e) {
        this._arrayBuffer = d || new ArrayBuffer(cc.Tex2F.BYTES_PER_ELEMENT);
        this._offset = e || 0;
        this._uF32 = new Float32Array(this._arrayBuffer, this._offset, 1);
        this._vF32 = new Float32Array(this._arrayBuffer, this._offset + 4, 1);
        this._uF32[0] = a || 0;
        this._vF32[0] = c || 0
    };
    cc.Tex2F.BYTES_PER_ELEMENT = 8;
    a = cc.Tex2F.prototype;
    a._getU = function () {
        return this._uF32[0]
    };
    a._setU = function (a) {
        this._uF32[0] = a
    };
    a._getV = function () {
        return this._vF32[0]
    };
    a._setV = function (a) {
        this._vF32[0] = a
    };
    cc.defineGetterSetter(a, "u", a._getU, a._setU);
    cc.defineGetterSetter(a, "v", a._getV, a._setV);
    cc.Quad2 = function (a, c, d, e, f, g) {
        this._arrayBuffer = f || new ArrayBuffer(cc.Quad2.BYTES_PER_ELEMENT);
        this._offset = g || 0;
        f = this._arrayBuffer;
        g = cc.Vertex2F.BYTES_PER_ELEMENT;
        this._tl = a ? new cc.Vertex2F(a.x, a.y, f, 0) : new cc.Vertex2F(0, 0, f, 0);
        this._tr = c ? new cc.Vertex2F(c.x, c.y, f, g) : new cc.Vertex2F(0, 0, f, g);
        this._bl = d ? new cc.Vertex2F(d.x, d.y, f, 2 * g) : new cc.Vertex2F(0, 0, f, 2 * g);
        this._br = e ? new cc.Vertex2F(e.x, e.y, f, 3 * g) : new cc.Vertex2F(0, 0, f, 3 * g)
    };
    cc.Quad2.BYTES_PER_ELEMENT = 32;
    a = cc.Quad2.prototype;
    a._getTL = function () {
        return this._tl
    };
    a._setTL = function (a) {
        this._tl.x = a.x;
        this._tl.y = a.y
    };
    a._getTR = function () {
        return this._tr
    };
    a._setTR = function (a) {
        this._tr.x = a.x;
        this._tr.y = a.y
    };
    a._getBL = function () {
        return this._bl
    };
    a._setBL = function (a) {
        this._bl.x = a.x;
        this._bl.y = a.y
    };
    a._getBR = function () {
        return this._br
    };
    a._setBR = function (a) {
        this._br.x = a.x;
        this._br.y = a.y
    };
    cc.defineGetterSetter(a, "tl", a._getTL, a._setTL);
    cc.defineGetterSetter(a, "tr", a._getTR, a._setTR);
    cc.defineGetterSetter(a, "bl", a._getBL, a._setBL);
    cc.defineGetterSetter(a, "br", a._getBR, a._setBR);
    cc.Quad3 = function (a, c, d, e) {
        this.bl = a || new cc.Vertex3F(0, 0, 0);
        this.br = c || new cc.Vertex3F(0, 0, 0);
        this.tl = d || new cc.Vertex3F(0, 0, 0);
        this.tr = e || new cc.Vertex3F(0, 0, 0)
    };
    cc.V3F_C4B_T2F = function (a, c, d, e, f) {
        this._arrayBuffer = e || new ArrayBuffer(cc.V3F_C4B_T2F.BYTES_PER_ELEMENT);
        this._offset = f || 0;
        e = this._arrayBuffer;
        f = this._offset;
        var g = cc.Vertex3F.BYTES_PER_ELEMENT;
        this._vertices = a ? new cc.Vertex3F(a.x, a.y, a.z, e, f) : new cc.Vertex3F(0, 0, 0, e, f);
        this._colors = c ? cc.color(c.r, c.g, c.b, c.a, e, f + g) : cc.color(0, 0, 0, 0, e, f + g);
        this._texCoords = d ? new cc.Tex2F(d.u, d.v, e, f + g + cc.Color.BYTES_PER_ELEMENT) : new cc.Tex2F(0, 0, e, f + g + cc.Color.BYTES_PER_ELEMENT)
    };
    cc.V3F_C4B_T2F.BYTES_PER_ELEMENT = 24;
    a = cc.V3F_C4B_T2F.prototype;
    a._getVertices = function () {
        return this._vertices
    };
    a._setVertices = function (a) {
        var c = this._vertices;
        c.x = a.x;
        c.y = a.y;
        c.z = a.z
    };
    a._getColor = function () {
        return this._colors
    };
    a._setColor = function (a) {
        var c = this._colors;
        c.r = a.r;
        c.g = a.g;
        c.b = a.b;
        c.a = a.a
    };
    a._getTexCoords = function () {
        return this._texCoords
    };
    a._setTexCoords = function (a) {
        this._texCoords.u = a.u;
        this._texCoords.v = a.v
    };
    cc.defineGetterSetter(a, "vertices", a._getVertices, a._setVertices);
    cc.defineGetterSetter(a, "colors", a._getColor, a._setColor);
    cc.defineGetterSetter(a, "texCoords", a._getTexCoords, a._setTexCoords);
    cc.V3F_C4B_T2F_Quad = function (a, c, d, e, f, g) {
        this._arrayBuffer = f || new ArrayBuffer(cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT);
        this._offset = g || 0;
        f = this._arrayBuffer;
        g = this._offset;
        var h = cc.V3F_C4B_T2F.BYTES_PER_ELEMENT;
        this._tl = a ? new cc.V3F_C4B_T2F(a.vertices, a.colors, a.texCoords, f, g) : new cc.V3F_C4B_T2F(null, null, null, f, g);
        this._bl = c ? new cc.V3F_C4B_T2F(c.vertices, c.colors, c.texCoords, f, g + h) : new cc.V3F_C4B_T2F(null, null, null, f, g + h);
        this._tr = d ? new cc.V3F_C4B_T2F(d.vertices, d.colors, d.texCoords, f, g + 2 * h) : new cc.V3F_C4B_T2F(null, null, null, f, g + 2 * h);
        this._br = e ? new cc.V3F_C4B_T2F(e.vertices, e.colors, e.texCoords, f, g + 3 * h) : new cc.V3F_C4B_T2F(null, null, null, f, g + 3 * h)
    };
    cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT = 96;
    a = cc.V3F_C4B_T2F_Quad.prototype;
    a._getTL = function () {
        return this._tl
    };
    a._setTL = function (a) {
        var c = this._tl;
        c.vertices = a.vertices;
        c.colors = a.colors;
        c.texCoords = a.texCoords
    };
    a._getBL = function () {
        return this._bl
    };
    a._setBL = function (a) {
        var c = this._bl;
        c.vertices = a.vertices;
        c.colors = a.colors;
        c.texCoords = a.texCoords
    };
    a._getTR = function () {
        return this._tr
    };
    a._setTR = function (a) {
        var c = this._tr;
        c.vertices = a.vertices;
        c.colors = a.colors;
        c.texCoords = a.texCoords
    };
    a._getBR = function () {
        return this._br
    };
    a._setBR = function (a) {
        var c = this._br;
        c.vertices = a.vertices;
        c.colors = a.colors;
        c.texCoords = a.texCoords
    };
    a._getArrayBuffer = function () {
        return this._arrayBuffer
    };
    cc.defineGetterSetter(a, "tl", a._getTL, a._setTL);
    cc.defineGetterSetter(a, "tr", a._getTR, a._setTR);
    cc.defineGetterSetter(a, "bl", a._getBL, a._setBL);
    cc.defineGetterSetter(a, "br", a._getBR, a._setBR);
    cc.defineGetterSetter(a, "arrayBuffer", a._getArrayBuffer, null);
    cc.V3F_C4B_T2F_QuadZero = function () {
        return new cc.V3F_C4B_T2F_Quad
    };
    cc.V3F_C4B_T2F_QuadCopy = function (a) {
        if (!a)return cc.V3F_C4B_T2F_QuadZero();
        var c = a.tl, d = a.bl, e = a.tr;
        a = a.br;
        return {
            tl: {
                vertices: {x: c.vertices.x, y: c.vertices.y, z: c.vertices.z},
                colors: {r: c.colors.r, g: c.colors.g, b: c.colors.b, a: c.colors.a},
                texCoords: {u: c.texCoords.u, v: c.texCoords.v}
            },
            bl: {
                vertices: {x: d.vertices.x, y: d.vertices.y, z: d.vertices.z},
                colors: {r: d.colors.r, g: d.colors.g, b: d.colors.b, a: d.colors.a},
                texCoords: {u: d.texCoords.u, v: d.texCoords.v}
            },
            tr: {
                vertices: {x: e.vertices.x, y: e.vertices.y, z: e.vertices.z},
                colors: {r: e.colors.r, g: e.colors.g, b: e.colors.b, a: e.colors.a},
                texCoords: {u: e.texCoords.u, v: e.texCoords.v}
            },
            br: {
                vertices: {x: a.vertices.x, y: a.vertices.y, z: a.vertices.z},
                colors: {r: a.colors.r, g: a.colors.g, b: a.colors.b, a: a.colors.a},
                texCoords: {u: a.texCoords.u, v: a.texCoords.v}
            }
        }
    };
    cc.V3F_C4B_T2F_QuadsCopy = function (a) {
        if (!a)return [];
        for (var c = [], d = 0; d < a.length; d++)c.push(cc.V3F_C4B_T2F_QuadCopy(a[d]));
        return c
    };
    cc.V2F_C4B_T2F = function (a, c, d, e, f) {
        this._arrayBuffer = e || new ArrayBuffer(cc.V2F_C4B_T2F.BYTES_PER_ELEMENT);
        this._offset = f || 0;
        e = this._arrayBuffer;
        f = this._offset;
        var g = cc.Vertex2F.BYTES_PER_ELEMENT;
        this._vertices = a ? new cc.Vertex2F(a.x, a.y, e, f) : new cc.Vertex2F(0, 0, e, f);
        this._colors = c ? cc.color(c.r, c.g, c.b, c.a, e, f + g) : cc.color(0, 0, 0, 0, e, f + g);
        this._texCoords = d ? new cc.Tex2F(d.u, d.v, e, f + g + cc.Color.BYTES_PER_ELEMENT) : new cc.Tex2F(0, 0, e, f + g + cc.Color.BYTES_PER_ELEMENT)
    };
    cc.V2F_C4B_T2F.BYTES_PER_ELEMENT = 20;
    a = cc.V2F_C4B_T2F.prototype;
    a._getVertices = function () {
        return this._vertices
    };
    a._setVertices = function (a) {
        this._vertices.x = a.x;
        this._vertices.y = a.y
    };
    a._getColor = function () {
        return this._colors
    };
    a._setColor = function (a) {
        var c = this._colors;
        c.r = a.r;
        c.g = a.g;
        c.b = a.b;
        c.a = a.a
    };
    a._getTexCoords = function () {
        return this._texCoords
    };
    a._setTexCoords = function (a) {
        this._texCoords.u = a.u;
        this._texCoords.v = a.v
    };
    cc.defineGetterSetter(a, "vertices", a._getVertices, a._setVertices);
    cc.defineGetterSetter(a, "colors", a._getColor, a._setColor);
    cc.defineGetterSetter(a, "texCoords", a._getTexCoords, a._setTexCoords);
    cc.V2F_C4B_T2F_Triangle = function (a, c, d, e, f) {
        this._arrayBuffer = e || new ArrayBuffer(cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT);
        this._offset = f || 0;
        e = this._arrayBuffer;
        f = this._offset;
        var g = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
        this._a = a ? new cc.V2F_C4B_T2F(a.vertices, a.colors, a.texCoords, e, f) : new cc.V2F_C4B_T2F(null, null, null, e, f);
        this._b = c ? new cc.V2F_C4B_T2F(c.vertices, c.colors, c.texCoords, e, f + g) : new cc.V2F_C4B_T2F(null, null, null, e, f + g);
        this._c = d ? new cc.V2F_C4B_T2F(d.vertices, d.colors, d.texCoords, e, f + 2 * g) : new cc.V2F_C4B_T2F(null, null, null, e, f + 2 * g)
    };
    cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT = 60;
    a = cc.V2F_C4B_T2F_Triangle.prototype;
    a._getA = function () {
        return this._a
    };
    a._setA = function (a) {
        var c = this._a;
        c.vertices = a.vertices;
        c.colors = a.colors;
        c.texCoords = a.texCoords
    };
    a._getB = function () {
        return this._b
    };
    a._setB = function (a) {
        var c = this._b;
        c.vertices = a.vertices;
        c.colors = a.colors;
        c.texCoords = a.texCoords
    };
    a._getC = function () {
        return this._c
    };
    a._setC = function (a) {
        var c = this._c;
        c.vertices = a.vertices;
        c.colors = a.colors;
        c.texCoords = a.texCoords
    };
    cc.defineGetterSetter(a, "a", a._getA, a._setA);
    cc.defineGetterSetter(a, "b", a._getB, a._setB);
    cc.defineGetterSetter(a, "c", a._getC, a._setC)
};
cc._tmp.PrototypeColor = function () {
    var a = cc.color;
    a._getWhite = function () {
        return a(255, 255, 255)
    };
    a._getYellow = function () {
        return a(255, 255, 0)
    };
    a._getBlue = function () {
        return a(0, 0, 255)
    };
    a._getGreen = function () {
        return a(0, 255, 0)
    };
    a._getRed = function () {
        return a(255, 0, 0)
    };
    a._getMagenta = function () {
        return a(255, 0, 255)
    };
    a._getBlack = function () {
        return a(0, 0, 0)
    };
    a._getOrange = function () {
        return a(255, 127, 0)
    };
    a._getGray = function () {
        return a(166, 166, 166)
    };
    cc.defineGetterSetter(a, "WHITE", a._getWhite);
    cc.defineGetterSetter(a, "YELLOW", a._getYellow);
    cc.defineGetterSetter(a, "BLUE", a._getBlue);
    cc.defineGetterSetter(a, "GREEN", a._getGreen);
    cc.defineGetterSetter(a, "RED", a._getRed);
    cc.defineGetterSetter(a, "MAGENTA", a._getMagenta);
    cc.defineGetterSetter(a, "BLACK", a._getBlack);
    cc.defineGetterSetter(a, "ORANGE", a._getOrange);
    cc.defineGetterSetter(a, "GRAY", a._getGray);
    cc.BlendFunc._disable = function () {
        return new cc.BlendFunc(cc.ONE, cc.ZERO)
    };
    cc.BlendFunc._alphaPremultiplied = function () {
        return new cc.BlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA)
    };
    cc.BlendFunc._alphaNonPremultiplied = function () {
        return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)
    };
    cc.BlendFunc._additive = function () {
        return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE)
    };
    cc.defineGetterSetter(cc.BlendFunc, "DISABLE", cc.BlendFunc._disable);
    cc.defineGetterSetter(cc.BlendFunc, "ALPHA_PREMULTIPLIED", cc.BlendFunc._alphaPremultiplied);
    cc.defineGetterSetter(cc.BlendFunc, "ALPHA_NON_PREMULTIPLIED", cc.BlendFunc._alphaNonPremultiplied);
    cc.defineGetterSetter(cc.BlendFunc, "ADDITIVE", cc.BlendFunc._additive)
};
cc.Color = function (a, b, c, d) {
    this.r = a || 0;
    this.g = b || 0;
    this.b = c || 0;
    this.a = null == d ? 255 : d
};
cc.color = function (a, b, c, d) {
    return void 0 === a ? {r: 0, g: 0, b: 0, a: 255} : cc.isString(a) ? cc.hexToColor(a) : cc.isObject(a) ? {
        r: a.r,
        g: a.g,
        b: a.b,
        a: null == a.a ? 255 : a.a
    } : {r: a, g: b, b: c, a: null == d ? 255 : d}
};
cc.colorEqual = function (a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b
};
cc.Acceleration = function (a, b, c, d) {
    this.x = a || 0;
    this.y = b || 0;
    this.z = c || 0;
    this.timestamp = d || 0
};
cc.Vertex2F = function (a, b) {
    this.x = a || 0;
    this.y = b || 0
};
cc.vertex2 = function (a, b) {
    return new cc.Vertex2F(a, b)
};
cc.Vertex3F = function (a, b, c) {
    this.x = a || 0;
    this.y = b || 0;
    this.z = c || 0
};
cc.vertex3 = function (a, b, c) {
    return new cc.Vertex3F(a, b, c)
};
cc.Tex2F = function (a, b) {
    this.u = a || 0;
    this.v = b || 0
};
cc.tex2 = function (a, b) {
    return new cc.Tex2F(a, b)
};
cc.BlendFunc = function (a, b) {
    this.src = a;
    this.dst = b
};
cc.blendFuncDisable = function () {
    return new cc.BlendFunc(cc.ONE, cc.ZERO)
};
cc.hexToColor = function (a) {
    a = a.replace(/^#?/, "0x");
    a = parseInt(a);
    return cc.color(a >> 16, (a >> 8) % 256, a % 256)
};
cc.colorToHex = function (a) {
    var b = a.r.toString(16), c = a.g.toString(16), d = a.b.toString(16);
    return "#" + (16 > a.r ? "0" + b : b) + (16 > a.g ? "0" + c : c) + (16 > a.b ? "0" + d : d)
};
cc.TEXT_ALIGNMENT_LEFT = 0;
cc.TEXT_ALIGNMENT_CENTER = 1;
cc.TEXT_ALIGNMENT_RIGHT = 2;
cc.VERTICAL_TEXT_ALIGNMENT_TOP = 0;
cc.VERTICAL_TEXT_ALIGNMENT_CENTER = 1;
cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM = 2;
cc._Dictionary = cc.Class.extend({
    _keyMapTb: null, _valueMapTb: null, __currId: 0, ctor: function () {
        this._keyMapTb = {};
        this._valueMapTb = {};
        this.__currId = 2 << (0 | 10 * Math.random())
    }, __getKey: function () {
        this.__currId++;
        return "key_" + this.__currId
    }, setObject: function (a, b) {
        if (null != b) {
            var c = this.__getKey();
            this._keyMapTb[c] = b;
            this._valueMapTb[c] = a
        }
    }, objectForKey: function (a) {
        if (null == a)return null;
        var b = this._keyMapTb, c;
        for (c in b)
            if (b[c] === a)return this._valueMapTb[c];
        return null
    }, valueForKey: function (a) {
        return this.objectForKey(a)
    }, removeObjectForKey: function (a) {
        if (null != a) {
            var b = this._keyMapTb, c;
            for (c in b)
                if (b[c] === a) {
                    delete this._valueMapTb[c];
                    delete b[c];
                    break
                }
        }
    }, removeObjectsForKeys: function (a) {
        if (null != a)
            for (var b = 0; b < a.length; b++)this.removeObjectForKey(a[b])
    }, allKeys: function () {
        var a = [], b = this._keyMapTb, c;
        for (c in b)a.push(b[c]);
        return a
    }, removeAllObjects: function () {
        this._keyMapTb = {};
        this._valueMapTb = {}
    }, count: function () {
        return this.allKeys().length
    }
});
cc.FontDefinition = function (a) {
    this.fontName = "Arial";
    this.fontSize = 12;
    this.textAlign = cc.TEXT_ALIGNMENT_CENTER;
    this.verticalAlign = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
    this.fillStyle = cc.color(255, 255, 255, 255);
    this.boundingHeight = this.boundingWidth = 0;
    this.strokeEnabled = !1;
    this.strokeStyle = cc.color(255, 255, 255, 255);
    this.lineWidth = 1;
    this.fontWeight = this.fontStyle = this.lineHeight = "normal";
    this.shadowEnabled = !1;
    this.shadowBlur = this.shadowOffsetY = this.shadowOffsetX = 0;
    this.shadowOpacity = 1;
    if (a && a instanceof Object)
        for (var b in a)this[b] = a[b]
};
cc.FontDefinition.prototype._getCanvasFontStr = function () {
    return this.fontStyle + " " + this.fontWeight + " " + this.fontSize + "px/" + (this.lineHeight.charAt ? this.lineHeight : this.lineHeight + "px") + " '" + this.fontName + "'"
};
cc._renderType === cc._RENDER_TYPE_WEBGL && (cc.assert(cc.isFunction(cc._tmp.WebGLColor), cc._LogInfos.MissingFile, "CCTypesWebGL.js"), cc._tmp.WebGLColor(), delete cc._tmp.WebGLColor);
cc.assert(cc.isFunction(cc._tmp.PrototypeColor), cc._LogInfos.MissingFile, "CCTypesPropertyDefine.js");
cc._tmp.PrototypeColor();
delete cc._tmp.PrototypeColor;
cc.Touches = [];
cc.TouchesIntergerDict = {};
cc.DENSITYDPI_DEVICE = "device-dpi";
cc.DENSITYDPI_HIGH = "high-dpi";
cc.DENSITYDPI_MEDIUM = "medium-dpi";
cc.DENSITYDPI_LOW = "low-dpi";
cc.__BrowserGetter = {
    init: function () {
        this.html = document.getElementsByTagName("html")[0]
    }, availWidth: function (a) {
        return a && a !== this.html ? a.clientWidth : window.innerWidth
    }, availHeight: function (a) {
        return a && a !== this.html ? a.clientHeight : window.innerHeight
    }, meta: {width: "device-width", "user-scalable": "no"}, adaptationType: cc.sys.browserType
};
-1 < window.navigator.userAgent.indexOf("OS 8_1_") && (cc.__BrowserGetter.adaptationType = cc.sys.BROWSER_TYPE_MIUI);
cc.sys.os === cc.sys.OS_IOS && (cc.__BrowserGetter.adaptationType = cc.sys.BROWSER_TYPE_SAFARI);
switch (cc.__BrowserGetter.adaptationType) {
    case cc.sys.BROWSER_TYPE_SAFARI:
        cc.__BrowserGetter.meta["minimal-ui"] = "true";
        cc.__BrowserGetter.availWidth = function (a) {
            return a.clientWidth
        };
        cc.__BrowserGetter.availHeight = function (a) {
            return a.clientHeight
        };
        break;
    case cc.sys.BROWSER_TYPE_CHROME:
        cc.__BrowserGetter.__defineGetter__("target-densitydpi", function () {
            return cc.view._targetDensityDPI
        });
    case cc.sys.BROWSER_TYPE_SOUGOU:
    case cc.sys.BROWSER_TYPE_UC:
        cc.__BrowserGetter.availWidth = function (a) {
            return a.clientWidth
        };
        cc.__BrowserGetter.availHeight = function (a) {
            return a.clientHeight
        };
        break;
    case cc.sys.BROWSER_TYPE_MIUI:
        cc.__BrowserGetter.init = function (a) {
            if (!a.__resizeWithBrowserSize) {
                var b = function () {
                    a.setDesignResolutionSize(a._designResolutionSize.width, a._designResolutionSize.height, a._resolutionPolicy);
                    window.removeEventListener("resize", b, !1)
                };
                window.addEventListener("resize", b, !1)
            }
        }
}
cc.EGLView = cc.Class.extend({
    _delegate: null,
    _frameSize: null,
    _designResolutionSize: null,
    _originalDesignResolutionSize: null,
    _viewPortRect: null,
    _visibleRect: null,
    _retinaEnabled: !1,
    _autoFullScreen: !0,
    _devicePixelRatio: 1,
    _viewName: "",
    _resizeCallback: null,
    _scaleX: 1,
    _originalScaleX: 1,
    _scaleY: 1,
    _originalScaleY: 1,
    _indexBitsUsed: 0,
    _maxTouches: 5,
    _resolutionPolicy: null,
    _rpExactFit: null,
    _rpShowAll: null,
    _rpNoBorder: null,
    _rpFixedHeight: null,
    _rpFixedWidth: null,
    _initialized: !1,
    _captured: !1,
    _wnd: null,
    _hDC: null,
    _hRC: null,
    _supportTouch: !1,
    _contentTranslateLeftTop: null,
    _frame: null,
    _frameZoomFactor: 1,
    __resizeWithBrowserSize: !1,
    _isAdjustViewPort: !0,
    _targetDensityDPI: null,
    ctor: function () {
        var a = document, b = cc.ContainerStrategy, c = cc.ContentStrategy;
        cc.__BrowserGetter.init(this);
        this._frame = cc.container.parentNode === a.body ? a.documentElement : cc.container.parentNode;
        this._frameSize = cc.size(0, 0);
        this._initFrameSize();
        var a = cc._canvas.width, d = cc._canvas.height;
        this._designResolutionSize = cc.size(a, d);
        this._originalDesignResolutionSize = cc.size(a, d);
        this._viewPortRect = cc.rect(0, 0, a, d);
        this._visibleRect = cc.rect(0, 0, a, d);
        this._contentTranslateLeftTop = {left: 0, top: 0};
        this._viewName = "Cocos2dHTML5";
        a = cc.sys;
        this.enableRetina(a.os === a.OS_IOS || a.os === a.OS_OSX);
        cc.visibleRect && cc.visibleRect.init(this._visibleRect);
        this._rpExactFit = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.EXACT_FIT);
        this._rpShowAll = new cc.ResolutionPolicy(b.PROPORTION_TO_FRAME, c.SHOW_ALL);
        this._rpNoBorder = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.NO_BORDER);
        this._rpFixedHeight = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.FIXED_HEIGHT);
        this._rpFixedWidth = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.FIXED_WIDTH);
        this._hDC = cc._canvas;
        this._hRC = cc._renderContext;
        this._targetDensityDPI = cc.DENSITYDPI_HIGH
    },
    _resizeEvent: function () {
        var a;
        a = this.setDesignResolutionSize ? this : cc.view;
        var b = a._frameSize.width, c = a._frameSize.height;
        a._initFrameSize();
        if (a._frameSize.width !== b || a._frameSize.height !== c)a._resizeCallback && a._resizeCallback.call(), b = a._originalDesignResolutionSize.width, c = a._originalDesignResolutionSize.height, 0 < b && a.setDesignResolutionSize(b, c, a._resolutionPolicy)
    },
    setTargetDensityDPI: function (a) {
        this._targetDensityDPI = a;
        this._setViewPortMeta()
    },
    getTargetDensityDPI: function () {
        return this._targetDensityDPI
    },
    resizeWithBrowserSize: function (a) {
        a ? this.__resizeWithBrowserSize || (this.__resizeWithBrowserSize = !0, cc._addEventListener(window, "resize", this._resizeEvent), cc._addEventListener(window, "orientationchange", this._resizeEvent)) : this.__resizeWithBrowserSize && (this.__resizeWithBrowserSize = !1, window.removeEventListener("resize", this._resizeEvent), window.removeEventListener("orientationchange", this._resizeEvent))
    },
    setResizeCallback: function (a) {
        if (cc.isFunction(a) || null == a)this._resizeCallback = a
    },
    _initFrameSize: function () {
        var a = this._frameSize;
        a.width = cc.__BrowserGetter.availWidth(this._frame);
        a.height = cc.__BrowserGetter.availHeight(this._frame)
    },
    _adjustSizeKeepCanvasSize: function () {
        var a = this._originalDesignResolutionSize.width, b = this._originalDesignResolutionSize.height;
        0 < a && this.setDesignResolutionSize(a, b, this._resolutionPolicy)
    },
    _setViewPortMeta: function () {
        if (this._isAdjustViewPort) {
            var a = document.getElementById("cocosMetaElement");
            a && document.head.removeChild(a);
            var b, c = (a = document.getElementsByName("viewport")) ? a[0] : null, d, a = cc.newElement("meta");
            a.id = "cocosMetaElement";
            a.name = "viewport";
            a.content = "";
            b = cc.__BrowserGetter.meta;
            d = c ? c.content : "";
            for (var e in b)RegExp(e).test(d) || (d += "," + e + "\x3d" + b[e]);
            /^,/.test(d) && (d = d.substr(1));
            a.content = d;
            c && (c.content = d);
            document.head.appendChild(a)
        }
    },
    _setScaleXYForRenderTexture: function () {
        var a =
            cc.contentScaleFactor();
        this._scaleY = this._scaleX = a
    },
    _resetScale: function () {
        this._scaleX = this._originalScaleX;
        this._scaleY = this._originalScaleY
    },
    _adjustSizeToBrowser: function () {
    },
    initialize: function () {
        this._initialized = !0
    },
    adjustViewPort: function (a) {
        this._isAdjustViewPort = a
    },
    enableRetina: function (a) {
        this._retinaEnabled = a ? !0 : !1
    },
    isRetinaEnabled: function () {
        return this._retinaEnabled
    },
    enableAutoFullScreen: function (a) {
        this._autoFullScreen = a ? !0 : !1
    },
    isAutoFullScreenEnabled: function () {
        return this._autoFullScreen
    },
    end: function () {
    },
    isOpenGLReady: function () {
        return null !== this._hDC && null !== this._hRC
    },
    setFrameZoomFactor: function (a) {
        this._frameZoomFactor = a;
        this.centerWindow();
        cc.director.setProjection(cc.director.getProjection())
    },
    swapBuffers: function () {
    },
    setIMEKeyboardState: function (a) {
    },
    setContentTranslateLeftTop: function (a, b) {
        this._contentTranslateLeftTop = {
            left: a,
            top: b
        }
    },
    getContentTranslateLeftTop: function () {
        return this._contentTranslateLeftTop
    },
    getFrameSize: function () {
        return cc.size(this._frameSize.width, this._frameSize.height)
    },
    setFrameSize: function (a, b) {
        this._frameSize.width = a;
        this._frameSize.height = b;
        this._frame.style.width = a + "px";
        this._frame.style.height = b + "px";
        this._resizeEvent();
        cc.director.setProjection(cc.director.getProjection())
    },
    centerWindow: function () {
    },
    getVisibleSize: function () {
        return cc.size(this._visibleRect.width, this._visibleRect.height)
    },
    getVisibleOrigin: function () {
        return cc.p(this._visibleRect.x, this._visibleRect.y)
    },
    canSetContentScaleFactor: function () {
        return !0
    },
    getResolutionPolicy: function () {
        return this._resolutionPolicy
    },
    setResolutionPolicy: function (a) {
        if (a instanceof cc.ResolutionPolicy) this._resolutionPolicy = a;
        else {
            var b = cc.ResolutionPolicy;
            a === b.EXACT_FIT && (this._resolutionPolicy = this._rpExactFit);
            a === b.SHOW_ALL && (this._resolutionPolicy = this._rpShowAll);
            a === b.NO_BORDER && (this._resolutionPolicy = this._rpNoBorder);
            a === b.FIXED_HEIGHT && (this._resolutionPolicy = this._rpFixedHeight);
            a === b.FIXED_WIDTH && (this._resolutionPolicy = this._rpFixedWidth)
        }
    },
    setDesignResolutionSize: function (a, b, c) {
        if (0 < a || 0 < b)
            if (this.setResolutionPolicy(c),
                    c = this._resolutionPolicy) {
                c.preApply(this);
                cc.sys.isMobile && this._setViewPortMeta();
                this._initFrameSize();
                this._originalDesignResolutionSize.width = this._designResolutionSize.width = a;
                this._originalDesignResolutionSize.height = this._designResolutionSize.height = b;
                var d = c.apply(this, this._designResolutionSize);
                d.scale && 2 === d.scale.length && (this._scaleX = d.scale[0], this._scaleY = d.scale[1]);
                d.viewport && (a = this._viewPortRect, b = this._visibleRect, d = d.viewport, a.x = d.x, a.y = d.y, a.width = d.width, a.height = d.height,
                    b.x = -a.x / this._scaleX, b.y = -a.y / this._scaleY, b.width = cc._canvas.width / this._scaleX, b.height = cc._canvas.height / this._scaleY, cc._renderContext.setOffset && cc._renderContext.setOffset(a.x, -a.y));
                a = cc.director;
                a._winSizeInPoints.width = this._designResolutionSize.width;
                a._winSizeInPoints.height = this._designResolutionSize.height;
                c.postApply(this);
                cc.winSize.width = a._winSizeInPoints.width;
                cc.winSize.height = a._winSizeInPoints.height;
                cc._renderType === cc._RENDER_TYPE_WEBGL && (a._createStatsLabel(), a.setGLDefaultValues());
                this._originalScaleX = this._scaleX;
                this._originalScaleY = this._scaleY;
                cc.DOM && cc.DOM._resetEGLViewDiv();
                cc.visibleRect && cc.visibleRect.init(this._visibleRect)
            } else cc.log(cc._LogInfos.EGLView_setDesignResolutionSize_2); else cc.log(cc._LogInfos.EGLView_setDesignResolutionSize)
    },
    getDesignResolutionSize: function () {
        return cc.size(this._designResolutionSize.width, this._designResolutionSize.height)
    },
    setViewPortInPoints: function (a, b, c, d) {
        var e = this._frameZoomFactor, f = this._scaleX, g = this._scaleY;
        cc._renderContext.viewport(a * f * e + this._viewPortRect.x * e, b * g * e + this._viewPortRect.y * e, c * f * e, d * g * e)
    },
    setScissorInPoints: function (a, b, c, d) {
        var e = this._frameZoomFactor, f = this._scaleX, g = this._scaleY;
        cc._renderContext.scissor(a * f * e + this._viewPortRect.x * e, b * g * e + this._viewPortRect.y * e, c * f * e, d * g * e)
    },
    isScissorEnabled: function () {
        var a = cc._renderContext;
        return a.isEnabled(a.SCISSOR_TEST)
    },
    getScissorRect: function () {
        var a = cc._renderContext, b = this._scaleX, c = this._scaleY, a = a.getParameter(a.SCISSOR_BOX);
        return cc.rect((a[0] - this._viewPortRect.x) / b, (a[1] - this._viewPortRect.y) / c, a[2] / b, a[3] / c)
    },
    setViewName: function (a) {
        null != a && 0 < a.length && (this._viewName = a)
    },
    getViewName: function () {
        return this._viewName
    },
    getViewPortRect: function () {
        return this._viewPortRect
    },
    getScaleX: function () {
        return this._scaleX
    },
    getScaleY: function () {
        return this._scaleY
    },
    getDevicePixelRatio: function () {
        return this._devicePixelRatio
    },
    convertToLocationInView: function (a, b, c) {
        return {x: this._devicePixelRatio * (a - c.left), y: this._devicePixelRatio * (c.top + c.height - b)}
    },
    _convertMouseToLocationInView: function (a, b) {
        var c = this._viewPortRect;
        a.x = (this._devicePixelRatio * (a.x - b.left) - c.x) / this._scaleX;
        a.y = (this._devicePixelRatio * (b.top + b.height - a.y) - c.y) / this._scaleY
    },
    _convertTouchesWithScale: function (a) {
        for (var b = this._viewPortRect, c = this._scaleX, d = this._scaleY, e, f, g, h = 0; h < a.length; h++)e = a[h], f = e._point, g = e._prevPoint, e._setPoint((f.x - b.x) / c, (f.y - b.y) / d), e._setPrevPoint((g.x - b.x) / c, (g.y - b.y) / d)
    }
});
cc.EGLView._getInstance = function () {
    this._instance || (this._instance = this._instance || new cc.EGLView, this._instance.initialize());
    return this._instance
};
cc.ContainerStrategy = cc.Class.extend({
    preApply: function (a) {
    }, apply: function (a, b) {
    }, postApply: function (a) {
    }, _setupContainer: function (a, b, c) {
        var d = a._frame;
        cc.view._autoFullScreen && cc.sys.isMobile && d === document.documentElement && cc.screen.autoFullScreen(d);
        var d = cc._canvas, e = cc.container;
        e.style.width = d.style.width = b + "px";
        e.style.height = d.style.height = c + "px";
        e = a._devicePixelRatio = 1;
        a.isRetinaEnabled() && (e = a._devicePixelRatio = window.devicePixelRatio || 1);
        d.width = b * e;
        d.height = c * e;
        cc._renderContext.resetCache && cc._renderContext.resetCache();
        a = document.body;
        var f;
        a && (f = a.style) && (f.paddingTop = f.paddingTop || "0px", f.paddingRight = f.paddingRight || "0px", f.paddingBottom = f.paddingBottom || "0px", f.paddingLeft = f.paddingLeft || "0px", f.borderTop = f.borderTop || "0px", f.borderRight = f.borderRight || "0px", f.borderBottom = f.borderBottom || "0px", f.borderLeft = f.borderLeft || "0px", f.marginTop = f.marginTop || "0px", f.marginRight = f.marginRight || "0px", f.marginBottom = f.marginBottom || "0px", f.marginLeft = f.marginLeft || "0px")
    }, _fixContainer: function () {
        document.body.insertBefore(cc.container, document.body.firstChild);
        var a = document.body.style;
        a.width = window.innerWidth + "px";
        a.height = window.innerHeight + "px";
        a.overflow = "hidden";
        a = cc.container.style;
        a.position = "fixed";
        a.left = a.top = "0px";
        document.body.scrollTop = 0
    }
});
cc.ContentStrategy = cc.Class.extend({
    _result: {scale: [1, 1], viewport: null},
    _buildResult: function (a, b, c, d, e, f) {
        2 > Math.abs(a - c) && (c = a);
        2 > Math.abs(b - d) && (d = b);
        a = cc.rect(Math.round((a - c) / 2), Math.round((b - d) / 2), c, d);
        this._result.scale = [e, f];
        this._result.viewport = a;
        return this._result
    },
    preApply: function (a) {
    },
    apply: function (a, b) {
        return {scale: [1, 1]}
    },
    postApply: function (a) {
    }
});
(function () {
    var a = cc.ContainerStrategy.extend({
        apply: function (a) {
            this._setupContainer(a, a._frameSize.width, a._frameSize.height)
        }
    }), b = cc.ContainerStrategy.extend({
        apply: function (a, b) {
            var c = a._frameSize.width, d = a._frameSize.height, e = cc.container.style, n = b.width, p = b.height, s = c / n, r = d / p, u, t;
            s < r ? (u = c, t = p * s) : (u = n * r, t = d);
            n = Math.round((c - u) / 2);
            t = Math.round((d - t) / 2);
            this._setupContainer(a, c - 2 * n, d - 2 * t);
            e.marginLeft = n + "px";
            e.marginRight = n + "px";
            e.marginTop = t + "px";
            e.marginBottom = t + "px"
        }
    });
    a.extend({
        preApply: function (a) {
            this._super(a);
            a._frame = document.documentElement
        }, apply: function (a) {
            this._super(a);
            this._fixContainer()
        }
    });
    b.extend({
        preApply: function (a) {
            this._super(a);
            a._frame = document.documentElement
        }, apply: function (a, b) {
            this._super(a, b);
            this._fixContainer()
        }
    });
    var c = cc.ContainerStrategy.extend({
        apply: function (a) {
            this._setupContainer(a, cc._canvas.width, cc._canvas.height)
        }
    });
    cc.ContainerStrategy.EQUAL_TO_FRAME = new a;
    cc.ContainerStrategy.PROPORTION_TO_FRAME = new b;
    cc.ContainerStrategy.ORIGINAL_CONTAINER = new c;
    var a = cc.ContentStrategy.extend({
        apply: function (a, b) {
            var c = cc._canvas.width, d = cc._canvas.height;
            return this._buildResult(c, d, c, d, c / b.width, d / b.height)
        }
    }), b = cc.ContentStrategy.extend({
        apply: function (a, b) {
            var c = cc._canvas.width, d = cc._canvas.height, e = b.width, n = b.height, p = c / e, s = d / n, r = 0, u, t;
            p < s ? (r = p, u = c, t = n * r) : (r = s, u = e * r, t = d);
            return this._buildResult(c, d, u, t, r, r)
        }
    }), c = cc.ContentStrategy.extend({
        apply: function (a, b) {
            var c = cc._canvas.width, d = cc._canvas.height, e = b.width, n = b.height, p = c / e, s = d / n, r, u, t;
            p < s ? (r = s, u = e * r, t = d) : (r = p, u = c, t = n * r);
            return this._buildResult(c, d, u, t, r, r)
        }
    }), d = cc.ContentStrategy.extend({
        apply: function (a, b) {
            var c = cc._canvas.width, d = cc._canvas.height, e = d / b.height;
            return this._buildResult(c, d, c, d, e, e)
        }, postApply: function (a) {
            cc.director._winSizeInPoints = a.getVisibleSize()
        }
    }), e = cc.ContentStrategy.extend({
        apply: function (a, b) {
            var c = cc._canvas.width, d = cc._canvas.height, e = c / b.width;
            return this._buildResult(c, d, c, d, e, e)
        }, postApply: function (a) {
            cc.director._winSizeInPoints = a.getVisibleSize()
        }
    });
    cc.ContentStrategy.EXACT_FIT = new a;
    cc.ContentStrategy.SHOW_ALL = new b;
    cc.ContentStrategy.NO_BORDER = new c;
    cc.ContentStrategy.FIXED_HEIGHT = new d;
    cc.ContentStrategy.FIXED_WIDTH = new e
})();
cc.ResolutionPolicy = cc.Class.extend({
    _containerStrategy: null, _contentStrategy: null, ctor: function (a, b) {
        this.setContainerStrategy(a);
        this.setContentStrategy(b)
    }, preApply: function (a) {
        this._containerStrategy.preApply(a);
        this._contentStrategy.preApply(a)
    }, apply: function (a, b) {
        this._containerStrategy.apply(a, b);
        return this._contentStrategy.apply(a, b)
    }, postApply: function (a) {
        this._containerStrategy.postApply(a);
        this._contentStrategy.postApply(a)
    }, setContainerStrategy: function (a) {
        a instanceof cc.ContainerStrategy && (this._containerStrategy = a)
    }, setContentStrategy: function (a) {
        a instanceof cc.ContentStrategy && (this._contentStrategy = a)
    }
});
cc.ResolutionPolicy.EXACT_FIT = 0;
cc.ResolutionPolicy.NO_BORDER = 1;
cc.ResolutionPolicy.SHOW_ALL = 2;
cc.ResolutionPolicy.FIXED_HEIGHT = 3;
cc.ResolutionPolicy.FIXED_WIDTH = 4;
cc.ResolutionPolicy.UNKNOWN = 5;
cc.screen = {
    _supportsFullScreen: !1,
    _preOnFullScreenChange: null,
    _touchEvent: "",
    _fn: null,
    _fnMap: [["requestFullscreen", "exitFullscreen", "fullscreenchange", "fullscreenEnabled", "fullscreenElement"], ["requestFullScreen", "exitFullScreen", "fullScreenchange", "fullScreenEnabled", "fullScreenElement"], ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitIsFullScreen", "webkitCurrentFullScreenElement"], ["mozRequestFullScreen", "mozCancelFullScreen", "mozfullscreenchange", "mozFullScreen", "mozFullScreenElement"], ["msRequestFullscreen", "msExitFullscreen", "MSFullscreenChange", "msFullscreenEnabled", "msFullscreenElement"]],
    init: function () {
        this._fn = {};
        var a, b, c = this._fnMap, d;
        a = 0;
        for (l = c.length; a < l; a++)
            if ((b = c[a]) && b[1]in document) {
                a = 0;
                for (d = b.length; a < d; a++)this._fn[c[0][a]] = b[a];
                break
            }
        this._supportsFullScreen = "undefined" !== typeof this._fn.requestFullscreen;
        this._touchEvent = "ontouchstart"in window ? "touchstart" : "mousedown"
    },
    fullScreen: function () {
        return this._supportsFullScreen && document[this._fn.fullscreenElement]
    },
    requestFullScreen: function (a, b) {
        if (this._supportsFullScreen) {
            a = a || document.documentElement;
            if (b) {
                var c = this._fn.fullscreenchange;
                this._preOnFullScreenChange && document.removeEventListener(c, this._preOnFullScreenChange);
                this._preOnFullScreenChange = b;
                cc._addEventListener(document, c, b, !1)
            }
            return a[this._fn.requestFullscreen]()
        }
    },
    exitFullScreen: function () {
        return this._supportsFullScreen ? document[this._fn.exitFullscreen]() : !0
    },
    autoFullScreen: function (a, b) {
        function c() {
            e.requestFullScreen(a, b);
            d.removeEventListener(e._touchEvent, c)
        }

        a = a || document.body;
        var d = cc._canvas || a, e = this;
        this.requestFullScreen(a, b);
        cc._addEventListener(d, this._touchEvent, c)
    }
};
cc.screen.init();
cc.visibleRect = {
    topLeft: cc.p(0, 0),
    topRight: cc.p(0, 0),
    top: cc.p(0, 0),
    bottomLeft: cc.p(0, 0),
    bottomRight: cc.p(0, 0),
    bottom: cc.p(0, 0),
    center: cc.p(0, 0),
    left: cc.p(0, 0),
    right: cc.p(0, 0),
    width: 0,
    height: 0,
    init: function (a) {
        var b = this.width = a.width, c = this.height = a.height, d = a.x;
        a = a.y;
        var e = a + c, f = d + b;
        this.topLeft.x = d;
        this.topLeft.y = e;
        this.topRight.x = f;
        this.topRight.y = e;
        this.top.x = d + b / 2;
        this.top.y = e;
        this.bottomLeft.x = d;
        this.bottomLeft.y = a;
        this.bottomRight.x = f;
        this.bottomRight.y = a;
        this.bottom.x = d + b / 2;
        this.bottom.y = a;
        this.center.x = d + b / 2;
        this.center.y = a + c / 2;
        this.left.x = d;
        this.left.y = a + c / 2;
        this.right.x = f;
        this.right.y = a + c / 2
    }
};
cc.UIInterfaceOrientationLandscapeLeft = -90;
cc.UIInterfaceOrientationLandscapeRight = 90;
cc.UIInterfaceOrientationPortraitUpsideDown = 180;
cc.UIInterfaceOrientationPortrait = 0;
cc.inputManager = {
    _mousePressed: !1,
    _isRegisterEvent: !1,
    _preTouchPoint: cc.p(0, 0),
    _prevMousePoint: cc.p(0, 0),
    _preTouchPool: [],
    _preTouchPoolPointer: 0,
    _touches: [],
    _touchesIntegerDict: {},
    _indexBitsUsed: 0,
    _maxTouches: 5,
    _accelEnabled: !1,
    _accelInterval: 1 / 30,
    _accelMinus: 1,
    _accelCurTime: 0,
    _acceleration: null,
    _accelDeviceEvent: null,
    _getUnUsedIndex: function () {
        for (var a = this._indexBitsUsed, b = 0; b < this._maxTouches; b++) {
            if (!(a & 1))return this._indexBitsUsed |= 1 << b, b;
            a >>= 1
        }
        return -1
    },
    _removeUsedIndexBit: function (a) {
        0 > a || a >= this._maxTouches || (a = ~(1 << a), this._indexBitsUsed &= a)
    },
    _glView: null,
    handleTouchesBegin: function (a) {
        for (var b, c, d, e = [], f = this._touchesIntegerDict, g = 0, h = a.length; g < h; g++)
            if (b = a[g], d = b.getID(), c = f[d], null == c) {
                var k = this._getUnUsedIndex();
                -1 === k ? cc.log(cc._LogInfos.inputManager_handleTouchesBegin, k) : (c = this._touches[k] = new cc.Touch(b._point.x, b._point.y, b.getID()), c._setPrevPoint(b._prevPoint), f[d] = k, e.push(c))
            }
        0 < e.length && (this._glView._convertTouchesWithScale(e), a = new cc.EventTouch(e), a._eventCode = cc.EventTouch.EventCode.BEGAN, cc.eventManager.dispatchEvent(a))
    },
    handleTouchesMove: function (a) {
        for (var b, c, d = [], e = this._touches, f = 0, g = a.length; f < g; f++)b = a[f], c = b.getID(), c = this._touchesIntegerDict[c], null != c && e[c] && (e[c]._setPoint(b._point), e[c]._setPrevPoint(b._prevPoint), d.push(e[c]));
        0 < d.length && (this._glView._convertTouchesWithScale(d), a = new cc.EventTouch(d), a._eventCode = cc.EventTouch.EventCode.MOVED, cc.eventManager.dispatchEvent(a))
    },
    handleTouchesEnd: function (a) {
        a = this.getSetOfTouchesEndOrCancel(a);
        0 < a.length && (this._glView._convertTouchesWithScale(a), a = new cc.EventTouch(a), a._eventCode = cc.EventTouch.EventCode.ENDED, cc.eventManager.dispatchEvent(a))
    },
    handleTouchesCancel: function (a) {
        a = this.getSetOfTouchesEndOrCancel(a);
        0 < a.length && (this._glView._convertTouchesWithScale(a), a = new cc.EventTouch(a), a._eventCode = cc.EventTouch.EventCode.CANCELLED, cc.eventManager.dispatchEvent(a))
    },
    getSetOfTouchesEndOrCancel: function (a) {
        for (var b, c, d, e = [], f = this._touches, g = this._touchesIntegerDict, h = 0, k = a.length; h < k; h++)b = a[h], d = b.getID(), c = g[d], null != c && f[c] && (f[c]._setPoint(b._point), f[c]._setPrevPoint(b._prevPoint), e.push(f[c]), this._removeUsedIndexBit(c), delete g[d]);
        return e
    },
    getHTMLElementPosition: function (a) {
        var b = document.documentElement, c = window, d = null, d = cc.isFunction(a.getBoundingClientRect) ? a.getBoundingClientRect() : a instanceof HTMLCanvasElement ? {
            left: 0,
            top: 0,
            width: a.width,
            height: a.height
        } : {left: 0, top: 0, width: parseInt(a.style.width), height: parseInt(a.style.height)};
        return {
            left: d.left + c.pageXOffset - b.clientLeft,
            top: d.top + c.pageYOffset - b.clientTop,
            width: d.width,
            height: d.height
        }
    },
    getPreTouch: function (a) {
        for (var b = null, c = this._preTouchPool, d = a.getID(), e = c.length - 1; 0 <= e; e--)
            if (c[e].getID() === d) {
                b = c[e];
                break
            }
        b || (b = a);
        return b
    },
    setPreTouch: function (a) {
        for (var b = !1, c = this._preTouchPool, d = a.getID(), e = c.length - 1; 0 <= e; e--)
            if (c[e].getID() === d) {
                c[e] = a;
                b = !0;
                break
            }
        b || (50 >= c.length ? c.push(a) : (c[this._preTouchPoolPointer] = a, this._preTouchPoolPointer = (this._preTouchPoolPointer + 1) % 50))
    },
    getTouchByXY: function (a, b, c) {
        var d = this._preTouchPoint;
        a = this._glView.convertToLocationInView(a, b, c);
        b = new cc.Touch(a.x, a.y);
        b._setPrevPoint(d.x, d.y);
        d.x = a.x;
        d.y = a.y;
        return b
    },
    getMouseEvent: function (a, b, c) {
        var d = this._prevMousePoint;
        this._glView._convertMouseToLocationInView(a, b);
        b = new cc.EventMouse(c);
        b.setLocation(a.x, a.y);
        b._setPrevCursor(d.x, d.y);
        d.x = a.x;
        d.y = a.y;
        return b
    },
    getPointByEvent: function (a, b) {
        if (null != a.pageX)return {x: a.pageX, y: a.pageY};
        b.left -= document.body.scrollLeft;
        b.top -= document.body.scrollTop;
        return {x: a.clientX, y: a.clientY}
    },
    getTouchesByEvent: function (a, b) {
        for (var c = [], d = this._glView, e, f, g = this._preTouchPoint, h = a.changedTouches.length, k = 0; k < h; k++)
            if (e = a.changedTouches[k]) {
                var m;
                m = cc.sys.BROWSER_TYPE_FIREFOX === cc.sys.browserType ? d.convertToLocationInView(e.pageX, e.pageY, b) : d.convertToLocationInView(e.clientX, e.clientY, b);
                null != e.identifier ? (e = new cc.Touch(m.x, m.y, e.identifier), f = this.getPreTouch(e).getLocation(), e._setPrevPoint(f.x, f.y), this.setPreTouch(e)) : (e = new cc.Touch(m.x, m.y), e._setPrevPoint(g.x, g.y));
                g.x = m.x;
                g.y = m.y;
                c.push(e)
            }
        return c
    },
    registerSystemEvent: function (a) {
        if (!this._isRegisterEvent) {
            this._glView = cc.view;
            var b = this, c = "mouse"in cc.sys.capabilities, d = "touches"in cc.sys.capabilities, e = !1;
            cc.sys.isMobile && (e = !0);
            c && (cc._addEventListener(window, "mousedown", function () {
                b._mousePressed = !0
            }, !1), cc._addEventListener(window, "mouseup", function (c) {
                if (!e) {
                    var d = b._mousePressed;
                    b._mousePressed = !1;
                    if (d) {
                        var d = b.getHTMLElementPosition(a), f = b.getPointByEvent(c, d);
                        cc.rectContainsPoint(new cc.Rect(d.left, d.top, d.width, d.height), f) || (b.handleTouchesEnd([b.getTouchByXY(f.x, f.y, d)]), d = b.getMouseEvent(f, d, cc.EventMouse.UP), d.setButton(c.button), cc.eventManager.dispatchEvent(d))
                    }
                }
            }, !1), cc._addEventListener(a, "mousedown", function (c) {
                if (!e) {
                    b._mousePressed = !0;
                    var d = b.getHTMLElementPosition(a), f = b.getPointByEvent(c, d);
                    b.handleTouchesBegin([b.getTouchByXY(f.x, f.y, d)]);
                    d = b.getMouseEvent(f, d, cc.EventMouse.DOWN);
                    d.setButton(c.button);
                    cc.eventManager.dispatchEvent(d);
                    c.stopPropagation();
                    c.preventDefault();
                    a.focus()
                }
            }, !1), cc._addEventListener(a, "mouseup", function (c) {
                if (!e) {
                    b._mousePressed = !1;
                    var d = b.getHTMLElementPosition(a), f = b.getPointByEvent(c, d);
                    b.handleTouchesEnd([b.getTouchByXY(f.x, f.y, d)]);
                    d = b.getMouseEvent(f, d, cc.EventMouse.UP);
                    d.setButton(c.button);
                    cc.eventManager.dispatchEvent(d);
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1), cc._addEventListener(a, "mousemove", function (c) {
                if (!e) {
                    var d = b.getHTMLElementPosition(a), f = b.getPointByEvent(c, d);
                    b.handleTouchesMove([b.getTouchByXY(f.x, f.y, d)]);
                    d = b.getMouseEvent(f, d, cc.EventMouse.MOVE);
                    b._mousePressed ? d.setButton(c.button) : d.setButton(null);
                    cc.eventManager.dispatchEvent(d);
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1), cc._addEventListener(a, "mousewheel", function (c) {
                var d = b.getHTMLElementPosition(a), e = b.getPointByEvent(c, d), d = b.getMouseEvent(e, d, cc.EventMouse.SCROLL);
                d.setButton(c.button);
                d.setScrollData(0, c.wheelDelta);
                cc.eventManager.dispatchEvent(d);
                c.stopPropagation();
                c.preventDefault()
            }, !1), cc._addEventListener(a, "DOMMouseScroll", function (c) {
                var d = b.getHTMLElementPosition(a), e = b.getPointByEvent(c, d), d = b.getMouseEvent(e, d, cc.EventMouse.SCROLL);
                d.setButton(c.button);
                d.setScrollData(0, -120 * c.detail);
                cc.eventManager.dispatchEvent(d);
                c.stopPropagation();
                c.preventDefault()
            }, !1));
            if (window.navigator.msPointerEnabled) {
                var c = {
                    MSPointerDown: b.handleTouchesBegin,
                    MSPointerMove: b.handleTouchesMove,
                    MSPointerUp: b.handleTouchesEnd,
                    MSPointerCancel: b.handleTouchesCancel
                }, f;
                for (f in c)(function (c, d) {
                    cc._addEventListener(a, c, function (c) {
                        var e = b.getHTMLElementPosition(a);
                        e.left -= document.documentElement.scrollLeft;
                        e.top -= document.documentElement.scrollTop;
                        d.call(b, [b.getTouchByXY(c.clientX, c.clientY, e)]);
                        c.stopPropagation()
                    }, !1)
                })(f, c[f])
            }
            d && (cc._addEventListener(a, "touchstart", function (c) {
                if (c.changedTouches) {
                    var d = b.getHTMLElementPosition(a);
                    d.left -= document.body.scrollLeft;
                    d.top -= document.body.scrollTop;
                    b.handleTouchesBegin(b.getTouchesByEvent(c, d));
                    c.stopPropagation();
                    c.preventDefault();
                    a.focus()
                }
            }, !1), cc._addEventListener(a, "touchmove", function (c) {
                if (c.changedTouches) {
                    var d = b.getHTMLElementPosition(a);
                    d.left -= document.body.scrollLeft;
                    d.top -= document.body.scrollTop;
                    b.handleTouchesMove(b.getTouchesByEvent(c, d));
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1), cc._addEventListener(a, "touchend", function (c) {
                if (c.changedTouches) {
                    var d = b.getHTMLElementPosition(a);
                    d.left -= document.body.scrollLeft;
                    d.top -= document.body.scrollTop;
                    b.handleTouchesEnd(b.getTouchesByEvent(c, d));
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1), cc._addEventListener(a, "touchcancel", function (c) {
                if (c.changedTouches) {
                    var d = b.getHTMLElementPosition(a);
                    d.left -= document.body.scrollLeft;
                    d.top -= document.body.scrollTop;
                    b.handleTouchesCancel(b.getTouchesByEvent(c, d));
                    c.stopPropagation();
                    c.preventDefault()
                }
            }, !1));
            this._registerKeyboardEvent();
            this._registerAccelerometerEvent();
            this._isRegisterEvent = !0
        }
    },
    _registerKeyboardEvent: function () {
    },
    _registerAccelerometerEvent: function () {
    },
    update: function (a) {
        this._accelCurTime > this._accelInterval && (this._accelCurTime -= this._accelInterval, cc.eventManager.dispatchEvent(new cc.EventAcceleration(this._acceleration)));
        this._accelCurTime += a
    }
};
var _p = cc.inputManager;
_p.setAccelerometerEnabled = function (a) {
    this._accelEnabled !== a && (this._accelEnabled = a, a = cc.director.getScheduler(), this._accelCurTime = 0, a.scheduleUpdate(this))
};
_p.setAccelerometerInterval = function (a) {
    this._accelInterval !== a && (this._accelInterval = a)
};
_p._registerKeyboardEvent = function () {
    cc._addEventListener(cc._canvas, "keydown", function (a) {
        cc.eventManager.dispatchEvent(new cc.EventKeyboard(a.keyCode, !0));
        a.stopPropagation();
        a.preventDefault()
    }, !1);
    cc._addEventListener(cc._canvas, "keyup", function (a) {
        cc.eventManager.dispatchEvent(new cc.EventKeyboard(a.keyCode, !1));
        a.stopPropagation();
        a.preventDefault()
    }, !1)
};
_p._registerAccelerometerEvent = function () {
    var a = window;
    this._acceleration = new cc.Acceleration;
    this._accelDeviceEvent = a.DeviceMotionEvent || a.DeviceOrientationEvent;
    cc.sys.browserType === cc.sys.BROWSER_TYPE_MOBILE_QQ && (this._accelDeviceEvent = window.DeviceOrientationEvent);
    var b = this._accelDeviceEvent === a.DeviceMotionEvent ? "devicemotion" : "deviceorientation", c = navigator.userAgent;
    if (/Android/.test(c) || /Adr/.test(c) && cc.sys.browserType === cc.BROWSER_TYPE_UC)this._minus = -1;
    cc._addEventListener(a, b, this.didAccelerate.bind(this), !1)
};
_p.didAccelerate = function (a) {
    var b = window;
    if (this._accelEnabled) {
        var c = this._acceleration, d, e, f;
        this._accelDeviceEvent === window.DeviceMotionEvent ? (f = a.accelerationIncludingGravity, d = this._accelMinus * f.x * 0.1, e = this._accelMinus * f.y * 0.1, f = 0.1 * f.z) : (d = a.gamma / 90 * 0.981, e = 0.981 * -(a.beta / 90), f = a.alpha / 90 * 0.981);
        cc.sys.os === cc.sys.OS_ANDROID ? (c.x = -d, c.y = -e) : (c.x = d, c.y = e);
        c.z = f;
        c.timestamp = a.timeStamp || Date.now();
        a = c.x;
        b.orientation === cc.UIInterfaceOrientationLandscapeRight ? (c.x = -c.y, c.y = a) : b.orientation === cc.UIInterfaceOrientationLandscapeLeft ? (c.x = c.y, c.y = -a) : b.orientation === cc.UIInterfaceOrientationPortraitUpsideDown && (c.x = -c.x, c.y = -c.y)
    }
};
delete _p;
cc.AffineTransform = function (a, b, c, d, e, f) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = e;
    this.ty = f
};
cc.affineTransformMake = function (a, b, c, d, e, f) {
    return {a: a, b: b, c: c, d: d, tx: e, ty: f}
};
cc.pointApplyAffineTransform = function (a, b, c) {
    var d;
    void 0 === c ? (c = b, d = a.x, a = a.y) : (d = a, a = b);
    return {x: c.a * d + c.c * a + c.tx, y: c.b * d + c.d * a + c.ty}
};
cc._pointApplyAffineTransform = function (a, b, c) {
    return cc.pointApplyAffineTransform(a, b, c)
};
cc.sizeApplyAffineTransform = function (a, b) {
    return {width: b.a * a.width + b.c * a.height, height: b.b * a.width + b.d * a.height}
};
cc.affineTransformMakeIdentity = function () {
    return {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0}
};
cc.affineTransformIdentity = function () {
    return {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0}
};
cc.rectApplyAffineTransform = function (a, b) {
    var c = cc.rectGetMinY(a), d = cc.rectGetMinX(a), e = cc.rectGetMaxX(a), f = cc.rectGetMaxY(a), g = cc.pointApplyAffineTransform(d, c, b), c = cc.pointApplyAffineTransform(e, c, b), d = cc.pointApplyAffineTransform(d, f, b), h = cc.pointApplyAffineTransform(e, f, b), e = Math.min(g.x, c.x, d.x, h.x), f = Math.max(g.x, c.x, d.x, h.x), k = Math.min(g.y, c.y, d.y, h.y), g = Math.max(g.y, c.y, d.y, h.y);
    return cc.rect(e, k, f - e, g - k)
};
cc._rectApplyAffineTransformIn = function (a, b) {
    var c = cc.rectGetMinY(a), d = cc.rectGetMinX(a), e = cc.rectGetMaxX(a), f = cc.rectGetMaxY(a), g = cc.pointApplyAffineTransform(d, c, b), c = cc.pointApplyAffineTransform(e, c, b), d = cc.pointApplyAffineTransform(d, f, b), h = cc.pointApplyAffineTransform(e, f, b), e = Math.min(g.x, c.x, d.x, h.x), f = Math.max(g.x, c.x, d.x, h.x), k = Math.min(g.y, c.y, d.y, h.y), g = Math.max(g.y, c.y, d.y, h.y);
    a.x = e;
    a.y = k;
    a.width = f - e;
    a.height = g - k;
    return a
};
cc.affineTransformTranslate = function (a, b, c) {
    return {a: a.a, b: a.b, c: a.c, d: a.d, tx: a.tx + a.a * b + a.c * c, ty: a.ty + a.b * b + a.d * c}
};
cc.affineTransformScale = function (a, b, c) {
    return {a: a.a * b, b: a.b * b, c: a.c * c, d: a.d * c, tx: a.tx, ty: a.ty}
};
cc.affineTransformRotate = function (a, b) {
    var c = Math.sin(b), d = Math.cos(b);
    return {a: a.a * d + a.c * c, b: a.b * d + a.d * c, c: a.c * d - a.a * c, d: a.d * d - a.b * c, tx: a.tx, ty: a.ty}
};
cc.affineTransformConcat = function (a, b) {
    return {
        a: a.a * b.a + a.b * b.c,
        b: a.a * b.b + a.b * b.d,
        c: a.c * b.a + a.d * b.c,
        d: a.c * b.b + a.d * b.d,
        tx: a.tx * b.a + a.ty * b.c + b.tx,
        ty: a.tx * b.b + a.ty * b.d + b.ty
    }
};
cc.affineTransformEqualToTransform = function (a, b) {
    return a.a === b.a && a.b === b.b && a.c === b.c && a.d === b.d && a.tx === b.tx && a.ty === b.ty
};
cc.affineTransformInvert = function (a) {
    var b = 1 / (a.a * a.d - a.b * a.c);
    return {
        a: b * a.d,
        b: -b * a.b,
        c: -b * a.c,
        d: b * a.a,
        tx: b * (a.c * a.ty - a.d * a.tx),
        ty: b * (a.b * a.tx - a.a * a.ty)
    }
};
cc.POINT_EPSILON = parseFloat("1.192092896e-07F");
cc.pNeg = function (a) {
    return cc.p(-a.x, -a.y)
};
cc.pAdd = function (a, b) {
    return cc.p(a.x + b.x, a.y + b.y)
};
cc.pSub = function (a, b) {
    return cc.p(a.x - b.x, a.y - b.y)
};
cc.pMult = function (a, b) {
    return cc.p(a.x * b, a.y * b)
};
cc.pMidpoint = function (a, b) {
    return cc.pMult(cc.pAdd(a, b), 0.5)
};
cc.pDot = function (a, b) {
    return a.x * b.x + a.y * b.y
};
cc.pCross = function (a, b) {
    return a.x * b.y - a.y * b.x
};
cc.pPerp = function (a) {
    return cc.p(-a.y, a.x)
};
cc.pRPerp = function (a) {
    return cc.p(a.y, -a.x)
};
cc.pProject = function (a, b) {
    return cc.pMult(b, cc.pDot(a, b) / cc.pDot(b, b))
};
cc.pRotate = function (a, b) {
    return cc.p(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x)
};
cc.pUnrotate = function (a, b) {
    return cc.p(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y)
};
cc.pLengthSQ = function (a) {
    return cc.pDot(a, a)
};
cc.pDistanceSQ = function (a, b) {
    return cc.pLengthSQ(cc.pSub(a, b))
};
cc.pLength = function (a) {
    return Math.sqrt(cc.pLengthSQ(a))
};
cc.pDistance = function (a, b) {
    return cc.pLength(cc.pSub(a, b))
};
cc.pNormalize = function (a) {
    var b = cc.pLength(a);
    return 0 === b ? cc.p(a) : cc.pMult(a, 1 / b)
};
cc.pForAngle = function (a) {
    return cc.p(Math.cos(a), Math.sin(a))
};
cc.pToAngle = function (a) {
    return Math.atan2(a.y, a.x)
};
cc.clampf = function (a, b, c) {
    if (b > c) {
        var d = b;
        b = c;
        c = d
    }
    return a < b ? b : a < c ? a : c
};
cc.pClamp = function (a, b, c) {
    return cc.p(cc.clampf(a.x, b.x, c.x), cc.clampf(a.y, b.y, c.y))
};
cc.pFromSize = function (a) {
    return cc.p(a.width, a.height)
};
cc.pCompOp = function (a, b) {
    return cc.p(b(a.x), b(a.y))
};
cc.pLerp = function (a, b, c) {
    return cc.pAdd(cc.pMult(a, 1 - c), cc.pMult(b, c))
};
cc.pFuzzyEqual = function (a, b, c) {
    return a.x - c <= b.x && b.x <= a.x + c && a.y - c <= b.y && b.y <= a.y + c ? !0 : !1
};
cc.pCompMult = function (a, b) {
    return cc.p(a.x * b.x, a.y * b.y)
};
cc.pAngleSigned = function (a, b) {
    var c = cc.pNormalize(a), d = cc.pNormalize(b), c = Math.atan2(c.x * d.y - c.y * d.x, cc.pDot(c, d));
    return Math.abs(c) < cc.POINT_EPSILON ? 0 : c
};
cc.pAngle = function (a, b) {
    var c = Math.acos(cc.pDot(cc.pNormalize(a), cc.pNormalize(b)));
    return Math.abs(c) < cc.POINT_EPSILON ? 0 : c
};
cc.pRotateByAngle = function (a, b, c) {
    a = cc.pSub(a, b);
    var d = Math.cos(c);
    c = Math.sin(c);
    var e = a.x;
    a.x = e * d - a.y * c + b.x;
    a.y = e * c + a.y * d + b.y;
    return a
};
cc.pLineIntersect = function (a, b, c, d, e) {
    if (a.x === b.x && a.y === b.y || c.x === d.x && c.y === d.y)return !1;
    var f = b.x - a.x;
    b = b.y - a.y;
    var g = d.x - c.x;
    d = d.y - c.y;
    var h = a.x - c.x;
    a = a.y - c.y;
    c = d * f - g * b;
    e.x = g * a - d * h;
    e.y = f * a - b * h;
    if (0 === c)return 0 === e.x || 0 === e.y ? !0 : !1;
    e.x /= c;
    e.y /= c;
    return !0
};
cc.pSegmentIntersect = function (a, b, c, d) {
    var e = cc.p(0, 0);
    return cc.pLineIntersect(a, b, c, d, e) && 0 <= e.x && 1 >= e.x && 0 <= e.y && 1 >= e.y ? !0 : !1
};
cc.pIntersectPoint = function (a, b, c, d) {
    var e = cc.p(0, 0);
    return cc.pLineIntersect(a, b, c, d, e) ? (c = cc.p(0, 0), c.x = a.x + e.x * (b.x - a.x), c.y = a.y + e.x * (b.y - a.y), c) : cc.p(0, 0)
};
cc.pSameAs = function (a, b) {
    return null != a && null != b ? a.x === b.x && a.y === b.y : !1
};
cc.pZeroIn = function (a) {
    a.x = 0;
    a.y = 0
};
cc.pIn = function (a, b) {
    a.x = b.x;
    a.y = b.y
};
cc.pMultIn = function (a, b) {
    a.x *= b;
    a.y *= b
};
cc.pSubIn = function (a, b) {
    a.x -= b.x;
    a.y -= b.y
};
cc.pAddIn = function (a, b) {
    a.x += b.x;
    a.y += b.y
};
cc.pNormalizeIn = function (a) {
    cc.pMultIn(a, 1 / Math.sqrt(a.x * a.x + a.y * a.y))
};
cc.vertexLineToPolygon = function (a, b, c, d, e) {
    e += d;
    if (!(1 >= e)) {
        b *= 0.5;
        for (var f, g = e - 1, h = d; h < e; h++) {
            f = 2 * h;
            var k = cc.p(a[2 * h], a[2 * h + 1]), m;
            if (0 === h)m = cc.pPerp(cc.pNormalize(cc.pSub(k, cc.p(a[2 * (h + 1)], a[2 * (h + 1) + 1])))); else if (h === g)m = cc.pPerp(cc.pNormalize(cc.pSub(cc.p(a[2 * (h - 1)], a[2 * (h - 1) + 1]), k))); else {
                m = cc.p(a[2 * (h - 1)], a[2 * (h - 1) + 1]);
                var n = cc.p(a[2 * (h + 1)], a[2 * (h + 1) + 1]), p = cc.pNormalize(cc.pSub(n, k)), s = cc.pNormalize(cc.pSub(m, k)), r = Math.acos(cc.pDot(p, s));
                m = r < cc.degreesToRadians(70) ? cc.pPerp(cc.pNormalize(cc.pMidpoint(p, s))) : r < cc.degreesToRadians(170) ? cc.pNormalize(cc.pMidpoint(p, s)) : cc.pPerp(cc.pNormalize(cc.pSub(n, m)))
            }
            m = cc.pMult(m, b);
            c[2 * f] = k.x + m.x;
            c[2 * f + 1] = k.y + m.y;
            c[2 * (f + 1)] = k.x - m.x;
            c[2 * (f + 1) + 1] = k.y - m.y
        }
        for (h = 0 === d ? 0 : d - 1; h < g; h++)f = 2 * h, a = f + 2, b = cc.vertex2(c[2 * f], c[2 * f + 1]), e = cc.vertex2(c[2 * (f + 1)], c[2 * (f + 1) + 1]), f = cc.vertex2(c[2 * a], c[2 * a]), d = cc.vertex2(c[2 * (a + 1)], c[2 * (a + 1) + 1]), b = !cc.vertexLineIntersect(b.x, b.y, d.x, d.y, e.x, e.y, f.x, f.y), !b.isSuccess && (0 > b.value || 1 < b.value) && (b.isSuccess = !0), b.isSuccess && (c[2 * a] = d.x, c[2 * a + 1] = d.y, c[2 * (a + 1)] = f.x, c[2 * (a + 1) + 1] = f.y)
    }
};
cc.vertexLineIntersect = function (a, b, c, d, e, f, g, h) {
    if (a === c && b === d || e === g && f === h)return {isSuccess: !1, value: 0};
    c -= a;
    d -= b;
    e -= a;
    f -= b;
    g -= a;
    h -= b;
    a = Math.sqrt(c * c + d * d);
    c /= a;
    d /= a;
    b = e * c + f * d;
    f = f * c - e * d;
    e = b;
    b = g * c + h * d;
    h = h * c - g * d;
    g = b;
    return f === h ? {isSuccess: !1, value: 0} : {isSuccess: !0, value: (g + (e - g) * h / (h - f)) / a}
};
cc.vertexListIsClockwise = function (a) {
    for (var b = 0, c = a.length; b < c; b++) {
        var d = a[(b + 1) % c], e = a[(b + 2) % c];
        if (0 < cc.pCross(cc.pSub(d, a[b]), cc.pSub(e, d)))return !1
    }
    return !0
};
cc.CGAffineToGL = function (a, b) {
    b[2] = b[3] = b[6] = b[7] = b[8] = b[9] = b[11] = b[14] = 0;
    b[10] = b[15] = 1;
    b[0] = a.a;
    b[4] = a.c;
    b[12] = a.tx;
    b[1] = a.b;
    b[5] = a.d;
    b[13] = a.ty
};
cc.GLToCGAffine = function (a, b) {
    b.a = a[0];
    b.c = a[4];
    b.tx = a[12];
    b.b = a[1];
    b.d = a[5];
    b.ty = a[13]
};
cc.Touch = cc.Class.extend({
    _point: null,
    _prevPoint: null,
    _id: 0,
    _startPointCaptured: !1,
    _startPoint: null,
    ctor: function (a, b, c) {
        this._point = cc.p(a || 0, b || 0);
        this._id = c || 0
    },
    getLocation: function () {
        return {x: this._point.x, y: this._point.y}
    },
    getLocationX: function () {
        return this._point.x
    },
    getLocationY: function () {
        return this._point.y
    },
    getPreviousLocation: function () {
        return {x: this._prevPoint.x, y: this._prevPoint.y}
    },
    getStartLocation: function () {
        return {x: this._startPoint.x, y: this._startPoint.y}
    },
    getDelta: function () {
        return cc.pSub(this._point, this._prevPoint)
    },
    getLocationInView: function () {
        return {x: this._point.x, y: this._point.y}
    },
    getPreviousLocationInView: function () {
        return {x: this._prevPoint.x, y: this._prevPoint.y}
    },
    getStartLocationInView: function () {
        return {x: this._startPoint.x, y: this._startPoint.y}
    },
    getID: function () {
        return this._id
    },
    getId: function () {
        cc.log("getId is deprecated. Please use getID instead.");
        return this._id
    },
    setTouchInfo: function (a, b, c) {
        this._prevPoint = this._point;
        this._point = cc.p(b || 0, c || 0);
        this._id = a;
        this._startPointCaptured || (this._startPoint = cc.p(this._point), this._startPointCaptured = !0)
    },
    _setPoint: function (a, b) {
        void 0 === b ? (this._point.x = a.x, this._point.y = a.y) : (this._point.x = a, this._point.y = b)
    },
    _setPrevPoint: function (a, b) {
        this._prevPoint = void 0 === b ? cc.p(a.x, a.y) : cc.p(a || 0, b || 0)
    }
});
cc.Event = cc.Class.extend({
    _type: 0, _isStopped: !1, _currentTarget: null, _setCurrentTarget: function (a) {
        this._currentTarget = a
    }, ctor: function (a) {
        this._type = a
    }, getType: function () {
        return this._type
    }, stopPropagation: function () {
        this._isStopped = !0
    }, isStopped: function () {
        return this._isStopped
    }, getCurrentTarget: function () {
        return this._currentTarget
    }
});
cc.Event.TOUCH = 0;
cc.Event.KEYBOARD = 1;
cc.Event.ACCELERATION = 2;
cc.Event.MOUSE = 3;
cc.Event.FOCUS = 4;
cc.Event.CUSTOM = 6;
cc.EventCustom = cc.Event.extend({
    _eventName: null, _userData: null, ctor: function (a) {
        cc.Event.prototype.ctor.call(this, cc.Event.CUSTOM);
        this._eventName = a
    }, setUserData: function (a) {
        this._userData = a
    }, getUserData: function () {
        return this._userData
    }, getEventName: function () {
        return this._eventName
    }
});
cc.EventMouse = cc.Event.extend({
    _eventType: 0,
    _button: 0,
    _x: 0,
    _y: 0,
    _prevX: 0,
    _prevY: 0,
    _scrollX: 0,
    _scrollY: 0,
    ctor: function (a) {
        cc.Event.prototype.ctor.call(this, cc.Event.MOUSE);
        this._eventType = a
    },
    setScrollData: function (a, b) {
        this._scrollX = a;
        this._scrollY = b
    },
    getScrollX: function () {
        return this._scrollX
    },
    getScrollY: function () {
        return this._scrollY
    },
    setLocation: function (a, b) {
        this._x = a;
        this._y = b
    },
    getLocation: function () {
        return {x: this._x, y: this._y}
    },
    getLocationInView: function () {
        return {x: this._x, y: cc.view._designResolutionSize.height - this._y}
    },
    _setPrevCursor: function (a, b) {
        this._prevX = a;
        this._prevY = b
    },
    getDelta: function () {
        return {x: this._x - this._prevX, y: this._y - this._prevY}
    },
    getDeltaX: function () {
        return this._x - this._prevX
    },
    getDeltaY: function () {
        return this._y - this._prevY
    },
    setButton: function (a) {
        this._button = a
    },
    getButton: function () {
        return this._button
    },
    getLocationX: function () {
        return this._x
    },
    getLocationY: function () {
        return this._y
    }
});
cc.EventMouse.NONE = 0;
cc.EventMouse.DOWN = 1;
cc.EventMouse.UP = 2;
cc.EventMouse.MOVE = 3;
cc.EventMouse.SCROLL = 4;
cc.EventMouse.BUTTON_LEFT = 0;
cc.EventMouse.BUTTON_RIGHT = 2;
cc.EventMouse.BUTTON_MIDDLE = 1;
cc.EventMouse.BUTTON_4 = 3;
cc.EventMouse.BUTTON_5 = 4;
cc.EventMouse.BUTTON_6 = 5;
cc.EventMouse.BUTTON_7 = 6;
cc.EventMouse.BUTTON_8 = 7;
cc.EventTouch = cc.Event.extend({
    _eventCode: 0, _touches: null, ctor: function (a) {
        cc.Event.prototype.ctor.call(this, cc.Event.TOUCH);
        this._touches = a || []
    }, getEventCode: function () {
        return this._eventCode
    }, getTouches: function () {
        return this._touches
    }, _setEventCode: function (a) {
        this._eventCode = a
    }, _setTouches: function (a) {
        this._touches = a
    }
});
cc.EventTouch.MAX_TOUCHES = 5;
cc.EventTouch.EventCode = {BEGAN: 0, MOVED: 1, ENDED: 2, CANCELLED: 3};
cc.EventFocus = cc.Event.extend({
    _widgetGetFocus: null, _widgetLoseFocus: null, ctor: function (a, b) {
        cc.Event.prototype.ctor.call(this, cc.Event.FOCUS);
        this._widgetGetFocus = b;
        this._widgetLoseFocus = a
    }
});
cc.EventListener = cc.Class.extend({
    _onEvent: null,
    _type: 0,
    _listenerID: null,
    _registered: !1,
    _fixedPriority: 0,
    _node: null,
    _paused: !0,
    _isEnabled: !0,
    ctor: function (a, b, c) {
        this._onEvent = c;
        this._type = a || 0;
        this._listenerID = b || ""
    },
    _setPaused: function (a) {
        this._paused = a
    },
    _isPaused: function () {
        return this._paused
    },
    _setRegistered: function (a) {
        this._registered = a
    },
    _isRegistered: function () {
        return this._registered
    },
    _getType: function () {
        return this._type
    },
    _getListenerID: function () {
        return this._listenerID
    },
    _setFixedPriority: function (a) {
        this._fixedPriority = a
    },
    _getFixedPriority: function () {
        return this._fixedPriority
    },
    _setSceneGraphPriority: function (a) {
        this._node = a
    },
    _getSceneGraphPriority: function () {
        return this._node
    },
    checkAvailable: function () {
        return null !== this._onEvent
    },
    clone: function () {
        return null
    },
    setEnabled: function (a) {
        this._isEnabled = a
    },
    isEnabled: function () {
        return this._isEnabled
    },
    retain: function () {
    },
    release: function () {
    }
});
cc.EventListener.UNKNOWN = 0;
cc.EventListener.TOUCH_ONE_BY_ONE = 1;
cc.EventListener.TOUCH_ALL_AT_ONCE = 2;
cc.EventListener.KEYBOARD = 3;
cc.EventListener.MOUSE = 4;
cc.EventListener.ACCELERATION = 5;
cc.EventListener.ACCELERATION = 6;
cc.EventListener.CUSTOM = 8;
cc.EventListener.FOCUS = 7;
cc._EventListenerCustom = cc.EventListener.extend({
    _onCustomEvent: null, ctor: function (a, b) {
        this._onCustomEvent = b;
        var c = this;
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.CUSTOM, a, function (a) {
            null !== c._onCustomEvent && c._onCustomEvent(a)
        })
    }, checkAvailable: function () {
        return cc.EventListener.prototype.checkAvailable.call(this) && null !== this._onCustomEvent
    }, clone: function () {
        return new cc._EventListenerCustom(this._listenerID, this._onCustomEvent)
    }
});
cc._EventListenerCustom.create = function (a, b) {
    return new cc._EventListenerCustom(a, b)
};
cc._EventListenerMouse = cc.EventListener.extend({
    onMouseDown: null,
    onMouseUp: null,
    onMouseMove: null,
    onMouseScroll: null,
    ctor: function () {
        var a = this;
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.MOUSE, cc._EventListenerMouse.LISTENER_ID, function (b) {
            var c = cc.EventMouse;
            switch (b._eventType) {
                case c.DOWN:
                    if (a.onMouseDown)a.onMouseDown(b);
                    break;
                case c.UP:
                    if (a.onMouseUp)a.onMouseUp(b);
                    break;
                case c.MOVE:
                    if (a.onMouseMove)a.onMouseMove(b);
                    break;
                case c.SCROLL:
                    if (a.onMouseScroll)a.onMouseScroll(b)
            }
        })
    },
    clone: function () {
        var a = new cc._EventListenerMouse;
        a.onMouseDown = this.onMouseDown;
        a.onMouseUp = this.onMouseUp;
        a.onMouseMove = this.onMouseMove;
        a.onMouseScroll = this.onMouseScroll;
        return a
    },
    checkAvailable: function () {
        return !0
    }
});
cc._EventListenerMouse.LISTENER_ID = "__cc_mouse";
cc._EventListenerMouse.create = function () {
    return new cc._EventListenerMouse
};
cc._EventListenerTouchOneByOne = cc.EventListener.extend({
    _claimedTouches: null,
    swallowTouches: !1,
    onTouchBegan: null,
    onTouchMoved: null,
    onTouchEnded: null,
    onTouchCancelled: null,
    ctor: function () {
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ONE_BY_ONE, cc._EventListenerTouchOneByOne.LISTENER_ID, null);
        this._claimedTouches = []
    },
    setSwallowTouches: function (a) {
        this.swallowTouches = a
    },
    isSwallowTouches: function () {
        return this.swallowTouches
    },
    clone: function () {
        var a = new cc._EventListenerTouchOneByOne;
        a.onTouchBegan = this.onTouchBegan;
        a.onTouchMoved = this.onTouchMoved;
        a.onTouchEnded = this.onTouchEnded;
        a.onTouchCancelled = this.onTouchCancelled;
        a.swallowTouches = this.swallowTouches;
        return a
    },
    checkAvailable: function () {
        return this.onTouchBegan ? !0 : (cc.log(cc._LogInfos._EventListenerTouchOneByOne_checkAvailable), !1)
    }
});
cc._EventListenerTouchOneByOne.LISTENER_ID = "__cc_touch_one_by_one";
cc._EventListenerTouchOneByOne.create = function () {
    return new cc._EventListenerTouchOneByOne
};
cc._EventListenerTouchAllAtOnce = cc.EventListener.extend({
    onTouchesBegan: null,
    onTouchesMoved: null,
    onTouchesEnded: null,
    onTouchesCancelled: null,
    ctor: function () {
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ALL_AT_ONCE, cc._EventListenerTouchAllAtOnce.LISTENER_ID, null)
    },
    clone: function () {
        var a = new cc._EventListenerTouchAllAtOnce;
        a.onTouchesBegan = this.onTouchesBegan;
        a.onTouchesMoved = this.onTouchesMoved;
        a.onTouchesEnded = this.onTouchesEnded;
        a.onTouchesCancelled = this.onTouchesCancelled;
        return a
    },
    checkAvailable: function () {
        return null === this.onTouchesBegan && null === this.onTouchesMoved && null === this.onTouchesEnded && null === this.onTouchesCancelled ? (cc.log(cc._LogInfos._EventListenerTouchAllAtOnce_checkAvailable), !1) : !0
    }
});
cc._EventListenerTouchAllAtOnce.LISTENER_ID = "__cc_touch_all_at_once";
cc._EventListenerTouchAllAtOnce.create = function () {
    return new cc._EventListenerTouchAllAtOnce
};
cc.EventListener.create = function (a) {
    cc.assert(a && a.event, cc._LogInfos.EventListener_create);
    var b = a.event;
    delete a.event;
    var c = null;
    b === cc.EventListener.TOUCH_ONE_BY_ONE ? c = new cc._EventListenerTouchOneByOne : b === cc.EventListener.TOUCH_ALL_AT_ONCE ? c = new cc._EventListenerTouchAllAtOnce : b === cc.EventListener.MOUSE ? c = new cc._EventListenerMouse : b === cc.EventListener.CUSTOM ? (c = new cc._EventListenerCustom(a.eventName, a.callback), delete a.eventName, delete a.callback) : b === cc.EventListener.KEYBOARD ? c = new cc._EventListenerKeyboard : b === cc.EventListener.ACCELERATION ? (c = new cc._EventListenerAcceleration(a.callback), delete a.callback) : b === cc.EventListener.FOCUS && (c = new cc._EventListenerFocus);
    for (var d in a)c[d] = a[d];
    return c
};
cc._EventListenerFocus = cc.EventListener.extend({
    clone: function () {
        var a = new cc._EventListenerFocus;
        a.onFocusChanged = this.onFocusChanged;
        return a
    }, checkAvailable: function () {
        return this.onFocusChanged ? !0 : (cc.log("Invalid EventListenerFocus!"), !1)
    }, onFocusChanged: null, ctor: function () {
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.FOCUS, cc._EventListenerFocus.LISTENER_ID, function (a) {
            if (this.onFocusChanged)this.onFocusChanged(a._widgetLoseFocus, a._widgetGetFocus)
        })
    }
});
cc._EventListenerFocus.LISTENER_ID = "__cc_focus_event";
cc._EventListenerVector = cc.Class.extend({
    _fixedListeners: null,
    _sceneGraphListeners: null,
    gt0Index: 0,
    ctor: function () {
        this._fixedListeners = [];
        this._sceneGraphListeners = []
    },
    size: function () {
        return this._fixedListeners.length + this._sceneGraphListeners.length
    },
    empty: function () {
        return 0 === this._fixedListeners.length && 0 === this._sceneGraphListeners.length
    },
    push: function (a) {
        0 === a._getFixedPriority() ? this._sceneGraphListeners.push(a) : this._fixedListeners.push(a)
    },
    clearSceneGraphListeners: function () {
        this._sceneGraphListeners.length = 0
    },
    clearFixedListeners: function () {
        this._fixedListeners.length = 0
    },
    clear: function () {
        this._sceneGraphListeners.length = 0;
        this._fixedListeners.length = 0
    },
    getFixedPriorityListeners: function () {
        return this._fixedListeners
    },
    getSceneGraphPriorityListeners: function () {
        return this._sceneGraphListeners
    }
});
cc.__getListenerID = function (a) {
    var b = cc.Event, c = a.getType();
    if (c === b.ACCELERATION)return cc._EventListenerAcceleration.LISTENER_ID;
    if (c === b.CUSTOM)return a.getEventName();
    if (c === b.KEYBOARD)return cc._EventListenerKeyboard.LISTENER_ID;
    if (c === b.MOUSE)return cc._EventListenerMouse.LISTENER_ID;
    if (c === b.FOCUS)return cc._EventListenerFocus.LISTENER_ID;
    c === b.TOUCH && cc.log(cc._LogInfos.__getListenerID);
    return ""
};
cc.eventManager = {
    DIRTY_NONE: 0,
    DIRTY_FIXED_PRIORITY: 1,
    DIRTY_SCENE_GRAPH_PRIORITY: 2,
    DIRTY_ALL: 3,
    _listenersMap: {},
    _priorityDirtyFlagMap: {},
    _nodeListenersMap: {},
    _nodePriorityMap: {},
    _globalZOrderNodeMap: {},
    _toAddedListeners: [],
    _dirtyNodes: [],
    _inDispatch: 0,
    _isEnabled: !1,
    _nodePriorityIndex: 0,
    _internalCustomListenerIDs: [cc.game.EVENT_HIDE, cc.game.EVENT_SHOW],
    _setDirtyForNode: function (a) {
        null != this._nodeListenersMap[a.__instanceId] && this._dirtyNodes.push(a);
        a = a.getChildren();
        for (var b = 0, c = a.length; b < c; b++)this._setDirtyForNode(a[b])
    },
    pauseTarget: function (a, b) {
        var c = this._nodeListenersMap[a.__instanceId], d, e;
        if (c)
            for (d = 0, e = c.length; d < e; d++)c[d]._setPaused(!0);
        if (!0 === b)
            for (c = a.getChildren(), d = 0, e = c.length; d < e; d++)this.pauseTarget(c[d], !0)
    },
    resumeTarget: function (a, b) {
        var c = this._nodeListenersMap[a.__instanceId], d, e;
        if (c)
            for (d = 0, e = c.length; d < e; d++)c[d]._setPaused(!1);
        this._setDirtyForNode(a);
        if (!0 === b)
            for (c = a.getChildren(), d = 0, e = c.length; d < e; d++)this.resumeTarget(c[d], !0)
    },
    _addListener: function (a) {
        0 === this._inDispatch ? this._forceAddEventListener(a) : this._toAddedListeners.push(a)
    },
    _forceAddEventListener: function (a) {
        var b = a._getListenerID(), c = this._listenersMap[b];
        c || (c = new cc._EventListenerVector, this._listenersMap[b] = c);
        c.push(a);
        0 === a._getFixedPriority() ? (this._setDirty(b, this.DIRTY_SCENE_GRAPH_PRIORITY), b = a._getSceneGraphPriority(), null === b && cc.log(cc._LogInfos.eventManager__forceAddEventListener), this._associateNodeAndEventListener(b, a), b.isRunning() && this.resumeTarget(b)) : this._setDirty(b, this.DIRTY_FIXED_PRIORITY)
    },
    _getListeners: function (a) {
        return this._listenersMap[a]
    },
    _updateDirtyFlagForSceneGraph: function () {
        if (0 !== this._dirtyNodes.length) {
            for (var a = this._dirtyNodes, b, c, d = this._nodeListenersMap, e = 0, f = a.length; e < f; e++)
                if (b = d[a[e].__instanceId])
                    for (var g = 0, h = b.length; g < h; g++)(c = b[g]) && this._setDirty(c._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY);
            this._dirtyNodes.length = 0
        }
    },
    _removeAllListenersInVector: function (a) {
        if (a)
            for (var b, c = 0; c < a.length;)b = a[c], b._setRegistered(!1), null != b._getSceneGraphPriority() && (this._dissociateNodeAndEventListener(b._getSceneGraphPriority(), b), b._setSceneGraphPriority(null)), 0 === this._inDispatch ? cc.arrayRemoveObject(a, b) : ++c
    },
    _removeListenersForListenerID: function (a) {
        var b = this._listenersMap[a];
        if (b) {
            var c = b.getFixedPriorityListeners(), d = b.getSceneGraphPriorityListeners();
            this._removeAllListenersInVector(d);
            this._removeAllListenersInVector(c);
            delete this._priorityDirtyFlagMap[a];
            this._inDispatch || (b.clear(), delete this._listenersMap[a])
        }
        c = this._toAddedListeners;
        for (b = 0; b < c.length;)(d = c[b]) && d._getListenerID() === a ? cc.arrayRemoveObject(c, d) : ++b
    },
    _sortEventListeners: function (a) {
        var b = this.DIRTY_NONE, c = this._priorityDirtyFlagMap;
        c[a] && (b = c[a]);
        b !== this.DIRTY_NONE && (c[a] = this.DIRTY_NONE, b & this.DIRTY_FIXED_PRIORITY && this._sortListenersOfFixedPriority(a), b & this.DIRTY_SCENE_GRAPH_PRIORITY && ((b = cc.director.getRunningScene()) ? this._sortListenersOfSceneGraphPriority(a, b) : c[a] = this.DIRTY_SCENE_GRAPH_PRIORITY))
    },
    _sortListenersOfSceneGraphPriority: function (a, b) {
        var c = this._getListeners(a);
        if (c) {
            var d = c.getSceneGraphPriorityListeners();
            d && 0 !== d.length && (this._nodePriorityIndex = 0, this._nodePriorityMap = {}, this._visitTarget(b, !0), c.getSceneGraphPriorityListeners().sort(this._sortEventListenersOfSceneGraphPriorityDes))
        }
    },
    _sortEventListenersOfSceneGraphPriorityDes: function (a, b) {
        var c = cc.eventManager._nodePriorityMap, d = a._getSceneGraphPriority(), e = b._getSceneGraphPriority();
        return a && b && d && e && c[d.__instanceId] && c[e.__instanceId] ? c[b._getSceneGraphPriority().__instanceId] - c[a._getSceneGraphPriority().__instanceId] : -1
    },
    _sortListenersOfFixedPriority: function (a) {
        if (a = this._listenersMap[a]) {
            var b = a.getFixedPriorityListeners();
            if (b && 0 !== b.length) {
                b.sort(this._sortListenersOfFixedPriorityAsc);
                for (var c = 0, d = b.length; c < d && !(0 <= b[c]._getFixedPriority());)++c;
                a.gt0Index = c
            }
        }
    },
    _sortListenersOfFixedPriorityAsc: function (a, b) {
        return a._getFixedPriority() - b._getFixedPriority()
    },
    _onUpdateListeners: function (a) {
        if (a = this._listenersMap[a]) {
            var b = a.getFixedPriorityListeners(), c = a.getSceneGraphPriorityListeners(), d, e;
            if (c)
                for (d = 0; d < c.length;)e = c[d], e._isRegistered() ? ++d : cc.arrayRemoveObject(c, e);
            if (b)
                for (d = 0; d < b.length;)e = b[d], e._isRegistered() ? ++d : cc.arrayRemoveObject(b, e);
            c && 0 === c.length && a.clearSceneGraphListeners();
            b && 0 === b.length && a.clearFixedListeners()
        }
    },
    _updateListeners: function (a) {
        var b = this._inDispatch;
        cc.assert(0 < b, cc._LogInfos.EventManager__updateListeners);
        if (!(1 < b)) {
            a.getType() === cc.Event.TOUCH ? (this._onUpdateListeners(cc._EventListenerTouchOneByOne.LISTENER_ID), this._onUpdateListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID)) : this._onUpdateListeners(cc.__getListenerID(a));
            cc.assert(1 === b, cc._LogInfos.EventManager__updateListeners_2);
            a = this._listenersMap;
            var b = this._priorityDirtyFlagMap, c;
            for (c in a)a[c].empty() && (delete b[c], delete a[c]);
            c = this._toAddedListeners;
            if (0 !== c.length) {
                a = 0;
                for (b = c.length; a < b; a++)this._forceAddEventListener(c[a]);
                this._toAddedListeners.length = 0
            }
        }
    },
    _onTouchEventCallback: function (a, b) {
        if (!a._isRegistered)return !1;
        var c = b.event, d = b.selTouch;
        c._setCurrentTarget(a._node);
        var e = !1, f, g = c.getEventCode(), h = cc.EventTouch.EventCode;
        if (g === h.BEGAN)a.onTouchBegan && (e = a.onTouchBegan(d, c)) && a._registered && a._claimedTouches.push(d); else if (0 < a._claimedTouches.length && -1 !== (f = a._claimedTouches.indexOf(d)))
            if (e = !0, g === h.MOVED && a.onTouchMoved)a.onTouchMoved(d, c); else if (g === h.ENDED) {
                if (a.onTouchEnded)a.onTouchEnded(d, c);
                a._registered && a._claimedTouches.splice(f, 1)
            } else if (g === h.CANCELLED) {
                if (a.onTouchCancelled)a.onTouchCancelled(d, c);
                a._registered && a._claimedTouches.splice(f, 1)
            }
        return c.isStopped() ? (cc.eventManager._updateListeners(c), !0) : e && a._registered && a.swallowTouches ? (b.needsMutableSet && b.touches.splice(d, 1), !0) : !1
    },
    _dispatchTouchEvent: function (a) {
        this._sortEventListeners(cc._EventListenerTouchOneByOne.LISTENER_ID);
        this._sortEventListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
        var b = this._getListeners(cc._EventListenerTouchOneByOne.LISTENER_ID), c = this._getListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
        if (null !== b || null !== c) {
            var d = a.getTouches(), e = cc.copyArray(d), f = {
                event: a,
                needsMutableSet: b && c,
                touches: e,
                selTouch: null
            };
            if (b)
                for (var g = 0; g < d.length; g++)
                    if (f.selTouch = d[g], this._dispatchEventToListeners(b, this._onTouchEventCallback, f), a.isStopped())return;
            if (c && 0 < e.length && (this._dispatchEventToListeners(c, this._onTouchesEventCallback, {
                    event: a,
                    touches: e
                }), a.isStopped()))return;
            this._updateListeners(a)
        }
    },
    _onTouchesEventCallback: function (a, b) {
        if (!a._registered)return !1;
        var c = cc.EventTouch.EventCode, d = b.event, e = b.touches, f = d.getEventCode();
        d._setCurrentTarget(a._node);
        if (f === c.BEGAN && a.onTouchesBegan)a.onTouchesBegan(e, d); else if (f === c.MOVED && a.onTouchesMoved)a.onTouchesMoved(e, d); else if (f === c.ENDED && a.onTouchesEnded)a.onTouchesEnded(e, d); else if (f === c.CANCELLED && a.onTouchesCancelled)a.onTouchesCancelled(e, d);
        return d.isStopped() ? (cc.eventManager._updateListeners(d), !0) : !1
    },
    _associateNodeAndEventListener: function (a, b) {
        var c = this._nodeListenersMap[a.__instanceId];
        c || (c = [], this._nodeListenersMap[a.__instanceId] = c);
        c.push(b)
    },
    _dissociateNodeAndEventListener: function (a, b) {
        var c = this._nodeListenersMap[a.__instanceId];
        c && (cc.arrayRemoveObject(c, b), 0 === c.length && delete this._nodeListenersMap[a.__instanceId])
    },
    _dispatchEventToListeners: function (a, b, c) {
        var d = !1, e = a.getFixedPriorityListeners(), f = a.getSceneGraphPriorityListeners(), g = 0, h;
        if (e && 0 !== e.length)
            for (; g < a.gt0Index; ++g)
                if (h = e[g], h.isEnabled() && !h._isPaused() && h._isRegistered() && b(h, c)) {
                    d = !0;
                    break
                }
        if (f && !d)
            for (a = 0; a < f.length; a++)
                if (h = f[a], h.isEnabled() && !h._isPaused() && h._isRegistered() && b(h, c)) {
                    d = !0;
                    break
                }
        if (e && !d)
            for (; g < e.length && (h = e[g], !h.isEnabled() || h._isPaused() || !h._isRegistered() || !b(h, c)); ++g);
    },
    _setDirty: function (a, b) {
        var c = this._priorityDirtyFlagMap;
        c[a] = null == c[a] ? b : b | c[a]
    },
    _visitTarget: function (a, b) {
        var c = a.getChildren(), d = 0, e = c.length, f = this._globalZOrderNodeMap, g = this._nodeListenersMap;
        if (0 < e) {
            for (var h; d < e; d++)
                if ((h = c[d]) && 0 > h.getLocalZOrder())this._visitTarget(h, !1); else break;
            null != g[a.__instanceId] && (f[a.getGlobalZOrder()] || (f[a.getGlobalZOrder()] = []), f[a.getGlobalZOrder()].push(a.__instanceId));
            for (; d < e; d++)(h = c[d]) && this._visitTarget(h, !1)
        } else null != g[a.__instanceId] && (f[a.getGlobalZOrder()] || (f[a.getGlobalZOrder()] = []), f[a.getGlobalZOrder()].push(a.__instanceId));
        if (b) {
            var c = [], k;
            for (k in f)c.push(k);
            c.sort(this._sortNumberAsc);
            k = c.length;
            h = this._nodePriorityMap;
            for (d = 0; d < k; d++)
                for (e = f[c[d]], g = 0; g < e.length; g++)h[e[g]] = ++this._nodePriorityIndex;
            this._globalZOrderNodeMap = {}
        }
    },
    _sortNumberAsc: function (a, b) {
        return a - b
    },
    addListener: function (a, b) {
        cc.assert(a && b, cc._LogInfos.eventManager_addListener_2);
        if (!(a instanceof cc.EventListener))cc.assert(!cc.isNumber(b), cc._LogInfos.eventManager_addListener_3), a = cc.EventListener.create(a); else if (a._isRegistered()) {
            cc.log(cc._LogInfos.eventManager_addListener_4);
            return
        }
        if (a.checkAvailable()) {
            if (cc.isNumber(b)) {
                if (0 === b) {
                    cc.log(cc._LogInfos.eventManager_addListener);
                    return
                }
                a._setSceneGraphPriority(null);
                a._setFixedPriority(b);
                a._setRegistered(!0);
                a._setPaused(!1)
            } else a._setSceneGraphPriority(b), a._setFixedPriority(0), a._setRegistered(!0);
            this._addListener(a);
            return a
        }
    },
    addCustomListener: function (a, b) {
        var c = new cc._EventListenerCustom(a, b);
        this.addListener(c, 1);
        return c
    },
    removeListener: function (a) {
        if (null != a) {
            var b, c = this._listenersMap, d;
            for (d in c) {
                var e = c[d], f = e.getFixedPriorityListeners();
                b = e.getSceneGraphPriorityListeners();
                (b = this._removeListenerInVector(b, a)) ? this._setDirty(a._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY) : (b = this._removeListenerInVector(f, a)) && this._setDirty(a._getListenerID(), this.DIRTY_FIXED_PRIORITY);
                e.empty() && (delete this._priorityDirtyFlagMap[a._getListenerID()], delete c[d]);
                if (b)break
            }
            if (!b)
                for (c = this._toAddedListeners, d = 0, e = c.length; d < e; d++)
                    if (f = c[d], f === a) {
                        cc.arrayRemoveObject(c, f);
                        f._setRegistered(!1);
                        break
                    }
        }
    },
    _removeListenerInVector: function (a, b) {
        if (null == a)return !1;
        for (var c = 0, d = a.length; c < d; c++) {
            var e = a[c];
            if (e === b)return e._setRegistered(!1), null != e._getSceneGraphPriority() && (this._dissociateNodeAndEventListener(e._getSceneGraphPriority(), e), e._setSceneGraphPriority(null)), 0 === this._inDispatch && cc.arrayRemoveObject(a, e), !0
        }
        return !1
    },
    removeListeners: function (a, b) {
        if (a instanceof cc.Node) {
            delete this._nodePriorityMap[a.__instanceId];
            cc.arrayRemoveObject(this._dirtyNodes, a);
            var c = this._nodeListenersMap[a.__instanceId];
            if (c) {
                for (var d = cc.copyArray(c), c = 0; c < d.length; c++)this.removeListener(d[c]);
                d.length = 0
            }
            d = this._toAddedListeners;
            for (c = 0; c < d.length;) {
                var e = d[c];
                e._getSceneGraphPriority() === a ? (e._setSceneGraphPriority(null), e._setRegistered(!1), d.splice(c, 1)) : ++c
            }
            if (!0 === b)
                for (d = a.getChildren(), c = 0, e = d.length; c < e; c++)this.removeListeners(d[c], !0)
        } else a === cc.EventListener.TOUCH_ONE_BY_ONE ? this._removeListenersForListenerID(cc._EventListenerTouchOneByOne.LISTENER_ID) : a === cc.EventListener.TOUCH_ALL_AT_ONCE ? this._removeListenersForListenerID(cc._EventListenerTouchAllAtOnce.LISTENER_ID) : a === cc.EventListener.MOUSE ? this._removeListenersForListenerID(cc._EventListenerMouse.LISTENER_ID) : a === cc.EventListener.ACCELERATION ? this._removeListenersForListenerID(cc._EventListenerAcceleration.LISTENER_ID) : a === cc.EventListener.KEYBOARD ? this._removeListenersForListenerID(cc._EventListenerKeyboard.LISTENER_ID) : cc.log(cc._LogInfos.eventManager_removeListeners)
    },
    removeCustomListeners: function (a) {
        this._removeListenersForListenerID(a)
    },
    removeAllListeners: function () {
        var a = this._listenersMap, b = this._internalCustomListenerIDs, c;
        for (c in a)-1 === b.indexOf(c) && this._removeListenersForListenerID(c)
    },
    setPriority: function (a, b) {
        if (null != a) {
            var c = this._listenersMap, d;
            for (d in c) {
                var e = c[d].getFixedPriorityListeners();
                if (e && -1 !== e.indexOf(a)) {
                    null != a._getSceneGraphPriority() && cc.log(cc._LogInfos.eventManager_setPriority);
                    a._getFixedPriority() !== b && (a._setFixedPriority(b), this._setDirty(a._getListenerID(), this.DIRTY_FIXED_PRIORITY));
                    break
                }
            }
        }
    },
    setEnabled: function (a) {
        this._isEnabled = a
    },
    isEnabled: function () {
        return this._isEnabled
    },
    dispatchEvent: function (a) {
        if (this._isEnabled) {
            this._updateDirtyFlagForSceneGraph();
            this._inDispatch++;
            if (!a || !a.getType)throw"event is undefined";
            if (a.getType() === cc.Event.TOUCH)this._dispatchTouchEvent(a); else {
                var b = cc.__getListenerID(a);
                this._sortEventListeners(b);
                b = this._listenersMap[b];
                null != b && this._dispatchEventToListeners(b, this._onListenerCallback, a);
                this._updateListeners(a)
            }
            this._inDispatch--
        }
    },
    _onListenerCallback: function (a, b) {
        b._setCurrentTarget(a._getSceneGraphPriority());
        a._onEvent(b);
        return b.isStopped()
    },
    dispatchCustomEvent: function (a, b) {
        var c = new cc.EventCustom(a);
        c.setUserData(b);
        this.dispatchEvent(c)
    }
};
cc.EventHelper = function () {
};
cc.EventHelper.prototype = {
    constructor: cc.EventHelper, apply: function (a) {
        a.addEventListener = cc.EventHelper.prototype.addEventListener;
        a.hasEventListener = cc.EventHelper.prototype.hasEventListener;
        a.removeEventListener = cc.EventHelper.prototype.removeEventListener;
        a.dispatchEvent = cc.EventHelper.prototype.dispatchEvent
    }, addEventListener: function (a, b, c) {
        if ("load" === a && this._textureLoaded)setTimeout(function () {
            b.call(c)
        }, 0); else {
            void 0 === this._listeners && (this._listeners = {});
            var d = this._listeners;
            void 0 === d[a] && (d[a] = []);
            this.hasEventListener(a, b, c) || d[a].push({callback: b, eventTarget: c})
        }
    }, hasEventListener: function (a, b, c) {
        if (void 0 === this._listeners)return !1;
        var d = this._listeners;
        if (void 0 !== d[a]) {
            a = 0;
            for (var e = d.length; a < e; a++) {
                var f = d[a];
                if (f.callback === b && f.eventTarget === c)return !0
            }
        }
        return !1
    }, removeEventListener: function (a, b) {
        if (void 0 !== this._listeners) {
            var c = this._listeners[a];
            if (void 0 !== c)
                for (var d = 0; d < c.length;)c[d].eventTarget === b ? c.splice(d, 1) : d++
        }
    }, dispatchEvent: function (a, b) {
        if (void 0 !== this._listeners) {
            null == b && (b = !0);
            var c = this._listeners[a];
            if (void 0 !== c) {
                for (var d = [], e = c.length, f = 0; f < e; f++)d[f] = c[f];
                for (f = 0; f < e; f++)d[f].callback.call(d[f].eventTarget, this);
                b && (c.length = 0)
            }
        }
    }
};
cc.EventAcceleration = cc.Event.extend({
    _acc: null, ctor: function (a) {
        cc.Event.prototype.ctor.call(this, cc.Event.ACCELERATION);
        this._acc = a
    }
});
cc.EventKeyboard = cc.Event.extend({
    _keyCode: 0, _isPressed: !1, ctor: function (a, b) {
        cc.Event.prototype.ctor.call(this, cc.Event.KEYBOARD);
        this._keyCode = a;
        this._isPressed = b
    }
});
cc._EventListenerAcceleration = cc.EventListener.extend({
    _onAccelerationEvent: null, ctor: function (a) {
        this._onAccelerationEvent = a;
        var b = this;
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.ACCELERATION, cc._EventListenerAcceleration.LISTENER_ID, function (a) {
            b._onAccelerationEvent(a._acc, a)
        })
    }, checkAvailable: function () {
        cc.assert(this._onAccelerationEvent, cc._LogInfos._EventListenerAcceleration_checkAvailable);
        return !0
    }, clone: function () {
        return new cc._EventListenerAcceleration(this._onAccelerationEvent)
    }
});
cc._EventListenerAcceleration.LISTENER_ID = "__cc_acceleration";
cc._EventListenerAcceleration.create = function (a) {
    return new cc._EventListenerAcceleration(a)
};
cc._EventListenerKeyboard = cc.EventListener.extend({
    onKeyPressed: null, onKeyReleased: null, ctor: function () {
        var a = this;
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.KEYBOARD, cc._EventListenerKeyboard.LISTENER_ID, function (b) {
            if (b._isPressed) {
                if (a.onKeyPressed)a.onKeyPressed(b._keyCode, b)
            } else if (a.onKeyReleased)a.onKeyReleased(b._keyCode, b)
        })
    }, clone: function () {
        var a = new cc._EventListenerKeyboard;
        a.onKeyPressed = this.onKeyPressed;
        a.onKeyReleased = this.onKeyReleased;
        return a
    }, checkAvailable: function () {
        return null === this.onKeyPressed && null === this.onKeyReleased ? (cc.log(cc._LogInfos._EventListenerKeyboard_checkAvailable), !1) : !0
    }
});
cc._EventListenerKeyboard.LISTENER_ID = "__cc_keyboard";
cc._EventListenerKeyboard.create = function () {
    return new cc._EventListenerKeyboard
};
cc.rendererCanvas = {
    childrenOrderDirty: !0,
    _transformNodePool: [],
    _renderCmds: [],
    _isCacheToCanvasOn: !1,
    _cacheToCanvasCmds: {},
    _cacheInstanceIds: [],
    _currentID: 0,
    getRenderCmd: function (a) {
        return a._createRenderCmd()
    },
    rendering: function (a) {
        var b = this._renderCmds, c, d = cc.view.getScaleX(), e = cc.view.getScaleY(), f = a || cc._renderContext;
        f.computeRealOffsetY();
        a = 0;
        for (c = b.length; a < c; a++)b[a].rendering(f, d, e)
    },
    _renderingToCacheCanvas: function (a, b, c, d) {
        a || cc.log("The context of RenderTexture is invalid.");
        c = cc.isUndefined(c) ? 1 : c;
        d = cc.isUndefined(d) ? 1 : d;
        b = b || this._currentID;
        var e = this._cacheToCanvasCmds[b], f, g;
        a.computeRealOffsetY();
        f = 0;
        for (g = e.length; f < g; f++)e[f].rendering(a, c, d);
        e.length = 0;
        a = this._cacheInstanceIds;
        delete this._cacheToCanvasCmds[b];
        cc.arrayRemoveObject(a, b);
        0 === a.length ? this._isCacheToCanvasOn = !1 : this._currentID = a[a.length - 1]
    },
    _turnToCacheMode: function (a) {
        this._isCacheToCanvasOn = !0;
        a = a || 0;
        this._cacheToCanvasCmds[a] = [];
        -1 === this._cacheInstanceIds.indexOf(a) && this._cacheInstanceIds.push(a);
        this._currentID = a
    },
    _turnToNormalMode: function () {
        this._isCacheToCanvasOn = !1
    },
    resetFlag: function () {
        this.childrenOrderDirty = !1;
        this._transformNodePool.length = 0
    },
    transform: function () {
        var a = this._transformNodePool;
        a.sort(this._sortNodeByLevelAsc);
        for (var b = 0, c = a.length; b < c; b++)0 !== a[b]._dirtyFlag && a[b].updateStatus();
        a.length = 0
    },
    transformDirty: function () {
        return 0 < this._transformNodePool.length
    },
    _sortNodeByLevelAsc: function (a, b) {
        return a._curLevel - b._curLevel
    },
    pushDirtyNode: function (a) {
        this._transformNodePool.push(a)
    },
    clearRenderCommands: function () {
        this._renderCmds.length = 0
    },
    pushRenderCommand: function (a) {
        if (a._needDraw)
            if (this._isCacheToCanvasOn) {
                var b = this._cacheToCanvasCmds[this._currentID];
                -1 === b.indexOf(a) && b.push(a)
            } else-1 === this._renderCmds.indexOf(a) && this._renderCmds.push(a)
    }
};
cc._renderType === cc._RENDER_TYPE_CANVAS && (cc.renderer = cc.rendererCanvas);
(function () {
    cc.CanvasContextWrapper = function (a) {
        this._context = a;
        this._saveCount = 0;
        this._currentAlpha = a.globalAlpha;
        this._currentCompositeOperation = a.globalCompositeOperation;
        this._currentFillStyle = a.fillStyle;
        this._currentStrokeStyle = a.strokeStyle;
        this._offsetY = this._offsetX = 0;
        this._realOffsetY = this.height;
        this._armatureMode = 0
    };
    var a = cc.CanvasContextWrapper.prototype;
    a.resetCache = function () {
        var a = this._context;
        this._currentAlpha = a.globalAlpha;
        this._currentCompositeOperation = a.globalCompositeOperation;
        this._currentFillStyle = a.fillStyle;
        this._currentStrokeStyle = a.strokeStyle;
        this._realOffsetY = this._context.canvas.height + this._offsetY
    };
    a.setOffset = function (a, c) {
        this._offsetX = a;
        this._offsetY = c;
        this._realOffsetY = this._context.canvas.height + this._offsetY
    };
    a.computeRealOffsetY = function () {
        this._realOffsetY = this._context.canvas.height + this._offsetY
    };
    a.setViewScale = function (a, c) {
        this._scaleX = a;
        this._scaleY = c
    };
    a.getContext = function () {
        return this._context
    };
    a.save = function () {
        this._context.save();
        this._saveCount++
    };
    a.restore = function () {
        this._context.restore();
        this._saveCount--
    };
    a.setGlobalAlpha = function (a) {
        0 < this._saveCount ? this._context.globalAlpha = a : this._currentAlpha !== a && (this._currentAlpha = a, this._context.globalAlpha = a)
    };
    a.setCompositeOperation = function (a) {
        0 < this._saveCount ? this._context.globalCompositeOperation = a : this._currentCompositeOperation !== a && (this._currentCompositeOperation = a, this._context.globalCompositeOperation = a)
    };
    a.setFillStyle = function (a) {
        0 < this._saveCount ? this._context.fillStyle = a : this._currentFillStyle !== a && (this._currentFillStyle = a, this._context.fillStyle = a)
    };
    a.setStrokeStyle = function (a) {
        0 < this._saveCount ? this._context.strokeStyle = a : this._currentStrokeStyle !== a && (this._currentStrokeStyle = a, this._context.strokeStyle = a)
    };
    a.setTransform = function (a, c, d) {
        0 < this._armatureMode ? (this.restore(), this.save(), this._context.transform(a.a, -a.b, -a.c, a.d, a.tx * c, -(a.ty * d))) : this._context.setTransform(a.a, -a.b, -a.c, a.d, this._offsetX + a.tx * c, this._realOffsetY - a.ty * d)
    };
    a._switchToArmatureMode = function (a, c, d, e) {
        a ? (this._armatureMode++, this._context.setTransform(c.a, c.c, c.b, c.d, this._offsetX + c.tx * d, this._realOffsetY - c.ty * e), this.save()) : (this._armatureMode--, this.restore())
    }
})();
cc.rendererWebGL = {
    childrenOrderDirty: !0,
    _transformNodePool: [],
    _renderCmds: [],
    _isCacheToBufferOn: !1,
    _cacheToBufferCmds: {},
    _cacheInstanceIds: [],
    _currentID: 0,
    getRenderCmd: function (a) {
        return a._createRenderCmd()
    },
    rendering: function (a) {
        var b = this._renderCmds, c, d = a || cc._renderContext;
        a = 0;
        for (c = b.length; a < c; a++)b[a].rendering(d)
    },
    _turnToCacheMode: function (a) {
        this._isCacheToBufferOn = !0;
        a = a || 0;
        this._cacheToBufferCmds[a] = [];
        this._cacheInstanceIds.push(a);
        this._currentID = a
    },
    _turnToNormalMode: function () {
        this._isCacheToBufferOn = !1
    },
    _renderingToBuffer: function (a) {
        a = a || this._currentID;
        var b = this._cacheToBufferCmds[a], c, d, e = cc._renderContext, f = this._cacheInstanceIds;
        c = 0;
        for (d = b.length; c < d; c++)b[c].rendering(e);
        b.length = 0;
        delete this._cacheToBufferCmds[a];
        cc.arrayRemoveObject(f, a);
        0 === f.length ? this._isCacheToBufferOn = !1 : this._currentID = f[f.length - 1]
    },
    resetFlag: function () {
        this.childrenOrderDirty = !1;
        this._transformNodePool.length = 0
    },
    transform: function () {
        var a = this._transformNodePool;
        a.sort(this._sortNodeByLevelAsc);
        for (var b = 0, c = a.length; b < c; b++)a[b].updateStatus();
        a.length = 0
    },
    transformDirty: function () {
        return 0 < this._transformNodePool.length
    },
    _sortNodeByLevelAsc: function (a, b) {
        return a._curLevel - b._curLevel
    },
    pushDirtyNode: function (a) {
        this._transformNodePool.push(a)
    },
    clearRenderCommands: function () {
        this._renderCmds.length = 0
    },
    pushRenderCommand: function (a) {
        if (a._needDraw)
            if (this._isCacheToBufferOn) {
                var b = this._cacheToBufferCmds[this._currentID];
                -1 === b.indexOf(a) && b.push(a)
            } else-1 === this._renderCmds.indexOf(a) && this._renderCmds.push(a)
    }
};
cc._renderType === cc._RENDER_TYPE_WEBGL && (cc.renderer = cc.rendererWebGL);
cc._tmp.PrototypeCCNode = function () {
    var a = cc.Node.prototype;
    cc.defineGetterSetter(a, "x", a.getPositionX, a.setPositionX);
    cc.defineGetterSetter(a, "y", a.getPositionY, a.setPositionY);
    cc.defineGetterSetter(a, "width", a._getWidth, a._setWidth);
    cc.defineGetterSetter(a, "height", a._getHeight, a._setHeight);
    cc.defineGetterSetter(a, "anchorX", a._getAnchorX, a._setAnchorX);
    cc.defineGetterSetter(a, "anchorY", a._getAnchorY, a._setAnchorY);
    cc.defineGetterSetter(a, "skewX", a.getSkewX, a.setSkewX);
    cc.defineGetterSetter(a, "skewY", a.getSkewY, a.setSkewY);
    cc.defineGetterSetter(a, "zIndex", a.getLocalZOrder, a.setLocalZOrder);
    cc.defineGetterSetter(a, "vertexZ", a.getVertexZ, a.setVertexZ);
    cc.defineGetterSetter(a, "rotation", a.getRotation, a.setRotation);
    cc.defineGetterSetter(a, "rotationX", a.getRotationX, a.setRotationX);
    cc.defineGetterSetter(a, "rotationY", a.getRotationY, a.setRotationY);
    cc.defineGetterSetter(a, "scale", a.getScale, a.setScale);
    cc.defineGetterSetter(a, "scaleX", a.getScaleX, a.setScaleX);
    cc.defineGetterSetter(a, "scaleY", a.getScaleY, a.setScaleY);
    cc.defineGetterSetter(a, "children", a.getChildren);
    cc.defineGetterSetter(a, "childrenCount", a.getChildrenCount);
    cc.defineGetterSetter(a, "parent", a.getParent, a.setParent);
    cc.defineGetterSetter(a, "visible", a.isVisible, a.setVisible);
    cc.defineGetterSetter(a, "running", a.isRunning);
    cc.defineGetterSetter(a, "ignoreAnchor", a.isIgnoreAnchorPointForPosition, a.ignoreAnchorPointForPosition);
    cc.defineGetterSetter(a, "actionManager", a.getActionManager, a.setActionManager);
    cc.defineGetterSetter(a, "scheduler", a.getScheduler, a.setScheduler);
    cc.defineGetterSetter(a, "shaderProgram", a.getShaderProgram, a.setShaderProgram);
    cc.defineGetterSetter(a, "opacity", a.getOpacity, a.setOpacity);
    cc.defineGetterSetter(a, "opacityModifyRGB", a.isOpacityModifyRGB);
    cc.defineGetterSetter(a, "cascadeOpacity", a.isCascadeOpacityEnabled, a.setCascadeOpacityEnabled);
    cc.defineGetterSetter(a, "color", a.getColor, a.setColor);
    cc.defineGetterSetter(a, "cascadeColor", a.isCascadeColorEnabled, a.setCascadeColorEnabled)
};
cc.NODE_TAG_INVALID = -1;
cc.s_globalOrderOfArrival = 1;
cc.Node = cc.Class.extend({
    _localZOrder: 0,
    _globalZOrder: 0,
    _vertexZ: 0,
    _rotationX: 0,
    _rotationY: 0,
    _scaleX: 1,
    _scaleY: 1,
    _position: null,
    _normalizedPosition: null,
    _usingNormalizedPosition: !1,
    _normalizedPositionDirty: !1,
    _skewX: 0,
    _skewY: 0,
    _children: null,
    _visible: !0,
    _anchorPoint: null,
    _contentSize: null,
    _running: !1,
    _parent: null,
    _ignoreAnchorPointForPosition: !1,
    tag: cc.NODE_TAG_INVALID,
    userData: null,
    userObject: null,
    _reorderChildDirty: !1,
    _shaderProgram: null,
    arrivalOrder: 0,
    _actionManager: null,
    _scheduler: null,
    _eventDispatcher: null,
    _additionalTransformDirty: !1,
    _additionalTransform: null,
    _componentContainer: null,
    _isTransitionFinished: !1,
    _className: "Node",
    _showNode: !1,
    _name: "",
    _realOpacity: 255,
    _realColor: null,
    _cascadeColorEnabled: !1,
    _cascadeOpacityEnabled: !1,
    _renderCmd: null,
    _camera: null,
    ctor: function () {
        this._initNode();
        this._initRendererCmd()
    },
    _initNode: function () {
        this._anchorPoint = cc.p(0, 0);
        this._contentSize = cc.size(0, 0);
        this._position = cc.p(0, 0);
        this._normalizedPosition = cc.p(0, 0);
        this._children = [];
        var a = cc.director;
        this._actionManager = a.getActionManager();
        this._scheduler = a.getScheduler();
        this._additionalTransform = cc.affineTransformMakeIdentity();
        cc.ComponentContainer && (this._componentContainer = new cc.ComponentContainer(this));
        this._realOpacity = 255;
        this._realColor = cc.color(255, 255, 255, 255);
        this._cascadeOpacityEnabled = this._cascadeColorEnabled = !1
    },
    init: function () {
        return !0
    },
    _arrayMakeObjectsPerformSelector: function (a, b) {
        if (a && 0 !== a.length) {
            var c, d = a.length, e;
            c = cc.Node._stateCallbackType;
            switch (b) {
                case c.onEnter:
                    for (c = 0; c < d; c++)
                        if (e = a[c])e.onEnter();
                    break;
                case c.onExit:
                    for (c = 0; c < d; c++)
                        if (e = a[c])e.onExit();
                    break;
                case c.onEnterTransitionDidFinish:
                    for (c = 0; c < d; c++)
                        if (e = a[c])e.onEnterTransitionDidFinish();
                    break;
                case c.cleanup:
                    for (c = 0; c < d; c++)(e = a[c]) && e.cleanup();
                    break;
                case c.updateTransform:
                    for (c = 0; c < d; c++)(e = a[c]) && e.updateTransform();
                    break;
                case c.onExitTransitionDidStart:
                    for (c = 0; c < d; c++)
                        if (e = a[c])e.onExitTransitionDidStart();
                    break;
                case c.sortAllChildren:
                    for (c = 0; c < d; c++)(e = a[c]) && e.sortAllChildren();
                    break;
                default:
                    cc.assert(0, cc._LogInfos.Node__arrayMakeObjectsPerformSelector)
            }
        }
    },
    attr: function (a) {
        for (var b in a)this[b] = a[b]
    },
    getSkewX: function () {
        return this._skewX
    },
    setSkewX: function (a) {
        this._skewX = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getSkewY: function () {
        return this._skewY
    },
    setSkewY: function (a) {
        this._skewY = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    setLocalZOrder: function (a) {
        this._localZOrder = a;
        this._parent && this._parent.reorderChild(this, a);
        cc.eventManager._setDirtyForNode(this)
    },
    _setLocalZOrder: function (a) {
        this._localZOrder = a
    },
    getLocalZOrder: function () {
        return this._localZOrder
    },
    getZOrder: function () {
        cc.log(cc._LogInfos.Node_getZOrder);
        return this.getLocalZOrder()
    },
    setZOrder: function (a) {
        cc.log(cc._LogInfos.Node_setZOrder);
        this.setLocalZOrder(a)
    },
    setGlobalZOrder: function (a) {
        this._globalZOrder !== a && (this._globalZOrder = a, cc.eventManager._setDirtyForNode(this))
    },
    getGlobalZOrder: function () {
        return this._globalZOrder
    },
    getVertexZ: function () {
        return this._vertexZ
    },
    setVertexZ: function (a) {
        this._vertexZ = a
    },
    getRotation: function () {
        this._rotationX !== this._rotationY && cc.log(cc._LogInfos.Node_getRotation);
        return this._rotationX
    },
    setRotation: function (a) {
        this._rotationX = this._rotationY = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getRotationX: function () {
        return this._rotationX
    },
    setRotationX: function (a) {
        this._rotationX = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getRotationY: function () {
        return this._rotationY
    },
    setRotationY: function (a) {
        this._rotationY = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getScale: function () {
        this._scaleX !== this._scaleY && cc.log(cc._LogInfos.Node_getScale);
        return this._scaleX
    },
    setScale: function (a, b) {
        this._scaleX = a;
        this._scaleY = b || 0 === b ? b : a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getScaleX: function () {
        return this._scaleX
    },
    setScaleX: function (a) {
        this._scaleX = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getScaleY: function () {
        return this._scaleY
    },
    setScaleY: function (a) {
        this._scaleY = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    setPosition: function (a, b) {
        var c = this._position;
        if (void 0 === b) {
            if (c.x === a.x && c.y === a.y)return;
            c.x = a.x;
            c.y = a.y
        } else {
            if (c.x === a && c.y === b)return;
            c.x = a;
            c.y = b
        }
        this._usingNormalizedPosition = !1;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    setNormalizedPosition: function (a, b) {
        var c = this._normalizedPosition;
        void 0 === b ? (c.x = a.x, c.y = a.y) : (c.x = a, c.y = b);
        this._normalizedPositionDirty = this._usingNormalizedPosition = !0;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getPosition: function () {
        return cc.p(this._position)
    },
    getNormalizedPosition: function () {
        return cc.p(this._normalizedPosition)
    },
    getPositionX: function () {
        return this._position.x
    },
    setPositionX: function (a) {
        this._position.x = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getPositionY: function () {
        return this._position.y
    },
    setPositionY: function (a) {
        this._position.y = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    getChildrenCount: function () {
        return this._children.length
    },
    getChildren: function () {
        return this._children
    },
    isVisible: function () {
        return this._visible
    },
    setVisible: function (a) {
        this._visible !== a && (this._visible = a, this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty), cc.renderer.childrenOrderDirty = !0)
    },
    getAnchorPoint: function () {
        return cc.p(this._anchorPoint)
    },
    setAnchorPoint: function (a, b) {
        var c = this._anchorPoint;
        if (void 0 === b) {
            if (a.x === c.x && a.y === c.y)return;
            c.x = a.x;
            c.y = a.y
        } else {
            if (a === c.x && b === c.y)return;
            c.x = a;
            c.y = b
        }
        this._renderCmd._updateAnchorPointInPoint()
    },
    _getAnchorX: function () {
        return this._anchorPoint.x
    },
    _setAnchorX: function (a) {
        this._anchorPoint.x !== a && (this._anchorPoint.x = a, this._renderCmd._updateAnchorPointInPoint())
    },
    _getAnchorY: function () {
        return this._anchorPoint.y
    },
    _setAnchorY: function (a) {
        this._anchorPoint.y !== a && (this._anchorPoint.y = a, this._renderCmd._updateAnchorPointInPoint())
    },
    getAnchorPointInPoints: function () {
        return this._renderCmd.getAnchorPointInPoints()
    },
    _getWidth: function () {
        return this._contentSize.width
    },
    _setWidth: function (a) {
        this._contentSize.width = a;
        this._renderCmd._updateAnchorPointInPoint()
    },
    _getHeight: function () {
        return this._contentSize.height
    },
    _setHeight: function (a) {
        this._contentSize.height = a;
        this._renderCmd._updateAnchorPointInPoint()
    },
    getContentSize: function () {
        return cc.size(this._contentSize)
    },
    setContentSize: function (a, b) {
        var c = this._contentSize;
        if (void 0 === b) {
            if (a.width === c.width && a.height === c.height)return;
            c.width = a.width;
            c.height = a.height
        } else {
            if (a === c.width && b === c.height)return;
            c.width = a;
            c.height = b
        }
        this._renderCmd._updateAnchorPointInPoint()
    },
    isRunning: function () {
        return this._running
    },
    getParent: function () {
        return this._parent
    },
    setParent: function (a) {
        this._parent = a
    },
    isIgnoreAnchorPointForPosition: function () {
        return this._ignoreAnchorPointForPosition
    },
    ignoreAnchorPointForPosition: function (a) {
        a !== this._ignoreAnchorPointForPosition && (this._ignoreAnchorPointForPosition = a, this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty))
    },
    getTag: function () {
        return this.tag
    },
    setTag: function (a) {
        this.tag = a
    },
    setName: function (a) {
        this._name = a
    },
    getName: function () {
        return this._name
    },
    getUserData: function () {
        return this.userData
    },
    setUserData: function (a) {
        this.userData = a
    },
    getUserObject: function () {
        return this.userObject
    },
    setUserObject: function (a) {
        this.userObject !== a && (this.userObject = a)
    },
    getOrderOfArrival: function () {
        return this.arrivalOrder
    },
    setOrderOfArrival: function (a) {
        this.arrivalOrder = a
    },
    getActionManager: function () {
        this._actionManager || (this._actionManager = cc.director.getActionManager());
        return this._actionManager
    },
    setActionManager: function (a) {
        this._actionManager !== a && (this.stopAllActions(), this._actionManager = a)
    },
    getScheduler: function () {
        this._scheduler || (this._scheduler = cc.director.getScheduler());
        return this._scheduler
    },
    setScheduler: function (a) {
        this._scheduler !== a && (this.unscheduleAllCallbacks(), this._scheduler = a)
    },
    boundingBox: function () {
        cc.log(cc._LogInfos.Node_boundingBox);
        return this.getBoundingBox()
    },
    getBoundingBox: function () {
        var a = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        return cc._rectApplyAffineTransformIn(a, this.getNodeToParentTransform())
    },
    cleanup: function () {
        this.stopAllActions();
        this.unscheduleAllCallbacks();
        cc.eventManager.removeListeners(this);
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.cleanup)
    },
    getChildByTag: function (a) {
        var b = this._children;
        if (null !== b)
            for (var c = 0; c < b.length; c++) {
                var d = b[c];
                if (d && d.tag === a)return d
            }
        return null
    },
    getChildByName: function (a) {
        if (!a)return cc.log("Invalid name"), null;
        for (var b = this._children, c = 0, d = b.length; c < d; c++)
            if (b[c]._name === a)return b[c];
        return null
    },
    addChild: function (a, b, c) {
        b = void 0 === b ? a._localZOrder : b;
        var d, e = !1;
        cc.isUndefined(c) ? (c = void 0, d = a._name) : cc.isString(c) ? (d = c, c = void 0) : cc.isNumber(c) && (e = !0, d = "");
        cc.assert(a, cc._LogInfos.Node_addChild_3);
        cc.assert(null === a._parent, "child already added. It can't be added again");
        this._addChildHelper(a, b, c, d, e)
    },
    _addChildHelper: function (a, b, c, d, e) {
        this._children || (this._children = []);
        this._insertChild(a, b);
        e ? a.setTag(c) : a.setName(d);
        a.setParent(this);
        a.setOrderOfArrival(cc.s_globalOrderOfArrival++);
        if (this._running && (a.onEnter(), this._isTransitionFinished))a.onEnterTransitionDidFinish();
        this._cascadeColorEnabled && a._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty);
        this._cascadeOpacityEnabled && a._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    },
    removeFromParent: function (a) {
        this._parent && (void 0 === a && (a = !0), this._parent.removeChild(this, a))
    },
    removeFromParentAndCleanup: function (a) {
        cc.log(cc._LogInfos.Node_removeFromParentAndCleanup);
        this.removeFromParent(a)
    },
    removeChild: function (a, b) {
        0 !== this._children.length && (void 0 === b && (b = !0), -1 < this._children.indexOf(a) && this._detachChild(a, b), cc.renderer.childrenOrderDirty = !0)
    },
    removeChildByTag: function (a, b) {
        a === cc.NODE_TAG_INVALID && cc.log(cc._LogInfos.Node_removeChildByTag);
        var c = this.getChildByTag(a);
        c ? this.removeChild(c, b) : cc.log(cc._LogInfos.Node_removeChildByTag_2, a)
    },
    removeAllChildrenWithCleanup: function (a) {
        this.removeAllChildren(a)
    },
    removeAllChildren: function (a) {
        var b = this._children;
        if (null !== b) {
            void 0 === a && (a = !0);
            for (var c = 0; c < b.length; c++) {
                var d = b[c];
                d && (this._running && (d.onExitTransitionDidStart(), d.onExit()), a && d.cleanup(), d.parent = null, d._renderCmd.detachFromParent())
            }
            this._children.length = 0;
            cc.renderer.childrenOrderDirty = !0
        }
    },
    _detachChild: function (a, b) {
        this._running && (a.onExitTransitionDidStart(), a.onExit());
        b && a.cleanup();
        a.parent = null;
        a._renderCmd.detachFromParent();
        cc.arrayRemoveObject(this._children, a)
    },
    _insertChild: function (a, b) {
        cc.renderer.childrenOrderDirty = this._reorderChildDirty = !0;
        this._children.push(a);
        a._setLocalZOrder(b)
    },
    setNodeDirty: function () {
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    },
    reorderChild: function (a, b) {
        cc.assert(a, cc._LogInfos.Node_reorderChild);
        cc.renderer.childrenOrderDirty = this._reorderChildDirty = !0;
        a.arrivalOrder = cc.s_globalOrderOfArrival;
        cc.s_globalOrderOfArrival++;
        a._setLocalZOrder(b)
    },
    sortAllChildren: function () {
        if (this._reorderChildDirty) {
            var a = this._children, b = a.length, c, d, e;
            for (c = 1; c < b; c++) {
                e = a[c];
                for (d = c - 1; 0 <= d;) {
                    if (e._localZOrder < a[d]._localZOrder)a[d + 1] = a[d]; else if (e._localZOrder === a[d]._localZOrder && e.arrivalOrder < a[d].arrivalOrder)a[d + 1] = a[d]; else break;
                    d--
                }
                a[d + 1] = e
            }
            this._reorderChildDirty = !1
        }
    },
    draw: function (a) {
    },
    transformAncestors: function () {
        null !== this._parent && (this._parent.transformAncestors(), this._parent.transform())
    },
    onEnter: function () {
        this._isTransitionFinished = !1;
        this._running = !0;
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onEnter);
        this.resume()
    },
    onEnterTransitionDidFinish: function () {
        this._isTransitionFinished = !0;
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onEnterTransitionDidFinish)
    },
    onExitTransitionDidStart: function () {
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onExitTransitionDidStart)
    },
    onExit: function () {
        this._running = !1;
        this.pause();
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onExit);
        this.removeAllComponents()
    },
    runAction: function (a) {
        cc.assert(a, cc._LogInfos.Node_runAction);
        this.actionManager.addAction(a, this, !this._running);
        return a
    },
    stopAllActions: function () {
        this.actionManager && this.actionManager.removeAllActionsFromTarget(this)
    },
    stopAction: function (a) {
        this.actionManager.removeAction(a)
    },
    stopActionByTag: function (a) {
        a === cc.ACTION_TAG_INVALID ? cc.log(cc._LogInfos.Node_stopActionByTag) : this.actionManager.removeActionByTag(a, this)
    },
    getActionByTag: function (a) {
        return a === cc.ACTION_TAG_INVALID ? (cc.log(cc._LogInfos.Node_getActionByTag), null) : this.actionManager.getActionByTag(a, this)
    },
    getNumberOfRunningActions: function () {
        return this.actionManager.numberOfRunningActionsInTarget(this)
    },
    scheduleUpdate: function () {
        this.scheduleUpdateWithPriority(0)
    },
    scheduleUpdateWithPriority: function (a) {
        this.scheduler.scheduleUpdate(this, a, !this._running)
    },
    unscheduleUpdate: function () {
        this.scheduler.unscheduleUpdate(this)
    },
    schedule: function (a, b, c, d, e) {
        var f = arguments.length;
        "function" === typeof a ? 1 === f ? (b = 0, c = cc.REPEAT_FOREVER, d = 0, e = this.__instanceId) : 2 === f ? "number" === typeof b ? (c = cc.REPEAT_FOREVER, d = 0, e = this.__instanceId) : (e = b, b = 0, c = cc.REPEAT_FOREVER, d = 0) : 3 === f ? ("string" === typeof c ? (e = c, c = cc.REPEAT_FOREVER) : e = this.__instanceId, d = 0) : 4 === f && (e = this.__instanceId) : 1 === f ? (b = 0, c = cc.REPEAT_FOREVER, d = 0) : 2 === f && (c = cc.REPEAT_FOREVER, d = 0);
        cc.assert(a, cc._LogInfos.Node_schedule);
        cc.assert(0 <= b, cc._LogInfos.Node_schedule_2);
        c = null == c ? cc.REPEAT_FOREVER : c;
        this.scheduler.schedule(a, this, b || 0, c, d || 0, !this._running, e)
    },
    scheduleOnce: function (a, b, c) {
        void 0 === c && (c = this.__instanceId);
        this.schedule(a, 0, 0, b, c)
    },
    unschedule: function (a) {
        a && this.scheduler.unschedule(a, this)
    },
    unscheduleAllCallbacks: function () {
        this.scheduler.unscheduleAllForTarget(this)
    },
    resumeSchedulerAndActions: function () {
        cc.log(cc._LogInfos.Node_resumeSchedulerAndActions);
        this.resume()
    },
    resume: function () {
        this.scheduler.resumeTarget(this);
        this.actionManager && this.actionManager.resumeTarget(this);
        cc.eventManager.resumeTarget(this)
    },
    pauseSchedulerAndActions: function () {
        cc.log(cc._LogInfos.Node_pauseSchedulerAndActions);
        this.pause()
    },
    pause: function () {
        this.scheduler.pauseTarget(this);
        this.actionManager && this.actionManager.pauseTarget(this);
        cc.eventManager.pauseTarget(this)
    },
    setAdditionalTransform: function (a) {
        if (void 0 === a)return this._additionalTransformDirty = !1;
        this._additionalTransform = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty);
        this._additionalTransformDirty = !0
    },
    getParentToNodeTransform: function () {
        this._renderCmd.getParentToNodeTransform()
    },
    parentToNodeTransform: function () {
        return this.getParentToNodeTransform()
    },
    getNodeToWorldTransform: function () {
        for (var a = this.getNodeToParentTransform(), b = this._parent; null !== b; b = b.parent)a = cc.affineTransformConcat(a, b.getNodeToParentTransform());
        return a
    },
    nodeToWorldTransform: function () {
        return this.getNodeToWorldTransform()
    },
    getWorldToNodeTransform: function () {
        return cc.affineTransformInvert(this.getNodeToWorldTransform())
    },
    worldToNodeTransform: function () {
        return this.getWorldToNodeTransform()
    },
    convertToNodeSpace: function (a) {
        return cc.pointApplyAffineTransform(a, this.getWorldToNodeTransform())
    },
    convertToWorldSpace: function (a) {
        a = a || cc.p(0, 0);
        return cc.pointApplyAffineTransform(a, this.getNodeToWorldTransform())
    },
    convertToNodeSpaceAR: function (a) {
        return cc.pSub(this.convertToNodeSpace(a), this._renderCmd.getAnchorPointInPoints())
    },
    convertToWorldSpaceAR: function (a) {
        a = a || cc.p(0, 0);
        a = cc.pAdd(a, this._renderCmd.getAnchorPointInPoints());
        return this.convertToWorldSpace(a)
    },
    _convertToWindowSpace: function (a) {
        a = this.convertToWorldSpace(a);
        return cc.director.convertToUI(a)
    },
    convertTouchToNodeSpace: function (a) {
        a = a.getLocation();
        return this.convertToNodeSpace(a)
    },
    convertTouchToNodeSpaceAR: function (a) {
        a = cc.director.convertToGL(a.getLocation());
        return this.convertToNodeSpaceAR(a)
    },
    update: function (a) {
        this._componentContainer && !this._componentContainer.isEmpty() && this._componentContainer.visit(a)
    },
    updateTransform: function () {
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.updateTransform)
    },
    retain: function () {
    },
    release: function () {
    },
    getComponent: function (a) {
        return this._componentContainer ? this._componentContainer.getComponent(a) : null
    },
    addComponent: function (a) {
        this._componentContainer && this._componentContainer.add(a)
    },
    removeComponent: function (a) {
        return this._componentContainer ? this._componentContainer.remove(a) : !1
    },
    removeAllComponents: function () {
        this._componentContainer && this._componentContainer.removeAll()
    },
    grid: null,
    visit: function (a) {
        this._renderCmd.visit(a)
    },
    transform: function (a, b) {
        this._renderCmd.transform(a, b)
    },
    nodeToParentTransform: function () {
        return this.getNodeToParentTransform()
    },
    getNodeToParentTransform: function () {
        return this._renderCmd.getNodeToParentTransform()
    },
    getCamera: function () {
        this._camera || (this._camera = new cc.Camera);
        return this._camera
    },
    getGrid: function () {
        return this.grid
    },
    setGrid: function (a) {
        this.grid = a
    },
    getShaderProgram: function () {
        return this._renderCmd.getShaderProgram()
    },
    setShaderProgram: function (a) {
        this._renderCmd.setShaderProgram(a)
    },
    getGLServerState: function () {
        return 0
    },
    setGLServerState: function (a) {
    },
    getBoundingBoxToWorld: function () {
        var a = cc.rect(0, 0, this._contentSize.width, this._contentSize.height), b = this.getNodeToWorldTransform(), a = cc.rectApplyAffineTransform(a, b);
        if (!this._children)return a;
        for (var c = this._children, d = 0; d < c.length; d++) {
            var e = c[d];
            e && e._visible && (e = e._getBoundingBoxToCurrentNode(b)) && (a = cc.rectUnion(a, e))
        }
        return a
    },
    _getBoundingBoxToCurrentNode: function (a) {
        var b = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        a = void 0 === a ? this.getNodeToParentTransform() : cc.affineTransformConcat(this.getNodeToParentTransform(), a);
        b = cc.rectApplyAffineTransform(b, a);
        if (!this._children)return b;
        for (var c = this._children, d = 0; d < c.length; d++) {
            var e = c[d];
            e && e._visible && (e = e._getBoundingBoxToCurrentNode(a)) && (b = cc.rectUnion(b, e))
        }
        return b
    },
    getOpacity: function () {
        return this._realOpacity
    },
    getDisplayedOpacity: function () {
        return this._renderCmd.getDisplayedOpacity()
    },
    setOpacity: function (a) {
        this._realOpacity = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    },
    updateDisplayedOpacity: function (a) {
        this._renderCmd._updateDisplayOpacity(a)
    },
    isCascadeOpacityEnabled: function () {
        return this._cascadeOpacityEnabled
    },
    setCascadeOpacityEnabled: function (a) {
        this._cascadeOpacityEnabled !== a && (this._cascadeOpacityEnabled = a, this._renderCmd.setCascadeOpacityEnabledDirty())
    },
    getColor: function () {
        var a = this._realColor;
        return cc.color(a.r, a.g, a.b, a.a)
    },
    getDisplayedColor: function () {
        return this._renderCmd.getDisplayedColor()
    },
    setColor: function (a) {
        var b = this._realColor;
        b.r = a.r;
        b.g = a.g;
        b.b = a.b;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty)
    },
    updateDisplayedColor: function (a) {
        this._renderCmd._updateDisplayColor(a)
    },
    isCascadeColorEnabled: function () {
        return this._cascadeColorEnabled
    },
    setCascadeColorEnabled: function (a) {
        this._cascadeColorEnabled !== a && (this._cascadeColorEnabled = a, this._renderCmd.setCascadeColorEnabledDirty())
    },
    setOpacityModifyRGB: function (a) {
    },
    isOpacityModifyRGB: function () {
        return !1
    },
    _initRendererCmd: function () {
        this._renderCmd = cc.renderer.getRenderCmd(this)
    },
    _createRenderCmd: function () {
        return cc._renderType === cc._RENDER_TYPE_CANVAS ? new cc.Node.CanvasRenderCmd(this) : new cc.Node.WebGLRenderCmd(this)
    },
    enumerateChildren: function (a, b) {
        cc.assert(a && 0 != a.length, "Invalid name");
        cc.assert(null != b, "Invalid callback function");
        var c = a.length, d = 0, e = c, f = !1;
        2 < c && "/" === a[0] && "/" === a[1] && (f = !0, d = 2, e -= 2);
        var g = !1;
        3 < c && "/" === a[c - 3] && "." === a[c - 2] && "." === a[c - 1] && (g = !0, e -= 3);
        c = a.substr(d, e);
        g && (c = "[[:alnum:]]+/" + c);
        f ? this.doEnumerateRecursive(this, c, b) : this.doEnumerate(c, b)
    },
    doEnumerateRecursive: function (a, b, c) {
        if (!a.doEnumerate(b, c))
            for (var d = a.getChildren(), e = d.length, f = 0; f < e && (a = d[f], !this.doEnumerateRecursive(a, b, c)); f++);
    },
    doEnumerate: function (a, b) {
        var c = a.indexOf("/"), d = a, e = !1;
        -1 !== c && (d = a.substr(0, c), e = !0);
        for (var c = !1, f, g = this._children, h = g.length, k = 0; k < h; k++)
            if (f = g[k], -1 !== f._name.indexOf(d))
                if (e) {
                    if (c = f.doEnumerate(a, b))break
                } else if (b(f)) {
                    c = !0;
                    break
                }
        return c
    }
});
cc.Node.create = function () {
    return new cc.Node
};
cc.Node._stateCallbackType = {
    onEnter: 1,
    onExit: 2,
    cleanup: 3,
    onEnterTransitionDidFinish: 4,
    updateTransform: 5,
    onExitTransitionDidStart: 6,
    sortAllChildren: 7
};
cc.assert(cc.isFunction(cc._tmp.PrototypeCCNode), cc._LogInfos.MissingFile, "BaseNodesPropertyDefine.js");
cc._tmp.PrototypeCCNode();
delete cc._tmp.PrototypeCCNode;
cc.CustomRenderCmd = function (a, b) {
    this._needDraw = !0;
    this._target = a;
    this._callback = b;
    this.rendering = function (a, b, e) {
        this._callback && this._callback.call(this._target, a, b, e)
    }
};
cc.Node._dirtyFlags = {
    transformDirty: 1,
    visibleDirty: 2,
    colorDirty: 4,
    opacityDirty: 8,
    cacheDirty: 16,
    orderDirty: 32,
    textDirty: 64,
    gradientDirty: 128,
    all: 255
};
cc.Node.RenderCmd = function (a) {
    this._dirtyFlag = 1;
    this._node = a;
    this._needDraw = !1;
    this._anchorPointInPoints = new cc.Point(0, 0);
    this._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._worldTransform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._inverse = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
    this._displayedOpacity = 255;
    this._displayedColor = cc.color(255, 255, 255, 255);
    this._cascadeOpacityEnabledDirty = this._cascadeColorEnabledDirty = !1;
    this._curLevel = -1
};
cc.Node.RenderCmd.prototype = {
    constructor: cc.Node.RenderCmd, getAnchorPointInPoints: function () {
        return cc.p(this._anchorPointInPoints)
    }, getDisplayedColor: function () {
        var a = this._displayedColor;
        return cc.color(a.r, a.g, a.b, a.a)
    }, getDisplayedOpacity: function () {
        return this._displayedOpacity
    }, setCascadeColorEnabledDirty: function () {
        this._cascadeColorEnabledDirty = !0;
        this.setDirtyFlag(cc.Node._dirtyFlags.colorDirty)
    }, setCascadeOpacityEnabledDirty: function () {
        this._cascadeOpacityEnabledDirty = !0;
        this.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    }, getParentToNodeTransform: function () {
        this._dirtyFlag & cc.Node._dirtyFlags.transformDirty && (this._inverse = cc.affineTransformInvert(this.getNodeToParentTransform()));
        return this._inverse
    }, detachFromParent: function () {
    }, _updateAnchorPointInPoint: function () {
        var a = this._anchorPointInPoints, b = this._node._contentSize, c = this._node._anchorPoint;
        a.x = b.width * c.x;
        a.y = b.height * c.y;
        this.setDirtyFlag(cc.Node._dirtyFlags.transformDirty)
    }, setDirtyFlag: function (a) {
        0 === this._dirtyFlag && 0 !== a && cc.renderer.pushDirtyNode(this);
        this._dirtyFlag |= a
    }, getParentRenderCmd: function () {
        return this._node && this._node._parent && this._node._parent._renderCmd ? this._node._parent._renderCmd : null
    }, _updateDisplayColor: function (a) {
        var b = this._node, c = this._displayedColor, d = b._realColor, e;
        if (this._cascadeColorEnabledDirty && !b._cascadeColorEnabled) {
            c.r = d.r;
            c.g = d.g;
            c.b = d.b;
            c = new cc.Color(255, 255, 255, 255);
            a = b._children;
            b = 0;
            for (d = a.length; b < d; b++)(e = a[b]) && e._renderCmd && e._renderCmd._updateDisplayColor(c);
            this._cascadeColorEnabledDirty = !1
        } else if (void 0 === a && (a = (a = b._parent) && a._cascadeColorEnabled ? a.getDisplayedColor() : cc.color.WHITE), c.r = 0 | d.r * a.r / 255, c.g = 0 | d.g * a.g / 255, c.b = 0 | d.b * a.b / 255, b._cascadeColorEnabled)
            for (a = b._children, b = 0, d = a.length; b < d; b++)(e = a[b]) && e._renderCmd && (e._renderCmd._updateDisplayColor(c), e._renderCmd._updateColor());
        this._dirtyFlag ^= this._dirtyFlag & cc.Node._dirtyFlags.colorDirty
    }, _updateDisplayOpacity: function (a) {
        var b = this._node, c, d;
        if (this._cascadeOpacityEnabledDirty && !b._cascadeOpacityEnabled) {
            this._displayedOpacity = b._realOpacity;
            c = b._children;
            a = 0;
            for (b = c.length; a < b; a++)(d = c[a]) && d._renderCmd && d._renderCmd._updateDisplayOpacity(255);
            this._cascadeOpacityEnabledDirty = !1
        } else if (void 0 === a && (c = b._parent, a = 255, c && c._cascadeOpacityEnabled && (a = c.getDisplayedOpacity())), this._displayedOpacity = b._realOpacity * a / 255, b._cascadeOpacityEnabled)
            for (c = b._children, a = 0, b = c.length; a < b; a++)(d = c[a]) && d._renderCmd && (d._renderCmd._updateDisplayOpacity(this._displayedOpacity), d._renderCmd._updateColor());
        this._dirtyFlag ^= this._dirtyFlag & cc.Node._dirtyFlags.opacityDirty
    }, _syncDisplayColor: function (a) {
        var b = this._node, c = this._displayedColor, d = b._realColor;
        void 0 === a && (a = (a = b._parent) && a._cascadeColorEnabled ? a.getDisplayedColor() : cc.color.WHITE);
        c.r = 0 | d.r * a.r / 255;
        c.g = 0 | d.g * a.g / 255;
        c.b = 0 | d.b * a.b / 255
    }, _syncDisplayOpacity: function (a) {
        var b = this._node;
        if (void 0 === a) {
            var c = b._parent;
            a = 255;
            c && c._cascadeOpacityEnabled && (a = c.getDisplayedOpacity())
        }
        this._displayedOpacity = b._realOpacity * a / 255
    }, _updateColor: function () {
    }, updateStatus: function () {
        var a = cc.Node._dirtyFlags, b = this._dirtyFlag, c = b & a.colorDirty, d = b & a.opacityDirty;
        c && this._updateDisplayColor();
        d && this._updateDisplayOpacity();
        (c || d) && this._updateColor();
        b & a.transformDirty && (this.transform(this.getParentRenderCmd(), !0), this._dirtyFlag ^= this._dirtyFlag & cc.Node._dirtyFlags.transformDirty)
    }
};
(function () {
    cc.Node.CanvasRenderCmd = function (a) {
        cc.Node.RenderCmd.call(this, a);
        this._cachedParent = null;
        this._cacheDirty = !1
    };
    var a = cc.Node.CanvasRenderCmd.prototype = Object.create(cc.Node.RenderCmd.prototype);
    a.constructor = cc.Node.CanvasRenderCmd;
    a.transform = function (a, c) {
        var d = this.getNodeToParentTransform(), e = this._worldTransform;
        this._cacheDirty = !0;
        if (a) {
            var f = a._worldTransform;
            e.a = d.a * f.a + d.b * f.c;
            e.b = d.a * f.b + d.b * f.d;
            e.c = d.c * f.a + d.d * f.c;
            e.d = d.c * f.b + d.d * f.d;
            e.tx = f.a * d.tx + f.c * d.ty + f.tx;
            e.ty = f.d * d.ty +
                f.ty + f.b * d.tx
        } else e.a = d.a, e.b = d.b, e.c = d.c, e.d = d.d, e.tx = d.tx, e.ty = d.ty;
        if (c && (d = this._node._children) && 0 !== d.length)
            for (e = 0, f = d.length; e < f; e++)d[e]._renderCmd.transform(this, c)
    };
    a.getNodeToParentTransform = function () {
        var a = this._node, c = !1;
        a._usingNormalizedPosition && a._parent && (c = a._parent._contentSize, a._position.x = a._normalizedPosition.x * c.width, a._position.y = a._normalizedPosition.y * c.height, a._normalizedPositionDirty = !1, c = !0);
        if (c || this._dirtyFlag & cc.Node._dirtyFlags.transformDirty) {
            c = this._transform;
            c.tx = a._position.x;
            c.ty = a._position.y;
            var d = 1, e = 0, f = 0, g = 1;
            a._rotationX && (g = 0.017453292519943295 * a._rotationX, f = Math.sin(g), g = Math.cos(g));
            a._rotationY && (e = 0.017453292519943295 * a._rotationY, d = Math.cos(e), e = -Math.sin(e));
            c.a = d;
            c.b = e;
            c.c = f;
            c.d = g;
            var h = a._scaleX, k = a._scaleY, m = this._anchorPointInPoints.x, n = this._anchorPointInPoints.y, p = 1E-6 > h && -1E-6 < h ? 1E-6 : h, s = 1E-6 > k && -1E-6 < k ? 1E-6 : k;
            if (1 !== h || 1 !== k)d = c.a *= p, e = c.b *= p, f = c.c *= s, g = c.d *= s;
            if (a._skewX || a._skewY)h = Math.tan(-a._skewX * Math.PI / 180), k = Math.tan(-a._skewY * Math.PI / 180), Infinity === h && (h = 99999999), Infinity === k && (k = 99999999), p = n * h, s = m * k, c.a = d - f * k, c.b = e - g * k, c.c = f - d * h, c.d = g - e * h, c.tx += d * p + f * s, c.ty += e * p + g * s;
            c.tx -= d * m + f * n;
            c.ty -= e * m + g * n;
            a._ignoreAnchorPointForPosition && (c.tx += m, c.ty += n);
            a._additionalTransformDirty && (this._transform = cc.affineTransformConcat(c, a._additionalTransform))
        }
        return this._transform
    };
    a.visit = function (a) {
        var c = this._node;
        if (c._visible) {
            if (a = a || this.getParentRenderCmd())this._curLevel = a._curLevel + 1;
            var d = c._children, e;
            this._syncStatus(a);
            a = d.length;
            if (0 < a) {
                c.sortAllChildren();
                for (c = 0; c < a; c++)
                    if (e = d[c], 0 > e._localZOrder)e._renderCmd.visit(this); else break;
                for (cc.renderer.pushRenderCommand(this); c < a; c++)d[c]._renderCmd.visit(this)
            } else cc.renderer.pushRenderCommand(this);
            this._dirtyFlag = 0
        }
    };
    a._syncStatus = function (a) {
        var c = cc.Node._dirtyFlags, d = this._dirtyFlag, e = a ? a._node : null;
        e && e._cascadeColorEnabled && a._dirtyFlag & c.colorDirty && (d |= c.colorDirty);
        e && e._cascadeOpacityEnabled && a._dirtyFlag & c.opacityDirty && (d |= c.opacityDirty);
        a && a._dirtyFlag & c.transformDirty && (d |= c.transformDirty);
        var e = d & c.colorDirty, f = d & c.opacityDirty, c = d & c.transformDirty;
        this._dirtyFlag = d;
        e && this._syncDisplayColor();
        f && this._syncDisplayOpacity();
        e && this._updateColor();
        c && this.transform(a)
    };
    a.setDirtyFlag = function (a) {
        cc.Node.RenderCmd.prototype.setDirtyFlag.call(this, a);
        this._setCacheDirty();
        this._cachedParent && this._cachedParent.setDirtyFlag(a)
    };
    a._setCacheDirty = function () {
        if (!1 === this._cacheDirty) {
            this._cacheDirty = !0;
            var a = this._cachedParent;
            a && a !== this && a._setNodeDirtyForCache && a._setNodeDirtyForCache()
        }
    };
    a._setCachedParent = function (a) {
        if (this._cachedParent !== a) {
            this._cachedParent = a;
            for (var c = this._node._children, d = 0, e = c.length; d < e; d++)c[d]._renderCmd._setCachedParent(a)
        }
    };
    a.detachFromParent = function () {
        this._cachedParent = null;
        for (var a = this._node._children, c, d = 0, e = a.length; d < e; d++)(c = a[d]) && c._renderCmd && c._renderCmd.detachFromParent()
    };
    a.setShaderProgram = function (a) {
    };
    a.getShaderProgram = function () {
        return null
    };
    cc.Node.CanvasRenderCmd._getCompositeOperationByBlendFunc = function (a) {
        return a ? a.src === cc.SRC_ALPHA && a.dst === cc.ONE || a.src === cc.ONE && a.dst === cc.ONE ? "lighter" : a.src === cc.ZERO && a.dst === cc.SRC_ALPHA ? "destination-in" : a.src === cc.ZERO && a.dst === cc.ONE_MINUS_SRC_ALPHA ? "destination-out" : "source-over" : "source-over"
    }
})();
(function () {
    cc.Node.WebGLRenderCmd = function (a) {
        cc.Node.RenderCmd.call(this, a);
        a = new cc.math.Matrix4;
        var c = a.mat;
        c[2] = c[3] = c[6] = c[7] = c[8] = c[9] = c[11] = c[14] = 0;
        c[10] = c[15] = 1;
        this._transform4x4 = a;
        this._stackMatrix = new cc.math.Matrix4;
        this._camera = this._shaderProgram = null
    };
    var a = cc.Node.WebGLRenderCmd.prototype = Object.create(cc.Node.RenderCmd.prototype);
    a.constructor = cc.Node.WebGLRenderCmd;
    a.getNodeToParentTransform = function () {
        var a = this._node;
        if (a._usingNormalizedPosition && a._parent) {
            var c = a._parent._contentSize;
            a._position.x = a._normalizedPosition.x * c.width;
            a._position.y = a._normalizedPosition.y * c.height;
            a._normalizedPositionDirty = !1
        }
        if (this._dirtyFlag & cc.Node._dirtyFlags.transformDirty) {
            var c = a._position.x, d = a._position.y, e = this._anchorPointInPoints.x, f = -e, g = this._anchorPointInPoints.y, h = -g, k = a._scaleX, m = a._scaleY, n = 0.017453292519943295 * a._rotationX, p = 0.017453292519943295 * a._rotationY;
            a._ignoreAnchorPointForPosition && (c += e, d += g);
            var s = 1, r = 0, u = 1, t = 0;
            if (0 !== a._rotationX || 0 !== a._rotationY)s = Math.cos(-n), r = Math.sin(-n), u = Math.cos(-p), t = Math.sin(-p);
            n = a._skewX || a._skewY;
            n || 0 === e && 0 === g || (c += u * f * k + -r * h * m, d += t * f * k + s * h * m);
            p = this._transform;
            p.a = u * k;
            p.b = t * k;
            p.c = -r * m;
            p.d = s * m;
            p.tx = c;
            p.ty = d;
            n && (p = cc.affineTransformConcat({
                a: 1,
                b: Math.tan(cc.degreesToRadians(a._skewY)),
                c: Math.tan(cc.degreesToRadians(a._skewX)),
                d: 1,
                tx: 0,
                ty: 0
            }, p), 0 !== e || 0 !== g) && (p = cc.affineTransformTranslate(p, f, h));
            a._additionalTransformDirty && (p = cc.affineTransformConcat(p, a._additionalTransform), a._additionalTransformDirty = !1);
            this._transform = p
        }
        return this._transform
    };
    a._syncStatus = function (a) {
        var c = cc.Node._dirtyFlags, d = this._dirtyFlag, e = a ? a._node : null;
        e && e._cascadeColorEnabled && a._dirtyFlag & c.colorDirty && (d |= c.colorDirty);
        e && e._cascadeOpacityEnabled && a._dirtyFlag & c.opacityDirty && (d |= c.opacityDirty);
        a && a._dirtyFlag & c.transformDirty && (d |= c.transformDirty);
        e = d & c.colorDirty;
        c = d & c.opacityDirty;
        this._dirtyFlag = d;
        e && this._syncDisplayColor();
        c && this._syncDisplayOpacity();
        (e || c) && this._updateColor();
        this.transform(a)
    };
    a._updateColor = function () {
    };
    a.visit = function (a) {
        var c = this._node;
        if (c._visible) {
            a = a || this.getParentRenderCmd();
            c._parent && c._parent._renderCmd && (this._curLevel = c._parent._renderCmd._curLevel + 1);
            var d = cc.current_stack;
            d.stack.push(d.top);
            this._syncStatus(a);
            d.top = this._stackMatrix;
            if ((a = c._children) && 0 < a.length) {
                var e = a.length;
                c.sortAllChildren();
                for (c = 0; c < e; c++)
                    if (a[c] && 0 > a[c]._localZOrder)a[c]._renderCmd.visit(this); else break;
                for (cc.renderer.pushRenderCommand(this); c < e; c++)a[c] && a[c]._renderCmd.visit(this)
            } else cc.renderer.pushRenderCommand(this);
            this._dirtyFlag = 0;
            d.top = d.stack.pop()
        }
    };
    a.transform = function (a, c) {
        var d = this._transform4x4, e = this._stackMatrix, f = this._node, g = (a = a || this.getParentRenderCmd()) ? a._stackMatrix : cc.current_stack.top, h = this.getNodeToParentTransform();
        this._dirtyFlag ^= this._dirtyFlag & cc.Node._dirtyFlags.transformDirty;
        var k = d.mat;
        k[0] = h.a;
        k[4] = h.c;
        k[12] = h.tx;
        k[1] = h.b;
        k[5] = h.d;
        k[13] = h.ty;
        k[14] = f._vertexZ;
        cc.kmMat4Multiply(e, g, d);
        null === f._camera || null !== f.grid && f.grid.isActive() || (g = this._anchorPointInPoints.x, h = this._anchorPointInPoints.y, 0 !== g || 0 !== h ? (cc.SPRITEBATCHNODE_RENDER_SUBPIXEL || (g |= 0, h |= 0), k = cc.math.Matrix4.createByTranslation(g, h, 0, d), e.multiply(k), f._camera._locateForRenderer(e), k = cc.math.Matrix4.createByTranslation(-g, -h, 0, k), e.multiply(k), d.identity()) : f._camera._locateForRenderer(e));
        if (c && f._children && 0 !== f._children.length)
            for (f = f._children, d = 0, e = f.length; d < e; d++)f[d]._renderCmd.transform(this, c)
    };
    a.setShaderProgram = function (a) {
        this._shaderProgram = a
    };
    a.getShaderProgram = function () {
        return this._shaderProgram
    }
})();
cc.AtlasNode = cc.Node.extend({
    textureAtlas: null,
    quadsToDraw: 0,
    _itemsPerRow: 0,
    _itemsPerColumn: 0,
    _itemWidth: 0,
    _itemHeight: 0,
    _opacityModifyRGB: !1,
    _blendFunc: null,
    _ignoreContentScaleFactor: !1,
    _className: "AtlasNode",
    _textureForCanvas: null,
    ctor: function (a, b, c, d) {
        cc.Node.prototype.ctor.call(this);
        this._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        this._ignoreContentScaleFactor = !1;
        void 0 !== d && this.initWithTileFile(a, b, c, d)
    },
    _createRenderCmd: function () {
        this._renderCmd = cc._renderType === cc._RENDER_TYPE_CANVAS ? new cc.AtlasNode.CanvasRenderCmd(this) : new cc.AtlasNode.WebGLRenderCmd(this)
    },
    updateAtlasValues: function () {
        cc.log(cc._LogInfos.AtlasNode_updateAtlasValues)
    },
    getColor: function () {
        return this._opacityModifyRGB ? this._renderCmd._colorUnmodified : cc.Node.prototype.getColor.call(this)
    },
    setOpacityModifyRGB: function (a) {
        var b = this.color;
        this._opacityModifyRGB = a;
        this.setColor(b)
    },
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB
    },
    getBlendFunc: function () {
        return this._blendFunc
    },
    setBlendFunc: function (a, b) {
        this._blendFunc = void 0 === b ? a : {src: a, dst: b}
    },
    setTextureAtlas: function (a) {
        this.textureAtlas = a
    },
    getTextureAtlas: function () {
        return this.textureAtlas
    },
    getQuadsToDraw: function () {
        return this.quadsToDraw
    },
    setQuadsToDraw: function (a) {
        this.quadsToDraw = a
    },
    initWithTileFile: function (a, b, c, d) {
        if (!a)throw"cc.AtlasNode.initWithTileFile(): title should not be null";
        a = cc.textureCache.addImage(a);
        return this.initWithTexture(a, b, c, d)
    },
    initWithTexture: function (a, b, c, d) {
        return this._renderCmd.initWithTexture(a, b, c, d)
    },
    setColor: function (a) {
        this._renderCmd.setColor(a)
    },
    setOpacity: function (a) {
        this._renderCmd.setOpacity(a)
    },
    getTexture: function () {
        return this._renderCmd.getTexture()
    },
    setTexture: function (a) {
        this._renderCmd.setTexture(a)
    },
    _setIgnoreContentScaleFactor: function (a) {
        this._ignoreContentScaleFactor = a
    }
});
_p = cc.AtlasNode.prototype;
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.EventHelper.prototype.apply(_p);
cc.AtlasNode.create = function (a, b, c, d) {
    return new cc.AtlasNode(a, b, c, d)
};
(function () {
    cc.AtlasNode.CanvasRenderCmd = function (a) {
        cc.Node.CanvasRenderCmd.call(this, a);
        this._needDraw = !1;
        this._colorUnmodified = cc.color.WHITE;
        this._texture = this._originalTexture = null
    };
    var a = cc.AtlasNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    a.constructor = cc.AtlasNode.CanvasRenderCmd;
    a.initWithTexture = function (a, c, d, e) {
        var f = this._node;
        f._itemWidth = c;
        f._itemHeight = d;
        f._opacityModifyRGB = !0;
        this._originalTexture = a;
        if (!this._originalTexture)return cc.log(cc._LogInfos.AtlasNode__initWithTexture), !1;
        this._texture = this._originalTexture;
        this._calculateMaxItems();
        f.quadsToDraw = e;
        return !0
    };
    a.setColor = function (a) {
        var c = this._node._realColor;
        if (c.r !== a.r || c.g !== a.g || c.b !== a.b)this._colorUnmodified = a, this._changeTextureColor()
    };
    a._changeTextureColor = cc.sys._supportCanvasNewBlendModes ? function () {
        var a = this._node, c = a.getTexture();
        if (c && this._originalTexture) {
            var d = this._originalTexture.getHtmlElementObj();
            if (d) {
                var e = c.getHtmlElementObj(), c = cc.rect(0, 0, d.width, d.height);
                e instanceof HTMLCanvasElement ? cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(d, this._colorUnmodified, c, e) : (e = cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(d, this._colorUnmodified, c), c = new cc.Texture2D, c.initWithElement(e), c.handleLoadedTexture(), a.setTexture(c))
            }
        }
    } : function () {
        var a = this._node, c, d = a.getTexture();
        if (d && this._originalTexture && (c = d.getHtmlElementObj())) {
            var e = this._originalTexture.getHtmlElementObj();
            if (d = cc.textureCache.getTextureColors(e))e = cc.rect(0, 0, e.width, e.height), c instanceof HTMLCanvasElement ? cc.Sprite.CanvasRenderCmd._generateTintImage(c, d, this._displayedColor, e, c) : (c = cc.Sprite.CanvasRenderCmd._generateTintImage(c, d, this._displayedColor, e), d = new cc.Texture2D, d.initWithElement(c), d.handleLoadedTexture(), a.setTexture(d))
        }
    };
    a.setOpacity = function (a) {
        cc.Node.prototype.setOpacity.call(this._node, a)
    };
    a.getTexture = function () {
        return this._texture
    };
    a.setTexture = function (a) {
        this._texture = a
    };
    a._calculateMaxItems = function () {
        var a = this._node, c = this._texture.getContentSize();
        a._itemsPerColumn = 0 | c.height / a._itemHeight;
        a._itemsPerRow = 0 | c.width / a._itemWidth
    }
})();
(function () {
    cc.AtlasNode.WebGLRenderCmd = function (a) {
        cc.Node.WebGLRenderCmd.call(this, a);
        this._needDraw = !0;
        this._textureAtlas = null;
        this._colorUnmodified = cc.color.WHITE;
        this._uniformColor = this._colorF32Array = null;
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
        this._uniformColor = cc._renderContext.getUniformLocation(this._shaderProgram.getProgram(), "u_color")
    };
    var a = cc.AtlasNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    a.constructor = cc.AtlasNode.WebGLRenderCmd;
    a._updateBlendFunc = function () {
        var a = this._node;
        this._textureAtlas.texture.hasPremultipliedAlpha() || (a._blendFunc.src = cc.SRC_ALPHA, a._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA)
    };
    a._updateOpacityModifyRGB = function () {
        this._node._opacityModifyRGB = this._textureAtlas.texture.hasPremultipliedAlpha()
    };
    a.rendering = function (a) {
        a = a || cc._renderContext;
        var c = this._node;
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
        cc.glBlendFunc(c._blendFunc.src, c._blendFunc.dst);
        this._uniformColor && this._colorF32Array && (a.uniform4fv(this._uniformColor, this._colorF32Array), this._textureAtlas.drawNumberOfQuads(c.quadsToDraw, 0))
    };
    a.initWithTexture = function (a, c, d, e) {
        var f = this._node;
        f._itemWidth = c;
        f._itemHeight = d;
        this._colorUnmodified = cc.color.WHITE;
        f._opacityModifyRGB = !0;
        f._blendFunc.src = cc.BLEND_SRC;
        f._blendFunc.dst = cc.BLEND_DST;
        c = f._realColor;
        this._colorF32Array = new Float32Array([c.r / 255, c.g / 255, c.b / 255, f._realOpacity / 255]);
        this._textureAtlas = new cc.TextureAtlas;
        this._textureAtlas.initWithTexture(a, e);
        if (!this._textureAtlas)return cc.log(cc._LogInfos.AtlasNode__initWithTexture), !1;
        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
        this._calculateMaxItems();
        f.quadsToDraw = e;
        return !0
    };
    a.setColor = function (a) {
        var c = cc.color(a.r, a.g, a.b), d = this._node;
        this._colorUnmodified = a;
        a = this._displayedOpacity;
        d._opacityModifyRGB && (c.r = c.r * a / 255, c.g = c.g * a / 255, c.b = c.b * a / 255);
        cc.Node.prototype.setColor.call(d, c)
    };
    a.setOpacity = function (a) {
        var c = this._node;
        cc.Node.prototype.setOpacity.call(c, a);
        c._opacityModifyRGB && (c.color = this._colorUnmodified)
    };
    a._updateColor = function () {
        var a = this._displayedColor;
        this._colorF32Array = new Float32Array([a.r / 255, a.g / 255, a.b / 255, this._displayedOpacity / 255])
    };
    a.getTexture = function () {
        return this._textureAtlas.texture
    };
    a.setTexture = function (a) {
        this._textureAtlas.texture = a;
        this._updateBlendFunc();
        this._updateOpacityModifyRGB()
    };
    a._calculateMaxItems = function () {
        var a = this._node, c = this._textureAtlas.texture, d = c.getContentSize();
        a._ignoreContentScaleFactor && (d = c.getContentSizeInPixels());
        a._itemsPerColumn = 0 | d.height / a._itemHeight;
        a._itemsPerRow = 0 | d.width / a._itemWidth
    }
})();
cc._tmp.WebGLTexture2D = function () {
    cc.Texture2D = cc.Class.extend({
        _pVRHaveAlphaPremultiplied: !0,
        _pixelFormat: null,
        _pixelsWide: 0,
        _pixelsHigh: 0,
        _name: "",
        _contentSize: null,
        maxS: 0,
        maxT: 0,
        _hasPremultipliedAlpha: !1,
        _hasMipmaps: !1,
        shaderProgram: null,
        _textureLoaded: !1,
        _htmlElementObj: null,
        _webTextureObj: null,
        url: null,
        ctor: function () {
            this._contentSize = cc.size(0, 0);
            this._pixelFormat = cc.Texture2D.defaultPixelFormat
        },
        releaseTexture: function () {
            this._webTextureObj && cc._renderContext.deleteTexture(this._webTextureObj);
            cc.loader.release(this.url)
        },
        getPixelFormat: function () {
            return this._pixelFormat
        },
        getPixelsWide: function () {
            return this._pixelsWide
        },
        getPixelsHigh: function () {
            return this._pixelsHigh
        },
        getName: function () {
            return this._webTextureObj
        },
        getContentSize: function () {
            return cc.size(this._contentSize.width / cc.contentScaleFactor(), this._contentSize.height / cc.contentScaleFactor())
        },
        _getWidth: function () {
            return this._contentSize.width / cc.contentScaleFactor()
        },
        _getHeight: function () {
            return this._contentSize.height / cc.contentScaleFactor()
        },
        getContentSizeInPixels: function () {
            return this._contentSize
        },
        getMaxS: function () {
            return this.maxS
        },
        setMaxS: function (a) {
            this.maxS = a
        },
        getMaxT: function () {
            return this.maxT
        },
        setMaxT: function (a) {
            this.maxT = a
        },
        getShaderProgram: function () {
            return this.shaderProgram
        },
        setShaderProgram: function (a) {
            this.shaderProgram = a
        },
        hasPremultipliedAlpha: function () {
            return this._hasPremultipliedAlpha
        },
        hasMipmaps: function () {
            return this._hasMipmaps
        },
        description: function () {
            return "\x3ccc.Texture2D | Name \x3d " + this._name + " | Dimensions \x3d " +
                this._pixelsWide + " x " + this._pixelsHigh + " | Coordinates \x3d (" + this.maxS + ", " + this.maxT + ")\x3e"
        },
        releaseData: function (a) {
        },
        keepData: function (a, b) {
            return a
        },
        initWithData: function (a, b, c, d, e) {
            var f = cc.Texture2D, g = cc._renderContext, h = g.RGBA, k = g.UNSIGNED_BYTE, m = c * cc.Texture2D._B[b] / 8;
            0 === m % 8 ? g.pixelStorei(g.UNPACK_ALIGNMENT, 8) : 0 === m % 4 ? g.pixelStorei(g.UNPACK_ALIGNMENT, 4) : 0 === m % 2 ? g.pixelStorei(g.UNPACK_ALIGNMENT, 2) : g.pixelStorei(g.UNPACK_ALIGNMENT, 1);
            this._webTextureObj = g.createTexture();
            cc.glBindTexture2D(this);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
            g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
            switch (b) {
                case f.PIXEL_FORMAT_RGBA8888:
                    h = g.RGBA;
                    break;
                case f.PIXEL_FORMAT_RGB888:
                    h = g.RGB;
                    break;
                case f.PIXEL_FORMAT_RGBA4444:
                    k = g.UNSIGNED_SHORT_4_4_4_4;
                    break;
                case f.PIXEL_FORMAT_RGB5A1:
                    k = g.UNSIGNED_SHORT_5_5_5_1;
                    break;
                case f.PIXEL_FORMAT_RGB565:
                    k = g.UNSIGNED_SHORT_5_6_5;
                    break;
                case f.PIXEL_FORMAT_AI88:
                    h = g.LUMINANCE_ALPHA;
                    break;
                case f.PIXEL_FORMAT_A8:
                    h = g.ALPHA;
                    break;
                case f.PIXEL_FORMAT_I8:
                    h = g.LUMINANCE;
                    break;
                default:
                    cc.assert(0, cc._LogInfos.Texture2D_initWithData)
            }
            g.texImage2D(g.TEXTURE_2D, 0, h, c, d, 0, h, k, a);
            this._contentSize.width = e.width;
            this._contentSize.height = e.height;
            this._pixelsWide = c;
            this._pixelsHigh = d;
            this._pixelFormat = b;
            this.maxS = e.width / c;
            this.maxT = e.height / d;
            this._hasMipmaps = this._hasPremultipliedAlpha = !1;
            this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
            return this._textureLoaded = !0
        },
        drawAtPoint: function (a) {
            var b = [0, this.maxT, this.maxS, this.maxT, 0, 0, this.maxS, 0], c = this._pixelsWide * this.maxS, d = this._pixelsHigh * this.maxT;
            a = [a.x, a.y, 0, c + a.x, a.y, 0, a.x, d + a.y, 0, c + a.x, d + a.y, 0];
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS);
            this._shaderProgram.use();
            this._shaderProgram.setUniformsForBuiltins();
            cc.glBindTexture2D(this);
            c = cc._renderContext;
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, a);
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, c.FLOAT, !1, 0, b);
            c.drawArrays(c.TRIANGLE_STRIP, 0, 4)
        },
        drawInRect: function (a) {
            var b = [0, this.maxT, this.maxS, this.maxT, 0, 0, this.maxS, 0];
            a = [a.x, a.y, a.x + a.width, a.y, a.x, a.y + a.height, a.x + a.width, a.y + a.height];
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS);
            this._shaderProgram.use();
            this._shaderProgram.setUniformsForBuiltins();
            cc.glBindTexture2D(this);
            var c = cc._renderContext;
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, a);
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, c.FLOAT, !1, 0, b);
            c.drawArrays(c.TRIANGLE_STRIP, 0, 4)
        },
        initWithImage: function (a) {
            if (null == a)return cc.log(cc._LogInfos.Texture2D_initWithImage), !1;
            var b = a.getWidth(), c = a.getHeight(), d = cc.configuration.getMaxTextureSize();
            if (b > d || c > d)return cc.log(cc._LogInfos.Texture2D_initWithImage_2, b, c, d, d), !1;
            this._textureLoaded = !0;
            return this._initPremultipliedATextureWithImage(a, b, c)
        },
        initWithElement: function (a) {
            a && (this._webTextureObj = cc._renderContext.createTexture(), this._htmlElementObj = a, this._textureLoaded = !0)
        },
        getHtmlElementObj: function () {
            return this._htmlElementObj
        },
        isLoaded: function () {
            return this._textureLoaded
        },
        handleLoadedTexture: function (a) {
            a = void 0 === a ? !1 : a;
            if (cc._rendererInitialized) {
                if (!this._htmlElementObj) {
                    var b = cc.loader.getRes(this.url);
                    if (!b)return;
                    this.initWithElement(b)
                }
                this._htmlElementObj.width && this._htmlElementObj.height && (b = cc._renderContext, cc.glBindTexture2D(this), b.pixelStorei(b.UNPACK_ALIGNMENT, 4), a && b.pixelStorei(b.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1), b.texImage2D(b.TEXTURE_2D, 0, b.RGBA, b.RGBA, b.UNSIGNED_BYTE, this._htmlElementObj), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, b.LINEAR), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MAG_FILTER, b.LINEAR), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_S, b.CLAMP_TO_EDGE), b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_T, b.CLAMP_TO_EDGE), this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE), cc.glBindTexture2D(null), a && b.pixelStorei(b.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0), b = this._htmlElementObj.height, this._pixelsWide = this._contentSize.width = this._htmlElementObj.width, this._pixelsHigh = this._contentSize.height = b, this._pixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888, this.maxT = this.maxS = 1, this._hasPremultipliedAlpha = a, this._hasMipmaps = !1, this.dispatchEvent("load"))
            }
        },
        initWithString: function (a, b, c, d, e, f) {
            cc.log(cc._LogInfos.Texture2D_initWithString);
            return null
        },
        initWithETCFile: function (a) {
            cc.log(cc._LogInfos.Texture2D_initWithETCFile_2);
            return !1
        },
        initWithPVRFile: function (a) {
            cc.log(cc._LogInfos.Texture2D_initWithPVRFile_2);
            return !1
        },
        initWithPVRTCData: function (a, b, c, d, e, f) {
            cc.log(cc._LogInfos.Texture2D_initWithPVRTCData_2);
            return !1
        },
        setTexParameters: function (a, b, c, d) {
            var e = cc._renderContext;
            void 0 !== b && (a = {minFilter: a, magFilter: b, wrapS: c, wrapT: d});
            cc.assert(this._pixelsWide === cc.NextPOT(this._pixelsWide) && this._pixelsHigh === cc.NextPOT(this._pixelsHigh) || a.wrapS === e.CLAMP_TO_EDGE && a.wrapT === e.CLAMP_TO_EDGE, "WebGLRenderingContext.CLAMP_TO_EDGE should be used in NPOT textures");
            cc.glBindTexture2D(this);
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, a.minFilter);
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, a.magFilter);
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, a.wrapS);
            e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, a.wrapT)
        },
        setAntiAliasTexParameters: function () {
            var a = cc._renderContext;
            cc.glBindTexture2D(this);
            this._hasMipmaps ? a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR_MIPMAP_NEAREST) : a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
            a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR)
        },
        setAliasTexParameters: function () {
            var a = cc._renderContext;
            cc.glBindTexture2D(this);
            this._hasMipmaps ? a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.NEAREST_MIPMAP_NEAREST) : a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.NEAREST);
            a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.NEAREST)
        },
        generateMipmap: function () {
            cc.assert(this._pixelsWide === cc.NextPOT(this._pixelsWide) && this._pixelsHigh === cc.NextPOT(this._pixelsHigh), "Mimpap texture only works in POT textures");
            cc.glBindTexture2D(this);
            cc._renderContext.generateMipmap(cc._renderContext.TEXTURE_2D);
            this._hasMipmaps = !0
        },
        stringForFormat: function () {
            return cc.Texture2D._M[this._pixelFormat]
        },
        bitsPerPixelForFormat: function (a) {
            a = a || this._pixelFormat;
            var b = cc.Texture2D._B[a];
            if (null != b)return b;
            cc.log(cc._LogInfos.Texture2D_bitsPerPixelForFormat, a);
            return -1
        },
        _initPremultipliedATextureWithImage: function (a, b, c) {
            var d = cc.Texture2D, e = a.getData(), f = null, f = null, g = a.hasAlpha(), h = cc.size(a.getWidth(), a.getHeight()), k = d.defaultPixelFormat, m = a.getBitsPerComponent();
            g || (8 <= m ? k = d.PIXEL_FORMAT_RGB888 : (cc.log(cc._LogInfos.Texture2D__initPremultipliedATextureWithImage), k = d.PIXEL_FORMAT_RGB565));
            var n = b * c;
            if (k === d.PIXEL_FORMAT_RGB565)
                if (g)
                    for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m)e[m] = (f[m] >> 0 & 255) >> 3 << 11 | (f[m] >> 8 & 255) >> 2 << 5 | (f[m] >> 16 & 255) >> 3 << 0; else
                    for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m)e[m] = (f[m] & 255) >> 3 << 11 | (f[m] & 255) >> 2 << 5 | (f[m] & 255) >> 3 << 0; else if (k === d.PIXEL_FORMAT_RGBA4444)
                for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m)e[m] = (f[m] >> 0 & 255) >> 4 << 12 | (f[m] >> 8 & 255) >> 4 << 8 | (f[m] >> 16 & 255) >> 4 << 4 | (f[m] >> 24 & 255) >> 4 << 0; else if (k === d.PIXEL_FORMAT_RGB5A1)
                for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m)e[m] = (f[m] >> 0 & 255) >> 3 << 11 | (f[m] >> 8 & 255) >> 3 << 6 | (f[m] >> 16 & 255) >> 3 << 1 | (f[m] >> 24 & 255) >> 7 << 0; else if (k === d.PIXEL_FORMAT_A8)
                for (e = new Uint8Array(b * c), f = a.getData(), m = 0; m < n; ++m)e[m] = f >> 24 & 255;
            if (g && k === d.PIXEL_FORMAT_RGB888)
                for (f = a.getData(), e = new Uint8Array(b * c * 3), m = 0; m < n; ++m)e[3 * m] = f >> 0 & 255, e[3 * m + 1] = f >> 8 & 255, e[3 * m + 2] = f >> 16 & 255;
            this.initWithData(e, k, b, c, h);
            a.getData();
            this._hasPremultipliedAlpha = a.isPremultipliedAlpha();
            return !0
        },
        addLoadedEventListener: function (a, b) {
            this.addEventListener("load", a, b)
        },
        removeLoadedEventListener: function (a) {
            this.removeEventListener("load", a)
        }
    })
};
cc._tmp.WebGLTextureAtlas = function () {
    var a = cc.TextureAtlas.prototype;
    a._setupVBO = function () {
        var a = cc._renderContext;
        this._buffersVBO[0] = a.createBuffer();
        this._buffersVBO[1] = a.createBuffer();
        this._quadsWebBuffer = a.createBuffer();
        this._mapBuffers()
    };
    a._mapBuffers = function () {
        var a = cc._renderContext;
        a.bindBuffer(a.ARRAY_BUFFER, this._quadsWebBuffer);
        a.bufferData(a.ARRAY_BUFFER, this._quadsArrayBuffer, a.DYNAMIC_DRAW);
        a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        a.bufferData(a.ELEMENT_ARRAY_BUFFER, this._indices, a.STATIC_DRAW)
    };
    a.drawNumberOfQuads = function (a, c) {
        c = c || 0;
        if (0 !== a && this.texture && this.texture.isLoaded()) {
            var d = cc._renderContext;
            cc.glBindTexture2D(this.texture);
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
            d.bindBuffer(d.ARRAY_BUFFER, this._quadsWebBuffer);
            this.dirty && (d.bufferData(d.ARRAY_BUFFER, this._quadsArrayBuffer, d.DYNAMIC_DRAW), this.dirty = !1);
            d.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, d.FLOAT, !1, 24, 0);
            d.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, d.UNSIGNED_BYTE, !0, 24, 12);
            d.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, d.FLOAT, !1, 24, 16);
            d.bindBuffer(d.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
            cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP ? d.drawElements(d.TRIANGLE_STRIP, 6 * a, d.UNSIGNED_SHORT, 6 * c * this._indices.BYTES_PER_ELEMENT) : d.drawElements(d.TRIANGLES, 6 * a, d.UNSIGNED_SHORT, 6 * c * this._indices.BYTES_PER_ELEMENT);
            cc.g_NumberOfDraws++
        }
    }
};
cc._tmp.WebGLTextureCache = function () {
    var a = cc.textureCache;
    a.handleLoadedTexture = function (a) {
        var c = this._textures;
        cc._rendererInitialized || (c = this._loadedTexturesBefore);
        var d = c[a];
        d || (d = c[a] = new cc.Texture2D, d.url = a);
        d.handleLoadedTexture()
    };
    a.addImage = function (a, c, d) {
        cc.assert(a, cc._LogInfos.Texture2D_addImage_2);
        var e = this._textures;
        cc._rendererInitialized || (e = this._loadedTexturesBefore);
        var f = e[a] || e[cc.loader._aliases[a]];
        if (f)return c && c.call(d, f), f;
        f = e[a] = new cc.Texture2D;
        f.url = a;
        (cc.loader._checkIsImageURL(a) ? cc.loader.load : cc.loader.loadImg).call(cc.loader, a, function (f, h) {
            if (f)return c && c.call(d, f);
            cc.textureCache.handleLoadedTexture(a);
            var k = e[a];
            c && c.call(d, k)
        });
        return f
    };
    a.addImageAsync = a.addImage;
    a = null
};
cc._tmp.PrototypeTexture2D = function () {
    var a = cc.Texture2D;
    a.PVRImagesHavePremultipliedAlpha = function (a) {
        cc.PVRHaveAlphaPremultiplied_ = a
    };
    a.PIXEL_FORMAT_RGBA8888 = 2;
    a.PIXEL_FORMAT_RGB888 = 3;
    a.PIXEL_FORMAT_RGB565 = 4;
    a.PIXEL_FORMAT_A8 = 5;
    a.PIXEL_FORMAT_I8 = 6;
    a.PIXEL_FORMAT_AI88 = 7;
    a.PIXEL_FORMAT_RGBA4444 = 8;
    a.PIXEL_FORMAT_RGB5A1 = 7;
    a.PIXEL_FORMAT_PVRTC4 = 9;
    a.PIXEL_FORMAT_PVRTC2 = 10;
    a.PIXEL_FORMAT_DEFAULT = a.PIXEL_FORMAT_RGBA8888;
    var b = cc.Texture2D._M = {};
    b[a.PIXEL_FORMAT_RGBA8888] = "RGBA8888";
    b[a.PIXEL_FORMAT_RGB888] = "RGB888";
    b[a.PIXEL_FORMAT_RGB565] = "RGB565";
    b[a.PIXEL_FORMAT_A8] = "A8";
    b[a.PIXEL_FORMAT_I8] = "I8";
    b[a.PIXEL_FORMAT_AI88] = "AI88";
    b[a.PIXEL_FORMAT_RGBA4444] = "RGBA4444";
    b[a.PIXEL_FORMAT_RGB5A1] = "RGB5A1";
    b[a.PIXEL_FORMAT_PVRTC4] = "PVRTC4";
    b[a.PIXEL_FORMAT_PVRTC2] = "PVRTC2";
    b = cc.Texture2D._B = {};
    b[a.PIXEL_FORMAT_RGBA8888] = 32;
    b[a.PIXEL_FORMAT_RGB888] = 24;
    b[a.PIXEL_FORMAT_RGB565] = 16;
    b[a.PIXEL_FORMAT_A8] = 8;
    b[a.PIXEL_FORMAT_I8] = 8;
    b[a.PIXEL_FORMAT_AI88] = 16;
    b[a.PIXEL_FORMAT_RGBA4444] = 16;
    b[a.PIXEL_FORMAT_RGB5A1] = 16;
    b[a.PIXEL_FORMAT_PVRTC4] = 4;
    b[a.PIXEL_FORMAT_PVRTC2] = 3;
    b = cc.Texture2D.prototype;
    cc.defineGetterSetter(b, "name", b.getName);
    cc.defineGetterSetter(b, "pixelFormat", b.getPixelFormat);
    cc.defineGetterSetter(b, "pixelsWidth", b.getPixelsWide);
    cc.defineGetterSetter(b, "pixelsHeight", b.getPixelsHigh);
    cc.defineGetterSetter(b, "width", b._getWidth);
    cc.defineGetterSetter(b, "height", b._getHeight);
    a.defaultPixelFormat = a.PIXEL_FORMAT_DEFAULT
};
cc._tmp.PrototypeTextureAtlas = function () {
    var a = cc.TextureAtlas.prototype;
    cc.defineGetterSetter(a, "totalQuads", a.getTotalQuads);
    cc.defineGetterSetter(a, "capacity", a.getCapacity);
    cc.defineGetterSetter(a, "quads", a.getQuads, a.setQuads)
};
cc.ALIGN_CENTER = 51;
cc.ALIGN_TOP = 19;
cc.ALIGN_TOP_RIGHT = 18;
cc.ALIGN_RIGHT = 50;
cc.ALIGN_BOTTOM_RIGHT = 34;
cc.ALIGN_BOTTOM = 35;
cc.ALIGN_BOTTOM_LEFT = 33;
cc.ALIGN_LEFT = 49;
cc.ALIGN_TOP_LEFT = 17;
cc.PVRHaveAlphaPremultiplied_ = !1;
cc._renderType === cc._RENDER_TYPE_CANVAS ? (cc.Texture2D = cc.Class.extend({
    _contentSize: null, _textureLoaded: !1, _htmlElementObj: null, url: null, _pattern: null, ctor: function () {
        this._contentSize = cc.size(0, 0);
        this._textureLoaded = !1;
        this._htmlElementObj = null;
        this._pattern = ""
    }, getPixelsWide: function () {
        return this._contentSize.width
    }, getPixelsHigh: function () {
        return this._contentSize.height
    }, getContentSize: function () {
        var a = cc.contentScaleFactor();
        return cc.size(this._contentSize.width / a, this._contentSize.height / a)
    }, _getWidth: function () {
        return this._contentSize.width / cc.contentScaleFactor()
    }, _getHeight: function () {
        return this._contentSize.height / cc.contentScaleFactor()
    }, getContentSizeInPixels: function () {
        return this._contentSize
    }, initWithElement: function (a) {
        a && (this._htmlElementObj = a, this._contentSize.width = a.width, this._contentSize.height = a.height, this._textureLoaded = !0)
    }, getHtmlElementObj: function () {
        return this._htmlElementObj
    }, isLoaded: function () {
        return this._textureLoaded
    }, handleLoadedTexture: function () {
        if (!this._textureLoaded) {
            if (!this._htmlElementObj) {
                var a = cc.loader.getRes(this.url);
                if (!a)return;
                this.initWithElement(a)
            }
            a = this._htmlElementObj;
            this._contentSize.width = a.width;
            this._contentSize.height = a.height;
            this.dispatchEvent("load")
        }
    }, description: function () {
        return "\x3ccc.Texture2D | width \x3d " + this._contentSize.width + " height " + this._contentSize.height + "\x3e"
    }, initWithData: function (a, b, c, d, e) {
        return !1
    }, initWithImage: function (a) {
        return !1
    }, initWithString: function (a, b, c, d, e, f) {
        return !1
    }, releaseTexture: function () {
        cc.loader.release(this.url)
    }, getName: function () {
        return null
    }, getMaxS: function () {
        return 1
    }, setMaxS: function (a) {
    }, getMaxT: function () {
        return 1
    }, setMaxT: function (a) {
    }, getPixelFormat: function () {
        return null
    }, getShaderProgram: function () {
        return null
    }, setShaderProgram: function (a) {
    }, hasPremultipliedAlpha: function () {
        return !1
    }, hasMipmaps: function () {
        return !1
    }, releaseData: function (a) {
    }, keepData: function (a, b) {
        return a
    }, drawAtPoint: function (a) {
    }, drawInRect: function (a) {
    }, initWithETCFile: function (a) {
        cc.log(cc._LogInfos.Texture2D_initWithETCFile);
        return !1
    }, initWithPVRFile: function (a) {
        cc.log(cc._LogInfos.Texture2D_initWithPVRFile);
        return !1
    }, initWithPVRTCData: function (a, b, c, d, e, f) {
        cc.log(cc._LogInfos.Texture2D_initWithPVRTCData);
        return !1
    }, setTexParameters: function (a, b, c, d) {
        void 0 !== b && (a = {minFilter: a, magFilter: b, wrapS: c, wrapT: d});
        this._pattern = a.wrapS === cc.REPEAT && a.wrapT === cc.REPEAT ? "repeat" : a.wrapS === cc.REPEAT ? "repeat-x" : a.wrapT === cc.REPEAT ? "repeat-y" : ""
    }, setAntiAliasTexParameters: function () {
    }, setAliasTexParameters: function () {
    }, generateMipmap: function () {
    }, stringForFormat: function () {
        return ""
    }, bitsPerPixelForFormat: function (a) {
        return -1
    }, addLoadedEventListener: function (a, b) {
        this.addEventListener("load", a, b)
    }, removeLoadedEventListener: function (a) {
        this.removeEventListener("load", a)
    }, _grayElementObj: null, _backupElement: null, _isGray: !1, _switchToGray: function (a) {
        this._textureLoaded && this._isGray !== a && ((this._isGray = a) ? (this._backupElement = this._htmlElementObj, this._grayElementObj || (this._grayElementObj = cc.Texture2D._generateGrayTexture(this._htmlElementObj)), this._htmlElementObj = this._grayElementObj) : null !== this._backupElement && (this._htmlElementObj = this._backupElement))
    }
}), cc.Texture2D._generateGrayTexture = function (a, b, c) {
    if (null === a)return null;
    c = c || cc.newElement("canvas");
    b = b || cc.rect(0, 0, a.width, a.height);
    c.width = b.width;
    c.height = b.height;
    var d = c.getContext("2d");
    d.drawImage(a, b.x, b.y, b.width, b.height, 0, 0, b.width, b.height);
    a = d.getImageData(0, 0, b.width, b.height);
    b = a.data;
    for (var e = 0, f = b.length; e < f; e += 4)b[e] = b[e + 1] = b[e + 2] = 0.34 * b[e] + 0.5 * b[e + 1] + 0.16 * b[e + 2];
    d.putImageData(a, 0, 0);
    return c
}) : (cc.assert(cc.isFunction(cc._tmp.WebGLTexture2D), cc._LogInfos.MissingFile, "TexturesWebGL.js"), cc._tmp.WebGLTexture2D(), delete cc._tmp.WebGLTexture2D);
cc.EventHelper.prototype.apply(cc.Texture2D.prototype);
cc.assert(cc.isFunction(cc._tmp.PrototypeTexture2D), cc._LogInfos.MissingFile, "TexturesPropertyDefine.js");
cc._tmp.PrototypeTexture2D();
delete cc._tmp.PrototypeTexture2D;
cc.textureCache = {
    _textures: {},
    _textureColorsCache: {},
    _textureKeySeq: 0 | 1E3 * Math.random(),
    _loadedTexturesBefore: {},
    _initializingRenderer: function () {
        var a, b = this._loadedTexturesBefore, c = this._textures;
        for (a in b) {
            var d = b[a];
            d.handleLoadedTexture();
            c[a] = d
        }
        this._loadedTexturesBefore = {}
    },
    addPVRTCImage: function (a) {
        cc.log(cc._LogInfos.textureCache_addPVRTCImage)
    },
    addETCImage: function (a) {
        cc.log(cc._LogInfos.textureCache_addETCImage)
    },
    description: function () {
        return "\x3cTextureCache | Number of textures \x3d " +
            this._textures.length + "\x3e"
    },
    textureForKey: function (a) {
        cc.log(cc._LogInfos.textureCache_textureForKey);
        return this.getTextureForKey(a)
    },
    getTextureForKey: function (a) {
        return this._textures[a] || this._textures[cc.loader._aliases[a]]
    },
    getKeyByTexture: function (a) {
        for (var b in this._textures)
            if (this._textures[b] === a)return b;
        return null
    },
    _generalTextureKey: function () {
        this._textureKeySeq++;
        return "_textureKey_" + this._textureKeySeq
    },
    getTextureColors: function (a) {
        var b = this.getKeyByTexture(a);
        b || (b = a instanceof HTMLImageElement ? a.src : this._generalTextureKey());
        this._textureColorsCache[b] || (this._textureColorsCache[b] = cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor(a));
        return this._textureColorsCache[b]
    },
    addPVRImage: function (a) {
        cc.log(cc._LogInfos.textureCache_addPVRImage)
    },
    removeAllTextures: function () {
        var a = this._textures, b;
        for (b in a)a[b] && a[b].releaseTexture();
        this._textures = {}
    },
    removeTexture: function (a) {
        if (a) {
            var b = this._textures, c;
            for (c in b)b[c] === a && (b[c].releaseTexture(), delete b[c])
        }
    },
    removeTextureForKey: function (a) {
        null != a && this._textures[a] && delete this._textures[a]
    },
    cacheImage: function (a, b) {
        if (b instanceof cc.Texture2D)this._textures[a] = b; else {
            var c = new cc.Texture2D;
            c.initWithElement(b);
            c.handleLoadedTexture();
            this._textures[a] = c
        }
    },
    addUIImage: function (a, b) {
        cc.assert(a, cc._LogInfos.textureCache_addUIImage_2);
        if (b && this._textures[b])return this._textures[b];
        var c = new cc.Texture2D;
        c.initWithImage(a);
        null != b ? this._textures[b] = c : cc.log(cc._LogInfos.textureCache_addUIImage);
        return c
    },
    dumpCachedTextureInfo: function () {
        var a = 0, b = 0, c = this._textures, d;
        for (d in c) {
            var e = c[d];
            a++;
            e.getHtmlElementObj()instanceof HTMLImageElement ? cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo, d, e.getHtmlElementObj().src, e.pixelsWidth, e.pixelsHeight) : cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, d, e.pixelsWidth, e.pixelsHeight);
            b += e.pixelsWidth * e.pixelsHeight * 4
        }
        c = this._textureColorsCache;
        for (d in c) {
            var e = c[d], f;
            for (f in e) {
                var g = e[f];
                a++;
                cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, d, g.width, g.height);
                b += g.width * g.height * 4
            }
        }
        cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_3, a, b / 1024, (b / 1048576).toFixed(2))
    },
    _clear: function () {
        this._textures = {};
        this._textureColorsCache = {};
        this._textureKeySeq = 0 | 1E3 * Math.random();
        this._loadedTexturesBefore = {}
    }
};
cc._renderType === cc._RENDER_TYPE_CANVAS ? (_p = cc.textureCache, _p.handleLoadedTexture = function (a) {
    var b = this._textures, c = b[a];
    c || (c = b[a] = new cc.Texture2D, c.url = a);
    c.handleLoadedTexture()
}, _p.addImage = function (a, b, c) {
    cc.assert(a, cc._LogInfos.Texture2D_addImage);
    var d = this._textures, e = d[a] || d[cc.loader._aliases[a]];
    if (e)return b && b.call(c, e), e;
    e = d[a] = new cc.Texture2D;
    e.url = a;
    (cc.loader._checkIsImageURL(a) ? cc.loader.load : cc.loader.loadImg).call(cc.loader, a, function (e, g) {
        if (e)return b && b.call(c, e);
        cc.textureCache.handleLoadedTexture(a);
        var h = d[a];
        b && b.call(c, h)
    });
    return e
}, _p.addImageAsync = _p.addImage, _p = null) : (cc.assert(cc.isFunction(cc._tmp.WebGLTextureCache), cc._LogInfos.MissingFile, "TexturesWebGL.js"), cc._tmp.WebGLTextureCache(), delete cc._tmp.WebGLTextureCache);
cc.TextureAtlas = cc.Class.extend({
    dirty: !1,
    texture: null,
    _indices: null,
    _buffersVBO: null,
    _capacity: 0,
    _quads: null,
    _quadsArrayBuffer: null,
    _quadsWebBuffer: null,
    _quadsReader: null,
    ctor: function (a, b) {
        this._buffersVBO = [];
        cc.isString(a) ? this.initWithFile(a, b) : a instanceof cc.Texture2D && this.initWithTexture(a, b)
    },
    getTotalQuads: function () {
        return this._totalQuads
    },
    getCapacity: function () {
        return this._capacity
    },
    getTexture: function () {
        return this.texture
    },
    setTexture: function (a) {
        this.texture = a
    },
    setDirty: function (a) {
        this.dirty = a
    },
    isDirty: function () {
        return this.dirty
    },
    getQuads: function () {
        return this._quads
    },
    setQuads: function (a) {
        this._quads = a
    },
    _copyQuadsToTextureAtlas: function (a, b) {
        if (a)
            for (var c = 0; c < a.length; c++)this._setQuadToArray(a[c], b + c)
    },
    _setQuadToArray: function (a, b) {
        var c = this._quads;
        c[b] ? (c[b].bl = a.bl, c[b].br = a.br, c[b].tl = a.tl, c[b].tr = a.tr) : c[b] = new cc.V3F_C4B_T2F_Quad(a.tl, a.bl, a.tr, a.br, this._quadsArrayBuffer, b * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT)
    },
    description: function () {
        return "\x3ccc.TextureAtlas | totalQuads \x3d" +
            this._totalQuads + "\x3e"
    },
    _setupIndices: function () {
        if (0 !== this._capacity)
            for (var a = this._indices, b = this._capacity, c = 0; c < b; c++)cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP ? (a[6 * c + 0] = 4 * c + 0, a[6 * c + 1] = 4 * c + 0, a[6 * c + 2] = 4 * c + 2, a[6 * c + 3] = 4 * c + 1, a[6 * c + 4] = 4 * c + 3, a[6 * c + 5] = 4 * c + 3) : (a[6 * c + 0] = 4 * c + 0, a[6 * c + 1] = 4 * c + 1, a[6 * c + 2] = 4 * c + 2, a[6 * c + 3] = 4 * c + 3, a[6 * c + 4] = 4 * c + 2, a[6 * c + 5] = 4 * c + 1)
    },
    _setupVBO: function () {
        var a = cc._renderContext;
        this._buffersVBO[0] = a.createBuffer();
        this._buffersVBO[1] = a.createBuffer();
        this._quadsWebBuffer = a.createBuffer();
        this._mapBuffers()
    },
    _mapBuffers: function () {
        var a = cc._renderContext;
        a.bindBuffer(a.ARRAY_BUFFER, this._quadsWebBuffer);
        a.bufferData(a.ARRAY_BUFFER, this._quadsArrayBuffer, a.DYNAMIC_DRAW);
        a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        a.bufferData(a.ELEMENT_ARRAY_BUFFER, this._indices, a.STATIC_DRAW)
    },
    initWithFile: function (a, b) {
        var c = cc.textureCache.addImage(a);
        if (c)return this.initWithTexture(c, b);
        cc.log(cc._LogInfos.TextureAtlas_initWithFile, a);
        return !1
    },
    initWithTexture: function (a, b) {
        cc.assert(a, cc._LogInfos.TextureAtlas_initWithTexture);
        this._capacity = b |= 0;
        this._totalQuads = 0;
        this.texture = a;
        this._quads = [];
        this._indices = new Uint16Array(6 * b);
        var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._quadsArrayBuffer = new ArrayBuffer(c * b);
        this._quadsReader = new Uint8Array(this._quadsArrayBuffer);
        if ((!this._quads || !this._indices) && 0 < b)return !1;
        for (var d = this._quads, e = 0; e < b; e++)d[e] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, e * c);
        this._setupIndices();
        this._setupVBO();
        return this.dirty = !0
    },
    updateQuad: function (a, b) {
        cc.assert(a, cc._LogInfos.TextureAtlas_updateQuad);
        cc.assert(0 <= b && b < this._capacity, cc._LogInfos.TextureAtlas_updateQuad_2);
        this._totalQuads = Math.max(b + 1, this._totalQuads);
        this._setQuadToArray(a, b);
        this.dirty = !0
    },
    insertQuad: function (a, b) {
        cc.assert(b < this._capacity, cc._LogInfos.TextureAtlas_insertQuad_2);
        this._totalQuads++;
        if (this._totalQuads > this._capacity)cc.log(cc._LogInfos.TextureAtlas_insertQuad); else {
            var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, d = b * c, e = (this._totalQuads -
                1 - b) * c;
            this._quads[this._totalQuads - 1] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads - 1) * c);
            this._quadsReader.set(this._quadsReader.subarray(d, d + e), d + c);
            this._setQuadToArray(a, b);
            this.dirty = !0
        }
    },
    insertQuads: function (a, b, c) {
        c = c || a.length;
        cc.assert(b + c <= this._capacity, cc._LogInfos.TextureAtlas_insertQuads);
        var d = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._totalQuads += c;
        if (this._totalQuads > this._capacity)cc.log(cc._LogInfos.TextureAtlas_insertQuad); else {
            var e = b * d, f = (this._totalQuads - 1 - b - c) * d, g = this._totalQuads - 1 - c, h;
            for (h = 0; h < c; h++)this._quads[g + h] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads - 1) * d);
            this._quadsReader.set(this._quadsReader.subarray(e, e + f), e + d * c);
            for (h = 0; h < c; h++)this._setQuadToArray(a[h], b + h);
            this.dirty = !0
        }
    },
    insertQuadFromIndex: function (a, b) {
        if (a !== b) {
            cc.assert(0 <= b || b < this._totalQuads, cc._LogInfos.TextureAtlas_insertQuadFromIndex);
            cc.assert(0 <= a || a < this._totalQuads, cc._LogInfos.TextureAtlas_insertQuadFromIndex_2);
            var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, d = this._quadsReader, e = d.subarray(a * c, c), f;
            a > b ? (f = b * c, d.set(d.subarray(f, f + (a - b) * c), f + c), d.set(e, f)) : (f = (a + 1) * c, d.set(d.subarray(f, f + (b - a) * c), f - c), d.set(e, b * c));
            this.dirty = !0
        }
    },
    removeQuadAtIndex: function (a) {
        cc.assert(a < this._totalQuads, cc._LogInfos.TextureAtlas_removeQuadAtIndex);
        var b = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._totalQuads--;
        this._quads.length = this._totalQuads;
        if (a !== this._totalQuads) {
            var c = (a + 1) * b;
            this._quadsReader.set(this._quadsReader.subarray(c, c + (this._totalQuads - a) * b), c - b)
        }
        this.dirty = !0
    },
    removeQuadsAtIndex: function (a, b) {
        cc.assert(a + b <= this._totalQuads, cc._LogInfos.TextureAtlas_removeQuadsAtIndex);
        this._totalQuads -= b;
        if (a !== this._totalQuads) {
            var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, d = (a + b) * c, e = a * c;
            this._quadsReader.set(this._quadsReader.subarray(d, d + (this._totalQuads - a) * c), e)
        }
        this.dirty = !0
    },
    removeAllQuads: function () {
        this._totalQuads = this._quads.length = 0
    },
    _setDirty: function (a) {
        this.dirty = a
    },
    resizeCapacity: function (a) {
        if (a === this._capacity)return !0;
        var b = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, c = this._capacity;
        this._totalQuads = Math.min(this._totalQuads, a);
        var d = this._capacity = 0 | a, e = this._totalQuads;
        if (null === this._quads)
            for (this._quads = [], this._quadsArrayBuffer = new ArrayBuffer(b * d), this._quadsReader = new Uint8Array(this._quadsArrayBuffer), a = 0; a < d; a++)this._quads = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, a * b); else {
            var f, g, h = this._quads;
            if (d > c) {
                f = [];
                g = new ArrayBuffer(b * d);
                for (a = 0; a < e; a++)f[a] = new cc.V3F_C4B_T2F_Quad(h[a].tl, h[a].bl, h[a].tr, h[a].br, g, a * b);
                for (; a < d; a++)f[a] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, g, a * b)
            } else
                for (e = Math.max(e, d), f = [], g = new ArrayBuffer(b * d), a = 0; a < e; a++)f[a] = new cc.V3F_C4B_T2F_Quad(h[a].tl, h[a].bl, h[a].tr, h[a].br, g, a * b);
            this._quadsReader = new Uint8Array(g);
            this._quads = f;
            this._quadsArrayBuffer = g
        }
        null === this._indices ? this._indices = new Uint16Array(6 * d) : d > c ? (b = new Uint16Array(6 * d), b.set(this._indices, 0), this._indices = b) : this._indices = this._indices.subarray(0, 6 * d);
        this._setupIndices();
        this._mapBuffers();
        return this.dirty = !0
    },
    increaseTotalQuadsWith: function (a) {
        this._totalQuads += a
    },
    moveQuadsFromIndex: function (a, b, c) {
        if (void 0 === c) {
            if (c = b, b = this._totalQuads - a, cc.assert(c + (this._totalQuads - a) <= this._capacity, cc._LogInfos.TextureAtlas_moveQuadsFromIndex), 0 === b)return
        } else if (cc.assert(c + b <= this._totalQuads, cc._LogInfos.TextureAtlas_moveQuadsFromIndex_2), cc.assert(a < this._totalQuads, cc._LogInfos.TextureAtlas_moveQuadsFromIndex_3), a === c)return;
        var d = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, e = a * d, f = b * d, g = this._quadsReader, h = g.subarray(e, e + f), k = c * d;
        c < a ? (b = c * d, g.set(g.subarray(b, b + (a - c) * d), b + f)) : (b = (a + b) * d, g.set(g.subarray(b, b + (c - a) * d), e));
        g.set(h, k);
        this.dirty = !0
    },
    fillWithEmptyQuadsFromIndex: function (a, b) {
        for (var c = b * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, d = new Uint8Array(this._quadsArrayBuffer, a * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, c), e = 0; e < c; e++)d[e] = 0
    },
    drawQuads: function () {
        this.drawNumberOfQuads(this._totalQuads, 0)
    },
    _releaseBuffer: function () {
        var a = cc._renderContext;
        this._buffersVBO && (this._buffersVBO[0] && a.deleteBuffer(this._buffersVBO[0]), this._buffersVBO[1] && a.deleteBuffer(this._buffersVBO[1]));
        this._quadsWebBuffer && a.deleteBuffer(this._quadsWebBuffer)
    }
});
_p = cc.TextureAtlas.prototype;
cc.defineGetterSetter(_p, "totalQuads", _p.getTotalQuads);
cc.defineGetterSetter(_p, "capacity", _p.getCapacity);
cc.defineGetterSetter(_p, "quads", _p.getQuads, _p.setQuads);
cc.TextureAtlas.create = function (a, b) {
    return new cc.TextureAtlas(a, b)
};
cc.TextureAtlas.createWithTexture = cc.TextureAtlas.create;
cc._renderType === cc._RENDER_TYPE_WEBGL && (cc.assert(cc.isFunction(cc._tmp.WebGLTextureAtlas), cc._LogInfos.MissingFile, "TexturesWebGL.js"), cc._tmp.WebGLTextureAtlas(), delete cc._tmp.WebGLTextureAtlas);
cc.assert(cc.isFunction(cc._tmp.PrototypeTextureAtlas), cc._LogInfos.MissingFile, "TexturesPropertyDefine.js");
cc._tmp.PrototypeTextureAtlas();
delete cc._tmp.PrototypeTextureAtlas;
cc.Scene = cc.Node.extend({
    _className: "Scene", ctor: function () {
        cc.Node.prototype.ctor.call(this);
        this._ignoreAnchorPointForPosition = !0;
        this.setAnchorPoint(0.5, 0.5);
        this.setContentSize(cc.director.getWinSize())
    }
});
cc.Scene.create = function () {
    return new cc.Scene
};
cc.LoaderScene = cc.Scene.extend({
    _interval: null,
    _label: null,
    _className: "LoaderScene",
    cb: null,
    target: null,
    init: function () {
        var a = this, b = 200, c = a._bgLayer = new cc.LayerColor(cc.color(255, 255, 255, 255));
        a.addChild(c, 0);
        var d = 24, e = -b / 2 + 100;
        cc._loaderImage && (cc.loader.loadImg(cc._loaderImage, {isCrossOrigin: !1}, function (c, d) {
            b = d.height;
            a._initStage(d, cc.visibleRect.center)
        }), d = 14, e = -b / 2 - 10);
        d = a._label = new cc.LabelTTF("Loading... 0%", "Arial", d);
        d.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, e)));
        d.setColor(cc.color(0, 0, 0));
        c.addChild(this._label, 10);
        return !0
    },
    _initStage: function (a, b) {
        var c = this._texture2d = new cc.Texture2D;
        c.initWithElement(a);
        c.handleLoadedTexture();
        c = this._logo = new cc.Sprite(c);
        c.setScale(cc.contentScaleFactor());
        c.x = b.x;
        c.y = b.y;
        this._bgLayer.addChild(c, 10)
    },
    onEnter: function () {
        cc.Node.prototype.onEnter.call(this);
        this.schedule(this._startLoading, 0.3)
    },
    onExit: function () {
        cc.Node.prototype.onExit.call(this);
        this._label.setString("Loading... 0%")
    },
    initWithResources: function (a, b, c) {
        cc.isString(a) && (a = [a]);
        this.resources = a || [];
        this.cb = b;
        this.target = c
    },
    _startLoading: function () {
        var a = this;
        a.unschedule(a._startLoading);
        cc.loader.load(a.resources, function (b, c, d) {
            b = Math.min(d / c * 100 | 0, 100);
            a._label.setString("Loading... " + b + "%")
        }, function () {
            a.cb && (document.getElementById(cc.game.config.id).style.backgroundColor = "black", a.cb.call(a.target))
        })
    }
});
cc.LoaderScene.preload = function (a, b, c) {
    var d = cc;
    d.loaderScene || (d.loaderScene = new cc.LoaderScene, d.loaderScene.init());
    d.loaderScene.initWithResources(a, b, c);
    cc.director.runScene(d.loaderScene);
    return d.loaderScene
};
cc.Layer = cc.Node.extend({
    _className: "Layer", ctor: function () {
        var a = cc.Node.prototype;
        a.ctor.call(this);
        this._ignoreAnchorPointForPosition = !0;
        a.setAnchorPoint.call(this, 0.5, 0.5);
        a.setContentSize.call(this, cc.winSize)
    }, init: function () {
        this._ignoreAnchorPointForPosition = !0;
        this.setAnchorPoint(0.5, 0.5);
        this.setContentSize(cc.winSize);
        this._cascadeOpacityEnabled = this._cascadeColorEnabled = !1;
        return !0
    }, bake: function () {
        this._renderCmd.bake()
    }, unbake: function () {
        this._renderCmd.unbake()
    }, isBaked: function () {
        return this._isBaked
    }, addChild: function (a, b, c) {
        cc.Node.prototype.addChild.call(this, a, b, c);
        this._renderCmd._bakeForAddChild(a)
    }, _createRenderCmd: function () {
        return cc._renderType === cc._RENDER_TYPE_CANVAS ? new cc.Layer.CanvasRenderCmd(this) : new cc.Layer.WebGLRenderCmd(this)
    }
});
cc.Layer.create = function () {
    return new cc.Layer
};
cc.LayerColor = cc.Layer.extend({
    _blendFunc: null, _className: "LayerColor", getBlendFunc: function () {
        return this._blendFunc
    }, changeWidthAndHeight: function (a, b) {
        this.width = a;
        this.height = b
    }, changeWidth: function (a) {
        this.width = a
    }, changeHeight: function (a) {
        this.height = a
    }, setOpacityModifyRGB: function (a) {
    }, isOpacityModifyRGB: function () {
        return !1
    }, ctor: function (a, b, c) {
        cc.Layer.prototype.ctor.call(this);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        cc.LayerColor.prototype.init.call(this, a, b, c)
    }, init: function (a, b, c) {
        cc._renderType !== cc._RENDER_TYPE_CANVAS && (this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR));
        var d = cc.director.getWinSize();
        a = a || cc.color(0, 0, 0, 255);
        b = void 0 === b ? d.width : b;
        c = void 0 === c ? d.height : c;
        d = this._realColor;
        d.r = a.r;
        d.g = a.g;
        d.b = a.b;
        this._realOpacity = a.a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty | cc.Node._dirtyFlags.opacityDirty);
        cc.LayerColor.prototype.setContentSize.call(this, b, c);
        return !0
    }, setBlendFunc: function (a, b) {
        var c = this._blendFunc;
        void 0 === b ? (c.src = a.src, c.dst = a.dst) : (c.src = a, c.dst = b);
        this._renderCmd.updateBlendFunc(c)
    }, _setWidth: function (a) {
        cc.Node.prototype._setWidth.call(this, a);
        this._renderCmd._updateSquareVerticesWidth(a)
    }, _setHeight: function (a) {
        cc.Node.prototype._setHeight.call(this, a);
        this._renderCmd._updateSquareVerticesHeight(a)
    }, setContentSize: function (a, b) {
        cc.Layer.prototype.setContentSize.call(this, a, b);
        this._renderCmd._updateSquareVertices(a, b)
    }, _createRenderCmd: function () {
        return cc._renderType === cc._RENDER_TYPE_CANVAS ? new cc.LayerColor.CanvasRenderCmd(this) : new cc.LayerColor.WebGLRenderCmd(this)
    }
});
cc.LayerColor.create = function (a, b, c) {
    return new cc.LayerColor(a, b, c)
};
(function () {
    var a = cc.LayerColor.prototype;
    cc.defineGetterSetter(a, "width", a._getWidth, a._setWidth);
    cc.defineGetterSetter(a, "height", a._getHeight, a._setHeight)
})();
cc.LayerGradient = cc.LayerColor.extend({
    _endColor: null,
    _startOpacity: 255,
    _endOpacity: 255,
    _alongVector: null,
    _compressedInterpolation: !1,
    _className: "LayerGradient",
    _colorStops: [],
    ctor: function (a, b, c, d) {
        cc.LayerColor.prototype.ctor.call(this);
        this._endColor = cc.color(0, 0, 0, 255);
        this._alongVector = cc.p(0, -1);
        this._endOpacity = this._startOpacity = 255;
        d && d instanceof Array ? (this._colorStops = d, d.splice(0, 0, {
            p: 0,
            color: a || cc.color.BLACK
        }), d.push({p: 1, color: b || cc.color.BLACK})) : this._colorStops = [{p: 0, color: a || cc.color.BLACK}, {
            p: 1,
            color: b || cc.color.BLACK
        }];
        cc.LayerGradient.prototype.init.call(this, a, b, c, d)
    },
    init: function (a, b, c, d) {
        a = a || cc.color(0, 0, 0, 255);
        b = b || cc.color(0, 0, 0, 255);
        c = c || cc.p(0, -1);
        d = this._endColor;
        this._startOpacity = a.a;
        d.r = b.r;
        d.g = b.g;
        d.b = b.b;
        this._endOpacity = b.a;
        this._alongVector = c;
        this._compressedInterpolation = !0;
        cc.LayerColor.prototype.init.call(this, cc.color(a.r, a.g, a.b, 255));
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty | cc.Node._dirtyFlags.opacityDirty | cc.Node._dirtyFlags.gradientDirty);
        return !0
    },
    setContentSize: function (a, b) {
        cc.LayerColor.prototype.setContentSize.call(this, a, b);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    _setWidth: function (a) {
        cc.LayerColor.prototype._setWidth.call(this, a);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    _setHeight: function (a) {
        cc.LayerColor.prototype._setHeight.call(this, a);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    getStartColor: function () {
        return cc.color(this._realColor)
    },
    setStartColor: function (a) {
        this.color = a;
        var b = this._colorStops;
        b && 0 < b.length && (b = b[0].color, b.r = a.r, b.g = a.g, b.b = a.b)
    },
    setEndColor: function (a) {
        var b = this._endColor;
        b.r = a.r;
        b.g = a.g;
        b.b = a.b;
        (b = this._colorStops) && 0 < b.length && (b = b[b.length - 1].color, b.r = a.r, b.g = a.g, b.b = a.b);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty)
    },
    getEndColor: function () {
        return cc.color(this._endColor)
    },
    setStartOpacity: function (a) {
        this._startOpacity = a;
        var b = this._colorStops;
        b && 0 < b.length && (b[0].color.a = a);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    },
    getStartOpacity: function () {
        return this._startOpacity
    },
    setEndOpacity: function (a) {
        this._endOpacity = a;
        var b = this._colorStops;
        b && 0 < b.length && (b[b.length - 1].color.a = a);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    },
    getEndOpacity: function () {
        return this._endOpacity
    },
    setVector: function (a) {
        this._alongVector.x = a.x;
        this._alongVector.y = a.y;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    getVector: function () {
        return cc.p(this._alongVector.x, this._alongVector.y)
    },
    isCompressedInterpolation: function () {
        return this._compressedInterpolation
    },
    setCompressedInterpolation: function (a) {
        this._compressedInterpolation = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.gradientDirty)
    },
    getColorStops: function () {
        return this._colorStops
    },
    setColorStops: function (a) {
        this._colorStops = a;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty | cc.Node._dirtyFlags.opacityDirty | cc.Node._dirtyFlags.gradientDirty)
    },
    _createRenderCmd: function () {
        return cc._renderType === cc._RENDER_TYPE_CANVAS ? new cc.LayerGradient.CanvasRenderCmd(this) : new cc.LayerGradient.WebGLRenderCmd(this)
    }
});
cc.LayerGradient.create = function (a, b, c, d) {
    return new cc.LayerGradient(a, b, c, d)
};
(function () {
    var a = cc.LayerGradient.prototype;
    cc.defineGetterSetter(a, "startColor", a.getStartColor, a.setStartColor);
    cc.defineGetterSetter(a, "endColor", a.getEndColor, a.setEndColor);
    cc.defineGetterSetter(a, "startOpacity", a.getStartOpacity, a.setStartOpacity);
    cc.defineGetterSetter(a, "endOpacity", a.getEndOpacity, a.setEndOpacity);
    cc.defineGetterSetter(a, "vector", a.getVector, a.setVector);
    cc.defineGetterSetter(a, "colorStops", a.getColorStops, a.setColorStops)
})();
cc.LayerMultiplex = cc.Layer.extend({
    _enabledLayer: 0, _layers: null, _className: "LayerMultiplex", ctor: function (a) {
        cc.Layer.prototype.ctor.call(this);
        a instanceof Array ? cc.LayerMultiplex.prototype.initWithLayers.call(this, a) : cc.LayerMultiplex.prototype.initWithLayers.call(this, Array.prototype.slice.call(arguments))
    }, initWithLayers: function (a) {
        0 < a.length && null == a[a.length - 1] && cc.log(cc._LogInfos.LayerMultiplex_initWithLayers);
        this._layers = a;
        this._enabledLayer = 0;
        this.addChild(this._layers[this._enabledLayer]);
        return !0
    }, switchTo: function (a) {
        a >= this._layers.length ? cc.log(cc._LogInfos.LayerMultiplex_switchTo) : (this.removeChild(this._layers[this._enabledLayer], !0), this._enabledLayer = a, this.addChild(this._layers[a]))
    }, switchToAndReleaseMe: function (a) {
        a >= this._layers.length ? cc.log(cc._LogInfos.LayerMultiplex_switchToAndReleaseMe) : (this.removeChild(this._layers[this._enabledLayer], !0), this._layers[this._enabledLayer] = null, this._enabledLayer = a, this.addChild(this._layers[a]))
    }, addLayer: function (a) {
        a ? this._layers.push(a) : cc.log(cc._LogInfos.LayerMultiplex_addLayer)
    }
});
cc.LayerMultiplex.create = function () {
    return new cc.LayerMultiplex(Array.prototype.slice.call(arguments))
};
(function () {
    cc.Layer.CanvasRenderCmd = function (a) {
        cc.Node.CanvasRenderCmd.call(this, a);
        this._isBaked = !1;
        this._bakeSprite = null
    };
    var a = cc.Layer.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    a.constructor = cc.Layer.CanvasRenderCmd;
    a.bake = function () {
        if (!this._isBaked) {
            this._needDraw = !0;
            this._isBaked = this._cacheDirty = cc.renderer.childrenOrderDirty = !0;
            for (var a = this._node._children, c = 0, d = a.length; c < d; c++)a[c]._renderCmd._setCachedParent(this);
            this._bakeSprite || (this._bakeSprite = new cc.BakeSprite, this._bakeSprite.setAnchorPoint(0, 0))
        }
    };
    a.unbake = function () {
        if (this._isBaked) {
            cc.renderer.childrenOrderDirty = !0;
            this._isBaked = this._needDraw = !1;
            this._cacheDirty = !0;
            for (var a = this._node._children, c = 0, d = a.length; c < d; c++)a[c]._renderCmd._setCachedParent(null)
        }
    };
    a.isBaked = function () {
        return this._isBaked
    };
    a.rendering = function () {
        if (this._cacheDirty) {
            var a = this._node, c = a._children, d = this._bakeSprite;
            this.transform(this.getParentRenderCmd(), !0);
            var e = this._getBoundingBoxForBake();
            e.width = 0 | e.width + 0.5;
            e.height = 0 | e.height + 0.5;
            var f = d.getCacheContext(), g = f.getContext();
            d.resetCanvasSize(e.width, e.height);
            f.setOffset(0 - e.x, g.canvas.height - e.height + e.y);
            d.setPosition(e.x, e.y);
            a.sortAllChildren();
            cc.renderer._turnToCacheMode(this.__instanceId);
            a = 0;
            for (e = c.length; a < e; a++)c[a].visit(this);
            cc.renderer._renderingToCacheCanvas(f, this.__instanceId);
            d.transform();
            this._cacheDirty = !1
        }
    };
    a.visit = function (a) {
        if (this._isBaked) {
            var c = this._node, d = c._children.length;
            c._visible && 0 !== d && (this._syncStatus(a), cc.renderer.pushRenderCommand(this), this._bakeSprite.visit(this), this._dirtyFlag = 0)
        } else cc.Node.CanvasRenderCmd.prototype.visit.call(this, a)
    };
    a._bakeForAddChild = function (a) {
        a._parent === this._node && this._isBaked && a._renderCmd._setCachedParent(this)
    };
    a._getBoundingBoxForBake = function () {
        var a = null, c = this._node;
        if (!c._children || 0 === c._children.length)return cc.rect(0, 0, 10, 10);
        for (var d = c.getNodeToWorldTransform(), c = c._children, e = 0, f = c.length; e < f; e++) {
            var g = c[e];
            g && g._visible && (a ? (g = g._getBoundingBoxToCurrentNode(d)) && (a = cc.rectUnion(a, g)) : a = g._getBoundingBoxToCurrentNode(d))
        }
        return a
    }
})();
(function () {
    cc.LayerColor.CanvasRenderCmd = function (a) {
        cc.Layer.CanvasRenderCmd.call(this, a);
        this._needDraw = !0;
        this._blendFuncStr = "source-over";
        this._bakeRenderCmd = new cc.CustomRenderCmd(this, this._bakeRendering)
    };
    var a = cc.LayerColor.CanvasRenderCmd.prototype = Object.create(cc.Layer.CanvasRenderCmd.prototype);
    a.constructor = cc.LayerColor.CanvasRenderCmd;
    a.unbake = function () {
        cc.Layer.CanvasRenderCmd.prototype.unbake.call(this);
        this._needDraw = !0
    };
    a.rendering = function (a, c, d) {
        a = a || cc._renderContext;
        var e = a.getContext(), f = this._node, g = this._displayedColor, h = this._displayedOpacity / 255, k = f._contentSize.width, f = f._contentSize.height;
        0 !== h && (a.setCompositeOperation(this._blendFuncStr), a.setGlobalAlpha(h), a.setFillStyle("rgba(" + (0 | g.r) + "," + (0 | g.g) + "," + (0 | g.b) + ", 1)"), a.setTransform(this._worldTransform, c, d), e.fillRect(0, 0, k * c, -f * d), cc.g_NumberOfDraws++)
    };
    a.updateBlendFunc = function (a) {
        this._blendFuncStr = cc.Node.CanvasRenderCmd._getCompositeOperationByBlendFunc(a)
    };
    a._updateSquareVertices = a._updateSquareVerticesWidth = a._updateSquareVerticesHeight = function () {
    };
    a._bakeRendering = function () {
        if (this._cacheDirty) {
            var a = this._node, c = this._bakeSprite, d = a._children, e = d.length;
            this.transform(this.getParentRenderCmd(), !0);
            var f = this._getBoundingBoxForBake();
            f.width = 0 | f.width + 0.5;
            f.height = 0 | f.height + 0.5;
            var g = c.getCacheContext(), h = g.getContext();
            c.resetCanvasSize(f.width, f.height);
            g.setOffset(0 - f.x, h.canvas.height - f.height + f.y);
            c.setPosition(f.x, f.y);
            cc.renderer._turnToCacheMode(this.__instanceId);
            if (0 < e) {
                a.sortAllChildren();
                for (a = 0; a < e; a++)
                    if (f = d[a], 0 > f._localZOrder)f._renderCmd.visit(this); else break;
                for (cc.renderer.pushRenderCommand(this); a < e; a++)d[a]._renderCmd.visit(this)
            } else cc.renderer.pushRenderCommand(this);
            cc.renderer._renderingToCacheCanvas(g, this.__instanceId);
            c.transform();
            this._cacheDirty = !1
        }
    };
    a.visit = function (a) {
        this._isBaked ? this._node._visible && (this._syncStatus(a), cc.renderer.pushRenderCommand(this._bakeRenderCmd), this._bakeSprite._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty), this._bakeSprite.visit(this), this._dirtyFlag = 0) : cc.Node.CanvasRenderCmd.prototype.visit.call(this)
    };
    a._getBoundingBoxForBake = function () {
        var a = this._node, c = cc.rect(0, 0, a._contentSize.width, a._contentSize.height), d = a.getNodeToWorldTransform(), c = cc.rectApplyAffineTransform(c, a.getNodeToWorldTransform());
        if (!a._children || 0 === a._children.length)return c;
        for (var a = a._children, e = 0; e < a.length; e++) {
            var f = a[e];
            f && f._visible && (f = f._getBoundingBoxToCurrentNode(d), c = cc.rectUnion(c, f))
        }
        return c
    }
})();
(function () {
    cc.LayerGradient.RenderCmd = {
        updateStatus: function () {
            var a = cc.Node._dirtyFlags, b = this._dirtyFlag, c = b & a.colorDirty, d = b & a.opacityDirty;
            c && this._updateDisplayColor();
            d && this._updateDisplayOpacity();
            b & a.transformDirty && this.transform(null, !0);
            (c || d || b & a.gradientDirty) && this._updateColor();
            this._dirtyFlag = 0
        }
    }
})();
(function () {
    cc.LayerGradient.CanvasRenderCmd = function (a) {
        cc.LayerColor.CanvasRenderCmd.call(this, a);
        this._needDraw = !0;
        this._startPoint = cc.p(0, 0);
        this._endPoint = cc.p(0, 0);
        this._endStopStr = this._startStopStr = null
    };
    var a = cc.LayerGradient.CanvasRenderCmd.prototype = Object.create(cc.LayerColor.CanvasRenderCmd.prototype);
    cc.inject(cc.LayerGradient.RenderCmd, a);
    a.constructor = cc.LayerGradient.CanvasRenderCmd;
    a.rendering = function (a, c, d) {
        a = a || cc._renderContext;
        var e = a.getContext(), f = this._node, g = this._displayedOpacity / 255;
        if (0 !== g) {
            var h = f._contentSize.width, k = f._contentSize.height;
            a.setCompositeOperation(this._blendFuncStr);
            a.setGlobalAlpha(g);
            g = e.createLinearGradient(this._startPoint.x * c, this._startPoint.y * d, this._endPoint.x * c, this._endPoint.y * d);
            if (f._colorStops)
                for (var m = 0; m < f._colorStops.length; m++)g.addColorStop(f._colorStops[m].p, this._colorStopsStr[m]); else g.addColorStop(0, this._startStopStr), g.addColorStop(1, this._endStopStr);
            a.setFillStyle(g);
            a.setTransform(this._worldTransform, c, d);
            e.fillRect(0, 0, h * c, -k * d);
            cc.g_NumberOfDraws++
        }
    };
    a._syncStatus = function (a) {
        var c = cc.Node._dirtyFlags, d = this._dirtyFlag, e = a ? a._node : null;
        e && e._cascadeColorEnabled && a._dirtyFlag & c.colorDirty && (d |= c.colorDirty);
        e && e._cascadeOpacityEnabled && a._dirtyFlag & c.opacityDirty && (d |= c.opacityDirty);
        a && a._dirtyFlag & c.transformDirty && (d |= c.transformDirty);
        var e = d & c.colorDirty, f = d & c.opacityDirty;
        this._dirtyFlag = d;
        e && this._syncDisplayColor();
        f && this._syncDisplayOpacity();
        d & c.transformDirty && this.transform(a);
        (e || f || d & c.gradientDirty) && this._updateColor()
    };
    a._updateColor = function () {
        var a = this._node, c = a._contentSize, d = 0.5 * c.width, c = 0.5 * c.height;
        this._dirtyFlag ^= this._dirtyFlag & cc.Node._dirtyFlags.gradientDirty;
        var e = cc.pAngleSigned(cc.p(0, -1), a._alongVector), e = cc.pRotateByAngle(cc.p(0, -1), cc.p(0, 0), e), f = Math.min(Math.abs(1 / e.x), Math.abs(1 / e.y));
        this._startPoint.x = d * -e.x * f + d;
        this._startPoint.y = c * e.y * f - c;
        this._endPoint.x = d * e.x * f + d;
        this._endPoint.y = c * -e.y * f - c;
        d = this._displayedColor;
        c = a._endColor;
        e = a._startOpacity / 255;
        f = a._endOpacity / 255;
        this._startStopStr = "rgba(" + Math.round(d.r) + "," + Math.round(d.g) + "," + Math.round(d.b) + "," + e.toFixed(4) + ")";
        this._endStopStr = "rgba(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + "," + f.toFixed(4) + ")";
        if (a._colorStops)
            for (this._endOpacity = this._startOpacity = 0, this._colorStopsStr = [], d = 0; d < a._colorStops.length; d++)c = a._colorStops[d].color, e = null == c.a ? 1 : c.a / 255, this._colorStopsStr.push("rgba(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + "," + e.toFixed(4) + ")")
    }
})();
(function () {
    cc.Layer.WebGLRenderCmd = function (a) {
        cc.Node.WebGLRenderCmd.call(this, a)
    };
    var a = cc.Layer.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    a.constructor = cc.Layer.WebGLRenderCmd;
    a.bake = function () {
    };
    a.unbake = function () {
    };
    a._bakeForAddChild = function () {
    }
})();
(function () {
    cc.LayerColor.WebGLRenderCmd = function (a) {
        cc.Layer.WebGLRenderCmd.call(this, a);
        this._needDraw = !0;
        this._squareVerticesAB = new ArrayBuffer(32);
        this._squareColorsAB = new ArrayBuffer(16);
        a = this._squareVerticesAB;
        var c = this._squareColorsAB, d = cc.Vertex2F.BYTES_PER_ELEMENT, e = cc.Color.BYTES_PER_ELEMENT;
        this._squareVertices = [new cc.Vertex2F(0, 0, a, 0), new cc.Vertex2F(0, 0, a, d), new cc.Vertex2F(0, 0, a, 2 * d), new cc.Vertex2F(0, 0, a, 3 * d)];
        this._squareColors = [cc.color(0, 0, 0, 255, c, 0), cc.color(0, 0, 0, 255, c, e), cc.color(0, 0, 0, 255, c, 2 * e), cc.color(0, 0, 0, 255, c, 3 * e)];
        this._verticesFloat32Buffer = cc._renderContext.createBuffer();
        this._colorsUint8Buffer = cc._renderContext.createBuffer()
    };
    var a = cc.LayerColor.WebGLRenderCmd.prototype = Object.create(cc.Layer.WebGLRenderCmd.prototype);
    a.constructor = cc.LayerColor.WebGLRenderCmd;
    a.rendering = function (a) {
        a = a || cc._renderContext;
        var c = this._node;
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);
        cc.glBlendFunc(c._blendFunc.src, c._blendFunc.dst);
        a.bindBuffer(a.ARRAY_BUFFER, this._verticesFloat32Buffer);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
        a.bindBuffer(a.ARRAY_BUFFER, this._colorsUint8Buffer);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, 0, 0);
        a.drawArrays(a.TRIANGLE_STRIP, 0, this._squareVertices.length)
    };
    a._updateSquareVertices = function (a, c) {
        var d = this._squareVertices;
        void 0 === c ? (d[1].x = a.width, d[2].y = a.height, d[3].x = a.width, d[3].y = a.height) : (d[1].x = a, d[2].y = c, d[3].x = a, d[3].y = c);
        this._bindLayerVerticesBufferData()
    };
    a._updateSquareVerticesWidth = function (a) {
        var c = this._squareVertices;
        c[1].x = a;
        c[3].x = a;
        this._bindLayerVerticesBufferData()
    };
    a._updateSquareVerticesHeight = function (a) {
        var c = this._squareVertices;
        c[2].y = a;
        c[3].y = a;
        this._bindLayerVerticesBufferData()
    };
    a._updateColor = function () {
        for (var a = this._displayedColor, c = this._displayedOpacity, d = this._squareColors, e = 0; 4 > e; e++)d[e].r = a.r, d[e].g = a.g, d[e].b = a.b, d[e].a = c;
        this._bindLayerColorsBufferData()
    };
    a._bindLayerVerticesBufferData = function () {
        var a = cc._renderContext;
        a.bindBuffer(a.ARRAY_BUFFER, this._verticesFloat32Buffer);
        a.bufferData(a.ARRAY_BUFFER, this._squareVerticesAB, a.STATIC_DRAW)
    };
    a._bindLayerColorsBufferData = function () {
        var a = cc._renderContext;
        a.bindBuffer(a.ARRAY_BUFFER, this._colorsUint8Buffer);
        a.bufferData(a.ARRAY_BUFFER, this._squareColorsAB, a.STATIC_DRAW)
    };
    a.updateBlendFunc = function (a) {
    }
})();
(function () {
    cc.LayerGradient.WebGLRenderCmd = function (a) {
        cc.LayerColor.WebGLRenderCmd.call(this, a);
        this._needDraw = !0;
        this._clipRect = new cc.Rect;
        this._clippingRectDirty = !1
    };
    var a = cc.LayerGradient.WebGLRenderCmd.prototype = Object.create(cc.LayerColor.WebGLRenderCmd.prototype);
    cc.inject(cc.LayerGradient.RenderCmd, a);
    a.constructor = cc.LayerGradient.WebGLRenderCmd;
    a._syncStatus = function (a) {
        var c = cc.Node._dirtyFlags, d = this._dirtyFlag, e = a ? a._node : null;
        e && e._cascadeColorEnabled && a._dirtyFlag & c.colorDirty && (d |= c.colorDirty);
        e && e._cascadeOpacityEnabled && a._dirtyFlag & c.opacityDirty && (d |= c.opacityDirty);
        a && a._dirtyFlag & c.transformDirty && (d |= c.transformDirty);
        var e = d & c.colorDirty, f = d & c.opacityDirty;
        this._dirtyFlag = d;
        e && this._syncDisplayColor();
        f && this._syncDisplayOpacity();
        this.transform(a);
        (e || f || d & c.gradientDirty) && this._updateColor()
    };
    a._updateColor = function () {
        this._dirtyFlag ^= this._dirtyFlag & cc.Node._dirtyFlags.gradientDirty;
        var a = this._node, c = a._colorStops;
        if (c && !(2 > c.length)) {
            this._clippingRectDirty = !0;
            var d = c.length, e = 2 * d, f, g = a._contentSize;
            this._squareVerticesAB = new ArrayBuffer(8 * e);
            this._squareColorsAB = new ArrayBuffer(4 * e);
            var h = this._squareVertices, k = this._squareColors;
            h.length = 0;
            k.length = 0;
            var m = this._squareVerticesAB, n = this._squareColorsAB, p = cc.Vertex2F.BYTES_PER_ELEMENT, s = cc.Color.BYTES_PER_ELEMENT;
            for (f = 0; f < e; f++)h.push(new cc.Vertex2F(0, 0, m, p * f)), k.push(cc.color(0, 0, 0, 255, n, s * f));
            n = Math.PI + cc.pAngleSigned(cc.p(0, -1), a._alongVector);
            a = cc.p(g.width / 2, g.height / 2);
            f = Math.round(cc.radiansToDegrees(n));
            e = cc.affineTransformMake(1, 0, 0, 1, a.x, a.y);
            e = cc.affineTransformRotate(e, n);
            90 > f ? (p = cc.p(-a.x, a.y), f = cc.p(a.x, a.y)) : 180 > f ? (p = cc.p(a.x, a.y), f = cc.p(a.x, -a.y)) : 270 > f ? (p = cc.p(a.x, -a.y), f = cc.p(-a.x, -a.y)) : (p = cc.p(-a.x, -a.y), f = cc.p(-a.x, a.y));
            m = Math.sin(n);
            n = Math.cos(n);
            p = Math.abs((p.x * n - p.y * m) / a.x);
            f = Math.abs((f.x * m + f.y * n) / a.y);
            e = cc.affineTransformScale(e, p, f);
            for (f = 0; f < d; f++)m = c[f].p * g.height, n = cc.pointApplyAffineTransform(-a.x, m - a.y, e), h[2 * f].x = n.x, h[2 * f].y = n.y, m = cc.pointApplyAffineTransform(g.width - a.x, m - a.y, e), h[2 * f + 1].x = m.x, h[2 * f + 1].y = m.y;
            g = this._displayedOpacity / 255;
            for (f = 0; f < d; f++)h = c[f].color, a = k[2 * f], e = k[2 * f + 1], a.r = h.r, a.g = h.g, a.b = h.b, a.a = h.a * g, e.r = h.r, e.g = h.g, e.b = h.b, e.a = h.a * g;
            this._bindLayerVerticesBufferData();
            this._bindLayerColorsBufferData()
        }
    };
    a.rendering = function (a) {
        a = a || cc._renderContext;
        var c = this._node, d = this._getClippingRect();
        a.enable(a.SCISSOR_TEST);
        cc.view.setScissorInPoints(d.x, d.y, d.width, d.height);
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);
        cc.glBlendFunc(c._blendFunc.src, c._blendFunc.dst);
        a.bindBuffer(a.ARRAY_BUFFER, this._verticesFloat32Buffer);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
        a.bindBuffer(a.ARRAY_BUFFER, this._colorsUint8Buffer);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, 0, 0);
        a.drawArrays(a.TRIANGLE_STRIP, 0, this._squareVertices.length);
        a.disable(a.SCISSOR_TEST)
    };
    a._getClippingRect = function () {
        if (this._clippingRectDirty) {
            var a = this._node, c = cc.rect(0, 0, a._contentSize.width, a._contentSize.height), a = a.getNodeToWorldTransform();
            this._clipRect = cc._rectApplyAffineTransformIn(c, a)
        }
        return this._clipRect
    }
})();
cc._tmp.PrototypeSprite = function () {
    var a = cc.Sprite.prototype;
    cc.defineGetterSetter(a, "opacityModifyRGB", a.isOpacityModifyRGB, a.setOpacityModifyRGB);
    cc.defineGetterSetter(a, "opacity", a.getOpacity, a.setOpacity);
    cc.defineGetterSetter(a, "color", a.getColor, a.setColor);
    cc.defineGetterSetter(a, "flippedX", a.isFlippedX, a.setFlippedX);
    cc.defineGetterSetter(a, "flippedY", a.isFlippedY, a.setFlippedY);
    cc.defineGetterSetter(a, "offsetX", a._getOffsetX);
    cc.defineGetterSetter(a, "offsetY", a._getOffsetY);
    cc.defineGetterSetter(a, "texture", a.getTexture, a.setTexture);
    cc.defineGetterSetter(a, "textureRectRotated", a.isTextureRectRotated);
    cc.defineGetterSetter(a, "batchNode", a.getBatchNode, a.setBatchNode);
    cc.defineGetterSetter(a, "quad", a.getQuad)
};
cc.Sprite = cc.Node.extend({
    dirty: !1,
    atlasIndex: 0,
    textureAtlas: null,
    _batchNode: null,
    _recursiveDirty: null,
    _hasChildren: null,
    _shouldBeHidden: !1,
    _transformToBatch: null,
    _blendFunc: null,
    _texture: null,
    _rect: null,
    _rectRotated: !1,
    _offsetPosition: null,
    _unflippedOffsetPositionFromCenter: null,
    _opacityModifyRGB: !1,
    _flippedX: !1,
    _flippedY: !1,
    _textureLoaded: !1,
    _className: "Sprite",
    ctor: function (a, b, c) {
        cc.Node.prototype.ctor.call(this);
        this._shouldBeHidden = !1;
        this._offsetPosition = cc.p(0, 0);
        this._unflippedOffsetPositionFromCenter = cc.p(0, 0);
        this._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        this._rect = cc.rect(0, 0, 0, 0);
        this._softInit(a, b, c)
    },
    textureLoaded: function () {
        return this._textureLoaded
    },
    addLoadedEventListener: function (a, b) {
        this.addEventListener("load", a, b)
    },
    isDirty: function () {
        return this.dirty
    },
    setDirty: function (a) {
        this.dirty = a
    },
    isTextureRectRotated: function () {
        return this._rectRotated
    },
    getAtlasIndex: function () {
        return this.atlasIndex
    },
    setAtlasIndex: function (a) {
        this.atlasIndex = a
    },
    getTextureRect: function () {
        return cc.rect(this._rect)
    },
    getTextureAtlas: function () {
        return this.textureAtlas
    },
    setTextureAtlas: function (a) {
        this.textureAtlas = a
    },
    getOffsetPosition: function () {
        return cc.p(this._offsetPosition)
    },
    _getOffsetX: function () {
        return this._offsetPosition.x
    },
    _getOffsetY: function () {
        return this._offsetPosition.y
    },
    getBlendFunc: function () {
        return this._blendFunc
    },
    initWithSpriteFrame: function (a) {
        cc.assert(a, cc._LogInfos.Sprite_initWithSpriteFrame);
        a.textureLoaded() || (this._textureLoaded = !1, a.addEventListener("load", this._renderCmd._spriteFrameLoadedCallback, this));
        var b = cc._renderType === cc._RENDER_TYPE_CANVAS ? !1 : a._rotated, b = this.initWithTexture(a.getTexture(), a.getRect(), b);
        this.setSpriteFrame(a);
        return b
    },
    initWithSpriteFrameName: function (a) {
        cc.assert(a, cc._LogInfos.Sprite_initWithSpriteFrameName);
        var b = cc.spriteFrameCache.getSpriteFrame(a);
        cc.assert(b, a + cc._LogInfos.Sprite_initWithSpriteFrameName1);
        return this.initWithSpriteFrame(b)
    },
    useBatchNode: function (a) {
        this.textureAtlas = a.getTextureAtlas();
        this._batchNode = a
    },
    setVertexRect: function (a) {
        var b = this._rect;
        b.x = a.x;
        b.y = a.y;
        b.width = a.width;
        b.height = a.height
    },
    sortAllChildren: function () {
        if (this._reorderChildDirty) {
            var a = this._children, b = a.length, c, d, e;
            for (c = 1; c < b; c++) {
                e = a[c];
                for (d = c - 1; 0 <= d;) {
                    if (e._localZOrder < a[d]._localZOrder)a[d + 1] = a[d]; else if (e._localZOrder === a[d]._localZOrder && e.arrivalOrder < a[d].arrivalOrder)a[d + 1] = a[d]; else break;
                    d--
                }
                a[d + 1] = e
            }
            this._batchNode && this._arrayMakeObjectsPerformSelector(a, cc.Node._stateCallbackType.sortAllChildren);
            this._reorderChildDirty = !1
        }
    },
    reorderChild: function (a, b) {
        cc.assert(a, cc._LogInfos.Sprite_reorderChild_2);
        -1 === this._children.indexOf(a) ? cc.log(cc._LogInfos.Sprite_reorderChild) : b !== a.zIndex && (this._batchNode && !this._reorderChildDirty && (this._setReorderChildDirtyRecursively(), this._batchNode.reorderBatch(!0)), cc.Node.prototype.reorderChild.call(this, a, b))
    },
    removeChild: function (a, b) {
        this._batchNode && this._batchNode.removeSpriteFromAtlas(a);
        cc.Node.prototype.removeChild.call(this, a, b)
    },
    setVisible: function (a) {
        cc.Node.prototype.setVisible.call(this, a);
        this._renderCmd.setDirtyRecursively(!0)
    },
    removeAllChildren: function (a) {
        var b = this._children, c = this._batchNode;
        if (c && null != b)
            for (var d = 0, e = b.length; d < e; d++)c.removeSpriteFromAtlas(b[d]);
        cc.Node.prototype.removeAllChildren.call(this, a);
        this._hasChildren = !1
    },
    ignoreAnchorPointForPosition: function (a) {
        this._batchNode ? cc.log(cc._LogInfos.Sprite_ignoreAnchorPointForPosition) : cc.Node.prototype.ignoreAnchorPointForPosition.call(this, a)
    },
    setFlippedX: function (a) {
        this._flippedX !== a && (this._flippedX = a, this.setTextureRect(this._rect, this._rectRotated, this._contentSize), this.setNodeDirty(!0))
    },
    setFlippedY: function (a) {
        this._flippedY !== a && (this._flippedY = a, this.setTextureRect(this._rect, this._rectRotated, this._contentSize), this.setNodeDirty(!0))
    },
    isFlippedX: function () {
        return this._flippedX
    },
    isFlippedY: function () {
        return this._flippedY
    },
    setOpacityModifyRGB: function (a) {
        this._opacityModifyRGB !== a && (this._opacityModifyRGB = a, this._renderCmd._setColorDirty())
    },
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB
    },
    setDisplayFrameWithAnimationName: function (a, b) {
        cc.assert(a, cc._LogInfos.Sprite_setDisplayFrameWithAnimationName_3);
        var c = cc.animationCache.getAnimation(a);
        c ? (c = c.getFrames()[b]) ? this.setSpriteFrame(c.getSpriteFrame()) : cc.log(cc._LogInfos.Sprite_setDisplayFrameWithAnimationName_2) : cc.log(cc._LogInfos.Sprite_setDisplayFrameWithAnimationName)
    },
    getBatchNode: function () {
        return this._batchNode
    },
    _setReorderChildDirtyRecursively: function () {
        if (!this._reorderChildDirty) {
            this._reorderChildDirty = !0;
            for (var a = this._parent; a && a !== this._batchNode;)a._setReorderChildDirtyRecursively(), a = a.parent
        }
    },
    getTexture: function () {
        return this._texture
    },
    _softInit: function (a, b, c) {
        if (void 0 === a)cc.Sprite.prototype.init.call(this); else if (cc.isString(a))"#" === a[0] ? (b = a.substr(1, a.length - 1), (b = cc.spriteFrameCache.getSpriteFrame(b)) ? this.initWithSpriteFrame(b) : cc.log("%s does not exist", a)) : cc.Sprite.prototype.init.call(this, a, b); else if ("object" === typeof a)
            if (a instanceof cc.Texture2D)this.initWithTexture(a, b, c); else if (a instanceof cc.SpriteFrame)this.initWithSpriteFrame(a); else if (a instanceof HTMLImageElement || a instanceof HTMLCanvasElement)b = new cc.Texture2D, b.initWithElement(a), b.handleLoadedTexture(), this.initWithTexture(b)
    },
    getQuad: function () {
        return this._renderCmd.getQuad()
    },
    setBlendFunc: function (a, b) {
        var c = this._blendFunc;
        void 0 === b ? (c.src = a.src, c.dst = a.dst) : (c.src = a, c.dst = b);
        this._renderCmd.updateBlendFunc(c)
    },
    init: function () {
        if (0 < arguments.length)return this.initWithFile(arguments[0], arguments[1]);
        cc.Node.prototype.init.call(this);
        this.dirty = this._recursiveDirty = !1;
        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;
        this.texture = null;
        this._flippedX = this._flippedY = !1;
        this.anchorY = this.anchorX = 0.5;
        this._offsetPosition.x = 0;
        this._offsetPosition.y = 0;
        this._hasChildren = !1;
        this._renderCmd._init();
        this.setTextureRect(cc.rect(0, 0, 0, 0), !1, cc.size(0, 0));
        return !0
    },
    initWithFile: function (a, b) {
        cc.assert(a, cc._LogInfos.Sprite_initWithFile);
        var c = cc.textureCache.getTextureForKey(a);
        if (c) {
            if (!b) {
                var d = c.getContentSize();
                b = cc.rect(0, 0, d.width, d.height)
            }
            return this.initWithTexture(c, b)
        }
        c = cc.textureCache.addImage(a);
        return this.initWithTexture(c, b || cc.rect(0, 0, c._contentSize.width, c._contentSize.height))
    },
    initWithTexture: function (a, b, c, d) {
        cc.assert(0 !== arguments.length, cc._LogInfos.CCSpriteBatchNode_initWithTexture);
        c = c || !1;
        a = this._renderCmd._handleTextureForRotatedTexture(a, b, c, d);
        if (!cc.Node.prototype.init.call(this))return !1;
        this._batchNode = null;
        this.dirty = this._recursiveDirty = !1;
        this._opacityModifyRGB = !0;
        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;
        this._flippedX = this._flippedY = !1;
        this.setAnchorPoint(0.5, 0.5);
        this._offsetPosition.x = 0;
        this._offsetPosition.y = 0;
        this._hasChildren = !1;
        this._renderCmd._init();
        var e = a.isLoaded();
        this._textureLoaded = e;
        if (!e)return this._rectRotated = c, b && (this._rect.x = b.x, this._rect.y = b.y, this._rect.width = b.width, this._rect.height = b.height), this.texture && this.texture.removeEventListener("load", this), a.addEventListener("load", this._renderCmd._textureLoadedCallback, this), this.texture = a, !0;
        b || (b = cc.rect(0, 0, a.width, a.height));
        this._renderCmd._checkTextureBoundary(a, b, c);
        this.texture = a;
        this.setTextureRect(b, c);
        this.setBatchNode(null);
        return !0
    },
    setTextureRect: function (a, b, c, d) {
        this._rectRotated = b || !1;
        this.setContentSize(c || a);
        this.setVertexRect(a);
        this._renderCmd._setTextureCoords(a, d);
        a = this._unflippedOffsetPositionFromCenter.x;
        b = this._unflippedOffsetPositionFromCenter.y;
        this._flippedX && (a = -a);
        this._flippedY && (b = -b);
        c = this._rect;
        this._offsetPosition.x = a + (this._contentSize.width - c.width) / 2;
        this._offsetPosition.y = b + (this._contentSize.height - c.height) / 2;
        this._batchNode ? this.dirty = !0 : this._renderCmd._resetForBatchNode()
    },
    updateTransform: function () {
        this._renderCmd.updateTransform()
    },
    addChild: function (a, b, c) {
        cc.assert(a, cc._LogInfos.CCSpriteBatchNode_addChild_2);
        null == b && (b = a._localZOrder);
        null == c && (c = a.tag);
        this._renderCmd._setBatchNodeForAddChild(a) && (cc.Node.prototype.addChild.call(this, a, b, c), this._hasChildren = !0)
    },
    setSpriteFrame: function (a) {
        var b = this;
        cc.isString(a) && (a = cc.spriteFrameCache.getSpriteFrame(a), cc.assert(a, cc._LogInfos.Sprite_setSpriteFrame));
        this.setNodeDirty(!0);
        var c = a.getOffset();
        b._unflippedOffsetPositionFromCenter.x = c.x;
        b._unflippedOffsetPositionFromCenter.y = c.y;
        c = a.getTexture();
        a.textureLoaded() ? (c !== b._texture && (b.texture = c), b.setTextureRect(a.getRect(), a.isRotated(), a.getOriginalSize())) : (b._textureLoaded = !1, a.addEventListener("load", function (a) {
            b._textureLoaded = !0;
            var c = a.getTexture();
            c !== b._texture && (b.texture = c);
            b.setTextureRect(a.getRect(), a.isRotated(), a.getOriginalSize());
            b.dispatchEvent("load");
            b.setColor(b.color)
        }, b));
        this._renderCmd._updateForSetSpriteFrame(c)
    },
    setDisplayFrame: function (a) {
        cc.log(cc._LogInfos.Sprite_setDisplayFrame);
        this.setSpriteFrame(a)
    },
    isFrameDisplayed: function (a) {
        return this._renderCmd.isFrameDisplayed(a)
    },
    displayFrame: function () {
        return this.getSpriteFrame()
    },
    getSpriteFrame: function () {
        return new cc.SpriteFrame(this._texture, cc.rectPointsToPixels(this._rect), this._rectRotated, cc.pointPointsToPixels(this._unflippedOffsetPositionFromCenter), cc.sizePointsToPixels(this._contentSize))
    },
    setBatchNode: function (a) {
        (this._batchNode = a) ? (this._transformToBatch = cc.affineTransformIdentity(), this.textureAtlas = this._batchNode.getTextureAtlas()) : (this.atlasIndex = cc.Sprite.INDEX_NOT_INITIALIZED, this.textureAtlas = null, this.dirty = this._recursiveDirty = !1, this._renderCmd._resetForBatchNode())
    },
    setTexture: function (a) {
        if (!a)return this._renderCmd._setTexture(null);
        cc.isString(a) ? (a = cc.textureCache.addImage(a), a._textureLoaded ? (this._clearRect(), this._renderCmd._setTexture(a), this._changeRectWithTexture(a.getContentSize()), this.setColor(this._realColor), this._textureLoaded = !0) : a.addEventListener("load", function () {
            this._clearRect();
            this._renderCmd._setTexture(a);
            this._changeRectWithTexture(a.getContentSize());
            this.setColor(this._realColor);
            this._textureLoaded = !0
        }, this)) : (cc.assert(a instanceof cc.Texture2D, cc._LogInfos.Sprite_setTexture_2), this._clearRect(), this._changeRectWithTexture(a.getContentSize()), this._renderCmd._setTexture(a))
    },
    _clearRect: function () {
        var a = this._texture;
        if (a) {
            var a = a._contentSize, b = this._rect;
            a.width === b.width && a.height === b.height && (b.width = b.height = 0)
        }
    },
    _changeRectWithTexture: function (a) {
        if (a && (a.width || a.height)) {
            var b = this.getTextureRect();
            b.height || b.width || (a.x = a.x || 0, a.y = a.y || 0, a.width = a.width || 0, a.height = a.height || 0, this.setTextureRect(a))
        }
    },
    _createRenderCmd: function () {
        return cc._renderType === cc._RENDER_TYPE_CANVAS ? new cc.Sprite.CanvasRenderCmd(this) : new cc.Sprite.WebGLRenderCmd(this)
    }
});
cc.Sprite.create = function (a, b, c) {
    return new cc.Sprite(a, b, c)
};
cc.Sprite.createWithTexture = cc.Sprite.create;
cc.Sprite.createWithSpriteFrameName = cc.Sprite.create;
cc.Sprite.createWithSpriteFrame = cc.Sprite.create;
cc.Sprite.INDEX_NOT_INITIALIZED = -1;
cc.EventHelper.prototype.apply(cc.Sprite.prototype);
cc.assert(cc.isFunction(cc._tmp.PrototypeSprite), cc._LogInfos.MissingFile, "SpritesPropertyDefine.js");
cc._tmp.PrototypeSprite();
delete cc._tmp.PrototypeSprite;
(function () {
    cc.Sprite.CanvasRenderCmd = function (a) {
        cc.Node.CanvasRenderCmd.call(this, a);
        this._needDraw = !0;
        this._textureCoord = {renderX: 0, renderY: 0, x: 0, y: 0, width: 0, height: 0, validRect: !1};
        this._blendFuncStr = "source-over";
        this._colorized = !1;
        this._originalTexture = null
    };
    var a = cc.Sprite.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    a.constructor = cc.Sprite.CanvasRenderCmd;
    a._init = function () {
    };
    a.setDirtyRecursively = function (a) {
    };
    a._resetForBatchNode = function () {
    };
    a._setTexture = function (a) {
        var c = this._node;
        c._texture !== a && (a ? (a.getHtmlElementObj()instanceof HTMLImageElement && (this._originalTexture = a), c._textureLoaded = a._textureLoaded) : c._textureLoaded = !1, c._texture = a)
    };
    a._setColorDirty = function () {
        this.setDirtyFlag(cc.Node._dirtyFlags.colorDirty | cc.Node._dirtyFlags.opacityDirty)
    };
    a.isFrameDisplayed = function (a) {
        var c = this._node;
        return a.getTexture() !== c._texture ? !1 : cc.rectEqualToRect(a.getRect(), c._rect)
    };
    a.updateBlendFunc = function (a) {
        this._blendFuncStr = cc.Node.CanvasRenderCmd._getCompositeOperationByBlendFunc(a)
    };
    a._setBatchNodeForAddChild = function (a) {
        return !0
    };
    a._handleTextureForRotatedTexture = function (a, c, d, e) {
        d && a.isLoaded() && (a = a.getHtmlElementObj(), a = cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas(a, c, e), e = new cc.Texture2D, e.initWithElement(a), e.handleLoadedTexture(), a = e, c.x = c.y = 0, this._node._rect = cc.rect(0, 0, c.width, c.height));
        return a
    };
    a._checkTextureBoundary = function (a, c, d) {
        a && a.url && (d = c.y + c.height, c.x + c.width > a.width && cc.error(cc._LogInfos.RectWidth, a.url), d > a.height && cc.error(cc._LogInfos.RectHeight, a.url));
        this._node._originalTexture = a
    };
    a.rendering = function (a, c, d) {
        var e = this._node, f = this._textureCoord, g = this._displayedOpacity / 255;
        if ((!e._texture || 0 !== f.width && 0 !== f.height && e._texture._textureLoaded) && 0 !== g) {
            a = a || cc._renderContext;
            var h = a.getContext(), k = e._offsetPosition.x, m = e._rect.height, n = e._rect.width, p = -e._offsetPosition.y - m;
            a.setTransform(this._worldTransform, c, d);
            a.setCompositeOperation(this._blendFuncStr);
            a.setGlobalAlpha(g);
            (e._flippedX || e._flippedY) && a.save();
            e._flippedX && (k = -k - n, h.scale(-1, 1));
            e._flippedY && (p = e._offsetPosition.y, h.scale(1, -1));
            e._texture ? (g = e._texture._htmlElementObj, "" !== e._texture._pattern ? (a.setFillStyle(h.createPattern(g, e._texture._pattern)), h.fillRect(k * c, p * d, n * c, m * d)) : this._colorized ? h.drawImage(g, 0, 0, f.width, f.height, k * c, p * d, n * c, m * d) : h.drawImage(g, f.renderX, f.renderY, f.width, f.height, k * c, p * d, n * c, m * d)) : (g = e._contentSize, f.validRect && (f = this._displayedColor, a.setFillStyle("rgba(" + f.r + "," + f.g + "," + f.b + ",1)"), h.fillRect(k * c, p * d, g.width * c, g.height * d)));
            (e._flippedX || e._flippedY) && a.restore();
            cc.g_NumberOfDraws++
        }
    };
    a._updateColor = cc.sys._supportCanvasNewBlendModes ? function () {
        var a = this._node, c = this._displayedColor;
        if (255 === c.r && 255 === c.g && 255 === c.b)this._colorized && (this._colorized = !1, a.texture = this._originalTexture); else {
            var d, e = a._texture, f = this._textureCoord;
            e && f.validRect && this._originalTexture && (d = e.getHtmlElementObj()) && (this._colorized = !0, d instanceof HTMLCanvasElement && !this._rectRotated && !this._newTextureWhenChangeColor && this._originalTexture._htmlElementObj !== d ? cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(this._originalTexture._htmlElementObj, c, f, d) : (d = cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(this._originalTexture._htmlElementObj, c, f), e = new cc.Texture2D, e.initWithElement(d), e.handleLoadedTexture(), a.texture = e))
        }
    } : function () {
        var a = this._node, c = this._displayedColor;
        if (255 === c.r && 255 === c.g && 255 === c.b)this._colorized && (this._colorized = !1, a.texture = this._originalTexture); else {
            var d, e = a._texture, f = this._textureCoord;
            e && f.validRect && this._originalTexture && (d = e.getHtmlElementObj()) && (e = cc.textureCache.getTextureColors(this._originalTexture.getHtmlElementObj())) && (this._colorized = !0, d instanceof HTMLCanvasElement && !this._rectRotated && !this._newTextureWhenChangeColor ? cc.Sprite.CanvasRenderCmd._generateTintImage(d, e, c, f, d) : (d = cc.Sprite.CanvasRenderCmd._generateTintImage(d, e, c, f), e = new cc.Texture2D, e.initWithElement(d), e.handleLoadedTexture(), a.texture = e))
        }
    };
    a.getQuad = function () {
        return null
    };
    a._updateForSetSpriteFrame = function (a, c) {
        var d = this._node;
        d._rectRotated && (d._originalTexture = a);
        this._colorized = !1;
        this._textureCoord.renderX = this._textureCoord.x;
        this._textureCoord.renderY = this._textureCoord.y;
        c && (d = d.getColor(), 255 === d.r && 255 === d.g && 255 === d.b || this._updateColor())
    };
    a.updateTransform = function () {
        var a = this._node;
        if (a.dirty) {
            var c = a._parent;
            !a._visible || c && c !== a._batchNode && c._shouldBeHidden ? a._shouldBeHidden = !0 : (a._shouldBeHidden = !1, a._transformToBatch = c && c !== a._batchNode ? cc.affineTransformConcat(this.getNodeToParentTransform(), c._transformToBatch) : this.getNodeToParentTransform());
            a._recursiveDirty = !1;
            a.dirty = !1
        }
        a._hasChildren && a._arrayMakeObjectsPerformSelector(a._children, cc.Node._stateCallbackType.updateTransform)
    };
    a._updateDisplayColor = function (a) {
        cc.Node.CanvasRenderCmd.prototype._updateDisplayColor.call(this, a)
    };
    a._spriteFrameLoadedCallback = function (a) {
        this.setTextureRect(a.getRect(), a.isRotated(), a.getOriginalSize());
        this._renderCmd._updateColor();
        this.dispatchEvent("load")
    };
    a._textureLoadedCallback = function (a) {
        if (!this._textureLoaded) {
            this._textureLoaded = !0;
            var c = this._rect, d = this._renderCmd;
            c ? cc._rectEqualToZero(c) && (c.width = a.width, c.height = a.height) : c = cc.rect(0, 0, a.width, a.height);
            this.texture = d._originalTexture = a;
            this.setTextureRect(c, this._rectRotated);
            a = d._displayedColor;
            255 === a.r && 255 === a.g && 255 === a.b || d._updateColor();
            this.setBatchNode(this._batchNode);
            this.dispatchEvent("load")
        }
    };
    a._setTextureCoords = function (a, c) {
        void 0 === c && (c = !0);
        var d = this._textureCoord, e = c ? cc.contentScaleFactor() : 1;
        d.renderX = d.x = 0 | a.x * e;
        d.renderY = d.y = 0 | a.y * e;
        d.width = 0 | a.width * e;
        d.height = 0 | a.height * e;
        d.validRect = !(0 === d.width || 0 === d.height || 0 > d.x || 0 > d.y);
        this._colorized && (this._node._texture = this._originalTexture, this._colorized = !1)
    };
    cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply = function (a, c, d, e) {
        e = e || cc.newElement("canvas");
        d = d || cc.rect(0, 0, a.width, a.height);
        var f = e.getContext("2d");
        e.width !== d.width || e.height !== d.height ? (e.width = d.width, e.height = d.height) : f.globalCompositeOperation = "source-over";
        f.fillStyle = "rgb(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b) + ")";
        f.fillRect(0, 0, d.width, d.height);
        f.globalCompositeOperation = "multiply";
        f.drawImage(a, d.x, d.y, d.width, d.height, 0, 0, d.width, d.height);
        f.globalCompositeOperation = "destination-atop";
        f.drawImage(a, d.x, d.y, d.width, d.height, 0, 0, d.width, d.height);
        return e
    };
    cc.Sprite.CanvasRenderCmd._generateTintImage = function (a, c, d, e, f) {
        e || (e = cc.rect(0, 0, a.width, a.height));
        a = d.r / 255;
        var g = d.g / 255;
        d = d.b / 255;
        var h = Math.min(e.width, c[0].width), k = Math.min(e.height, c[0].height), m;
        f ? (m = f.getContext("2d"), m.clearRect(0, 0, h, k)) : (f = cc.newElement("canvas"), f.width = h, f.height = k, m = f.getContext("2d"));
        m.save();
        m.globalCompositeOperation = "lighter";
        var n = m.globalAlpha;
        0 < a && (m.globalAlpha = a * n, m.drawImage(c[0], e.x, e.y, h, k, 0, 0, h, k));
        0 < g && (m.globalAlpha = g * n, m.drawImage(c[1], e.x, e.y, h, k, 0, 0, h, k));
        0 < d && (m.globalAlpha = d * n, m.drawImage(c[2], e.x, e.y, h, k, 0, 0, h, k));
        1 > a + g + d && (m.globalAlpha = n, m.drawImage(c[3], e.x, e.y, h, k, 0, 0, h, k));
        m.restore();
        return f
    };
    cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor = function (a) {
        function c() {
            var c = cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor, e = a.width, h = a.height;
            d[0].width = e;
            d[0].height = h;
            d[1].width = e;
            d[1].height = h;
            d[2].width = e;
            d[2].height = h;
            d[3].width = e;
            d[3].height = h;
            c.canvas.width = e;
            c.canvas.height = h;
            var k = c.canvas.getContext("2d");
            k.drawImage(a, 0, 0);
            c.tempCanvas.width = e;
            c.tempCanvas.height = h;
            for (var k = k.getImageData(0, 0, e, h).data, m = 0; 4 > m; m++) {
                var n = d[m].getContext("2d");
                n.getImageData(0, 0, e, h).data;
                c.tempCtx.drawImage(a, 0, 0);
                for (var p = c.tempCtx.getImageData(0, 0, e, h), s = p.data, r = 0; r < k.length; r += 4)s[r] = 0 === m ? k[r] : 0, s[r + 1] = 1 === m ? k[r + 1] : 0, s[r + 2] = 2 === m ? k[r + 2] : 0, s[r + 3] = k[r + 3];
                n.putImageData(p, 0, 0)
            }
            a.onload = null
        }

        if (a.channelCache)return a.channelCache;
        var d = [cc.newElement("canvas"), cc.newElement("canvas"), cc.newElement("canvas"), cc.newElement("canvas")];
        try {
            c()
        } catch (e) {
            a.onload = c
        }
        return a.channelCache = d
    };
    cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor.canvas = cc.newElement("canvas");
    cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor.tempCanvas = cc.newElement("canvas");
    cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor.tempCtx = cc.Sprite.CanvasRenderCmd._generateTextureCacheForColor.tempCanvas.getContext("2d");
    cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas = function (a, c, d) {
        if (!a)return null;
        if (!c)return a;
        d = null == d ? !0 : d;
        var e = cc.newElement("canvas");
        e.width = c.width;
        e.height = c.height;
        var f = e.getContext("2d");
        f.translate(e.width / 2, e.height / 2);
        d ? f.rotate(-1.5707963267948966) : f.rotate(1.5707963267948966);
        f.drawImage(a, c.x, c.y, c.height, c.width, -c.height / 2, -c.width / 2, c.height, c.width);
        return e
    }
})();
(function () {
    cc.Sprite.WebGLRenderCmd = function (a) {
        cc.Node.WebGLRenderCmd.call(this, a);
        this._needDraw = !0;
        this._quad = new cc.V3F_C4B_T2F_Quad;
        this._quadWebBuffer = cc._renderContext.createBuffer();
        this._quadDirty = !0;
        this._recursiveDirty = this._dirty = !1
    };
    var a = cc.Sprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    a.constructor = cc.Sprite.WebGLRenderCmd;
    a.updateBlendFunc = function (a) {
    };
    a.setDirtyFlag = function (a) {
        cc.Node.WebGLRenderCmd.prototype.setDirtyFlag.call(this, a);
        this._dirty = !0
    };
    a.setDirtyRecursively = function (a) {
        this._dirty = this._recursiveDirty = a;
        for (var c = this._node._children, d, e = c ? c.length : 0, f = 0; f < e; f++)d = c[f], d instanceof cc.Sprite && d._renderCmd.setDirtyRecursively(a)
    };
    a._setBatchNodeForAddChild = function (a) {
        var c = this._node;
        if (c._batchNode) {
            if (!(a instanceof cc.Sprite))return cc.log(cc._LogInfos.Sprite_addChild), !1;
            a.texture._webTextureObj !== c.textureAtlas.texture._webTextureObj && cc.log(cc._LogInfos.Sprite_addChild_2);
            c._batchNode.appendChild(a);
            c._reorderChildDirty || c._setReorderChildDirtyRecursively()
        }
        return !0
    };
    a._handleTextureForRotatedTexture = function (a) {
        return a
    };
    a.isFrameDisplayed = function (a) {
        var c = this._node;
        return cc.rectEqualToRect(a.getRect(), c._rect) && a.getTexture().getName() === c._texture.getName() && cc.pointEqualToPoint(a.getOffset(), c._unflippedOffsetPositionFromCenter)
    };
    a._init = function () {
        var a = {r: 255, g: 255, b: 255, a: 255}, c = this._quad;
        c.bl.colors = a;
        c.br.colors = a;
        c.tl.colors = a;
        c.tr.colors = a;
        this._quadDirty = !0
    };
    a._resetForBatchNode = function () {
        var a = this._node, c = a._offsetPosition.x, d = a._offsetPosition.y, e = c + a._rect.width, a = d + a._rect.height, f = this._quad;
        f.bl.vertices = {x: c, y: d, z: 0};
        f.br.vertices = {x: e, y: d, z: 0};
        f.tl.vertices = {x: c, y: a, z: 0};
        f.tr.vertices = {x: e, y: a, z: 0};
        this._quadDirty = !0
    };
    a.getQuad = function () {
        return this._quad
    };
    a._updateForSetSpriteFrame = function () {
    };
    a._spriteFrameLoadedCallback = function (a) {
        this.setTextureRect(a.getRect(), a.isRotated(), a.getOriginalSize());
        this.dispatchEvent("load")
    };
    a._textureLoadedCallback = function (a) {
        var c = this._renderCmd;
        if (!this._textureLoaded) {
            this._textureLoaded = !0;
            var d = this._rect;
            d ? cc._rectEqualToZero(d) && (d.width = a.width, d.height = a.height) : d = cc.rect(0, 0, a.width, a.height);
            this.texture = a;
            this.setTextureRect(d, this._rectRotated);
            this.setBatchNode(this._batchNode);
            c._quadDirty = !0;
            this.dispatchEvent("load")
        }
    };
    a._setTextureCoords = function (a, c) {
        void 0 === c && (c = !0);
        c && (a = cc.rectPointsToPixels(a));
        var d = this._node, e = d._batchNode ? d.textureAtlas.texture : d._texture;
        if (e) {
            var f = e.pixelsWidth, g = e.pixelsHeight, h, k, m = this._quad;
            d._rectRotated ? (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (e = (2 * a.x + 1) / (2 * f), f = e + (2 * a.height - 2) / (2 * f), h = (2 * a.y + 1) / (2 * g), g = h + (2 * a.width - 2) / (2 * g)) : (e = a.x / f, f = (a.x + a.height) / f, h = a.y / g, g = (a.y + a.width) / g), d._flippedX && (k = h, h = g, g = k), d._flippedY && (k = e, e = f, f = k), m.bl.texCoords.u = e, m.bl.texCoords.v = h, m.br.texCoords.u = e, m.br.texCoords.v = g, m.tl.texCoords.u = f, m.tl.texCoords.v = h, m.tr.texCoords.u = f, m.tr.texCoords.v = g) : (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (e = (2 * a.x + 1) / (2 * f), f = e + (2 * a.width - 2) / (2 * f), h = (2 * a.y + 1) / (2 * g), g = h + (2 * a.height - 2) / (2 * g)) : (e = a.x / f, f = (a.x + a.width) / f, h = a.y / g, g = (a.y + a.height) / g), d._flippedX && (k = e, e = f, f = k), d._flippedY && (k = h, h = g, g = k), m.bl.texCoords.u = e, m.bl.texCoords.v = g, m.br.texCoords.u = f, m.br.texCoords.v = g, m.tl.texCoords.u = e, m.tl.texCoords.v = h, m.tr.texCoords.u = f, m.tr.texCoords.v = h);
            this._quadDirty = !0
        }
    };
    a.transform = function (a, c) {
        cc.Node.WebGLRenderCmd.prototype.transform.call(this, a, c);
        this._dirty = !0
    };
    a._setColorDirty = function () {
    };
    a._updateColor = function () {
        var a = this._displayedColor, c = this._displayedOpacity, d = this._node, a = {r: a.r, g: a.g, b: a.b, a: c};
        d._opacityModifyRGB && (a.r *= c / 255, a.g *= c / 255, a.b *= c / 255);
        c = this._quad;
        c.bl.colors = a;
        c.br.colors = a;
        c.tl.colors = a;
        c.tr.colors = a;
        d._batchNode && (d.atlasIndex !== cc.Sprite.INDEX_NOT_INITIALIZED ? d.textureAtlas.updateQuad(c, d.atlasIndex) : this._dirty = !0);
        this._quadDirty = !0
    };
    a._updateBlendFunc = function () {
        if (this._batchNode)cc.log(cc._LogInfos.Sprite__updateBlendFunc); else {
            var a = this._node;
            a._texture && a._texture.hasPremultipliedAlpha() ? (a._blendFunc.src = cc.BLEND_SRC, a._blendFunc.dst = cc.BLEND_DST, a.opacityModifyRGB = !0) : (a._blendFunc.src = cc.SRC_ALPHA, a._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA, a.opacityModifyRGB = !1)
        }
    };
    a._setTexture = function (a) {
        var c = this._node;
        if (c._batchNode) {
            if (c._batchNode.texture !== a) {
                cc.log(cc._LogInfos.Sprite_setTexture);
                return
            }
        } else c._texture !== a && (c._textureLoaded = a ? a._textureLoaded : !1, c._texture = a, this._updateBlendFunc());
        this._shaderProgram = a ? cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR) : cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR)
    };
    a.updateTransform = function () {
        var a = this._node;
        if (this._dirty) {
            var c = this._quad, d = a._parent;
            if (!a._visible || d && d !== a._batchNode && d._shouldBeHidden)c.br.vertices = c.tl.vertices = c.tr.vertices = c.bl.vertices = {
                x: 0,
                y: 0,
                z: 0
            }, a._shouldBeHidden = !0; else {
                a._shouldBeHidden = !1;
                0 !== this._dirtyFlag && (this.updateStatus(), this._dirtyFlag = 0);
                a._transformToBatch = d && d !== a._batchNode ? cc.affineTransformConcat(this.getNodeToParentTransform(), d._transformToBatch) : this.getNodeToParentTransform();
                var e = a._transformToBatch, f = a._rect, d = a._offsetPosition.x, g = a._offsetPosition.y, h = d + f.width, k = g + f.height, m = e.tx, n = e.ty, p = e.a, s = e.b, r = e.d, u = -e.c, e = d * p - g * u + m, f = d * s + g * r + n, t = h * p - g * u + m, g = h * s + g * r + n, v = h * p - k * u + m, h = h * s + k * r + n, m = d * p - k * u + m, d = d * s + k * r + n, k = a._vertexZ;
                cc.SPRITEBATCHNODE_RENDER_SUBPIXEL || (e |= 0, f |= 0, t |= 0, g |= 0, v |= 0, h |= 0, m |= 0, d |= 0);
                c.bl.vertices = {x: e, y: f, z: k};
                c.br.vertices = {x: t, y: g, z: k};
                c.tl.vertices = {x: m, y: d, z: k};
                c.tr.vertices = {x: v, y: h, z: k}
            }
            a.textureAtlas.updateQuad(c, a.atlasIndex);
            this._dirty = a._recursiveDirty = !1
        }
        a._hasChildren && a._arrayMakeObjectsPerformSelector(a._children, cc.Node._stateCallbackType.updateTransform)
    };
    a._checkTextureBoundary = function (a, c, d) {
        a && a.url && (d ? (d = c.x + c.height, c = c.y + c.width) : (d = c.x + c.width, c = c.y + c.height), d > a.width && cc.error(cc._LogInfos.RectWidth, a.url), c > a.height && cc.error(cc._LogInfos.RectHeight, a.url))
    };
    a.rendering = function (a) {
        var c = this._node, d = c._texture;
        d && !d._textureLoaded || 0 === this._displayedOpacity || (a = a || cc._renderContext, d ? d._textureLoaded && (this._shaderProgram.use(), this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix), cc.glBlendFunc(c._blendFunc.src, c._blendFunc.dst), cc.glBindTexture2DN(0, d), cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX), a.bindBuffer(a.ARRAY_BUFFER, this._quadWebBuffer), this._quadDirty && (a.bufferData(a.ARRAY_BUFFER, this._quad.arrayBuffer, a.DYNAMIC_DRAW), this._quadDirty = !1), a.vertexAttribPointer(0, 3, a.FLOAT, !1, 24, 0), a.vertexAttribPointer(1, 4, a.UNSIGNED_BYTE, !0, 24, 12), a.vertexAttribPointer(2, 2, a.FLOAT, !1, 24, 16), a.drawArrays(a.TRIANGLE_STRIP, 0, 4)) : (this._shaderProgram.use(), this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix), cc.glBlendFunc(c._blendFunc.src, c._blendFunc.dst), cc.glBindTexture2D(null), cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR), a.bindBuffer(a.ARRAY_BUFFER, this._quadWebBuffer), this._quadDirty && (a.bufferData(a.ARRAY_BUFFER, this._quad.arrayBuffer, a.STATIC_DRAW), this._quadDirty = !1), a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, a.FLOAT, !1, 24, 0), a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, 24, 12), a.drawArrays(a.TRIANGLE_STRIP, 0, 4)), cc.g_NumberOfDraws++, 0 === cc.SPRITE_DEBUG_DRAW && !c._showNode) || (cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW), cc.current_stack.stack.push(cc.current_stack.top), cc.current_stack.top = this._stackMatrix, 1 === cc.SPRITE_DEBUG_DRAW || c._showNode ? (c = this._quad, c = [cc.p(c.tl.vertices.x, c.tl.vertices.y), cc.p(c.bl.vertices.x, c.bl.vertices.y), cc.p(c.br.vertices.x, c.br.vertices.y), cc.p(c.tr.vertices.x, c.tr.vertices.y)], cc._drawingUtil.drawPoly(c, 4, !0)) : 2 === cc.SPRITE_DEBUG_DRAW && (d = c.getTextureRect(), c = c.getOffsetPosition(), c = [cc.p(c.x, c.y), cc.p(c.x +
            d.width, c.y), cc.p(c.x + d.width, c.y + d.height), cc.p(c.x, c.y + d.height)], cc._drawingUtil.drawPoly(c, 4, !0)), cc.current_stack.top = cc.current_stack.stack.pop())
    }
})();
cc.SpriteBatchNode = cc.Node.extend({
    _blendFunc: null, _descendants: null, _className: "SpriteBatchNode", ctor: function (a, b) {
        cc.Node.prototype.ctor.call(this);
        this._descendants = [];
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        var c;
        b = b || cc.SpriteBatchNode.DEFAULT_CAPACITY;
        cc.isString(a) ? (c = cc.textureCache.getTextureForKey(a)) || (c = cc.textureCache.addImage(a)) : a instanceof cc.Texture2D && (c = a);
        c && this.initWithTexture(c, b)
    }, addSpriteWithoutQuad: function (a, b, c) {
        cc.assert(a, cc._LogInfos.SpriteBatchNode_addSpriteWithoutQuad_2);
        if (!(a instanceof cc.Sprite))return cc.log(cc._LogInfos.SpriteBatchNode_addSpriteWithoutQuad), null;
        a.atlasIndex = b;
        var d = 0, e, f = this._descendants;
        if (f && 0 < f.length)
            for (d = 0, e = f.length; d < e; d++) {
                var g = f[d];
                if (g && g.atlasIndex >= b)break
            }
        f.splice(d, 0, a);
        cc.Node.prototype.addChild.call(this, a, b, c);
        this.reorderBatch(!1);
        return this
    }, getTextureAtlas: function () {
        return this._renderCmd.getTextureAtlas()
    }, setTextureAtlas: function (a) {
        this._renderCmd.getTextureAtlas(a)
    }, getDescendants: function () {
        return this._descendants
    }, initWithFile: function (a, b) {
        var c = cc.textureCache.getTextureForKey(a);
        c || (c = cc.textureCache.addImage(a));
        return this.initWithTexture(c, b)
    }, _setNodeDirtyForCache: function () {
        this._renderCmd && this._renderCmd._setNodeDirtyForCache && this._renderCmd._setNodeDirtyForCache()
    }, init: function (a, b) {
        var c = cc.textureCache.getTextureForKey(a);
        c || (c = cc.textureCache.addImage(a));
        return this.initWithTexture(c, b)
    }, increaseAtlasCapacity: function () {
        this._renderCmd.increaseAtlasCapacity()
    }, removeChildAtIndex: function (a, b) {
        this.removeChild(this._children[a], b)
    }, rebuildIndexInOrder: function (a, b) {
        var c = a.children;
        if (c && 0 < c.length)
            for (var d = 0; d < c.length; d++) {
                var e = c[d];
                e && 0 > e.zIndex && (b = this.rebuildIndexInOrder(e, b))
            }
        !a === this && (a.atlasIndex = b, b++);
        if (c && 0 < c.length)
            for (d = 0; d < c.length; d++)(e = c[d]) && 0 <= e.zIndex && (b = this.rebuildIndexInOrder(e, b));
        return b
    }, highestAtlasIndexInChild: function (a) {
        var b = a.children;
        return b && 0 !== b.length ? this.highestAtlasIndexInChild(b[b.length - 1]) : a.atlasIndex
    }, lowestAtlasIndexInChild: function (a) {
        var b = a.children;
        return b && 0 !== b.length ? this.lowestAtlasIndexInChild(b[b.length - 1]) : a.atlasIndex
    }, atlasIndexForChild: function (a, b) {
        var c = a.parent, d = c.children, e = d.indexOf(a), f = null;
        0 < e && e < cc.UINT_MAX && (f = d[e - 1]);
        return c === this ? 0 === e ? 0 : this.highestAtlasIndexInChild(f) + 1 : 0 === e ? 0 > b ? c.atlasIndex : c.atlasIndex + 1 : 0 > f.zIndex && 0 > b || 0 <= f.zIndex && 0 <= b ? this.highestAtlasIndexInChild(f) + 1 : c.atlasIndex + 1
    }, reorderBatch: function (a) {
        this._reorderChildDirty = a
    }, setBlendFunc: function (a, b) {
        this._blendFunc = void 0 === b ? a : {src: a, dst: b}
    }, getBlendFunc: function () {
        return new cc.BlendFunc(this._blendFunc.src, this._blendFunc.dst)
    }, reorderChild: function (a, b) {
        cc.assert(a, cc._LogInfos.SpriteBatchNode_reorderChild_2);
        -1 === this._children.indexOf(a) ? cc.log(cc._LogInfos.SpriteBatchNode_reorderChild) : b !== a.zIndex && cc.Node.prototype.reorderChild.call(this, a, b)
    }, removeChild: function (a, b) {
        null != a && (-1 === this._children.indexOf(a) ? cc.log(cc._LogInfos.SpriteBatchNode_removeChild) : (this.removeSpriteFromAtlas(a), cc.Node.prototype.removeChild.call(this, a, b)))
    }, updateQuadFromSprite: function (a, b) {
        cc.assert(a, cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite_2);
        a instanceof cc.Sprite ? (this._renderCmd.checkAtlasCapacity(), a.batchNode = this, a.atlasIndex = b, a.dirty = !0, a.updateTransform()) : cc.log(cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite)
    }, insertQuadFromSprite: function (a, b) {
        cc.assert(a, cc._LogInfos.CCSpriteBatchNode_insertQuadFromSprite_2);
        a instanceof cc.Sprite ? (this._renderCmd.insertQuad(a, b), a.batchNode = this, a.atlasIndex = b, a.dirty = !0, a.updateTransform(), this._renderCmd.cutting(a, b)) : cc.log(cc._LogInfos.CCSpriteBatchNode_insertQuadFromSprite)
    }, initWithTexture: function (a, b) {
        this._children.length = 0;
        this._descendants.length = 0;
        b = b || cc.SpriteBatchNode.DEFAULT_CAPACITY;
        this._renderCmd.initWithTexture(a, b);
        return !0
    }, insertChild: function (a, b) {
        a.batchNode = this;
        a.atlasIndex = b;
        a.dirty = !0;
        this._renderCmd.insertQuad(a, b);
        this._descendants.splice(b, 0, a);
        var c = b + 1, d = this._descendants;
        if (d && 0 < d.length)
            for (; c < d.length; c++)d[c].atlasIndex++;
        var d = a.children, e, f;
        if (d)
            for (c = 0, f = d.length || 0; c < f; c++)
                if (e = d[c]) {
                    var g = this.atlasIndexForChild(e, e.zIndex);
                    this.insertChild(e, g)
                }
    }, appendChild: function (a) {
        this._reorderChildDirty = !0;
        a.batchNode = this;
        a.dirty = !0;
        this._descendants.push(a);
        var b = this._descendants.length - 1;
        a.atlasIndex = b;
        this._renderCmd.insertQuad(a, b);
        a = a.children;
        for (var b = 0, c = a.length || 0; b < c; b++)this.appendChild(a[b])
    }, removeSpriteFromAtlas: function (a) {
        this._renderCmd.removeQuadAtIndex(a.atlasIndex);
        a.batchNode = null;
        var b = this._descendants, c = b.indexOf(a);
        if (-1 !== c) {
            b.splice(c, 1);
            for (var d = b.length; c < d; ++c)b[c].atlasIndex--
        }
        if (a = a.children)
            for (b = 0, c = a.length || 0; b < c; b++)a[b] && this.removeSpriteFromAtlas(a[b])
    }, getTexture: function () {
        return this._renderCmd.getTexture()
    }, setTexture: function (a) {
        this._renderCmd.setTexture(a)
    }, addChild: function (a, b, c) {
        cc.assert(null != a, cc._LogInfos.CCSpriteBatchNode_addChild_3);
        this._renderCmd.isValidChild(a) && (b = null == b ? a.zIndex : b, c = null == c ? a.tag : c, cc.Node.prototype.addChild.call(this, a, b, c), this.appendChild(a))
    }, removeAllChildren: function (a) {
        var b = this._descendants;
        if (b && 0 < b.length)
            for (var c = 0, d = b.length; c < d; c++)b[c] && (b[c].batchNode = null);
        cc.Node.prototype.removeAllChildren.call(this, a);
        this._descendants.length = 0;
        this._renderCmd.removeAllQuads()
    }, sortAllChildren: function () {
        if (this._reorderChildDirty) {
            var a = this._children, b, c = 0, d = a.length, e;
            for (b = 1; b < d; b++) {
                var f = a[b], c = b - 1;
                for (e = a[c]; 0 <= c && (f._localZOrder < e._localZOrder || f._localZOrder === e._localZOrder && f.arrivalOrder < e.arrivalOrder);)a[c + 1] = e, c -= 1, e = a[c];
                a[c + 1] = f
            }
            0 < a.length && (this._arrayMakeObjectsPerformSelector(a, cc.Node._stateCallbackType.sortAllChildren), this._renderCmd.updateChildrenAtlasIndex(a));
            this._reorderChildDirty = !1
        }
    }, _createRenderCmd: function () {
        return cc._renderType === cc._RENDER_TYPE_CANVAS ? new cc.SpriteBatchNode.CanvasRenderCmd(this) : new cc.SpriteBatchNode.WebGLRenderCmd(this)
    }
});
_p = cc.SpriteBatchNode.prototype;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.defineGetterSetter(_p, "textureAtlas", _p.getTextureAtlas, _p.setTextureAtlas);
cc.defineGetterSetter(_p, "descendants", _p.getDescendants);
cc.SpriteBatchNode.DEFAULT_CAPACITY = 29;
cc.SpriteBatchNode.create = function (a, b) {
    return new cc.SpriteBatchNode(a, b)
};
cc.SpriteBatchNode.createWithTexture = cc.SpriteBatchNode.create;
(function () {
    cc.SpriteBatchNode.CanvasRenderCmd = function (a) {
        cc.Node.CanvasRenderCmd.call(this, a);
        this._originalTexture = this._texture = null
    };
    var a = cc.SpriteBatchNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    a.constructor = cc.SpriteBatchNode.CanvasRenderCmd;
    a.checkAtlasCapacity = function () {
    };
    a.isValidChild = function (a) {
        return a instanceof cc.Sprite ? !0 : (cc.log(cc._LogInfos.Sprite_addChild_4), !1)
    };
    a.initWithTexture = function (a, c) {
        this._texture = this._originalTexture = a
    };
    a.insertQuad = function (a, c) {
    };
    a.increaseAtlasCapacity = function () {
    };
    a.removeQuadAtIndex = function () {
    };
    a.removeAllQuads = function () {
    };
    a.getTexture = function () {
        return this._texture
    };
    a.setTexture = function (a) {
        this._texture = a;
        for (var c = this._node._children, d = 0; d < c.length; d++)c[d].setTexture(a)
    };
    a.updateChildrenAtlasIndex = function (a) {
        for (var c = this._node._descendants.length = 0, d = a.length; c < d; c++)this._updateAtlasIndex(a[c])
    };
    a._updateAtlasIndex = function (a) {
        var c = this._node._descendants, d = a.children, e, f = d.length;
        for (e = 0; e < f; e++)
            if (0 > d[e]._localZOrder)c.push(d[e]); else break;
        for (c.push(a); e < f; e++)c.push(d[e])
    };
    a.getTextureAtlas = function () {
    };
    a.setTextureAtlas = function (a) {
    };
    a.cutting = function (a, c) {
        this._node._children.splice(c, 0, a)
    }
})();
(function () {
    cc.SpriteBatchNode.WebGLRenderCmd = function (a) {
        cc.Node.WebGLRenderCmd.call(this, a);
        this._needDraw = !0;
        this._textureAtlas = null
    };
    var a = cc.SpriteBatchNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    a.constructor = cc.SpriteBatchNode.WebGLRenderCmd;
    a.isValidChild = function (a) {
        return a instanceof cc.Sprite ? a.texture != this.getTexture() ? (cc.log(cc._LogInfos.Sprite_addChild_5), !1) : !0 : (cc.log(cc._LogInfos.Sprite_addChild_4), !1)
    };
    a.rendering = function () {
        var a = this._node;
        0 !== this._textureAtlas.totalQuads && (this._shaderProgram.use(), this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix), a._arrayMakeObjectsPerformSelector(a._children, cc.Node._stateCallbackType.updateTransform), cc.glBlendFunc(a._blendFunc.src, a._blendFunc.dst), this._textureAtlas.drawQuads())
    };
    a.visit = function (a) {
        var c = this._node;
        if (c._visible) {
            c._parent && c._parent._renderCmd && (this._curLevel = c._parent._renderCmd._curLevel + 1);
            var d = cc.current_stack;
            d.stack.push(d.top);
            this._dirtyFlag & cc.Node._dirtyFlags.transformDirty || this.transform(a);
            this.updateStatus(a);
            d.top = this._stackMatrix;
            c.sortAllChildren();
            cc.renderer.pushRenderCommand(this);
            this._dirtyFlag = 0;
            d.top = d.stack.pop()
        }
    };
    a.checkAtlasCapacity = function (a) {
        for (var c = this._textureAtlas; a >= c.capacity || c.capacity === c.totalQuads;)this.increaseAtlasCapacity()
    };
    a.increaseAtlasCapacity = function () {
        var a = this._textureAtlas.capacity, c = Math.floor(4 * (a + 1) / 3);
        cc.log(cc._LogInfos.SpriteBatchNode_increaseAtlasCapacity, a, c);
        this._textureAtlas.resizeCapacity(c) || cc.log(cc._LogInfos.SpriteBatchNode_increaseAtlasCapacity_2)
    };
    a.initWithTexture = function (a, c) {
        this._textureAtlas = new cc.TextureAtlas;
        this._textureAtlas.initWithTexture(a, c);
        this._updateBlendFunc();
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR)
    };
    a.insertQuad = function (a, c) {
        var d = this._textureAtlas;
        d.totalQuads >= d.capacity && this.increaseAtlasCapacity();
        d.insertQuad(a.quad, c)
    };
    a.removeQuadAtIndex = function (a) {
        this._textureAtlas.removeQuadAtIndex(a)
    };
    a.getTexture = function () {
        return this._textureAtlas.texture
    };
    a.setTexture = function (a) {
        this._textureAtlas.setTexture(a);
        a && this._updateBlendFunc()
    };
    a.removeAllQuads = function () {
        this._textureAtlas.removeAllQuads()
    };
    a._swap = function (a, c) {
        var d = this._node._descendants, e = this._textureAtlas, f = e.quads, g = d[a], h = cc.V3F_C4B_T2F_QuadCopy(f[a]);
        d[c].atlasIndex = a;
        d[a] = d[c];
        e.updateQuad(f[c], a);
        d[c] = g;
        e.updateQuad(h, c)
    };
    a._updateAtlasIndex = function (a, c) {
        var d = 0, e = a.children;
        e && (d = e.length);
        var f = 0;
        if (0 === d)f = a.atlasIndex, a.atlasIndex = c, a.arrivalOrder = 0, f !== c && this._swap(f, c), c++; else {
            f = !0;
            0 <= e[0].zIndex && (f = a.atlasIndex, a.atlasIndex = c, a.arrivalOrder = 0, f !== c && this._swap(f, c), c++, f = !1);
            for (d = 0; d < e.length; d++) {
                var g = e[d];
                f && 0 <= g.zIndex && (f = a.atlasIndex, a.atlasIndex = c, a.arrivalOrder = 0, f !== c && this._swap(f, c), c++, f = !1);
                c = this._updateAtlasIndex(g, c)
            }
            f && (f = a.atlasIndex, a.atlasIndex = c, a.arrivalOrder = 0, f !== c && this._swap(f, c), c++)
        }
        return c
    };
    a.updateChildrenAtlasIndex = function (a) {
        for (var c = 0, d = 0; d < a.length; d++)c = this._updateAtlasIndex(a[d], c)
    };
    a._updateBlendFunc = function () {
        if (!this._textureAtlas.texture.hasPremultipliedAlpha()) {
            var a = this._node._blendFunc;
            a.src = cc.SRC_ALPHA;
            a.dst = cc.ONE_MINUS_SRC_ALPHA
        }
    };
    a.getTextureAtlas = function () {
        return this._textureAtlas
    };
    a.setTextureAtlas = function (a) {
        a !== this._textureAtlas && (this._textureAtlas = a)
    };
    a.cutting = function () {
    }
})();
cc.BakeSprite = cc.Sprite.extend({
    _cacheCanvas: null, _cacheContext: null, ctor: function () {
        cc.Sprite.prototype.ctor.call(this);
        var a = document.createElement("canvas");
        a.width = a.height = 10;
        this._cacheCanvas = a;
        this._cacheContext = new cc.CanvasContextWrapper(a.getContext("2d"));
        var b = new cc.Texture2D;
        b.initWithElement(a);
        b.handleLoadedTexture();
        this.setTexture(b)
    }, getCacheContext: function () {
        return this._cacheContext
    }, getCacheCanvas: function () {
        return this._cacheCanvas
    }, resetCanvasSize: function (a, b) {
        void 0 === b && (b = a.height, a = a.width);
        var c = this._cacheCanvas;
        c.width = a;
        c.height = b;
        this.getTexture().handleLoadedTexture();
        this.setTextureRect(cc.rect(0, 0, a, b), !1)
    }
});
cc.AnimationFrame = cc.Class.extend({
    _spriteFrame: null, _delayPerUnit: 0, _userInfo: null, ctor: function (a, b, c) {
        this._spriteFrame = a || null;
        this._delayPerUnit = b || 0;
        this._userInfo = c || null
    }, clone: function () {
        var a = new cc.AnimationFrame;
        a.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
        return a
    }, copyWithZone: function (a) {
        return cc.clone(this)
    }, copy: function (a) {
        a = new cc.AnimationFrame;
        a.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
        return a
    }, initWithSpriteFrame: function (a, b, c) {
        this._spriteFrame = a;
        this._delayPerUnit = b;
        this._userInfo = c;
        return !0
    }, getSpriteFrame: function () {
        return this._spriteFrame
    }, setSpriteFrame: function (a) {
        this._spriteFrame = a
    }, getDelayUnits: function () {
        return this._delayPerUnit
    }, setDelayUnits: function (a) {
        this._delayPerUnit = a
    }, getUserInfo: function () {
        return this._userInfo
    }, setUserInfo: function (a) {
        this._userInfo = a
    }
});
cc.AnimationFrame.create = function (a, b, c) {
    return new cc.AnimationFrame(a, b, c)
};
cc.Animation = cc.Class.extend({
    _frames: null,
    _loops: 0,
    _restoreOriginalFrame: !1,
    _duration: 0,
    _delayPerUnit: 0,
    _totalDelayUnits: 0,
    ctor: function (a, b, c) {
        this._frames = [];
        if (void 0 === a)this.initWithSpriteFrames(null, 0); else {
            var d = a[0];
            d && (d instanceof cc.SpriteFrame ? this.initWithSpriteFrames(a, b, c) : d instanceof cc.AnimationFrame && this.initWithAnimationFrames(a, b, c))
        }
    },
    getFrames: function () {
        return this._frames
    },
    setFrames: function (a) {
        this._frames = a
    },
    addSpriteFrame: function (a) {
        var b = new cc.AnimationFrame;
        b.initWithSpriteFrame(a, 1, null);
        this._frames.push(b);
        this._totalDelayUnits++
    },
    addSpriteFrameWithFile: function (a) {
        a = cc.textureCache.addImage(a);
        var b = cc.rect(0, 0, 0, 0);
        b.width = a.width;
        b.height = a.height;
        a = new cc.SpriteFrame(a, b);
        this.addSpriteFrame(a)
    },
    addSpriteFrameWithTexture: function (a, b) {
        var c = new cc.SpriteFrame(a, b);
        this.addSpriteFrame(c)
    },
    initWithAnimationFrames: function (a, b, c) {
        cc.arrayVerifyType(a, cc.AnimationFrame);
        this._delayPerUnit = b;
        this._loops = void 0 === c ? 1 : c;
        this._totalDelayUnits = 0;
        b = this._frames;
        for (c = b.length = 0; c < a.length; c++) {
            var d = a[c];
            b.push(d);
            this._totalDelayUnits += d.getDelayUnits()
        }
        return !0
    },
    clone: function () {
        var a = new cc.Animation;
        a.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
        a.setRestoreOriginalFrame(this._restoreOriginalFrame);
        return a
    },
    copyWithZone: function (a) {
        a = new cc.Animation;
        a.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
        a.setRestoreOriginalFrame(this._restoreOriginalFrame);
        return a
    },
    _copyFrames: function () {
        for (var a = [], b = 0; b < this._frames.length; b++)a.push(this._frames[b].clone());
        return a
    },
    copy: function (a) {
        return this.copyWithZone(null)
    },
    getLoops: function () {
        return this._loops
    },
    setLoops: function (a) {
        this._loops = a
    },
    setRestoreOriginalFrame: function (a) {
        this._restoreOriginalFrame = a
    },
    getRestoreOriginalFrame: function () {
        return this._restoreOriginalFrame
    },
    getDuration: function () {
        return this._totalDelayUnits * this._delayPerUnit
    },
    getDelayPerUnit: function () {
        return this._delayPerUnit
    },
    setDelayPerUnit: function (a) {
        this._delayPerUnit = a
    },
    getTotalDelayUnits: function () {
        return this._totalDelayUnits
    },
    initWithSpriteFrames: function (a, b, c) {
        cc.arrayVerifyType(a, cc.SpriteFrame);
        this._loops = void 0 === c ? 1 : c;
        this._delayPerUnit = b || 0;
        this._totalDelayUnits = 0;
        b = this._frames;
        b.length = 0;
        if (a) {
            for (c = 0; c < a.length; c++) {
                var d = a[c], e = new cc.AnimationFrame;
                e.initWithSpriteFrame(d, 1, null);
                b.push(e)
            }
            this._totalDelayUnits += a.length
        }
        return !0
    },
    retain: function () {
    },
    release: function () {
    }
});
cc.Animation.create = function (a, b, c) {
    return new cc.Animation(a, b, c)
};
cc.Animation.createWithAnimationFrames = cc.Animation.create;
cc.animationCache = {
    _animations: {}, addAnimation: function (a, b) {
        this._animations[b] = a
    }, removeAnimation: function (a) {
        a && this._animations[a] && delete this._animations[a]
    }, getAnimation: function (a) {
        return this._animations[a] ? this._animations[a] : null
    }, _addAnimationsWithDictionary: function (a, b) {
        var c = a.animations;
        if (c) {
            var d = 1, e = a.properties;
            if (e)
                for (var d = null != e.format ? parseInt(e.format) : d, e = e.spritesheets, f = cc.spriteFrameCache, g = cc.path, h = 0; h < e.length; h++)f.addSpriteFrames(g.changeBasename(b, e[h]));
            switch (d) {
                case 1:
                    this._parseVersion1(c);
                    break;
                case 2:
                    this._parseVersion2(c);
                    break;
                default:
                    cc.log(cc._LogInfos.animationCache__addAnimationsWithDictionary_2)
            }
        } else cc.log(cc._LogInfos.animationCache__addAnimationsWithDictionary)
    }, addAnimations: function (a) {
        cc.assert(a, cc._LogInfos.animationCache_addAnimations_2);
        var b = cc.loader.getRes(a);
        b ? this._addAnimationsWithDictionary(b, a) : cc.log(cc._LogInfos.animationCache_addAnimations)
    }, _parseVersion1: function (a) {
        var b = cc.spriteFrameCache, c;
        for (c in a) {
            var d = a[c], e = d.frames, d = parseFloat(d.delay) || 0, f = null;
            if (e) {
                for (var f = [], g = 0; g < e.length; g++) {
                    var h = b.getSpriteFrame(e[g]);
                    if (h) {
                        var k = new cc.AnimationFrame;
                        k.initWithSpriteFrame(h, 1, null);
                        f.push(k)
                    } else cc.log(cc._LogInfos.animationCache__parseVersion1_2, c, e[g])
                }
                0 === f.length ? cc.log(cc._LogInfos.animationCache__parseVersion1_3, c) : (f.length !== e.length && cc.log(cc._LogInfos.animationCache__parseVersion1_4, c), f = new cc.Animation(f, d, 1), cc.animationCache.addAnimation(f, c))
            } else cc.log(cc._LogInfos.animationCache__parseVersion1, c)
        }
    }, _parseVersion2: function (a) {
        var b = cc.spriteFrameCache, c;
        for (c in a) {
            var d = a[c], e = d.loop, f = parseInt(d.loops), e = e ? cc.REPEAT_FOREVER : isNaN(f) ? 1 : f, f = d.restoreOriginalFrame && !0 == d.restoreOriginalFrame ? !0 : !1, g = d.frames;
            if (g) {
                for (var h = [], k = 0; k < g.length; k++) {
                    var m = g[k], n = m.spriteframe, p = b.getSpriteFrame(n);
                    if (p) {
                        var n = parseFloat(m.delayUnits) || 0, m = m.notification, s = new cc.AnimationFrame;
                        s.initWithSpriteFrame(p, n, m);
                        h.push(s)
                    } else cc.log(cc._LogInfos.animationCache__parseVersion2_2, c, n)
                }
                d = parseFloat(d.delayPerUnit) || 0;
                g = new cc.Animation;
                g.initWithAnimationFrames(h, d, e);
                g.setRestoreOriginalFrame(f);
                cc.animationCache.addAnimation(g, c)
            } else cc.log(cc._LogInfos.animationCache__parseVersion2, c)
        }
    }, _clear: function () {
        this._animations = {}
    }
};
cc.SpriteFrame = cc.Class.extend({
    _offset: null,
    _originalSize: null,
    _rectInPixels: null,
    _rotated: !1,
    _rect: null,
    _offsetInPixels: null,
    _originalSizeInPixels: null,
    _texture: null,
    _textureFilename: "",
    _textureLoaded: !1,
    ctor: function (a, b, c, d, e) {
        this._offset = cc.p(0, 0);
        this._offsetInPixels = cc.p(0, 0);
        this._originalSize = cc.size(0, 0);
        this._rotated = !1;
        this._originalSizeInPixels = cc.size(0, 0);
        this._textureFilename = "";
        this._texture = null;
        this._textureLoaded = !1;
        void 0 !== a && void 0 !== b && (void 0 === c || void 0 === d || void 0 === e ? this.initWithTexture(a, b) : this.initWithTexture(a, b, c, d, e))
    },
    textureLoaded: function () {
        return this._textureLoaded
    },
    addLoadedEventListener: function (a, b) {
        this.addEventListener("load", a, b)
    },
    getRectInPixels: function () {
        var a = this._rectInPixels;
        return cc.rect(a.x, a.y, a.width, a.height)
    },
    setRectInPixels: function (a) {
        this._rectInPixels || (this._rectInPixels = cc.rect(0, 0, 0, 0));
        this._rectInPixels.x = a.x;
        this._rectInPixels.y = a.y;
        this._rectInPixels.width = a.width;
        this._rectInPixels.height = a.height;
        this._rect = cc.rectPixelsToPoints(a)
    },
    isRotated: function () {
        return this._rotated
    },
    setRotated: function (a) {
        this._rotated = a
    },
    getRect: function () {
        var a = this._rect;
        return cc.rect(a.x, a.y, a.width, a.height)
    },
    setRect: function (a) {
        this._rect || (this._rect = cc.rect(0, 0, 0, 0));
        this._rect.x = a.x;
        this._rect.y = a.y;
        this._rect.width = a.width;
        this._rect.height = a.height;
        this._rectInPixels = cc.rectPointsToPixels(this._rect)
    },
    getOffsetInPixels: function () {
        return cc.p(this._offsetInPixels)
    },
    setOffsetInPixels: function (a) {
        this._offsetInPixels.x = a.x;
        this._offsetInPixels.y = a.y;
        cc._pointPixelsToPointsOut(this._offsetInPixels, this._offset)
    },
    getOriginalSizeInPixels: function () {
        return cc.size(this._originalSizeInPixels)
    },
    setOriginalSizeInPixels: function (a) {
        this._originalSizeInPixels.width = a.width;
        this._originalSizeInPixels.height = a.height
    },
    getOriginalSize: function () {
        return cc.size(this._originalSize)
    },
    setOriginalSize: function (a) {
        this._originalSize.width = a.width;
        this._originalSize.height = a.height
    },
    getTexture: function () {
        if (this._texture)return this._texture;
        if ("" !== this._textureFilename) {
            var a = cc.textureCache.addImage(this._textureFilename);
            a && (this._textureLoaded = a.isLoaded());
            return a
        }
        return null
    },
    setTexture: function (a) {
        if (this._texture !== a) {
            var b = a.isLoaded();
            this._textureLoaded = b;
            this._texture = a;
            b || a.addEventListener("load", function (a) {
                this._textureLoaded = !0;
                if (this._rotated && cc._renderType === cc._RENDER_TYPE_CANVAS) {
                    var b = a.getHtmlElementObj(), b = cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas(b, this.getRect()), e = new cc.Texture2D;
                    e.initWithElement(b);
                    e.handleLoadedTexture();
                    this.setTexture(e);
                    b = this.getRect();
                    this.setRect(cc.rect(0, 0, b.width, b.height))
                }
                b = this._rect;
                0 === b.width && 0 === b.height && (b = a.width, a = a.height, this._rect.width = b, this._rect.height = a, this._rectInPixels = cc.rectPointsToPixels(this._rect), this._originalSizeInPixels.width = this._rectInPixels.width, this._originalSizeInPixels.height = this._rectInPixels.height, this._originalSize.width = b, this._originalSize.height = a);
                this.dispatchEvent("load")
            }, this)
        }
    },
    getOffset: function () {
        return cc.p(this._offset)
    },
    setOffset: function (a) {
        this._offset.x = a.x;
        this._offset.y = a.y
    },
    clone: function () {
        var a = new cc.SpriteFrame;
        a.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        a.setTexture(this._texture);
        return a
    },
    copyWithZone: function () {
        var a = new cc.SpriteFrame;
        a.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        a.setTexture(this._texture);
        return a
    },
    copy: function () {
        return this.copyWithZone()
    },
    initWithTexture: function (a, b, c, d, e) {
        2 === arguments.length && (b = cc.rectPointsToPixels(b));
        d = d || cc.p(0, 0);
        e = e || b;
        c = c || !1;
        cc.isString(a) ? (this._texture = null, this._textureFilename = a) : a instanceof cc.Texture2D && this.setTexture(a);
        a = this.getTexture();
        this._rectInPixels = b;
        b = this._rect = cc.rectPixelsToPoints(b);
        if (a && a.url && a.isLoaded()) {
            var f, g;
            c ? (f = b.x + b.height, g = b.y + b.width) : (f = b.x + b.width, g = b.y + b.height);
            f > a.getPixelsWide() && cc.error(cc._LogInfos.RectWidth, a.url);
            g > a.getPixelsHigh() && cc.error(cc._LogInfos.RectHeight, a.url)
        }
        this._offsetInPixels.x = d.x;
        this._offsetInPixels.y = d.y;
        cc._pointPixelsToPointsOut(d, this._offset);
        this._originalSizeInPixels.width = e.width;
        this._originalSizeInPixels.height = e.height;
        cc._sizePixelsToPointsOut(e, this._originalSize);
        this._rotated = c;
        return !0
    }
});
cc.EventHelper.prototype.apply(cc.SpriteFrame.prototype);
cc.SpriteFrame.create = function (a, b, c, d, e) {
    return new cc.SpriteFrame(a, b, c, d, e)
};
cc.SpriteFrame.createWithTexture = cc.SpriteFrame.create;
cc.SpriteFrame._frameWithTextureForCanvas = function (a, b, c, d, e) {
    var f = new cc.SpriteFrame;
    f._texture = a;
    f._rectInPixels = b;
    f._rect = cc.rectPixelsToPoints(b);
    f._offsetInPixels.x = d.x;
    f._offsetInPixels.y = d.y;
    cc._pointPixelsToPointsOut(f._offsetInPixels, f._offset);
    f._originalSizeInPixels.width = e.width;
    f._originalSizeInPixels.height = e.height;
    cc._sizePixelsToPointsOut(f._originalSizeInPixels, f._originalSize);
    f._rotated = c;
    return f
};
cc.spriteFrameCache = {
    _CCNS_REG1: /^\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*$/,
    _CCNS_REG2: /^\s*\{\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*,\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*\}\s*$/,
    _spriteFrames: {},
    _spriteFramesAliases: {},
    _frameConfigCache: {},
    _rectFromString: function (a) {
        return (a = this._CCNS_REG2.exec(a)) ? cc.rect(parseFloat(a[1]), parseFloat(a[2]), parseFloat(a[3]), parseFloat(a[4])) : cc.rect(0, 0, 0, 0)
    },
    _pointFromString: function (a) {
        return (a = this._CCNS_REG1.exec(a)) ? cc.p(parseFloat(a[1]), parseFloat(a[2])) : cc.p(0, 0)
    },
    _sizeFromString: function (a) {
        return (a = this._CCNS_REG1.exec(a)) ? cc.size(parseFloat(a[1]), parseFloat(a[2])) : cc.size(0, 0)
    },
    _getFrameConfig: function (a) {
        var b = cc.loader.getRes(a);
        cc.assert(b, cc._LogInfos.spriteFrameCache__getFrameConfig_2, a);
        cc.loader.release(a);
        if (b._inited)return this._frameConfigCache[a] = b;
        this._frameConfigCache[a] = this._parseFrameConfig(b);
        return this._frameConfigCache[a]
    },
    _getFrameConfigByJsonObject: function (a, b) {
        cc.assert(b, cc._LogInfos.spriteFrameCache__getFrameConfig_2, a);
        this._frameConfigCache[a] = this._parseFrameConfig(b);
        return this._frameConfigCache[a]
    },
    _parseFrameConfig: function (a) {
        var b = a.frames, c = a.metadata || a.meta;
        a = {};
        var d = {}, e = 0;
        c && (e = c.format, e = 1 >= e.length ? parseInt(e) : e, d.image = c.textureFileName || c.textureFileName || c.image);
        for (var f in b) {
            var g = b[f];
            if (g) {
                c = {};
                if (0 == e) {
                    c.rect = cc.rect(g.x, g.y, g.width, g.height);
                    c.rotated = !1;
                    c.offset = cc.p(g.offsetX, g.offsetY);
                    var h = g.originalWidth, g = g.originalHeight;
                    h && g || cc.log(cc._LogInfos.spriteFrameCache__getFrameConfig);
                    h = Math.abs(h);
                    g = Math.abs(g);
                    c.size = cc.size(h, g)
                } else if (1 == e || 2 == e)c.rect = this._rectFromString(g.frame), c.rotated = g.rotated || !1, c.offset = this._pointFromString(g.offset), c.size = this._sizeFromString(g.sourceSize); else if (3 == e) {
                    var h = this._sizeFromString(g.spriteSize), k = this._rectFromString(g.textureRect);
                    h && (k = cc.rect(k.x, k.y, h.width, h.height));
                    c.rect = k;
                    c.rotated = g.textureRotated || !1;
                    c.offset = this._pointFromString(g.spriteOffset);
                    c.size = this._sizeFromString(g.spriteSourceSize);
                    c.aliases = g.aliases
                } else h = g.frame, k = g.sourceSize, f = g.filename || f, c.rect = cc.rect(h.x, h.y, h.w, h.h), c.rotated = g.rotated || !1, c.offset = cc.p(0, 0), c.size = cc.size(k.w, k.h);
                a[f] = c
            }
        }
        return {_inited: !0, frames: a, meta: d}
    },
    _addSpriteFramesByObject: function (a, b, c) {
        cc.assert(a, cc._LogInfos.spriteFrameCache_addSpriteFrames_2);
        b && b.frames && (b = this._frameConfigCache[a] || this._getFrameConfigByJsonObject(a, b), this._createSpriteFrames(a, b, c))
    },
    _createSpriteFrames: function (a, b, c) {
        var d = b.frames;
        b = b.meta;
        c ? c instanceof cc.Texture2D || (cc.isString(c) ? c = cc.textureCache.addImage(c) : cc.assert(0, cc._LogInfos.spriteFrameCache_addSpriteFrames_3)) : (c = cc.path.changeBasename(a, b.image || ".png"), c = cc.textureCache.addImage(c));
        a = this._spriteFramesAliases;
        b = this._spriteFrames;
        for (var e in d) {
            var f = d[e], g = b[e];
            if (!g) {
                g = new cc.SpriteFrame(c, f.rect, f.rotated, f.offset, f.size);
                if (f = f.aliases)
                    for (var h = 0, k = f.length; h < k; h++) {
                        var m = f[h];
                        a[m] && cc.log(cc._LogInfos.spriteFrameCache_addSpriteFrames, m);
                        a[m] = e
                    }
                cc._renderType === cc._RENDER_TYPE_CANVAS && g.isRotated() && g.getTexture().isLoaded() && (f = g.getTexture().getHtmlElementObj(), f = cc.Sprite.CanvasRenderCmd._cutRotateImageToCanvas(f, g.getRectInPixels()), h = new cc.Texture2D, h.initWithElement(f), h.handleLoadedTexture(), g.setTexture(h), f = g._rect, g.setRect(cc.rect(0, 0, f.width, f.height)));
                b[e] = g
            }
        }
    },
    addSpriteFrames: function (a, b) {
        cc.assert(a, cc._LogInfos.spriteFrameCache_addSpriteFrames_2);
        var c = this._frameConfigCache[a] || cc.loader.getRes(a);
        c && c.frames && (c = this._frameConfigCache[a] || this._getFrameConfig(a), this._createSpriteFrames(a, c, b))
    },
    _checkConflict: function (a) {
        a = a.frames;
        for (var b in a)this._spriteFrames[b] && cc.log(cc._LogInfos.spriteFrameCache__checkConflict, b)
    },
    addSpriteFrame: function (a, b) {
        this._spriteFrames[b] = a
    },
    removeSpriteFrames: function () {
        this._spriteFrames = {};
        this._spriteFramesAliases = {}
    },
    removeSpriteFrameByName: function (a) {
        a && (this._spriteFramesAliases[a] && delete this._spriteFramesAliases[a], this._spriteFrames[a] && delete this._spriteFrames[a])
    },
    removeSpriteFramesFromFile: function (a) {
        var b = this._spriteFrames, c = this._spriteFramesAliases;
        if (a = this._frameConfigCache[a]) {
            a = a.frames;
            for (var d in a)
                if (b[d]) {
                    delete b[d];
                    for (var e in c)c[e] === d && delete c[e]
                }
        }
    },
    removeSpriteFramesFromTexture: function (a) {
        var b = this._spriteFrames, c = this._spriteFramesAliases, d;
        for (d in b) {
            var e = b[d];
            if (e && e.getTexture() === a) {
                delete b[d];
                for (var f in c)c[f] === d && delete c[f]
            }
        }
    },
    getSpriteFrame: function (a) {
        var b = this._spriteFrames[a];
        if (!b) {
            var c = this._spriteFramesAliases[a];
            c && ((b = this._spriteFrames[c.toString()]) || delete this._spriteFramesAliases[a])
        }
        return b
    },
    _clear: function () {
        this._spriteFrames = {};
        this._spriteFramesAliases = {};
        this._frameConfigCache = {}
    }
};
cc.configuration = {
    ERROR: 0,
    STRING: 1,
    INT: 2,
    DOUBLE: 3,
    BOOLEAN: 4,
    _maxTextureSize: 0,
    _maxModelviewStackDepth: 0,
    _supportsPVRTC: !1,
    _supportsNPOT: !1,
    _supportsBGRA8888: !1,
    _supportsDiscardFramebuffer: !1,
    _supportsShareableVAO: !1,
    _maxSamplesAllowed: 0,
    _maxTextureUnits: 0,
    _GlExtensions: "",
    _valueDict: {},
    _inited: !1,
    _init: function () {
        var a = this._valueDict;
        a["cocos2d.x.version"] = cc.ENGINE_VERSION;
        a["cocos2d.x.compiled_with_profiler"] = !1;
        a["cocos2d.x.compiled_with_gl_state_cache"] = cc.ENABLE_GL_STATE_CACHE;
        this._inited = !0
    },
    getMaxTextureSize: function () {
        return this._maxTextureSize
    },
    getMaxModelviewStackDepth: function () {
        return this._maxModelviewStackDepth
    },
    getMaxTextureUnits: function () {
        return this._maxTextureUnits
    },
    supportsNPOT: function () {
        return this._supportsNPOT
    },
    supportsPVRTC: function () {
        return this._supportsPVRTC
    },
    supportsETC: function () {
        return !1
    },
    supportsS3TC: function () {
        return !1
    },
    supportsATITC: function () {
        return !1
    },
    supportsBGRA8888: function () {
        return this._supportsBGRA8888
    },
    supportsDiscardFramebuffer: function () {
        return this._supportsDiscardFramebuffer
    },
    supportsShareableVAO: function () {
        return this._supportsShareableVAO
    },
    checkForGLExtension: function (a) {
        return -1 < this._GlExtensions.indexOf(a)
    },
    getValue: function (a, b) {
        this._inited || this._init();
        var c = this._valueDict;
        return c[a] ? c[a] : b
    },
    setValue: function (a, b) {
        this._valueDict[a] = b
    },
    dumpInfo: function () {
        0 === cc.ENABLE_GL_STATE_CACHE && (cc.log(""), cc.log(cc._LogInfos.configuration_dumpInfo), cc.log(""))
    },
    gatherGPUInfo: function () {
        if (cc._renderType !== cc._RENDER_TYPE_CANVAS) {
            this._inited || this._init();
            var a = cc._renderContext, b = this._valueDict;
            b["gl.vendor"] = a.getParameter(a.VENDOR);
            b["gl.renderer"] = a.getParameter(a.RENDERER);
            b["gl.version"] = a.getParameter(a.VERSION);
            this._GlExtensions = "";
            for (var c = a.getSupportedExtensions(), d = 0; d < c.length; d++)this._GlExtensions += c[d] + " ";
            this._maxTextureSize = a.getParameter(a.MAX_TEXTURE_SIZE);
            b["gl.max_texture_size"] = this._maxTextureSize;
            this._maxTextureUnits = a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
            b["gl.max_texture_units"] = this._maxTextureUnits;
            this._supportsPVRTC = this.checkForGLExtension("GL_IMG_texture_compression_pvrtc");
            b["gl.supports_PVRTC"] = this._supportsPVRTC;
            this._supportsNPOT = !1;
            b["gl.supports_NPOT"] = this._supportsNPOT;
            this._supportsBGRA8888 = this.checkForGLExtension("GL_IMG_texture_format_BGRA888");
            b["gl.supports_BGRA8888"] = this._supportsBGRA8888;
            this._supportsDiscardFramebuffer = this.checkForGLExtension("GL_EXT_discard_framebuffer");
            b["gl.supports_discard_framebuffer"] = this._supportsDiscardFramebuffer;
            this._supportsShareableVAO = this.checkForGLExtension("vertex_array_object");
            b["gl.supports_vertex_array_object"] = this._supportsShareableVAO;
            cc.checkGLErrorDebug()
        }
    },
    loadConfigFile: function (a) {
        this._inited || this._init();
        var b = cc.loader.getRes(a);
        if (!b)throw"Please load the resource first : " + a;
        cc.assert(b, cc._LogInfos.configuration_loadConfigFile_2, a);
        if (b = b.data)
            for (var c in b)this._valueDict[c] = b[c]; else cc.log(cc._LogInfos.configuration_loadConfigFile, a)
    }
};
cc.g_NumberOfDraws = 0;
cc.GLToClipTransform = function (a) {
    cc.kmGLGetMatrix(cc.KM_GL_PROJECTION, a);
    var b = new cc.math.Matrix4;
    cc.kmGLGetMatrix(cc.KM_GL_MODELVIEW, b);
    a.multiply(b)
};
cc.Director = cc.Class.extend({
    _landscape: !1,
    _nextDeltaTimeZero: !1,
    _paused: !1,
    _purgeDirectorInNextLoop: !1,
    _sendCleanupToScene: !1,
    _animationInterval: 0,
    _oldAnimationInterval: 0,
    _projection: 0,
    _accumDt: 0,
    _contentScaleFactor: 1,
    _displayStats: !1,
    _deltaTime: 0,
    _frameRate: 0,
    _FPSLabel: null,
    _SPFLabel: null,
    _drawsLabel: null,
    _winSizeInPoints: null,
    _lastUpdate: null,
    _nextScene: null,
    _notificationNode: null,
    _openGLView: null,
    _scenesStack: null,
    _projectionDelegate: null,
    _runningScene: null,
    _frames: 0,
    _totalFrames: 0,
    _secondsPerFrame: 0,
    _dirtyRegion: null,
    _scheduler: null,
    _actionManager: null,
    _eventProjectionChanged: null,
    _eventAfterDraw: null,
    _eventAfterVisit: null,
    _eventAfterUpdate: null,
    ctor: function () {
        var a = this;
        a._lastUpdate = Date.now();
        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
            a._lastUpdate = Date.now()
        })
    },
    init: function () {
        this._oldAnimationInterval = this._animationInterval = 1 / cc.defaultFPS;
        this._scenesStack = [];
        this._projection = cc.Director.PROJECTION_DEFAULT;
        this._projectionDelegate = null;
        this._frameRate = this._accumDt = 0;
        this._displayStats = !1;
        this._totalFrames = this._frames = 0;
        this._lastUpdate = Date.now();
        this._purgeDirectorInNextLoop = this._paused = !1;
        this._winSizeInPoints = cc.size(0, 0);
        this._openGLView = null;
        this._contentScaleFactor = 1;
        this._scheduler = new cc.Scheduler;
        cc.ActionManager ? (this._actionManager = new cc.ActionManager, this._scheduler.scheduleUpdate(this._actionManager, cc.Scheduler.PRIORITY_SYSTEM, !1)) : this._actionManager = null;
        this._eventAfterDraw = new cc.EventCustom(cc.Director.EVENT_AFTER_DRAW);
        this._eventAfterDraw.setUserData(this);
        this._eventAfterVisit = new cc.EventCustom(cc.Director.EVENT_AFTER_VISIT);
        this._eventAfterVisit.setUserData(this);
        this._eventAfterUpdate = new cc.EventCustom(cc.Director.EVENT_AFTER_UPDATE);
        this._eventAfterUpdate.setUserData(this);
        this._eventProjectionChanged = new cc.EventCustom(cc.Director.EVENT_PROJECTION_CHANGED);
        this._eventProjectionChanged.setUserData(this);
        return !0
    },
    calculateDeltaTime: function () {
        var a = Date.now();
        this._nextDeltaTimeZero ? (this._deltaTime = 0, this._nextDeltaTimeZero = !1) : this._deltaTime = (a - this._lastUpdate) / 1E3;
        0 < cc.game.config[cc.game.CONFIG_KEY.debugMode] && 0.2 < this._deltaTime && (this._deltaTime = 1 / 60);
        this._lastUpdate = a
    },
    convertToGL: null,
    convertToUI: null,
    drawScene: function () {
        var a = cc.renderer;
        this.calculateDeltaTime();
        this._paused || (this._scheduler.update(this._deltaTime), cc.eventManager.dispatchEvent(this._eventAfterUpdate));
        this._clear();
        this._nextScene && this.setNextScene();
        this._beforeVisitScene && this._beforeVisitScene();
        this._runningScene && (!0 === a.childrenOrderDirty ? (cc.renderer.clearRenderCommands(), this._runningScene._renderCmd._curLevel = 0, this._runningScene.visit(), a.resetFlag()) : !0 === a.transformDirty() && a.transform(), cc.eventManager.dispatchEvent(this._eventAfterVisit));
        this._notificationNode && this._notificationNode.visit();
        this._displayStats && this._showStats();
        this._afterVisitScene && this._afterVisitScene();
        a.rendering(cc._renderContext);
        cc.eventManager.dispatchEvent(this._eventAfterDraw);
        this._totalFrames++;
        this._displayStats && this._calculateMPF()
    },
    _beforeVisitScene: null,
    _afterVisitScene: null,
    end: function () {
        this._purgeDirectorInNextLoop = !0
    },
    getContentScaleFactor: function () {
        return this._contentScaleFactor
    },
    getNotificationNode: function () {
        return this._notificationNode
    },
    getWinSize: function () {
        return cc.size(this._winSizeInPoints)
    },
    getWinSizeInPixels: function () {
        return cc.size(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor)
    },
    getVisibleSize: null,
    getVisibleOrigin: null,
    getZEye: null,
    pause: function () {
        this._paused || (this._oldAnimationInterval = this._animationInterval, this.setAnimationInterval(0.25), this._paused = !0)
    },
    popScene: function () {
        cc.assert(this._runningScene, cc._LogInfos.Director_popScene);
        this._scenesStack.pop();
        var a = this._scenesStack.length;
        0 === a ? this.end() : (this._sendCleanupToScene = !0, this._nextScene = this._scenesStack[a - 1])
    },
    purgeCachedData: function () {
        cc.animationCache._clear();
        cc.spriteFrameCache._clear();
        cc.textureCache._clear()
    },
    purgeDirector: function () {
        this.getScheduler().unscheduleAll();
        cc.eventManager && cc.eventManager.setEnabled(!1);
        this._runningScene && (this._runningScene.onExitTransitionDidStart(), this._runningScene.onExit(), this._runningScene.cleanup());
        this._nextScene = this._runningScene = null;
        this._scenesStack.length = 0;
        this.stopAnimation();
        this.purgeCachedData();
        cc.checkGLErrorDebug()
    },
    pushScene: function (a) {
        cc.assert(a, cc._LogInfos.Director_pushScene);
        this._sendCleanupToScene = !1;
        this._scenesStack.push(a);
        this._nextScene = a
    },
    runScene: function (a) {
        cc.assert(a, cc._LogInfos.Director_pushScene);
        if (this._runningScene) {
            var b = this._scenesStack.length;
            0 === b ? (this._sendCleanupToScene = !0, this._scenesStack[b] = a) : (this._sendCleanupToScene = !0, this._scenesStack[b - 1] = a);
            this._nextScene = a
        } else this.pushScene(a), this.startAnimation()
    },
    resume: function () {
        this._paused && (this.setAnimationInterval(this._oldAnimationInterval), (this._lastUpdate = Date.now()) || cc.log(cc._LogInfos.Director_resume), this._paused = !1, this._deltaTime = 0)
    },
    setContentScaleFactor: function (a) {
        a !== this._contentScaleFactor && (this._contentScaleFactor = a, this._createStatsLabel())
    },
    setDepthTest: null,
    setDefaultValues: function () {
    },
    setNextDeltaTimeZero: function (a) {
        this._nextDeltaTimeZero = a
    },
    setNextScene: function () {
        var a = !1, b = !1;
        cc.TransitionScene && (a = this._runningScene ? this._runningScene instanceof cc.TransitionScene : !1, b = this._nextScene ? this._nextScene instanceof cc.TransitionScene : !1);
        if (!b) {
            if (b = this._runningScene)b.onExitTransitionDidStart(), b.onExit();
            this._sendCleanupToScene && b && b.cleanup()
        }
        this._runningScene = this._nextScene;
        cc.renderer.childrenOrderDirty = !0;
        this._nextScene = null;
        a || null === this._runningScene || (this._runningScene.onEnter(), this._runningScene.onEnterTransitionDidFinish())
    },
    setNotificationNode: function (a) {
        this._notificationNode = a
    },
    getDelegate: function () {
        return this._projectionDelegate
    },
    setDelegate: function (a) {
        this._projectionDelegate = a
    },
    setOpenGLView: null,
    setProjection: null,
    setViewport: null,
    getOpenGLView: null,
    getProjection: null,
    setAlphaBlending: null,
    _showStats: function () {
        this._frames++;
        this._accumDt += this._deltaTime;
        this._FPSLabel && this._SPFLabel && this._drawsLabel ? (this._accumDt > cc.DIRECTOR_FPS_INTERVAL && (this._SPFLabel.string = this._secondsPerFrame.toFixed(3), this._frameRate = this._frames / this._accumDt, this._accumDt = this._frames = 0, this._FPSLabel.string = this._frameRate.toFixed(1), this._drawsLabel.string = (0 | cc.g_NumberOfDraws).toString()), this._FPSLabel.visit(), this._SPFLabel.visit(), this._drawsLabel.visit()) : this._createStatsLabel();
        cc.g_NumberOfDraws = 0
    },
    isSendCleanupToScene: function () {
        return this._sendCleanupToScene
    },
    getRunningScene: function () {
        return this._runningScene
    },
    getAnimationInterval: function () {
        return this._animationInterval
    },
    isDisplayStats: function () {
        return this._displayStats
    },
    setDisplayStats: function (a) {
        this._displayStats = a
    },
    getSecondsPerFrame: function () {
        return this._secondsPerFrame
    },
    isNextDeltaTimeZero: function () {
        return this._nextDeltaTimeZero
    },
    isPaused: function () {
        return this._paused
    },
    getTotalFrames: function () {
        return this._totalFrames
    },
    popToRootScene: function () {
        this.popToSceneStackLevel(1)
    },
    popToSceneStackLevel: function (a) {
        cc.assert(this._runningScene, cc._LogInfos.Director_popToSceneStackLevel_2);
        var b = this._scenesStack, c = b.length;
        if (0 === c)this.end(); else if (!(a > c)) {
            for (; c > a;) {
                var d = b.pop();
                d.running && (d.onExitTransitionDidStart(), d.onExit());
                d.cleanup();
                c--
            }
            this._nextScene = b[b.length - 1];
            this._sendCleanupToScene = !1
        }
    },
    getScheduler: function () {
        return this._scheduler
    },
    setScheduler: function (a) {
        this._scheduler !== a && (this._scheduler = a)
    },
    getActionManager: function () {
        return this._actionManager
    },
    setActionManager: function (a) {
        this._actionManager !== a && (this._actionManager = a)
    },
    getDeltaTime: function () {
        return this._deltaTime
    },
    _createStatsLabel: null,
    _calculateMPF: function () {
        this._secondsPerFrame = (Date.now() - this._lastUpdate) / 1E3
    }
});
cc.Director.EVENT_PROJECTION_CHANGED = "director_projection_changed";
cc.Director.EVENT_AFTER_DRAW = "director_after_draw";
cc.Director.EVENT_AFTER_VISIT = "director_after_visit";
cc.Director.EVENT_AFTER_UPDATE = "director_after_update";
cc.DisplayLinkDirector = cc.Director.extend({
    invalid: !1, startAnimation: function () {
        this._nextDeltaTimeZero = !0;
        this.invalid = !1
    }, mainLoop: function () {
        this._purgeDirectorInNextLoop ? (this._purgeDirectorInNextLoop = !1, this.purgeDirector()) : this.invalid || this.drawScene()
    }, stopAnimation: function () {
        this.invalid = !0
    }, setAnimationInterval: function (a) {
        this._animationInterval = a;
        this.invalid || (this.stopAnimation(), this.startAnimation())
    }
});
cc.Director.sharedDirector = null;
cc.Director.firstUseDirector = !0;
cc.Director._getInstance = function () {
    cc.Director.firstUseDirector && (cc.Director.firstUseDirector = !1, cc.Director.sharedDirector = new cc.DisplayLinkDirector, cc.Director.sharedDirector.init());
    return cc.Director.sharedDirector
};
cc.defaultFPS = 60;
cc.Director.PROJECTION_2D = 0;
cc.Director.PROJECTION_3D = 1;
cc.Director.PROJECTION_CUSTOM = 3;
cc.Director.PROJECTION_DEFAULT = cc.Director.PROJECTION_3D;
cc._renderType === cc._RENDER_TYPE_CANVAS ? (_p = cc.Director.prototype, _p.setProjection = function (a) {
    this._projection = a;
    cc.eventManager.dispatchEvent(this._eventProjectionChanged)
}, _p.setDepthTest = function () {
}, _p.setOpenGLView = function (a) {
    this._winSizeInPoints.width = cc._canvas.width;
    this._winSizeInPoints.height = cc._canvas.height;
    this._openGLView = a || cc.view;
    cc.eventManager && cc.eventManager.setEnabled(!0)
}, _p._clear = function () {
    var a = this._openGLView.getViewPortRect(), b = cc._renderContext.getContext();
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.clearRect(-a.x, a.y, a.width, a.height)
}, _p._createStatsLabel = function () {
    var a = 0, a = this._winSizeInPoints.width > this._winSizeInPoints.height ? 0 | this._winSizeInPoints.height / 320 * 24 : 0 | this._winSizeInPoints.width / 320 * 24;
    this._FPSLabel = new cc.LabelTTF("000.0", "Arial", a);
    this._SPFLabel = new cc.LabelTTF("0.000", "Arial", a);
    this._drawsLabel = new cc.LabelTTF("0000", "Arial", a);
    a = cc.DIRECTOR_STATS_POSITION;
    this._drawsLabel.setPosition(this._drawsLabel.width / 2 + a.x, 5 * this._drawsLabel.height / 2 + a.y);
    this._SPFLabel.setPosition(this._SPFLabel.width / 2 + a.x, 3 * this._SPFLabel.height / 2 + a.y);
    this._FPSLabel.setPosition(this._FPSLabel.width / 2 + a.x, this._FPSLabel.height / 2 + a.y)
}, _p.getVisibleSize = function () {
    return this.getWinSize()
}, _p.getVisibleOrigin = function () {
    return cc.p(0, 0)
}) : (cc.Director._fpsImage = new Image, cc._addEventListener(cc.Director._fpsImage, "load", function () {
    cc.Director._fpsImageLoaded = !0
}), cc._fpsImage && (cc.Director._fpsImage.src = cc._fpsImage));
cc._renderType === cc._RENDER_TYPE_WEBGL && function () {
    cc.DirectorDelegate = cc.Class.extend({
        updateProjection: function () {
        }
    });
    var a = cc.Director.prototype;
    a.setProjection = function (a) {
        var c = this._winSizeInPoints;
        this.setViewport();
        var d = this._openGLView, e = d._viewPortRect.x / d._scaleX, f = d._viewPortRect.y / d._scaleY;
        switch (a) {
            case cc.Director.PROJECTION_2D:
                cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
                cc.kmGLLoadIdentity();
                d = cc.math.Matrix4.createOrthographicProjection(-e, c.width - e, -f, c.height - f, -1024, 1024);
                cc.kmGLMultMatrix(d);
                cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
                cc.kmGLLoadIdentity();
                break;
            case cc.Director.PROJECTION_3D:
                var g = this.getZEye(), h = new cc.math.Matrix4, d = new cc.math.Matrix4;
                cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
                cc.kmGLLoadIdentity();
                h = cc.math.Matrix4.createPerspectiveProjection(60, c.width / c.height, 0.1, 2 * g);
                cc.kmGLMultMatrix(h);
                cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
                cc.kmGLLoadIdentity();
                g = new cc.math.Vec3(-e + c.width / 2, -f + c.height / 2, g);
                c = new cc.math.Vec3(-e + c.width / 2, -f + c.height / 2, 0);
                e = new cc.math.Vec3(0, 1, 0);
                d.lookAt(g, c, e);
                cc.kmGLMultMatrix(d);
                break;
            case cc.Director.PROJECTION_CUSTOM:
                this._projectionDelegate && this._projectionDelegate.updateProjection();
                break;
            default:
                cc.log(cc._LogInfos.Director_setProjection)
        }
        this._projection = a;
        cc.eventManager.dispatchEvent(this._eventProjectionChanged);
        cc.setProjectionMatrixDirty();
        cc.renderer.childrenOrderDirty = !0
    };
    a.setDepthTest = function (a) {
        var c = cc._renderContext;
        a ? (c.clearDepth(1), c.enable(c.DEPTH_TEST), c.depthFunc(c.LEQUAL)) : c.disable(c.DEPTH_TEST)
    };
    a.setOpenGLView = function (a) {
        this._winSizeInPoints.width = cc._canvas.width;
        this._winSizeInPoints.height = cc._canvas.height;
        this._openGLView = a || cc.view;
        a = cc.configuration;
        a.gatherGPUInfo();
        a.dumpInfo();
        this._createStatsLabel();
        this.setGLDefaultValues();
        cc.eventManager && cc.eventManager.setEnabled(!0)
    };
    a._clear = function () {
        var a = cc._renderContext;
        a.clear(a.COLOR_BUFFER_BIT | a.DEPTH_BUFFER_BIT)
    };
    a._beforeVisitScene = function () {
        cc.kmGLPushMatrix()
    };
    a._afterVisitScene = function () {
        cc.kmGLPopMatrix()
    };
    a._createStatsLabel = function () {
        if (!cc.LabelAtlas)this._createStatsLabelForCanvas(); else if (null != cc.Director._fpsImageLoaded && !1 !== cc.Director._fpsImageLoaded) {
            var a = new cc.Texture2D;
            a.initWithElement(cc.Director._fpsImage);
            a.handleLoadedTexture();
            var c = cc.view.getDesignResolutionSize().height / 320;
            0 === c && (c = this._winSizeInPoints.height / 320);
            var d = new cc.LabelAtlas;
            d._setIgnoreContentScaleFactor(!0);
            d.initWithString("00.0", a, 12, 32, ".");
            d.scale = c;
            this._FPSLabel = d;
            d = new cc.LabelAtlas;
            d._setIgnoreContentScaleFactor(!0);
            d.initWithString("0.000", a, 12, 32, ".");
            d.scale = c;
            this._SPFLabel = d;
            d = new cc.LabelAtlas;
            d._setIgnoreContentScaleFactor(!0);
            d.initWithString("000", a, 12, 32, ".");
            d.scale = c;
            this._drawsLabel = d;
            a = cc.DIRECTOR_STATS_POSITION;
            this._drawsLabel.setPosition(a.x, 34 * c + a.y);
            this._SPFLabel.setPosition(a.x, 17 * c + a.y);
            this._FPSLabel.setPosition(a)
        }
    };
    a._createStatsLabelForCanvas = function () {
        var a = 0, a = this._winSizeInPoints.width > this._winSizeInPoints.height ? 0 | this._winSizeInPoints.height / 320 * 24 : 0 | this._winSizeInPoints.width / 320 * 24;
        this._FPSLabel = new cc.LabelTTF("000.0", "Arial", a);
        this._SPFLabel = new cc.LabelTTF("0.000", "Arial", a);
        this._drawsLabel = new cc.LabelTTF("0000", "Arial", a);
        a = cc.DIRECTOR_STATS_POSITION;
        this._drawsLabel.setPosition(this._drawsLabel.width / 2 + a.x, 5 * this._drawsLabel.height / 2 + a.y);
        this._SPFLabel.setPosition(this._SPFLabel.width / 2 + a.x, 3 * this._SPFLabel.height / 2 + a.y);
        this._FPSLabel.setPosition(this._FPSLabel.width / 2 + a.x, this._FPSLabel.height / 2 + a.y)
    };
    a.convertToGL = function (a) {
        var c = new cc.math.Matrix4;
        cc.GLToClipTransform(c);
        var d = c.inverse(), c = c.mat[14] / c.mat[15], e = this._openGLView.getDesignResolutionSize();
        a = new cc.math.Vec3(2 * a.x / e.width - 1, 1 - 2 * a.y / e.height, c);
        a.transformCoord(d);
        return cc.p(a.x, a.y)
    };
    a.convertToUI = function (a) {
        var c = new cc.math.Matrix4;
        cc.GLToClipTransform(c);
        a = new cc.math.Vec3(a.x, a.y, 0);
        a.transformCoord(c);
        c = this._openGLView.getDesignResolutionSize();
        return cc.p(c.width * (0.5 * a.x + 0.5), c.height * (0.5 * -a.y + 0.5))
    };
    a.getVisibleSize = function () {
        return this._openGLView.getVisibleSize()
    };
    a.getVisibleOrigin = function () {
        return this._openGLView.getVisibleOrigin()
    };
    a.getZEye = function () {
        return this._winSizeInPoints.height / 1.1566
    };
    a.setViewport = function () {
        var a = this._openGLView;
        if (a) {
            var c = this._winSizeInPoints;
            a.setViewPortInPoints(-a._viewPortRect.x / a._scaleX, -a._viewPortRect.y / a._scaleY, c.width, c.height)
        }
    };
    a.getOpenGLView = function () {
        return this._openGLView
    };
    a.getProjection = function () {
        return this._projection
    };
    a.setAlphaBlending = function (a) {
        a ? cc.glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST) : cc.glBlendFunc(cc._renderContext.ONE, cc._renderContext.ZERO)
    };
    a.setGLDefaultValues = function () {
        this.setAlphaBlending(!0);
        this.setDepthTest(!1);
        this.setProjection(this._projection);
        cc._renderContext.clearColor(0, 0, 0, 1)
    }
}();
cc.Camera = cc.Class.extend({
    _eyeX: null,
    _eyeY: null,
    _eyeZ: null,
    _centerX: null,
    _centerY: null,
    _centerZ: null,
    _upX: null,
    _upY: null,
    _upZ: null,
    _dirty: !1,
    _lookupMatrix: null,
    ctor: function () {
        this._lookupMatrix = new cc.math.Matrix4;
        this.restore()
    },
    description: function () {
        return "\x3cCCCamera | center \x3d(" + this._centerX + "," + this._centerY + "," + this._centerZ + ")\x3e"
    },
    setDirty: function (a) {
        this._dirty = a
    },
    isDirty: function () {
        return this._dirty
    },
    restore: function () {
        this._eyeX = this._eyeY = 0;
        this._eyeZ = cc.Camera.getZEye();
        this._upX = this._centerX = this._centerY = this._centerZ = 0;
        this._upY = 1;
        this._upZ = 0;
        this._lookupMatrix.identity();
        this._dirty = !1
    },
    locate: function () {
        if (this._dirty) {
            var a = new cc.math.Vec3(this._eyeX, this._eyeY, this._eyeZ), b = new cc.math.Vec3(this._centerX, this._centerY, this._centerZ), c = new cc.math.Vec3(this._upX, this._upY, this._upZ);
            this._lookupMatrix.lookAt(a, b, c);
            this._dirty = !1
        }
        cc.kmGLMultMatrix(this._lookupMatrix)
    },
    _locateForRenderer: function (a) {
        if (this._dirty) {
            var b = new cc.math.Vec3(this._eyeX, this._eyeY, this._eyeZ), c = new cc.math.Vec3(this._centerX, this._centerY, this._centerZ), d = new cc.math.Vec3(this._upX, this._upY, this._upZ);
            this._lookupMatrix.lookAt(b, c, d);
            this._dirty = !1
        }
        a.multiply(this._lookupMatrix)
    },
    setEyeXYZ: function (a, b, c) {
        this.setEye(a, b, c)
    },
    setEye: function (a, b, c) {
        this._eyeX = a;
        this._eyeY = b;
        this._eyeZ = c;
        this._dirty = !0
    },
    setCenterXYZ: function (a, b, c) {
        this.setCenter(a, b, c)
    },
    setCenter: function (a, b, c) {
        this._centerX = a;
        this._centerY = b;
        this._centerZ = c;
        this._dirty = !0
    },
    setUpXYZ: function (a, b, c) {
        this.setUp(a, b, c)
    },
    setUp: function (a, b, c) {
        this._upX = a;
        this._upY = b;
        this._upZ = c;
        this._dirty = !0
    },
    getEyeXYZ: function (a, b, c) {
        return {x: this._eyeX, y: this._eyeY, z: this._eyeZ}
    },
    getEye: function () {
        return {x: this._eyeX, y: this._eyeY, z: this._eyeZ}
    },
    getCenterXYZ: function (a, b, c) {
        return {x: this._centerX, y: this._centerY, z: this._centerZ}
    },
    getCenter: function () {
        return {x: this._centerX, y: this._centerY, z: this._centerZ}
    },
    getUpXYZ: function (a, b, c) {
        return {x: this._upX, y: this._upY, z: this._upZ}
    },
    getUp: function () {
        return {x: this._upX, y: this._upY, z: this._upZ}
    },
    _DISALLOW_COPY_AND_ASSIGN: function (a) {
    }
});
cc.Camera.getZEye = function () {
    return cc.FLT_EPSILON
};
cc.PRIORITY_NON_SYSTEM = cc.PRIORITY_SYSTEM + 1;
cc.ListEntry = function (a, b, c, d, e, f, g) {
    this.prev = a;
    this.next = b;
    this.callback = c;
    this.target = d;
    this.priority = e;
    this.paused = f;
    this.markedForDeletion = g
};
cc.HashUpdateEntry = function (a, b, c, d, e) {
    this.list = a;
    this.entry = b;
    this.target = c;
    this.callback = d;
    this.hh = e
};
cc.HashTimerEntry = cc.hashSelectorEntry = function (a, b, c, d, e, f, g) {
    this.timers = a;
    this.target = b;
    this.timerIndex = c;
    this.currentTimer = d;
    this.currentTimerSalvaged = e;
    this.paused = f;
    this.hh = g
};
cc.Timer = cc.Class.extend({
    _scheduler: null,
    _elapsed: 0,
    _runForever: !1,
    _useDelay: !1,
    _timesExecuted: 0,
    _repeat: 0,
    _delay: 0,
    _interval: 0,
    getInterval: function () {
        return this._interval
    },
    setInterval: function (a) {
        this._interval = a
    },
    setupTimerWithInterval: function (a, b, c) {
        this._elapsed = -1;
        this._interval = a;
        this._delay = c;
        this._useDelay = 0 < this._delay;
        this._repeat = b;
        this._runForever = this._repeat === cc.REPEAT_FOREVER
    },
    trigger: function () {
        return 0
    },
    cancel: function () {
        return 0
    },
    ctor: function () {
        this._scheduler = null;
        this._elapsed = -1;
        this._useDelay = this._runForever = !1;
        this._interval = this._delay = this._repeat = this._timesExecuted = 0
    },
    update: function (a) {
        -1 === this._elapsed ? this._timesExecuted = this._elapsed = 0 : (this._elapsed += a, this._runForever && !this._useDelay ? this._elapsed >= this._interval && (this.trigger(), this._elapsed = 0) : (this._useDelay ? this._elapsed >= this._delay && (this.trigger(), this._elapsed -= this._delay, this._timesExecuted += 1, this._useDelay = !1) : this._elapsed >= this._interval && (this.trigger(), this._elapsed = 0, this._timesExecuted += 1), !this._runForever && this._timesExecuted > this._repeat && this.cancel()))
    }
});
cc.TimerTargetSelector = cc.Timer.extend({
    _target: null, _selector: null, ctor: function () {
        this._selector = this._target = null
    }, initWithSelector: function (a, b, c, d, e, f) {
        this._scheduler = a;
        this._target = c;
        this._selector = b;
        this.setupTimerWithInterval(d, e, f);
        return !0
    }, getSelector: function () {
        return this._selector
    }, trigger: function () {
        this._target && this._selector && this._target.call(this._selector, this._elapsed)
    }, cancel: function () {
        this._scheduler.unschedule(this._selector, this._target)
    }
});
cc.TimerTargetCallback = cc.Timer.extend({
    _target: null, _callback: null, _key: null, ctor: function () {
        this._callback = this._target = null
    }, initWithCallback: function (a, b, c, d, e, f, g) {
        this._scheduler = a;
        this._target = c;
        this._callback = b;
        this._key = d;
        this.setupTimerWithInterval(e, f, g);
        return !0
    }, getCallback: function () {
        return this._callback
    }, getKey: function () {
        return this._key
    }, trigger: function () {
        this._callback && this._callback.call(this._target, this._elapsed)
    }, cancel: function () {
        this._scheduler.unschedule(this._callback, this._target)
    }
});
cc.Scheduler = cc.Class.extend({
    _timeScale: 1,
    _updatesNegList: null,
    _updates0List: null,
    _updatesPosList: null,
    _hashForTimers: null,
    _arrayForTimers: null,
    _hashForUpdates: null,
    _currentTarget: null,
    _currentTargetSalvaged: !1,
    _updateHashLocked: !1,
    ctor: function () {
        this._timeScale = 1;
        this._updatesNegList = [];
        this._updates0List = [];
        this._updatesPosList = [];
        this._hashForUpdates = {};
        this._hashForTimers = {};
        this._currentTarget = null;
        this._updateHashLocked = this._currentTargetSalvaged = !1;
        this._arrayForTimers = []
    },
    _schedulePerFrame: function (a, b, c, d) {
        var e = this._hashForUpdates[b.__instanceId];
        if (e && e.entry)
            if (e.entry.priority !== c) {
                if (this._updateHashLocked) {
                    cc.log("warning: you CANNOT change update priority in scheduled function");
                    e.entry.markedForDeletion = !1;
                    e.entry.paused = d;
                    return
                }
                this.unscheduleUpdate(b)
            } else {
                e.entry.markedForDeletion = !1;
                e.entry.paused = d;
                return
            }
        0 === c ? this._appendIn(this._updates0List, a, b, d) : 0 > c ? this._priorityIn(this._updatesNegList, a, b, c, d) : this._priorityIn(this._updatesPosList, a, b, c, d)
    },
    _removeHashElement: function (a) {
        delete this._hashForTimers[a.target.__instanceId];
        cc.arrayRemoveObject(this._arrayForTimers, a);
        a.Timer = null;
        a.target = null
    },
    _removeUpdateFromHash: function (a) {
        if (a = this._hashForUpdates[a.target.__instanceId])cc.arrayRemoveObject(a.list, a.entry), delete this._hashForUpdates[a.target.__instanceId], a.entry = null, a.target = null
    },
    _priorityIn: function (a, b, c, d, e) {
        b = new cc.ListEntry(null, null, b, c, d, e, !1);
        if (a) {
            e = a.length - 1;
            for (var f = 0; f <= e && !(d < a[f].priority); f++);
            a.splice(f, 0, b)
        } else a = [], a.push(b);
        this._hashForUpdates[c.__instanceId] = new cc.HashUpdateEntry(a, b, c, null);
        return a
    },
    _appendIn: function (a, b, c, d) {
        b = new cc.ListEntry(null, null, b, c, 0, d, !1);
        a.push(b);
        this._hashForUpdates[c.__instanceId] = new cc.HashUpdateEntry(a, b, c, null, null)
    },
    setTimeScale: function (a) {
        this._timeScale = a
    },
    getTimeScale: function () {
        return this._timeScale
    },
    update: function (a) {
        this._updateHashLocked = !0;
        1 !== this._timeScale && (a *= this._timeScale);
        var b, c, d, e;
        b = 0;
        c = this._updatesNegList;
        for (d = c.length; b < d; b++)e = c[b], e.paused || e.markedForDeletion || e.callback(a);
        b = 0;
        c = this._updates0List;
        for (d = c.length; b < d; b++)e = c[b], e.paused || e.markedForDeletion || e.callback(a);
        b = 0;
        c = this._updatesPosList;
        for (d = c.length; b < d; b++)e = c[b], e.paused || e.markedForDeletion || e.callback(a);
        d = this._arrayForTimers;
        for (b = 0; b < d.length; b++) {
            this._currentTarget = c = d[b];
            this._currentTargetSalvaged = !1;
            if (!c.paused)
                for (c.timerIndex = 0; c.timerIndex < c.timers.length; ++c.timerIndex)c.currentTimer = c.timers[c.timerIndex], c.currentTimerSalvaged = !1, c.currentTimer.update(a), c.currentTimer = null;
            this._currentTargetSalvaged && 0 === this._currentTarget.timers.length && this._removeHashElement(this._currentTarget)
        }
        b = 0;
        for (c = this._updatesNegList; b < c.length;)e = c[b], e.markedForDeletion ? this._removeUpdateFromHash(e) : b++;
        b = 0;
        for (c = this._updates0List; b < c.length;)e = c[b], e.markedForDeletion ? this._removeUpdateFromHash(e) : b++;
        b = 0;
        for (c = this._updatesPosList; b < c.length;)e = c[b], e.markedForDeletion ? this._removeUpdateFromHash(e) : b++;
        this._updateHashLocked = !1;
        this._currentTarget = null
    },
    scheduleCallbackForTarget: function (a, b, c, d, e, f) {
        this.schedule(b, a, c, d, e, f, a.__instanceId + "")
    },
    schedule: function (a, b, c, d, e, f, g) {
        var h = !1;
        if ("function" !== typeof a)var k = a, h = !0;
        !1 === h ? 5 === arguments.length && (g = e, f = d, e = 0, d = cc.REPEAT_FOREVER) : 4 === arguments.length && (f = d, d = cc.REPEAT_FOREVER, e = 0);
        cc.assert(b, cc._LogInfos.Scheduler_scheduleCallbackForTarget_3);
        !1 === h && cc.assert(g, "key should not be empty!");
        var m = this._hashForTimers[b.__instanceId];
        m ? cc.assert(m.paused === f, "") : (m = new cc.HashTimerEntry(null, b, 0, null, null, f, null), this._arrayForTimers.push(m), this._hashForTimers[b.__instanceId] = m);
        var n, p;
        if (null == m.timers)m.timers = []; else if (!1 === h)
            for (p = 0; p < m.timers.length; p++) {
                if (n = m.timers[p], a === n._callback) {
                    cc.log(cc._LogInfos.Scheduler_scheduleCallbackForTarget, n.getInterval().toFixed(4), c.toFixed(4));
                    n._interval = c;
                    return
                }
            } else
            for (p = 0; p < m.timers.length; ++p)
                if ((n = m.timers[p]) && k === n.getSelector()) {
                    cc.log("CCScheduler#scheduleSelector. Selector already scheduled. Updating interval from: %.4f to %.4f", n.getInterval(), c);
                    n.setInterval(c);
                    return
                }
        !1 === h ? (n = new cc.TimerTargetCallback, n.initWithCallback(this, a, b, g, c, d, e)) : (n = new cc.TimerTargetSelector, n.initWithSelector(this, k, b, c, d, e));
        m.timers.push(n)
    },
    scheduleUpdate: function (a, b, c) {
        this._schedulePerFrame(function (c) {
            a.update(c)
        }, a, b, c)
    },
    _getUnscheduleMark: function (a, b) {
        switch (typeof a) {
            case"number":
            case"string":
                return a === b.getKey();
            case"function":
                return a === b._callback;
            default:
                return a === b.getSelector()
        }
    },
    unschedule: function (a, b) {
        if (b && a) {
            var c = this._hashForTimers[b.__instanceId];
            if (c)
                for (var d = c.timers, e = 0, f = d.length; e < f; e++) {
                    var g = d[e];
                    if (this._getUnscheduleMark(a, g)) {
                        g !== c.currentTimer || c.currentTimerSalvaged || (c.currentTimerSalvaged = !0);
                        d.splice(e, 1);
                        c.timerIndex >= e && c.timerIndex--;
                        0 === d.length && (this._currentTarget === c ? this._currentTargetSalvaged = !0 : this._removeHashElement(c));
                        break
                    }
                }
        }
    },
    unscheduleUpdate: function (a) {
        null != a && (a = this._hashForUpdates[a.__instanceId]) && (this._updateHashLocked ? a.entry.markedForDeletion = !0 : this._removeUpdateFromHash(a.entry))
    },
    unscheduleAllForTarget: function (a) {
        if (null != a) {
            var b = this._hashForTimers[a.__instanceId];
            b && (-1 < b.timers.indexOf(b.currentTimer) && !b.currentTimerSalvaged && (b.currentTimerSalvaged = !0), b.timers.length = 0, this._currentTarget === b ? this._currentTargetSalvaged = !0 : this._removeHashElement(b));
            this.unscheduleUpdate(a)
        }
    },
    unscheduleAll: function () {
        this.unscheduleAllWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM)
    },
    unscheduleAllWithMinPriority: function (a) {
        var b, c, d = this._arrayForTimers;
        for (b = 0; b < d.length; b++)c = d[b], this.unscheduleAllForTarget(c.target);
        d = 0;
        if (0 > a)
            for (b = 0; b < this._updatesNegList.length;)d = this._updatesNegList.length, (c = this._updatesNegList[b]) && c.priority >= a && this.unscheduleUpdate(c.target), d == this._updatesNegList.length && b++;
        if (0 >= a)
            for (b = 0; b < this._updates0List.length;)d = this._updates0List.length, (c = this._updates0List[b]) && this.unscheduleUpdate(c.target), d == this._updates0List.length && b++;
        for (b = 0; b < this._updatesPosList.length;)d = this._updatesPosList.length, (c = this._updatesPosList[b]) && c.priority >= a && this.unscheduleUpdate(c.target), d == this._updatesPosList.length && b++
    },
    isScheduled: function (a, b) {
        cc.assert(a, "Argument key must not be empty");
        cc.assert(b, "Argument target must be non-nullptr");
        var c = this._hashForUpdates[b.__instanceId];
        if (!c)return !1;
        if (null != c.timers)
            for (var c = c.timers, d = 0; d < c.length; ++d)
                if (a === c[d].getKey())return !0;
        return !1
    },
    pauseAllTargets: function () {
        return this.pauseAllTargetsWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM)
    },
    pauseAllTargetsWithMinPriority: function (a) {
        var b = [], c, d = this._arrayForTimers, e, f;
        e = 0;
        for (f = d.length; e < f; e++)
            if (c = d[e])c.paused = !0, b.push(c.target);
        if (0 > a)
            for (e = 0; e < this._updatesNegList.length; e++)(c = this._updatesNegList[e]) && c.priority >= a && (c.paused = !0, b.push(c.target));
        if (0 >= a)
            for (e = 0; e < this._updates0List.length; e++)
                if (c = this._updates0List[e])c.paused = !0, b.push(c.target);
        for (e = 0; e < this._updatesPosList.length; e++)(c = this._updatesPosList[e]) && c.priority >= a && (c.paused = !0, b.push(c.target));
        return b
    },
    resumeTargets: function (a) {
        if (a)
            for (var b = 0; b < a.length; b++)this.resumeTarget(a[b])
    },
    pauseTarget: function (a) {
        cc.assert(a, cc._LogInfos.Scheduler_pauseTarget);
        var b = this._hashForTimers[a.__instanceId];
        b && (b.paused = !0);
        if (a = this._hashForUpdates[a.__instanceId])a.entry.paused = !0
    },
    resumeTarget: function (a) {
        cc.assert(a, cc._LogInfos.Scheduler_resumeTarget);
        var b = this._hashForTimers[a.__instanceId];
        b && (b.paused = !1);
        if (a = this._hashForUpdates[a.__instanceId])a.entry.paused = !1
    },
    isTargetPaused: function (a) {
        cc.assert(a, cc._LogInfos.Scheduler_isTargetPaused);
        var b = this._hashForTimers[a.__instanceId];
        return b ? b.paused : (a = this._hashForUpdates[a.__instanceId]) ? a.entry.paused : !1
    },
    scheduleUpdateForTarget: function (a, b, c) {
        this.scheduleUpdate(a, b, c)
    },
    unscheduleCallbackForTarget: function (a, b) {
        this.unschedule(b, a)
    },
    unscheduleUpdateForTarget: function (a) {
        this.unscheduleUpdate(a)
    },
    unscheduleAllCallbacksForTarget: function (a) {
        this.unschedule(a.__instanceId + "", a)
    },
    unscheduleAllCallbacks: function () {
        this.unscheduleAllWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM)
    },
    unscheduleAllCallbacksWithMinPriority: function (a) {
        this.unscheduleAllWithMinPriority(a)
    }
});
cc.Scheduler.PRIORITY_SYSTEM = -2147483648;
cc.PI2 = 2 * Math.PI;
cc.DrawingPrimitiveCanvas = cc.Class.extend({
    _cacheArray: [], _renderContext: null, ctor: function (a) {
        this._renderContext = a
    }, drawPoint: function (a, b) {
        b || (b = 1);
        var c = cc.view.getScaleX(), d = cc.view.getScaleY(), d = cc.p(a.x * c, a.y * d), e = this._renderContext.getContext();
        e.beginPath();
        e.arc(d.x, -d.y, b * c, 0, 2 * Math.PI, !1);
        e.closePath();
        e.fill()
    }, drawPoints: function (a, b, c) {
        if (null != a) {
            c || (c = 1);
            b = this._renderContext.getContext();
            var d = cc.view.getScaleX(), e = cc.view.getScaleY();
            b.beginPath();
            for (var f = 0, g = a.length; f < g; f++)b.arc(a[f].x * d, -a[f].y * e, c * d, 0, 2 * Math.PI, !1);
            b.closePath();
            b.fill()
        }
    }, drawLine: function (a, b) {
        var c = this._renderContext.getContext(), d = cc.view.getScaleX(), e = cc.view.getScaleY();
        c.beginPath();
        c.moveTo(a.x * d, -a.y * e);
        c.lineTo(b.x * d, -b.y * e);
        c.closePath();
        c.stroke()
    }, drawRect: function (a, b) {
        this.drawLine(cc.p(a.x, a.y), cc.p(b.x, a.y));
        this.drawLine(cc.p(b.x, a.y), cc.p(b.x, b.y));
        this.drawLine(cc.p(b.x, b.y), cc.p(a.x, b.y));
        this.drawLine(cc.p(a.x, b.y), cc.p(a.x, a.y))
    }, drawSolidRect: function (a, b, c) {
        a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
        this.drawSolidPoly(a, 4, c)
    }, drawPoly: function (a, b, c, d) {
        d = d || !1;
        if (null != a) {
            if (3 > a.length)throw Error("Polygon's point must greater than 2");
            var e = a[0];
            b = this._renderContext.getContext();
            var f = cc.view.getScaleX(), g = cc.view.getScaleY();
            b.beginPath();
            b.moveTo(e.x * f, -e.y * g);
            for (var e = 1, h = a.length; e < h; e++)b.lineTo(a[e].x * f, -a[e].y * g);
            c && b.closePath();
            d ? b.fill() : b.stroke()
        }
    }, drawSolidPoly: function (a, b, c) {
        this.setDrawColor(c.r, c.g, c.b, c.a);
        this.drawPoly(a, b, !0, !0)
    }, drawCircle: function (a, b, c, d, e) {
        e = e || !1;
        d = this._renderContext.getContext();
        var f = cc.view.getScaleX(), g = cc.view.getScaleY();
        d.beginPath();
        d.arc(0 | a.x * f, 0 | -(a.y * g), b * f, -c, -(c - 2 * Math.PI), !1);
        e && d.lineTo(0 | a.x * f, 0 | -(a.y * g));
        d.stroke()
    }, drawQuadBezier: function (a, b, c, d) {
        for (var e = this._cacheArray, f = e.length = 0, g = 0; g < d; g++) {
            var h = Math.pow(1 - f, 2) * a.x + 2 * (1 - f) * f * b.x + f * f * c.x, k = Math.pow(1 - f, 2) * a.y + 2 * (1 - f) * f * b.y + f * f * c.y;
            e.push(cc.p(h, k));
            f += 1 / d
        }
        e.push(cc.p(c.x, c.y));
        this.drawPoly(e, d + 1, !1, !1)
    }, drawCubicBezier: function (a, b, c, d, e) {
        for (var f = this._cacheArray, g = f.length = 0, h = 0; h < e; h++) {
            var k = Math.pow(1 - g, 3) * a.x + 3 * Math.pow(1 - g, 2) * g * b.x + 3 * (1 - g) * g * g * c.x + g * g * g * d.x, m = Math.pow(1 - g, 3) * a.y + 3 * Math.pow(1 - g, 2) * g * b.y + 3 * (1 - g) * g * g * c.y + g * g * g * d.y;
            f.push(cc.p(k, m));
            g += 1 / e
        }
        f.push(cc.p(d.x, d.y));
        this.drawPoly(f, e + 1, !1, !1)
    }, drawCatmullRom: function (a, b) {
        this.drawCardinalSpline(a, 0.5, b)
    }, drawCardinalSpline: function (a, b, c) {
        cc._renderContext.setStrokeStyle("rgba(255,255,255,1)");
        var d = this._cacheArray;
        d.length = 0;
        for (var e, f, g = 1 / a.length, h = 0; h < c + 1; h++)f = h / c, 1 === f ? (e = a.length - 1, f = 1) : (e = 0 | f / g, f = (f - g * e) / g), e = cc.CardinalSplineAt(cc.getControlPointAt(a, e - 1), cc.getControlPointAt(a, e - 0), cc.getControlPointAt(a, e + 1), cc.getControlPointAt(a, e + 2), b, f), d.push(e);
        this.drawPoly(d, c + 1, !1, !1)
    }, drawImage: function (a, b, c, d, e) {
        var f = arguments.length, g = this._renderContext.getContext();
        switch (f) {
            case 2:
                g.drawImage(a, b.x, -(b.y + a.height));
                break;
            case 3:
                g.drawImage(a, b.x, -(b.y + c.height), c.width, c.height);
                break;
            case 5:
                g.drawImage(a, b.x, b.y, c.width, c.height, d.x, -(d.y + e.height), e.width, e.height);
                break;
            default:
                throw Error("Argument must be non-nil");
        }
    }, drawStar: function (a, b, c) {
        a = a || this._renderContext;
        var d = a.getContext();
        b *= cc.view.getScaleX();
        c = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b);
        a.setFillStyle(c + ",1)");
        var e = b / 10;
        d.beginPath();
        d.moveTo(-b, b);
        d.lineTo(0, e);
        d.lineTo(b, b);
        d.lineTo(e, 0);
        d.lineTo(b, -b);
        d.lineTo(0, -e);
        d.lineTo(-b, -b);
        d.lineTo(-e, 0);
        d.lineTo(-b, b);
        d.closePath();
        d.fill();
        var f = d.createRadialGradient(0, 0, e, 0, 0, b);
        f.addColorStop(0, c + ", 1)");
        f.addColorStop(0.3, c + ", 0.8)");
        f.addColorStop(1, c + ", 0.0)");
        a.setFillStyle(f);
        d.beginPath();
        d.arc(0, 0, b - e, 0, cc.PI2, !1);
        d.closePath();
        d.fill()
    }, drawColorBall: function (a, b, c) {
        a = a || this._renderContext;
        var d = a.getContext();
        b *= cc.view.getScaleX();
        c = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b);
        var e = d.createRadialGradient(0, 0, b / 10, 0, 0, b);
        e.addColorStop(0, c + ", 1)");
        e.addColorStop(0.3, c + ", 0.8)");
        e.addColorStop(0.6, c + ", 0.4)");
        e.addColorStop(1, c + ", 0.0)");
        a.setFillStyle(e);
        d.beginPath();
        d.arc(0, 0, b, 0, cc.PI2, !1);
        d.closePath();
        d.fill()
    }, fillText: function (a, b, c) {
        this._renderContext.getContext().fillText(a, b, -c)
    }, setDrawColor: function (a, b, c, d) {
        this._renderContext.setFillStyle("rgba(" + a + "," + b + "," + c + "," + d / 255 + ")");
        this._renderContext.setStrokeStyle("rgba(" + a + "," + b + "," + c + "," + d / 255 + ")")
    }, setPointSize: function (a) {
    }, setLineWidth: function (a) {
        this._renderContext.getContext().lineWidth = a * cc.view.getScaleX()
    }
});
cc.DrawingPrimitiveWebGL = cc.Class.extend({
    _renderContext: null,
    _initialized: !1,
    _shader: null,
    _colorLocation: -1,
    _colorArray: null,
    _pointSizeLocation: -1,
    _pointSize: -1,
    ctor: function (a) {
        null == a && (a = cc._renderContext);
        if (!a instanceof WebGLRenderingContext)throw"Can't initialise DrawingPrimitiveWebGL. context need is WebGLRenderingContext";
        this._renderContext = a;
        this._colorArray = new Float32Array([1, 1, 1, 1])
    },
    lazy_init: function () {
        this._initialized || (this._shader = cc.shaderCache.programForKey(cc.SHADER_POSITION_UCOLOR), this._colorLocation = this._renderContext.getUniformLocation(this._shader.getProgram(), "u_color"), this._pointSizeLocation = this._renderContext.getUniformLocation(this._shader.getProgram(), "u_pointSize"), this._initialized = !0)
    },
    drawInit: function () {
        this._initialized = !1
    },
    drawPoint: function (a) {
        this.lazy_init();
        var b = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        b.uniform4fv(this._colorLocation, this._colorArray);
        this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);
        var c = b.createBuffer();
        b.bindBuffer(b.ARRAY_BUFFER, c);
        b.bufferData(b.ARRAY_BUFFER, new Float32Array([a.x, a.y]), b.STATIC_DRAW);
        b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, b.FLOAT, !1, 0, 0);
        b.drawArrays(b.POINTS, 0, 1);
        b.deleteBuffer(c);
        cc.incrementGLDraws(1)
    },
    drawPoints: function (a, b) {
        if (a && 0 !== a.length) {
            this.lazy_init();
            var c = this._renderContext;
            this._shader.use();
            this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
            c.uniform4fv(this._colorLocation, this._colorArray);
            this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);
            var d = c.createBuffer();
            c.bindBuffer(c.ARRAY_BUFFER, d);
            c.bufferData(c.ARRAY_BUFFER, this._pointsToTypeArray(a), c.STATIC_DRAW);
            c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, 0);
            c.drawArrays(c.POINTS, 0, a.length);
            c.deleteBuffer(d);
            cc.incrementGLDraws(1)
        }
    },
    _pointsToTypeArray: function (a) {
        for (var b = new Float32Array(2 * a.length), c = 0; c < a.length; c++)b[2 * c] = a[c].x, b[2 * c + 1] = a[c].y;
        return b
    },
    drawLine: function (a, b) {
        this.lazy_init();
        var c = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        c.uniform4fv(this._colorLocation, this._colorArray);
        var d = c.createBuffer();
        c.bindBuffer(c.ARRAY_BUFFER, d);
        c.bufferData(c.ARRAY_BUFFER, this._pointsToTypeArray([a, b]), c.STATIC_DRAW);
        c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, 0);
        c.drawArrays(c.LINES, 0, 2);
        c.deleteBuffer(d);
        cc.incrementGLDraws(1)
    },
    drawRect: function (a, b) {
        this.drawLine(cc.p(a.x, a.y), cc.p(b.x, a.y));
        this.drawLine(cc.p(b.x, a.y), cc.p(b.x, b.y));
        this.drawLine(cc.p(b.x, b.y), cc.p(a.x, b.y));
        this.drawLine(cc.p(a.x, b.y), cc.p(a.x, a.y))
    },
    drawSolidRect: function (a, b, c) {
        a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
        this.drawSolidPoly(a, 4, c)
    },
    drawPoly: function (a, b, c) {
        this.lazy_init();
        b = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        b.uniform4fv(this._colorLocation, this._colorArray);
        var d = b.createBuffer();
        b.bindBuffer(b.ARRAY_BUFFER, d);
        b.bufferData(b.ARRAY_BUFFER, this._pointsToTypeArray(a), b.STATIC_DRAW);
        b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, b.FLOAT, !1, 0, 0);
        c ? b.drawArrays(b.LINE_LOOP, 0, a.length) : b.drawArrays(b.LINE_STRIP, 0, a.length);
        b.deleteBuffer(d);
        cc.incrementGLDraws(1)
    },
    drawSolidPoly: function (a, b, c) {
        this.lazy_init();
        c && this.setDrawColor(c.r, c.g, c.b, c.a);
        b = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        b.uniform4fv(this._colorLocation, this._colorArray);
        c = b.createBuffer();
        b.bindBuffer(b.ARRAY_BUFFER, c);
        b.bufferData(b.ARRAY_BUFFER, this._pointsToTypeArray(a), b.STATIC_DRAW);
        b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, b.FLOAT, !1, 0, 0);
        b.drawArrays(b.TRIANGLE_FAN, 0, a.length);
        b.deleteBuffer(c);
        cc.incrementGLDraws(1)
    },
    drawCircle: function (a, b, c, d, e) {
        this.lazy_init();
        var f = 1;
        e && f++;
        var g = 2 * Math.PI / d;
        if (e = new Float32Array(2 * (d + 2))) {
            for (var h = 0; h <= d; h++) {
                var k = h * g, m = b * Math.cos(k + c) + a.x, k = b * Math.sin(k + c) + a.y;
                e[2 * h] = m;
                e[2 * h + 1] = k
            }
            e[2 * (d + 1)] = a.x;
            e[2 * (d + 1) + 1] = a.y;
            a = this._renderContext;
            this._shader.use();
            this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
            a.uniform4fv(this._colorLocation, this._colorArray);
            b = a.createBuffer();
            a.bindBuffer(a.ARRAY_BUFFER, b);
            a.bufferData(a.ARRAY_BUFFER, e, a.STATIC_DRAW);
            a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
            a.drawArrays(a.LINE_STRIP, 0, d + f);
            a.deleteBuffer(b);
            cc.incrementGLDraws(1)
        }
    },
    drawQuadBezier: function (a, b, c, d) {
        this.lazy_init();
        for (var e = new Float32Array(2 * (d + 1)), f = 0, g = 0; g < d; g++)e[2 * g] = Math.pow(1 - f, 2) * a.x + 2 * (1 - f) * f * b.x + f * f * c.x, e[2 * g + 1] = Math.pow(1 - f, 2) * a.y + 2 * (1 - f) * f * b.y + f * f * c.y, f += 1 / d;
        e[2 * d] = c.x;
        e[2 * d + 1] = c.y;
        a = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        a.uniform4fv(this._colorLocation, this._colorArray);
        b = a.createBuffer();
        a.bindBuffer(a.ARRAY_BUFFER, b);
        a.bufferData(a.ARRAY_BUFFER, e, a.STATIC_DRAW);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
        a.drawArrays(a.LINE_STRIP, 0, d + 1);
        a.deleteBuffer(b);
        cc.incrementGLDraws(1)
    },
    drawCubicBezier: function (a, b, c, d, e) {
        this.lazy_init();
        for (var f = new Float32Array(2 * (e + 1)), g = 0, h = 0; h < e; h++)f[2 * h] = Math.pow(1 - g, 3) * a.x + 3 * Math.pow(1 - g, 2) * g * b.x + 3 * (1 - g) * g * g * c.x + g * g * g * d.x, f[2 * h + 1] = Math.pow(1 - g, 3) * a.y + 3 * Math.pow(1 -
                g, 2) * g * b.y + 3 * (1 - g) * g * g * c.y + g * g * g * d.y, g += 1 / e;
        f[2 * e] = d.x;
        f[2 * e + 1] = d.y;
        a = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        a.uniform4fv(this._colorLocation, this._colorArray);
        b = a.createBuffer();
        a.bindBuffer(a.ARRAY_BUFFER, b);
        a.bufferData(a.ARRAY_BUFFER, f, a.STATIC_DRAW);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
        a.drawArrays(a.LINE_STRIP, 0, e + 1);
        a.deleteBuffer(b);
        cc.incrementGLDraws(1)
    },
    drawCatmullRom: function (a, b) {
        this.drawCardinalSpline(a, 0.5, b)
    },
    drawCardinalSpline: function (a, b, c) {
        this.lazy_init();
        for (var d = new Float32Array(2 * (c + 1)), e, f, g = 1 / a.length, h = 0; h < c + 1; h++)f = h / c, 1 === f ? (e = a.length - 1, f = 1) : (e = 0 | f / g, f = (f - g * e) / g), e = cc.cardinalSplineAt(cc.getControlPointAt(a, e - 1), cc.getControlPointAt(a, e), cc.getControlPointAt(a, e + 1), cc.getControlPointAt(a, e + 2), b, f), d[2 * h] = e.x, d[2 * h + 1] = e.y;
        a = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        a.uniform4fv(this._colorLocation, this._colorArray);
        b = a.createBuffer();
        a.bindBuffer(a.ARRAY_BUFFER, b);
        a.bufferData(a.ARRAY_BUFFER, d, a.STATIC_DRAW);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
        a.drawArrays(a.LINE_STRIP, 0, c + 1);
        a.deleteBuffer(b);
        cc.incrementGLDraws(1)
    },
    setDrawColor: function (a, b, c, d) {
        this._colorArray[0] = a / 255;
        this._colorArray[1] = b / 255;
        this._colorArray[2] = c / 255;
        this._colorArray[3] = d / 255
    },
    setPointSize: function (a) {
        this._pointSize = a * cc.contentScaleFactor()
    },
    setLineWidth: function (a) {
        this._renderContext.lineWidth && this._renderContext.lineWidth(a)
    }
});
cc._tmp.PrototypeLabelTTF = function () {
    var a = cc.LabelTTF.prototype;
    cc.defineGetterSetter(a, "color", a.getColor, a.setColor);
    cc.defineGetterSetter(a, "opacity", a.getOpacity, a.setOpacity);
    cc.defineGetterSetter(a, "string", a.getString, a.setString);
    cc.defineGetterSetter(a, "textAlign", a.getHorizontalAlignment, a.setHorizontalAlignment);
    cc.defineGetterSetter(a, "verticalAlign", a.getVerticalAlignment, a.setVerticalAlignment);
    cc.defineGetterSetter(a, "fontSize", a.getFontSize, a.setFontSize);
    cc.defineGetterSetter(a, "fontName", a.getFontName, a.setFontName);
    cc.defineGetterSetter(a, "font", a._getFont, a._setFont);
    cc.defineGetterSetter(a, "boundingWidth", a._getBoundingWidth, a._setBoundingWidth);
    cc.defineGetterSetter(a, "boundingHeight", a._getBoundingHeight, a._setBoundingHeight);
    cc.defineGetterSetter(a, "fillStyle", a._getFillStyle, a.setFontFillColor);
    cc.defineGetterSetter(a, "strokeStyle", a._getStrokeStyle, a._setStrokeStyle);
    cc.defineGetterSetter(a, "lineWidth", a._getLineWidth, a._setLineWidth);
    cc.defineGetterSetter(a, "shadowOffsetX", a._getShadowOffsetX, a._setShadowOffsetX);
    cc.defineGetterSetter(a, "shadowOffsetY", a._getShadowOffsetY, a._setShadowOffsetY);
    cc.defineGetterSetter(a, "shadowOpacity", a._getShadowOpacity, a._setShadowOpacity);
    cc.defineGetterSetter(a, "shadowBlur", a._getShadowBlur, a._setShadowBlur)
};
cc.LabelTTF = cc.Sprite.extend({
    _dimensions: null,
    _hAlignment: cc.TEXT_ALIGNMENT_CENTER,
    _vAlignment: cc.VERTICAL_TEXT_ALIGNMENT_TOP,
    _fontName: null,
    _fontSize: 0,
    _string: "",
    _originalText: null,
    _shadowEnabled: !1,
    _shadowOffset: null,
    _shadowOpacity: 0,
    _shadowBlur: 0,
    _shadowColor: null,
    _strokeEnabled: !1,
    _strokeColor: null,
    _strokeSize: 0,
    _textFillColor: null,
    _strokeShadowOffsetX: 0,
    _strokeShadowOffsetY: 0,
    _needUpdateTexture: !1,
    _lineWidths: null,
    _className: "LabelTTF",
    _fontStyle: "normal",
    _fontWeight: "normal",
    _lineHeight: "normal",
    initWithString: function (a, b, c, d, e, f) {
        a = a ? a + "" : "";
        c = c || 16;
        d = d || cc.size(0, 0);
        e = e || cc.TEXT_ALIGNMENT_LEFT;
        f = f || cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        this._opacityModifyRGB = !1;
        this._dimensions = cc.size(d.width, d.height);
        this._fontName = b || "Arial";
        this._hAlignment = e;
        this._vAlignment = f;
        this._fontSize = c;
        this._renderCmd._setFontStyle(this._fontName, c, this._fontStyle, this._fontWeight);
        this.string = a;
        this._renderCmd._setColorsString();
        this._renderCmd._updateTexture();
        this._setUpdateTextureDirty();
        return !0
    },
    _setUpdateTextureDirty: function () {
        this._needUpdateTexture = !0;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.textDirty)
    },
    ctor: function (a, b, c, d, e, f) {
        cc.Sprite.prototype.ctor.call(this);
        this._dimensions = cc.size(0, 0);
        this._hAlignment = cc.TEXT_ALIGNMENT_LEFT;
        this._vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        this._opacityModifyRGB = !1;
        this._fontName = "Arial";
        this._shadowEnabled = !1;
        this._shadowOffset = cc.p(0, 0);
        this._shadowBlur = this._shadowOpacity = 0;
        this._strokeEnabled = !1;
        this._strokeColor = cc.color(255, 255, 255, 255);
        this._strokeSize = 0;
        this._textFillColor = cc.color(255, 255, 255, 255);
        this._strokeShadowOffsetY = this._strokeShadowOffsetX = 0;
        this._needUpdateTexture = !1;
        this._lineWidths = [];
        this._renderCmd._setColorsString();
        this._textureLoaded = !0;
        b && b instanceof cc.FontDefinition ? this.initWithStringAndTextDefinition(a, b) : cc.LabelTTF.prototype.initWithString.call(this, a, b, c, d, e, f)
    },
    init: function () {
        return this.initWithString(" ", this._fontName, this._fontSize)
    },
    description: function () {
        return "\x3ccc.LabelTTF | FontName \x3d" + this._fontName + " FontSize \x3d " + this._fontSize.toFixed(1) + "\x3e"
    },
    getLineHeight: function () {
        return !this._lineHeight || this._lineHeight.charAt ? this._renderCmd._getFontClientHeight() : this._lineHeight || this._renderCmd._getFontClientHeight()
    },
    setLineHeight: function (a) {
        this._lineHeight = a
    },
    getString: function () {
        return this._string
    },
    getHorizontalAlignment: function () {
        return this._hAlignment
    },
    getVerticalAlignment: function () {
        return this._vAlignment
    },
    getDimensions: function () {
        return cc.size(this._dimensions)
    },
    getFontSize: function () {
        return this._fontSize
    },
    getFontName: function () {
        return this._fontName
    },
    initWithStringAndTextDefinition: function (a, b) {
        this._updateWithTextDefinition(b, !1);
        this.string = a;
        return !0
    },
    setTextDefinition: function (a) {
        a && this._updateWithTextDefinition(a, !0)
    },
    getTextDefinition: function () {
        return this._prepareTextDefinition(!1)
    },
    enableShadow: function (a, b, c, d) {
        null != a.r && null != a.g && null != a.b && null != a.a ? this._enableShadow(a, b, c) : this._enableShadowNoneColor(a, b, c, d)
    },
    _enableShadowNoneColor: function (a, b, c, d) {
        c = c || 0.5;
        !1 === this._shadowEnabled && (this._shadowEnabled = !0);
        var e = this._shadowOffset;
        if (e && e.x !== a || e._y !== b)e.x = a, e.y = b;
        this._shadowOpacity !== c && (this._shadowOpacity = c);
        this._renderCmd._setColorsString();
        this._shadowBlur !== d && (this._shadowBlur = d);
        this._setUpdateTextureDirty()
    },
    _enableShadow: function (a, b, c) {
        this._shadowColor || (this._shadowColor = cc.color(255, 255, 255, 128));
        this._shadowColor.r = a.r;
        this._shadowColor.g = a.g;
        this._shadowColor.b = a.b;
        this._enableShadowNoneColor(b.width || b.x || 0, b.height || b.y || 0, null != a.a ? a.a / 255 : 0.5, c)
    },
    _getShadowOffsetX: function () {
        return this._shadowOffset.x
    },
    _setShadowOffsetX: function (a) {
        !1 === this._shadowEnabled && (this._shadowEnabled = !0);
        this._shadowOffset.x !== a && (this._shadowOffset.x = a, this._setUpdateTextureDirty())
    },
    _getShadowOffsetY: function () {
        return this._shadowOffset._y
    },
    _setShadowOffsetY: function (a) {
        !1 === this._shadowEnabled && (this._shadowEnabled = !0);
        this._shadowOffset._y !== a && (this._shadowOffset._y = a, this._setUpdateTextureDirty())
    },
    _getShadowOffset: function () {
        return cc.p(this._shadowOffset.x, this._shadowOffset.y)
    },
    _setShadowOffset: function (a) {
        !1 === this._shadowEnabled && (this._shadowEnabled = !0);
        if (this._shadowOffset.x !== a.x || this._shadowOffset.y !== a.y)this._shadowOffset.x = a.x, this._shadowOffset.y = a.y, this._setUpdateTextureDirty()
    },
    _getShadowOpacity: function () {
        return this._shadowOpacity
    },
    _setShadowOpacity: function (a) {
        !1 === this._shadowEnabled && (this._shadowEnabled = !0);
        this._shadowOpacity !== a && (this._shadowOpacity = a, this._renderCmd._setColorsString(), this._setUpdateTextureDirty())
    },
    _getShadowBlur: function () {
        return this._shadowBlur
    },
    _setShadowBlur: function (a) {
        !1 === this._shadowEnabled && (this._shadowEnabled = !0);
        this._shadowBlur !== a && (this._shadowBlur = a, this._setUpdateTextureDirty())
    },
    disableShadow: function () {
        this._shadowEnabled && (this._shadowEnabled = !1, this._setUpdateTextureDirty())
    },
    enableStroke: function (a, b) {
        !1 === this._strokeEnabled && (this._strokeEnabled = !0);
        var c = this._strokeColor;
        if (c.r !== a.r || c.g !== a.g || c.b !== a.b)c.r = a.r, c.g = a.g, c.b = a.b, this._renderCmd._setColorsString();
        this._strokeSize !== b && (this._strokeSize = b || 0);
        this._setUpdateTextureDirty()
    },
    _getStrokeStyle: function () {
        return this._strokeColor
    },
    _setStrokeStyle: function (a) {
        !1 === this._strokeEnabled && (this._strokeEnabled = !0);
        var b = this._strokeColor;
        if (b.r !== a.r || b.g !== a.g || b.b !== a.b)b.r = a.r, b.g = a.g, b.b = a.b, this._renderCmd._setColorsString(), this._setUpdateTextureDirty()
    },
    _getLineWidth: function () {
        return this._strokeSize
    },
    _setLineWidth: function (a) {
        !1 === this._strokeEnabled && (this._strokeEnabled = !0);
        this._strokeSize !== a && (this._strokeSize = a || 0, this._setUpdateTextureDirty())
    },
    disableStroke: function () {
        this._strokeEnabled && (this._strokeEnabled = !1, this._setUpdateTextureDirty())
    },
    setFontFillColor: function (a) {
        var b = this._textFillColor;
        if (b.r !== a.r || b.g !== a.g || b.b !== a.b)b.r = a.r, b.g = a.g, b.b = a.b, this._renderCmd._setColorsString(), this._needUpdateTexture = !0
    },
    _getFillStyle: function () {
        return this._textFillColor
    },
    _updateWithTextDefinition: function (a, b) {
        a.fontDimensions ? (this._dimensions.width = a.boundingWidth, this._dimensions.height = a.boundingHeight) : (this._dimensions.width = 0, this._dimensions.height = 0);
        this._hAlignment = a.textAlign;
        this._vAlignment = a.verticalAlign;
        this._fontName = a.fontName;
        this._fontSize = a.fontSize || 12;
        this._lineHeight = a.lineHeight ? a.lineHeight : this._fontSize;
        this._renderCmd._setFontStyle(a);
        a.shadowEnabled && this.enableShadow(a.shadowOffsetX, a.shadowOffsetY, a.shadowOpacity, a.shadowBlur);
        a.strokeEnabled && this.enableStroke(a.strokeStyle, a.lineWidth);
        this.setFontFillColor(a.fillStyle);
        b && this._renderCmd._updateTexture();
        var c = cc.Node._dirtyFlags;
        this._renderCmd.setDirtyFlag(c.colorDirty | c.opacityDirty | c.textDirty)
    },
    _prepareTextDefinition: function (a) {
        var b = new cc.FontDefinition;
        a ? (b.fontSize = this._fontSize, b.boundingWidth = cc.contentScaleFactor() * this._dimensions.width, b.boundingHeight = cc.contentScaleFactor() * this._dimensions.height) : (b.fontSize = this._fontSize, b.boundingWidth = this._dimensions.width, b.boundingHeight = this._dimensions.height);
        b.fontName = this._fontName;
        b.textAlign = this._hAlignment;
        b.verticalAlign = this._vAlignment;
        if (this._strokeEnabled) {
            b.strokeEnabled = !0;
            var c = this._strokeColor;
            b.strokeStyle = cc.color(c.r, c.g, c.b);
            b.lineWidth = this._strokeSize
        } else b.strokeEnabled = !1;
        this._shadowEnabled ? (b.shadowEnabled = !0, b.shadowBlur = this._shadowBlur, b.shadowOpacity = this._shadowOpacity, b.shadowOffsetX = (a ? cc.contentScaleFactor() : 1) * this._shadowOffset.x, b.shadowOffsetY = (a ? cc.contentScaleFactor() : 1) * this._shadowOffset.y) : b._shadowEnabled = !1;
        a = this._textFillColor;
        b.fillStyle = cc.color(a.r, a.g, a.b);
        return b
    },
    setString: function (a) {
        a = String(a);
        this._originalText !== a && (this._originalText = a + "", this._updateString(), this._setUpdateTextureDirty(), this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.transformDirty))
    },
    _updateString: function () {
        this._string && "" !== this._string || this._string === this._originalText || (cc.renderer.childrenOrderDirty = !0);
        this._string = this._originalText
    },
    setHorizontalAlignment: function (a) {
        a !== this._hAlignment && (this._hAlignment = a, this._setUpdateTextureDirty())
    },
    setVerticalAlignment: function (a) {
        a !== this._vAlignment && (this._vAlignment = a, this._setUpdateTextureDirty())
    },
    setDimensions: function (a, b) {
        var c;
        void 0 === b ? (c = a.width, b = a.height) : c = a;
        if (c !== this._dimensions.width || b !== this._dimensions.height)this._dimensions.width = c, this._dimensions.height = b, this._updateString(), this._setUpdateTextureDirty()
    },
    _getBoundingWidth: function () {
        return this._dimensions.width
    },
    _setBoundingWidth: function (a) {
        a !== this._dimensions.width && (this._dimensions.width = a, this._updateString(), this._setUpdateTextureDirty())
    },
    _getBoundingHeight: function () {
        return this._dimensions.height
    },
    _setBoundingHeight: function (a) {
        a !== this._dimensions.height && (this._dimensions.height = a, this._updateString(), this._setUpdateTextureDirty())
    },
    setFontSize: function (a) {
        this._fontSize !== a && (this._fontSize = a, this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight), this._setUpdateTextureDirty())
    },
    setFontName: function (a) {
        this._fontName && this._fontName !== a && (this._fontName = a, this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight), this._setUpdateTextureDirty())
    },
    _getFont: function () {
        return this._renderCmd._getFontStyle()
    },
    _setFont: function (a) {
        if (a = cc.LabelTTF._fontStyleRE.exec(a))this._fontSize = parseInt(a[1]), this._fontName = a[2], this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight), this._setUpdateTextureDirty()
    },
    getContentSize: function () {
        this._needUpdateTexture && this._renderCmd._updateTTF();
        return cc.Sprite.prototype.getContentSize.call(this)
    },
    _getWidth: function () {
        this._needUpdateTexture && this._renderCmd._updateTTF();
        return cc.Sprite.prototype._getWidth.call(this)
    },
    _getHeight: function () {
        this._needUpdateTexture && this._renderCmd._updateTTF();
        return cc.Sprite.prototype._getHeight.call(this)
    },
    setTextureRect: function (a, b, c) {
        cc.Sprite.prototype.setTextureRect.call(this, a, b, c, !1)
    },
    _createRenderCmd: function () {
        return cc._renderType === cc._RENDER_TYPE_CANVAS ? new cc.LabelTTF.CanvasRenderCmd(this) : new cc.LabelTTF.WebGLRenderCmd(this)
    },
    _setFontStyle: function (a) {
        this._fontStyle !== a && (this._fontStyle = a, this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight), this._setUpdateTextureDirty())
    },
    _getFontStyle: function () {
        return this._fontStyle
    },
    _setFontWeight: function (a) {
        this._fontWeight !== a && (this._fontWeight = a, this._renderCmd._setFontStyle(this._fontName, this._fontSize, this._fontStyle, this._fontWeight), this._setUpdateTextureDirty())
    },
    _getFontWeight: function () {
        return this._fontWeight
    }
});
cc.assert(cc.isFunction(cc._tmp.PrototypeLabelTTF), cc._LogInfos.MissingFile, "LabelTTFPropertyDefine.js");
cc._tmp.PrototypeLabelTTF();
delete cc._tmp.PrototypeLabelTTF;
cc.LabelTTF._fontStyleRE = /^(\d+)px\s+['"]?([\w\s\d]+)['"]?$/;
cc.LabelTTF.create = function (a, b, c, d, e, f) {
    return new cc.LabelTTF(a, b, c, d, e, f)
};
cc.LabelTTF.createWithFontDefinition = cc.LabelTTF.create;
cc.LabelTTF._SHADER_PROGRAM = cc.USE_LA88_LABELS ? cc.SHADER_POSITION_TEXTURECOLOR : cc.SHADER_POSITION_TEXTUREA8COLOR;
cc.LabelTTF.__labelHeightDiv = cc.newElement("div");
cc.LabelTTF.__labelHeightDiv.style.fontFamily = "Arial";
cc.LabelTTF.__labelHeightDiv.style.position = "absolute";
cc.LabelTTF.__labelHeightDiv.style.left = "-100px";
cc.LabelTTF.__labelHeightDiv.style.top = "-100px";
cc.LabelTTF.__labelHeightDiv.style.lineHeight = "normal";
document.body ? document.body.appendChild(cc.LabelTTF.__labelHeightDiv) : cc._addEventListener(window, "load", function () {
    this.removeEventListener("load", arguments.callee, !1);
    document.body.appendChild(cc.LabelTTF.__labelHeightDiv)
}, !1);
cc.LabelTTF.__getFontHeightByDiv = function (a, b) {
    if (a instanceof cc.FontDefinition) {
        var c = cc.LabelTTF.__fontHeightCache[a._getCanvasFontStr()];
        if (0 < c)return c;
        var d = cc.LabelTTF.__labelHeightDiv;
        d.innerHTML = "ajghl~!";
        d.style.fontFamily = a.fontName;
        d.style.fontSize = a.fontSize + "px";
        d.style.fontStyle = a.fontStyle;
        d.style.fontWeight = a.fontWeight;
        c = d.clientHeight;
        cc.LabelTTF.__fontHeightCache[a._getCanvasFontStr()] = c;
        d.innerHTML = "";
        return c
    }
    c = cc.LabelTTF.__fontHeightCache[a + "." + b];
    if (0 < c)return c;
    d = cc.LabelTTF.__labelHeightDiv;
    d.innerHTML = "ajghl~!";
    d.style.fontFamily = a;
    d.style.fontSize = b + "px";
    c = d.clientHeight;
    cc.LabelTTF.__fontHeightCache[a + "." + b] = c;
    d.innerHTML = "";
    return c
};
cc.LabelTTF.__fontHeightCache = {};
cc.LabelTTF._textAlign = ["left", "center", "right"];
cc.LabelTTF._textBaseline = ["top", "middle", "bottom"];
cc.LabelTTF.wrapInspection = !0;
cc.LabelTTF._wordRex = /([a-zA-Z0-9\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u00e9\u00e8\u00e7\u00e0\u00f9\u00ea\u00e2\u00ee\u00f4\u00fb]+|\S)/;
cc.LabelTTF._symbolRex = /^[!,.:;}\]%\?>\u3001\u2018\u201c\u300b\uff1f\u3002\uff0c\uff01]/;
cc.LabelTTF._lastWordRex = /([a-zA-Z0-9\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u00e9\u00e8\u00e7\u00e0\u00f9\u00ea\u00e2\u00ee\u00f4\u00fb]+|\S)$/;
cc.LabelTTF._lastEnglish = /[a-zA-Z0-9\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u00e9\u00e8\u00e7\u00e0\u00f9\u00ea\u00e2\u00ee\u00f4\u00fb]+$/;
cc.LabelTTF._firsrEnglish = /^[a-zA-Z0-9\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u00e9\u00e8\u00e7\u00e0\u00f9\u00ea\u00e2\u00ee\u00f4\u00fb]/;
(function () {
    cc.LabelTTF.RenderCmd = function () {
        this._fontClientHeight = 18;
        this._fontStyleStr = "";
        this._shadowColorStr = "rgba(128, 128, 128, 0.5)";
        this._strokeColorStr = "";
        this._fillColorStr = "rgba(255,255,255,1)";
        this._labelContext = this._labelCanvas = null;
        this._lineWidths = [];
        this._strings = [];
        this._isMultiLine = !1
    };
    var a = cc.LabelTTF.RenderCmd.prototype;
    a.constructor = cc.LabelTTF.RenderCmd;
    a._getLabelContext = function () {
        if (this._labelContext)return this._labelContext;
        var a = this._node;
        if (!this._labelCanvas) {
            var c = cc.newElement("canvas");
            c.width = 1;
            c.height = 1;
            var d = new cc.Texture2D;
            d.initWithElement(c);
            a.setTexture(d);
            this._labelCanvas = c
        }
        return this._labelContext = this._labelCanvas.getContext("2d")
    };
    a._setFontStyle = function (a, c, d, e) {
        a instanceof cc.FontDefinition ? (this._fontStyleStr = a._getCanvasFontStr(), this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(a)) : (this._fontStyleStr = d + " " + e + " " + c + "px '" + a + "'", this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(a, c))
    };
    a._getFontStyle = function () {
        return this._fontStyleStr
    };
    a._getFontClientHeight = function () {
        return this._fontClientHeight
    };
    a._updateTexture = function () {
        this._dirtyFlag ^= this._dirtyFlag & cc.Node._dirtyFlags.textDirty;
        var a = this._node, c = this._getLabelContext(), d = this._labelCanvas, e = a._contentSize;
        if (0 === a._string.length)return d.width = 1, d.height = e.height || 1, a._texture && a._texture.handleLoadedTexture(), a.setTextureRect(cc.rect(0, 0, 1, e.height)), !0;
        c.font = this._fontStyleStr;
        this._updateTTF();
        var f = e.width, e = e.height, g = d.width === f && d.height === e;
        d.width = f;
        d.height = e;
        g && c.clearRect(0, 0, f, e);
        this._drawTTFInCanvas(c);
        a._texture && a._texture.handleLoadedTexture();
        a.setTextureRect(cc.rect(0, 0, f, e));
        return !0
    };
    a._measureConfig = function () {
        this._getLabelContext().font = this._fontStyleStr
    };
    a._measure = function (a) {
        return this._getLabelContext().measureText(a).width
    };
    a._updateTTF = function () {
        var a = this._node, c = a._dimensions.width, d, e, f = this._lineWidths;
        f.length = 0;
        this._isMultiLine = !1;
        this._measureConfig();
        if (0 !== c)
            for (this._strings = a._string.split("\n"), d = 0; d < this._strings.length; d++)this._checkWarp(this._strings, d, c); else
            for (this._strings = a._string.split("\n"), d = 0, e = this._strings.length; d < e; d++)f.push(this._measure(this._strings[d]));
        0 < this._strings.length && (this._isMultiLine = !0);
        e = d = 0;
        a._strokeEnabled && (d = e = 2 * a._strokeSize);
        if (a._shadowEnabled) {
            var g = a._shadowOffset;
            d += 2 * Math.abs(g.x);
            e += 2 * Math.abs(g.y)
        }
        c = 0 === c ? this._isMultiLine ? cc.size(Math.ceil(Math.max.apply(Math, f) + d), Math.ceil(this._fontClientHeight * this._strings.length + e)) : cc.size(Math.ceil(this._measure(a._string) + d), Math.ceil(this._fontClientHeight +
            e)) : 0 === a._dimensions.height ? this._isMultiLine ? cc.size(Math.ceil(c + d), Math.ceil(a.getLineHeight() * this._strings.length + e)) : cc.size(Math.ceil(c + d), Math.ceil(a.getLineHeight() + e)) : cc.size(Math.ceil(c + d), Math.ceil(a._dimensions.height + e));
        "normal" !== a._getFontStyle() && (c.width = Math.ceil(c.width + 0.3 * a._fontSize));
        a.setContentSize(c);
        a._strokeShadowOffsetX = d;
        a._strokeShadowOffsetY = e;
        a = a._anchorPoint;
        this._anchorPointInPoints.x = 0.5 * d + (c.width - d) * a.x;
        this._anchorPointInPoints.y = 0.5 * e + (c.height - e) * a.y
    };
    a._drawTTFInCanvas = function (a) {
        if (a) {
            var c = this._node, d = c._strokeShadowOffsetX, e = c._strokeShadowOffsetY, f = c._contentSize.height - e, g = c._vAlignment, h = c._hAlignment, k = c._strokeSize;
            a.setTransform(1, 0, 0, 1, 0.5 * d, f + 0.5 * e);
            a.font !== this._fontStyleStr && (a.font = this._fontStyleStr);
            a.fillStyle = this._fillColorStr;
            var m = e = 0, n = c._strokeEnabled;
            n && (a.lineWidth = 2 * k, a.strokeStyle = this._strokeColorStr);
            c._shadowEnabled && (k = c._shadowOffset, a.shadowColor = this._shadowColorStr, a.shadowOffsetX = k.x, a.shadowOffsetY = -k.y, a.shadowBlur = c._shadowBlur);
            a.textBaseline = cc.LabelTTF._textBaseline[g];
            a.textAlign = cc.LabelTTF._textAlign[h];
            var p = c._contentSize.width - d, d = c.getLineHeight(), k = (d - this._fontClientHeight) / 2, e = h === cc.TEXT_ALIGNMENT_RIGHT ? e + p : h === cc.TEXT_ALIGNMENT_CENTER ? e + p / 2 : e + 0;
            if (this._isMultiLine)
                for (c = this._strings.length, g === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM ? m = d - 2 * k + f - d * c : g === cc.VERTICAL_TEXT_ALIGNMENT_CENTER && (m = (d - 2 * k) / 2 + (f - d * c) / 2), g = 0; g < c; g++)h = this._strings[g], p = -f + (d * g + k) + m, n && a.strokeText(h, e, p), a.fillText(h, e, p); else g !== cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM && (m = g === cc.VERTICAL_TEXT_ALIGNMENT_TOP ? m - f : m - 0.5 * f), n && a.strokeText(c._string, e, m), a.fillText(c._string, e, m)
        }
    };
    a._checkWarp = function (a, c, d) {
        var e = a[c], f = this._measure(e);
        if (f > d && 1 < e.length) {
            for (var g = d / f * e.length | 0, h = e.substr(g), k = f - this._measure(h), m, n = 0, p = 0; k > d && 100 > p++;)g *= d / k, g |= 0, h = e.substr(g), k = f - this._measure(h);
            for (p = 0; k < d && 100 > p++;)h && (n = (m = cc.LabelTTF._wordRex.exec(h)) ? m[0].length : 1, m = h), g += n, h = e.substr(g), k = f - this._measure(h);
            g -= n;
            0 === g && (g = 1, m = m.substr(1));
            d = e.substr(0, g);
            cc.LabelTTF.wrapInspection && cc.LabelTTF._symbolRex.test(m || h) && (f = cc.LabelTTF._lastWordRex.exec(d), g -= f ? f[0].length : 0, m = e.substr(g), d = e.substr(0, g));
            cc.LabelTTF._firsrEnglish.test(m) && (f = cc.LabelTTF._lastEnglish.exec(d)) && d !== f[0] && (g -= f[0].length, m = e.substr(g), d = e.substr(0, g));
            a[c] = m || h;
            a.splice(c, 0, d)
        }
    }
})();
(function () {
    cc.LabelTTF.CanvasRenderCmd = function (a) {
        cc.Sprite.CanvasRenderCmd.call(this, a);
        cc.LabelTTF.RenderCmd.call(this)
    };
    cc.LabelTTF.CanvasRenderCmd.prototype = Object.create(cc.Sprite.CanvasRenderCmd.prototype);
    cc.inject(cc.LabelTTF.RenderCmd.prototype, cc.LabelTTF.CanvasRenderCmd.prototype);
    var a = cc.LabelTTF.CanvasRenderCmd.prototype;
    a.constructor = cc.LabelTTF.CanvasRenderCmd;
    a.updateStatus = function () {
        var a = cc.Node._dirtyFlags, c = this._dirtyFlag, d = c & a.colorDirty, e = c & a.opacityDirty;
        d && this._updateDisplayColor();
        e && this._updateDisplayOpacity();
        d ? this._updateColor() : c & a.textDirty && this._updateTexture();
        this._dirtyFlag & a.transformDirty && (this.transform(this.getParentRenderCmd(), !0), this._dirtyFlag ^= this._dirtyFlag & cc.Node._dirtyFlags.transformDirty)
    };
    a._syncStatus = function (a) {
        var c = cc.Node._dirtyFlags, d = this._dirtyFlag, e = a ? a._node : null;
        e && e._cascadeColorEnabled && a._dirtyFlag & c.colorDirty && (d |= c.colorDirty);
        e && e._cascadeOpacityEnabled && a._dirtyFlag & c.opacityDirty && (d |= c.opacityDirty);
        a && a._dirtyFlag & c.transformDirty && (d |= c.transformDirty);
        var e = d & c.colorDirty, f = d & c.opacityDirty;
        this._dirtyFlag = d;
        e && this._syncDisplayColor();
        f && this._syncDisplayOpacity();
        e ? this._updateColor() : d & c.textDirty && this._updateTexture();
        d & c.transformDirty && this.transform(a)
    };
    a._setColorsString = function () {
        var a = this._displayedColor, c = this._node, d = c._shadowColor || this._displayedColor, e = c._strokeColor, f = c._textFillColor, g = a.r / 255, h = a.g / 255, a = a.b / 255;
        this._shadowColorStr = "rgba(" + (0 | g * d.r) + "," + (0 | h * d.g) + "," + (0 | a * d.b) + "," + c._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | g * f.r) + "," + (0 | h * f.g) + "," + (0 | a * f.b) + ", 1)";
        this._strokeColorStr = "rgba(" + (0 | g * e.r) + "," + (0 | h * e.g) + "," + (0 | a * e.b) + ", 1)"
    };
    a._updateColor = function () {
        this._setColorsString();
        this._updateTexture()
    }
})();
(function () {
    cc.LabelTTF.WebGLRenderCmd = function (a) {
        cc.Sprite.WebGLRenderCmd.call(this, a);
        cc.LabelTTF.RenderCmd.call(this);
        this.setShaderProgram(cc.shaderCache.programForKey(cc.LabelTTF._SHADER_PROGRAM))
    };
    var a = cc.LabelTTF.WebGLRenderCmd.prototype = Object.create(cc.Sprite.WebGLRenderCmd.prototype);
    cc.inject(cc.LabelTTF.RenderCmd.prototype, a);
    a.constructor = cc.LabelTTF.WebGLRenderCmd;
    a._setColorsString = function () {
        this.setDirtyFlag(cc.Node._dirtyFlags.textDirty);
        var a = this._node, c = a._strokeColor, d = a._textFillColor, e = a._shadowColor || this._displayedColor;
        this._shadowColorStr = "rgba(" + (0 | e.r) + "," + (0 | e.g) + "," + (0 | e.b) + "," + a._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | d.r) + "," + (0 | d.g) + "," + (0 | d.b) + ", 1)";
        this._strokeColorStr = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b) + ", 1)"
    };
    a.updateStatus = function () {
        var a = cc.Node._dirtyFlags, c = this._dirtyFlag, d = c & a.colorDirty, e = c & a.opacityDirty;
        d && this._updateDisplayColor();
        e && this._updateDisplayOpacity();
        d || e ? (this._setColorsString(), this._updateColor(), this._updateTexture()) : c & a.textDirty && this._updateTexture();
        this._dirtyFlag & a.transformDirty && (this.transform(this.getParentRenderCmd(), !0), this._dirtyFlag ^= this._dirtyFlag & cc.Node._dirtyFlags.transformDirty)
    };
    a._syncStatus = function (a) {
        var c = cc.Node._dirtyFlags, d = this._dirtyFlag, e = a ? a._node : null;
        e && e._cascadeColorEnabled && a._dirtyFlag & c.colorDirty && (d |= c.colorDirty);
        e && e._cascadeOpacityEnabled && a._dirtyFlag & c.opacityDirty && (d |= c.opacityDirty);
        a && a._dirtyFlag & c.transformDirty && (d |= c.transformDirty);
        var e = d & c.colorDirty, f = d & c.opacityDirty;
        this._dirtyFlag = d;
        e && this._syncDisplayColor();
        f && this._syncDisplayOpacity();
        e || f ? (this._setColorsString(), this._updateColor(), this._updateTexture()) : d & c.textDirty && this._updateTexture();
        this.transform(a)
    }
})();
cc.HashElement = cc.Class.extend({
    actions: null,
    target: null,
    actionIndex: 0,
    currentAction: null,
    currentActionSalvaged: !1,
    paused: !1,
    hh: null,
    ctor: function () {
        this.actions = [];
        this.target = null;
        this.actionIndex = 0;
        this.currentAction = null;
        this.paused = this.currentActionSalvaged = !1;
        this.hh = null
    }
});
cc.ActionManager = cc.Class.extend({
    _hashTargets: null,
    _arrayTargets: null,
    _currentTarget: null,
    _currentTargetSalvaged: !1,
    _searchElementByTarget: function (a, b) {
        for (var c = 0; c < a.length; c++)
            if (b === a[c].target)return a[c];
        return null
    },
    ctor: function () {
        this._hashTargets = {};
        this._arrayTargets = [];
        this._currentTarget = null;
        this._currentTargetSalvaged = !1
    },
    addAction: function (a, b, c) {
        if (!a)throw"cc.ActionManager.addAction(): action must be non-null";
        if (!b)throw"cc.ActionManager.addAction(): action must be non-null";
        var d = this._hashTargets[b.__instanceId];
        d || (d = new cc.HashElement, d.paused = c, d.target = b, this._hashTargets[b.__instanceId] = d, this._arrayTargets.push(d));
        this._actionAllocWithHashElement(d);
        d.actions.push(a);
        a.startWithTarget(b)
    },
    removeAllActions: function () {
        for (var a = this._arrayTargets, b = 0; b < a.length; b++) {
            var c = a[b];
            c && this.removeAllActionsFromTarget(c.target, !0)
        }
    },
    removeAllActionsFromTarget: function (a, b) {
        if (null != a) {
            var c = this._hashTargets[a.__instanceId];
            c && (-1 === c.actions.indexOf(c.currentAction) || c.currentActionSalvaged || (c.currentActionSalvaged = !0), c.actions.length = 0, this._currentTarget !== c || b ? this._deleteHashElement(c) : this._currentTargetSalvaged = !0)
        }
    },
    removeAction: function (a) {
        if (null != a) {
            var b = a.getOriginalTarget();
            if (b = this._hashTargets[b.__instanceId])
                for (var c = 0; c < b.actions.length; c++) {
                    if (b.actions[c] === a) {
                        b.actions.splice(c, 1);
                        break
                    }
                } else cc.log(cc._LogInfos.ActionManager_removeAction)
        }
    },
    removeActionByTag: function (a, b) {
        a === cc.ACTION_TAG_INVALID && cc.log(cc._LogInfos.ActionManager_addAction);
        cc.assert(b, cc._LogInfos.ActionManager_addAction);
        var c = this._hashTargets[b.__instanceId];
        if (c)
            for (var d = c.actions.length, e = 0; e < d; ++e) {
                var f = c.actions[e];
                if (f && f.getTag() === a && f.getOriginalTarget() === b) {
                    this._removeActionAtIndex(e, c);
                    break
                }
            }
    },
    getActionByTag: function (a, b) {
        a === cc.ACTION_TAG_INVALID && cc.log(cc._LogInfos.ActionManager_getActionByTag);
        var c = this._hashTargets[b.__instanceId];
        if (c) {
            if (null != c.actions)
                for (var d = 0; d < c.actions.length; ++d) {
                    var e = c.actions[d];
                    if (e && e.getTag() === a)return e
                }
            cc.log(cc._LogInfos.ActionManager_getActionByTag_2, a)
        }
        return null
    },
    numberOfRunningActionsInTarget: function (a) {
        return (a = this._hashTargets[a.__instanceId]) ? a.actions ? a.actions.length : 0 : 0
    },
    pauseTarget: function (a) {
        if (a = this._hashTargets[a.__instanceId])a.paused = !0
    },
    resumeTarget: function (a) {
        if (a = this._hashTargets[a.__instanceId])a.paused = !1
    },
    pauseAllRunningActions: function () {
        for (var a = [], b = this._arrayTargets, c = 0; c < b.length; c++) {
            var d = b[c];
            d && !d.paused && (d.paused = !0, a.push(d.target))
        }
        return a
    },
    resumeTargets: function (a) {
        if (a)
            for (var b = 0; b < a.length; b++)a[b] && this.resumeTarget(a[b])
    },
    purgeSharedManager: function () {
        cc.director.getScheduler().unscheduleUpdate(this)
    },
    _removeActionAtIndex: function (a, b) {
        b.actions[a] !== b.currentAction || b.currentActionSalvaged || (b.currentActionSalvaged = !0);
        b.actions.splice(a, 1);
        b.actionIndex >= a && b.actionIndex--;
        0 === b.actions.length && (this._currentTarget === b ? this._currentTargetSalvaged = !0 : this._deleteHashElement(b))
    },
    _deleteHashElement: function (a) {
        a && (delete this._hashTargets[a.target.__instanceId], cc.arrayRemoveObject(this._arrayTargets, a), a.actions = null, a.target = null)
    },
    _actionAllocWithHashElement: function (a) {
        null == a.actions && (a.actions = [])
    },
    update: function (a) {
        for (var b = this._arrayTargets, c, d = 0; d < b.length; d++) {
            c = this._currentTarget = b[d];
            if (!c.paused)
                for (c.actionIndex = 0; c.actionIndex < (c.actions ? c.actions.length : 0); c.actionIndex++)
                    if (c.currentAction = c.actions[c.actionIndex], c.currentAction) {
                        c.currentActionSalvaged = !1;
                        c.currentAction.step(a * (c.currentAction._speedMethod ? c.currentAction._speed : 1));
                        if (c.currentActionSalvaged)c.currentAction = null; else if (c.currentAction.isDone()) {
                            c.currentAction.stop();
                            var e = c.currentAction;
                            c.currentAction = null;
                            this.removeAction(e)
                        }
                        c.currentAction = null
                    }
            this._currentTargetSalvaged && 0 === c.actions.length && this._deleteHashElement(c)
        }
    }
});
cc.math = cc.math || {};
cc.math.EPSILON = 0.015625;
cc.math.square = function (a) {
    return a * a
};
cc.math.almostEqual = function (a, b) {
    return a + cc.math.EPSILON > b && a - cc.math.EPSILON < b
};
(function (a) {
    a.math.Vec2 = function (a, b) {
        void 0 === b ? (this.x = a.x, this.y = a.y) : (this.x = a || 0, this.y = b || 0)
    };
    var b = a.math.Vec2.prototype;
    b.fill = function (a, b) {
        this.x = a;
        this.y = b
    };
    b.length = function () {
        return Math.sqrt(a.math.square(this.x) + a.math.square(this.y))
    };
    b.lengthSq = function () {
        return a.math.square(this.x) + a.math.square(this.y)
    };
    b.normalize = function () {
        var a = 1 / this.length();
        this.x *= a;
        this.y *= a;
        return this
    };
    a.math.Vec2.add = function (a, b, e) {
        a.x = b.x + e.x;
        a.y = b.y + e.y;
        return a
    };
    b.add = function (a) {
        this.x += a.x;
        this.y += a.y;
        return this
    };
    b.dot = function (a) {
        return this.x * a.x + this.y * a.y
    };
    a.math.Vec2.subtract = function (a, b, e) {
        a.x = b.x - e.x;
        a.y = b.y - e.y;
        return a
    };
    b.subtract = function (a) {
        this.x -= a.x;
        this.y -= a.y;
        return this
    };
    b.transform = function (a) {
        var b = this.x, e = this.y;
        this.x = b * a.mat[0] + e * a.mat[3] + a.mat[6];
        this.y = b * a.mat[1] + e * a.mat[4] + a.mat[7];
        return this
    };
    a.math.Vec2.scale = function (a, b, e) {
        a.x = b.x * e;
        a.y = b.y * e;
        return a
    };
    b.scale = function (a) {
        this.x *= a;
        this.y *= a;
        return this
    };
    b.equals = function (c) {
        return this.x < c.x + a.math.EPSILON && this.x > c.x - a.math.EPSILON && this.y < c.y + a.math.EPSILON && this.y > c.y - a.math.EPSILON
    }
})(cc);
(function (a) {
    a.kmVec3 = a.math.Vec3 = function (a, b, e) {
        a && void 0 === b ? (this.x = a.x, this.y = a.y, this.z = a.z) : (this.x = a || 0, this.y = b || 0, this.z = e || 0)
    };
    a.math.vec3 = function (c, b, e) {
        return new a.math.Vec3(c, b, e)
    };
    var b = a.math.Vec3.prototype;
    b.fill = function (a, b, e) {
        a && void 0 === b ? (this.x = a.x, this.y = a.y, this.z = a.z) : (this.x = a, this.y = b, this.z = e);
        return this
    };
    b.length = function () {
        return Math.sqrt(a.math.square(this.x) + a.math.square(this.y) + a.math.square(this.z))
    };
    b.lengthSq = function () {
        return a.math.square(this.x) + a.math.square(this.y) +
            a.math.square(this.z)
    };
    b.normalize = function () {
        var a = 1 / this.length();
        this.x *= a;
        this.y *= a;
        this.z *= a;
        return this
    };
    b.cross = function (a) {
        var b = this.x, e = this.y, f = this.z;
        this.x = e * a.z - f * a.y;
        this.y = f * a.x - b * a.z;
        this.z = b * a.y - e * a.x;
        return this
    };
    b.dot = function (a) {
        return this.x * a.x + this.y * a.y + this.z * a.z
    };
    b.add = function (a) {
        this.x += a.x;
        this.y += a.y;
        this.z += a.z;
        return this
    };
    b.subtract = function (a) {
        this.x -= a.x;
        this.y -= a.y;
        this.z -= a.z;
        return this
    };
    b.transform = function (a) {
        var b = this.x, e = this.y, f = this.z;
        a = a.mat;
        this.x = b * a[0] + e * a[4] + f * a[8] + a[12];
        this.y = b * a[1] + e * a[5] + f * a[9] + a[13];
        this.z = b * a[2] + e * a[6] + f * a[10] + a[14];
        return this
    };
    b.transformNormal = function (a) {
        var b = this.x, e = this.y, f = this.z;
        a = a.mat;
        this.x = b * a[0] + e * a[4] + f * a[8];
        this.y = b * a[1] + e * a[5] + f * a[9];
        this.z = b * a[2] + e * a[6] + f * a[10];
        return this
    };
    b.transformCoord = function (c) {
        var b = new a.math.Vec4(this.x, this.y, this.z, 1);
        b.transform(c);
        this.x = b.x / b.w;
        this.y = b.y / b.w;
        this.z = b.z / b.w;
        return this
    };
    b.scale = function (a) {
        this.x *= a;
        this.y *= a;
        this.z *= a;
        return this
    };
    b.equals = function (c) {
        var b = a.math.EPSILON;
        return this.x < c.x + b && this.x > c.x - b && this.y < c.y + b && this.y > c.y - b && this.z < c.z + b && this.z > c.z - b
    };
    b.inverseTransform = function (c) {
        c = c.mat;
        var b = new a.math.Vec3(this.x - c[12], this.y - c[13], this.z - c[14]);
        this.x = b.x * c[0] + b.y * c[1] + b.z * c[2];
        this.y = b.x * c[4] + b.y * c[5] + b.z * c[6];
        this.z = b.x * c[8] + b.y * c[9] + b.z * c[10];
        return this
    };
    b.inverseTransformNormal = function (a) {
        var b = this.x, e = this.y, f = this.z;
        a = a.mat;
        this.x = b * a[0] + e * a[1] + f * a[2];
        this.y = b * a[4] + e * a[5] + f * a[6];
        this.z = b * a[8] + e * a[9] + f * a[10];
        return this
    };
    b.assignFrom = function (a) {
        if (!a)return this;
        this.x = a.x;
        this.y = a.y;
        this.z = a.z;
        return this
    };
    a.math.Vec3.zero = function (a) {
        a.x = a.y = a.z = 0;
        return a
    };
    b.toTypeArray = function () {
        var a = new Float32Array(3);
        a[0] = this.x;
        a[1] = this.y;
        a[2] = this.z;
        return a
    }
})(cc);
(function (a) {
    a.math.Vec4 = function (a, b, e, f) {
        a && void 0 === b ? (this.x = a.x, this.y = a.y, this.z = a.z, this.w = a.w) : (this.x = a || 0, this.y = b || 0, this.z = e || 0, this.w = f || 0)
    };
    a.kmVec4 = a.math.Vec4;
    var b = a.math.Vec4.prototype;
    b.fill = function (a, b, e, f) {
        a && void 0 === b ? (this.x = a.x, this.y = a.y, this.z = a.z, this.w = a.w) : (this.x = a, this.y = b, this.z = e, this.w = f)
    };
    b.add = function (a) {
        if (!a)return this;
        this.x += a.x;
        this.y += a.y;
        this.z += a.z;
        this.w += a.w;
        return this
    };
    b.dot = function (a) {
        return this.x * a.x + this.y * a.y + this.z * a.z + this.w * a.w
    };
    b.length = function () {
        return Math.sqrt(a.math.square(this.x) + a.math.square(this.y) + a.math.square(this.z) + a.math.square(this.w))
    };
    b.lengthSq = function () {
        return a.math.square(this.x) + a.math.square(this.y) + a.math.square(this.z) + a.math.square(this.w)
    };
    b.lerp = function (a, b) {
        return this
    };
    b.normalize = function () {
        var a = 1 / this.length();
        this.x *= a;
        this.y *= a;
        this.z *= a;
        this.w *= a;
        return this
    };
    b.scale = function (a) {
        this.normalize();
        this.x *= a;
        this.y *= a;
        this.z *= a;
        this.w *= a;
        return this
    };
    b.subtract = function (a) {
        this.x -= a.x;
        this.y -= a.y;
        this.z -= a.z;
        this.w -= a.w
    };
    b.transform = function (a) {
        var b = this.x, e = this.y, f = this.z, g = this.w;
        a = a.mat;
        this.x = b * a[0] + e * a[4] + f * a[8] + g * a[12];
        this.y = b * a[1] + e * a[5] + f * a[9] + g * a[13];
        this.z = b * a[2] + e * a[6] + f * a[10] + g * a[14];
        this.w = b * a[3] + e * a[7] + f * a[11] + g * a[15];
        return this
    };
    a.math.Vec4.transformArray = function (b, d) {
        for (var e = [], f = 0; f < b.length; f++) {
            var g = new a.math.Vec4(b[f]);
            g.transform(d);
            e.push(g)
        }
        return e
    };
    b.equals = function (b) {
        var d = a.math.EPSILON;
        return this.x < b.x + d && this.x > b.x - d && this.y < b.y + d && this.y > b.y - d && this.z < b.z + d && this.z > b.z - d && this.w < b.w + d && this.w > b.w - d
    };
    b.assignFrom = function (a) {
        this.x = a.x;
        this.y = a.y;
        this.z = a.z;
        this.w = a.w;
        return this
    };
    b.toTypeArray = function () {
        var a = new Float32Array(4);
        a[0] = this.x;
        a[1] = this.y;
        a[2] = this.z;
        a[3] = this.w;
        return a
    }
})(cc);
(function (a) {
    function b(b, d, e) {
        d = new a.math.Vec2(d);
        d.subtract(b);
        e.x = -d.y;
        e.y = d.x;
        e.normalize()
    }

    a.math.Ray2 = function (b, d) {
        this.start = b || new a.math.Vec2;
        this.dir = d || new a.math.Vec2
    };
    a.math.Ray2.prototype.fill = function (a, b, e, f) {
        this.start.x = a;
        this.start.y = b;
        this.dir.x = e;
        this.dir.y = f
    };
    a.math.Ray2.prototype.intersectLineSegment = function (b, d, e) {
        var f = this.start.x, g = this.start.y, h = this.start.x + this.dir.x, k = this.start.y + this.dir.y, m = b.x, n = b.y, p = d.x, s = d.y, r = (s - n) * (h - f) - (p - m) * (k - g);
        if (r > -a.math.EPSILON && r < a.math.EPSILON)return !1;
        n = ((p - m) * (g - n) - (s - n) * (f - m)) / r;
        m = f + n * (h - f);
        n = g + n * (k - g);
        if (m < Math.min(b.x, d.x) - a.math.EPSILON || m > Math.max(b.x, d.x) + a.math.EPSILON || n < Math.min(b.y, d.y) - a.math.EPSILON || n > Math.max(b.y, d.y) + a.math.EPSILON || m < Math.min(f, h) - a.math.EPSILON || m > Math.max(f, h) + a.math.EPSILON || n < Math.min(g, k) - a.math.EPSILON || n > Math.max(g, k) + a.math.EPSILON)return !1;
        e.x = m;
        e.y = n;
        return !0
    };
    a.math.Ray2.prototype.intersectTriangle = function (c, d, e, f, g) {
        var h = new a.math.Vec2, k = new a.math.Vec2, m = new a.math.Vec2, n = 1E4, p = !1, s;
        this.intersectLineSegment(c, d, h) && (p = !0, s = h.subtract(this.start).length(), s < n && (k.x = h.x, k.y = h.y, n = s, b(c, d, m)));
        this.intersectLineSegment(d, e, h) && (p = !0, s = h.subtract(this.start).length(), s < n && (k.x = h.x, k.y = h.y, n = s, b(d, e, m)));
        this.intersectLineSegment(e, c, h) && (p = !0, s = h.subtract(this.start).length(), s < n && (k.x = h.x, k.y = h.y, b(e, c, m)));
        p && (f.x = k.x, f.y = k.y, g && (g.x = m.x, g.y = m.y));
        return p
    }
})(cc);
var Float32Array = Float32Array || Array;
(function (a) {
    a.math.Matrix3 = function (a) {
        this.mat = a && a.mat ? new Float32Array(a.mat) : new Float32Array(9)
    };
    a.kmMat3 = a.math.Matrix3;
    var b = a.math.Matrix3.prototype;
    b.fill = function (a) {
        var b = this.mat;
        a = a.mat;
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
        b[4] = a[4];
        b[5] = a[5];
        b[6] = a[6];
        b[7] = a[7];
        b[8] = a[8];
        return this
    };
    b.adjugate = function () {
        var a = this.mat, b = a[0], c = a[1], g = a[2], h = a[3], k = a[4], m = a[5], n = a[6], p = a[7], s = a[8];
        a[0] = k * s - m * p;
        a[1] = g * p - c * s;
        a[2] = c * m - g * k;
        a[3] = m * n - h * s;
        a[4] = b * s - g * n;
        a[5] = g * h - b * m;
        a[6] = h * p - k * n;
        a[8] = b * k - c * h;
        return this
    };
    b.identity = function () {
        var a = this.mat;
        a[1] = a[2] = a[3] = a[5] = a[6] = a[7] = 0;
        a[0] = a[4] = a[8] = 1;
        return this
    };
    var c = new a.math.Matrix3;
    b.inverse = function (a) {
        if (0 === a)return this;
        c.assignFrom(this);
        a = 1 / a;
        this.adjugate();
        this.multiplyScalar(a);
        return this
    };
    b.isIdentity = function () {
        var a = this.mat;
        return 1 === a[0] && 0 === a[1] && 0 === a[2] && 0 === a[3] && 1 === a[4] && 0 === a[5] && 0 === a[6] && 0 === a[7] && 1 === a[8]
    };
    b.transpose = function () {
        var a = this.mat, b = a[1], c = a[2], g = a[5], h = a[6], k = a[7];
        a[1] = a[3];
        a[2] = h;
        a[3] = b;
        a[5] = k;
        a[6] = c;
        a[7] = g;
        return this
    };
    b.determinant = function () {
        var a = this.mat, b = a[0] * a[4] * a[8] + a[1] * a[5] * a[6] + a[2] * a[3] * a[7];
        return b -= a[2] * a[4] * a[6] + a[0] * a[5] * a[7] + a[1] * a[3] * a[8]
    };
    b.multiply = function (a) {
        var b = this.mat, c = a.mat;
        a = b[0];
        var g = b[1], h = b[2], k = b[3], m = b[4], n = b[5], p = b[6], s = b[7], r = b[8], u = c[0], t = c[1], v = c[2], w = c[3], z = c[4], x = c[5], y = c[6], A = c[7], c = c[8];
        b[0] = a * u + k * t + p * v;
        b[1] = g * u + m * t + s * v;
        b[2] = h * u + n * t + r * v;
        b[3] = h * u + n * t + r * v;
        b[4] = g * w + m * z + s * x;
        b[5] = h * w + n * z + r * x;
        b[6] = a * y + k * A + p * c;
        b[7] = g * y + m * A + s * c;
        b[8] = h * y + n * A + r * c;
        return this
    };
    b.multiplyScalar = function (a) {
        var b = this.mat;
        b[0] *= a;
        b[1] *= a;
        b[2] *= a;
        b[3] *= a;
        b[4] *= a;
        b[5] *= a;
        b[6] *= a;
        b[7] *= a;
        b[8] *= a;
        return this
    };
    a.math.Matrix3.rotationAxisAngle = function (b, c) {
        var f = Math.cos(c), g = Math.sin(c), h = new a.math.Matrix3, k = h.mat;
        k[0] = f + b.x * b.x * (1 - f);
        k[1] = b.z * g + b.y * b.x * (1 - f);
        k[2] = -b.y * g + b.z * b.x * (1 - f);
        k[3] = -b.z * g + b.x * b.y * (1 - f);
        k[4] = f + b.y * b.y * (1 - f);
        k[5] = b.x * g + b.z * b.y * (1 - f);
        k[6] = b.y * g + b.x * b.z * (1 - f);
        k[7] = -b.x * g + b.y * b.z * (1 - f);
        k[8] = f + b.z * b.z * (1 - f);
        return h
    };
    b.assignFrom = function (b) {
        if (this === b)return a.log("cc.math.Matrix3.assign(): current matrix equals matIn"), this;
        var c = this.mat;
        b = b.mat;
        c[0] = b[0];
        c[1] = b[1];
        c[2] = b[2];
        c[3] = b[3];
        c[4] = b[4];
        c[5] = b[5];
        c[6] = b[6];
        c[7] = b[7];
        c[8] = b[8];
        return this
    };
    b.equals = function (b) {
        if (this === b)return !0;
        var c = a.math.EPSILON, f = this.mat;
        b = b.mat;
        for (var g = 0; 9 > g; ++g)
            if (!(f[g] + c > b[g] && f[g] - c < b[g]))return !1;
        return !0
    };
    a.math.Matrix3.createByRotationX = function (b) {
        var c = new a.math.Matrix3, f = c.mat;
        f[0] = 1;
        f[1] = 0;
        f[2] = 0;
        f[3] = 0;
        f[4] = Math.cos(b);
        f[5] = Math.sin(b);
        f[6] = 0;
        f[7] = -Math.sin(b);
        f[8] = Math.cos(b);
        return c
    };
    a.math.Matrix3.createByRotationY = function (b) {
        var c = new a.math.Matrix3, f = c.mat;
        f[0] = Math.cos(b);
        f[1] = 0;
        f[2] = -Math.sin(b);
        f[3] = 0;
        f[4] = 1;
        f[5] = 0;
        f[6] = Math.sin(b);
        f[7] = 0;
        f[8] = Math.cos(b);
        return c
    };
    a.math.Matrix3.createByRotationZ = function (b) {
        var c = new a.math.Matrix3, f = c.mat;
        f[0] = Math.cos(b);
        f[1] = -Math.sin(b);
        f[2] = 0;
        f[3] = Math.sin(b);
        f[4] = Math.cos(b);
        f[5] = 0;
        f[6] = 0;
        f[7] = 0;
        f[8] = 1;
        return c
    };
    a.math.Matrix3.createByRotation = function (b) {
        var c = new a.math.Matrix3, f = c.mat;
        f[0] = Math.cos(b);
        f[1] = Math.sin(b);
        f[2] = 0;
        f[3] = -Math.sin(b);
        f[4] = Math.cos(b);
        f[5] = 0;
        f[6] = 0;
        f[7] = 0;
        f[8] = 1;
        return c
    };
    a.math.Matrix3.createByScale = function (b, c) {
        var f = new a.math.Matrix3;
        f.identity();
        f.mat[0] = b;
        f.mat[4] = c;
        return f
    };
    a.math.Matrix3.createByTranslation = function (b, c) {
        var f = new a.math.Matrix3;
        f.identity();
        f.mat[6] = b;
        f.mat[7] = c;
        return f
    };
    a.math.Matrix3.createByQuaternion = function (b) {
        if (!b)return null;
        var c = new a.math.Matrix3, f = c.mat;
        f[0] = 1 - 2 * (b.y * b.y + b.z * b.z);
        f[1] = 2 * (b.x * b.y - b.w * b.z);
        f[2] = 2 * (b.x * b.z + b.w * b.y);
        f[3] = 2 * (b.x * b.y + b.w * b.z);
        f[4] = 1 - 2 * (b.x * b.x + b.z * b.z);
        f[5] = 2 * (b.y * b.z - b.w * b.x);
        f[6] = 2 * (b.x * b.z - b.w * b.y);
        f[7] = 2 * (b.y * b.z + b.w * b.x);
        f[8] = 1 - 2 * (b.x * b.x + b.y * b.y);
        return c
    };
    b.rotationToAxisAngle = function () {
        return a.math.Quaternion.rotationMatrix(this).toAxisAndAngle()
    }
})(cc);
(function (a) {
    a.math.Matrix4 = function (a) {
        this.mat = a && a.mat ? new Float32Array(a.mat) : new Float32Array(16)
    };
    a.kmMat4 = a.math.Matrix4;
    var b = a.math.Matrix4.prototype;
    b.fill = function (a) {
        for (var b = this.mat, c = 0; 16 > c; c++)b[c] = a[c];
        return this
    };
    a.kmMat4Identity = function (a) {
        var b = a.mat;
        b[1] = b[2] = b[3] = b[4] = b[6] = b[7] = b[8] = b[9] = b[11] = b[12] = b[13] = b[14] = 0;
        b[0] = b[5] = b[10] = b[15] = 1;
        return a
    };
    b.identity = function () {
        var a = this.mat;
        a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = a[12] = a[13] = a[14] = 0;
        a[0] = a[5] = a[10] = a[15] = 1;
        return this
    };
    b.get = function (a, b) {
        return this.mat[a + 4 * b]
    };
    b.set = function (a, b, c) {
        this.mat[a + 4 * b] = c
    };
    b.swap = function (a, b, c, d) {
        var k = this.mat, m = k[a + 4 * b];
        k[a + 4 * b] = k[c + 4 * d];
        k[c + 4 * d] = m
    };
    a.math.Matrix4._gaussj = function (a, b) {
        var c, d = 0, k = 0, m, n, p, s, r = [0, 0, 0, 0], u = [0, 0, 0, 0], t = [0, 0, 0, 0];
        for (c = 0; 4 > c; c++) {
            for (m = s = 0; 4 > m; m++)
                if (1 !== t[m])
                    for (n = 0; 4 > n; n++)0 === t[n] && (p = Math.abs(a.get(m, n)), p >= s && (s = p, k = m, d = n));
            ++t[d];
            if (k !== d) {
                for (m = 0; 4 > m; m++)a.swap(k, m, d, m);
                for (m = 0; 4 > m; m++)b.swap(k, m, d, m)
            }
            u[c] = k;
            r[c] = d;
            if (0 === a.get(d, d))return !1;
            n = 1 / a.get(d, d);
            a.set(d, d, 1);
            for (m = 0; 4 > m; m++)a.set(d, m, a.get(d, m) * n);
            for (m = 0; 4 > m; m++)b.set(d, m, b.get(d, m) * n);
            for (n = 0; 4 > n; n++)
                if (n !== d) {
                    p = a.get(n, d);
                    a.set(n, d, 0);
                    for (m = 0; 4 > m; m++)a.set(n, m, a.get(n, m) - a.get(d, m) * p);
                    for (m = 0; 4 > m; m++)b.set(n, m, a.get(n, m) - b.get(d, m) * p)
                }
        }
        for (m = 3; 0 <= m; m--)
            if (u[m] !== r[m])
                for (n = 0; 4 > n; n++)a.swap(n, u[m], n, r[m]);
        return !0
    };
    var c = (new a.math.Matrix4).identity();
    a.kmMat4Inverse = function (b, d) {
        var g = new a.math.Matrix4(d);
        if (!1 === a.math.Matrix4._gaussj(g, c))return null;
        b.assignFrom(g);
        return b
    };
    b.inverse = function () {
        var b = new a.math.Matrix4(this);
        return !1 === a.math.Matrix4._gaussj(b, c) ? null : b
    };
    b.isIdentity = function () {
        var a = this.mat;
        return 1 === a[0] && 0 === a[1] && 0 === a[2] && 0 === a[3] && 0 === a[4] && 1 === a[5] && 0 === a[6] && 0 === a[7] && 0 === a[8] && 0 === a[9] && 1 === a[10] && 0 === a[11] && 0 === a[12] && 0 === a[13] && 0 === a[14] && 1 === a[15]
    };
    b.transpose = function () {
        var a = this.mat, b = a[1], c = a[2], d = a[3], k = a[6], m = a[7], n = a[8], p = a[9], s = a[11], r = a[12], u = a[13], t = a[14];
        a[1] = a[4];
        a[2] = n;
        a[3] = r;
        a[4] = b;
        a[6] = p;
        a[7] = u;
        a[8] = c;
        a[9] = k;
        a[11] = t;
        a[12] = d;
        a[13] = m;
        a[14] = s;
        return this
    };
    a.kmMat4Multiply = function (a, b, c) {
        var d = a.mat, k = b.mat, m = c.mat;
        c = k[0];
        b = k[1];
        var n = k[2], p = k[3], s = k[4], r = k[5], u = k[6], t = k[7], v = k[8], w = k[9], z = k[10], x = k[11], y = k[12], A = k[13], B = k[14], k = k[15], C = m[0], D = m[1], E = m[2], F = m[3], G = m[4], H = m[5], I = m[6], J = m[7], K = m[8], L = m[9], M = m[10], N = m[11], O = m[12], P = m[13], Q = m[14], m = m[15];
        d[0] = C * c + D * s + E * v + F * y;
        d[1] = C * b + D * r + E * w + F * A;
        d[2] = C * n + D * u + E * z + F * B;
        d[3] = C * p + D * t + E * x + F * k;
        d[4] = G * c + H * s + I * v + J * y;
        d[5] = G * b + H * r + I * w + J * A;
        d[6] = G * n + H * u + I * z + J * B;
        d[7] = G * p + H * t + I * x + J * k;
        d[8] = K * c + L * s + M * v + N * y;
        d[9] = K * b + L * r + M * w + N * A;
        d[10] = K * n + L * u + M * z + N * B;
        d[11] = K * p + L * t + M * x + N * k;
        d[12] = O * c + P * s + Q * v + m * y;
        d[13] = O * b + P * r + Q * w + m * A;
        d[14] = O * n + P * u + Q * z + m * B;
        d[15] = O * p + P * t + Q * x + m * k;
        return a
    };
    b.multiply = function (a) {
        var b = this.mat, c = a.mat;
        a = b[0];
        var d = b[1], k = b[2], m = b[3], n = b[4], p = b[5], s = b[6], r = b[7], u = b[8], t = b[9], v = b[10], w = b[11], z = b[12], x = b[13], y = b[14], A = b[15], B = c[0], C = c[1], D = c[2], E = c[3], F = c[4], G = c[5], H = c[6], I = c[7], J = c[8], K = c[9], L = c[10], M = c[11], N = c[12], O = c[13], P = c[14], c = c[15];
        b[0] = B * a + C * n + D * u + E * z;
        b[1] = B * d + C * p + D * t + E * x;
        b[2] = B * k + C * s + D * v + E * y;
        b[3] = B * m + C * r + D * w + E * A;
        b[4] = F * a + G * n + H * u + I * z;
        b[5] = F * d + G * p + H * t + I * x;
        b[6] = F * k + G * s + H * v + I * y;
        b[7] = F * m + G * r + H * w + I * A;
        b[8] = J * a + K * n + L * u + M * z;
        b[9] = J * d + K * p + L * t + M * x;
        b[10] = J * k + K * s + L * v + M * y;
        b[11] = J * m + K * r + L * w + M * A;
        b[12] = N * a + O * n + P * u + c * z;
        b[13] = N * d + O * p + P * t + c * x;
        b[14] = N * k + O * s + P * v + c * y;
        b[15] = N * m + O * r + P * w + c * A;
        return this
    };
    a.getMat4MultiplyValue = function (a, b) {
        var c = a.mat, d = b.mat, k = new Float32Array(16);
        k[0] = c[0] * d[0] + c[4] * d[1] + c[8] * d[2] + c[12] * d[3];
        k[1] = c[1] * d[0] + c[5] * d[1] + c[9] * d[2] + c[13] * d[3];
        k[2] = c[2] * d[0] + c[6] * d[1] + c[10] * d[2] + c[14] * d[3];
        k[3] = c[3] * d[0] + c[7] * d[1] + c[11] * d[2] + c[15] * d[3];
        k[4] = c[0] * d[4] + c[4] * d[5] + c[8] * d[6] + c[12] * d[7];
        k[5] = c[1] * d[4] + c[5] * d[5] + c[9] * d[6] + c[13] * d[7];
        k[6] = c[2] * d[4] + c[6] * d[5] + c[10] * d[6] + c[14] * d[7];
        k[7] = c[3] * d[4] + c[7] * d[5] + c[11] * d[6] + c[15] * d[7];
        k[8] = c[0] * d[8] + c[4] * d[9] + c[8] * d[10] + c[12] * d[11];
        k[9] = c[1] * d[8] + c[5] * d[9] + c[9] * d[10] + c[13] * d[11];
        k[10] = c[2] * d[8] + c[6] * d[9] + c[10] * d[10] + c[14] * d[11];
        k[11] = c[3] * d[8] + c[7] * d[9] + c[11] * d[10] + c[15] * d[11];
        k[12] = c[0] * d[12] + c[4] * d[13] +
            c[8] * d[14] + c[12] * d[15];
        k[13] = c[1] * d[12] + c[5] * d[13] + c[9] * d[14] + c[13] * d[15];
        k[14] = c[2] * d[12] + c[6] * d[13] + c[10] * d[14] + c[14] * d[15];
        k[15] = c[3] * d[12] + c[7] * d[13] + c[11] * d[14] + c[15] * d[15];
        return k
    };
    a.kmMat4Assign = function (b, c) {
        if (b === c)return a.log("cc.kmMat4Assign(): pOut equals pIn"), b;
        var d = b.mat, h = c.mat;
        d[0] = h[0];
        d[1] = h[1];
        d[2] = h[2];
        d[3] = h[3];
        d[4] = h[4];
        d[5] = h[5];
        d[6] = h[6];
        d[7] = h[7];
        d[8] = h[8];
        d[9] = h[9];
        d[10] = h[10];
        d[11] = h[11];
        d[12] = h[12];
        d[13] = h[13];
        d[14] = h[14];
        d[15] = h[15];
        return b
    };
    b.assignFrom = function (b) {
        if (this === b)return a.log("cc.mat.Matrix4.assignFrom(): mat4 equals current matrix"), this;
        var c = this.mat;
        b = b.mat;
        c[0] = b[0];
        c[1] = b[1];
        c[2] = b[2];
        c[3] = b[3];
        c[4] = b[4];
        c[5] = b[5];
        c[6] = b[6];
        c[7] = b[7];
        c[8] = b[8];
        c[9] = b[9];
        c[10] = b[10];
        c[11] = b[11];
        c[12] = b[12];
        c[13] = b[13];
        c[14] = b[14];
        c[15] = b[15];
        return this
    };
    b.equals = function (b) {
        if (this === b)return a.log("cc.kmMat4AreEqual(): pMat1 and pMat2 are same object."), !0;
        var c = this.mat;
        b = b.mat;
        for (var d = a.math.EPSILON, h = 0; 16 > h; h++)
            if (!(c[h] + d > b[h] && c[h] - d < b[h]))return !1;
        return !0
    };
    a.math.Matrix4.createByRotationX = function (b, c) {
        c = c || new a.math.Matrix4;
        var d = c.mat;
        d[0] = 1;
        d[3] = d[2] = d[1] = 0;
        d[4] = 0;
        d[5] = Math.cos(b);
        d[6] = Math.sin(b);
        d[7] = 0;
        d[8] = 0;
        d[9] = -Math.sin(b);
        d[10] = Math.cos(b);
        d[11] = 0;
        d[14] = d[13] = d[12] = 0;
        d[15] = 1;
        return c
    };
    a.math.Matrix4.createByRotationY = function (b, c) {
        c = c || new a.math.Matrix4;
        var d = c.mat;
        d[0] = Math.cos(b);
        d[1] = 0;
        d[2] = -Math.sin(b);
        d[3] = 0;
        d[7] = d[6] = d[4] = 0;
        d[5] = 1;
        d[8] = Math.sin(b);
        d[9] = 0;
        d[10] = Math.cos(b);
        d[11] = 0;
        d[14] = d[13] = d[12] = 0;
        d[15] = 1;
        return c
    };
    a.math.Matrix4.createByRotationZ = function (b, c) {
        c = c || new a.math.Matrix4;
        var d = c.mat;
        d[0] = Math.cos(b);
        d[1] = Math.sin(b);
        d[3] = d[2] = 0;
        d[4] = -Math.sin(b);
        d[5] = Math.cos(b);
        d[7] = d[6] = 0;
        d[11] = d[9] = d[8] = 0;
        d[10] = 1;
        d[14] = d[13] = d[12] = 0;
        d[15] = 1;
        return c
    };
    a.math.Matrix4.createByPitchYawRoll = function (b, c, d, h) {
        h = h || new a.math.Matrix4;
        var k = Math.cos(b);
        b = Math.sin(b);
        var m = Math.cos(c);
        c = Math.sin(c);
        var n = Math.cos(d);
        d = Math.sin(d);
        var p = b * c, s = k * c, r = h.mat;
        r[0] = m * n;
        r[4] = m * d;
        r[8] = -c;
        r[1] = p * n - k * d;
        r[5] = p * d + k * n;
        r[9] = b * m;
        r[2] = s * n + b * d;
        r[6] = s * d - b * n;
        r[10] = k * m;
        r[3] = r[7] = r[11] = 0;
        r[15] = 1;
        return h
    };
    a.math.Matrix4.createByQuaternion = function (b, c) {
        c = c || new a.math.Matrix4;
        var d = c.mat;
        d[0] = 1 - 2 * (b.y * b.y + b.z * b.z);
        d[1] = 2 * (b.x * b.y + b.z * b.w);
        d[2] = 2 * (b.x * b.z - b.y * b.w);
        d[3] = 0;
        d[4] = 2 * (b.x * b.y - b.z * b.w);
        d[5] = 1 - 2 * (b.x * b.x + b.z * b.z);
        d[6] = 2 * (b.z * b.y + b.x * b.w);
        d[7] = 0;
        d[8] = 2 * (b.x * b.z + b.y * b.w);
        d[9] = 2 * (b.y * b.z - b.x * b.w);
        d[10] = 1 - 2 * (b.x * b.x + b.y * b.y);
        d[11] = 0;
        d[14] = d[13] = d[12] = 0;
        d[15] = 1;
        return c
    };
    a.math.Matrix4.createByRotationTranslation = function (b, c, d) {
        d = d || new a.math.Matrix4;
        var h = d.mat;
        b = b.mat;
        h[0] = b[0];
        h[1] = b[1];
        h[2] = b[2];
        h[3] = 0;
        h[4] = b[3];
        h[5] = b[4];
        h[6] = b[5];
        h[7] = 0;
        h[8] = b[6];
        h[9] = b[7];
        h[10] = b[8];
        h[11] = 0;
        h[12] = c.x;
        h[13] = c.y;
        h[14] = c.z;
        h[15] = 1;
        return d
    };
    a.math.Matrix4.createByScale = function (b, c, d, h) {
        h = h || new a.math.Matrix4;
        var k = h.mat;
        k[0] = b;
        k[5] = c;
        k[10] = d;
        k[15] = 1;
        k[1] = k[2] = k[3] = k[4] = k[6] = k[7] = k[8] = k[9] = k[11] = k[12] = k[13] = k[14] = 0;
        return h
    };
    a.kmMat4Translation = function (a, b, c, d) {
        a.mat[0] = a.mat[5] = a.mat[10] = a.mat[15] = 1;
        a.mat[1] = a.mat[2] = a.mat[3] = a.mat[4] = a.mat[6] = a.mat[7] = a.mat[8] = a.mat[9] = a.mat[11] = 0;
        a.mat[12] = b;
        a.mat[13] = c;
        a.mat[14] = d;
        return a
    };
    a.math.Matrix4.createByTranslation = function (b, c, d, h) {
        h = h || new a.math.Matrix4;
        h.identity();
        h.mat[12] = b;
        h.mat[13] = c;
        h.mat[14] = d;
        return h
    };
    b.getUpVec3 = function () {
        var b = this.mat;
        return (new a.math.Vec3(b[4], b[5], b[6])).normalize()
    };
    b.getRightVec3 = function () {
        var b = this.mat;
        return (new a.math.Vec3(b[0], b[1], b[2])).normalize()
    };
    b.getForwardVec3 = function () {
        var b = this.mat;
        return (new a.math.Vec3(b[8], b[9], b[10])).normalize()
    };
    a.kmMat4PerspectiveProjection = function (b, c, d, h, k) {
        var m = a.degreesToRadians(c / 2);
        c = k - h;
        var n = Math.sin(m);
        if (0 === c || 0 === n || 0 === d)return null;
        m = Math.cos(m) / n;
        b.identity();
        b.mat[0] = m / d;
        b.mat[5] = m;
        b.mat[10] = -(k + h) / c;
        b.mat[11] = -1;
        b.mat[14] = -2 * h * k / c;
        b.mat[15] = 0;
        return b
    };
    a.math.Matrix4.createPerspectiveProjection = function (b, c, d, h) {
        var k = a.degreesToRadians(b / 2);
        b = h - d;
        var m = Math.sin(k);
        if (0 === b || 0 === m || 0 === c)return null;
        var k = Math.cos(k) / m, m = new a.math.Matrix4, n = m.mat;
        m.identity();
        n[0] = k / c;
        n[5] = k;
        n[10] = -(h + d) / b;
        n[11] = -1;
        n[14] = -2 * d * h / b;
        n[15] = 0;
        return m
    };
    a.kmMat4OrthographicProjection = function (a, b, c, d, k, m, n) {
        a.identity();
        a.mat[0] = 2 / (c - b);
        a.mat[5] = 2 / (k - d);
        a.mat[10] = -2 / (n - m);
        a.mat[12] = -((c + b) / (c - b));
        a.mat[13] = -((k + d) / (k - d));
        a.mat[14] = -((n + m) / (n - m));
        return a
    };
    a.math.Matrix4.createOrthographicProjection = function (b, c, d, h, k, m) {
        var n = new a.math.Matrix4, p = n.mat;
        n.identity();
        p[0] = 2 / (c - b);
        p[5] = 2 / (h - d);
        p[10] = -2 / (m - k);
        p[12] = -((c + b) / (c - b));
        p[13] = -((h + d) / (h - d));
        p[14] = -((m + k) / (m - k));
        return n
    };
    a.kmMat4LookAt = function (b, c, d, h) {
        d = new a.math.Vec3(d);
        var k = new a.math.Vec3(h);
        d.subtract(c);
        d.normalize();
        k.normalize();
        h = new a.math.Vec3(d);
        h.cross(k);
        h.normalize();
        k = new a.math.Vec3(h);
        k.cross(d);
        h.normalize();
        b.identity();
        b.mat[0] = h.x;
        b.mat[4] = h.y;
        b.mat[8] = h.z;
        b.mat[1] = k.x;
        b.mat[5] = k.y;
        b.mat[9] = k.z;
        b.mat[2] = -d.x;
        b.mat[6] = -d.y;
        b.mat[10] = -d.z;
        c = a.math.Matrix4.createByTranslation(-c.x, -c.y, -c.z);
        b.multiply(c);
        return b
    };
    var d = new a.math.Matrix4;
    b.lookAt = function (b, c, g) {
        c = new a.math.Vec3(c);
        var h = new a.math.Vec3(g);
        g = this.mat;
        c.subtract(b);
        c.normalize();
        h.normalize();
        var k = new a.math.Vec3(c);
        k.cross(h);
        k.normalize();
        h = new a.math.Vec3(k);
        h.cross(c);
        k.normalize();
        this.identity();
        g[0] = k.x;
        g[4] = k.y;
        g[8] = k.z;
        g[1] = h.x;
        g[5] = h.y;
        g[9] = h.z;
        g[2] = -c.x;
        g[6] = -c.y;
        g[10] = -c.z;
        d = a.math.Matrix4.createByTranslation(-b.x, -b.y, -b.z, d);
        this.multiply(d);
        return this
    };
    a.kmMat4RotationAxisAngle = function (b, c, d) {
        var h = Math.cos(d);
        d = Math.sin(d);
        c = new a.math.Vec3(c);
        c.normalize();
        b.mat[0] = h + c.x * c.x * (1 - h);
        b.mat[1] = c.z * d + c.y * c.x * (1 - h);
        b.mat[2] = -c.y * d + c.z * c.x * (1 - h);
        b.mat[3] = 0;
        b.mat[4] = -c.z * d + c.x * c.y * (1 - h);
        b.mat[5] = h + c.y * c.y * (1 - h);
        b.mat[6] = c.x * d + c.z * c.y * (1 - h);
        b.mat[7] = 0;
        b.mat[8] = c.y * d + c.x * c.z * (1 - h);
        b.mat[9] = -c.x * d + c.y * c.z * (1 - h);
        b.mat[10] = h + c.z * c.z * (1 - h);
        b.mat[11] = 0;
        b.mat[12] = 0;
        b.mat[13] = 0;
        b.mat[14] = 0;
        b.mat[15] = 1;
        return b
    };
    a.math.Matrix4.createByAxisAndAngle = function (b, c, d) {
        d = d || new a.math.Matrix4;
        var h = this.mat, k = Math.cos(c);
        c = Math.sin(c);
        b = new a.math.Vec3(b);
        b.normalize();
        h[0] = k + b.x * b.x * (1 - k);
        h[1] = b.z * c + b.y * b.x * (1 - k);
        h[2] = -b.y * c + b.z * b.x * (1 - k);
        h[3] = 0;
        h[4] = -b.z * c + b.x * b.y * (1 - k);
        h[5] = k + b.y * b.y * (1 - k);
        h[6] = b.x * c + b.z * b.y * (1 - k);
        h[7] = 0;
        h[8] = b.y * c + b.x * b.z * (1 - k);
        h[9] = -b.x * c + b.y * b.z * (1 - k);
        h[10] = k + b.z * b.z * (1 - k);
        h[11] = 0;
        h[12] = h[13] = h[14] = 0;
        h[15] = 1;
        return d
    };
    b.extractRotation = function () {
        var b = new a.math.Matrix3, c = this.mat, d = b.mat;
        d[0] = c[0];
        d[1] = c[1];
        d[2] = c[2];
        d[3] = c[4];
        d[4] = c[5];
        d[5] = c[6];
        d[6] = c[8];
        d[7] = c[9];
        d[8] = c[10];
        return b
    };
    b.extractPlane = function (b) {
        var c = new a.math.Plane, d = this.mat;
        switch (b) {
            case a.math.Plane.RIGHT:
                c.a = d[3] - d[0];
                c.b = d[7] - d[4];
                c.c = d[11] - d[8];
                c.d = d[15] - d[12];
                break;
            case a.math.Plane.LEFT:
                c.a = d[3] + d[0];
                c.b = d[7] + d[4];
                c.c = d[11] + d[8];
                c.d = d[15] + d[12];
                break;
            case a.math.Plane.BOTTOM:
                c.a = d[3] + d[1];
                c.b = d[7] + d[5];
                c.c = d[11] + d[9];
                c.d = d[15] + d[13];
                break;
            case a.math.Plane.TOP:
                c.a = d[3] - d[1];
                c.b = d[7] - d[5];
                c.c = d[11] - d[9];
                c.d = d[15] - d[13];
                break;
            case a.math.Plane.FAR:
                c.a = d[3] - d[2];
                c.b = d[7] - d[6];
                c.c = d[11] - d[10];
                c.d = d[15] - d[14];
                break;
            case a.math.Plane.NEAR:
                c.a = d[3] + d[2];
                c.b = d[7] + d[6];
                c.c = d[11] + d[10];
                c.d = d[15] + d[14];
                break;
            default:
                a.log("cc.math.Matrix4.extractPlane: Invalid plane index")
        }
        b = Math.sqrt(c.a * c.a + c.b * c.b + c.c * c.c);
        c.a /= b;
        c.b /= b;
        c.c /= b;
        c.d /= b;
        return c
    };
    b.toAxisAndAngle = function () {
        var b = this.extractRotation();
        return a.math.Quaternion.rotationMatrix(b).toAxisAndAngle()
    }
})(cc);
(function (a) {
    a.math.Plane = function (a, b, e, f) {
        a && void 0 === b ? (this.a = a.a, this.b = a.b, this.c = a.c, this.d = a.d) : (this.a = a || 0, this.b = b || 0, this.c = e || 0, this.d = f || 0)
    };
    a.kmPlane = a.math.Plane;
    var b = a.math.Plane.prototype;
    a.math.Plane.LEFT = 0;
    a.math.Plane.RIGHT = 1;
    a.math.Plane.BOTTOM = 2;
    a.math.Plane.TOP = 3;
    a.math.Plane.NEAR = 4;
    a.math.Plane.FAR = 5;
    a.math.Plane.POINT_INFRONT_OF_PLANE = 0;
    a.math.Plane.POINT_BEHIND_PLANE = 1;
    a.math.Plane.POINT_ON_PLANE = 2;
    b.dot = function (a) {
        return this.a * a.x + this.b * a.y + this.c * a.z + this.d * a.w
    };
    b.dotCoord = function (a) {
        return this.a * a.x + this.b * a.y + this.c * a.z + this.d
    };
    b.dotNormal = function (a) {
        return this.a * a.x + this.b * a.y + this.c * a.z
    };
    a.math.Plane.fromPointNormal = function (b, d) {
        return new a.math.Plane(d.x, d.y, d.z, -d.dot(b))
    };
    a.math.Plane.fromPoints = function (b, d, e) {
        d = new a.math.Vec3(d);
        e = new a.math.Vec3(e);
        var f = new a.math.Plane;
        d.subtract(b);
        e.subtract(b);
        d.cross(e);
        d.normalize();
        f.a = d.x;
        f.b = d.y;
        f.c = d.z;
        f.d = d.scale(-1).dot(b);
        return f
    };
    b.normalize = function () {
        var b = new a.math.Vec3(this.a, this.b, this.c), d = 1 / b.length();
        b.normalize();
        this.a = b.x;
        this.b = b.y;
        this.c = b.z;
        this.d *= d;
        return this
    };
    b.classifyPoint = function (b) {
        b = this.a * b.x + this.b * b.y + this.c * b.z + this.d;
        return 0.001 < b ? a.math.Plane.POINT_INFRONT_OF_PLANE : -0.001 > b ? a.math.Plane.POINT_BEHIND_PLANE : a.math.Plane.POINT_ON_PLANE
    }
})(cc);
(function (a) {
    a.math.Quaternion = function (a, b, e, f) {
        a && void 0 === b ? (this.x = a.x, this.y = a.y, this.z = a.z, this.w = a.w) : (this.x = a || 0, this.y = b || 0, this.z = e || 0, this.w = f || 0)
    };
    a.kmQuaternion = a.math.Quaternion;
    var b = a.math.Quaternion.prototype;
    b.conjugate = function (a) {
        this.x = -a.x;
        this.y = -a.y;
        this.z = -a.z;
        this.w = a.w;
        return this
    };
    b.dot = function (a) {
        return this.w * a.w + this.x * a.x + this.y * a.y + this.z * a.z
    };
    b.exponential = function () {
        return this
    };
    b.identity = function () {
        this.z = this.y = this.x = 0;
        this.w = 1;
        return this
    };
    b.inverse = function () {
        var b = this.length();
        if (Math.abs(b) > a.math.EPSILON)return this.w = this.z = this.y = this.x = 0, this;
        this.conjugate(this).scale(1 / b);
        return this
    };
    b.isIdentity = function () {
        return 0 === this.x && 0 === this.y && 0 === this.z && 1 === this.w
    };
    b.length = function () {
        return Math.sqrt(this.lengthSq())
    };
    b.lengthSq = function () {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    };
    b.multiply = function (a) {
        var b = this.x, e = this.y, f = this.z, g = this.w;
        this.w = g * a.w - b * a.x - e * a.y - f * a.z;
        this.x = g * a.x + b * a.w + e * a.z - f * a.y;
        this.y = g * a.y + e * a.w + f * a.x -
            b * a.z;
        this.z = g * a.z + f * a.w + b * a.y - e * a.x;
        return this
    };
    b.normalize = function () {
        var b = this.length();
        if (Math.abs(b) <= a.math.EPSILON)throw"current quaternion is an invalid value";
        this.scale(1 / b);
        return this
    };
    b.rotationAxis = function (a, b) {
        var e = 0.5 * b, f = Math.sin(e);
        this.w = Math.cos(e);
        this.x = a.x * f;
        this.y = a.y * f;
        this.z = a.z * f;
        return this
    };
    a.math.Quaternion.rotationMatrix = function (b) {
        if (!b)return null;
        var d, e, f;
        d = [];
        e = b.mat;
        b = 0;
        d[0] = e[0];
        d[1] = e[3];
        d[2] = e[6];
        d[4] = e[1];
        d[5] = e[4];
        d[6] = e[7];
        d[8] = e[2];
        d[9] = e[5];
        d[10] = e[8];
        d[15] = 1;
        var g = d[0];
        b = g[0] + g[5] + g[10] + 1;
        b > a.math.EPSILON ? (b = 2 * Math.sqrt(b), d = (g[9] - g[6]) / b, e = (g[2] - g[8]) / b, f = (g[4] - g[1]) / b, b *= 0.25) : g[0] > g[5] && g[0] > g[10] ? (b = 2 * Math.sqrt(1 + g[0] - g[5] - g[10]), d = 0.25 * b, e = (g[4] + g[1]) / b, f = (g[2] + g[8]) / b, b = (g[9] - g[6]) / b) : g[5] > g[10] ? (b = 2 * Math.sqrt(1 + g[5] - g[0] - g[10]), d = (g[4] + g[1]) / b, e = 0.25 * b, f = (g[9] + g[6]) / b, b = (g[2] - g[8]) / b) : (b = 2 * Math.sqrt(1 + g[10] - g[0] - g[5]), d = (g[2] + g[8]) / b, e = (g[9] + g[6]) / b, f = 0.25 * b, b = (g[4] - g[1]) / b);
        return new a.math.Quaternion(d, e, f, b)
    };
    a.math.Quaternion.rotationYawPitchRoll = function (b, d, e) {
        var f, g, h, k, m;
        f = a.degreesToRadians(d) / 2;
        g = a.degreesToRadians(b) / 2;
        h = a.degreesToRadians(e) / 2;
        e = Math.cos(f);
        b = Math.cos(g);
        d = Math.cos(h);
        f = Math.sin(f);
        g = Math.sin(g);
        h = Math.sin(h);
        k = b * d;
        m = g * h;
        var n = new a.math.Quaternion;
        n.w = e * k + f * m;
        n.x = f * k - e * m;
        n.y = e * g * d + f * b * h;
        n.z = e * b * h - f * g * d;
        n.normalize();
        return n
    };
    b.slerp = function (b, d) {
        if (this.x === b.x && this.y === b.y && this.z === b.z && this.w === b.w)return this;
        var e = this.dot(b), f = Math.acos(e), g = Math.sqrt(1 - a.math.square(e)), e = Math.sin(d * f) / g, f = Math.sin((1 -
                d) * f) / g, g = new a.math.Quaternion(b);
        this.scale(f);
        g.scale(e);
        this.add(g);
        return this
    };
    b.toAxisAndAngle = function () {
        var b, d, e = new a.math.Vec3;
        b = Math.acos(this.w);
        d = Math.sqrt(a.math.square(this.x) + a.math.square(this.y) + a.math.square(this.z));
        d > -a.math.EPSILON && d < a.math.EPSILON || d < 2 * Math.PI + a.math.EPSILON && d > 2 * Math.PI - a.math.EPSILON ? (b = 0, e.x = 0, e.y = 0, e.z = 1) : (b *= 2, e.x = this.x / d, e.y = this.y / d, e.z = this.z / d, e.normalize());
        return {axis: e, angle: b}
    };
    b.scale = function (a) {
        this.x *= a;
        this.y *= a;
        this.z *= a;
        this.w *= a;
        return this
    };
    b.assignFrom = function (a) {
        this.x = a.x;
        this.y = a.y;
        this.z = a.z;
        this.w = a.w;
        return this
    };
    b.add = function (a) {
        this.x += a.x;
        this.y += a.y;
        this.z += a.z;
        this.w += a.w;
        return this
    };
    a.math.Quaternion.rotationBetweenVec3 = function (b, d, e) {
        var f = new a.math.Vec3(b), g = new a.math.Vec3(d);
        f.normalize();
        g.normalize();
        var h = f.dot(g);
        d = new a.math.Quaternion;
        if (1 <= h)return d.identity(), d;
        -0.999999 > h ? Math.abs(e.lengthSq()) < a.math.EPSILON ? d.rotationAxis(e, Math.PI) : (f = new a.math.Vec3(1, 0, 0), f.cross(b), Math.abs(f.lengthSq()) < a.math.EPSILON && (f.fill(0, 1, 0), f.cross(b)), f.normalize(), d.rotationAxis(f, Math.PI)) : (b = Math.sqrt(2 * (1 + h)), e = 1 / b, f.cross(g), d.x = f.x * e, d.y = f.y * e, d.z = f.z * e, d.w = 0.5 * b, d.normalize());
        return d
    };
    b.multiplyVec3 = function (b) {
        var d = this.x, e = this.y, f = this.z, g = new a.math.Vec3(b), h = new a.math.Vec3(d, e, f), d = new a.math.Vec3(d, e, f);
        h.cross(b);
        d.cross(h);
        h.scale(2 * q.w);
        d.scale(2);
        g.add(h);
        g.add(d);
        return g
    }
})(cc);
cc.math.AABB = function (a, b) {
    this.min = a || new cc.math.Vec3;
    this.max = b || new cc.math.Vec3
};
cc.math.AABB.prototype.containsPoint = function (a) {
    return a.x >= this.min.x && a.x <= this.max.x && a.y >= this.min.y && a.y <= this.max.y && a.z >= this.min.z && a.z <= this.max.z
};
cc.math.AABB.containsPoint = function (a, b) {
    return a.x >= b.min.x && a.x <= b.max.x && a.y >= b.min.y && a.y <= b.max.y && a.z >= b.min.z && a.z <= b.max.z
};
cc.math.AABB.prototype.assignFrom = function (a) {
    this.min.assignFrom(a.min);
    this.max.assignFrom(a.max)
};
cc.math.AABB.assign = function (a, b) {
    a.min.assignFrom(b.min);
    a.max.assignFrom(b.max);
    return a
};
(function (a) {
    a.math.Matrix4Stack = function (a, b) {
        this.top = a;
        this.stack = b || []
    };
    a.km_mat4_stack = a.math.Matrix4Stack;
    var b = a.math.Matrix4Stack.prototype;
    b.initialize = function () {
        this.stack.length = 0;
        this.top = null
    };
    a.km_mat4_stack_push = function (b, d) {
        b.stack.push(b.top);
        b.top = new a.math.Matrix4(d)
    };
    a.km_mat4_stack_pop = function (a, b) {
        a.top = a.stack.pop()
    };
    a.km_mat4_stack_release = function (a) {
        a.stack = null;
        a.top = null
    };
    b.push = function (b) {
        b = b || this.top;
        this.stack.push(this.top);
        this.top = new a.math.Matrix4(b)
    };
    b.pop = function () {
        this.top = this.stack.pop()
    };
    b.release = function () {
        this._matrixPool = this.top = this.stack = null
    };
    b._getFromPool = function (b) {
        var d = this._matrixPool;
        if (0 === d.length)return new a.math.Matrix4(b);
        d = d.pop();
        d.assignFrom(b);
        return d
    };
    b._putInPool = function (a) {
        this._matrixPool.push(a)
    }
})(cc);
(function (a) {
    a.KM_GL_MODELVIEW = 5888;
    a.KM_GL_PROJECTION = 5889;
    a.KM_GL_TEXTURE = 5890;
    a.modelview_matrix_stack = new a.math.Matrix4Stack;
    a.projection_matrix_stack = new a.math.Matrix4Stack;
    a.texture_matrix_stack = new a.math.Matrix4Stack;
    a.current_stack = null;
    a.lazyInitialize = function () {
        var b = new a.math.Matrix4;
        a.modelview_matrix_stack.initialize();
        a.projection_matrix_stack.initialize();
        a.texture_matrix_stack.initialize();
        a.current_stack = a.modelview_matrix_stack;
        a.initialized = !0;
        b.identity();
        a.modelview_matrix_stack.push(b);
        a.projection_matrix_stack.push(b);
        a.texture_matrix_stack.push(b)
    };
    a.lazyInitialize();
    a.kmGLFreeAll = function () {
        a.modelview_matrix_stack.release();
        a.modelview_matrix_stack = null;
        a.projection_matrix_stack.release();
        a.projection_matrix_stack = null;
        a.texture_matrix_stack.release();
        a.texture_matrix_stack = null;
        a.initialized = !1;
        a.current_stack = null
    };
    a.kmGLPushMatrix = function () {
        a.current_stack.push(a.current_stack.top)
    };
    a.kmGLPushMatrixWitMat4 = function (b) {
        a.current_stack.stack.push(a.current_stack.top);
        b.assignFrom(a.current_stack.top);
        a.current_stack.top = b
    };
    a.kmGLPopMatrix = function () {
        a.current_stack.top = a.current_stack.stack.pop()
    };
    a.kmGLMatrixMode = function (b) {
        switch (b) {
            case a.KM_GL_MODELVIEW:
                a.current_stack = a.modelview_matrix_stack;
                break;
            case a.KM_GL_PROJECTION:
                a.current_stack = a.projection_matrix_stack;
                break;
            case a.KM_GL_TEXTURE:
                a.current_stack = a.texture_matrix_stack;
                break;
            default:
                throw"Invalid matrix mode specified";
        }
    };
    a.kmGLLoadIdentity = function () {
        a.current_stack.top.identity()
    };
    a.kmGLLoadMatrix = function (b) {
        a.current_stack.top.assignFrom(b)
    };
    a.kmGLMultMatrix = function (b) {
        a.current_stack.top.multiply(b)
    };
    var b = new a.math.Matrix4;
    a.kmGLTranslatef = function (c, e, f) {
        c = a.math.Matrix4.createByTranslation(c, e, f, b);
        a.current_stack.top.multiply(c)
    };
    var c = new a.math.Vec3;
    a.kmGLRotatef = function (d, e, f, g) {
        c.fill(e, f, g);
        d = a.math.Matrix4.createByAxisAndAngle(c, a.degreesToRadians(d), b);
        a.current_stack.top.multiply(d)
    };
    a.kmGLScalef = function (c, e, f) {
        c = a.math.Matrix4.createByScale(c, e, f, b);
        a.current_stack.top.multiply(c)
    };
    a.kmGLGetMatrix = function (b, c) {
        switch (b) {
            case a.KM_GL_MODELVIEW:
                c.assignFrom(a.modelview_matrix_stack.top);
                break;
            case a.KM_GL_PROJECTION:
                c.assignFrom(a.projection_matrix_stack.top);
                break;
            case a.KM_GL_TEXTURE:
                c.assignFrom(a.texture_matrix_stack.top);
                break;
            default:
                throw"Invalid matrix mode specified";
        }
    }
})(cc);
cc.SHADER_POSITION_UCOLOR_FRAG = "precision lowp float;\nvarying vec4 v_fragmentColor;\nvoid main()                              \n{ \n    gl_FragColor \x3d v_fragmentColor;      \n}\n";
cc.SHADER_POSITION_UCOLOR_VERT = "attribute vec4 a_position;\nuniform    vec4 u_color;\nuniform float u_pointSize;\nvarying lowp vec4 v_fragmentColor; \nvoid main(void)   \n{\n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    gl_PointSize \x3d u_pointSize;          \n    v_fragmentColor \x3d u_color;           \n}";
cc.SHADER_POSITION_COLOR_FRAG = "precision lowp float; \nvarying vec4 v_fragmentColor; \nvoid main() \n{ \n     gl_FragColor \x3d v_fragmentColor; \n} ";
cc.SHADER_POSITION_COLOR_VERT = "attribute vec4 a_position;\nattribute vec4 a_color;\nvarying lowp vec4 v_fragmentColor;\nvoid main()\n{\n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_fragmentColor \x3d a_color;             \n}";
cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_FRAG = "// #extension GL_OES_standard_derivatives : enable\nvarying mediump vec4 v_color;\nvarying mediump vec2 v_texcoord;\nvoid main()\t\n{ \n// #if defined GL_OES_standard_derivatives\t\n// gl_FragColor \x3d v_color*smoothstep(0.0, length(fwidth(v_texcoord)), 1.0 - length(v_texcoord)); \n// #else\t\ngl_FragColor \x3d v_color * step(0.0, 1.0 - length(v_texcoord)); \n// #endif \n}";
cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_VERT = "attribute mediump vec4 a_position; \nattribute mediump vec2 a_texcoord; \nattribute mediump vec4 a_color;\t\nvarying mediump vec4 v_color; \nvarying mediump vec2 v_texcoord;\t\nvoid main() \n{ \n     v_color \x3d a_color;//vec4(a_color.rgb * a_color.a, a_color.a); \n     v_texcoord \x3d a_texcoord; \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n}";
cc.SHADER_POSITION_TEXTURE_FRAG = "precision lowp float;   \nvarying vec2 v_texCoord;  \nvoid main() \n{  \n    gl_FragColor \x3d  texture2D(CC_Texture0, v_texCoord);   \n}";
cc.SHADER_POSITION_TEXTURE_VERT = "attribute vec4 a_position; \nattribute vec2 a_texCoord; \nvarying mediump vec2 v_texCoord; \nvoid main() \n{ \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_texCoord \x3d a_texCoord;               \n}";
cc.SHADER_POSITION_TEXTURE_UCOLOR_FRAG = "precision lowp float;  \nuniform vec4 u_color; \nvarying vec2 v_texCoord; \nvoid main() \n{  \n    gl_FragColor \x3d  texture2D(CC_Texture0, v_texCoord) * u_color;    \n}";
cc.SHADER_POSITION_TEXTURE_UCOLOR_VERT = "attribute vec4 a_position;\nattribute vec2 a_texCoord; \nvarying mediump vec2 v_texCoord; \nvoid main() \n{ \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_texCoord \x3d a_texCoord;                 \n}";
cc.SHADER_POSITION_TEXTURE_A8COLOR_FRAG = "precision lowp float;  \nvarying vec4 v_fragmentColor; \nvarying vec2 v_texCoord; \nvoid main() \n{ \n    gl_FragColor \x3d vec4( v_fragmentColor.rgb,         \n        v_fragmentColor.a * texture2D(CC_Texture0, v_texCoord).a   \n    ); \n}";
cc.SHADER_POSITION_TEXTURE_A8COLOR_VERT = "attribute vec4 a_position; \nattribute vec2 a_texCoord; \nattribute vec4 a_color;  \nvarying lowp vec4 v_fragmentColor; \nvarying mediump vec2 v_texCoord; \nvoid main() \n{ \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_fragmentColor \x3d a_color; \n    v_texCoord \x3d a_texCoord; \n}";
cc.SHADER_POSITION_TEXTURE_COLOR_FRAG = "precision lowp float;\nvarying vec4 v_fragmentColor; \nvarying vec2 v_texCoord; \nvoid main() \n{ \n    gl_FragColor \x3d v_fragmentColor * texture2D(CC_Texture0, v_texCoord); \n}";
cc.SHADER_POSITION_TEXTURE_COLOR_VERT = "attribute vec4 a_position; \nattribute vec2 a_texCoord; \nattribute vec4 a_color;  \nvarying lowp vec4 v_fragmentColor; \nvarying mediump vec2 v_texCoord; \nvoid main() \n{ \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_fragmentColor \x3d a_color; \n    v_texCoord \x3d a_texCoord; \n}";
cc.SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG = "precision lowp float;   \nvarying vec4 v_fragmentColor; \nvarying vec2 v_texCoord;   \nuniform float CC_alpha_value; \nvoid main() \n{  \n    vec4 texColor \x3d texture2D(CC_Texture0, v_texCoord);  \n    if ( texColor.a \x3c\x3d CC_alpha_value )          \n        discard; \n    gl_FragColor \x3d texColor * v_fragmentColor;  \n}";
cc.SHADEREX_SWITCHMASK_FRAG = "precision lowp float; \nvarying vec4 v_fragmentColor; \nvarying vec2 v_texCoord; \nuniform sampler2D u_texture;  \nuniform sampler2D   u_mask;   \nvoid main()  \n{  \n    vec4 texColor   \x3d texture2D(u_texture, v_texCoord);  \n    vec4 maskColor  \x3d texture2D(u_mask, v_texCoord); \n    vec4 finalColor \x3d vec4(texColor.r, texColor.g, texColor.b, maskColor.a * texColor.a);        \n    gl_FragColor    \x3d v_fragmentColor * finalColor; \n}";
cc.shaderCache = {
    TYPE_POSITION_TEXTURECOLOR: 0,
    TYPE_POSITION_TEXTURECOLOR_ALPHATEST: 1,
    TYPE_POSITION_COLOR: 2,
    TYPE_POSITION_TEXTURE: 3,
    TYPE_POSITION_TEXTURE_UCOLOR: 4,
    TYPE_POSITION_TEXTURE_A8COLOR: 5,
    TYPE_POSITION_UCOLOR: 6,
    TYPE_POSITION_LENGTH_TEXTURECOLOR: 7,
    TYPE_MAX: 8,
    _programs: {},
    _init: function () {
        this.loadDefaultShaders();
        return !0
    },
    _loadDefaultShader: function (a, b) {
        switch (b) {
            case this.TYPE_POSITION_TEXTURECOLOR:
                a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_FRAG);
                a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case this.TYPE_POSITION_TEXTURECOLOR_ALPHATEST:
                a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG);
                a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case this.TYPE_POSITION_COLOR:
                a.initWithVertexShaderByteArray(cc.SHADER_POSITION_COLOR_VERT, cc.SHADER_POSITION_COLOR_FRAG);
                a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                break;
            case this.TYPE_POSITION_TEXTURE:
                a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_VERT, cc.SHADER_POSITION_TEXTURE_FRAG);
                a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case this.TYPE_POSITION_TEXTURE_UCOLOR:
                a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_UCOLOR_VERT, cc.SHADER_POSITION_TEXTURE_UCOLOR_FRAG);
                a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case this.TYPE_POSITION_TEXTURE_A8COLOR:
                a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_A8COLOR_VERT, cc.SHADER_POSITION_TEXTURE_A8COLOR_FRAG);
                a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                break;
            case this.TYPE_POSITION_UCOLOR:
                a.initWithVertexShaderByteArray(cc.SHADER_POSITION_UCOLOR_VERT, cc.SHADER_POSITION_UCOLOR_FRAG);
                a.addAttribute("aVertex", cc.VERTEX_ATTRIB_POSITION);
                break;
            case this.TYPE_POSITION_LENGTH_TEXTURECOLOR:
                a.initWithVertexShaderByteArray(cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_VERT, cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_FRAG);
                a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
                break;
            default:
                cc.log("cocos2d: cc.shaderCache._loadDefaultShader, error shader type");
                return
        }
        a.link();
        a.updateUniforms()
    },
    loadDefaultShaders: function () {
        var a = new cc.GLProgram;
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURECOLOR);
        this._programs[cc.SHADER_POSITION_TEXTURECOLOR] = a;
        this._programs.ShaderPositionTextureColor = a;
        a = new cc.GLProgram;
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURECOLOR_ALPHATEST);
        this._programs[cc.SHADER_POSITION_TEXTURECOLORALPHATEST] = a;
        this._programs.ShaderPositionTextureColorAlphaTest = a;
        a = new cc.GLProgram;
        this._loadDefaultShader(a, this.TYPE_POSITION_COLOR);
        this._programs[cc.SHADER_POSITION_COLOR] = a;
        this._programs.ShaderPositionColor = a;
        a = new cc.GLProgram;
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE);
        this._programs[cc.SHADER_POSITION_TEXTURE] = a;
        this._programs.ShaderPositionTexture = a;
        a = new cc.GLProgram;
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE_UCOLOR);
        this._programs[cc.SHADER_POSITION_TEXTURE_UCOLOR] = a;
        this._programs.ShaderPositionTextureUColor = a;
        a = new cc.GLProgram;
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE_A8COLOR);
        this._programs[cc.SHADER_POSITION_TEXTUREA8COLOR] = a;
        this._programs.ShaderPositionTextureA8Color = a;
        a = new cc.GLProgram;
        this._loadDefaultShader(a, this.TYPE_POSITION_UCOLOR);
        this._programs[cc.SHADER_POSITION_UCOLOR] = a;
        this._programs.ShaderPositionUColor = a;
        a = new cc.GLProgram;
        this._loadDefaultShader(a, this.TYPE_POSITION_LENGTH_TEXTURECOLOR);
        this._programs[cc.SHADER_POSITION_LENGTHTEXTURECOLOR] = a;
        this._programs.ShaderPositionLengthTextureColor = a
    },
    reloadDefaultShaders: function () {
        var a = this.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        a.reset();
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURECOLOR);
        a = this.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
        a.reset();
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURECOLOR_ALPHATEST);
        a = this.programForKey(cc.SHADER_POSITION_COLOR);
        a.reset();
        this._loadDefaultShader(a, this.TYPE_POSITION_COLOR);
        a = this.programForKey(cc.SHADER_POSITION_TEXTURE);
        a.reset();
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE);
        a = this.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
        a.reset();
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE_UCOLOR);
        a = this.programForKey(cc.SHADER_POSITION_TEXTUREA8COLOR);
        a.reset();
        this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE_A8COLOR);
        a = this.programForKey(cc.SHADER_POSITION_UCOLOR);
        a.reset();
        this._loadDefaultShader(a, this.TYPE_POSITION_UCOLOR)
    },
    programForKey: function (a) {
        return this._programs[a]
    },
    getProgram: function (a) {
        return this._programs[a]
    },
    addProgram: function (a, b) {
        this._programs[b] = a
    }
};
cc.HashUniformEntry = function (a, b, c) {
    this.value = a;
    this.location = b;
    this.hh = c || {}
};
cc.GLProgram = cc.Class.extend({
    _glContext: null,
    _programObj: null,
    _vertShader: null,
    _fragShader: null,
    _uniforms: null,
    _hashForUniforms: null,
    _usesTime: !1,
    _updateUniformLocation: function (a, b, c) {
        if (null == a)return !1;
        c = !0;
        for (var d = null, e = 0; e < this._hashForUniforms.length; e++)this._hashForUniforms[e].location == a && (d = this._hashForUniforms[e]);
        d ? d.value == b ? c = !1 : d.value = b : (d = new cc.HashUniformEntry, d.location = a, d.value = b, this._hashForUniforms.push(d));
        return c
    },
    _description: function () {
        return "\x3cCCGLProgram \x3d " +
            this.toString() + " | Program \x3d " + this._programObj.toString() + ", VertexShader \x3d " + this._vertShader.toString() + ", FragmentShader \x3d " + this._fragShader.toString() + "\x3e"
    },
    _compileShader: function (a, b, c) {
        if (!c || !a)return !1;
        c = (cc.GLProgram._isHighpSupported() ? "precision highp float;\n" : "precision mediump float;\n") + "uniform mat4 CC_PMatrix;         \nuniform mat4 CC_MVMatrix;        \nuniform mat4 CC_MVPMatrix;       \nuniform vec4 CC_Time;            \nuniform vec4 CC_SinTime;         \nuniform vec4 CC_CosTime;         \nuniform vec4 CC_Random01;        \nuniform sampler2D CC_Texture0;   \n//CC INCLUDES END                \n" +
            c;
        this._glContext.shaderSource(a, c);
        this._glContext.compileShader(a);
        c = this._glContext.getShaderParameter(a, this._glContext.COMPILE_STATUS);
        c || (cc.log("cocos2d: ERROR: Failed to compile shader:\n" + this._glContext.getShaderSource(a)), b === this._glContext.VERTEX_SHADER ? cc.log("cocos2d: \n" + this.vertexShaderLog()) : cc.log("cocos2d: \n" + this.fragmentShaderLog()));
        return !0 === c
    },
    ctor: function (a, b, c) {
        this._uniforms = [];
        this._hashForUniforms = [];
        this._glContext = c || cc._renderContext;
        a && b && this.init(a, b)
    },
    destroyProgram: function () {
        this._hashForUniforms = this._uniforms = this._fragShader = this._vertShader = null;
        this._glContext.deleteProgram(this._programObj)
    },
    initWithVertexShaderByteArray: function (a, b) {
        var c = this._glContext;
        this._programObj = c.createProgram();
        this._fragShader = this._vertShader = null;
        a && (this._vertShader = c.createShader(c.VERTEX_SHADER), this._compileShader(this._vertShader, c.VERTEX_SHADER, a) || cc.log("cocos2d: ERROR: Failed to compile vertex shader"));
        b && (this._fragShader = c.createShader(c.FRAGMENT_SHADER), this._compileShader(this._fragShader, c.FRAGMENT_SHADER, b) || cc.log("cocos2d: ERROR: Failed to compile fragment shader"));
        this._vertShader && c.attachShader(this._programObj, this._vertShader);
        cc.checkGLErrorDebug();
        this._fragShader && c.attachShader(this._programObj, this._fragShader);
        this._hashForUniforms.length = 0;
        cc.checkGLErrorDebug();
        return !0
    },
    initWithString: function (a, b) {
        return this.initWithVertexShaderByteArray(a, b)
    },
    initWithVertexShaderFilename: function (a, b) {
        var c = cc.loader.getRes(a);
        if (!c)throw"Please load the resource firset : " + a;
        var d = cc.loader.getRes(b);
        if (!d)throw"Please load the resource firset : " + b;
        return this.initWithVertexShaderByteArray(c, d)
    },
    init: function (a, b) {
        return this.initWithVertexShaderFilename(a, b)
    },
    addAttribute: function (a, b) {
        this._glContext.bindAttribLocation(this._programObj, b, a)
    },
    link: function () {
        if (!this._programObj)return cc.log("cc.GLProgram.link(): Cannot link invalid program"), !1;
        this._glContext.linkProgram(this._programObj);
        this._vertShader && this._glContext.deleteShader(this._vertShader);
        this._fragShader && this._glContext.deleteShader(this._fragShader);
        this._fragShader = this._vertShader = null;
        return cc.game.config[cc.game.CONFIG_KEY.debugMode] && !this._glContext.getProgramParameter(this._programObj, this._glContext.LINK_STATUS) ? (cc.log("cocos2d: ERROR: Failed to link program: " + this._glContext.getProgramInfoLog(this._programObj)), cc.glDeleteProgram(this._programObj), this._programObj = null, !1) : !0
    },
    use: function () {
        cc.glUseProgram(this._programObj)
    },
    updateUniforms: function () {
        this._uniforms[cc.UNIFORM_PMATRIX] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_PMATRIX_S);
        this._uniforms[cc.UNIFORM_MVMATRIX] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_MVMATRIX_S);
        this._uniforms[cc.UNIFORM_MVPMATRIX] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_MVPMATRIX_S);
        this._uniforms[cc.UNIFORM_TIME] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_TIME_S);
        this._uniforms[cc.UNIFORM_SINTIME] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_SINTIME_S);
        this._uniforms[cc.UNIFORM_COSTIME] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_COSTIME_S);
        this._usesTime = null != this._uniforms[cc.UNIFORM_TIME] || null != this._uniforms[cc.UNIFORM_SINTIME] || null != this._uniforms[cc.UNIFORM_COSTIME];
        this._uniforms[cc.UNIFORM_RANDOM01] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_RANDOM01_S);
        this._uniforms[cc.UNIFORM_SAMPLER] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_SAMPLER_S);
        this.use();
        this.setUniformLocationWith1i(this._uniforms[cc.UNIFORM_SAMPLER], 0)
    },
    getUniformLocationForName: function (a) {
        if (!a)throw"cc.GLProgram.getUniformLocationForName(): uniform name should be non-null";
        if (!this._programObj)throw"cc.GLProgram.getUniformLocationForName(): Invalid operation. Cannot get uniform location when program is not initialized";
        return this._glContext.getUniformLocation(this._programObj, a)
    },
    getUniformMVPMatrix: function () {
        return this._uniforms[cc.UNIFORM_MVPMATRIX]
    },
    getUniformSampler: function () {
        return this._uniforms[cc.UNIFORM_SAMPLER]
    },
    setUniformLocationWith1i: function (a, b) {
        this._updateUniformLocation(a, b) && this._glContext.uniform1i(a, b)
    },
    setUniformLocationWith2i: function (a, b, c) {
        this._updateUniformLocation(a, [b, c]) && this._glContext.uniform2i(a, b, c)
    },
    setUniformLocationWith3i: function (a, b, c, d) {
        this._updateUniformLocation(a, [b, c, d]) && this._glContext.uniform3i(a, b, c, d)
    },
    setUniformLocationWith4i: function (a, b, c, d, e) {
        this._updateUniformLocation(a, [b, c, d, e]) && this._glContext.uniform4i(a, b, c, d, e)
    },
    setUniformLocationWith2iv: function (a, b, c) {
        this._updateUniformLocation(a, b) && this._glContext.uniform2iv(a, b)
    },
    setUniformLocationWith3iv: function (a, b, c) {
        this._updateUniformLocation(a, b) && this._glContext.uniform3iv(a, b)
    },
    setUniformLocationWith4iv: function (a, b, c) {
        this._updateUniformLocation(a, b) && this._glContext.uniform4iv(a, b)
    },
    setUniformLocationI32: function (a, b) {
        this.setUniformLocationWith1i(a, b)
    },
    setUniformLocationWith1f: function (a, b) {
        this._updateUniformLocation(a, b) && this._glContext.uniform1f(a, b)
    },
    setUniformLocationWith2f: function (a, b, c) {
        this._updateUniformLocation(a, [b, c]) && this._glContext.uniform2f(a, b, c)
    },
    setUniformLocationWith3f: function (a, b, c, d) {
        this._updateUniformLocation(a, [b, c, d]) && this._glContext.uniform3f(a, b, c, d)
    },
    setUniformLocationWith4f: function (a, b, c, d, e) {
        this._updateUniformLocation(a, [b, c, d, e]) && this._glContext.uniform4f(a, b, c, d, e)
    },
    setUniformLocationWith2fv: function (a, b, c) {
        this._updateUniformLocation(a, b) && this._glContext.uniform2fv(a, b)
    },
    setUniformLocationWith3fv: function (a, b, c) {
        this._updateUniformLocation(a, b) && this._glContext.uniform3fv(a, b)
    },
    setUniformLocationWith4fv: function (a, b, c) {
        this._updateUniformLocation(a, b) && this._glContext.uniform4fv(a, b)
    },
    setUniformLocationWithMatrix4fv: function (a, b, c) {
        this._updateUniformLocation(a, b) && this._glContext.uniformMatrix4fv(a, !1, b)
    },
    setUniformLocationF32: function () {
        if (!(2 > arguments.length))switch (arguments.length) {
            case 2:
                this.setUniformLocationWith1f(arguments[0], arguments[1]);
                break;
            case 3:
                this.setUniformLocationWith2f(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                this.setUniformLocationWith3f(arguments[0], arguments[1], arguments[2], arguments[3]);
                break;
            case 5:
                this.setUniformLocationWith4f(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4])
        }
    },
    setUniformsForBuiltins: function () {
        var a = new cc.math.Matrix4, b = new cc.math.Matrix4, c = new cc.math.Matrix4;
        cc.kmGLGetMatrix(cc.KM_GL_PROJECTION, a);
        cc.kmGLGetMatrix(cc.KM_GL_MODELVIEW, b);
        cc.kmMat4Multiply(c, a, b);
        this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_PMATRIX], a.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVMATRIX], b.mat, 1);
        this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], c.mat, 1);
        this._usesTime && (a = cc.director, a = a.getTotalFrames() * a.getAnimationInterval(), this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_TIME], a / 10, a, 2 * a, 4 * a), this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_SINTIME], a / 8, a / 4, a / 2, Math.sin(a)), this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_COSTIME], a / 8, a / 4, a / 2, Math.cos(a)));
        -1 !== this._uniforms[cc.UNIFORM_RANDOM01] && this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_RANDOM01], Math.random(), Math.random(), Math.random(), Math.random())
    },
    _setUniformsForBuiltinsForRenderer: function (a) {
        if (a && a._renderCmd) {
            var b = new cc.math.Matrix4, c = new cc.math.Matrix4;
            cc.kmGLGetMatrix(cc.KM_GL_PROJECTION, b);
            cc.kmMat4Multiply(c, b, a._renderCmd._stackMatrix);
            this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_PMATRIX], b.mat, 1);
            this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVMATRIX], a._renderCmd._stackMatrix.mat, 1);
            this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], c.mat, 1);
            this._usesTime && (a = cc.director, a = a.getTotalFrames() * a.getAnimationInterval(), this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_TIME], a / 10, a, 2 * a, 4 * a), this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_SINTIME], a / 8, a / 4, a / 2, Math.sin(a)), this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_COSTIME], a / 8, a / 4, a / 2, Math.cos(a)));
            -1 !== this._uniforms[cc.UNIFORM_RANDOM01] && this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_RANDOM01], Math.random(), Math.random(), Math.random(), Math.random())
        }
    },
    setUniformForModelViewProjectionMatrix: function () {
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], !1, cc.getMat4MultiplyValue(cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top))
    },
    setUniformForModelViewProjectionMatrixWithMat4: function (a) {
        cc.kmMat4Multiply(a, cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top);
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], !1, a.mat)
    },
    setUniformForModelViewAndProjectionMatrixWithMat4: function () {
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVMATRIX], !1, cc.modelview_matrix_stack.top.mat);
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_PMATRIX], !1, cc.projection_matrix_stack.top.mat)
    },
    _setUniformForMVPMatrixWithMat4: function (a) {
        if (!a)throw"modelView matrix is undefined.";
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVMATRIX], !1, a.mat);
        this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_PMATRIX], !1, cc.projection_matrix_stack.top.mat)
    },
    vertexShaderLog: function () {
        return this._glContext.getShaderInfoLog(this._vertShader)
    },
    getVertexShaderLog: function () {
        return this._glContext.getShaderInfoLog(this._vertShader)
    },
    getFragmentShaderLog: function () {
        return this._glContext.getShaderInfoLog(this._vertShader)
    },
    fragmentShaderLog: function () {
        return this._glContext.getShaderInfoLog(this._fragShader)
    },
    programLog: function () {
        return this._glContext.getProgramInfoLog(this._programObj)
    },
    getProgramLog: function () {
        return this._glContext.getProgramInfoLog(this._programObj)
    },
    reset: function () {
        this._fragShader = this._vertShader = null;
        this._uniforms.length = 0;
        this._glContext.deleteProgram(this._programObj);
        this._programObj = null;
        for (var a = 0; a < this._hashForUniforms.length; a++)this._hashForUniforms[a].value = null, this._hashForUniforms[a] = null;
        this._hashForUniforms.length = 0
    },
    getProgram: function () {
        return this._programObj
    },
    retain: function () {
    },
    release: function () {
    }
});
cc.GLProgram.create = function (a, b) {
    return new cc.GLProgram(a, b)
};
cc.GLProgram._highpSupported = null;
cc.GLProgram._isHighpSupported = function () {
    if (null == cc.GLProgram._highpSupported) {
        var a = cc._renderContext, a = a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.HIGH_FLOAT);
        cc.GLProgram._highpSupported = 0 !== a.precision
    }
    return cc.GLProgram._highpSupported
};
cc.setProgram = function (a, b) {
    a.shaderProgram = b;
    var c = a.children;
    if (c)
        for (var d = 0; d < c.length; d++)cc.setProgram(c[d], b)
};
cc._currentProjectionMatrix = -1;
cc._vertexAttribPosition = !1;
cc._vertexAttribColor = !1;
cc._vertexAttribTexCoords = !1;
cc.ENABLE_GL_STATE_CACHE && (cc.MAX_ACTIVETEXTURE = 16, cc._currentShaderProgram = -1, cc._currentBoundTexture = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], cc._blendingSource = -1, cc._blendingDest = -1, cc._GLServerState = 0, cc.TEXTURE_ATLAS_USE_VAO && (cc._uVAO = 0));
cc.glInvalidateStateCache = function () {
    cc.kmGLFreeAll();
    cc._currentProjectionMatrix = -1;
    cc._vertexAttribPosition = !1;
    cc._vertexAttribColor = !1;
    cc._vertexAttribTexCoords = !1;
    if (cc.ENABLE_GL_STATE_CACHE) {
        cc._currentShaderProgram = -1;
        for (var a = 0; a < cc.MAX_ACTIVETEXTURE; a++)cc._currentBoundTexture[a] = -1;
        cc._blendingSource = -1;
        cc._blendingDest = -1;
        cc._GLServerState = 0
    }
};
cc.glUseProgram = function (a) {
    a !== cc._currentShaderProgram && (cc._currentShaderProgram = a, cc._renderContext.useProgram(a))
};
cc.ENABLE_GL_STATE_CACHE || (cc.glUseProgram = function (a) {
    cc._renderContext.useProgram(a)
});
cc.glDeleteProgram = function (a) {
    cc.ENABLE_GL_STATE_CACHE && a === cc._currentShaderProgram && (cc._currentShaderProgram = -1);
    gl.deleteProgram(a)
};
cc.glBlendFunc = function (a, b) {
    if (a !== cc._blendingSource || b !== cc._blendingDest)cc._blendingSource = a, cc._blendingDest = b, cc.setBlending(a, b)
};
cc.setBlending = function (a, b) {
    var c = cc._renderContext;
    a === c.ONE && b === c.ZERO ? c.disable(c.BLEND) : (c.enable(c.BLEND), cc._renderContext.blendFunc(a, b))
};
cc.glBlendFuncForParticle = function (a, b) {
    if (a !== cc._blendingSource || b !== cc._blendingDest) {
        cc._blendingSource = a;
        cc._blendingDest = b;
        var c = cc._renderContext;
        a === c.ONE && b === c.ZERO ? c.disable(c.BLEND) : (c.enable(c.BLEND), c.blendFuncSeparate(c.SRC_ALPHA, b, a, b))
    }
};
cc.ENABLE_GL_STATE_CACHE || (cc.glBlendFunc = cc.setBlending);
cc.glBlendResetToCache = function () {
    var a = cc._renderContext;
    a.blendEquation(a.FUNC_ADD);
    cc.ENABLE_GL_STATE_CACHE ? cc.setBlending(cc._blendingSource, cc._blendingDest) : cc.setBlending(a.BLEND_SRC, a.BLEND_DST)
};
cc.setProjectionMatrixDirty = function () {
    cc._currentProjectionMatrix = -1
};
cc.glEnableVertexAttribs = function (a) {
    var b = cc._renderContext, c = a & cc.VERTEX_ATTRIB_FLAG_POSITION;
    c !== cc._vertexAttribPosition && (c ? b.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION) : b.disableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION), cc._vertexAttribPosition = c);
    c = a & cc.VERTEX_ATTRIB_FLAG_COLOR;
    c !== cc._vertexAttribColor && (c ? b.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR) : b.disableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR), cc._vertexAttribColor = c);
    a &= cc.VERTEX_ATTRIB_FLAG_TEX_COORDS;
    a !== cc._vertexAttribTexCoords && (a ? b.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS) : b.disableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS), cc._vertexAttribTexCoords = a)
};
cc.glBindTexture2D = function (a) {
    cc.glBindTexture2DN(0, a)
};
cc.glBindTexture2DN = function (a, b) {
    if (cc._currentBoundTexture[a] !== b) {
        cc._currentBoundTexture[a] = b;
        var c = cc._renderContext;
        c.activeTexture(c.TEXTURE0 + a);
        b ? c.bindTexture(c.TEXTURE_2D, b._webTextureObj) : c.bindTexture(c.TEXTURE_2D, null)
    }
};
cc.ENABLE_GL_STATE_CACHE || (cc.glBindTexture2DN = function (a, b) {
    var c = cc._renderContext;
    c.activeTexture(c.TEXTURE0 + a);
    b ? c.bindTexture(c.TEXTURE_2D, b._webTextureObj) : c.bindTexture(c.TEXTURE_2D, null)
});
cc.glDeleteTexture = function (a) {
    cc.glDeleteTextureN(0, a)
};
cc.glDeleteTextureN = function (a, b) {
    cc.ENABLE_GL_STATE_CACHE && b === cc._currentBoundTexture[a] && (cc._currentBoundTexture[a] = -1);
    cc._renderContext.deleteTexture(b)
};
cc.glBindVAO = function (a) {
    cc.TEXTURE_ATLAS_USE_VAO && cc.ENABLE_GL_STATE_CACHE && cc._uVAO !== a && (cc._uVAO = a)
};
cc.glEnable = function (a) {
};
cc.v2fzero = function () {
    return {x: 0, y: 0}
};
cc.v2f = function (a, b) {
    return {x: a, y: b}
};
cc.v2fadd = function (a, b) {
    return cc.v2f(a.x + b.x, a.y + b.y)
};
cc.v2fsub = function (a, b) {
    return cc.v2f(a.x - b.x, a.y - b.y)
};
cc.v2fmult = function (a, b) {
    return cc.v2f(a.x * b, a.y * b)
};
cc.v2fperp = function (a) {
    return cc.v2f(-a.y, a.x)
};
cc.v2fneg = function (a) {
    return cc.v2f(-a.x, -a.y)
};
cc.v2fdot = function (a, b) {
    return a.x * b.x + a.y * b.y
};
cc.v2fforangle = function (a) {
    return cc.v2f(Math.cos(a), Math.sin(a))
};
cc.v2fnormalize = function (a) {
    a = cc.pNormalize(cc.p(a.x, a.y));
    return cc.v2f(a.x, a.y)
};
cc.__v2f = function (a) {
    return cc.v2f(a.x, a.y)
};
cc.__t = function (a) {
    return {u: a.x, v: a.y}
};
cc.DrawNodeCanvas = cc.Node.extend({
    _buffer: null, _blendFunc: null, _lineWidth: 1, _drawColor: null, _className: "DrawNodeCanvas", ctor: function () {
        cc.Node.prototype.ctor.call(this);
        var a = this._renderCmd;
        a._buffer = this._buffer = [];
        a._drawColor = this._drawColor = cc.color(255, 255, 255, 255);
        a._blendFunc = this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        this.init()
    }, getBlendFunc: function () {
        return this._blendFunc
    }, setBlendFunc: function (a, b) {
        void 0 === b ? (this._blendFunc.src = a.src, this._blendFunc.dst = a.dst) : (this._blendFunc.src = a, this._blendFunc.dst = b)
    }, setLineWidth: function (a) {
        this._lineWidth = a
    }, getLineWidth: function () {
        return this._lineWidth
    }, setDrawColor: function (a) {
        var b = this._drawColor;
        b.r = a.r;
        b.g = a.g;
        b.b = a.b;
        b.a = null == a.a ? 255 : a.a
    }, getDrawColor: function () {
        return cc.color(this._drawColor.r, this._drawColor.g, this._drawColor.b, this._drawColor.a)
    }, drawRect: function (a, b, c, d, e) {
        d = null == d ? this._lineWidth : d;
        e = e || this.getDrawColor();
        null == e.a && (e.a = 255);
        a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
        b = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        b.verts = a;
        b.lineWidth = d;
        b.lineColor = e;
        b.isClosePolygon = !0;
        b.isStroke = !0;
        b.lineCap = "butt";
        if (b.fillColor = c)null == c.a && (c.a = 255), b.isFill = !0;
        this._buffer.push(b)
    }, drawCircle: function (a, b, c, d, e, f, g) {
        f = f || this._lineWidth;
        g = g || this.getDrawColor();
        null == g.a && (g.a = 255);
        for (var h = 2 * Math.PI / d, k = [], m = 0; m <= d; m++) {
            var n = m * h, p = b * Math.cos(n + c) + a.x, n = b * Math.sin(n + c) + a.y;
            k.push(cc.p(p, n))
        }
        e && k.push(cc.p(a.x, a.y));
        a = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        a.verts = k;
        a.lineWidth = f;
        a.lineColor = g;
        a.isClosePolygon = !0;
        a.isStroke = !0;
        this._buffer.push(a)
    }, drawQuadBezier: function (a, b, c, d, e, f) {
        e = e || this._lineWidth;
        f = f || this.getDrawColor();
        null == f.a && (f.a = 255);
        for (var g = [], h = 0, k = 0; k < d; k++) {
            var m = Math.pow(1 - h, 2) * a.x + 2 * (1 - h) * h * b.x + h * h * c.x, n = Math.pow(1 - h, 2) * a.y + 2 * (1 - h) * h * b.y + h * h * c.y;
            g.push(cc.p(m, n));
            h += 1 / d
        }
        g.push(cc.p(c.x, c.y));
        a = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        a.verts = g;
        a.lineWidth = e;
        a.lineColor = f;
        a.isStroke = !0;
        a.lineCap = "round";
        this._buffer.push(a)
    }, drawCubicBezier: function (a, b, c, d, e, f, g) {
        f = f || this._lineWidth;
        g = g || this.getDrawColor();
        null == g.a && (g.a = 255);
        for (var h = [], k = 0, m = 0; m < e; m++) {
            var n = Math.pow(1 - k, 3) * a.x + 3 * Math.pow(1 - k, 2) * k * b.x + 3 * (1 - k) * k * k * c.x + k * k * k * d.x, p = Math.pow(1 - k, 3) * a.y + 3 * Math.pow(1 - k, 2) * k * b.y + 3 * (1 - k) * k * k * c.y + k * k * k * d.y;
            h.push(cc.p(n, p));
            k += 1 / e
        }
        h.push(cc.p(d.x, d.y));
        a = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        a.verts = h;
        a.lineWidth = f;
        a.lineColor = g;
        a.isStroke = !0;
        a.lineCap = "round";
        this._buffer.push(a)
    }, drawCatmullRom: function (a, b, c, d) {
        this.drawCardinalSpline(a, 0.5, b, c, d)
    }, drawCardinalSpline: function (a, b, c, d, e) {
        d = d || this._lineWidth;
        e = e || this.getDrawColor();
        null == e.a && (e.a = 255);
        for (var f = [], g, h, k = 1 / a.length, m = 0; m < c + 1; m++)h = m / c, 1 === h ? (g = a.length - 1, h = 1) : (g = 0 | h / k, h = (h - k * g) / k), g = cc.cardinalSplineAt(cc.getControlPointAt(a, g - 1), cc.getControlPointAt(a, g - 0), cc.getControlPointAt(a, g + 1), cc.getControlPointAt(a, g + 2), b, h), f.push(g);
        a = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        a.verts = f;
        a.lineWidth = d;
        a.lineColor = e;
        a.isStroke = !0;
        a.lineCap = "round";
        this._buffer.push(a)
    }, drawDot: function (a, b, c) {
        c = c || this.getDrawColor();
        null == c.a && (c.a = 255);
        var d = new cc._DrawNodeElement(cc.DrawNode.TYPE_DOT);
        d.verts = [a];
        d.lineWidth = b;
        d.fillColor = c;
        this._buffer.push(d)
    }, drawDots: function (a, b, c) {
        if (a && 0 != a.length) {
            c = c || this.getDrawColor();
            null == c.a && (c.a = 255);
            for (var d = 0, e = a.length; d < e; d++)this.drawDot(a[d], b, c)
        }
    }, drawSegment: function (a, b, c, d) {
        c = c || this._lineWidth;
        d = d || this.getDrawColor();
        null == d.a && (d.a = 255);
        var e = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        e.verts = [a, b];
        e.lineWidth = 2 * c;
        e.lineColor = d;
        e.isStroke = !0;
        e.lineCap = "round";
        this._buffer.push(e)
    }, drawPoly_: function (a, b, c, d) {
        c = null == c ? this._lineWidth : c;
        d = d || this.getDrawColor();
        null == d.a && (d.a = 255);
        var e = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        e.verts = a;
        e.fillColor = b;
        e.lineWidth = c;
        e.lineColor = d;
        e.isClosePolygon = !0;
        e.isStroke = !0;
        e.lineCap = "round";
        b && (e.isFill = !0);
        this._buffer.push(e)
    }, drawPoly: function (a, b, c, d) {
        for (var e = [], f = 0; f < a.length; f++)e.push(cc.p(a[f].x, a[f].y));
        return this.drawPoly_(e, b, c, d)
    }, clear: function () {
        this._buffer.length = 0
    }, _createRenderCmd: function () {
        return new cc.DrawNode.CanvasRenderCmd(this)
    }
});
cc.DrawNodeWebGL = cc.Node.extend({
    _bufferCapacity: 0,
    _buffer: null,
    _trianglesArrayBuffer: null,
    _trianglesWebBuffer: null,
    _trianglesReader: null,
    _lineWidth: 1,
    _drawColor: null,
    _blendFunc: null,
    _dirty: !1,
    _className: "DrawNodeWebGL",
    getBlendFunc: function () {
        return this._blendFunc
    },
    setBlendFunc: function (a, b) {
        void 0 === b ? (this._blendFunc.src = a.src, this._blendFunc.dst = a.dst) : (this._blendFunc.src = a, this._blendFunc.dst = b)
    },
    ctor: function () {
        cc.Node.prototype.ctor.call(this);
        this._buffer = [];
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        this._drawColor = cc.color(255, 255, 255, 255);
        this.init()
    },
    init: function () {
        return cc.Node.prototype.init.call(this) ? (this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_LENGTHTEXTURECOLOR), this._ensureCapacity(64), this._trianglesWebBuffer = cc._renderContext.createBuffer(), this._dirty = !0) : !1
    },
    setLineWidth: function (a) {
        this._lineWidth = a
    },
    getLineWidth: function () {
        return this._lineWidth
    },
    setDrawColor: function (a) {
        var b = this._drawColor;
        b.r = a.r;
        b.g = a.g;
        b.b = a.b;
        b.a = a.a
    },
    getDrawColor: function () {
        return cc.color(this._drawColor.r, this._drawColor.g, this._drawColor.b, this._drawColor.a)
    },
    drawRect: function (a, b, c, d, e) {
        d = null == d ? this._lineWidth : d;
        e = e || this.getDrawColor();
        null == e.a && (e.a = 255);
        a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
        null == c ? this._drawSegments(a, d, e, !0) : this.drawPoly(a, c, d, e)
    },
    drawCircle: function (a, b, c, d, e, f, g) {
        f = f || this._lineWidth;
        g = g || this.getDrawColor();
        null == g.a && (g.a = 255);
        var h = 2 * Math.PI / d, k = [], m;
        for (m = 0; m <= d; m++) {
            var n = m * h, p = b * Math.cos(n + c) + a.x, n = b * Math.sin(n + c) + a.y;
            k.push(cc.p(p, n))
        }
        e && k.push(cc.p(a.x, a.y));
        f *= 0.5;
        m = 0;
        for (a = k.length; m < a - 1; m++)this.drawSegment(k[m], k[m + 1], f, g)
    },
    drawQuadBezier: function (a, b, c, d, e, f) {
        e = e || this._lineWidth;
        f = f || this.getDrawColor();
        null == f.a && (f.a = 255);
        for (var g = [], h = 0, k = 0; k < d; k++) {
            var m = Math.pow(1 - h, 2) * a.x + 2 * (1 - h) * h * b.x + h * h * c.x, n = Math.pow(1 - h, 2) * a.y + 2 * (1 - h) * h * b.y + h * h * c.y;
            g.push(cc.p(m, n));
            h += 1 / d
        }
        g.push(cc.p(c.x, c.y));
        this._drawSegments(g, e, f, !1)
    },
    drawCubicBezier: function (a, b, c, d, e, f, g) {
        f = f || this._lineWidth;
        g = g || this.getDrawColor();
        null == g.a && (g.a = 255);
        for (var h = [], k = 0, m = 0; m < e; m++) {
            var n = Math.pow(1 - k, 3) * a.x + 3 * Math.pow(1 - k, 2) * k * b.x + 3 * (1 - k) * k * k * c.x + k * k * k * d.x, p = Math.pow(1 - k, 3) * a.y + 3 * Math.pow(1 - k, 2) * k * b.y + 3 * (1 - k) * k * k * c.y + k * k * k * d.y;
            h.push(cc.p(n, p));
            k += 1 / e
        }
        h.push(cc.p(d.x, d.y));
        this._drawSegments(h, f, g, !1)
    },
    drawCatmullRom: function (a, b, c, d) {
        this.drawCardinalSpline(a, 0.5, b, c, d)
    },
    drawCardinalSpline: function (a, b, c, d, e) {
        d = d || this._lineWidth;
        e = e || this.getDrawColor();
        null == e.a && (e.a = 255);
        for (var f = [], g, h, k = 1 / a.length, m = 0; m < c + 1; m++)h = m / c, 1 === h ? (g = a.length - 1, h = 1) : (g = 0 | h / k, h = (h - k * g) / k), g = cc.cardinalSplineAt(cc.getControlPointAt(a, g - 1), cc.getControlPointAt(a, g - 0), cc.getControlPointAt(a, g + 1), cc.getControlPointAt(a, g + 2), b, h), f.push(g);
        d *= 0.5;
        a = 0;
        for (b = f.length; a < b - 1; a++)this.drawSegment(f[a], f[a + 1], d, e)
    },
    _render: function () {
        var a = cc._renderContext;
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
        a.bindBuffer(a.ARRAY_BUFFER, this._trianglesWebBuffer);
        this._dirty && (a.bufferData(a.ARRAY_BUFFER, this._trianglesArrayBuffer, a.STREAM_DRAW), this._dirty = !1);
        var b = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, b, 0);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, b, 8);
        a.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, a.FLOAT, !1, b, 12);
        a.drawArrays(a.TRIANGLES, 0, 3 * this._buffer.length);
        cc.incrementGLDraws(1)
    },
    _ensureCapacity: function (a) {
        var b = this._buffer;
        if (b.length + a > this._bufferCapacity) {
            var c = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT;
            this._bufferCapacity += Math.max(this._bufferCapacity, a);
            if (null == b || 0 === b.length)this._buffer = [], this._trianglesArrayBuffer = new ArrayBuffer(c * this._bufferCapacity), this._trianglesReader = new Uint8Array(this._trianglesArrayBuffer); else {
                a = [];
                for (var d = new ArrayBuffer(c * this._bufferCapacity), e = 0; e < b.length; e++)a[e] = new cc.V2F_C4B_T2F_Triangle(b[e].a, b[e].b, b[e].c, d, e * c);
                this._trianglesReader = new Uint8Array(d);
                this._trianglesArrayBuffer = d;
                this._buffer = a
            }
        }
    },
    drawDot: function (a, b, c) {
        c = c || this.getDrawColor();
        null == c.a && (c.a = 255);
        var d = {r: 0 | c.r, g: 0 | c.g, b: 0 | c.b, a: 0 | c.a};
        c = {vertices: {x: a.x - b, y: a.y - b}, colors: d, texCoords: {u: -1, v: -1}};
        var e = {vertices: {x: a.x - b, y: a.y + b}, colors: d, texCoords: {u: -1, v: 1}}, f = {
            vertices: {
                x: a.x + b,
                y: a.y + b
            }, colors: d, texCoords: {u: 1, v: 1}
        };
        a = {vertices: {x: a.x + b, y: a.y - b}, colors: d, texCoords: {u: 1, v: -1}};
        this._ensureCapacity(6);
        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(c, e, f, this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(c, f, a, this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
        this._dirty = !0
    },
    drawDots: function (a, b, c) {
        if (a && 0 !== a.length) {
            c = c || this.getDrawColor();
            null == c.a && (c.a = 255);
            for (var d = 0, e = a.length; d < e; d++)this.drawDot(a[d], b, c)
        }
    },
    drawSegment: function (a, b, c, d) {
        d = d || this.getDrawColor();
        null == d.a && (d.a = 255);
        c = c || 0.5 * this._lineWidth;
        this._ensureCapacity(18);
        d = {r: 0 | d.r, g: 0 | d.g, b: 0 | d.b, a: 0 | d.a};
        var e = cc.__v2f(a), f = cc.__v2f(b);
        b = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(f, e)));
        a = cc.v2fperp(b);
        var g = cc.v2fmult(b, c), h = cc.v2fmult(a, c);
        c = cc.v2fsub(f, cc.v2fadd(g, h));
        var k = cc.v2fadd(f, cc.v2fsub(g, h)), m = cc.v2fsub(f, g), f = cc.v2fadd(f, g), n = cc.v2fsub(e, g), p = cc.v2fadd(e, g), s = cc.v2fsub(e, cc.v2fsub(g, h)), e = cc.v2fadd(e, cc.v2fadd(g, h)), g = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT, h = this._trianglesArrayBuffer, r = this._buffer;
        r.push(new cc.V2F_C4B_T2F_Triangle({
            vertices: c,
            colors: d,
            texCoords: cc.__t(cc.v2fneg(cc.v2fadd(b, a)))
        }, {vertices: k, colors: d, texCoords: cc.__t(cc.v2fsub(b, a))}, {
            vertices: m,
            colors: d,
            texCoords: cc.__t(cc.v2fneg(b))
        }, h, r.length * g));
        r.push(new cc.V2F_C4B_T2F_Triangle({vertices: f, colors: d, texCoords: cc.__t(b)}, {
            vertices: k,
            colors: d,
            texCoords: cc.__t(cc.v2fsub(b, a))
        }, {vertices: m, colors: d, texCoords: cc.__t(cc.v2fneg(b))}, h, r.length * g));
        r.push(new cc.V2F_C4B_T2F_Triangle({vertices: f, colors: d, texCoords: cc.__t(b)}, {
            vertices: n,
            colors: d,
            texCoords: cc.__t(cc.v2fneg(b))
        }, {vertices: m, colors: d, texCoords: cc.__t(cc.v2fneg(b))}, h, r.length * g));
        r.push(new cc.V2F_C4B_T2F_Triangle({vertices: f, colors: d, texCoords: cc.__t(b)}, {
            vertices: n,
            colors: d,
            texCoords: cc.__t(cc.v2fneg(b))
        }, {vertices: p, colors: d, texCoords: cc.__t(b)}, h, r.length * g));
        r.push(new cc.V2F_C4B_T2F_Triangle({vertices: s, colors: d, texCoords: cc.__t(cc.v2fsub(a, b))}, {
            vertices: n,
            colors: d,
            texCoords: cc.__t(cc.v2fneg(b))
        }, {vertices: p, colors: d, texCoords: cc.__t(b)}, h, r.length * g));
        r.push(new cc.V2F_C4B_T2F_Triangle({vertices: s, colors: d, texCoords: cc.__t(cc.v2fsub(a, b))}, {
            vertices: e,
            colors: d,
            texCoords: cc.__t(cc.v2fadd(b, a))
        }, {vertices: p, colors: d, texCoords: cc.__t(b)}, h, r.length * g));
        this._dirty = !0
    },
    drawPoly: function (a, b, c, d) {
        if (null == b)this._drawSegments(a, c, d, !0); else {
            null == b.a && (b.a = 255);
            null == d.a && (d.a = 255);
            c = null == c ? this._lineWidth : c;
            c *= 0.5;
            b = {r: 0 | b.r, g: 0 | b.g, b: 0 | b.b, a: 0 | b.a};
            d = {r: 0 | d.r, g: 0 | d.g, b: 0 | d.b, a: 0 | d.a};
            var e = [], f, g, h, k, m = a.length;
            for (f = 0; f < m; f++) {
                g = cc.__v2f(a[(f - 1 + m) % m]);
                h = cc.__v2f(a[f]);
                k = cc.__v2f(a[(f + 1) % m]);
                var n = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(h, g)));
                h = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(k, h)));
                n = cc.v2fmult(cc.v2fadd(n, h), 1 / (cc.v2fdot(n, h) + 1));
                e[f] = {offset: n, n: h}
            }
            n = 0 < c;
            this._ensureCapacity(3 * (3 * m - 2));
            var p = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT, s = this._trianglesArrayBuffer, r = this._buffer, u = !1 == n ? 0.5 : 0;
            for (f = 0; f < m - 2; f++)g = cc.v2fsub(cc.__v2f(a[0]), cc.v2fmult(e[0].offset, u)), h = cc.v2fsub(cc.__v2f(a[f + 1]), cc.v2fmult(e[f + 1].offset, u)), k = cc.v2fsub(cc.__v2f(a[f + 2]), cc.v2fmult(e[f + 2].offset, u)), r.push(new cc.V2F_C4B_T2F_Triangle({
                vertices: g,
                colors: b,
                texCoords: cc.__t(cc.v2fzero())
            }, {vertices: h, colors: b, texCoords: cc.__t(cc.v2fzero())}, {
                vertices: k,
                colors: b,
                texCoords: cc.__t(cc.v2fzero())
            }, s, r.length * p));
            for (f = 0; f < m; f++) {
                u = (f + 1) % m;
                g = cc.__v2f(a[f]);
                h = cc.__v2f(a[u]);
                k = e[f].n;
                var t = e[f].offset, v = e[u].offset, u = n ? cc.v2fsub(g, cc.v2fmult(t, c)) : cc.v2fsub(g, cc.v2fmult(t, 0.5)), w = n ? cc.v2fsub(h, cc.v2fmult(v, c)) : cc.v2fsub(h, cc.v2fmult(v, 0.5));
                g = n ? cc.v2fadd(g, cc.v2fmult(t, c)) : cc.v2fadd(g, cc.v2fmult(t, 0.5));
                h = n ? cc.v2fadd(h, cc.v2fmult(v, c)) : cc.v2fadd(h, cc.v2fmult(v, 0.5));
                n ? (r.push(new cc.V2F_C4B_T2F_Triangle({
                    vertices: u,
                    colors: d,
                    texCoords: cc.__t(cc.v2fneg(k))
                }, {vertices: w, colors: d, texCoords: cc.__t(cc.v2fneg(k))}, {
                    vertices: h,
                    colors: d,
                    texCoords: cc.__t(k)
                }, s, r.length * p)), r.push(new cc.V2F_C4B_T2F_Triangle({
                    vertices: u,
                    colors: d,
                    texCoords: cc.__t(cc.v2fneg(k))
                }, {vertices: g, colors: d, texCoords: cc.__t(k)}, {
                    vertices: h,
                    colors: d,
                    texCoords: cc.__t(k)
                }, s, r.length * p))) : (r.push(new cc.V2F_C4B_T2F_Triangle({
                    vertices: u,
                    colors: b,
                    texCoords: cc.__t(cc.v2fzero())
                }, {vertices: w, colors: b, texCoords: cc.__t(cc.v2fzero())}, {
                    vertices: h,
                    colors: b,
                    texCoords: cc.__t(k)
                }, s, r.length * p)), r.push(new cc.V2F_C4B_T2F_Triangle({
                    vertices: u,
                    colors: b,
                    texCoords: cc.__t(cc.v2fzero())
                }, {vertices: g, colors: b, texCoords: cc.__t(k)}, {
                    vertices: h,
                    colors: b,
                    texCoords: cc.__t(k)
                }, s, r.length * p)))
            }
            this._dirty = !0
        }
    },
    _drawSegments: function (a, b, c, d) {
        b = null == b ? this._lineWidth : b;
        c = c || this._drawColor;
        null == c.a && (c.a = 255);
        b *= 0.5;
        if (!(0 >= b)) {
            c = {r: 0 | c.r, g: 0 | c.g, b: 0 | c.b, a: 0 | c.a};
            var e = [], f, g, h, k, m = a.length;
            for (f = 0; f < m; f++) {
                g = cc.__v2f(a[(f - 1 + m) % m]);
                h = cc.__v2f(a[f]);
                k = cc.__v2f(a[(f + 1) % m]);
                var n = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(h, g)));
                h = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(k, h)));
                k = cc.v2fmult(cc.v2fadd(n, h), 1 / (cc.v2fdot(n, h) + 1));
                e[f] = {offset: k, n: h}
            }
            this._ensureCapacity(3 * (3 * m - 2));
            k = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT;
            var n = this._trianglesArrayBuffer, p = this._buffer;
            d = d ? m : m - 1;
            for (f = 0; f < d; f++) {
                var s = (f + 1) % m;
                g = cc.__v2f(a[f]);
                h = cc.__v2f(a[s]);
                var r = e[f].n, u = e[f].offset, t = e[s].offset, s = cc.v2fsub(g, cc.v2fmult(u, b)), v = cc.v2fsub(h, cc.v2fmult(t, b));
                g = cc.v2fadd(g, cc.v2fmult(u, b));
                h = cc.v2fadd(h, cc.v2fmult(t, b));
                p.push(new cc.V2F_C4B_T2F_Triangle({
                    vertices: s,
                    colors: c,
                    texCoords: cc.__t(cc.v2fneg(r))
                }, {vertices: v, colors: c, texCoords: cc.__t(cc.v2fneg(r))}, {
                    vertices: h,
                    colors: c,
                    texCoords: cc.__t(r)
                }, n, p.length * k));
                p.push(new cc.V2F_C4B_T2F_Triangle({
                    vertices: s,
                    colors: c,
                    texCoords: cc.__t(cc.v2fneg(r))
                }, {vertices: g, colors: c, texCoords: cc.__t(r)}, {
                    vertices: h,
                    colors: c,
                    texCoords: cc.__t(r)
                }, n, p.length * k))
            }
            this._dirty = !0
        }
    },
    clear: function () {
        this._buffer.length = 0;
        this._dirty = !0
    },
    _createRenderCmd: function () {
        return new cc.DrawNode.WebGLRenderCmd(this)
    }
});
cc.DrawNode = cc._renderType === cc._RENDER_TYPE_WEBGL ? cc.DrawNodeWebGL : cc.DrawNodeCanvas;
cc.DrawNode.create = function () {
    return new cc.DrawNode
};
cc._DrawNodeElement = function (a, b, c, d, e, f, g, h, k) {
    this.type = a;
    this.verts = b || null;
    this.fillColor = c || null;
    this.lineWidth = d || 0;
    this.lineColor = e || null;
    this.lineCap = f || "butt";
    this.isClosePolygon = g || !1;
    this.isFill = h || !1;
    this.isStroke = k || !1
};
cc.DrawNode.TYPE_DOT = 0;
cc.DrawNode.TYPE_SEGMENT = 1;
cc.DrawNode.TYPE_POLY = 2;
(function () {
    cc.DrawNode.CanvasRenderCmd = function (a) {
        cc.Node.CanvasRenderCmd.call(this, a);
        this._needDraw = !0;
        this._blendFunc = this._drawColor = this._buffer = null
    };
    cc.DrawNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    cc.DrawNode.CanvasRenderCmd.prototype.constructor = cc.DrawNode.CanvasRenderCmd;
    cc.DrawNode.CanvasRenderCmd.prototype.rendering = function (a, b, c) {
        a = a || cc._renderContext;
        a.getContext();
        var d = this._node._displayedOpacity / 255;
        if (0 !== d) {
            a.setTransform(this._worldTransform, b, c);
            a.setGlobalAlpha(d);
            this._blendFunc && this._blendFunc.src === cc.SRC_ALPHA && this._blendFunc.dst === cc.ONE && a.setCompositeOperation("lighter");
            for (var d = this._buffer, e = 0, f = d.length; e < f; e++) {
                var g = d[e];
                switch (g.type) {
                    case cc.DrawNode.TYPE_DOT:
                        this._drawDot(a, g, b, c);
                        break;
                    case cc.DrawNode.TYPE_SEGMENT:
                        this._drawSegment(a, g, b, c);
                        break;
                    case cc.DrawNode.TYPE_POLY:
                        this._drawPoly(a, g, b, c)
                }
            }
        }
    };
    cc.DrawNode.CanvasRenderCmd.prototype._drawDot = function (a, b, c, d) {
        var e = b.fillColor, f = b.verts[0];
        b = b.lineWidth;
        var g = a.getContext();
        a.setFillStyle("rgba(" + (0 | e.r) + "," + (0 | e.g) + "," + (0 | e.b) + "," + e.a / 255 + ")");
        g.beginPath();
        g.arc(f.x * c, -f.y * d, b * c, 0, 2 * Math.PI, !1);
        g.closePath();
        g.fill()
    };
    cc.DrawNode.CanvasRenderCmd.prototype._drawSegment = function (a, b, c, d) {
        var e = b.lineColor, f = b.verts[0], g = b.verts[1], h = b.lineWidth;
        b = b.lineCap;
        var k = a.getContext();
        a.setStrokeStyle("rgba(" + (0 | e.r) + "," + (0 | e.g) + "," + (0 | e.b) + "," + e.a / 255 + ")");
        k.lineWidth = h * c;
        k.beginPath();
        k.lineCap = b;
        k.moveTo(f.x * c, -f.y * d);
        k.lineTo(g.x * c, -g.y * d);
        k.stroke()
    };
    cc.DrawNode.CanvasRenderCmd.prototype._drawPoly = function (a, b, c, d) {
        var e = b.verts, f = b.lineCap;
        if (null != e) {
            var g = b.fillColor, h = b.lineWidth, k = b.lineColor, m = b.isClosePolygon, n = b.isFill;
            b = b.isStroke;
            var p = a.getContext(), s = e[0];
            p.lineCap = f;
            g && a.setFillStyle("rgba(" + (0 | g.r) + "," + (0 | g.g) + "," + (0 | g.b) + "," + g.a / 255 + ")");
            h && (p.lineWidth = h * c);
            k && a.setStrokeStyle("rgba(" + (0 | k.r) + "," + (0 | k.g) + "," + (0 | k.b) + "," + k.a / 255 + ")");
            p.beginPath();
            p.moveTo(s.x * c, -s.y * d);
            a = 1;
            for (f = e.length; a < f; a++)p.lineTo(e[a].x * c, -e[a].y * d);
            m && p.closePath();
            n && p.fill();
            b && p.stroke()
        }
    }
})();
(function () {
    cc.DrawNode.WebGLRenderCmd = function (a) {
        cc.Node.WebGLRenderCmd.call(this, a);
        this._needDraw = !0
    };
    cc.DrawNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    cc.DrawNode.WebGLRenderCmd.prototype.constructor = cc.DrawNode.WebGLRenderCmd;
    cc.DrawNode.WebGLRenderCmd.prototype.rendering = function (a) {
        a = this._node;
        cc.glBlendFunc(a._blendFunc.src, a._blendFunc.dst);
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
        a._render()
    }
})();
cc.ACTION_TAG_INVALID = -1;
cc.Action = cc.Class.extend({
    originalTarget: null, target: null, tag: cc.ACTION_TAG_INVALID, ctor: function () {
        this.target = this.originalTarget = null;
        this.tag = cc.ACTION_TAG_INVALID
    }, copy: function () {
        cc.log("copy is deprecated. Please use clone instead.");
        return this.clone()
    }, clone: function () {
        var a = new cc.Action;
        a.originalTarget = null;
        a.target = null;
        a.tag = this.tag;
        return a
    }, isDone: function () {
        return !0
    }, startWithTarget: function (a) {
        this.target = this.originalTarget = a
    }, stop: function () {
        this.target = null
    }, step: function (a) {
        cc.log("[Action step]. override me")
    }, update: function (a) {
        cc.log("[Action update]. override me")
    }, getTarget: function () {
        return this.target
    }, setTarget: function (a) {
        this.target = a
    }, getOriginalTarget: function () {
        return this.originalTarget
    }, setOriginalTarget: function (a) {
        this.originalTarget = a
    }, getTag: function () {
        return this.tag
    }, setTag: function (a) {
        this.tag = a
    }, retain: function () {
    }, release: function () {
    }
});
cc.action = function () {
    return new cc.Action
};
cc.Action.create = cc.action;
cc.FiniteTimeAction = cc.Action.extend({
    _duration: 0, ctor: function () {
        cc.Action.prototype.ctor.call(this);
        this._duration = 0
    }, getDuration: function () {
        return this._duration * (this._timesForRepeat || 1)
    }, setDuration: function (a) {
        this._duration = a
    }, reverse: function () {
        cc.log("cocos2d: FiniteTimeAction#reverse: Implement me");
        return null
    }, clone: function () {
        return new cc.FiniteTimeAction
    }
});
cc.Speed = cc.Action.extend({
    _speed: 0, _innerAction: null, ctor: function (a, b) {
        cc.Action.prototype.ctor.call(this);
        this._speed = 0;
        this._innerAction = null;
        a && this.initWithAction(a, b)
    }, getSpeed: function () {
        return this._speed
    }, setSpeed: function (a) {
        this._speed = a
    }, initWithAction: function (a, b) {
        if (!a)throw"cc.Speed.initWithAction(): action must be non nil";
        this._innerAction = a;
        this._speed = b;
        return !0
    }, clone: function () {
        var a = new cc.Speed;
        a.initWithAction(this._innerAction.clone(), this._speed);
        return a
    }, startWithTarget: function (a) {
        cc.Action.prototype.startWithTarget.call(this, a);
        this._innerAction.startWithTarget(a)
    }, stop: function () {
        this._innerAction.stop();
        cc.Action.prototype.stop.call(this)
    }, step: function (a) {
        this._innerAction.step(a * this._speed)
    }, isDone: function () {
        return this._innerAction.isDone()
    }, reverse: function () {
        return new cc.Speed(this._innerAction.reverse(), this._speed)
    }, setInnerAction: function (a) {
        this._innerAction !== a && (this._innerAction = a)
    }, getInnerAction: function () {
        return this._innerAction
    }
});
cc.speed = function (a, b) {
    return new cc.Speed(a, b)
};
cc.Speed.create = cc.speed;
cc.Follow = cc.Action.extend({
    _followedNode: null,
    _boundarySet: !1,
    _boundaryFullyCovered: !1,
    _halfScreenSize: null,
    _fullScreenSize: null,
    _worldRect: null,
    leftBoundary: 0,
    rightBoundary: 0,
    topBoundary: 0,
    bottomBoundary: 0,
    ctor: function (a, b) {
        cc.Action.prototype.ctor.call(this);
        this._followedNode = null;
        this._boundaryFullyCovered = this._boundarySet = !1;
        this._fullScreenSize = this._halfScreenSize = null;
        this.bottomBoundary = this.topBoundary = this.rightBoundary = this.leftBoundary = 0;
        this._worldRect = cc.rect(0, 0, 0, 0);
        a && (b ? this.initWithTarget(a, b) : this.initWithTarget(a))
    },
    clone: function () {
        var a = new cc.Follow, b = this._worldRect, b = new cc.Rect(b.x, b.y, b.width, b.height);
        a.initWithTarget(this._followedNode, b);
        return a
    },
    isBoundarySet: function () {
        return this._boundarySet
    },
    setBoudarySet: function (a) {
        this._boundarySet = a
    },
    initWithTarget: function (a, b) {
        if (!a)throw"cc.Follow.initWithAction(): followedNode must be non nil";
        b = b || cc.rect(0, 0, 0, 0);
        this._followedNode = a;
        this._worldRect = b;
        this._boundarySet = !cc._rectEqualToZero(b);
        this._boundaryFullyCovered = !1;
        var c = cc.director.getWinSize();
        this._fullScreenSize = cc.p(c.width, c.height);
        this._halfScreenSize = cc.pMult(this._fullScreenSize, 0.5);
        this._boundarySet && (this.leftBoundary = -(b.x + b.width - this._fullScreenSize.x), this.rightBoundary = -b.x, this.topBoundary = -b.y, this.bottomBoundary = -(b.y + b.height - this._fullScreenSize.y), this.rightBoundary < this.leftBoundary && (this.rightBoundary = this.leftBoundary = (this.leftBoundary + this.rightBoundary) / 2), this.topBoundary < this.bottomBoundary && (this.topBoundary = this.bottomBoundary = (this.topBoundary + this.bottomBoundary) / 2), this.topBoundary === this.bottomBoundary && this.leftBoundary === this.rightBoundary && (this._boundaryFullyCovered = !0));
        return !0
    },
    step: function (a) {
        a = this._followedNode.x;
        var b = this._followedNode.y;
        a = this._halfScreenSize.x - a;
        b = this._halfScreenSize.y - b;
        this.target._renderCmd._dirtyFlag = 0;
        this._boundarySet ? this._boundaryFullyCovered || this.target.setPosition(cc.clampf(a, this.leftBoundary, this.rightBoundary), cc.clampf(b, this.bottomBoundary, this.topBoundary)) : this.target.setPosition(a, b)
    },
    isDone: function () {
        return !this._followedNode.running
    },
    stop: function () {
        this.target = null;
        cc.Action.prototype.stop.call(this)
    }
});
cc.follow = function (a, b) {
    return new cc.Follow(a, b)
};
cc.Follow.create = cc.follow;
cc.ActionInterval = cc.FiniteTimeAction.extend({
    _elapsed: 0,
    _firstTick: !1,
    _easeList: null,
    _timesForRepeat: 1,
    _repeatForever: !1,
    _repeatMethod: !1,
    _speed: 1,
    _speedMethod: !1,
    ctor: function (a) {
        this._timesForRepeat = this._speed = 1;
        this._repeatForever = !1;
        this.MAX_VALUE = 2;
        this._speedMethod = this._repeatMethod = !1;
        cc.FiniteTimeAction.prototype.ctor.call(this);
        void 0 !== a && this.initWithDuration(a)
    },
    getElapsed: function () {
        return this._elapsed
    },
    initWithDuration: function (a) {
        this._duration = 0 === a ? cc.FLT_EPSILON : a;
        this._elapsed = 0;
        return this._firstTick = !0
    },
    isDone: function () {
        return this._elapsed >= this._duration
    },
    _cloneDecoration: function (a) {
        a._repeatForever = this._repeatForever;
        a._speed = this._speed;
        a._timesForRepeat = this._timesForRepeat;
        a._easeList = this._easeList;
        a._speedMethod = this._speedMethod;
        a._repeatMethod = this._repeatMethod
    },
    _reverseEaseList: function (a) {
        if (this._easeList) {
            a._easeList = [];
            for (var b = 0; b < this._easeList.length; b++)a._easeList.push(this._easeList[b].reverse())
        }
    },
    clone: function () {
        var a = new cc.ActionInterval(this._duration);
        this._cloneDecoration(a);
        return a
    },
    easing: function (a) {
        this._easeList ? this._easeList.length = 0 : this._easeList = [];
        for (var b = 0; b < arguments.length; b++)this._easeList.push(arguments[b]);
        return this
    },
    _computeEaseTime: function (a) {
        var b = this._easeList;
        if (!b || 0 === b.length)return a;
        for (var c = 0, d = b.length; c < d; c++)a = b[c].easing(a);
        return a
    },
    step: function (a) {
        this._firstTick ? (this._firstTick = !1, this._elapsed = 0) : this._elapsed += a;
        a = this._elapsed / (1.192092896E-7 < this._duration ? this._duration : 1.192092896E-7);
        a = 1 > a ? a : 1;
        this.update(0 < a ? a : 0);
        this._repeatMethod && 1 < this._timesForRepeat && this.isDone() && (this._repeatForever || this._timesForRepeat--, this.startWithTarget(this.target), this.step(this._elapsed - this._duration))
    },
    startWithTarget: function (a) {
        cc.Action.prototype.startWithTarget.call(this, a);
        this._elapsed = 0;
        this._firstTick = !0
    },
    reverse: function () {
        cc.log("cc.IntervalAction: reverse not implemented.");
        return null
    },
    setAmplitudeRate: function (a) {
        cc.log("cc.ActionInterval.setAmplitudeRate(): it should be overridden in subclass.")
    },
    getAmplitudeRate: function () {
        cc.log("cc.ActionInterval.getAmplitudeRate(): it should be overridden in subclass.");
        return 0
    },
    speed: function (a) {
        if (0 >= a)return cc.log("The speed parameter error"), this;
        this._speedMethod = !0;
        this._speed *= a;
        return this
    },
    getSpeed: function () {
        return this._speed
    },
    setSpeed: function (a) {
        this._speed = a;
        return this
    },
    repeat: function (a) {
        a = Math.round(a);
        if (isNaN(a) || 1 > a)return cc.log("The repeat parameter error"), this;
        this._repeatMethod = !0;
        this._timesForRepeat *= a;
        return this
    },
    repeatForever: function () {
        this._repeatMethod = !0;
        this._timesForRepeat = this.MAX_VALUE;
        this._repeatForever = !0;
        return this
    }
});
cc.actionInterval = function (a) {
    return new cc.ActionInterval(a)
};
cc.ActionInterval.create = cc.actionInterval;
cc.Sequence = cc.ActionInterval.extend({
    _actions: null, _split: null, _last: 0, ctor: function (a) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._actions = [];
        var b = a instanceof Array ? a : arguments, c = b.length - 1;
        0 <= c && null == b[c] && cc.log("parameters should not be ending with null in Javascript");
        if (0 <= c) {
            for (var d = b[0], e = 1; e < c; e++)b[e] && (d = cc.Sequence._actionOneTwo(d, b[e]));
            this.initWithTwoActions(d, b[c])
        }
    }, initWithTwoActions: function (a, b) {
        if (!a || !b)throw"cc.Sequence.initWithTwoActions(): arguments must all be non nil";
        this.initWithDuration(a._duration + b._duration);
        this._actions[0] = a;
        this._actions[1] = b;
        return !0
    }, clone: function () {
        var a = new cc.Sequence;
        this._cloneDecoration(a);
        a.initWithTwoActions(this._actions[0].clone(), this._actions[1].clone());
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._split = this._actions[0]._duration / this._duration;
        this._last = -1
    }, stop: function () {
        -1 !== this._last && this._actions[this._last].stop();
        cc.Action.prototype.stop.call(this)
    }, update: function (a) {
        var b = 0, c = this._split, d = this._actions, e = this._last;
        a = this._computeEaseTime(a);
        a < c ? (a = 0 !== c ? a / c : 1, 0 === b && 1 === e && (d[1].update(0), d[1].stop())) : (b = 1, a = 1 === c ? 1 : (a - c) / (1 - c), -1 === e && (d[0].startWithTarget(this.target), d[0].update(1), d[0].stop()), e || (d[0].update(1), d[0].stop()));
        d = d[b];
        e === b && d.isDone() || (e !== b && d.startWithTarget(this.target), a *= d._timesForRepeat, d.update(1 < a ? a % 1 : a), this._last = b)
    }, reverse: function () {
        var a = cc.Sequence._actionOneTwo(this._actions[1].reverse(), this._actions[0].reverse());
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }
});
cc.sequence = function (a) {
    var b = a instanceof Array ? a : arguments;
    0 < b.length && null == b[b.length - 1] && cc.log("parameters should not be ending with null in Javascript");
    for (var c, d, e, f; b && 0 < b.length;)
        for (d = Array.prototype.shift.call(b), f = d._timesForRepeat || 1, d._repeatMethod = !1, d._timesForRepeat = 1, e = 0, c || (c = d, e = 1), e; e < f; e++)c = cc.Sequence._actionOneTwo(c, d);
    return c
};
cc.Sequence.create = cc.sequence;
cc.Sequence._actionOneTwo = function (a, b) {
    var c = new cc.Sequence;
    c.initWithTwoActions(a, b);
    return c
};
cc.Repeat = cc.ActionInterval.extend({
    _times: 0,
    _total: 0,
    _nextDt: 0,
    _actionInstant: !1,
    _innerAction: null,
    ctor: function (a, b) {
        cc.ActionInterval.prototype.ctor.call(this);
        void 0 !== b && this.initWithAction(a, b)
    },
    initWithAction: function (a, b) {
        return this.initWithDuration(a._duration * b) ? (this._times = b, this._innerAction = a, a instanceof cc.ActionInstant && (this._actionInstant = !0, this._times -= 1), this._total = 0, !0) : !1
    },
    clone: function () {
        var a = new cc.Repeat;
        this._cloneDecoration(a);
        a.initWithAction(this._innerAction.clone(), this._times);
        return a
    },
    startWithTarget: function (a) {
        this._total = 0;
        this._nextDt = this._innerAction._duration / this._duration;
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._innerAction.startWithTarget(a)
    },
    stop: function () {
        this._innerAction.stop();
        cc.Action.prototype.stop.call(this)
    },
    update: function (a) {
        a = this._computeEaseTime(a);
        var b = this._innerAction, c = this._duration, d = this._times, e = this._nextDt;
        if (a >= e) {
            for (; a > e && this._total < d;)b.update(1), this._total++, b.stop(), b.startWithTarget(this.target), this._nextDt = e += b._duration / c;
            1 <= a && this._total < d && this._total++;
            this._actionInstant || (this._total === d ? (b.update(1), b.stop()) : b.update(a - (e - b._duration / c)))
        } else b.update(a * d % 1)
    },
    isDone: function () {
        return this._total === this._times
    },
    reverse: function () {
        var a = new cc.Repeat(this._innerAction.reverse(), this._times);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    },
    setInnerAction: function (a) {
        this._innerAction !== a && (this._innerAction = a)
    },
    getInnerAction: function () {
        return this._innerAction
    }
});
cc.repeat = function (a, b) {
    return new cc.Repeat(a, b)
};
cc.Repeat.create = cc.repeat;
cc.RepeatForever = cc.ActionInterval.extend({
    _innerAction: null, ctor: function (a) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._innerAction = null;
        a && this.initWithAction(a)
    }, initWithAction: function (a) {
        if (!a)throw"cc.RepeatForever.initWithAction(): action must be non null";
        this._innerAction = a;
        return !0
    }, clone: function () {
        var a = new cc.RepeatForever;
        this._cloneDecoration(a);
        a.initWithAction(this._innerAction.clone());
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._innerAction.startWithTarget(a)
    }, step: function (a) {
        var b = this._innerAction;
        b.step(a);
        b.isDone() && (b.startWithTarget(this.target), b.step(b.getElapsed() - b._duration))
    }, isDone: function () {
        return !1
    }, reverse: function () {
        var a = new cc.RepeatForever(this._innerAction.reverse());
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }, setInnerAction: function (a) {
        this._innerAction !== a && (this._innerAction = a)
    }, getInnerAction: function () {
        return this._innerAction
    }
});
cc.repeatForever = function (a) {
    return new cc.RepeatForever(a)
};
cc.RepeatForever.create = cc.repeatForever;
cc.Spawn = cc.ActionInterval.extend({
    _one: null, _two: null, ctor: function (a) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._two = this._one = null;
        var b = a instanceof Array ? a : arguments, c = b.length - 1;
        0 <= c && null == b[c] && cc.log("parameters should not be ending with null in Javascript");
        if (0 <= c) {
            for (var d = b[0], e = 1; e < c; e++)b[e] && (d = cc.Spawn._actionOneTwo(d, b[e]));
            this.initWithTwoActions(d, b[c])
        }
    }, initWithTwoActions: function (a, b) {
        if (!a || !b)throw"cc.Spawn.initWithTwoActions(): arguments must all be non null";
        var c = !1, d = a._duration, e = b._duration;
        this.initWithDuration(Math.max(d, e)) && (this._one = a, this._two = b, d > e ? this._two = cc.Sequence._actionOneTwo(b, cc.delayTime(d - e)) : d < e && (this._one = cc.Sequence._actionOneTwo(a, cc.delayTime(e - d))), c = !0);
        return c
    }, clone: function () {
        var a = new cc.Spawn;
        this._cloneDecoration(a);
        a.initWithTwoActions(this._one.clone(), this._two.clone());
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._one.startWithTarget(a);
        this._two.startWithTarget(a)
    }, stop: function () {
        this._one.stop();
        this._two.stop();
        cc.Action.prototype.stop.call(this)
    }, update: function (a) {
        a = this._computeEaseTime(a);
        this._one && this._one.update(a);
        this._two && this._two.update(a)
    }, reverse: function () {
        var a = cc.Spawn._actionOneTwo(this._one.reverse(), this._two.reverse());
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }
});
cc.spawn = function (a) {
    var b = a instanceof Array ? a : arguments;
    0 < b.length && null == b[b.length - 1] && cc.log("parameters should not be ending with null in Javascript");
    for (var c = b[0], d = 1; d < b.length; d++)null != b[d] && (c = cc.Spawn._actionOneTwo(c, b[d]));
    return c
};
cc.Spawn.create = cc.spawn;
cc.Spawn._actionOneTwo = function (a, b) {
    var c = new cc.Spawn;
    c.initWithTwoActions(a, b);
    return c
};
cc.RotateTo = cc.ActionInterval.extend({
    _dstAngleX: 0,
    _startAngleX: 0,
    _diffAngleX: 0,
    _dstAngleY: 0,
    _startAngleY: 0,
    _diffAngleY: 0,
    ctor: function (a, b, c) {
        cc.ActionInterval.prototype.ctor.call(this);
        void 0 !== b && this.initWithDuration(a, b, c)
    },
    initWithDuration: function (a, b, c) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._dstAngleX = b || 0, this._dstAngleY = c || this._dstAngleX, !0) : !1
    },
    clone: function () {
        var a = new cc.RotateTo;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._dstAngleX, this._dstAngleY);
        return a
    },
    startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        var b = a.rotationX % 360, c = this._dstAngleX - b;
        180 < c && (c -= 360);
        -180 > c && (c += 360);
        this._startAngleX = b;
        this._diffAngleX = c;
        this._startAngleY = a.rotationY % 360;
        a = this._dstAngleY - this._startAngleY;
        180 < a && (a -= 360);
        -180 > a && (a += 360);
        this._diffAngleY = a
    },
    reverse: function () {
        cc.log("cc.RotateTo.reverse(): it should be overridden in subclass.")
    },
    update: function (a) {
        a = this._computeEaseTime(a);
        this.target && (this.target.rotationX = this._startAngleX + this._diffAngleX * a, this.target.rotationY = this._startAngleY + this._diffAngleY * a)
    }
});
cc.rotateTo = function (a, b, c) {
    return new cc.RotateTo(a, b, c)
};
cc.RotateTo.create = cc.rotateTo;
cc.RotateBy = cc.ActionInterval.extend({
    _angleX: 0,
    _startAngleX: 0,
    _angleY: 0,
    _startAngleY: 0,
    ctor: function (a, b, c) {
        cc.ActionInterval.prototype.ctor.call(this);
        void 0 !== b && this.initWithDuration(a, b, c)
    },
    initWithDuration: function (a, b, c) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._angleX = b || 0, this._angleY = c || this._angleX, !0) : !1
    },
    clone: function () {
        var a = new cc.RotateBy;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._angleX, this._angleY);
        return a
    },
    startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._startAngleX = a.rotationX;
        this._startAngleY = a.rotationY
    },
    update: function (a) {
        a = this._computeEaseTime(a);
        this.target && (this.target.rotationX = this._startAngleX + this._angleX * a, this.target.rotationY = this._startAngleY + this._angleY * a)
    },
    reverse: function () {
        var a = new cc.RotateBy(this._duration, -this._angleX, -this._angleY);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }
});
cc.rotateBy = function (a, b, c) {
    return new cc.RotateBy(a, b, c)
};
cc.RotateBy.create = cc.rotateBy;
cc.MoveBy = cc.ActionInterval.extend({
    _positionDelta: null,
    _startPosition: null,
    _previousPosition: null,
    ctor: function (a, b, c) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._positionDelta = cc.p(0, 0);
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);
        void 0 !== b && this.initWithDuration(a, b, c)
    },
    initWithDuration: function (a, b, c) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (void 0 !== b.x && (c = b.y, b = b.x), this._positionDelta.x = b, this._positionDelta.y = c, !0) : !1
    },
    clone: function () {
        var a = new cc.MoveBy;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._positionDelta);
        return a
    },
    startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        var b = a.getPositionX();
        a = a.getPositionY();
        this._previousPosition.x = b;
        this._previousPosition.y = a;
        this._startPosition.x = b;
        this._startPosition.y = a
    },
    update: function (a) {
        a = this._computeEaseTime(a);
        if (this.target) {
            var b = this._positionDelta.x * a;
            a *= this._positionDelta.y;
            var c = this._startPosition;
            if (cc.ENABLE_STACKABLE_ACTIONS) {
                var d = this.target.getPositionX(), e = this.target.getPositionY(), f = this._previousPosition;
                c.x = c.x + d - f.x;
                c.y = c.y + e - f.y;
                b += c.x;
                a += c.y;
                f.x = b;
                f.y = a;
                this.target.setPosition(b, a)
            } else this.target.setPosition(c.x + b, c.y + a)
        }
    },
    reverse: function () {
        var a = new cc.MoveBy(this._duration, cc.p(-this._positionDelta.x, -this._positionDelta.y));
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }
});
cc.moveBy = function (a, b, c) {
    return new cc.MoveBy(a, b, c)
};
cc.MoveBy.create = cc.moveBy;
cc.MoveTo = cc.MoveBy.extend({
    _endPosition: null, ctor: function (a, b, c) {
        cc.MoveBy.prototype.ctor.call(this);
        this._endPosition = cc.p(0, 0);
        void 0 !== b && this.initWithDuration(a, b, c)
    }, initWithDuration: function (a, b, c) {
        return cc.MoveBy.prototype.initWithDuration.call(this, a, b, c) ? (void 0 !== b.x && (c = b.y, b = b.x), this._endPosition.x = b, this._endPosition.y = c, !0) : !1
    }, clone: function () {
        var a = new cc.MoveTo;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._endPosition);
        return a
    }, startWithTarget: function (a) {
        cc.MoveBy.prototype.startWithTarget.call(this, a);
        this._positionDelta.x = this._endPosition.x - a.getPositionX();
        this._positionDelta.y = this._endPosition.y - a.getPositionY()
    }
});
cc.moveTo = function (a, b, c) {
    return new cc.MoveTo(a, b, c)
};
cc.MoveTo.create = cc.moveTo;
cc.SkewTo = cc.ActionInterval.extend({
    _skewX: 0,
    _skewY: 0,
    _startSkewX: 0,
    _startSkewY: 0,
    _endSkewX: 0,
    _endSkewY: 0,
    _deltaX: 0,
    _deltaY: 0,
    ctor: function (a, b, c) {
        cc.ActionInterval.prototype.ctor.call(this);
        void 0 !== c && this.initWithDuration(a, b, c)
    },
    initWithDuration: function (a, b, c) {
        var d = !1;
        cc.ActionInterval.prototype.initWithDuration.call(this, a) && (this._endSkewX = b, this._endSkewY = c, d = !0);
        return d
    },
    clone: function () {
        var a = new cc.SkewTo;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._endSkewX, this._endSkewY);
        return a
    },
    startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._startSkewX = a.skewX % 180;
        this._deltaX = this._endSkewX - this._startSkewX;
        180 < this._deltaX && (this._deltaX -= 360);
        -180 > this._deltaX && (this._deltaX += 360);
        this._startSkewY = a.skewY % 360;
        this._deltaY = this._endSkewY - this._startSkewY;
        180 < this._deltaY && (this._deltaY -= 360);
        -180 > this._deltaY && (this._deltaY += 360)
    },
    update: function (a) {
        a = this._computeEaseTime(a);
        this.target.skewX = this._startSkewX + this._deltaX * a;
        this.target.skewY = this._startSkewY + this._deltaY * a
    }
});
cc.skewTo = function (a, b, c) {
    return new cc.SkewTo(a, b, c)
};
cc.SkewTo.create = cc.skewTo;
cc.SkewBy = cc.SkewTo.extend({
    ctor: function (a, b, c) {
        cc.SkewTo.prototype.ctor.call(this);
        void 0 !== c && this.initWithDuration(a, b, c)
    }, initWithDuration: function (a, b, c) {
        var d = !1;
        cc.SkewTo.prototype.initWithDuration.call(this, a, b, c) && (this._skewX = b, this._skewY = c, d = !0);
        return d
    }, clone: function () {
        var a = new cc.SkewBy;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._skewX, this._skewY);
        return a
    }, startWithTarget: function (a) {
        cc.SkewTo.prototype.startWithTarget.call(this, a);
        this._deltaX = this._skewX;
        this._deltaY = this._skewY;
        this._endSkewX = this._startSkewX + this._deltaX;
        this._endSkewY = this._startSkewY + this._deltaY
    }, reverse: function () {
        var a = new cc.SkewBy(this._duration, -this._skewX, -this._skewY);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }
});
cc.skewBy = function (a, b, c) {
    return new cc.SkewBy(a, b, c)
};
cc.SkewBy.create = cc.skewBy;
cc.JumpBy = cc.ActionInterval.extend({
    _startPosition: null,
    _delta: null,
    _height: 0,
    _jumps: 0,
    _previousPosition: null,
    ctor: function (a, b, c, d, e) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);
        this._delta = cc.p(0, 0);
        void 0 !== d && this.initWithDuration(a, b, c, d, e)
    },
    initWithDuration: function (a, b, c, d, e) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (void 0 === e && (e = d, d = c, c = b.y, b = b.x), this._delta.x = b, this._delta.y = c, this._height = d, this._jumps = e, !0) : !1
    },
    clone: function () {
        var a = new cc.JumpBy;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._delta, this._height, this._jumps);
        return a
    },
    startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        var b = a.getPositionX();
        a = a.getPositionY();
        this._previousPosition.x = b;
        this._previousPosition.y = a;
        this._startPosition.x = b;
        this._startPosition.y = a
    },
    update: function (a) {
        a = this._computeEaseTime(a);
        if (this.target) {
            var b = a * this._jumps % 1, b = 4 * this._height * b * (1 - b), b = b + this._delta.y * a;
            a *= this._delta.x;
            var c = this._startPosition;
            if (cc.ENABLE_STACKABLE_ACTIONS) {
                var d = this.target.getPositionX(), e = this.target.getPositionY(), f = this._previousPosition;
                c.x = c.x + d - f.x;
                c.y = c.y + e - f.y;
                a += c.x;
                b += c.y;
                f.x = a;
                f.y = b;
                this.target.setPosition(a, b)
            } else this.target.setPosition(c.x + a, c.y + b)
        }
    },
    reverse: function () {
        var a = new cc.JumpBy(this._duration, cc.p(-this._delta.x, -this._delta.y), this._height, this._jumps);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }
});
cc.jumpBy = function (a, b, c, d, e) {
    return new cc.JumpBy(a, b, c, d, e)
};
cc.JumpBy.create = cc.jumpBy;
cc.JumpTo = cc.JumpBy.extend({
    _endPosition: null, ctor: function (a, b, c, d, e) {
        cc.JumpBy.prototype.ctor.call(this);
        this._endPosition = cc.p(0, 0);
        void 0 !== d && this.initWithDuration(a, b, c, d, e)
    }, initWithDuration: function (a, b, c, d, e) {
        return cc.JumpBy.prototype.initWithDuration.call(this, a, b, c, d, e) ? (void 0 === e && (c = b.y, b = b.x), this._endPosition.x = b, this._endPosition.y = c, !0) : !1
    }, startWithTarget: function (a) {
        cc.JumpBy.prototype.startWithTarget.call(this, a);
        this._delta.x = this._endPosition.x - this._startPosition.x;
        this._delta.y = this._endPosition.y - this._startPosition.y
    }, clone: function () {
        var a = new cc.JumpTo;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._endPosition, this._height, this._jumps);
        return a
    }
});
cc.jumpTo = function (a, b, c, d, e) {
    return new cc.JumpTo(a, b, c, d, e)
};
cc.JumpTo.create = cc.jumpTo;
cc.bezierAt = function (a, b, c, d, e) {
    return Math.pow(1 - e, 3) * a + 3 * e * Math.pow(1 - e, 2) * b + 3 * Math.pow(e, 2) * (1 - e) * c + Math.pow(e, 3) * d
};
cc.BezierBy = cc.ActionInterval.extend({
    _config: null, _startPosition: null, _previousPosition: null, ctor: function (a, b) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._config = [];
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);
        b && this.initWithDuration(a, b)
    }, initWithDuration: function (a, b) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._config = b, !0) : !1
    }, clone: function () {
        var a = new cc.BezierBy;
        this._cloneDecoration(a);
        for (var b = [], c = 0; c < this._config.length; c++) {
            var d = this._config[c];
            b.push(cc.p(d.x, d.y))
        }
        a.initWithDuration(this._duration, b);
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        var b = a.getPositionX();
        a = a.getPositionY();
        this._previousPosition.x = b;
        this._previousPosition.y = a;
        this._startPosition.x = b;
        this._startPosition.y = a
    }, update: function (a) {
        a = this._computeEaseTime(a);
        if (this.target) {
            var b = this._config, c = b[0].y, d = b[1].y, e = b[2].y, b = cc.bezierAt(0, b[0].x, b[1].x, b[2].x, a);
            a = cc.bezierAt(0, c, d, e, a);
            c = this._startPosition;
            if (cc.ENABLE_STACKABLE_ACTIONS) {
                var d = this.target.getPositionX(), e = this.target.getPositionY(), f = this._previousPosition;
                c.x = c.x + d - f.x;
                c.y = c.y + e - f.y;
                b += c.x;
                a += c.y;
                f.x = b;
                f.y = a;
                this.target.setPosition(b, a)
            } else this.target.setPosition(c.x + b, c.y + a)
        }
    }, reverse: function () {
        var a = this._config, a = [cc.pAdd(a[1], cc.pNeg(a[2])), cc.pAdd(a[0], cc.pNeg(a[2])), cc.pNeg(a[2])], a = new cc.BezierBy(this._duration, a);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }
});
cc.bezierBy = function (a, b) {
    return new cc.BezierBy(a, b)
};
cc.BezierBy.create = cc.bezierBy;
cc.BezierTo = cc.BezierBy.extend({
    _toConfig: null, ctor: function (a, b) {
        cc.BezierBy.prototype.ctor.call(this);
        this._toConfig = [];
        b && this.initWithDuration(a, b)
    }, initWithDuration: function (a, b) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._toConfig = b, !0) : !1
    }, clone: function () {
        var a = new cc.BezierTo;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._toConfig);
        return a
    }, startWithTarget: function (a) {
        cc.BezierBy.prototype.startWithTarget.call(this, a);
        a = this._startPosition;
        var b = this._toConfig, c = this._config;
        c[0] = cc.pSub(b[0], a);
        c[1] = cc.pSub(b[1], a);
        c[2] = cc.pSub(b[2], a)
    }
});
cc.bezierTo = function (a, b) {
    return new cc.BezierTo(a, b)
};
cc.BezierTo.create = cc.bezierTo;
cc.ScaleTo = cc.ActionInterval.extend({
    _scaleX: 1,
    _scaleY: 1,
    _startScaleX: 1,
    _startScaleY: 1,
    _endScaleX: 0,
    _endScaleY: 0,
    _deltaX: 0,
    _deltaY: 0,
    ctor: function (a, b, c) {
        cc.ActionInterval.prototype.ctor.call(this);
        void 0 !== b && this.initWithDuration(a, b, c)
    },
    initWithDuration: function (a, b, c) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._endScaleX = b, this._endScaleY = null != c ? c : b, !0) : !1
    },
    clone: function () {
        var a = new cc.ScaleTo;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._endScaleX, this._endScaleY);
        return a
    },
    startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._startScaleX = a.scaleX;
        this._startScaleY = a.scaleY;
        this._deltaX = this._endScaleX - this._startScaleX;
        this._deltaY = this._endScaleY - this._startScaleY
    },
    update: function (a) {
        a = this._computeEaseTime(a);
        this.target && (this.target.scaleX = this._startScaleX + this._deltaX * a, this.target.scaleY = this._startScaleY + this._deltaY * a)
    }
});
cc.scaleTo = function (a, b, c) {
    return new cc.ScaleTo(a, b, c)
};
cc.ScaleTo.create = cc.scaleTo;
cc.ScaleBy = cc.ScaleTo.extend({
    startWithTarget: function (a) {
        cc.ScaleTo.prototype.startWithTarget.call(this, a);
        this._deltaX = this._startScaleX * this._endScaleX - this._startScaleX;
        this._deltaY = this._startScaleY * this._endScaleY - this._startScaleY
    }, reverse: function () {
        var a = new cc.ScaleBy(this._duration, 1 / this._endScaleX, 1 / this._endScaleY);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }, clone: function () {
        var a = new cc.ScaleBy;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._endScaleX, this._endScaleY);
        return a
    }
});
cc.scaleBy = function (a, b, c) {
    return new cc.ScaleBy(a, b, c)
};
cc.ScaleBy.create = cc.scaleBy;
cc.Blink = cc.ActionInterval.extend({
    _times: 0, _originalState: !1, ctor: function (a, b) {
        cc.ActionInterval.prototype.ctor.call(this);
        void 0 !== b && this.initWithDuration(a, b)
    }, initWithDuration: function (a, b) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._times = b, !0) : !1
    }, clone: function () {
        var a = new cc.Blink;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._times);
        return a
    }, update: function (a) {
        a = this._computeEaseTime(a);
        if (this.target && !this.isDone()) {
            var b = 1 / this._times;
            this.target.visible = a % b > b / 2
        }
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._originalState = a.visible
    }, stop: function () {
        this.target.visible = this._originalState;
        cc.ActionInterval.prototype.stop.call(this)
    }, reverse: function () {
        var a = new cc.Blink(this._duration, this._times);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }
});
cc.blink = function (a, b) {
    return new cc.Blink(a, b)
};
cc.Blink.create = cc.blink;
cc.FadeTo = cc.ActionInterval.extend({
    _toOpacity: 0, _fromOpacity: 0, ctor: function (a, b) {
        cc.ActionInterval.prototype.ctor.call(this);
        void 0 !== b && this.initWithDuration(a, b)
    }, initWithDuration: function (a, b) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._toOpacity = b, !0) : !1
    }, clone: function () {
        var a = new cc.FadeTo;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._toOpacity);
        return a
    }, update: function (a) {
        a = this._computeEaseTime(a);
        var b = void 0 !== this._fromOpacity ? this._fromOpacity : 255;
        this.target.opacity = b + (this._toOpacity - b) * a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._fromOpacity = a.opacity
    }
});
cc.fadeTo = function (a, b) {
    return new cc.FadeTo(a, b)
};
cc.FadeTo.create = cc.fadeTo;
cc.FadeIn = cc.FadeTo.extend({
    _reverseAction: null, ctor: function (a) {
        cc.FadeTo.prototype.ctor.call(this);
        null == a && (a = 0);
        this.initWithDuration(a, 255)
    }, reverse: function () {
        var a = new cc.FadeOut;
        a.initWithDuration(this._duration, 0);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }, clone: function () {
        var a = new cc.FadeIn;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._toOpacity);
        return a
    }, startWithTarget: function (a) {
        this._reverseAction && (this._toOpacity = this._reverseAction._fromOpacity);
        cc.FadeTo.prototype.startWithTarget.call(this, a)
    }
});
cc.fadeIn = function (a) {
    return new cc.FadeIn(a)
};
cc.FadeIn.create = cc.fadeIn;
cc.FadeOut = cc.FadeTo.extend({
    ctor: function (a) {
        cc.FadeTo.prototype.ctor.call(this);
        null == a && (a = 0);
        this.initWithDuration(a, 0)
    }, reverse: function () {
        var a = new cc.FadeIn;
        a._reverseAction = this;
        a.initWithDuration(this._duration, 255);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }, clone: function () {
        var a = new cc.FadeOut;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._toOpacity);
        return a
    }
});
cc.fadeOut = function (a) {
    return new cc.FadeOut(a)
};
cc.FadeOut.create = cc.fadeOut;
cc.TintTo = cc.ActionInterval.extend({
    _to: null, _from: null, ctor: function (a, b, c, d) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._to = cc.color(0, 0, 0);
        this._from = cc.color(0, 0, 0);
        void 0 !== d && this.initWithDuration(a, b, c, d)
    }, initWithDuration: function (a, b, c, d) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._to = cc.color(b, c, d), !0) : !1
    }, clone: function () {
        var a = new cc.TintTo;
        this._cloneDecoration(a);
        var b = this._to;
        a.initWithDuration(this._duration, b.r, b.g, b.b);
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._from = this.target.color
    }, update: function (a) {
        a = this._computeEaseTime(a);
        var b = this._from, c = this._to;
        b && (this.target.color = cc.color(b.r + (c.r - b.r) * a, b.g + (c.g - b.g) * a, b.b + (c.b - b.b) * a))
    }
});
cc.tintTo = function (a, b, c, d) {
    return new cc.TintTo(a, b, c, d)
};
cc.TintTo.create = cc.tintTo;
cc.TintBy = cc.ActionInterval.extend({
    _deltaR: 0,
    _deltaG: 0,
    _deltaB: 0,
    _fromR: 0,
    _fromG: 0,
    _fromB: 0,
    ctor: function (a, b, c, d) {
        cc.ActionInterval.prototype.ctor.call(this);
        void 0 !== d && this.initWithDuration(a, b, c, d)
    },
    initWithDuration: function (a, b, c, d) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._deltaR = b, this._deltaG = c, this._deltaB = d, !0) : !1
    },
    clone: function () {
        var a = new cc.TintBy;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration, this._deltaR, this._deltaG, this._deltaB);
        return a
    },
    startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        a = a.color;
        this._fromR = a.r;
        this._fromG = a.g;
        this._fromB = a.b
    },
    update: function (a) {
        a = this._computeEaseTime(a);
        this.target.color = cc.color(this._fromR + this._deltaR * a, this._fromG + this._deltaG * a, this._fromB + this._deltaB * a)
    },
    reverse: function () {
        var a = new cc.TintBy(this._duration, -this._deltaR, -this._deltaG, -this._deltaB);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }
});
cc.tintBy = function (a, b, c, d) {
    return new cc.TintBy(a, b, c, d)
};
cc.TintBy.create = cc.tintBy;
cc.DelayTime = cc.ActionInterval.extend({
    update: function (a) {
    }, reverse: function () {
        var a = new cc.DelayTime(this._duration);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }, clone: function () {
        var a = new cc.DelayTime;
        this._cloneDecoration(a);
        a.initWithDuration(this._duration);
        return a
    }
});
cc.delayTime = function (a) {
    return new cc.DelayTime(a)
};
cc.DelayTime.create = cc.delayTime;
cc.ReverseTime = cc.ActionInterval.extend({
    _other: null, ctor: function (a) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._other = null;
        a && this.initWithAction(a)
    }, initWithAction: function (a) {
        if (!a)throw"cc.ReverseTime.initWithAction(): action must be non null";
        if (a === this._other)throw"cc.ReverseTime.initWithAction(): the action was already passed in.";
        return cc.ActionInterval.prototype.initWithDuration.call(this, a._duration) ? (this._other = a, !0) : !1
    }, clone: function () {
        var a = new cc.ReverseTime;
        this._cloneDecoration(a);
        a.initWithAction(this._other.clone());
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._other.startWithTarget(a)
    }, update: function (a) {
        a = this._computeEaseTime(a);
        this._other && this._other.update(1 - a)
    }, reverse: function () {
        return this._other.clone()
    }, stop: function () {
        this._other.stop();
        cc.Action.prototype.stop.call(this)
    }
});
cc.reverseTime = function (a) {
    return new cc.ReverseTime(a)
};
cc.ReverseTime.create = cc.reverseTime;
cc.Animate = cc.ActionInterval.extend({
    _animation: null, _nextFrame: 0, _origFrame: null, _executedLoops: 0, _splitTimes: null, ctor: function (a) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._splitTimes = [];
        a && this.initWithAnimation(a)
    }, getAnimation: function () {
        return this._animation
    }, setAnimation: function (a) {
        this._animation = a
    }, initWithAnimation: function (a) {
        if (!a)throw"cc.Animate.initWithAnimation(): animation must be non-NULL";
        var b = a.getDuration();
        if (this.initWithDuration(b * a.getLoops())) {
            this._nextFrame = 0;
            this.setAnimation(a);
            this._origFrame = null;
            this._executedLoops = 0;
            var c = this._splitTimes, d = c.length = 0, e = b / a.getTotalDelayUnits();
            a = a.getFrames();
            cc.arrayVerifyType(a, cc.AnimationFrame);
            for (var f = 0; f < a.length; f++) {
                var g = d * e / b, d = d + a[f].getDelayUnits();
                c.push(g)
            }
            return !0
        }
        return !1
    }, clone: function () {
        var a = new cc.Animate;
        this._cloneDecoration(a);
        a.initWithAnimation(this._animation.clone());
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._animation.getRestoreOriginalFrame() && (this._origFrame = a.displayFrame());
        this._executedLoops = this._nextFrame = 0
    }, update: function (a) {
        a = this._computeEaseTime(a);
        1 > a && (a *= this._animation.getLoops(), (0 | a) > this._executedLoops && (this._nextFrame = 0, this._executedLoops++), a %= 1);
        for (var b = this._animation.getFrames(), c = b.length, d = this._splitTimes, e = this._nextFrame; e < c; e++)
            if (d[e] <= a)this.target.setSpriteFrame(b[e].getSpriteFrame()), this._nextFrame = e + 1; else break
    }, reverse: function () {
        var a = this._animation, b = a.getFrames(), c = [];
        cc.arrayVerifyType(b, cc.AnimationFrame);
        if (0 < b.length)
            for (var d = b.length - 1; 0 <= d; d--) {
                var e = b[d];
                if (!e)break;
                c.push(e.clone())
            }
        b = new cc.Animation(c, a.getDelayPerUnit(), a.getLoops());
        b.setRestoreOriginalFrame(a.getRestoreOriginalFrame());
        a = new cc.Animate(b);
        this._cloneDecoration(a);
        this._reverseEaseList(a);
        return a
    }, stop: function () {
        this._animation.getRestoreOriginalFrame() && this.target && this.target.setSpriteFrame(this._origFrame);
        cc.Action.prototype.stop.call(this)
    }
});
cc.animate = function (a) {
    return new cc.Animate(a)
};
cc.Animate.create = cc.animate;
cc.TargetedAction = cc.ActionInterval.extend({
    _action: null, _forcedTarget: null, ctor: function (a, b) {
        cc.ActionInterval.prototype.ctor.call(this);
        b && this.initWithTarget(a, b)
    }, initWithTarget: function (a, b) {
        return this.initWithDuration(b._duration) ? (this._forcedTarget = a, this._action = b, !0) : !1
    }, clone: function () {
        var a = new cc.TargetedAction;
        this._cloneDecoration(a);
        a.initWithTarget(this._forcedTarget, this._action.clone());
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._action.startWithTarget(this._forcedTarget)
    }, stop: function () {
        this._action.stop()
    }, update: function (a) {
        a = this._computeEaseTime(a);
        this._action.update(a)
    }, getForcedTarget: function () {
        return this._forcedTarget
    }, setForcedTarget: function (a) {
        this._forcedTarget !== a && (this._forcedTarget = a)
    }
});
cc.targetedAction = function (a, b) {
    return new cc.TargetedAction(a, b)
};
cc.TargetedAction.create = cc.targetedAction;
cc.ActionInstant = cc.FiniteTimeAction.extend({
    isDone: function () {
        return !0
    }, step: function (a) {
        this.update(1)
    }, update: function (a) {
    }, reverse: function () {
        return this.clone()
    }, clone: function () {
        return new cc.ActionInstant
    }
});
cc.Show = cc.ActionInstant.extend({
    update: function (a) {
        this.target.visible = !0
    }, reverse: function () {
        return new cc.Hide
    }, clone: function () {
        return new cc.Show
    }
});
cc.show = function () {
    return new cc.Show
};
cc.Show.create = cc.show;
cc.Hide = cc.ActionInstant.extend({
    update: function (a) {
        this.target.visible = !1
    }, reverse: function () {
        return new cc.Show
    }, clone: function () {
        return new cc.Hide
    }
});
cc.hide = function () {
    return new cc.Hide
};
cc.Hide.create = cc.hide;
cc.ToggleVisibility = cc.ActionInstant.extend({
    update: function (a) {
        this.target.visible = !this.target.visible
    }, reverse: function () {
        return new cc.ToggleVisibility
    }, clone: function () {
        return new cc.ToggleVisibility
    }
});
cc.toggleVisibility = function () {
    return new cc.ToggleVisibility
};
cc.ToggleVisibility.create = cc.toggleVisibility;
cc.RemoveSelf = cc.ActionInstant.extend({
    _isNeedCleanUp: !0, ctor: function (a) {
        cc.FiniteTimeAction.prototype.ctor.call(this);
        void 0 !== a && this.init(a)
    }, update: function (a) {
        this.target.removeFromParent(this._isNeedCleanUp)
    }, init: function (a) {
        this._isNeedCleanUp = a;
        return !0
    }, reverse: function () {
        return new cc.RemoveSelf(this._isNeedCleanUp)
    }, clone: function () {
        return new cc.RemoveSelf(this._isNeedCleanUp)
    }
});
cc.removeSelf = function (a) {
    return new cc.RemoveSelf(a)
};
cc.RemoveSelf.create = cc.removeSelf;
cc.FlipX = cc.ActionInstant.extend({
    _flippedX: !1, ctor: function (a) {
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._flippedX = !1;
        void 0 !== a && this.initWithFlipX(a)
    }, initWithFlipX: function (a) {
        this._flippedX = a;
        return !0
    }, update: function (a) {
        this.target.flippedX = this._flippedX
    }, reverse: function () {
        return new cc.FlipX(!this._flippedX)
    }, clone: function () {
        var a = new cc.FlipX;
        a.initWithFlipX(this._flippedX);
        return a
    }
});
cc.flipX = function (a) {
    return new cc.FlipX(a)
};
cc.FlipX.create = cc.flipX;
cc.FlipY = cc.ActionInstant.extend({
    _flippedY: !1, ctor: function (a) {
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._flippedY = !1;
        void 0 !== a && this.initWithFlipY(a)
    }, initWithFlipY: function (a) {
        this._flippedY = a;
        return !0
    }, update: function (a) {
        this.target.flippedY = this._flippedY
    }, reverse: function () {
        return new cc.FlipY(!this._flippedY)
    }, clone: function () {
        var a = new cc.FlipY;
        a.initWithFlipY(this._flippedY);
        return a
    }
});
cc.flipY = function (a) {
    return new cc.FlipY(a)
};
cc.FlipY.create = cc.flipY;
cc.Place = cc.ActionInstant.extend({
    _x: 0, _y: 0, ctor: function (a, b) {
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._y = this._x = 0;
        void 0 !== a && (void 0 !== a.x && (b = a.y, a = a.x), this.initWithPosition(a, b))
    }, initWithPosition: function (a, b) {
        this._x = a;
        this._y = b;
        return !0
    }, update: function (a) {
        this.target.setPosition(this._x, this._y)
    }, clone: function () {
        var a = new cc.Place;
        a.initWithPosition(this._x, this._y);
        return a
    }
});
cc.place = function (a, b) {
    return new cc.Place(a, b)
};
cc.Place.create = cc.place;
cc.CallFunc = cc.ActionInstant.extend({
    _selectorTarget: null,
    _callFunc: null,
    _function: null,
    _data: null,
    ctor: function (a, b, c) {
        cc.FiniteTimeAction.prototype.ctor.call(this);
        void 0 !== a && (void 0 === b ? this.initWithFunction(a) : this.initWithFunction(a, b, c))
    },
    initWithFunction: function (a, b, c) {
        b ? (this._data = c, this._callFunc = a, this._selectorTarget = b) : a && (this._function = a);
        return !0
    },
    execute: function () {
        null != this._callFunc ? this._callFunc.call(this._selectorTarget, this.target, this._data) : this._function && this._function.call(null, this.target)
    },
    update: function (a) {
        this.execute()
    },
    getTargetCallback: function () {
        return this._selectorTarget
    },
    setTargetCallback: function (a) {
        a !== this._selectorTarget && (this._selectorTarget && (this._selectorTarget = null), this._selectorTarget = a)
    },
    clone: function () {
        var a = new cc.CallFunc;
        this._selectorTarget ? a.initWithFunction(this._callFunc, this._selectorTarget, this._data) : this._function && a.initWithFunction(this._function);
        return a
    }
});
cc.callFunc = function (a, b, c) {
    return new cc.CallFunc(a, b, c)
};
cc.CallFunc.create = cc.callFunc;
cc.ActionCamera = cc.ActionInterval.extend({
    _centerXOrig: 0,
    _centerYOrig: 0,
    _centerZOrig: 0,
    _eyeXOrig: 0,
    _eyeYOrig: 0,
    _eyeZOrig: 0,
    _upXOrig: 0,
    _upYOrig: 0,
    _upZOrig: 0,
    ctor: function () {
        cc.ActionInterval.prototype.ctor.call(this);
        this._upZOrig = this._upYOrig = this._upXOrig = this._eyeZOrig = this._eyeYOrig = this._eyeXOrig = this._centerZOrig = this._centerYOrig = this._centerXOrig = 0
    },
    startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        a = a.getCamera();
        var b = a.getCenter();
        this._centerXOrig = b.x;
        this._centerYOrig = b.y;
        this._centerZOrig = b.z;
        b = a.getEye();
        this._eyeXOrig = b.x;
        this._eyeYOrig = b.y;
        this._eyeZOrig = b.z;
        a = a.getUp();
        this._upXOrig = a.x;
        this._upYOrig = a.y;
        this._upZOrig = a.z
    },
    clone: function () {
        return new cc.ActionCamera
    },
    reverse: function () {
        return new cc.ReverseTime(this)
    }
});
cc.OrbitCamera = cc.ActionCamera.extend({
    _radius: 0,
    _deltaRadius: 0,
    _angleZ: 0,
    _deltaAngleZ: 0,
    _angleX: 0,
    _deltaAngleX: 0,
    _radZ: 0,
    _radDeltaZ: 0,
    _radX: 0,
    _radDeltaX: 0,
    ctor: function (a, b, c, d, e, f, g) {
        cc.ActionCamera.prototype.ctor.call(this);
        void 0 !== g && this.initWithDuration(a, b, c, d, e, f, g)
    },
    initWithDuration: function (a, b, c, d, e, f, g) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._radius = b, this._deltaRadius = c, this._angleZ = d, this._deltaAngleZ = e, this._angleX = f, this._deltaAngleX = g, this._radDeltaZ = cc.degreesToRadians(e), this._radDeltaX = cc.degreesToRadians(g), !0) : !1
    },
    sphericalRadius: function () {
        var a, b;
        b = this.target.getCamera();
        var c = b.getEye();
        a = b.getCenter();
        b = c.x - a.x;
        var d = c.y - a.y;
        a = c.z - a.z;
        var c = Math.sqrt(Math.pow(b, 2) + Math.pow(d, 2) + Math.pow(a, 2)), e = Math.sqrt(Math.pow(b, 2) + Math.pow(d, 2));
        0 === e && (e = cc.FLT_EPSILON);
        0 === c && (c = cc.FLT_EPSILON);
        a = Math.acos(a / c);
        b = 0 > b ? Math.PI - Math.asin(d / e) : Math.asin(d / e);
        return {newRadius: c / cc.Camera.getZEye(), zenith: a, azimuth: b}
    },
    startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        a = this.sphericalRadius();
        isNaN(this._radius) && (this._radius = a.newRadius);
        isNaN(this._angleZ) && (this._angleZ = cc.radiansToDegrees(a.zenith));
        isNaN(this._angleX) && (this._angleX = cc.radiansToDegrees(a.azimuth));
        this._radZ = cc.degreesToRadians(this._angleZ);
        this._radX = cc.degreesToRadians(this._angleX)
    },
    clone: function () {
        var a = new cc.OrbitCamera;
        a.initWithDuration(this._duration, this._radius, this._deltaRadius, this._angleZ, this._deltaAngleZ, this._angleX, this._deltaAngleX);
        return a
    },
    update: function (a) {
        a = this._computeEaseTime(a);
        var b = (this._radius + this._deltaRadius * a) * cc.Camera.getZEye(), c = this._radZ + this._radDeltaZ * a, d = this._radX + this._radDeltaX * a;
        a = Math.sin(c) * Math.cos(d) * b + this._centerXOrig;
        d = Math.sin(c) * Math.sin(d) * b + this._centerYOrig;
        b = Math.cos(c) * b + this._centerZOrig;
        this.target.getCamera().setEye(a, d, b);
        this.target.setNodeDirty()
    }
});
cc.orbitCamera = function (a, b, c, d, e, f, g) {
    return new cc.OrbitCamera(a, b, c, d, e, f, g)
};
cc.OrbitCamera.create = cc.orbitCamera;
cc.ActionEase = cc.ActionInterval.extend({
    _inner: null, ctor: function (a) {
        cc.ActionInterval.prototype.ctor.call(this);
        a && this.initWithAction(a)
    }, initWithAction: function (a) {
        if (!a)throw"cc.ActionEase.initWithAction(): action must be non nil";
        return this.initWithDuration(a.getDuration()) ? (this._inner = a, !0) : !1
    }, clone: function () {
        var a = new cc.ActionEase;
        a.initWithAction(this._inner.clone());
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._inner.startWithTarget(this.target)
    }, stop: function () {
        this._inner.stop();
        cc.ActionInterval.prototype.stop.call(this)
    }, update: function (a) {
        this._inner.update(a)
    }, reverse: function () {
        return new cc.ActionEase(this._inner.reverse())
    }, getInnerAction: function () {
        return this._inner
    }
});
cc.actionEase = function (a) {
    return new cc.ActionEase(a)
};
cc.ActionEase.create = cc.actionEase;
cc.EaseRateAction = cc.ActionEase.extend({
    _rate: 0, ctor: function (a, b) {
        cc.ActionEase.prototype.ctor.call(this);
        void 0 !== b && this.initWithAction(a, b)
    }, setRate: function (a) {
        this._rate = a
    }, getRate: function () {
        return this._rate
    }, initWithAction: function (a, b) {
        return cc.ActionEase.prototype.initWithAction.call(this, a) ? (this._rate = b, !0) : !1
    }, clone: function () {
        var a = new cc.EaseRateAction;
        a.initWithAction(this._inner.clone(), this._rate);
        return a
    }, reverse: function () {
        return new cc.EaseRateAction(this._inner.reverse(), 1 / this._rate)
    }
});
cc.easeRateAction = function (a, b) {
    return new cc.EaseRateAction(a, b)
};
cc.EaseRateAction.create = cc.easeRateAction;
cc.EaseIn = cc.EaseRateAction.extend({
    update: function (a) {
        this._inner.update(Math.pow(a, this._rate))
    }, reverse: function () {
        return new cc.EaseIn(this._inner.reverse(), 1 / this._rate)
    }, clone: function () {
        var a = new cc.EaseIn;
        a.initWithAction(this._inner.clone(), this._rate);
        return a
    }
});
cc.EaseIn.create = function (a, b) {
    return new cc.EaseIn(a, b)
};
cc.easeIn = function (a) {
    return {
        _rate: a, easing: function (a) {
            return Math.pow(a, this._rate)
        }, reverse: function () {
            return cc.easeIn(1 / this._rate)
        }
    }
};
cc.EaseOut = cc.EaseRateAction.extend({
    update: function (a) {
        this._inner.update(Math.pow(a, 1 / this._rate))
    }, reverse: function () {
        return new cc.EaseOut(this._inner.reverse(), 1 / this._rate)
    }, clone: function () {
        var a = new cc.EaseOut;
        a.initWithAction(this._inner.clone(), this._rate);
        return a
    }
});
cc.EaseOut.create = function (a, b) {
    return new cc.EaseOut(a, b)
};
cc.easeOut = function (a) {
    return {
        _rate: a, easing: function (a) {
            return Math.pow(a, 1 / this._rate)
        }, reverse: function () {
            return cc.easeOut(1 / this._rate)
        }
    }
};
cc.EaseInOut = cc.EaseRateAction.extend({
    update: function (a) {
        a *= 2;
        1 > a ? this._inner.update(0.5 * Math.pow(a, this._rate)) : this._inner.update(1 - 0.5 * Math.pow(2 - a, this._rate))
    }, clone: function () {
        var a = new cc.EaseInOut;
        a.initWithAction(this._inner.clone(), this._rate);
        return a
    }, reverse: function () {
        return new cc.EaseInOut(this._inner.reverse(), this._rate)
    }
});
cc.EaseInOut.create = function (a, b) {
    return new cc.EaseInOut(a, b)
};
cc.easeInOut = function (a) {
    return {
        _rate: a, easing: function (a) {
            a *= 2;
            return 1 > a ? 0.5 * Math.pow(a, this._rate) : 1 - 0.5 * Math.pow(2 - a, this._rate)
        }, reverse: function () {
            return cc.easeInOut(this._rate)
        }
    }
};
cc.EaseExponentialIn = cc.ActionEase.extend({
    update: function (a) {
        this._inner.update(0 === a ? 0 : Math.pow(2, 10 * (a - 1)))
    }, reverse: function () {
        return new cc.EaseExponentialOut(this._inner.reverse())
    }, clone: function () {
        var a = new cc.EaseExponentialIn;
        a.initWithAction(this._inner.clone());
        return a
    }
});
cc.EaseExponentialIn.create = function (a) {
    return new cc.EaseExponentialIn(a)
};
cc._easeExponentialInObj = {
    easing: function (a) {
        return 0 === a ? 0 : Math.pow(2, 10 * (a - 1))
    }, reverse: function () {
        return cc._easeExponentialOutObj
    }
};
cc.easeExponentialIn = function () {
    return cc._easeExponentialInObj
};
cc.EaseExponentialOut = cc.ActionEase.extend({
    update: function (a) {
        this._inner.update(1 === a ? 1 : -Math.pow(2, -10 * a) + 1)
    }, reverse: function () {
        return new cc.EaseExponentialIn(this._inner.reverse())
    }, clone: function () {
        var a = new cc.EaseExponentialOut;
        a.initWithAction(this._inner.clone());
        return a
    }
});
cc.EaseExponentialOut.create = function (a) {
    return new cc.EaseExponentialOut(a)
};
cc._easeExponentialOutObj = {
    easing: function (a) {
        return 1 === a ? 1 : -Math.pow(2, -10 * a) + 1
    }, reverse: function () {
        return cc._easeExponentialInObj
    }
};
cc.easeExponentialOut = function () {
    return cc._easeExponentialOutObj
};
cc.EaseExponentialInOut = cc.ActionEase.extend({
    update: function (a) {
        1 !== a && 0 !== a && (a *= 2, a = 1 > a ? 0.5 * Math.pow(2, 10 * (a - 1)) : 0.5 * (-Math.pow(2, -10 * (a - 1)) + 2));
        this._inner.update(a)
    }, reverse: function () {
        return new cc.EaseExponentialInOut(this._inner.reverse())
    }, clone: function () {
        var a = new cc.EaseExponentialInOut;
        a.initWithAction(this._inner.clone());
        return a
    }
});
cc.EaseExponentialInOut.create = function (a) {
    return new cc.EaseExponentialInOut(a)
};
cc._easeExponentialInOutObj = {
    easing: function (a) {
        return 1 !== a && 0 !== a ? (a *= 2, 1 > a ? 0.5 * Math.pow(2, 10 * (a - 1)) : 0.5 * (-Math.pow(2, -10 * (a - 1)) + 2)) : a
    }, reverse: function () {
        return cc._easeExponentialInOutObj
    }
};
cc.easeExponentialInOut = function () {
    return cc._easeExponentialInOutObj
};
cc.EaseSineIn = cc.ActionEase.extend({
    update: function (a) {
        a = 0 === a || 1 === a ? a : -1 * Math.cos(a * Math.PI / 2) + 1;
        this._inner.update(a)
    }, reverse: function () {
        return new cc.EaseSineOut(this._inner.reverse())
    }, clone: function () {
        var a = new cc.EaseSineIn;
        a.initWithAction(this._inner.clone());
        return a
    }
});
cc.EaseSineIn.create = function (a) {
    return new cc.EaseSineIn(a)
};
cc._easeSineInObj = {
    easing: function (a) {
        return 0 === a || 1 === a ? a : -1 * Math.cos(a * Math.PI / 2) + 1
    }, reverse: function () {
        return cc._easeSineOutObj
    }
};
cc.easeSineIn = function () {
    return cc._easeSineInObj
};
cc.EaseSineOut = cc.ActionEase.extend({
    update: function (a) {
        a = 0 === a || 1 === a ? a : Math.sin(a * Math.PI / 2);
        this._inner.update(a)
    }, reverse: function () {
        return new cc.EaseSineIn(this._inner.reverse())
    }, clone: function () {
        var a = new cc.EaseSineOut;
        a.initWithAction(this._inner.clone());
        return a
    }
});
cc.EaseSineOut.create = function (a) {
    return new cc.EaseSineOut(a)
};
cc._easeSineOutObj = {
    easing: function (a) {
        return 0 === a || 1 === a ? a : Math.sin(a * Math.PI / 2)
    }, reverse: function () {
        return cc._easeSineInObj
    }
};
cc.easeSineOut = function () {
    return cc._easeSineOutObj
};
cc.EaseSineInOut = cc.ActionEase.extend({
    update: function (a) {
        a = 0 === a || 1 === a ? a : -0.5 * (Math.cos(Math.PI * a) - 1);
        this._inner.update(a)
    }, clone: function () {
        var a = new cc.EaseSineInOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseSineInOut(this._inner.reverse())
    }
});
cc.EaseSineInOut.create = function (a) {
    return new cc.EaseSineInOut(a)
};
cc._easeSineInOutObj = {
    easing: function (a) {
        return 0 === a || 1 === a ? a : -0.5 * (Math.cos(Math.PI * a) - 1)
    }, reverse: function () {
        return cc._easeSineInOutObj
    }
};
cc.easeSineInOut = function () {
    return cc._easeSineInOutObj
};
cc.EaseElastic = cc.ActionEase.extend({
    _period: 0.3, ctor: function (a, b) {
        cc.ActionEase.prototype.ctor.call(this);
        a && this.initWithAction(a, b)
    }, getPeriod: function () {
        return this._period
    }, setPeriod: function (a) {
        this._period = a
    }, initWithAction: function (a, b) {
        cc.ActionEase.prototype.initWithAction.call(this, a);
        this._period = null == b ? 0.3 : b;
        return !0
    }, reverse: function () {
        cc.log("cc.EaseElastic.reverse(): it should be overridden in subclass.");
        return null
    }, clone: function () {
        var a = new cc.EaseElastic;
        a.initWithAction(this._inner.clone(), this._period);
        return a
    }
});
cc.EaseElastic.create = function (a, b) {
    return new cc.EaseElastic(a, b)
};
cc.EaseElasticIn = cc.EaseElastic.extend({
    update: function (a) {
        var b = 0;
        0 === a || 1 === a ? b = a : (b = this._period / 4, a -= 1, b = -Math.pow(2, 10 * a) * Math.sin((a - b) * Math.PI * 2 / this._period));
        this._inner.update(b)
    }, reverse: function () {
        return new cc.EaseElasticOut(this._inner.reverse(), this._period)
    }, clone: function () {
        var a = new cc.EaseElasticIn;
        a.initWithAction(this._inner.clone(), this._period);
        return a
    }
});
cc.EaseElasticIn.create = function (a, b) {
    return new cc.EaseElasticIn(a, b)
};
cc._easeElasticInObj = {
    easing: function (a) {
        if (0 === a || 1 === a)return a;
        a -= 1;
        return -Math.pow(2, 10 * a) * Math.sin((a - 0.075) * Math.PI * 2 / 0.3)
    }, reverse: function () {
        return cc._easeElasticOutObj
    }
};
cc.easeElasticIn = function (a) {
    return a && 0.3 !== a ? {
        _period: a, easing: function (a) {
            if (0 === a || 1 === a)return a;
            a -= 1;
            return -Math.pow(2, 10 * a) * Math.sin((a - this._period / 4) * Math.PI * 2 / this._period)
        }, reverse: function () {
            return cc.easeElasticOut(this._period)
        }
    } : cc._easeElasticInObj
};
cc.EaseElasticOut = cc.EaseElastic.extend({
    update: function (a) {
        var b = 0;
        0 === a || 1 === a ? b = a : (b = this._period / 4, b = Math.pow(2, -10 * a) * Math.sin((a - b) * Math.PI * 2 / this._period) + 1);
        this._inner.update(b)
    }, reverse: function () {
        return new cc.EaseElasticIn(this._inner.reverse(), this._period)
    }, clone: function () {
        var a = new cc.EaseElasticOut;
        a.initWithAction(this._inner.clone(), this._period);
        return a
    }
});
cc.EaseElasticOut.create = function (a, b) {
    return new cc.EaseElasticOut(a, b)
};
cc._easeElasticOutObj = {
    easing: function (a) {
        return 0 === a || 1 === a ? a : Math.pow(2, -10 * a) * Math.sin((a - 0.075) * Math.PI * 2 / 0.3) + 1
    }, reverse: function () {
        return cc._easeElasticInObj
    }
};
cc.easeElasticOut = function (a) {
    return a && 0.3 !== a ? {
        _period: a, easing: function (a) {
            return 0 === a || 1 === a ? a : Math.pow(2, -10 * a) * Math.sin((a - this._period / 4) * Math.PI * 2 / this._period) + 1
        }, reverse: function () {
            return cc.easeElasticIn(this._period)
        }
    } : cc._easeElasticOutObj
};
cc.EaseElasticInOut = cc.EaseElastic.extend({
    update: function (a) {
        var b = 0, b = this._period;
        if (0 === a || 1 === a)b = a; else {
            b || (b = this._period = 0.3 * 1.5);
            var c = b / 4;
            a = 2 * a - 1;
            b = 0 > a ? -0.5 * Math.pow(2, 10 * a) * Math.sin((a - c) * Math.PI * 2 / b) : Math.pow(2, -10 * a) * Math.sin((a - c) * Math.PI * 2 / b) * 0.5 + 1
        }
        this._inner.update(b)
    }, reverse: function () {
        return new cc.EaseElasticInOut(this._inner.reverse(), this._period)
    }, clone: function () {
        var a = new cc.EaseElasticInOut;
        a.initWithAction(this._inner.clone(), this._period);
        return a
    }
});
cc.EaseElasticInOut.create = function (a, b) {
    return new cc.EaseElasticInOut(a, b)
};
cc.easeElasticInOut = function (a) {
    return {
        _period: a || 0.3, easing: function (a) {
            var c = 0, c = this._period;
            if (0 === a || 1 === a)c = a; else {
                c || (c = this._period = 0.3 * 1.5);
                var d = c / 4;
                a = 2 * a - 1;
                c = 0 > a ? -0.5 * Math.pow(2, 10 * a) * Math.sin((a - d) * Math.PI * 2 / c) : Math.pow(2, -10 * a) * Math.sin((a - d) * Math.PI * 2 / c) * 0.5 + 1
            }
            return c
        }, reverse: function () {
            return cc.easeElasticInOut(this._period)
        }
    }
};
cc.EaseBounce = cc.ActionEase.extend({
    bounceTime: function (a) {
        if (a < 1 / 2.75)return 7.5625 * a * a;
        if (a < 2 / 2.75)return a -= 1.5 / 2.75, 7.5625 * a * a + 0.75;
        if (a < 2.5 / 2.75)return a -= 2.25 / 2.75, 7.5625 * a * a + 0.9375;
        a -= 2.625 / 2.75;
        return 7.5625 * a * a + 0.984375
    }, clone: function () {
        var a = new cc.EaseBounce;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseBounce(this._inner.reverse())
    }
});
cc.EaseBounce.create = function (a) {
    return new cc.EaseBounce(a)
};
cc.EaseBounceIn = cc.EaseBounce.extend({
    update: function (a) {
        a = 1 - this.bounceTime(1 - a);
        this._inner.update(a)
    }, reverse: function () {
        return new cc.EaseBounceOut(this._inner.reverse())
    }, clone: function () {
        var a = new cc.EaseBounceIn;
        a.initWithAction(this._inner.clone());
        return a
    }
});
cc.EaseBounceIn.create = function (a) {
    return new cc.EaseBounceIn(a)
};
cc._bounceTime = function (a) {
    if (a < 1 / 2.75)return 7.5625 * a * a;
    if (a < 2 / 2.75)return a -= 1.5 / 2.75, 7.5625 * a * a + 0.75;
    if (a < 2.5 / 2.75)return a -= 2.25 / 2.75, 7.5625 * a * a + 0.9375;
    a -= 2.625 / 2.75;
    return 7.5625 * a * a + 0.984375
};
cc._easeBounceInObj = {
    easing: function (a) {
        return 1 - cc._bounceTime(1 - a)
    }, reverse: function () {
        return cc._easeBounceOutObj
    }
};
cc.easeBounceIn = function () {
    return cc._easeBounceInObj
};
cc.EaseBounceOut = cc.EaseBounce.extend({
    update: function (a) {
        a = this.bounceTime(a);
        this._inner.update(a)
    }, reverse: function () {
        return new cc.EaseBounceIn(this._inner.reverse())
    }, clone: function () {
        var a = new cc.EaseBounceOut;
        a.initWithAction(this._inner.clone());
        return a
    }
});
cc.EaseBounceOut.create = function (a) {
    return new cc.EaseBounceOut(a)
};
cc._easeBounceOutObj = {
    easing: function (a) {
        return cc._bounceTime(a)
    }, reverse: function () {
        return cc._easeBounceInObj
    }
};
cc.easeBounceOut = function () {
    return cc._easeBounceOutObj
};
cc.EaseBounceInOut = cc.EaseBounce.extend({
    update: function (a) {
        var b = 0, b = 0.5 > a ? 0.5 * (1 - this.bounceTime(1 - 2 * a)) : 0.5 * this.bounceTime(2 * a - 1) + 0.5;
        this._inner.update(b)
    }, clone: function () {
        var a = new cc.EaseBounceInOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseBounceInOut(this._inner.reverse())
    }
});
cc.EaseBounceInOut.create = function (a) {
    return new cc.EaseBounceInOut(a)
};
cc._easeBounceInOutObj = {
    easing: function (a) {
        return a = 0.5 > a ? 0.5 * (1 - cc._bounceTime(1 - 2 * a)) : 0.5 * cc._bounceTime(2 * a - 1) + 0.5
    }, reverse: function () {
        return cc._easeBounceInOutObj
    }
};
cc.easeBounceInOut = function () {
    return cc._easeBounceInOutObj
};
cc.EaseBackIn = cc.ActionEase.extend({
    update: function (a) {
        this._inner.update(0 === a || 1 === a ? a : a * a * (2.70158 * a - 1.70158))
    }, reverse: function () {
        return new cc.EaseBackOut(this._inner.reverse())
    }, clone: function () {
        var a = new cc.EaseBackIn;
        a.initWithAction(this._inner.clone());
        return a
    }
});
cc.EaseBackIn.create = function (a) {
    return new cc.EaseBackIn(a)
};
cc._easeBackInObj = {
    easing: function (a) {
        return 0 === a || 1 === a ? a : a * a * (2.70158 * a - 1.70158)
    }, reverse: function () {
        return cc._easeBackOutObj
    }
};
cc.easeBackIn = function () {
    return cc._easeBackInObj
};
cc.EaseBackOut = cc.ActionEase.extend({
    update: function (a) {
        a -= 1;
        this._inner.update(a * a * (2.70158 * a + 1.70158) + 1)
    }, reverse: function () {
        return new cc.EaseBackIn(this._inner.reverse())
    }, clone: function () {
        var a = new cc.EaseBackOut;
        a.initWithAction(this._inner.clone());
        return a
    }
});
cc.EaseBackOut.create = function (a) {
    return new cc.EaseBackOut(a)
};
cc._easeBackOutObj = {
    easing: function (a) {
        a -= 1;
        return a * a * (2.70158 * a + 1.70158) + 1
    }, reverse: function () {
        return cc._easeBackInObj
    }
};
cc.easeBackOut = function () {
    return cc._easeBackOutObj
};
cc.EaseBackInOut = cc.ActionEase.extend({
    update: function (a) {
        a *= 2;
        1 > a ? this._inner.update(a * a * (3.5949095 * a - 2.5949095) / 2) : (a -= 2, this._inner.update(a * a * (3.5949095 * a + 2.5949095) / 2 + 1))
    }, clone: function () {
        var a = new cc.EaseBackInOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseBackInOut(this._inner.reverse())
    }
});
cc.EaseBackInOut.create = function (a) {
    return new cc.EaseBackInOut(a)
};
cc._easeBackInOutObj = {
    easing: function (a) {
        a *= 2;
        if (1 > a)return a * a * (3.5949095 * a - 2.5949095) / 2;
        a -= 2;
        return a * a * (3.5949095 * a + 2.5949095) / 2 + 1
    }, reverse: function () {
        return cc._easeBackInOutObj
    }
};
cc.easeBackInOut = function () {
    return cc._easeBackInOutObj
};
cc.EaseBezierAction = cc.ActionEase.extend({
    _p0: null, _p1: null, _p2: null, _p3: null, ctor: function (a) {
        cc.ActionEase.prototype.ctor.call(this, a)
    }, _updateTime: function (a, b, c, d, e) {
        return Math.pow(1 - e, 3) * a + 3 * e * Math.pow(1 - e, 2) * b + 3 * Math.pow(e, 2) * (1 - e) * c + Math.pow(e, 3) * d
    }, update: function (a) {
        a = this._updateTime(this._p0, this._p1, this._p2, this._p3, a);
        this._inner.update(a)
    }, clone: function () {
        var a = new cc.EaseBezierAction;
        a.initWithAction(this._inner.clone());
        a.setBezierParamer(this._p0, this._p1, this._p2, this._p3);
        return a
    }, reverse: function () {
        var a = new cc.EaseBezierAction(this._inner.reverse());
        a.setBezierParamer(this._p3, this._p2, this._p1, this._p0);
        return a
    }, setBezierParamer: function (a, b, c, d) {
        this._p0 = a || 0;
        this._p1 = b || 0;
        this._p2 = c || 0;
        this._p3 = d || 0
    }
});
cc.EaseBezierAction.create = function (a) {
    return new cc.EaseBezierAction(a)
};
cc.easeBezierAction = function (a, b, c, d) {
    return {
        easing: function (e) {
            return cc.EaseBezierAction.prototype._updateTime(a, b, c, d, e)
        }, reverse: function () {
            return cc.easeBezierAction(d, c, b, a)
        }
    }
};
cc.EaseQuadraticActionIn = cc.ActionEase.extend({
    _updateTime: function (a) {
        return Math.pow(a, 2)
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseQuadraticActionIn;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseQuadraticActionIn(this._inner.reverse())
    }
});
cc.EaseQuadraticActionIn.create = function (a) {
    return new cc.EaseQuadraticActionIn(a)
};
cc._easeQuadraticActionIn = {
    easing: cc.EaseQuadraticActionIn.prototype._updateTime, reverse: function () {
        return cc._easeQuadraticActionIn
    }
};
cc.easeQuadraticActionIn = function () {
    return cc._easeQuadraticActionIn
};
cc.EaseQuadraticActionOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        return -a * (a - 2)
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseQuadraticActionOut;
        a.initWithAction();
        return a
    }, reverse: function () {
        return new cc.EaseQuadraticActionOut(this._inner.reverse())
    }
});
cc.EaseQuadraticActionOut.create = function (a) {
    return new cc.EaseQuadraticActionOut(a)
};
cc._easeQuadraticActionOut = {
    easing: cc.EaseQuadraticActionOut.prototype._updateTime, reverse: function () {
        return cc._easeQuadraticActionOut
    }
};
cc.easeQuadraticActionOut = function () {
    return cc._easeQuadraticActionOut
};
cc.EaseQuadraticActionInOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        var b = a;
        a *= 2;
        1 > a ? b = a * a * 0.5 : (--a, b = -0.5 * (a * (a - 2) - 1));
        return b
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseQuadraticActionInOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseQuadraticActionInOut(this._inner.reverse())
    }
});
cc.EaseQuadraticActionInOut.create = function (a) {
    return new cc.EaseQuadraticActionInOut(a)
};
cc._easeQuadraticActionInOut = {
    easing: cc.EaseQuadraticActionInOut.prototype._updateTime, reverse: function () {
        return cc._easeQuadraticActionInOut
    }
};
cc.easeQuadraticActionInOut = function () {
    return cc._easeQuadraticActionInOut
};
cc.EaseQuarticActionIn = cc.ActionEase.extend({
    _updateTime: function (a) {
        return a * a * a * a
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseQuarticActionIn;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseQuarticActionIn(this._inner.reverse())
    }
});
cc.EaseQuarticActionIn.create = function (a) {
    return new cc.EaseQuarticActionIn(a)
};
cc._easeQuarticActionIn = {
    easing: cc.EaseQuarticActionIn.prototype._updateTime, reverse: function () {
        return cc._easeQuarticActionIn
    }
};
cc.easeQuarticActionIn = function () {
    return cc._easeQuarticActionIn
};
cc.EaseQuarticActionOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        a -= 1;
        return -(a * a * a * a - 1)
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseQuarticActionOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseQuarticActionOut(this._inner.reverse())
    }
});
cc.EaseQuarticActionOut.create = function (a) {
    return new cc.EaseQuarticActionOut(a)
};
cc._easeQuarticActionOut = {
    easing: cc.EaseQuarticActionOut.prototype._updateTime, reverse: function () {
        return cc._easeQuarticActionOut
    }
};
cc.easeQuarticActionOut = function () {
    return cc._easeQuarticActionOut
};
cc.EaseQuarticActionInOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        a *= 2;
        if (1 > a)return 0.5 * a * a * a * a;
        a -= 2;
        return -0.5 * (a * a * a * a - 2)
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseQuarticActionInOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseQuarticActionInOut(this._inner.reverse())
    }
});
cc.EaseQuarticActionInOut.create = function (a) {
    return new cc.EaseQuarticActionInOut(a)
};
cc._easeQuarticActionInOut = {
    easing: cc.EaseQuarticActionInOut.prototype._updateTime, reverse: function () {
        return cc._easeQuarticActionInOut
    }
};
cc.easeQuarticActionInOut = function () {
    return cc._easeQuarticActionInOut
};
cc.EaseQuinticActionIn = cc.ActionEase.extend({
    _updateTime: function (a) {
        return a * a * a * a * a
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseQuinticActionIn;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseQuinticActionIn(this._inner.reverse())
    }
});
cc.EaseQuinticActionIn.create = function (a) {
    return new cc.EaseQuinticActionIn(a)
};
cc._easeQuinticActionIn = {
    easing: cc.EaseQuinticActionIn.prototype._updateTime, reverse: function () {
        return cc._easeQuinticActionIn
    }
};
cc.easeQuinticActionIn = function () {
    return cc._easeQuinticActionIn
};
cc.EaseQuinticActionOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        a -= 1;
        return a * a * a * a * a + 1
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseQuinticActionOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseQuinticActionOut(this._inner.reverse())
    }
});
cc.EaseQuinticActionOut.create = function (a) {
    return new cc.EaseQuinticActionOut(a)
};
cc._easeQuinticActionOut = {
    easing: cc.EaseQuinticActionOut.prototype._updateTime, reverse: function () {
        return cc._easeQuinticActionOut
    }
};
cc.easeQuinticActionOut = function () {
    return cc._easeQuinticActionOut
};
cc.EaseQuinticActionInOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        a *= 2;
        if (1 > a)return 0.5 * a * a * a * a * a;
        a -= 2;
        return 0.5 * (a * a * a * a * a + 2)
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseQuinticActionInOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseQuinticActionInOut(this._inner.reverse())
    }
});
cc.EaseQuinticActionInOut.create = function (a) {
    return new cc.EaseQuinticActionInOut(a)
};
cc._easeQuinticActionInOut = {
    easing: cc.EaseQuinticActionInOut.prototype._updateTime, reverse: function () {
        return cc._easeQuinticActionInOut
    }
};
cc.easeQuinticActionInOut = function () {
    return cc._easeQuinticActionInOut
};
cc.EaseCircleActionIn = cc.ActionEase.extend({
    _updateTime: function (a) {
        return -1 * (Math.sqrt(1 - a * a) - 1)
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseCircleActionIn;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseCircleActionIn(this._inner.reverse())
    }
});
cc.EaseCircleActionIn.create = function (a) {
    return new cc.EaseCircleActionIn(a)
};
cc._easeCircleActionIn = {
    easing: cc.EaseCircleActionIn.prototype._updateTime, reverse: function () {
        return cc._easeCircleActionIn
    }
};
cc.easeCircleActionIn = function () {
    return cc._easeCircleActionIn
};
cc.EaseCircleActionOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        a -= 1;
        return Math.sqrt(1 - a * a)
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseCircleActionOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseCircleActionOut(this._inner.reverse())
    }
});
cc.EaseCircleActionOut.create = function (a) {
    return new cc.EaseCircleActionOut(a)
};
cc._easeCircleActionOut = {
    easing: cc.EaseCircleActionOut.prototype._updateTime, reverse: function () {
        return cc._easeCircleActionOut
    }
};
cc.easeCircleActionOut = function () {
    return cc._easeCircleActionOut
};
cc.EaseCircleActionInOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        a *= 2;
        if (1 > a)return -0.5 * (Math.sqrt(1 - a * a) - 1);
        a -= 2;
        return 0.5 * (Math.sqrt(1 - a * a) + 1)
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseCircleActionInOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseCircleActionInOut(this._inner.reverse())
    }
});
cc.EaseCircleActionInOut.create = function (a) {
    return new cc.EaseCircleActionInOut(a)
};
cc._easeCircleActionInOut = {
    easing: cc.EaseCircleActionInOut.prototype._updateTime, reverse: function () {
        return cc._easeCircleActionInOut
    }
};
cc.easeCircleActionInOut = function () {
    return cc._easeCircleActionInOut
};
cc.EaseCubicActionIn = cc.ActionEase.extend({
    _updateTime: function (a) {
        return a * a * a
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseCubicActionIn;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseCubicActionIn(this._inner.reverse())
    }
});
cc.EaseCubicActionIn.create = function (a) {
    return new cc.EaseCubicActionIn(a)
};
cc._easeCubicActionIn = {
    easing: cc.EaseCubicActionIn.prototype._updateTime, reverse: function () {
        return cc._easeCubicActionIn
    }
};
cc.easeCubicActionIn = function () {
    return cc._easeCubicActionIn
};
cc.EaseCubicActionOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        a -= 1;
        return a * a * a + 1
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseCubicActionOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseCubicActionOut(this._inner.reverse())
    }
});
cc.EaseCubicActionOut.create = function (a) {
    return new cc.EaseCubicActionOut(a)
};
cc._easeCubicActionOut = {
    easing: cc.EaseCubicActionOut.prototype._updateTime, reverse: function () {
        return cc._easeCubicActionOut
    }
};
cc.easeCubicActionOut = function () {
    return cc._easeCubicActionOut
};
cc.EaseCubicActionInOut = cc.ActionEase.extend({
    _updateTime: function (a) {
        a *= 2;
        if (1 > a)return 0.5 * a * a * a;
        a -= 2;
        return 0.5 * (a * a * a + 2)
    }, update: function (a) {
        this._inner.update(this._updateTime(a))
    }, clone: function () {
        var a = new cc.EaseCubicActionInOut;
        a.initWithAction(this._inner.clone());
        return a
    }, reverse: function () {
        return new cc.EaseCubicActionInOut(this._inner.reverse())
    }
});
cc.EaseCubicActionInOut.create = function (a) {
    return new cc.EaseCubicActionInOut(a)
};
cc._easeCubicActionInOut = {
    easing: cc.EaseCubicActionInOut.prototype._updateTime, reverse: function () {
        return cc._easeCubicActionInOut
    }
};
cc.easeCubicActionInOut = function () {
    return cc._easeCubicActionInOut
};
cc.cardinalSplineAt = function (a, b, c, d, e, f) {
    var g = f * f, h = g * f, k = (1 - e) / 2;
    e = k * (-h + 2 * g - f);
    var m = k * (-h + g) + (2 * h - 3 * g + 1);
    f = k * (h - 2 * g + f) + (-2 * h + 3 * g);
    g = k * (h - g);
    return cc.p(a.x * e + b.x * m + c.x * f + d.x * g, a.y * e + b.y * m + c.y * f + d.y * g)
};
cc.reverseControlPoints = function (a) {
    for (var b = [], c = a.length - 1; 0 <= c; c--)b.push(cc.p(a[c].x, a[c].y));
    return b
};
cc.cloneControlPoints = function (a) {
    for (var b = [], c = 0; c < a.length; c++)b.push(cc.p(a[c].x, a[c].y));
    return b
};
cc.copyControlPoints = cc.cloneControlPoints;
cc.getControlPointAt = function (a, b) {
    var c = Math.min(a.length - 1, Math.max(b, 0));
    return a[c]
};
cc.reverseControlPointsInline = function (a) {
    for (var b = a.length, c = 0 | b / 2, d = 0; d < c; ++d) {
        var e = a[d];
        a[d] = a[b - d - 1];
        a[b - d - 1] = e
    }
};
cc.CardinalSplineTo = cc.ActionInterval.extend({
    _points: null, _deltaT: 0, _tension: 0, _previousPosition: null, _accumulatedDiff: null, ctor: function (a, b, c) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._points = [];
        void 0 !== c && this.initWithDuration(a, b, c)
    }, initWithDuration: function (a, b, c) {
        if (!b || 0 === b.length)throw"Invalid configuration. It must at least have one control point";
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this.setPoints(b), this._tension = c, !0) : !1
    }, clone: function () {
        var a = new cc.CardinalSplineTo;
        a.initWithDuration(this._duration, cc.copyControlPoints(this._points), this._tension);
        return a
    }, startWithTarget: function (a) {
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this._deltaT = 1 / (this._points.length - 1);
        this._previousPosition = cc.p(this.target.getPositionX(), this.target.getPositionY());
        this._accumulatedDiff = cc.p(0, 0)
    }, update: function (a) {
        a = this._computeEaseTime(a);
        var b, c = this._points;
        if (1 === a)b = c.length - 1, a = 1; else {
            var d = this._deltaT;
            b = 0 | a / d;
            a = (a - d * b) / d
        }
        b = cc.cardinalSplineAt(cc.getControlPointAt(c, b - 1), cc.getControlPointAt(c, b - 0), cc.getControlPointAt(c, b + 1), cc.getControlPointAt(c, b + 2), this._tension, a);
        cc.ENABLE_STACKABLE_ACTIONS && (c = this.target.getPositionX() - this._previousPosition.x, a = this.target.getPositionY() - this._previousPosition.y, 0 !== c || 0 !== a) && (d = this._accumulatedDiff, c = d.x + c, a = d.y + a, d.x = c, d.y = a, b.x += c, b.y += a);
        this.updatePosition(b)
    }, reverse: function () {
        var a = cc.reverseControlPoints(this._points);
        return cc.cardinalSplineTo(this._duration, a, this._tension)
    }, updatePosition: function (a) {
        this.target.setPosition(a);
        this._previousPosition = a
    }, getPoints: function () {
        return this._points
    }, setPoints: function (a) {
        this._points = a
    }
});
cc.cardinalSplineTo = function (a, b, c) {
    return new cc.CardinalSplineTo(a, b, c)
};
cc.CardinalSplineTo.create = cc.cardinalSplineTo;
cc.CardinalSplineBy = cc.CardinalSplineTo.extend({
    _startPosition: null, ctor: function (a, b, c) {
        cc.CardinalSplineTo.prototype.ctor.call(this);
        this._startPosition = cc.p(0, 0);
        void 0 !== c && this.initWithDuration(a, b, c)
    }, startWithTarget: function (a) {
        cc.CardinalSplineTo.prototype.startWithTarget.call(this, a);
        this._startPosition.x = a.getPositionX();
        this._startPosition.y = a.getPositionY()
    }, reverse: function () {
        for (var a = this._points.slice(), b, c = a[0], d = 1; d < a.length; ++d)b = a[d], a[d] = cc.pSub(b, c), c = b;
        a = cc.reverseControlPoints(a);
        c = a[a.length - 1];
        a.pop();
        c.x = -c.x;
        c.y = -c.y;
        a.unshift(c);
        for (d = 1; d < a.length; ++d)b = a[d], b.x = -b.x, b.y = -b.y, b.x += c.x, b.y += c.y, c = a[d] = b;
        return cc.cardinalSplineBy(this._duration, a, this._tension)
    }, updatePosition: function (a) {
        var b = this._startPosition, c = a.x + b.x;
        a = a.y + b.y;
        this._previousPosition.x = c;
        this._previousPosition.y = a;
        this.target.setPosition(c, a)
    }, clone: function () {
        var a = new cc.CardinalSplineBy;
        a.initWithDuration(this._duration, cc.copyControlPoints(this._points), this._tension);
        return a
    }
});
cc.cardinalSplineBy = function (a, b, c) {
    return new cc.CardinalSplineBy(a, b, c)
};
cc.CardinalSplineBy.create = cc.cardinalSplineBy;
cc.CatmullRomTo = cc.CardinalSplineTo.extend({
    ctor: function (a, b) {
        b && this.initWithDuration(a, b)
    }, initWithDuration: function (a, b) {
        return cc.CardinalSplineTo.prototype.initWithDuration.call(this, a, b, 0.5)
    }, clone: function () {
        var a = new cc.CatmullRomTo;
        a.initWithDuration(this._duration, cc.copyControlPoints(this._points));
        return a
    }
});
cc.catmullRomTo = function (a, b) {
    return new cc.CatmullRomTo(a, b)
};
cc.CatmullRomTo.create = cc.catmullRomTo;
cc.CatmullRomBy = cc.CardinalSplineBy.extend({
    ctor: function (a, b) {
        cc.CardinalSplineBy.prototype.ctor.call(this);
        b && this.initWithDuration(a, b)
    }, initWithDuration: function (a, b) {
        return cc.CardinalSplineTo.prototype.initWithDuration.call(this, a, b, 0.5)
    }, clone: function () {
        var a = new cc.CatmullRomBy;
        a.initWithDuration(this._duration, cc.copyControlPoints(this._points));
        return a
    }
});
cc.catmullRomBy = function (a, b) {
    return new cc.CatmullRomBy(a, b)
};
cc.CatmullRomBy.create = cc.catmullRomBy;
cc.ActionTweenDelegate = cc.Class.extend({
    updateTweenAction: function (a, b) {
    }
});
cc.ActionTween = cc.ActionInterval.extend({
    key: "", from: 0, to: 0, delta: 0, ctor: function (a, b, c, d) {
        cc.ActionInterval.prototype.ctor.call(this);
        this.key = "";
        void 0 !== d && this.initWithDuration(a, b, c, d)
    }, initWithDuration: function (a, b, c, d) {
        return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this.key = b, this.to = d, this.from = c, !0) : !1
    }, startWithTarget: function (a) {
        if (!a || !a.updateTweenAction)throw"cc.ActionTween.startWithTarget(): target must be non-null, and target must implement updateTweenAction function";
        cc.ActionInterval.prototype.startWithTarget.call(this, a);
        this.delta = this.to - this.from
    }, update: function (a) {
        this.target.updateTweenAction(this.to - this.delta * (1 - a), this.key)
    }, reverse: function () {
        return new cc.ActionTween(this.duration, this.key, this.to, this.from)
    }, clone: function () {
        var a = new cc.ActionTween;
        a.initWithDuration(this._duration, this.key, this.from, this.to);
        return a
    }
});
cc.actionTween = function (a, b, c, d) {
    return new cc.ActionTween(a, b, c, d)
};
cc.ActionTween.create = cc.actionTween;
cc.LabelAtlas = cc.AtlasNode.extend({
    _string: null,
    _mapStartChar: null,
    _textureLoaded: !1,
    _className: "LabelAtlas",
    ctor: function (a, b, c, d, e) {
        cc.AtlasNode.prototype.ctor.call(this);
        this._renderCmd.setCascade();
        b && cc.LabelAtlas.prototype.initWithString.call(this, a, b, c, d, e)
    },
    _createRenderCmd: function () {
        return cc._renderType === cc._RENDER_TYPE_WEBGL ? new cc.LabelAtlas.WebGLRenderCmd(this) : new cc.LabelAtlas.CanvasRenderCmd(this)
    },
    textureLoaded: function () {
        return this._textureLoaded
    },
    addLoadedEventListener: function (a, b) {
        this.addEventListener("load", a, b)
    },
    initWithString: function (a, b, c, d, e) {
        var f = a + "", g, h;
        if (void 0 === c) {
            c = cc.loader.getRes(b);
            if (1 !== parseInt(c.version, 10))return cc.log("cc.LabelAtlas.initWithString(): Unsupported version. Upgrade cocos2d version"), !1;
            b = cc.path.changeBasename(b, c.textureFilename);
            d = cc.contentScaleFactor();
            g = parseInt(c.itemWidth, 10) / d;
            h = parseInt(c.itemHeight, 10) / d;
            c = String.fromCharCode(parseInt(c.firstChar, 10))
        } else g = c || 0, h = d || 0, c = e || " ";
        var k = null, k = b instanceof cc.Texture2D ? b : cc.textureCache.addImage(b);
        this._textureLoaded = b = k.isLoaded();
        b || (this._string = f, k.addEventListener("load", function (a) {
            this.initWithTexture(k, g, h, f.length);
            this.string = this._string;
            this.setColor(this._renderCmd._displayedColor);
            this.dispatchEvent("load")
        }, this));
        return this.initWithTexture(k, g, h, f.length) ? (this._mapStartChar = c, this.string = f, !0) : !1
    },
    setColor: function (a) {
        cc.AtlasNode.prototype.setColor.call(this, a);
        this._renderCmd.updateAtlasValues()
    },
    getString: function () {
        return this._string
    },
    addChild: function (a, b, c) {
        this._renderCmd._addChild(a);
        cc.Node.prototype.addChild.call(this, a, b, c)
    },
    updateAtlasValues: function () {
        this._renderCmd.updateAtlasValues()
    },
    setString: function (a) {
        a = String(a);
        var b = a.length;
        this._string = a;
        this.setContentSize(b * this._itemWidth, this._itemHeight);
        this._renderCmd.setString(a);
        this._renderCmd.updateAtlasValues();
        this.quadsToDraw = b
    }
});
(function () {
    var a = cc.LabelAtlas.prototype;
    cc.defineGetterSetter(a, "opacity", a.getOpacity, a.setOpacity);
    cc.defineGetterSetter(a, "color", a.getColor, a.setColor);
    cc.defineGetterSetter(a, "string", a.getString, a.setString)
})();
cc.LabelAtlas.create = function (a, b, c, d, e) {
    return new cc.LabelAtlas(a, b, c, d, e)
};
(function () {
    cc.LabelAtlas.CanvasRenderCmd = function (a) {
        cc.AtlasNode.CanvasRenderCmd.call(this, a);
        this._needDraw = !1
    };
    var a = cc.LabelAtlas.CanvasRenderCmd.prototype = Object.create(cc.AtlasNode.CanvasRenderCmd.prototype);
    a.constructor = cc.LabelAtlas.CanvasRenderCmd;
    a.setCascade = function () {
        var a = this._node;
        a._cascadeOpacityEnabled = !0;
        a._cascadeColorEnabled = !1
    };
    a.updateAtlasValues = function () {
        for (var a = this._node, c = a._string || "", d = c.length, e = this._texture, f = a._itemWidth, g = a._itemHeight, h = 0; h < d; h++) {
            var k = c.charCodeAt(h) -
                a._mapStartChar.charCodeAt(0), m = parseInt(k % a._itemsPerRow, 10), k = parseInt(k / a._itemsPerRow, 10), m = cc.rect(m * f, k * g, f, g), k = c.charCodeAt(h), n = a.getChildByTag(h);
            n ? 32 === k ? (n.init(), n.setTextureRect(cc.rect(0, 0, 10, 10), !1, cc.size(0, 0))) : (n.initWithTexture(e, m), n.visible = !0) : (n = new cc.Sprite, 32 === k ? (n.init(), n.setTextureRect(cc.rect(0, 0, 10, 10), !1, cc.size(0, 0))) : n.initWithTexture(e, m), cc.Node.prototype.addChild.call(a, n, 0, h));
            n.setPosition(h * f + f / 2, g / 2)
        }
    };
    a.setString = function (a) {
        a = this._node;
        if (a._children) {
            a = a._children;
            for (var c = a.length, d = 0; d < c; d++) {
                var e = a[d];
                e && !e._lateChild && (e.visible = !1)
            }
        }
    };
    a._addChild = function () {
        child._lateChild = !0
    }
})();
(function () {
    cc.LabelAtlas.WebGLRenderCmd = function (a) {
        cc.AtlasNode.WebGLRenderCmd.call(this, a);
        this._needDraw = !0
    };
    var a = cc.LabelAtlas.WebGLRenderCmd.prototype = Object.create(cc.AtlasNode.WebGLRenderCmd.prototype);
    a.constructor = cc.LabelAtlas.WebGLRenderCmd;
    a.setCascade = function () {
        var a = this._node;
        a._cascadeOpacityEnabled = !0;
        a._cascadeColorEnabled = !0
    };
    a.rendering = function (a) {
        cc.AtlasNode.WebGLRenderCmd.prototype.rendering.call(this, a);
        cc.LABELATLAS_DEBUG_DRAW && (a = this._node.getContentSize(), a = [cc.p(0, 0), cc.p(a.width, 0), cc.p(a.width, a.height), cc.p(0, a.height)], cc._drawingUtil.drawPoly(a, 4, !0))
    };
    a.updateAtlasValues = function () {
        var a = this._node, c = a._string, d = c.length, e = this._textureAtlas, f = e.texture, g = f.pixelsWidth, f = f.pixelsHeight, h = a._itemWidth, k = a._itemHeight;
        a._ignoreContentScaleFactor || (h = a._itemWidth * cc.contentScaleFactor(), k = a._itemHeight * cc.contentScaleFactor());
        d > e.getCapacity() && cc.log("cc.LabelAtlas._updateAtlasValues(): Invalid String length");
        for (var m = e.quads, n = this._displayedColor, n = {
            r: n.r,
            g: n.g,
            b: n.b,
            a: a._displayedOpacity
        }, p = a._itemWidth, s = 0; s < d; s++) {
            var r = c.charCodeAt(s) - a._mapStartChar.charCodeAt(0), u = r % a._itemsPerRow, t = 0 | r / a._itemsPerRow, v;
            cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (u = (2 * u * h + 1) / (2 * g), r = u + (2 * h - 2) / (2 * g), t = (2 * t * k + 1) / (2 * f), v = t + (2 * k - 2) / (2 * f)) : (u = u * h / g, r = u + h / g, t = t * k / f, v = t + k / f);
            var w = m[s], z = w.tl, x = w.tr, y = w.bl, w = w.br;
            z.texCoords.u = u;
            z.texCoords.v = t;
            x.texCoords.u = r;
            x.texCoords.v = t;
            y.texCoords.u = u;
            y.texCoords.v = v;
            w.texCoords.u = r;
            w.texCoords.v = v;
            y.vertices.x = s * p;
            y.vertices.y = 0;
            y.vertices.z = 0;
            w.vertices.x = s * p + p;
            w.vertices.y = 0;
            w.vertices.z = 0;
            z.vertices.x = s * p;
            z.vertices.y = a._itemHeight;
            z.vertices.z = 0;
            x.vertices.x = s * p + p;
            x.vertices.y = a._itemHeight;
            x.vertices.z = 0;
            z.colors = n;
            x.colors = n;
            y.colors = n;
            w.colors = n
        }
        0 < d && (e.dirty = !0, a = e.totalQuads, d > a && e.increaseTotalQuadsWith(d - a))
    };
    a.setString = function (a) {
        a = a.length;
        a > this._textureAtlas.totalQuads && this._textureAtlas.resizeCapacity(a)
    };
    a._addChild = function () {
    }
})();
cc.LABEL_AUTOMATIC_WIDTH = -1;
cc.LabelBMFont = cc.SpriteBatchNode.extend({
    _opacityModifyRGB: !1,
    _string: "",
    _config: null,
    _fntFile: "",
    _initialString: "",
    _alignment: cc.TEXT_ALIGNMENT_CENTER,
    _width: -1,
    _lineBreakWithoutSpaces: !1,
    _imageOffset: null,
    _reusedChar: null,
    _textureLoaded: !1,
    _className: "LabelBMFont",
    _createRenderCmd: function () {
        return cc._renderType === cc._RENDER_TYPE_WEBGL ? new cc.LabelBMFont.WebGLRenderCmd(this) : new cc.LabelBMFont.CanvasRenderCmd(this)
    },
    _setString: function (a, b) {
        b ? this._initialString = a : this._string = a;
        var c = this._children;
        if (c)
            for (var d = 0; d < c.length; d++) {
                var e = c[d];
                e && e.setVisible(!1)
            }
        this._textureLoaded && (this.createFontChars(), b && this.updateLabel())
    },
    ctor: function (a, b, c, d, e) {
        cc.SpriteBatchNode.prototype.ctor.call(this);
        this._imageOffset = cc.p(0, 0);
        this._reusedChar = [];
        this._cascadeOpacityEnabled = this._cascadeColorEnabled = !0;
        this.initWithString(a, b, c, d, e)
    },
    textureLoaded: function () {
        return this._textureLoaded
    },
    addLoadedEventListener: function (a, b) {
        this.addEventListener("load", a, b)
    },
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB
    },
    setOpacityModifyRGB: function (a) {
        this._opacityModifyRGB = a;
        if (a = this._children)
            for (var b = 0; b < a.length; b++) {
                var c = a[b];
                c && (c.opacityModifyRGB = this._opacityModifyRGB)
            }
    },
    _changeTextureColor: function () {
        this._renderCmd._changeTextureColor()
    },
    init: function () {
        return this.initWithString(null, null, null, null, null)
    },
    initWithString: function (a, b, c, d, e) {
        a = a || "";
        this._config && cc.log("cc.LabelBMFont.initWithString(): re-init is no longer supported");
        if (b) {
            var f = cc.loader.getRes(b);
            if (!f)return cc.log("cc.LabelBMFont.initWithString(): Impossible to create font. Please check file"), !1;
            this._config = f;
            this._fntFile = b;
            b = cc.textureCache.addImage(f.atlasName);
            (this._textureLoaded = f = b.isLoaded()) || b.addEventListener("load", function (a) {
                this._textureLoaded = !0;
                this.initWithTexture(a, this._initialString.length);
                this.setString(this._initialString, !0);
                this.dispatchEvent("load")
            }, this)
        } else b = new cc.Texture2D, f = new Image, b.initWithElement(f), this._textureLoaded = !1;
        return this.initWithTexture(b, a.length) ? (this._alignment = d || cc.TEXT_ALIGNMENT_LEFT, this._imageOffset = e || cc.p(0, 0), this._width = null == c ? -1 : c, this._realOpacity = 255, this._realColor = cc.color(255, 255, 255, 255), this._contentSize.width = 0, this._contentSize.height = 0, this.setAnchorPoint(0.5, 0.5), this._renderCmd._initBatchTexture(), this.setString(a, !0), !0) : !1
    },
    createFontChars: function () {
        var a = this._renderCmd._texture || this.textureAtlas.texture, b = 0, c = cc.size(0, 0), d = 0, e = 1, f = this._string, g = f ? f.length : 0;
        if (0 !== g) {
            var h, k = this._config, m = k.kerningDict, n = k.commonHeight, p = k.fontDefDictionary;
            for (h = 0; h < g - 1; h++)10 === f.charCodeAt(h) && e++;
            var s = n * e, e = -(n - n * e), r = -1;
            for (h = 0; h < g; h++)
                if (n = f.charCodeAt(h), 0 !== n)
                    if (10 === n)b = 0, e -= k.commonHeight; else {
                        var u = m[r << 16 | n & 65535] || 0, t = p[n];
                        if (t) {
                            var v = cc.rect(t.rect.x, t.rect.y, t.rect.width, t.rect.height), v = cc.rectPixelsToPoints(v);
                            v.x += this._imageOffset.x;
                            v.y += this._imageOffset.y;
                            (r = this.getChildByTag(h)) ? this._renderCmd._updateCharTexture(r, v, n) : (r = new cc.Sprite, r.initWithTexture(a, v, !1), r._newTextureWhenChangeColor = !0, this.addChild(r, 0, h));
                            r.opacityModifyRGB = this._opacityModifyRGB;
                            this._renderCmd._updateCharColorAndOpacity(r);
                            v = cc.p(b + t.xOffset + 0.5 * t.rect.width + u, e + (k.commonHeight - t.yOffset) - 0.5 * v.height * cc.contentScaleFactor());
                            r.setPosition(cc.pointPixelsToPoints(v));
                            b += t.xAdvance + u;
                            r = n;
                            d < b && (d = b)
                        } else cc.log("cocos2d: LabelBMFont: character not found " + f[h])
                    }
            c.width = t && t.xAdvance < t.rect.width ? d - t.xAdvance + t.rect.width : d;
            c.height = s;
            this.setContentSize(cc.sizePixelsToPoints(c))
        }
    },
    updateString: function (a) {
        var b = this._children;
        if (b)
            for (var c = 0, d = b.length; c < d; c++) {
                var e = b[c];
                e && (e.visible = !1)
            }
        this._config && this.createFontChars();
        a || this.updateLabel()
    },
    getString: function () {
        return this._initialString
    },
    setString: function (a, b) {
        a = String(a);
        null == b && (b = !0);
        null != a && cc.isString(a) || (a += "");
        this._initialString = a;
        this._setString(a, b)
    },
    _setStringForSetter: function (a) {
        this.setString(a, !1)
    },
    setCString: function (a) {
        this.setString(a, !0)
    },
    _getCharsWidth: function (a, b) {
        if (0 >= b)return 0;
        var c = this.getChildByTag(a), d = this.getChildByTag(a + b);
        return this._getLetterPosXLeft(d) - this._getLetterPosXLeft(c)
    },
    _checkWarp: function (a, b, c, d) {
        for (var e = a[b], f = 0, g = 0; g < b; g++)f += a[g].length;
        var f = f + b - d, h = this._getCharsWidth(f, a[b].length - 1);
        if (h > c && 1 < e.length) {
            d = c / h * e.length | 0;
            for (var g = e.substr(d), k = h - this._getCharsWidth(f + d, g.length - 1), m, n = 0, p = 0; k > c && 100 > p++;)d *= c / k, d |= 0, g = e.substr(d), k = h - this._getCharsWidth(f + d, g.length - 1);
            for (p = 0; k < c && 100 > p++;)g && (n = (m = cc.LabelTTF._wordRex.exec(g)) ? m[0].length : 1, m = g), this._lineBreakWithoutSpaces && (n = 0), d += n, g = e.substr(d), k = h - this._getCharsWidth(f + d, g.length - 1);
            d -= n;
            0 === d && (d = 1, m = m.substr(1));
            c = e.substr(0, d);
            cc.LabelTTF.wrapInspection && cc.LabelTTF._symbolRex.test(m || g) && (n = (f = cc.LabelTTF._lastWordRex.exec(c)) ? f[0].length : 0, this._lineBreakWithoutSpaces && (n = 0), d -= n, m = e.substr(d), c = e.substr(0, d));
            cc.LabelTTF._firsrEnglish.test(m) && (f = cc.LabelTTF._lastEnglish.exec(c)) && c !== f[0] && (n = f[0].length, this._lineBreakWithoutSpaces && (n = 0), d -= n, m = e.substr(d), c = e.substr(0, d));
            a[b] = m || g;
            a.splice(b, 0, c)
        }
    },
    updateLabel: function () {
        this.string = this._initialString;
        var a, b, c;
        if (0 < this._width) {
            var d = this.string.split("\n"), e = "", f = 0, g = 0;
            for (a = 0; a < d.length; a++)g = d.length, this._checkWarp(d, a, this._width * this._scaleX, f), g < d.length && f++, 0 < a && (e += "\n"), e += d[a];
            e += String.fromCharCode(0);
            this._setString(e, !1)
        }
        if (this._alignment !== cc.TEXT_ALIGNMENT_LEFT)
            for (d = a = 0, e = this._string.length, f = [], g = 0; g < e; g++)
                if (10 === this._string[g].charCodeAt(0) || 0 === this._string[g].charCodeAt(0)) {
                    b = 0;
                    var h = f.length;
                    if (0 === h)d++; else if (c = a + h - 1 + d, !(0 > c)) {
                        var k = this.getChildByTag(c);
                        if (null != k) {
                            b = k.getPositionX() + k._getWidth() / 2;
                            k = 0;
                            switch (this._alignment) {
                                case cc.TEXT_ALIGNMENT_CENTER:
                                    k = this.width / 2 - b / 2;
                                    break;
                                case cc.TEXT_ALIGNMENT_RIGHT:
                                    k = this.width - b
                            }
                            if (0 !== k)
                                for (b = 0; b < h; b++)c = a + b + d, 0 > c || (c = this.getChildByTag(c)) && (c.x += k);
                            a += h;
                            d++;
                            f.length = 0
                        }
                    }
                } else f.push(this._string[a])
    },
    setAlignment: function (a) {
        this._alignment = a;
        this.updateLabel()
    },
    _getAlignment: function () {
        return this._alignment
    },
    setBoundingWidth: function (a) {
        this._width = a;
        this.updateLabel()
    },
    _getBoundingWidth: function () {
        return this._width
    },
    setLineBreakWithoutSpace: function (a) {
        this._lineBreakWithoutSpaces = a;
        this.updateLabel()
    },
    setScale: function (a, b) {
        cc.Node.prototype.setScale.call(this, a, b);
        this.updateLabel()
    },
    setScaleX: function (a) {
        cc.Node.prototype.setScaleX.call(this, a);
        this.updateLabel()
    },
    setScaleY: function (a) {
        cc.Node.prototype.setScaleY.call(this, a);
        this.updateLabel()
    },
    setFntFile: function (a) {
        if (null != a && a !== this._fntFile) {
            var b = cc.loader.getRes(a);
            b ? (this._fntFile = a, this._config = b, a = cc.textureCache.addImage(b.atlasName), this._textureLoaded = b = a.isLoaded(), this.texture = a, this._renderCmd._updateFntFileTexture(), b ? this.createFontChars() : a.addEventListener("load", function (a) {
                this._textureLoaded = !0;
                this.texture = a;
                this.createFontChars();
                this._changeTextureColor();
                this.updateLabel();
                this.dispatchEvent("load")
            }, this)) : cc.log("cc.LabelBMFont.setFntFile() : Impossible to create font. Please check file")
        }
    },
    getFntFile: function () {
        return this._fntFile
    },
    setTexture: function (a) {
        this._renderCmd.setTexture(a)
    },
    setAnchorPoint: function (a, b) {
        cc.Node.prototype.setAnchorPoint.call(this, a, b);
        this.updateLabel()
    },
    _setAnchorX: function (a) {
        cc.Node.prototype._setAnchorX.call(this, a);
        this.updateLabel()
    },
    _setAnchorY: function (a) {
        cc.Node.prototype._setAnchorY.call(this, a);
        this.updateLabel()
    },
    _atlasNameFromFntFile: function (a) {
    },
    _kerningAmountForFirst: function (a, b) {
        var c = 0;
        if (this._configuration.kerningDictionary) {
            var d = this._configuration.kerningDictionary[(a << 16 | b & 65535).toString()];
            d && (c = d.amount)
        }
        return c
    },
    _getLetterPosXLeft: function (a) {
        return a.getPositionX() * this._scaleX - a._getWidth() * this._scaleX * a._getAnchorX()
    },
    _getLetterPosXRight: function (a) {
        return a.getPositionX() * this._scaleX +
            a._getWidth() * this._scaleX * a._getAnchorX()
    },
    _isspace_unicode: function (a) {
        a = a.charCodeAt(0);
        return 9 <= a && 13 >= a || 32 === a || 133 === a || 160 === a || 5760 === a || 8192 <= a && 8202 >= a || 8232 === a || 8233 === a || 8239 === a || 8287 === a || 12288 === a
    },
    _utf8_trim_ws: function (a) {
        var b = a.length;
        if (!(0 >= b) && (b -= 1, this._isspace_unicode(a[b]))) {
            for (var c = b - 1; 0 <= c; --c)
                if (this._isspace_unicode(a[c]))b = c; else break;
            this._utf8_trim_from(a, b)
        }
    },
    _utf8_trim_from: function (a, b) {
        var c = a.length;
        b >= c || 0 > b || a.splice(b, c)
    }
});
(function () {
    var a = cc.LabelBMFont.prototype;
    cc.EventHelper.prototype.apply(a);
    cc.defineGetterSetter(a, "string", a.getString, a._setStringForSetter);
    cc.defineGetterSetter(a, "boundingWidth", a._getBoundingWidth, a.setBoundingWidth);
    cc.defineGetterSetter(a, "textAlign", a._getAlignment, a.setAlignment)
})();
cc.LabelBMFont.create = function (a, b, c, d, e) {
    return new cc.LabelBMFont(a, b, c, d, e)
};
cc._fntLoader = {
    INFO_EXP: /info [^\n]*(\n|$)/gi,
    COMMON_EXP: /common [^\n]*(\n|$)/gi,
    PAGE_EXP: /page [^\n]*(\n|$)/gi,
    CHAR_EXP: /char [^\n]*(\n|$)/gi,
    KERNING_EXP: /kerning [^\n]*(\n|$)/gi,
    ITEM_EXP: /\w+=[^ \r\n]+/gi,
    INT_EXP: /^[\-]?\d+$/,
    _parseStrToObj: function (a) {
        a = a.match(this.ITEM_EXP);
        var b = {};
        if (a)
            for (var c = 0, d = a.length; c < d; c++) {
                var e = a[c], f = e.indexOf("\x3d"), g = e.substring(0, f), e = e.substring(f + 1);
                e.match(this.INT_EXP) ? e = parseInt(e) : '"' === e[0] && (e = e.substring(1, e.length - 1));
                b[g] = e
            }
        return b
    },
    parseFnt: function (a, b) {
        var c = {}, d = this._parseStrToObj(a.match(this.INFO_EXP)[0]).padding.split(",");
        parseInt(d[0]);
        parseInt(d[1]);
        parseInt(d[2]);
        parseInt(d[3]);
        d = this._parseStrToObj(a.match(this.COMMON_EXP)[0]);
        c.commonHeight = d.lineHeight;
        if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
            var e = cc.configuration.getMaxTextureSize();
            (d.scaleW > e.width || d.scaleH > e.height) && cc.log("cc.LabelBMFont._parseCommonArguments(): page can't be larger than supported")
        }
        1 !== d.pages && cc.log("cc.LabelBMFont._parseCommonArguments(): only supports 1 page");
        d = this._parseStrToObj(a.match(this.PAGE_EXP)[0]);
        0 !== d.id && cc.log("cc.LabelBMFont._parseImageFileName() : file could not be found");
        c.atlasName = cc.path.changeBasename(b, d.file);
        for (var f = a.match(this.CHAR_EXP), g = c.fontDefDictionary = {}, d = 0, e = f.length; d < e; d++) {
            var h = this._parseStrToObj(f[d]);
            g[h.id] = {
                rect: {x: h.x, y: h.y, width: h.width, height: h.height},
                xOffset: h.xoffset,
                yOffset: h.yoffset,
                xAdvance: h.xadvance
            }
        }
        f = c.kerningDict = {};
        if (g = a.match(this.KERNING_EXP))
            for (d = 0, e = g.length; d < e; d++)h = this._parseStrToObj(g[d]), f[h.first << 16 | h.second & 65535] = h.amount;
        return c
    },
    load: function (a, b, c, d) {
        var e = this;
        cc.loader.loadTxt(a, function (a, c) {
            if (a)return d(a);
            d(null, e.parseFnt(c, b))
        })
    }
};
cc.loader.register(["fnt"], cc._fntLoader);
(function () {
    cc.LabelBMFont.CanvasRenderCmd = function (a) {
        cc.SpriteBatchNode.CanvasRenderCmd.call(this, a);
        this._needDraw = !0
    };
    var a = cc.LabelBMFont.CanvasRenderCmd.prototype = Object.create(cc.SpriteBatchNode.CanvasRenderCmd.prototype);
    a.constructor = cc.LabelBMFont.CanvasRenderCmd;
    a.rendering = function () {
        void 0
    };
    a._updateCharTexture = function (a, c, d) {
        32 === d ? a.setTextureRect(c, !1, cc.size(0, 0)) : (a.setTextureRect(c, !1), a.visible = !0)
    };
    a._updateCharColorAndOpacity = function (a) {
        a._displayedColor = this._displayedColor;
        a._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.colorDirty);
        a._displayedOpacity = this._displayedOpacity;
        a._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.opacityDirty)
    };
    a._updateFntFileTexture = function () {
        var a = this._node;
        a._originalTexture = a.texture
    };
    a.setTexture = function (a) {
        for (var c = this._node._children, d = this._displayedColor, e = 0; e < c.length; e++) {
            var f = c[e], g = f._renderCmd, h = g._displayedColor;
            if (this._texture === g._texture || h.r === d.r && h.g === d.g && h.b === d.b)f.texture = a
        }
        this._texture = a
    };
    a._changeTextureColor = cc.sys._supportCanvasNewBlendModes ? function () {
        var a = this._node, c = a.getTexture();
        if (c && 0 < c.getContentSize().width) {
            var d = this._originalTexture.getHtmlElementObj();
            if (d) {
                var e = c.getHtmlElementObj(), f = cc.rect(0, 0, d.width, d.height);
                e instanceof HTMLCanvasElement && !a._rectRotated ? cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(d, this._displayedColor, f, e) : (e = cc.Sprite.CanvasRenderCmd._generateTintImageWithMultiply(d, this._displayedColor, f), c = new cc.Texture2D, c.initWithElement(e), c.handleLoadedTexture());
                a.setTexture(c)
            }
        }
    } : function () {
        var a = this._node, c, d = a.getTexture();
        if (d && 0 < d.getContentSize().width && (c = d.getHtmlElementObj())) {
            var e = cc.textureCache.getTextureColors(this._originalTexture.getHtmlElementObj());
            e && (c instanceof HTMLCanvasElement && !this._rectRotated ? (cc.Sprite.CanvasRenderCmd._generateTintImage(c, e, this._displayedColor, null, c), this.setTexture(d)) : (c = cc.Sprite.CanvasRenderCmd._generateTintImage(c, e, this._displayedColor), d = new cc.Texture2D, d.initWithElement(c), d.handleLoadedTexture(), a.setTexture(d)))
        }
    };
    a._updateChildrenDisplayedOpacity = function (a) {
        cc.Node.prototype.updateDisplayedOpacity.call(a, this._displayedOpacity)
    };
    a._updateChildrenDisplayedColor = function (a) {
        cc.Node.prototype.updateDisplayedColor.call(a, this._displayedColor)
    };
    a._initBatchTexture = function () {
    }
})();
(function () {
    cc.LabelBMFont.WebGLRenderCmd = function (a) {
        cc.SpriteBatchNode.WebGLRenderCmd.call(this, a);
        this._needDraw = !0
    };
    var a = cc.LabelBMFont.WebGLRenderCmd.prototype = Object.create(cc.SpriteBatchNode.WebGLRenderCmd.prototype);
    a.constructor = cc.LabelBMFont.WebGLRenderCmd;
    a._updateCharTexture = function (a, c, d) {
        a.setTextureRect(c, !1);
        a.visible = !0
    };
    a._updateFntFileTexture = function () {
    };
    a._changeTextureColor = function () {
    };
    a._updateChildrenDisplayedOpacity = function (a) {
        a.updateDisplayedOpacity(this._displayedOpacity)
    };
    a._updateChildrenDisplayedColor = function (a) {
        a.updateDisplayedColor(this._displayedColor)
    };
    a._initBatchTexture = function () {
        var a = this._node, c = a.textureAtlas.texture;
        a._opacityModifyRGB = c.hasPremultipliedAlpha();
        var d = a._reusedChar = new cc.Sprite;
        d.initWithTexture(c, cc.rect(0, 0, 0, 0), !1);
        d.batchNode = a
    };
    a.rendering = function (a) {
        cc.SpriteBatchNode.WebGLRenderCmd.prototype.rendering.call(this, a);
        a = this._node;
        if (cc.LABELBMFONT_DEBUG_DRAW) {
            a = a.getContentSize();
            var c = cc.p(0 | -this._anchorPointInPoints.x, 0 | -this._anchorPointInPoints.y);
            a = [cc.p(c.x, c.y), cc.p(c.x + a.width, c.y), cc.p(c.x + a.width, c.y + a.height), cc.p(c.x, c.y + a.height)];
            cc._drawingUtil.setDrawColor(0, 255, 0, 255);
            cc._drawingUtil.drawPoly(a, 4, !0)
        }
    };
    a._updateCharColorAndOpacity = function () {
    }
})();
cc._globalFontSize = cc.ITEM_SIZE;
cc._globalFontName = "Arial";
cc._globalFontNameRelease = !1;
cc.MenuItem = cc.Node.extend({
    _enabled: !1, _target: null, _callback: null, _isSelected: !1, _className: "MenuItem", ctor: function (a, b) {
        var c = cc.Node.prototype;
        c.ctor.call(this);
        this._callback = this._target = null;
        this._enabled = this._isSelected = !1;
        c.setAnchorPoint.call(this, 0.5, 0.5);
        this._target = b || null;
        if (this._callback = a || null)this._enabled = !0
    }, isSelected: function () {
        return this._isSelected
    }, setOpacityModifyRGB: function (a) {
    }, isOpacityModifyRGB: function () {
        return !1
    }, setTarget: function (a, b) {
        this._target = b;
        this._callback = a
    }, isEnabled: function () {
        return this._enabled
    }, setEnabled: function (a) {
        this._enabled = a
    }, initWithCallback: function (a, b) {
        this.anchorY = this.anchorX = 0.5;
        this._target = b;
        this._callback = a;
        this._enabled = !0;
        this._isSelected = !1;
        return !0
    }, rect: function () {
        var a = this._position, b = this._contentSize, c = this._anchorPoint;
        return cc.rect(a.x - b.width * c.x, a.y - b.height * c.y, b.width, b.height)
    }, selected: function () {
        this._isSelected = !0
    }, unselected: function () {
        this._isSelected = !1
    }, setCallback: function (a, b) {
        this._target = b;
        this._callback = a
    }, activate: function () {
        if (this._enabled) {
            var a = this._target, b = this._callback;
            if (b)
                if (a && cc.isString(b))a[b](this); else a && cc.isFunction(b) ? b.call(a, this) : b(this)
        }
    }
});
_p = cc.MenuItem.prototype;
cc.defineGetterSetter(_p, "enabled", _p.isEnabled, _p.setEnabled);
cc.MenuItem.create = function (a, b) {
    return new cc.MenuItem(a, b)
};
cc.MenuItemLabel = cc.MenuItem.extend({
    _disabledColor: null, _label: null, _originalScale: 0, _colorBackup: null, ctor: function (a, b, c) {
        cc.MenuItem.prototype.ctor.call(this, b, c);
        this._colorBackup = this._label = this._disabledColor = null;
        a && (this._originalScale = 1, this._colorBackup = cc.color.WHITE, this._disabledColor = cc.color(126, 126, 126), this.setLabel(a), this.cascadeOpacity = this.cascadeColor = !0)
    }, getDisabledColor: function () {
        return this._disabledColor
    }, setDisabledColor: function (a) {
        this._disabledColor = a
    }, getLabel: function () {
        return this._label
    }, setLabel: function (a) {
        a && (this.addChild(a), a.anchorX = 0, a.anchorY = 0, this.width = a.width, this.height = a.height);
        this._label && this.removeChild(this._label, !0);
        this._label = a
    }, setEnabled: function (a) {
        if (this._enabled !== a) {
            var b = this._label;
            a ? b.color = this._colorBackup : (this._colorBackup = b.color, b.color = this._disabledColor)
        }
        cc.MenuItem.prototype.setEnabled.call(this, a)
    }, setOpacity: function (a) {
        this._label.opacity = a
    }, getOpacity: function () {
        return this._label.opacity
    }, setColor: function (a) {
        this._label.color = a
    }, getColor: function () {
        return this._label.color
    }, initWithLabel: function (a, b, c) {
        this.initWithCallback(b, c);
        this._originalScale = 1;
        this._colorBackup = cc.color.WHITE;
        this._disabledColor = cc.color(126, 126, 126);
        this.setLabel(a);
        return this.cascadeOpacity = this.cascadeColor = !0
    }, setString: function (a) {
        this._label.string = a;
        this.width = this._label.width;
        this.height = this._label.height
    }, getString: function () {
        return this._label.string
    }, activate: function () {
        this._enabled && (this.stopAllActions(), this.scale = this._originalScale, cc.MenuItem.prototype.activate.call(this))
    }, selected: function () {
        if (this._enabled) {
            cc.MenuItem.prototype.selected.call(this);
            var a = this.getActionByTag(cc.ZOOM_ACTION_TAG);
            a ? this.stopAction(a) : this._originalScale = this.scale;
            a = cc.scaleTo(0.1, 1.2 * this._originalScale);
            a.setTag(cc.ZOOM_ACTION_TAG);
            this.runAction(a)
        }
    }, unselected: function () {
        if (this._enabled) {
            cc.MenuItem.prototype.unselected.call(this);
            this.stopActionByTag(cc.ZOOM_ACTION_TAG);
            var a = cc.scaleTo(0.1, this._originalScale);
            a.setTag(cc.ZOOM_ACTION_TAG);
            this.runAction(a)
        }
    }
});
_p = cc.MenuItemLabel.prototype;
cc.defineGetterSetter(_p, "string", _p.getString, _p.setString);
cc.defineGetterSetter(_p, "disabledColor", _p.getDisabledColor, _p.setDisabledColor);
cc.defineGetterSetter(_p, "label", _p.getLabel, _p.setLabel);
cc.MenuItemLabel.create = function (a, b, c) {
    return new cc.MenuItemLabel(a, b, c)
};
cc.MenuItemAtlasFont = cc.MenuItemLabel.extend({
    ctor: function (a, b, c, d, e, f, g) {
        var h;
        a && 0 < a.length && (h = new cc.LabelAtlas(a, b, c, d, e));
        cc.MenuItemLabel.prototype.ctor.call(this, h, f, g)
    }, initWithString: function (a, b, c, d, e, f, g) {
        if (!a || 0 === a.length)throw"cc.MenuItemAtlasFont.initWithString(): value should be non-null and its length should be greater than 0";
        var h = new cc.LabelAtlas;
        h.initWithString(a, b, c, d, e);
        this.initWithLabel(h, f, g);
        return !0
    }
});
cc.MenuItemAtlasFont.create = function (a, b, c, d, e, f, g) {
    return new cc.MenuItemAtlasFont(a, b, c, d, e, f, g)
};
cc.MenuItemFont = cc.MenuItemLabel.extend({
    _fontSize: null, _fontName: null, ctor: function (a, b, c) {
        var d;
        a && 0 < a.length ? (this._fontName = cc._globalFontName, this._fontSize = cc._globalFontSize, d = new cc.LabelTTF(a, this._fontName, this._fontSize)) : (this._fontSize = 0, this._fontName = "");
        cc.MenuItemLabel.prototype.ctor.call(this, d, b, c)
    }, initWithString: function (a, b, c) {
        if (!a || 0 === a.length)throw"Value should be non-null and its length should be greater than 0";
        this._fontName = cc._globalFontName;
        this._fontSize = cc._globalFontSize;
        a = new cc.LabelTTF(a, this._fontName, this._fontSize);
        this.initWithLabel(a, b, c);
        return !0
    }, setFontSize: function (a) {
        this._fontSize = a;
        this._recreateLabel()
    }, getFontSize: function () {
        return this._fontSize
    }, setFontName: function (a) {
        this._fontName = a;
        this._recreateLabel()
    }, getFontName: function () {
        return this._fontName
    }, _recreateLabel: function () {
        var a = new cc.LabelTTF(this._label.string, this._fontName, this._fontSize);
        this.setLabel(a)
    }
});
cc.MenuItemFont.setFontSize = function (a) {
    cc._globalFontSize = a
};
cc.MenuItemFont.fontSize = function () {
    return cc._globalFontSize
};
cc.MenuItemFont.setFontName = function (a) {
    cc._globalFontNameRelease && (cc._globalFontName = "");
    cc._globalFontName = a;
    cc._globalFontNameRelease = !0
};
_p = cc.MenuItemFont.prototype;
cc.defineGetterSetter(_p, "fontSize", _p.getFontSize, _p.setFontSize);
cc.defineGetterSetter(_p, "fontName", _p.getFontName, _p.setFontName);
cc.MenuItemFont.fontName = function () {
    return cc._globalFontName
};
cc.MenuItemFont.create = function (a, b, c) {
    return new cc.MenuItemFont(a, b, c)
};
cc.MenuItemSprite = cc.MenuItem.extend({
    _normalImage: null,
    _selectedImage: null,
    _disabledImage: null,
    ctor: function (a, b, c, d, e) {
        cc.MenuItem.prototype.ctor.call(this);
        this._disabledImage = this._selectedImage = this._normalImage = null;
        if (void 0 !== b) {
            var f, g, h;
            void 0 !== e ? (f = c, h = d, g = e) : void 0 !== d && cc.isFunction(d) ? (f = c, h = d) : void 0 !== d && cc.isFunction(c) ? (g = d, h = c, f = null) : void 0 === c && (f = null);
            this.initWithNormalSprite(a, b, f, h, g)
        }
    },
    getNormalImage: function () {
        return this._normalImage
    },
    setNormalImage: function (a) {
        this._normalImage !== a && (a && (this.addChild(a, 0, cc.NORMAL_TAG), a.anchorX = 0, a.anchorY = 0), this._normalImage && this.removeChild(this._normalImage, !0), this._normalImage = a, this.width = this._normalImage.width, this.height = this._normalImage.height, this._updateImagesVisibility(), a.textureLoaded && !a.textureLoaded() && a.addEventListener("load", function (a) {
            this.width = a.width;
            this.height = a.height
        }, this))
    },
    getSelectedImage: function () {
        return this._selectedImage
    },
    setSelectedImage: function (a) {
        this._selectedImage !== a && (a && (this.addChild(a, 0, cc.SELECTED_TAG), a.anchorX = 0, a.anchorY = 0), this._selectedImage && this.removeChild(this._selectedImage, !0), this._selectedImage = a, this._updateImagesVisibility())
    },
    getDisabledImage: function () {
        return this._disabledImage
    },
    setDisabledImage: function (a) {
        this._disabledImage !== a && (a && (this.addChild(a, 0, cc.DISABLE_TAG), a.anchorX = 0, a.anchorY = 0), this._disabledImage && this.removeChild(this._disabledImage, !0), this._disabledImage = a, this._updateImagesVisibility())
    },
    initWithNormalSprite: function (a, b, c, d, e) {
        this.initWithCallback(d, e);
        this.setNormalImage(a);
        this.setSelectedImage(b);
        this.setDisabledImage(c);
        if (a = this._normalImage)this.width = a.width, this.height = a.height, a.textureLoaded && !a.textureLoaded() && a.addEventListener("load", function (a) {
            this.width = a.width;
            this.height = a.height;
            this.cascadeOpacity = this.cascadeColor = !0
        }, this);
        return this.cascadeOpacity = this.cascadeColor = !0
    },
    setColor: function (a) {
        this._normalImage.color = a;
        this._selectedImage && (this._selectedImage.color = a);
        this._disabledImage && (this._disabledImage.color = a)
    },
    getColor: function () {
        return this._normalImage.color
    },
    setOpacity: function (a) {
        this._normalImage.opacity = a;
        this._selectedImage && (this._selectedImage.opacity = a);
        this._disabledImage && (this._disabledImage.opacity = a)
    },
    getOpacity: function () {
        return this._normalImage.opacity
    },
    selected: function () {
        cc.MenuItem.prototype.selected.call(this);
        this._normalImage && (this._disabledImage && (this._disabledImage.visible = !1), this._selectedImage ? (this._normalImage.visible = !1, this._selectedImage.visible = !0) : this._normalImage.visible = !0)
    },
    unselected: function () {
        cc.MenuItem.prototype.unselected.call(this);
        this._normalImage && (this._normalImage.visible = !0, this._selectedImage && (this._selectedImage.visible = !1), this._disabledImage && (this._disabledImage.visible = !1))
    },
    setEnabled: function (a) {
        this._enabled !== a && (cc.MenuItem.prototype.setEnabled.call(this, a), this._updateImagesVisibility())
    },
    _updateImagesVisibility: function () {
        var a = this._normalImage, b = this._selectedImage, c = this._disabledImage;
        this._enabled ? (a && (a.visible = !0), b && (b.visible = !1), c && (c.visible = !1)) : c ? (a && (a.visible = !1), b && (b.visible = !1), c && (c.visible = !0)) : (a && (a.visible = !0), b && (b.visible = !1))
    }
});
_p = cc.MenuItemSprite.prototype;
cc.defineGetterSetter(_p, "normalImage", _p.getNormalImage, _p.setNormalImage);
cc.defineGetterSetter(_p, "selectedImage", _p.getSelectedImage, _p.setSelectedImage);
cc.defineGetterSetter(_p, "disabledImage", _p.getDisabledImage, _p.setDisabledImage);
cc.MenuItemSprite.create = function (a, b, c, d, e) {
    return new cc.MenuItemSprite(a, b, c, d, e || void 0)
};
cc.MenuItemImage = cc.MenuItemSprite.extend({
    ctor: function (a, b, c, d, e) {
        var f = null, g = null, h = null, k = null, m = null;
        void 0 === a ? cc.MenuItemSprite.prototype.ctor.call(this) : (f = new cc.Sprite(a), b && (g = new cc.Sprite(b)), void 0 === d ? k = c : void 0 === e ? (k = c, m = d) : e && (h = new cc.Sprite(c), k = d, m = e), cc.MenuItemSprite.prototype.ctor.call(this, f, g, h, k, m))
    }, setNormalSpriteFrame: function (a) {
        this.setNormalImage(new cc.Sprite(a))
    }, setSelectedSpriteFrame: function (a) {
        this.setSelectedImage(new cc.Sprite(a))
    }, setDisabledSpriteFrame: function (a) {
        this.setDisabledImage(new cc.Sprite(a))
    }, initWithNormalImage: function (a, b, c, d, e) {
        var f = null, g = null, h = null;
        a && (f = new cc.Sprite(a));
        b && (g = new cc.Sprite(b));
        c && (h = new cc.Sprite(c));
        return this.initWithNormalSprite(f, g, h, d, e)
    }
});
cc.MenuItemImage.create = function (a, b, c, d, e) {
    return new cc.MenuItemImage(a, b, c, d, e)
};
cc.MenuItemToggle = cc.MenuItem.extend({
    subItems: null, _selectedIndex: 0, _opacity: null, _color: null, ctor: function () {
        cc.MenuItem.prototype.ctor.call(this);
        this._selectedIndex = 0;
        this.subItems = [];
        this._opacity = 0;
        this._color = cc.color.WHITE;
        0 < arguments.length && this.initWithItems(Array.prototype.slice.apply(arguments))
    }, getOpacity: function () {
        return this._opacity
    }, setOpacity: function (a) {
        this._opacity = a;
        if (this.subItems && 0 < this.subItems.length)
            for (var b = 0; b < this.subItems.length; b++)this.subItems[b].opacity = a;
        this._color.a = a
    }, getColor: function () {
        var a = this._color;
        return cc.color(a.r, a.g, a.b, a.a)
    }, setColor: function (a) {
        var b = this._color;
        b.r = a.r;
        b.g = a.g;
        b.b = a.b;
        if (this.subItems && 0 < this.subItems.length)
            for (b = 0; b < this.subItems.length; b++)this.subItems[b].setColor(a);
        void 0 === a.a || a.a_undefined || this.setOpacity(a.a)
    }, getSelectedIndex: function () {
        return this._selectedIndex
    }, setSelectedIndex: function (a) {
        if (a !== this._selectedIndex) {
            this._selectedIndex = a;
            (a = this.getChildByTag(cc.CURRENT_ITEM)) && a.removeFromParent(!1);
            a = this.subItems[this._selectedIndex];
            this.addChild(a, 0, cc.CURRENT_ITEM);
            var b = a.width, c = a.height;
            this.width = b;
            this.height = c;
            a.setPosition(b / 2, c / 2)
        }
    }, getSubItems: function () {
        return this.subItems
    }, setSubItems: function (a) {
        this.subItems = a
    }, initWithItems: function (a) {
        var b = a.length;
        cc.isFunction(a[a.length - 2]) ? (this.initWithCallback(a[a.length - 2], a[a.length - 1]), b -= 2) : cc.isFunction(a[a.length - 1]) ? (this.initWithCallback(a[a.length - 1], null), b -= 1) : this.initWithCallback(null, null);
        for (var c = this.subItems, d = c.length = 0; d < b; d++)a[d] && c.push(a[d]);
        this._selectedIndex = cc.UINT_MAX;
        this.setSelectedIndex(0);
        return this.cascadeOpacity = this.cascadeColor = !0
    }, addSubItem: function (a) {
        this.subItems.push(a)
    }, activate: function () {
        this._enabled && this.setSelectedIndex((this._selectedIndex + 1) % this.subItems.length);
        cc.MenuItem.prototype.activate.call(this)
    }, selected: function () {
        cc.MenuItem.prototype.selected.call(this);
        this.subItems[this._selectedIndex].selected()
    }, unselected: function () {
        cc.MenuItem.prototype.unselected.call(this);
        this.subItems[this._selectedIndex].unselected()
    }, setEnabled: function (a) {
        if (this._enabled !== a) {
            cc.MenuItem.prototype.setEnabled.call(this, a);
            var b = this.subItems;
            if (b && 0 < b.length)
                for (var c = 0; c < b.length; c++)b[c].enabled = a
        }
    }, selectedItem: function () {
        return this.subItems[this._selectedIndex]
    }, getSelectedItem: function () {
        return this.subItems[this._selectedIndex]
    }, onEnter: function () {
        cc.Node.prototype.onEnter.call(this);
        this.setSelectedIndex(this._selectedIndex)
    }
});
_p = cc.MenuItemToggle.prototype;
cc.defineGetterSetter(_p, "selectedIndex", _p.getSelectedIndex, _p.setSelectedIndex);
cc.MenuItemToggle.create = function () {
    0 < arguments.length && null == arguments[arguments.length - 1] && cc.log("parameters should not be ending with null in Javascript");
    var a = new cc.MenuItemToggle;
    a.initWithItems(Array.prototype.slice.apply(arguments));
    return a
};
cc.MENU_STATE_WAITING = 0;
cc.MENU_STATE_TRACKING_TOUCH = 1;
cc.MENU_HANDLER_PRIORITY = -128;
cc.DEFAULT_PADDING = 5;
cc.Menu = cc.Layer.extend({
    enabled: !1, _selectedItem: null, _state: -1, _touchListener: null, _className: "Menu", ctor: function (a) {
        cc.Layer.prototype.ctor.call(this);
        this._color = cc.color.WHITE;
        this.enabled = !1;
        this._opacity = 255;
        this._selectedItem = null;
        this._state = -1;
        this._touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: !0,
            onTouchBegan: this._onTouchBegan,
            onTouchMoved: this._onTouchMoved,
            onTouchEnded: this._onTouchEnded,
            onTouchCancelled: this._onTouchCancelled
        });
        0 < arguments.length && null == arguments[arguments.length - 1] && cc.log("parameters should not be ending with null in Javascript");
        var b = arguments.length, c;
        if (0 === b)c = []; else if (1 === b)c = a instanceof Array ? a : [a]; else if (1 < b) {
            c = [];
            for (var d = 0; d < b; d++)arguments[d] && c.push(arguments[d])
        }
        this.initWithArray(c)
    }, onEnter: function () {
        var a = this._touchListener;
        a._isRegistered() || cc.eventManager.addListener(a, this);
        cc.Node.prototype.onEnter.call(this)
    }, isEnabled: function () {
        return this.enabled
    }, setEnabled: function (a) {
        this.enabled = a
    }, initWithItems: function (a) {
        var b = [];
        if (a)
            for (var c = 0; c < a.length; c++)a[c] && b.push(a[c]);
        return this.initWithArray(b)
    }, initWithArray: function (a) {
        if (cc.Layer.prototype.init.call(this)) {
            this.enabled = !0;
            var b = cc.winSize;
            this.setPosition(b.width / 2, b.height / 2);
            this.setContentSize(b);
            this.setAnchorPoint(0.5, 0.5);
            this.ignoreAnchorPointForPosition(!0);
            if (a)
                for (b = 0; b < a.length; b++)this.addChild(a[b], b);
            this._selectedItem = null;
            this._state = cc.MENU_STATE_WAITING;
            return this.cascadeOpacity = this.cascadeColor = !0
        }
        return !1
    }, addChild: function (a, b, c) {
        if (!(a instanceof cc.MenuItem))throw"cc.Menu.addChild() : Menu only supports MenuItem objects as children";
        cc.Layer.prototype.addChild.call(this, a, b, c)
    }, alignItemsVertically: function () {
        this.alignItemsVerticallyWithPadding(cc.DEFAULT_PADDING)
    }, alignItemsVerticallyWithPadding: function (a) {
        var b = -a, c = this._children, d, e, f, g;
        if (c && 0 < c.length) {
            e = 0;
            for (d = c.length; e < d; e++)b += c[e].height * c[e].scaleY + a;
            var h = b / 2;
            e = 0;
            for (d = c.length; e < d; e++)g = c[e], f = g.height, b = g.scaleY, g.setPosition(0, h - f * b / 2), h -= f * b + a
        }
    }, alignItemsHorizontally: function () {
        this.alignItemsHorizontallyWithPadding(cc.DEFAULT_PADDING)
    }, alignItemsHorizontallyWithPadding: function (a) {
        var b = -a, c = this._children, d, e, f, g;
        if (c && 0 < c.length) {
            d = 0;
            for (e = c.length; d < e; d++)b += c[d].width * c[d].scaleX + a;
            var h = -b / 2;
            d = 0;
            for (e = c.length; d < e; d++)g = c[d], b = g.scaleX, f = c[d].width, g.setPosition(h + f * b / 2, 0), h += f * b + a
        }
    }, alignItemsInColumns: function () {
        0 < arguments.length && null == arguments[arguments.length - 1] && cc.log("parameters should not be ending with null in Javascript");
        for (var a = [], b = 0; b < arguments.length; b++)a.push(arguments[b]);
        var c = -5, d = 0, e = 0, f = 0, g, h, k, m = this._children;
        if (m && 0 < m.length)
            for (b = 0, k = m.length; b < k; b++)d >= a.length || !(g = a[d]) || (h = m[b].height, e = e >= h || isNaN(h) ? e : h, ++f, f >= g && (c += e + 5, e = f = 0, ++d));
        var n = cc.director.getWinSize(), p = g = e = d = 0, s = 0, c = c / 2;
        if (m && 0 < m.length)
            for (b = 0, k = m.length; b < k; b++) {
                var r = m[b];
                0 === g && (g = a[d], s = p = n.width / (1 + g));
                h = r._getHeight();
                e = e >= h || isNaN(h) ? e : h;
                r.setPosition(s - n.width / 2, c - h / 2);
                s += p;
                ++f;
                f >= g && (c -= e + 5, e = g = f = 0, ++d)
            }
    }, alignItemsInRows: function () {
        0 < arguments.length && null == arguments[arguments.length - 1] && cc.log("parameters should not be ending with null in Javascript");
        var a = [], b;
        for (b = 0; b < arguments.length; b++)a.push(arguments[b]);
        var c = [], d = [], e = -10, f = -5, g = 0, h = 0, k = 0, m, n, p, s, r = this._children;
        if (r && 0 < r.length)
            for (b = 0, p = r.length; b < p; b++)(n = r[b], g >= a.length || !(m = a[g])) || (s = n.width, h = h >= s || isNaN(s) ? h : s, f += n.height + 5, ++k, k >= m && (c.push(h), d.push(f), e += h + 10, h = k = 0, f = -5, ++g));
        f = cc.director.getWinSize();
        m = h = g = 0;
        var e = -e / 2, u = 0;
        if (r && 0 < r.length)
            for (b = 0, p = r.length; b < p; b++)n = r[b], 0 === m && (m = a[g], u = d[g]), s = n._getWidth(), h = h >= s || isNaN(s) ? h : s, n.setPosition(e + c[g] / 2, u - f.height / 2), u -= n.height + 10, ++k, k >= m && (e += h + 5, h = m = k = 0, ++g)
    }, removeChild: function (a, b) {
        null != a && (a instanceof cc.MenuItem ? (this._selectedItem === a && (this._selectedItem = null), cc.Node.prototype.removeChild.call(this, a, b)) : cc.log("cc.Menu.removeChild():Menu only supports MenuItem objects as children"))
    }, _onTouchBegan: function (a, b) {
        var c = b.getCurrentTarget();
        if (c._state !== cc.MENU_STATE_WAITING || !c._visible || !c.enabled)return !1;
        for (var d = c.parent; null != d; d = d.parent)
            if (!d.isVisible())return !1;
        c._selectedItem = c._itemForTouch(a);
        return c._selectedItem ? (c._state = cc.MENU_STATE_TRACKING_TOUCH, c._selectedItem.selected(), c._selectedItem.setNodeDirty(), !0) : !1
    }, _onTouchEnded: function (a, b) {
        var c = b.getCurrentTarget();
        c._state !== cc.MENU_STATE_TRACKING_TOUCH ? cc.log("cc.Menu.onTouchEnded(): invalid state") : (c._selectedItem && (c._selectedItem.unselected(), c._selectedItem.setNodeDirty(), c._selectedItem.activate()), c._state = cc.MENU_STATE_WAITING)
    }, _onTouchCancelled: function (a, b) {
        var c = b.getCurrentTarget();
        c._state !== cc.MENU_STATE_TRACKING_TOUCH ? cc.log("cc.Menu.onTouchCancelled(): invalid state") : (this._selectedItem && (c._selectedItem.unselected(), c._selectedItem.setNodeDirty()), c._state = cc.MENU_STATE_WAITING)
    }, _onTouchMoved: function (a, b) {
        var c = b.getCurrentTarget();
        if (c._state !== cc.MENU_STATE_TRACKING_TOUCH)cc.log("cc.Menu.onTouchMoved(): invalid state"); else {
            var d = c._itemForTouch(a);
            d !== c._selectedItem && (c._selectedItem && (c._selectedItem.unselected(), c._selectedItem.setNodeDirty()), c._selectedItem = d, c._selectedItem && (c._selectedItem.selected(), c._selectedItem.setNodeDirty()))
        }
    }, onExit: function () {
        this._state === cc.MENU_STATE_TRACKING_TOUCH && (this._selectedItem && (this._selectedItem.unselected(), this._selectedItem = null), this._state = cc.MENU_STATE_WAITING);
        cc.Node.prototype.onExit.call(this)
    }, setOpacityModifyRGB: function (a) {
    }, isOpacityModifyRGB: function () {
        return !1
    }, _itemForTouch: function (a) {
        a = a.getLocation();
        var b = this._children, c;
        if (b && 0 < b.length)
            for (var d = b.length - 1; 0 <= d; d--)
                if (c = b[d], c.isVisible() && c.isEnabled()) {
                    var e = c.convertToNodeSpace(a), f = c.rect();
                    f.x = 0;
                    f.y = 0;
                    if (cc.rectContainsPoint(f, e))return c
                }
        return null
    }
});
_p = cc.Menu.prototype;
cc.Menu.create = function (a) {
    var b = arguments.length;
    0 < b && null == arguments[b - 1] && cc.log("parameters should not be ending with null in Javascript");
    return 0 === b ? new cc.Menu : 1 === b ? new cc.Menu(a) : new cc.Menu(Array.prototype.slice.call(arguments, 0))
};
(function () {
    var a = cc.sys, b = {common: {multichannel: !0, webAudio: cc.sys._supportWebAudio, auto: !0}};
    b[a.BROWSER_TYPE_IE] = {multichannel: !0, webAudio: cc.sys._supportWebAudio, auto: !0, emptied: !0};
    b[a.BROWSER_TYPE_ANDROID] = {multichannel: !1, webAudio: !1, auto: !1};
    b[a.BROWSER_TYPE_CHROME] = {multichannel: !0, webAudio: !0, auto: !1};
    b[a.BROWSER_TYPE_FIREFOX] = {multichannel: !0, webAudio: !0, auto: !0, delay: !0};
    b[a.BROWSER_TYPE_UC] = {multichannel: !0, webAudio: !1, auto: !1};
    b[a.BROWSER_TYPE_QQ] = {multichannel: !1, webAudio: !1, auto: !0};
    b[a.BROWSER_TYPE_OUPENG] = {multichannel: !1, webAudio: !1, auto: !1, replay: !0, emptied: !0};
    b[a.BROWSER_TYPE_WECHAT] = {multichannel: !1, webAudio: !1, auto: !1, replay: !0, emptied: !0};
    b[a.BROWSER_TYPE_360] = {multichannel: !1, webAudio: !1, auto: !0};
    b[a.BROWSER_TYPE_MIUI] = {multichannel: !1, webAudio: !1, auto: !0};
    b[a.BROWSER_TYPE_LIEBAO] = {multichannel: !1, webAudio: !1, auto: !1, replay: !0, emptied: !0};
    b[a.BROWSER_TYPE_SOUGOU] = {multichannel: !1, webAudio: !1, auto: !1, replay: !0, emptied: !0};
    b[a.BROWSER_TYPE_BAIDU] = {multichannel: !1, webAudio: !1, auto: !1, replay: !0, emptied: !0};
    b[a.BROWSER_TYPE_BAIDU_APP] = {multichannel: !1, webAudio: !1, auto: !1, replay: !0, emptied: !0};
    b[a.BROWSER_TYPE_SAFARI] = {
        multichannel: !0, webAudio: !0, auto: !1, webAudioCallback: function (a) {
            document.createElement("audio").src = a
        }
    };
    var c, d;
    try {
        var e = navigator.userAgent.toLowerCase();
        switch (a.browserType) {
            case a.BROWSER_TYPE_IE:
                d = e.match(/(msie |rv:)([\d.]+)/);
                break;
            case a.BROWSER_TYPE_FIREFOX:
                d = e.match(/(firefox\/|rv:)([\d.]+)/);
                break;
            case a.BROWSER_TYPE_CHROME:
                d = e.match(/chrome\/([\d.]+)/);
                break;
            case a.BROWSER_TYPE_BAIDU:
                d = e.match(/baidubrowser\/([\d.]+)/);
                break;
            case a.BROWSER_TYPE_UC:
                d = e.match(/ucbrowser\/([\d.]+)/);
                break;
            case a.BROWSER_TYPE_QQ:
                d = e.match(/qqbrowser\/([\d.]+)/);
                break;
            case a.BROWSER_TYPE_OUPENG:
                d = e.match(/oupeng\/([\d.]+)/);
                break;
            case a.BROWSER_TYPE_WECHAT:
                d = e.match(/micromessenger\/([\d.]+)/);
                break;
            case a.BROWSER_TYPE_SAFARI:
                d = e.match(/safari\/([\d.]+)/);
                break;
            case a.BROWSER_TYPE_MIUI:
                d = e.match(/miuibrowser\/([\d.]+)/)
        }
        c = d ? d[1] : ""
    } catch (f) {
        console.log(f)
    }
    if (c)switch (a.browserType) {
        case a.BROWSER_TYPE_CHROME:
            30 > parseInt(c) && (b[a.BROWSER_TYPE_CHROME] = {multichannel: !1, webAudio: !0, auto: !1});
            break;
        case a.BROWSER_TYPE_MIUI:
            if (c = c.match(/\d+/g), 2 > c[0] || 2 === c[0] && 0 === c[1] && 1 >= c[2])b[a.BROWSER_TYPE_MIUI].auto = !1
    }
    if (cc.sys.isMobile)cc.__audioSupport = cc.sys.os !== cc.sys.OS_IOS ? b[a.browserType] || b.common : b[a.BROWSER_TYPE_SAFARI]; else switch (a.browserType) {
        case a.BROWSER_TYPE_IE:
            cc.__audioSupport = b[a.BROWSER_TYPE_IE];
            break;
        case a.BROWSER_TYPE_FIREFOX:
            cc.__audioSupport = b[a.BROWSER_TYPE_FIREFOX];
            break;
        default:
            cc.__audioSupport = b.common
    }
})();
cc.Audio = cc.Class.extend({
    volume: 1,
    loop: !1,
    src: null,
    _touch: !1,
    _playing: !1,
    _AUDIO_TYPE: "AUDIO",
    _pause: !1,
    _buffer: null,
    _currentSource: null,
    _startTime: null,
    _currentTime: null,
    _context: null,
    _volume: null,
    _ignoreEnded: !1,
    _element: null,
    ctor: function (a, b, c) {
        a && (this._context = a);
        b && (this._volume = b);
        a && b && (this._AUDIO_TYPE = "WEBAUDIO");
        this.src = c
    },
    _setBufferCallback: null,
    setBuffer: function (a) {
        if (a) {
            var b = this._playing;
            this._AUDIO_TYPE = "WEBAUDIO";
            this._buffer && this._buffer !== a && this.getPlaying() && this.stop();
            this._buffer = a;
            b && this.play();
            this._volume.gain.value = this.volume;
            this._setBufferCallback && this._setBufferCallback(a)
        }
    },
    _setElementCallback: null,
    setElement: function (a) {
        if (a) {
            var b = this._playing;
            this._AUDIO_TYPE = "AUDIO";
            this._element && this._element !== a && this.getPlaying() && this.stop();
            this._element = a;
            b && this.play();
            a.volume = this.volume;
            a.loop = this.loop;
            this._setElementCallback && this._setElementCallback(a)
        }
    },
    play: function (a, b) {
        this._playing = !0;
        this.loop = void 0 === b ? this.loop : b;
        "AUDIO" === this._AUDIO_TYPE ? this._playOfAudio(a) : this._playOfWebAudio(a)
    },
    getPlaying: function () {
        if (!this._playing)return this._playing;
        if ("AUDIO" === this._AUDIO_TYPE) {
            var a = this._element;
            return !a || this._pause || a.ended ? this._playing = !1 : !0
        }
        return (a = this._currentSource) ? null == a.playbackState ? this._playing : this._currentTime + this._context.currentTime - this._startTime < this._currentSource.buffer.duration : !0
    },
    _playOfWebAudio: function (a) {
        var b = this._currentSource;
        if (this._buffer) {
            if (!this._pause && b)
                if (0 === this._context.currentTime || this._currentTime +
                    this._context.currentTime - this._startTime > this._currentSource.buffer.duration)this._stopOfWebAudio(); else return;
            b = this._context.createBufferSource();
            b.buffer = this._buffer;
            b.connect(this._volume);
            b.loop = this.loop;
            this._startTime = this._context.currentTime;
            this._currentTime = a || 0;
            if (b.start)b.start(0, a || 0); else if (b.noteGrainOn) {
                var c = b.buffer.duration;
                this.loop ? b.noteGrainOn(0, a, c) : b.noteGrainOn(0, a, c - a)
            } else b.noteOn(0);
            this._currentSource = b;
            var d = this;
            b.onended = function () {
                d._ignoreEnded ? d._ignoreEnded = !1 : d._playing = !1
            }
        }
    },
    _playOfAudio: function () {
        var a = this._element;
        a && (a.loop = this.loop, a.play())
    },
    stop: function () {
        this._playing = !1;
        "AUDIO" === this._AUDIO_TYPE ? this._stopOfAudio() : this._stopOfWebAudio()
    },
    _stopOfWebAudio: function () {
        var a = this._currentSource;
        this._ignoreEnded = !0;
        a && (a.stop(0), this._currentSource = null)
    },
    _stopOfAudio: function () {
        var a = this._element;
        a && (a.pause(), a.duration && Infinity !== a.duration && (a.currentTime = 0))
    },
    pause: function () {
        !1 !== this.getPlaying() && (this._playing = !1, this._pause = !0, "AUDIO" === this._AUDIO_TYPE ? this._pauseOfAudio() : this._pauseOfWebAudio())
    },
    _pauseOfWebAudio: function () {
        this._currentTime += this._context.currentTime - this._startTime;
        var a = this._currentSource;
        a && a.stop(0)
    },
    _pauseOfAudio: function () {
        var a = this._element;
        a && a.pause()
    },
    resume: function () {
        this._pause && ("AUDIO" === this._AUDIO_TYPE ? this._resumeOfAudio() : this._resumeOfWebAudio(), this._pause = !1, this._playing = !0)
    },
    _resumeOfWebAudio: function () {
        var a = this._currentSource;
        a && (this._startTime = this._context.currentTime, this._playOfWebAudio(this._currentTime % a.buffer.duration))
    },
    _resumeOfAudio: function () {
        var a = this._element;
        a && a.play()
    },
    setVolume: function (a) {
        1 < a && (a = 1);
        0 > a && (a = 0);
        this.volume = a;
        "AUDIO" === this._AUDIO_TYPE ? this._element && (this._element.volume = a) : this._volume && (this._volume.gain.value = a)
    },
    getVolume: function () {
        return this.volume
    },
    cloneNode: function () {
        var a, b;
        if ("AUDIO" === this._AUDIO_TYPE) {
            a = new cc.Audio;
            var c = document.createElement("audio");
            c.src = this.src;
            a.setElement(c)
        } else c = this._context.createGain(), c.gain.value = 1, c.connect(this._context.destination), a = new cc.Audio(this._context, c, this.src), this._buffer ? a.setBuffer(this._buffer) : (b = this, this._setBufferCallback = function (c) {
            a.setBuffer(c);
            b._setBufferCallback = null
        });
        a._AUDIO_TYPE = this._AUDIO_TYPE;
        return a
    }
});
(function (a) {
    var b = a.webAudio, c = a.multichannel, d = a.auto, e = [];
    (function () {
        var a = document.createElement("audio");
        if (a.canPlayType) {
            var b = a.canPlayType('audio/ogg; codecs\x3d"vorbis"');
            b && "" !== b && e.push(".ogg");
            (b = a.canPlayType("audio/mpeg")) && "" !== b && e.push(".mp3");
            (b = a.canPlayType('audio/wav; codecs\x3d"1"')) && "" !== b && e.push(".wav");
            (b = a.canPlayType("audio/mp4")) && "" !== b && e.push(".mp4");
            (a = a.canPlayType("audio/x-m4a")) && "" !== a && e.push(".m4a")
        }
    })();
    try {
        if (b) {
            var f = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext);
            a.delay && setTimeout(function () {
                f = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)
            }, 0)
        }
    } catch (g) {
        b = !1, cc.log("browser don't support webAudio")
    }
    var h = {
        cache: {}, load: function (a, c, d, g) {
            if (0 === e.length)return g("can not support audio!");
            var k = cc.path.extname(a), u = [k];
            for (d = 0; d < e.length; d++)k !== e[d] && u.push(e[d]);
            var t;
            if (h.cache[c])return g(null, h.cache[c]);
            if (b)try {
                var v = f.createGain();
                v.gain.value = 1;
                v.connect(f.destination);
                t = new cc.Audio(f, v, a)
            } catch (w) {
                b = !1, cc.log("browser don't support webAudio"), t = new cc.Audio(null, null, a)
            } else t = new cc.Audio(null, null, a);
            this.loadAudioFromExtList(a, u, t, g);
            h.cache[c] = t
        }, loadAudioFromExtList: function (c, d, g, k) {
            if (0 === d.length) {
                var r = "can not found the resource of audio! Last match url is : ", r = r + c.replace(/\.(.*)?$/, "(");
                e.forEach(function (a) {
                    r += a + "|"
                });
                r = r.replace(/\|$/, ")");
                return k(r)
            }
            c = cc.path.changeExtname(c, d.splice(0, 1));
            if (b) {
                a.webAudioCallback && a.webAudioCallback(c);
                var u = new XMLHttpRequest;
                u.open("GET", c, !0);
                u.responseType = "arraybuffer";
                u.onload = function () {
                    f.decodeAudioData(u.response, function (a) {
                        g.setBuffer(a);
                        k(null, g)
                    }, function () {
                        h.loadAudioFromExtList(c, d, g, k)
                    })
                };
                u.send()
            } else {
                var t = document.createElement("audio"), v = !1, w = !1, z = setTimeout(function () {
                    0 === t.readyState ? A() : (w = !0, t.pause(), document.body.removeChild(t), k("audio load timeout : " + c, g))
                }, 1E4), x = function () {
                    if (!v) {
                        t.pause();
                        try {
                            t.currentTime = 0, t.volume = 1
                        } catch (a) {
                        }
                        document.body.removeChild(t);
                        g.setElement(t);
                        t.removeEventListener("canplaythrough", x, !1);
                        t.removeEventListener("error", y, !1);
                        t.removeEventListener("emptied", A, !1);
                        !w && k(null, g);
                        v = !0;
                        clearTimeout(z)
                    }
                }, y = function () {
                    v && (t.pause(), document.body.removeChild(t), t.removeEventListener("canplaythrough", x, !1), t.removeEventListener("error", y, !1), t.removeEventListener("emptied", A, !1), !w && h.loadAudioFromExtList(c, d, g, k), v = !0, clearTimeout(z))
                }, A = function () {
                    w = !0;
                    x();
                    k(null, g)
                };
                cc._addEventListener(t, "canplaythrough", x, !1);
                cc._addEventListener(t, "error", y, !1);
                a.emptied && cc._addEventListener(t, "emptied", A, !1);
                t.src = c;
                document.body.appendChild(t);
                t.volume = 0;
                t.play()
            }
        }
    };
    cc.loader.register(["mp3", "ogg", "wav", "mp4", "m4a"], h);
    cc.audioEngine = {
        _currMusic: null, _musicVolume: 1, willPlayMusic: function () {
            return !1
        }, playMusic: function (a, b) {
            var c = this._currMusic;
            c && c.src !== a && c.getPlaying() && c.stop();
            c = h.cache[a];
            c || (cc.loader.load(a), c = h.cache[a]);
            c.play(0, b);
            c.setVolume(this._musicVolume);
            this._currMusic = c
        }, stopMusic: function (a) {
            var b = this._currMusic;
            b && (b.stop(), a && cc.loader.release(b.src))
        }, pauseMusic: function () {
            var a = this._currMusic;
            a && a.pause()
        }, resumeMusic: function () {
            var a = this._currMusic;
            a && a.resume()
        }, rewindMusic: function () {
            var a = this._currMusic;
            a && (a.stop(), a.play())
        }, getMusicVolume: function () {
            return this._musicVolume
        }, setMusicVolume: function (a) {
            a -= 0;
            isNaN(a) && (a = 1);
            1 < a && (a = 1);
            0 > a && (a = 0);
            this._musicVolume = a;
            var b = this._currMusic;
            b && b.setVolume(a)
        }, isMusicPlaying: function () {
            var a = this._currMusic;
            return a ? a.getPlaying() : !1
        }, _audioPool: {}, _maxAudioInstance: 5, _effectVolume: 1, playEffect: function (a, d) {
            if (!c)return null;
            var e = this._audioPool[a];
            e || (e = this._audioPool[a] = []);
            var f;
            for (f = 0; f < e.length && e[f].getPlaying(); f++);
            if (e[f])g = e[f], g.setVolume(this._effectVolume), g.play(0, d); else if (!b && f > this._maxAudioInstance)cc.log("Error: %s greater than %d", a, this._maxAudioInstance); else {
                var g = h.cache[a];
                g || (cc.loader.load(a), g = h.cache[a]);
                g = g.cloneNode();
                g.setVolume(this._effectVolume);
                g.loop = d || !1;
                g.play();
                e.push(g)
            }
            return g
        }, setEffectsVolume: function (a) {
            a -= 0;
            isNaN(a) && (a = 1);
            1 < a && (a = 1);
            0 > a && (a = 0);
            this._effectVolume = a;
            var b = this._audioPool, c;
            for (c in b) {
                var d = b[c];
                if (Array.isArray(d))
                    for (var e = 0; e < d.length; e++)d[e].setVolume(a)
            }
        }, getEffectsVolume: function () {
            return this._effectVolume
        }, pauseEffect: function (a) {
            a && a.pause()
        }, pauseAllEffects: function () {
            var a = this._audioPool, b;
            for (b in a)
                for (var c = a[b], d = 0; d < a[b].length; d++)c[d].getPlaying() && c[d].pause()
        }, resumeEffect: function (a) {
            a && a.resume()
        }, resumeAllEffects: function () {
            var a = this._audioPool, b;
            for (b in a)
                for (var c = a[b], d = 0; d < a[b].length; d++)c[d].resume()
        }, stopEffect: function (a) {
            a && a.stop()
        }, stopAllEffects: function () {
            var a = this._audioPool, b;
            for (b in a)
                for (var c = a[b], d = 0; d < a[b].length; d++)c[d].stop()
        }, unloadEffect: function (a) {
            if (a) {
                cc.loader.release(a);
                var b = this._audioPool[a];
                b && (b.length = 0);
                delete this._audioPool[a];
                delete h.cache[a]
            }
        }, end: function () {
            this.stopMusic();
            this.stopAllEffects()
        }, _pauseCache: [], _pausePlaying: function () {
            var a = this._currMusic;
            a && a.getPlaying() && (a.pause(), this._pauseCache.push(a));
            var a = this._audioPool, b;
            for (b in a)
                for (var c = a[b], d = 0; d < a[b].length; d++)c[d].getPlaying() && (c[d].pause(), this._pauseCache.push(c[d]))
        }, _resumePlaying: function () {
            for (var a = this._pauseCache, b = 0; b < a.length; b++)a[b].resume();
            a.length = 0
        }
    };
    if (!d) {
        var k = function () {
            var b = cc.audioEngine._currMusic;
            b && !1 === b._touch && b._playing && b.getPlaying() && (b._touch = !0, b.play(0, b.loop), !a.replay && cc._canvas.removeEventListener("touchstart", k))
        };
        setTimeout(function () {
            cc._canvas && cc._canvas.addEventListener("touchstart", k, !1)
        }, 150)
    }
    cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function () {
        cc.audioEngine._pausePlaying()
    });
    cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
        cc.audioEngine._resumePlaying()
    })
})(cc.__audioSupport);
var res = {
    Item0_png: "res/0.png",
    Item1_png: "res/1.png",
    Item2_png: "res/2.png",
    Item3_png: "res/3.png",
    Item4_png: "res/4.png",
    Item5_png: "res/5.png",
    Item6_png: "res/6.png",
    Item7_png: "res/7.png",
    ColorBg1_png: "res/bg/1.png",
    ColorBg2_png: "res/bg/2.png",
    ColorBg3_png: "res/bg/3.png",
    ColorBg4_png: "res/bg/4.png",
    ColorBg5_png: "res/bg/5.png",
    ColorBg6_png: "res/bg/6.png",
    ColorBg7_png: "res/bg/7.png",
    Shadow1_png: "res/shadow/1.png",
    Shadow2_png: "res/shadow/2.png",
    Shadow3_png: "res/shadow/3.png",
    Shadow4_png: "res/shadow/4.png",
    Shadow5_png: "res/shadow/5.png",
    Shadow6_png: "res/shadow/6.png",
    Shadow7_png: "res/shadow/7.png",
    Num_png: "res/num.png",
    Circle_png: "res/circle.png",
    Bomb_mp3: "res/music/bomb.mp3",
    Bomb_ogg: "res/music/bomb.ogg",
    Put_mp3: "res/music/put.mp3",
    Put_ogg: "res/music/put.ogg",
    In_mp3: "res/music/in.mp3",
    In_ogg: "res/music/in.ogg",
    GameOver_mp3: "res/music/game_over.mp3",
    GameOver_ogg: "res/music/game_over.ogg",
    IconGame_png: "res/icon_moregame.png",
    IconReplay_png: "res/icon_replay.png",
    IconFacebook_png: "res/icon_facebook.png",
    IconTwitter_png: "res/icon_twitter.png",
    Facebook_png: "res/f_share.png",
    ShareArrow2_png: "res/share_arrow2.png",
    MoreGame2_png: "res/more_game.png",
    PlayAgain2_png: "res/play_again.png",
    GameOver2_png: "res/game_over2.png",
    GameOver_png: "res/game_over.png",
    ScoreBg_png: "res/score_bg.png",
    JiXuBtn_png: "res/jixuyouxi.png",
    ChouJiangBtn_png: "res/choujianganniu.png",
    Share_png: "res/fenxiangyixia.png",
    fenxiang_png: "res/fenxiang.png",
    fenxiang2_png: "res/fenxiang2.png",
    MoreGame_png: "res/moregame.png"
}, g_resources = [], i;
for (i in res)g_resources.push(res[i]);
GameStartFlag = !1;
AD_REAL_H = GameMainLayer = IOS_FLAG = null;
FaceBookFlag = TwitterFlag = !1;
var GameLayer = cc.Layer.extend({
    sprite: null,
    ctor: function () {
        this._super();
        this.init();
        this.showGameInfo();
        return !0
    },
    showGameInfo: function () {
        if (GameStartFlag)this.gameStart(); else {
            GameStartFlag = !0;
            cc.director.pause();
            var a = new GameInfoLayer;
            this.addChild(a, 100)
        }
    },
    gameStart: function () {
        this.playGame();
    },
    checkHost: function () {
        var a;
        a = window.location.href.substr(7, 14);
        a = hex_md5(a);
        "72c4cc272fe7185382beacb7c0bb7958" != a && "29dee435d50bd51af98611fcd629b797" != a && cc.director.pause()
    },
    initFacebookSDK: function () {
    },
    size: null,
    init: function () {
        this.size = cc.director.getVisibleSize();
        this.initSystem();
        this.initBottomEdgeY();
        this.initBg();
        this.initCircleItem();
        this.initScore()
    },
    bottomEdgeY: null,
    AD_H: 55,
    initBottomEdgeY: function () {
        if (IOS_FLAG) {
            var a = navigator.userAgent.toLowerCase();
            0 < a.indexOf("twitter") && (this.AD_H += 107, document.getElementById("googleads").style.bottom = "107px", TwitterFlag = !0);
            0 < a.indexOf("fbios") && (this.AD_H += 107, document.getElementById("googleads").style.bottom = "107px", FaceBookFlag = !0)
        }
        var a = cc.view.getFrameSize(), b = this.size;
        this.bottomEdgeY = a = this.AD_H * (PC_FLAG ? b.height / a.height : b.width / a.width);
        b = new cc.DrawNode;
        b.drawRect(cc.p(0, 0), cc.p(this.size.width, a - 2), cc.color("#000000"), 2, cc.color("#ffffff"));
        var c = new cc.Sprite;
        this.addChild(c, 15);
        c.addChild(b, 15);
        AD_REAL_H = a
    },
    initSystem: function () {
        var a = cc.sys;
        IOS_FLAG = a.os === a.OS_IOS || a.os === a.OS_OSX ? !0 : !1
    },
    initBg: function () {
        var a = new cc.LayerColor(cc.color("#1c1c1c"));
        this.addChild(a);
        this.initBgCircle();
        this.initBgItem()
    },
    tileObj: null,
    itemW: 77,
    itemH: 87,
    itemSubH: null,
    itemDisX: null,
    itemDisY: null,
    centerP: null,
    initBgItem: function () {
        this.tileObj = {};
        this.itemSubH = Math.tan(30 * Math.PI / 180) * (this.itemW / 2);
        var a = cc.p(this.size.width / 2, this.size.height / 2);
        a.y = this.size.height - (this.size.height - (this.circle.y + this.circle.height / 2 + 50)) / 2;
        this.centerP = a;
        var b = this.itemH - this.itemSubH + 12;
        this.itemDisX = this.itemW +
            8.5;
        this.itemDisY = b;
        for (var a = cc.p(a.x, a.y - 3 * b), c, d, e, f = -3, g = 4, h = 0; 7 > h; h++) {
            d = a.y + h * b;
            e = 2 * -Math.floor(g / 2);
            0 == h % 2 ? (c = (this.itemW + 8.5) / 2, e += 1) : c = 0;
            c = a.x - Math.floor(g / 2) * (this.itemW + 8.5) + c;
            for (var k = 0; k < g; k++) {
                var m = this.getItem(0);
                this.addChild(m);
                m.x = c + k * (this.itemW + 8.5);
                m.y = d;
                var n = (e + 2 * k).toString(), p = f.toString();
                this.tileObj[n] || (this.tileObj[n] = {});
                this.tileObj[n][p] = {};
                this.tileObj[n][p].bgItem = m;
                m.logicX = n;
                m.logicY = p
            }
            3 > h ? g++ : g--;
            f++
        }
    },
    circle: null,
    circleP: null,
    initBgCircle: function () {
        var a = new cc.Sprite(res.Circle_png);
        this.addChild(a, 1);
        this.circle = a;
        a.x = this.size.width / 2;
        a.y = this.bottomEdgeY + a.height / 2 + 5;
        a.opacity = 180;
        this.circleP = a.getPosition()
    },
    getItem: function (a) {
        null == a && (a = this.getItemRandomColor());
        var b = new cc.Sprite("res/" + a + ".png");
        b.colorId = a.toString();
        0 != a && this.createBgItemColor(b, b.colorId);
        return b
    },
    getItemRandomColor: function () {
        var a = this.curMaxPoint + 1;
        if (7 <= a) {
            if (0.03 >= Math.random())return cc.log(" in 0.01 _____ "), 7;
            a = 6
        }
        var b = Number(Math.ceil((100 - 7 * a) / this.curTotalPoint * 100) / 100);
        cc.log("------------");
        cc.log("rate: " + b);
        for (var c = [], d = a; 0 < d; d--) {
            var e = 7 + b * d;
            cc.log("value: " + e);
            c.push(e)
        }
        d = Math.floor(100 * Math.random());
        cc.log("randomNum : " + d);
        for (b = e = 0; b < d;) {
            b += c[e];
            console.log(b, c[e], e);
            if (b >= d)return cc.log("index + 1 : " + (e + 1)), e + 1;
            e++
        }
        cc.log(" no index .. ");
        a = Math.ceil(Math.random() * a);
        8 <= a && (a = 7);
        return a
    },
    circleItem: null,
    initCircleItem: function (a, b) {
        this.circleItem && this.circleItem.removeFromParent();
        var c = this.getCircleItem(b);
        c.setPosition(this.circleP);
        this.circleItem = c;
        if (a) {
            c.scale = 0.2;
            var d = cc.sequence(cc.scaleTo(0.08, 1), cc.callFunc(function (a, b) {
                b.canTouch = !0
            }, this, this));
            c.runAction(d)
        }
    },
    getCircleItem: function (a) {
        var b = new cc.Sprite;
        this.addChild(b, 2);
        if (4 == a || !a && 0.05 > Math.random())return a = this.getItem(), b.addChild(a, 2), b.itemArr = [a], a.offX = a.x, a.offY = a.y, b;
        var c;
        c = a ? a : Math.ceil(3 * Math.random());
        a = this.getItem();
        var d = this.getItem();
        b.addChild(a, 2);
        b.addChild(d, 2);
        b.itemArr = [a, d];
        switch (c) {
            case 1:
                a.x = this.itemDisX / 4;
                a.y = this.itemDisY / 2;
                d.x = -this.itemDisX / 4;
                d.y = -this.itemDisY / 2;
                break;
            case 2:
                a.x = this.itemDisX / 2;
                a.y = 0;
                d.x = -this.itemDisX / 2;
                d.y = 0;
                break;
            case 3:
                a.x = this.itemDisX / 4, a.y = -this.itemDisY / 2, d.x = -this.itemDisX / 4, d.y = this.itemDisY / 2
        }
        a.offX = a.x;
        a.offY = a.y;
        d.offX = d.x;
        d.offY = d.y;
        return b
    },
    scoreTf: null,
    score: 0,
    initScore: function () {
        var a = new cc.LabelAtlas("0", res.Num_png, 43, 42, "0");
        this.addChild(a);
        a.attr({x: this.size.width / 2, y: this.circle.y + this.circle.height / 2 + 10, anchorX: 0.5, anchorY: 0});
        this.scoreTf = a
    },
    addScore1: function (a) {
        this.score += a;
        this.scoreTf.string = this.score.toString()
    },
    refreshTitle: function () {
        this.title.x = this.scoreTf.x - this.scoreTf.width - 30
    },
    playScoreTarget: 0,
    playScore: 0,
    playSubScore: 0,
    addScore: function (a) {
        this.playScoreTarget = this.score + a;
        this.score += a;
        this.scoreTf.string = this.playScore.toString();
        this.playSubScore = Math.ceil((this.playScoreTarget - this.playScore) / 20);
        this.schedule(this.scoreUpdateFunc, 0.05)
    },
    scoreUpdateFunc: function () {
        this.playScore += this.playSubScore;
        this.playScore >= this.playScoreTarget ? (this.unschedule(this.scoreUpdateFunc), this.scoreTf.string = this.score.toString()) : this.scoreTf.string = this.playScore.toString()
    },
    showScore: function (a, b) {
        var c = a.getPosition(), d = new cc.LabelTTF("+" + b.toString(), null, 60);
        d.setPosition(c);
        d.setColor(cc.color("#ffffff"));
        d.setAnchorPoint(cc.p(0.5, 0.5));
        d.enableShadow(cc.color("#000000"), cc.size(3, -3), 1);
        this.addChild(d, 5);
        c = cc.sequence(cc.moveBy(0.4, cc.p(0, 100)).easing(cc.easeCircleActionOut()), cc.spawn(cc.moveBy(0.4, cc.p(0, -100)).easing(cc.easeCircleActionIn()), cc.fadeOut(0.4).easing(cc.easeCircleActionIn())), cc.callFunc(function (a, b) {
            a.removeFromParent()
        }, this, this));
        d.runAction(c)
    },
    playGame: function () {
        this.createListener();
        this.scheduleUpdate()
    },
    update: function (a) {
        this.updateCircle()
    },
    circleSpeed: 1,
    updateCircle: function () {
        this.circle.rotation += this.circleSpeed;
        360 <= this.circle.rotation && (this.circle.rotation -= 360)
    },
    createListener: function () {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: !0,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded,
            onTouchCancelled: this.onTouchEnded
        }, this)
    },
    canTouch: !0,
    onTouchBegan: function (a, b) {
        var c = b.getCurrentTarget();
        if (a.getLocation().y < c.bottomEdgeY)return document.documentElement.scrollTop = document.body.scrollTop = 0, !1;
        if (c.canTouch && !c.gameEndFlag && !c.touchMoveFlag)return c.touchBegan(a, b), !0
    },
    onTouchMoved: function (a, b) {
        b.getCurrentTarget().touchMove(a, b)
    },
    onTouchEnded: function (a, b) {
        b.getCurrentTarget().touchEnd(a, b)
    },
    touchedFlag: !1,
    startTouchP: null,
    oldLocation: null,
    canPutFlag: !1,
    curPieceArr: null,
    curItemIndex: null,
    touchBegan: function (a, b) {
        this.canPutFlag = !1;
        var c = a.getLocation();
        this.startTouchP = this.oldLocation = c;
        this.touchedFlag = c.y <= this.circle.y + this.circle.height / 2 ? !0 : !1
    },
    touchMoveFlag: !1,
    moveOffYLen: 120,
    touchMove: function (a, b) {
        if (this.touchedFlag) {
            var c = a.getLocation();
            if (this.touchMoveFlag || !(15 >= cc.pDistance(this.startTouchP, c))) {
                if (this.touchMoveFlag) {
                    var d = this.oldLocation, e = c.x - d.x, d = c.y - d.y;
                    this.oldLocation = c;
                    this.circleItem.x += e;
                    this.circleItem.y += d
                } else this.touchMoveFlag = !0, c.y += this.moveOffYLen, this.circleItem.runAction(cc.moveBy(0.05, cc.p(0, this.moveOffYLen)));
                this.checkCanPut()
            }
        }
    },
    drawTest: function (a) {
        for (var b = this.circleItem.itemArr, c = 0; c < b.length; c++) {
            var d = new cc.DrawNode;
            a = cc.p(b[c].offX, b[c].offY);
            a.x += this.circleItem.x;
            a.y += this.circleItem.y;
            d.drawDot(a, 10, cc.color("#aa0000"));
            this.addChild(d, 10)
        }
    },
    touchEnd: function () {
        this.touchedFlag ? this.touchMoveFlag ? (this.touchMoveFlag = !1, this.hideOldLightTiles(), this.canPutFlag ? this.putTile() : this.backOldPosition()) : this.curRectRotation() : this.touchMoveFlag = !1
    },
    putTile: function () {
        this.canTouch = !1;
        for (var a = this.oldLightTiles, b = 0; b < a.length; b++) {
            var c = a[b].bgItem.item;
            c.removeFromParent();
            this.addChild(c, 2);
            c.setPosition(c.colorBgItem.getPosition());
            c.logicX = a[b].bgItem.logicX;
            c.logicY = a[b].bgItem.logicY;
            c.colorBgItem.removeFromParent();
            a[b].buildingFlag = !0;
            a[b].building = c
        }
        SoundUtile.playMusic("res/music/put");
        this.checkCanPop()
    },
    oldLightTiles: null,
    canPutFlag: null,
    checkCanPut: function () {
        for (var a = this.circleItem.itemArr, b = this.tileObj, c = [], d, e = 0; e < a.length; e++) {
            d = !1;
            var f = cc.p(a[e].offX, a[e].offY);
            f.x += this.circleItem.x;
            f.y += this.circleItem.y;
            f = this.pointToTile(f);
            b[f.x.toString()] && (f = b[f.x.toString()][f.y.toString()]) && !f.buildingFlag && (c.push(f), f.bgItem.item = a[e], d = !0);
            if (!d)break
        }
        this.hideOldLightTiles();
        if (d) {
            for (e = 0; e < c.length; e++)this.showBgItemColor(c[e].bgItem, c[e].bgItem.item);
            this.oldLightTiles = c
        }
        this.canPutFlag = d
    },
    checkGameEnd: function () {
        function a(a) {
            if (d[targetLogicX] && d[targetLogicX][targetLogicY]) {
                var e = d[targetLogicX][targetLogicY];
                e.checkEndFlag || e.building || (e.checkEndFlag = !0, c[a] || (c[a] = !0, b.push(Number(a))))
            }
        }

        var b = [], c = {}, d = this.tileObj, e, f, g;
        for (g in d) {
            var h = d[g], k;
            for (k in h)
                if (h[k].building || (e = g, f = k, c["4"] || (c["4"] = !0, b.push(4)), targetLogicX = (Number(e) + 1).toString(), targetLogicY = (Number(f) + 1).toString(), a("1"), targetLogicX = (Number(e) - 1).toString(), targetLogicY = (Number(f) - 1).toString(), a("1"), targetLogicX = (Number(e) - 2).toString(), targetLogicY = f.toString(), a("2"), targetLogicX = (Number(e) + 2).toString(), targetLogicY = (Number(f) +
                    0).toString(), a("2"), targetLogicX = (Number(e) - 1).toString(), targetLogicY = (Number(f) + 1).toString(), a("3"), targetLogicX = (Number(e) + 1).toString(), targetLogicY = (Number(f) - 1).toString(), a("3")), 4 <= b.length)break;
            if (4 <= b.length)break
        }
        for (g in d)
            for (k in h = d[g], h)h[k].checkEndFlag = !1;
        if (0 >= b.length)this.gameEnd(); else {
            var m;
            4 > b.length && (e = Math.floor(Math.random() * b.length), m = b[e]);
            this.initCircleItem(!0, m)
        }
    },
    cleanFlag: function () {
        var a = this.tileObj, b;
        for (b in a) {
            var c = a[b], d;
            for (d in c) {
                var e = c[d];
                e.checkedFlag = !1;
                e.building && (e.building.moveSpeed = 0, e.building.moveTarget = null)
            }
        }
        this.popArr = [];
        this.popTotalArr = []
    },
    pointToTile: function (a) {
        var b = this.itemDisY, c = Math.round((a.x - this.centerP.x) / (this.itemDisX / 2));
        a = Math.round((a.y - this.centerP.y) / b);
        return cc.p(c, a)
    },
    tileToPoint: function (a, b) {
        return cc.p(this.itemDisX / 2 * a + this.centerP.x, b * this.itemDisY + this.centerP.y)
    },
    showBgItemColor: function (a, b) {
        var c = b.colorBgItem;
        c.setPosition(a.getPosition());
        c.setVisible(!0)
    },
    createBgItemColor: function (a, b) {
        var c = this.getColorBgItem(b);
        c.setVisible(!1);
        a.colorBgItem = c
    },
    bgColorObj: null,
    getColorBgItem: function (a) {
        a = new cc.Sprite("res/bg/" + a + ".png");
        this.addChild(a, 1);
        a.opacity = 130;
        return a
    },
    hideOldLightTiles: function () {
        for (var a = this.circleItem.itemArr, b = 0; b < a.length; b++)a[b].colorBgItem.setVisible(!1)
    },
    backOldPosition: function () {
        this.circleItem.stopAllActions();
        this.canTouch = !1;
        var a = new cc.Sequence(cc.moveTo(0.1, this.circleP), cc.callFunc(function (a, c) {
            c.canTouch = !0
        }, this, this));
        this.circleItem.runAction(a)
    },
    curRectRotation: function () {
        var a = new cc.Sequence(cc.rotateBy(0.15, 180), cc.callFunc(function (a, c) {
            c.changeCircleItemP();
            c.canTouch = !0
        }, this, this));
        this.circleItem.setPosition(this.circleP);
        this.canTouch = !1;
        this.circleItem.runAction(a)
    },
    changeCircleItemP: function () {
        for (var a = this.circleItem.itemArr, b = 0; b < a.length; b++)a[b].offX *= -1, a[b].offY *= -1
    },
    popTotalArr: null,
    popArr: null,
    SPEED_LEN: 0.2,
    checkCanPop: function () {
        function a(a, b) {
            a.removeFromParent();
            b.tileObj[a.logicX][a.logicY].buildingFlag = !1;
            b.tileObj[a.logicX][a.logicY].building = null
        }

        this.popTotalArr = [];
        this.cleanFlag();
        this.moveEndCount = 0;
        var b = this.oldLightTiles;
        this.sortOldTileArr();
        for (var c = 0; c < b.length; c++) {
            var d = b[c].building;
            d.moveSpeed && 0 != d.moveSpeed || (d.moveSpeed = 0, this.popArr = [d], this.checkOneItemCanPop(b[c]), 3 <= this.popArr.length && this.popTotalArr.push(this.popArr))
        }
        if (0 < this.popTotalArr.length)
            for (c = 0; c < this.popTotalArr.length; c++) {
                b = this.popTotalArr[c];
                b.sort(function (a, b) {
                    return b.moveSpeed - a.moveSpeed
                });
                for (var e = 0; e < b.length; e++)
                    if (d = b[e], d.setLocalZOrder(2 +
                            e), 0 < d.moveSpeed) {
                        var f = this.SPEED_LEN / d.moveSpeed, g = this.tileToPoint(d.moveTarget.logicX, d.moveTarget.logicY), f = cc.sequence(cc.moveTo(f, g), cc.callFunc(function (b, c) {
                            if (b.moveTarget.moveTarget) {
                                var d = this.tileToPoint(b.moveTarget.moveTarget.logicX, b.moveTarget.moveTarget.logicY), d = cc.sequence(cc.moveTo(this.SPEED_LEN / b.moveSpeed, d), cc.callFunc(function (b, c) {
                                    a(b, c)
                                }, c, c));
                                b.runAction(d)
                            } else a(b, c)
                        }, this, this));
                        d.runAction(f);
                        1 == d.moveSpeed && this.addShadowAnimation(d)
                    } else f = cc.sequence(cc.delayTime(this.SPEED_LEN), cc.callFunc(this.oneMoveEnd, this, this)), d.runAction(f), d.eatCount = b.length
            } else this.checkGameEnd()
    },
    addShadowAnimation: function (a) {
        var b = a.getPosition(), c = a.moveTarget.getPosition(), c = MyUtil.getAngleByPoints(b, c), b = new cc.Sprite("res/shadow/" + a.colorId + ".png");
        this.addChild(b);
        b.x = a.x;
        b.y = a.y;
        c *= -1;
        a.x < a.moveTarget.x && (c += 180);
        var d = a.moveTarget.x - a.x;
        a = a.moveTarget.y - a.y;
        b.rotation = c;
        a = cc.sequence(cc.delayTime(this.SPEED_LEN / 4), cc.spawn(cc.moveBy(0.2, cc.p(d / 2, a / 2))), cc.callFunc(function (a, b) {
            a.removeFromParent()
        }, this, this));
        b.runAction(a)
    },
    moveEndCount: 0,
    oneMoveEnd: function (a, b) {
        b.addItemPoint(a);
        var c = Number(a.colorId) * a.eatCount;
        b.addScore(c);
        b.showScore(a, c);
        b.moveEndCount++;
        b.moveEndCount >= b.popTotalArr.length && (c = b.bombItem ? cc.sequence(cc.delayTime(0.1), cc.callFunc(function (a, b) {
            b.bombStart()
        }, b, b)) : cc.sequence(cc.delayTime(b.changePointTime), cc.callFunc(function (a, b) {
            b.moveEnd()
        }, b, b)), b.runAction(c))
    },
    bombPopArr: null,
    bombStart: function () {
        function a() {
            if (e[targetLogicX] && e[targetLogicX][targetLogicY]) {
                var a = e[targetLogicX][targetLogicY];
                a.building && d.push(a.building)
            }
        }

        function b(a, b) {
            var c = 0.24;
            b == g.bombItem ? (c = cc.sequence(cc.moveBy(c / 6, cc.p(-3, 3)), cc.moveBy(c / 6, cc.p(6, -6)), cc.moveBy(c / 6, cc.p(-6, 0)), cc.moveBy(c / 6, cc.p(6, 6)), cc.moveBy(c / 6, cc.p(-6, -3)), cc.moveBy(c / 6, cc.p(3, 0)), cc.delayTime(0.15)), c = cc.sequence(cc.delayTime(a), c, cc.callFunc(function () {
                SoundUtile.playMusic("res/music/bomb")
            }, g, g), cc.spawn(cc.fadeOut(0.4).easing(cc.easeExponentialOut()), cc.scaleTo(0.4, 3).easing(cc.easeExponentialOut())), cc.callFunc(g.bombEnd, g, g))) : c = cc.sequence(cc.delayTime(a + (c + 0.15)), cc.callFunc(function (a, b) {
                var c = Number(a.colorId);
                b.addScore(c);
                b.showScore(a, c)
            }, g, g), cc.spawn(cc.fadeOut(0.4).easing(cc.easeExponentialOut()), cc.scaleTo(0.4, 3).easing(cc.easeExponentialOut())), cc.callFunc(g.bombEnd, g, g));
            b.runAction(c)
        }

        var c = this.bombItem;
        this.bombPopArr = [c];
        this.bombCount = 0;
        var d = this.bombPopArr, e = this.tileObj, f = c.logicX, c = c.logicY, g = this;
        targetLogicX = (Number(f) - 2).toString();
        targetLogicY = c.toString();
        a();
        targetLogicX = (Number(f) - 1).toString();
        targetLogicY = (Number(c) + 1).toString();
        a();
        targetLogicX = (Number(f) + 1).toString();
        targetLogicY = (Number(c) + 1).toString();
        a();
        targetLogicX = (Number(f) + 2).toString();
        targetLogicY = (Number(c) + 0).toString();
        a();
        targetLogicX = (Number(f) + 1).toString();
        targetLogicY = (Number(c) - 1).toString();
        a();
        targetLogicX = (Number(f) - 1).toString();
        targetLogicY = (Number(c) - 1).toString();
        a();
        b(0, d[0]);
        if (0 < d.length)
            for (f = 1; f < d.length; f++)b(0.12, d[f]);
        this.showBombParticle()
    },
    showBombParticle: function () {
    },
    bombCount: 0,
    bombEnd: function (a, b) {
        this.bombCount++;
        var c = b.tileObj;
        c[a.logicX][a.logicY].buildingFlag = !1;
        c[a.logicX][a.logicY].building = null;
        a.removeFromParent();
        b.bombCount >= b.bombPopArr.length && (b.bombItem = null, b.checkGameEnd())
    },
    curMaxPoint: 1,
    curTotalPoint: 3,
    changePointTime: 0.25,
    addItemPoint: function (a) {
        var b = Number(a.colorId) + 1, c = b.toString();
        SoundUtile.playMusic("res/music/in");
        if (8 <= b)this.bombItem = a; else {
            if (b > this.curMaxPoint) {
                this.curMaxPoint = b;
                var d = 0;
                6 < b && (b = 6);
                for (var e = 1; e <= b; e++)d += e;
                this.curTotalPoint = d
            }
            a.setLocalZOrder(1);
            d = new cc.Sprite("res/" + c + ".png");
            this.addChild(d, 1);
            d.opacity = 0;
            d.x = a.x;
            d.y = a.y;
            d.logicX = a.logicX;
            d.logicY = a.logicY;
            d.colorId = c;
            this.tileObj[d.logicX][d.logicY].building = d;
            d.oldItem = a;
            a = cc.sequence(cc.fadeIn(this.changePointTime), cc.callFunc(function (a, b) {
                a.oldItem.removeFromParent();
                a.olditem = null
            }, this, this));
            d.runAction(a)
        }
    },
    moveEnd: function () {
        for (var a = this.oldLightTiles, b = 0; b < a.length; b++)a[b] && !a[b].buildingFlag && (a.splice(b, 1), b--);
        this.checkCanPop()
    },
    checkOneItemCanPop: function (a) {
        function b() {
            if (e[f] && e[f][g] && (h = e[f][g], !h.checkedFlag && h.building && h.building.colorId == c.colorId && -1 == m.indexOf(h.building))) {
                m.push(h.building);
                var a = 2 * c.moveSpeed;
                0 == a && (a = 1);
                h.building.moveSpeed = a;
                h.building.moveTarget = c;
                k.push(h)
            }
        }

        if (!a.checkedFlag) {
            a.checkedFlag = !0;
            var c = a.building;
            a = c.logicX;
            var d = c.logicY, e = this.tileObj, f, g, h, k = [], m = this.popArr;
            f = (Number(a) - 2).toString();
            g = d.toString();
            b();
            f = (Number(a) - 1).toString();
            g = (Number(d) + 1).toString();
            b();
            f = (Number(a) +
            1).toString();
            g = (Number(d) + 1).toString();
            b();
            f = (Number(a) + 2).toString();
            g = (Number(d) + 0).toString();
            b();
            f = (Number(a) + 1).toString();
            g = (Number(d) - 1).toString();
            b();
            f = (Number(a) - 1).toString();
            g = (Number(d) - 1).toString();
            b();
            if (0 < k.length)
                for (a = 0; a < k.length; a++)this.checkOneItemCanPop(k[a])
        }
    },
    sortOldTileArr: function () {
        function a() {
            c[targetLogicX] && c[targetLogicX][targetLogicY] && (tmpTileData = c[targetLogicX][targetLogicY], tmpTileData.building && tmpTileData.building.colorId == e.colorId && e.aroundNum++)
        }

        for (var b = this.oldLightTiles, c = this.tileObj, d = 0; d < b.length; d++) {
            var e = b[d].building;
            e.aroundNum = 0;
            var f = e.logicX, g = e.logicY;
            targetLogicX = (Number(f) - 2).toString();
            targetLogicY = g.toString();
            a();
            targetLogicX = (Number(f) - 1).toString();
            targetLogicY = (Number(g) + 1).toString();
            a();
            targetLogicX = (Number(f) + 1).toString();
            targetLogicY = (Number(g) + 1).toString();
            a();
            targetLogicX = (Number(f) + 2).toString();
            targetLogicY = (Number(g) + 0).toString();
            a();
            targetLogicX = (Number(f) + 1).toString();
            targetLogicY = (Number(g) - 1).toString();
            a();
            targetLogicX = (Number(f) - 1).toString();
            targetLogicY = (Number(g) - 1).toString();
            a()
        }
        b.sort(function (a, b) {
            var c = a.building, d = b.building;
            return c.aroundNum == d.aroundNum ? c.x != d.x ? c.x - d.x : c.y - d.y : d.aroundNum - c.aroundNum
        })
    },
    level: 0,
    levelCurCount: 0,
    levelTargetCount: 15,
    levelUp: function () {
        this.level++
    },
    gameEndFlag: !1,
    gameEnd: function () {
        this.gameEndFlag = !0;
        this.unscheduleUpdate();
        cc.log("gameEnd");
        SoundUtile.playMusic("res/music/game_over");
        var a = new cc.Sprite(ChineseFlag ? res.GameOver_png : res.GameOver2_png);
        this.addChild(a, 19);
        a.attr({x: this.size.width / 2, y: this.size.height / 2 - 20 + this.bottomEdgeY, opacity: 0});
        var b = new cc.Sequence(cc.moveBy(1, cc.p(0, -20)).easing(cc.easeCubicActionOut()), cc.delayTime(0.7), cc.callFunc(this.gameEndCallBack, this, this));
        a.runAction(cc.fadeIn(0.8));
        a.runAction(b)
    },
    gameEndCallBack: function (a, b) {
        b.gameEnd1()
    },
    gameEnd1: function () {
        cc.director.pause();
        this.unscheduleUpdate();
        var a = ChineseFlag ? new GameEndLayer2 : new EndLayerEnglish;
        this.endLayer = a;
        this.addChild(a, 25);
        this.setGameScore()
    },
    setGameScore: function () {
        var a = this.score, b = cc.sys.localStorage.getItem("p79_score");
        b || (b = a);
        a > b;
        a >= b && (b = a, cc.sys.localStorage.setItem("p79_score", b));
        this.endLayer.SetMaxScore(b);
        this.endLayer.showScore(a)
    },
    gameLose: function () {
        ChineseFlag && (this.endLayer.SetTipLabel("\u83b7\u5f97\u5956\u54c1\u8fd8\u6709\u4e00\u6b65\u4e4b\u9065\uff01"))
    }
}), MyUtil = {
    getAngleByPoints: function (a, b) {
        return 360 * Math.atan((b.y - a.y) / (b.x - a.x)) / (2 * Math.PI)
    }, getAngle: function (a, b, c, d) {
        a = Math.abs(a - c);
        b = Math.abs(b - d);
        d = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
        b = Math.acos(b / d);
        return 180 / (Math.PI / b)
    }, getPointByCPAndAngleAndLen: function (a, b, c) {
        var d = b * Math.PI / 180;
        b = c * Math.cos(d);
        c *= Math.sin(d);
        return cc.p(a.x + c, a.y + b)
    }
};
SoundUtile = {
    playMusic: function (a) {
        IOS_FLAG ? cc.audioEngine.playEffect(a + ".mp3", !1) : (a += ".ogg", cc.audioEngine.playMusic(a, !1))
    }
};
var GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var a = new GameLayer;
        this.addChild(a)
    }
});
var EndLayer = cc.Layer.extend({
    tipLabel: null, chouJiangItem: null, moreGameItem: null, _shareLabel: null, ctor: function (a) {
        this._super();
        a = cc.director.getVisibleSize();
        var b = new cc.DrawNode;
        this.addChild(b);
        b.clear();
        b.ctor();
        b.drawRect(cc.p(0, 0), cc.p(a.width, a.height), cc.color(0, 0, 0, 200), 1, cc.color(0, 0, 0, 255));
        this._shareLabel = new cc.Sprite.create(res.fenxiang_png);
        this._shareLabel.setAnchorPoint(1, 1);
        this._shareLabel.x = a.width - 25;
        this._shareLabel.y = a.height - 20;
        this._shareLabel.setVisible(!1);
        this.addChild(this._shareLabel);
        this.tipLabel = new cc.LabelTTF("\u6210\u7ee9\u4e0d\u9519\uff0c\u8bd5\u8bd5\u624b\u6c14\uff01", "Arial", 45);
        this.tipLabel.x = a.width / 2;
        this.tipLabel.y = a.height / 2 - 45;
        this.addChild(this.tipLabel);
        b = new cc.MenuItemImage(res.JiXuBtn_png, res.JiXuBtn_png, function () {
            cc.log("JiXuBtn is clicked!");
            cc.director.runScene(new GameScene);
            cc.director.resume()
        }, this);
        b.attr({x: a.width / 2 - 150, y: a.height / 5, anchorX: 0.5, anchorY: 0.5});
        var c = new cc.MenuItemSprite(new cc.Sprite(res.Share_png), new cc.Sprite(res.Share_png), function () {
            this._shareLabel.setVisible(!0)
        }, this);
        c.attr({x: a.width / 2 + 150, y: a.height / 5, anchorX: 0.5, anchorY: 0.5});
        this.moreGameItem = new cc.MenuItemImage(res.MoreGame_png, res.MoreGame_png, function () {
            console.log(11)
        }, this);
        this.moreGameItem.attr({x: a.width / 2, y: a.height / 2 - 150, anchorX: 0.5, anchorY: 0.5});
        a.x = 0;
        a.y = 0;
        this.addChild(a)
    }, showScore: function (a) {
        var b = cc.director.getVisibleSize(), c = new cc.Sprite(res.ScoreBg_png);
        this.addChild(c);
        c.attr({x: b.width / 2, y: 3 * b.height / 4 + 45});
        a = new cc.LabelTTF(a.toString(), "Arial", 49);
        this.addChild(a);
        a.attr({x: b.width / 2, y: 3 * b.height / 4 + 45, color: cc.color("#000000")})
    }, SetMaxScore: function (a) {
        var b = cc.director.getVisibleSize(), c = new cc.LabelTTF("\u6700\u9ad8\u6210\u7ee9\uff1a" + a + "\u5206", "Arial", 45);
        this.addChild(c);
        c.attr({x: b.width / 2, y: 2 * b.height / 3 - 15});
        console.log("\u516d\u89d2\u62fc\u62fc\uff5e\u6211\u7684\u6700\u597d\u6210\u7ee9\uff1a" +
            a + "\u5206\uff0c\u6765\u8bd5\u4e00\u4e0b\uff1f")
    }, SetTipLabel: function (a) {
        this.tipLabel.string = a
    }, SetChouJiangVisible: function (a) {
        this.chouJiangItem.setVisible(a);
        this.moreGameItem.setVisible(a);
        a || this.tipLabel.setVisible(!0);
        "" == sys_activityID && (this.moreGameItem.setVisible(!0), this.tipLabel.setVisible(!1))
    }
});
var EndLayerEnglish = cc.Layer.extend({
    tipLabel: null, chouJiangItem: null, moreGameItem: null, _shareLabel: null, size: null, ctor: function () {
        this._super();
        var a = cc.director.getVisibleSize();
        a.height -= AD_REAL_H;
        this.size = a;
        var b = new cc.LayerColor(cc.color(0, 0, 0, 230));
        this.addChild(b);
        cc.log("AD_REAL_H : " + AD_REAL_H);
        this.tipLabel = new cc.LabelTTF("", "Arial", 45);
        this.tipLabel.setAnchorPoint(0.5, 1);
        this.tipLabel.x = a.width / 2;
        this.tipLabel.y = 2 * a.height / 3 - 130 + AD_REAL_H;
        this.addChild(this.tipLabel);
        var b = a.height / 2 - 200 + AD_REAL_H, c = new cc.MenuItemImage(res.IconGame_png, res.IconGame_png, function () {
            console.log("IconGame_png");
        }, this);
        c.attr({x: a.width / 2, y: b + 80, anchorX: 0.5, anchorY: 0.5});
        c.color = cc.color("#fcf253");
        c.scale = 0.8;
        c.y -= 0.1 * c.height;
        var d = new cc.MenuItemImage(res.IconFacebook_png, res.IconFacebook_png, function () {
            this.onFacebookClick()
        }, this);
        d.attr({x: a.width / 2 - 130, y: b - 80, anchorX: 0.5, anchorY: 0.5});
        var e = new cc.MenuItemImage(res.IconReplay_png, res.IconReplay_png, function () {
            cc.director.runScene(new GameScene);
            cc.director.resume()
        }, this);
        e.attr({x: a.width / 2 + 130, y: d.y, anchorX: 0.5, anchorY: 0.5});
        var f = new cc.MenuItemImage(res.IconTwitter_png, res.IconTwitter_png, function () {
            this.onTwitterClick()
        }, this);
        f.attr({x: a.width / 2, y: d.y, anchorX: 0.5, anchorY: 0.5});
        a = new cc.Menu(f, d, e, c);
        a.x = 0;
        a.y = 0;
        this.addChild(a);
        a = d.x - d.width / 2;
        e = e.x + e.width / 2;
        d = b - 1;
        b += 1;
        c = new cc.DrawNode;
        c.drawRect(cc.p(a, d), cc.p(e, b), cc.color("#ffffff"), 0, cc.color("#ffffff"));
        this.addChild(c)
    }, showScore: function (a) {
        var b = this.size, c = new cc.Sprite(res.ScoreBg_png);
        this.addChild(c);
        c.attr({x: b.width / 2, y: 2 * b.height / 3 + AD_REAL_H});
        a = new cc.LabelTTF(a.toString(), "Arial", 80);
        this.addChild(a);
        a.attr({x: b.width / 2, y: 2 * b.height / 3 + AD_REAL_H, color: cc.color("#000000")})
    }, bestScore: 0, SetMaxScore: function (a) {
        this.bestScore = a;
        this.tipLabel.string = "Best : " +
            a;
        cc.log("this.tipLabel.x: " + this.tipLabel.x)
    }, onTwitterClick: function () {
        console.log("onTwitterClick");
    }, onFacebookClick: function () {
        console.log("onFacebookClick");
    }, onShareSimpleLink: function () {
    }
});
var GameEndLayer2 = cc.Layer.extend({
    tipLabel: null, chouJiangItem: null, moreGameItem: null, _shareLabel: null, ctor: function () {
        this._super();
        var a = cc.director.getVisibleSize(), b = new cc.LayerColor(cc.color(0, 0, 0, 230));
        this.addChild(b);
        this._shareLabel = new cc.Sprite.create(res.fenxiang2_png);
        this._shareLabel.setAnchorPoint(1, 1);
        this._shareLabel.x = a.width - 25;
        this._shareLabel.y = a.height - 20;
        this.addChild(this._shareLabel);
        b = new cc.LabelTTF("\u5206\u4eab\u7ed9\u670b\u53cb", "Arial", 40);
        b.setAnchorPoint(1, 0.5);
        b.x = a.width - this._shareLabel.getContentSize().width;
        b.y = a.height - this._shareLabel.getContentSize().height / 2 - 20;
        this.addChild(b);
        this.tipLabel = new cc.LabelTTF("", "Arial", 46, cc.size(600, 600), cc.TEXT_ALIGNMENT_LEFT);
        this.tipLabel.setAnchorPoint(0.5, 1);
        this.tipLabel.x = a.width / 2;
        this.tipLabel.y = a.height - this._shareLabel.getContentSize().height - 50;
        this.addChild(this.tipLabel);
        b = new cc.MenuItemImage(res.JiXuBtn_png, res.JiXuBtn_png, function () {
            cc.director.runScene(new GameScene);
            cc.director.resume()
        }, this);
        b.attr({x: a.width / 2, y: a.height / 5 + 60, anchorX: 0.5, anchorY: 0.5});
        var c = new cc.MenuItemSprite(new cc.Sprite(res.MoreGame_png), new cc.Sprite(res.MoreGame_png), function () {
            window.location.href = "http://t.cn/R5A0ttf";
        }, this);
        c.attr({x: a.width / 2, y: a.height / 2 - 120, anchorX: 0.5, anchorY: 0.5});
        a = new cc.Menu(b, c);
        a.x = 0;
        a.y = 0;
        this.addChild(a)
    }, showScore: function (a) {
        cc.director.getVisibleSize();
        parseFloat(a / game_max_score).toFixed(2);
        var b = "\u6211\u771f\u662f\u592a\u5389\u5bb3\uff0c\u5728\u516d\u89d2\u62fc\u62fc\u4e2d\u7adf\u7136\u5f97\u4e860\u5206\uff0c\u5168\u7403\u53ea\u67091\u4e2a\u4eba\u5f970\u5206\uff0c\u90a3\u4e2a\u4eba\u5c31\u662f\u6211\u5440\uff01";
        a >= game_max_score ? b = "\u6211\u5728\u516d\u89d2\u62fc\u62fc\u4e2d\u5f97\u4e86" + a + "\u5206\uff0c\u51fb\u8d25\u4e86\u5168\u7403\u6240\u6709\u5bf9\u624b\uff0c\u7b49\u4f60\u6765\u6218\uff01" : 0 < a && 150 >= a ? b = "\u6211\u5728\u516d\u89d2\u62fc\u62fc\u4e2d\u5f97\u4e86" +
            a + "\u5206\uff0c\u771f\u662f\u592a\u68d2\u4e86\uff0c\u518d\u7ec3\u7ec3\u5c31\u8fbe\u5230\u719f\u80fd\u751f\u5de7\uff01" : 150 < a && 500 >= a ? b = "\u6211\u5728\u516d\u89d2\u62fc\u62fc\u4e2d\u5f97\u4e86" + a + "\u5206\uff0c\u771f\u662f\u592a\u68d2\u4e86\uff0c\u518d\u7ec3\u7ec3\u5c31\u662f\u7089\u706b\u7eaf\u9752\u5566\uff01" : 500 < a && 750 >= a ? b = "\u6211\u5728\u516d\u89d2\u62fc\u62fc\u4e2d\u5f97\u4e86" + a + "\u5206\uff0c\u51fb\u8d25\u4e86\u5168\u7403" + (Math.floor(12 * (a - 500) / 250) + 80) + "%\u7684\u73a9\u5bb6\uff0c\u8fbe\u5230\u4e86\u7089\u706b\u7eaf\u9752\u7684\u5883\u754c\uff01" : 750 < a && 1250 >= a ? b = "\u6211\u5728\u516d\u89d2\u62fc\u62fc\u4e2d\u5f97\u4e86" + a + "\u5206\uff0c\u51fb\u8d25\u4e86\u5168\u7403" + (Math.floor(7 * (a - 750) / 500) + 92) + "%\u7684\u73a9\u5bb6\uff0c\u8fbe\u5230\u4e86\u51fa\u795e\u5165\u5316\u7684\u5883\u754c!" : 1250 < a && 2E3 >= a ? b = "\u6211\u5728\u516d\u89d2\u62fc\u62fc\u4e2d\u5f97\u4e86" + a + "\u5206\uff0c\u51fb\u8d25\u4e86\u5168\u740399%\u7684\u73a9\u5bb6\uff0c\u8fbe\u5230\u4e86\u72ec\u5b64\u6c42\u8d25\u7684\u5883\u754c\uff01" : 2E3 < a && a < game_max_score && (b = 20 - Math.ceil(17 * (a -
                2E3) / (game_max_score - 2E3)), b = "\u6211\u5728\u516d\u89d2\u62fc\u62fc\u4e2d\u5f97\u4e86" + a + "\u5206\uff0c\u636e\u8bf4\u5168\u7403\u53ea\u6709 " + b + "\u4e2a\u4eba\u8fbe\u5230\u8fd9\u4e2a\u6c34\u5e73\uff01\u6709\u4f60\u5417\uff1f");
        a >= game_max_score && (game_max_score = a);
        updateShare(a);
        Play68.setRankingScoreDesc(a);
        this.tipLabel.string = b;
    }, SetMaxScore: function (a) {
    }
});
var GameInfoLayer = cc.LayerColor.extend({
    ctor: function () {
        this._super();
        this.init()
    }, init: function () {
        this._super(cc.color(0, 0, 0, 180));
        var a = cc.director.getVisibleSize();
        cc.p(a.width / 2, a.height / 2);
        var b, c;
        ChineseFlag ? (b = "\u70b9\u51fb\u4e0b\u9762\u65b9\u5757\u53ef\u8fdb\u884c\u65cb\u8f6c\uff0c\u53ef\u5c06\u65b9\u5757\u62d6\u5165\u4e0a\u65b9\u7a7a\u767d\u5904\uff0c\u5f53\u5468\u56f4\u8fde\u63a53\u4e2a\u540c\u8272\uff08\u540c\u70b9\u6570\uff09\u65f6\uff0c\u53ef\u4ee5\u8fdb\u884c\u6d88\u9664\u5408\u5e76\u3002", c = "\u70b9\u51fb\u5f00\u59cb") : (b = "Click on the following squares can rotate, can be square above into a blank space, when connecting three the same color, can be eliminated to merge.", c = "Start");
        b = new cc.LabelTTF(b, "Arial", 42, cc.size(600, 450), cc.TEXT_ALIGNMENT_LEFT);
        b.setAnchorPoint(0.5, 1);
        b.x = a.width / 2;
        b.y = 3 * a.height / 4;
        this.addChild(b);
        c = new cc.LabelTTF(c, "Arial", 60);
        c.x = a.width / 2;
        c.y = a.height / 5;
        this.addChild(c);
        a = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: this.onTouchBegin,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });
        cc.eventManager.addListener(a, this)
    }, onTouchBegin: function (a, b) {
        var c = b.getCurrentTarget();
        cc.director.resume();
        c.parent.gameStart();
        c.removeFromParentAndCleanup();
        return !1
    }, onTouchMoved: function (a, b) {
    }, onTouchEnded: function (a, b) {
    }
});
var hexcase = 0, b64pad = "", chrsz = 8;
function hex_md5(a) {
    return binl2hex(core_md5(str2binl(a), a.length * chrsz))
}
function b64_md5(a) {
    return binl2b64(core_md5(str2binl(a), a.length * chrsz))
}
function str_md5(a) {
    return binl2str(core_md5(str2binl(a), a.length * chrsz))
}
function hex_hmac_md5(a, b) {
    return binl2hex(core_hmac_md5(a, b))
}
function b64_hmac_md5(a, b) {
    return binl2b64(core_hmac_md5(a, b))
}
function str_hmac_md5(a, b) {
    return binl2str(core_hmac_md5(a, b))
}
function md5_vm_test() {
    return "900150983cd24fb0d6963f7d28e17f72" == hex_md5("abc")
}
function core_md5(a, b) {
    a[b >> 5] |= 128 << b % 32;
    a[(b + 64 >>> 9 << 4) + 14] = b;
    for (var c = 1732584193, d = -271733879, e = -1732584194, f = 271733878, g = 0; g < a.length; g += 16)var h = c, k = d, m = e, n = f, c = md5_ff(c, d, e, f, a[g + 0], 7, -680876936), f = md5_ff(f, c, d, e, a[g + 1], 12, -389564586), e = md5_ff(e, f, c, d, a[g + 2], 17, 606105819), d = md5_ff(d, e, f, c, a[g + 3], 22, -1044525330), c = md5_ff(c, d, e, f, a[g + 4], 7, -176418897), f = md5_ff(f, c, d, e, a[g + 5], 12, 1200080426), e = md5_ff(e, f, c, d, a[g + 6], 17, -1473231341), d = md5_ff(d, e, f, c, a[g + 7], 22, -45705983), c = md5_ff(c, d, e, f, a[g + 8], 7, 1770035416), f = md5_ff(f, c, d, e, a[g + 9], 12, -1958414417), e = md5_ff(e, f, c, d, a[g + 10], 17, -42063), d = md5_ff(d, e, f, c, a[g + 11], 22, -1990404162), c = md5_ff(c, d, e, f, a[g + 12], 7, 1804603682), f = md5_ff(f, c, d, e, a[g + 13], 12, -40341101), e = md5_ff(e, f, c, d, a[g + 14], 17, -1502002290), d = md5_ff(d, e, f, c, a[g + 15], 22, 1236535329), c = md5_gg(c, d, e, f, a[g + 1], 5, -165796510), f = md5_gg(f, c, d, e, a[g + 6], 9, -1069501632), e = md5_gg(e, f, c, d, a[g + 11], 14, 643717713), d = md5_gg(d, e, f, c, a[g + 0], 20, -373897302), c = md5_gg(c, d, e, f, a[g + 5], 5, -701558691), f = md5_gg(f, c, d, e, a[g +
    10], 9, 38016083), e = md5_gg(e, f, c, d, a[g + 15], 14, -660478335), d = md5_gg(d, e, f, c, a[g + 4], 20, -405537848), c = md5_gg(c, d, e, f, a[g + 9], 5, 568446438), f = md5_gg(f, c, d, e, a[g + 14], 9, -1019803690), e = md5_gg(e, f, c, d, a[g + 3], 14, -187363961), d = md5_gg(d, e, f, c, a[g + 8], 20, 1163531501), c = md5_gg(c, d, e, f, a[g + 13], 5, -1444681467), f = md5_gg(f, c, d, e, a[g + 2], 9, -51403784), e = md5_gg(e, f, c, d, a[g + 7], 14, 1735328473), d = md5_gg(d, e, f, c, a[g + 12], 20, -1926607734), c = md5_hh(c, d, e, f, a[g + 5], 4, -378558), f = md5_hh(f, c, d, e, a[g + 8], 11, -2022574463), e = md5_hh(e, f, c, d, a[g +
    11], 16, 1839030562), d = md5_hh(d, e, f, c, a[g + 14], 23, -35309556), c = md5_hh(c, d, e, f, a[g + 1], 4, -1530992060), f = md5_hh(f, c, d, e, a[g + 4], 11, 1272893353), e = md5_hh(e, f, c, d, a[g + 7], 16, -155497632), d = md5_hh(d, e, f, c, a[g + 10], 23, -1094730640), c = md5_hh(c, d, e, f, a[g + 13], 4, 681279174), f = md5_hh(f, c, d, e, a[g + 0], 11, -358537222), e = md5_hh(e, f, c, d, a[g + 3], 16, -722521979), d = md5_hh(d, e, f, c, a[g + 6], 23, 76029189), c = md5_hh(c, d, e, f, a[g + 9], 4, -640364487), f = md5_hh(f, c, d, e, a[g + 12], 11, -421815835), e = md5_hh(e, f, c, d, a[g + 15], 16, 530742520), d = md5_hh(d, e, f, c, a[g + 2], 23, -995338651), c = md5_ii(c, d, e, f, a[g + 0], 6, -198630844), f = md5_ii(f, c, d, e, a[g + 7], 10, 1126891415), e = md5_ii(e, f, c, d, a[g + 14], 15, -1416354905), d = md5_ii(d, e, f, c, a[g + 5], 21, -57434055), c = md5_ii(c, d, e, f, a[g + 12], 6, 1700485571), f = md5_ii(f, c, d, e, a[g + 3], 10, -1894986606), e = md5_ii(e, f, c, d, a[g + 10], 15, -1051523), d = md5_ii(d, e, f, c, a[g + 1], 21, -2054922799), c = md5_ii(c, d, e, f, a[g + 8], 6, 1873313359), f = md5_ii(f, c, d, e, a[g + 15], 10, -30611744), e = md5_ii(e, f, c, d, a[g + 6], 15, -1560198380), d = md5_ii(d, e, f, c, a[g + 13], 21, 1309151649), c = md5_ii(c, d, e, f, a[g + 4], 6, -145523070), f = md5_ii(f, c, d, e, a[g + 11], 10, -1120210379), e = md5_ii(e, f, c, d, a[g + 2], 15, 718787259), d = md5_ii(d, e, f, c, a[g + 9], 21, -343485551), c = safe_add(c, h), d = safe_add(d, k), e = safe_add(e, m), f = safe_add(f, n);
    return [c, d, e, f]
}
function md5_cmn(a, b, c, d, e, f) {
    return safe_add(bit_rol(safe_add(safe_add(b, a), safe_add(d, f)), e), c)
}
function md5_ff(a, b, c, d, e, f, g) {
    return md5_cmn(b & c | ~b & d, a, b, e, f, g)
}
function md5_gg(a, b, c, d, e, f, g) {
    return md5_cmn(b & d | c & ~d, a, b, e, f, g)
}
function md5_hh(a, b, c, d, e, f, g) {
    return md5_cmn(b ^ c ^ d, a, b, e, f, g)
}
function md5_ii(a, b, c, d, e, f, g) {
    return md5_cmn(c ^ (b | ~d), a, b, e, f, g)
}
function core_hmac_md5(a, b) {
    var c = str2binl(a);
    16 < c.length && (c = core_md5(c, a.length * chrsz));
    for (var d = Array(16), e = Array(16), f = 0; 16 > f; f++)d[f] = c[f] ^ 909522486, e[f] = c[f] ^ 1549556828;
    c = core_md5(d.concat(str2binl(b)), 512 + b.length * chrsz);
    return core_md5(e.concat(c), 640)
}
function safe_add(a, b) {
    var c = (a & 65535) + (b & 65535);
    return (a >> 16) + (b >> 16) + (c >> 16) << 16 | c & 65535
}
function bit_rol(a, b) {
    return a << b | a >>> 32 - b
}
function str2binl(a) {
    for (var b = [], c = (1 << chrsz) - 1, d = 0; d < a.length * chrsz; d += chrsz)b[d >> 5] |= (a.charCodeAt(d / chrsz) & c) << d % 32;
    return b
}
function binl2str(a) {
    for (var b = "", c = (1 << chrsz) - 1, d = 0; d < 32 * a.length; d += chrsz)b += String.fromCharCode(a[d >> 5] >>> d % 32 & c);
    return b
}
function binl2hex(a) {
    for (var b = hexcase ? "0123456789ABCDEF" : "0123456789abcdef", c = "", d = 0; d < 4 * a.length; d++)c += b.charAt(a[d >> 2] >> d % 4 * 8 + 4 & 15) + b.charAt(a[d >> 2] >> d % 4 * 8 & 15);
    return c
}
function binl2b64(a) {
    for (var b = "", c = 0; c < 4 * a.length; c += 3)
        for (var d = (a[c >> 2] >> c % 4 * 8 & 255) << 16 | (a[c + 1 >> 2] >> (c + 1) % 4 * 8 & 255) << 8 | a[c + 2 >> 2] >> (c + 2) % 4 * 8 & 255, e = 0; 4 > e; e++)b = 8 * c + 6 * e > 32 * a.length ? b + b64pad : b + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(d >> 6 * (3 - e) & 63);
    return b
};
var PC_FLAG = !1, ChineseFlag = !0;
cc.game.onStart = function () {
    !cc.sys.isNative && document.getElementById("cocosLoading") && document.body.removeChild(document.getElementById("cocosLoading"));
    cc.view.enableRetina(cc.sys.os === cc.sys.OS_IOS ? !0 : !1);
    cc.view.adjustViewPort(!0);
    cc.sys.os === cc.sys.OS_IOS || cc.sys.os === cc.sys.OS_ANDROID || cc.sys.os === cc.sys.OS_BLACKBERRY || cc.sys.os === cc.sys.OS_WP8 || cc.sys.os === cc.sys.OS_BADA ? cc.view.setDesignResolutionSize(720, 1280, cc.ResolutionPolicy.FIXED_WIDTH) : (PC_FLAG = !0, cc.view.setDesignResolutionSize(720, 1280, cc.ResolutionPolicy.SHOW_ALL));
    cc.sys.language == cc.sys.LANGUAGE_CHINESE && (ChineseFlag = !0);
    document.getElementById("loadingImg") && document.body.removeChild(document.getElementById("loadingImg"));
    cc.view.resizeWithBrowserSize(!0);
    cc._loaderImage = "";
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new GameScene)
    }, this)
};
cc.game.run();
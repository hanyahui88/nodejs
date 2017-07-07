/**
 * 封装的ajax方法，在请求的时候，自动把参数做了签名 Created by 韩亚辉 on 2016/9/8.
 */
var dingTalk = (function () {

    // 服务器
    var ip = "http://api.quandashi.com/qds/";
    // var ip = "http://pre-api.quandashi.com/qds/";
    // 图片路径
    var baseUrl = ip + "api";
    //正式地址
    var imgPath = "http://files.quandashi.com/";
    //测试地址
    // var imgPath = "http://filestest.quandashi.cn/";
    var brandpath = "http://images.quandashi.com/";
    var templateUrl = "http://files.quandashi.com/moban/2016/09/22/73885000-b0ae-40fe-87cc-5a16a3ff1313.doc";
    var appSecret = "qcHyDJ2S9zN5F6o7dUdsk9PqZtneTY";
    var appKey = "quandashi4809917355";
    //支付的服务器地址
    var payIp =ip + "aliWeb/getPayIndex";
    /**
     * 获取url上的参数
     *
     * @param name
     *            参数名
     * @returns {*} 参数值
     */
    var getParam = function (name) {
        var LocString = String(window.document.location.href);
        var rs = new RegExp("(^|)" + name + "=([^&]*)(&|$)", "gi")
            .exec(LocString), tmp;
        if (tmp = rs) {
            return tmp[2];
        }
        return "";
    };
    var data = function () {
        var data = {
            "map": {},
            "method": "",
            "appKey": appKey,
            "timestamp": "",
            "signMethod": "md5",// 枚举值 hmac md5
            "sign": "",
            "v": "1.0",
            "format": "json",
            "partnerId": "",
            "targetAppKey": "",
            "simplify": "false"
        };
        return data;
    };
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-top-center",
        "onclick": null,
        "showDuration": "1000",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
    var error = function (msg) {
        toastr.error(msg);
    };
    var info = function (msg) {
        toastr.info(msg);
    };
    var warn = function (msg) {
        toastr.warning(msg);
    };
    var success = function (msg) {
        toastr.success(msg);
    };
    /**
     * get请求
     *
     * @param url
     *            不带主机的请求地址
     * @param callBack
     *            回调函数
     */
    var getRequest = function (url, callBack) {
        $.ajax({
            url: ip + url,
            dataType: "json",
            type: "get",
            async: false,
            success: function (data) {
                if (data.code == 9091) {
                    if (data.subCode == 10002 && $.isFunction(callBack)) {
                        callBack(data);
                    } else {
                        toastr.warning(data.subMessage);
                    }
                } else {
                    toastr.error(data.message);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };
    var getTimeStamp = function () {
        getRequest('global/getTimestamp', function (data) {
            if (data.data) {
                var time = new Date().getTime();
                var timeStamp = time - data.data.timestamp;
                localStorage.setItem("timeStamp", timeStamp);
            }
        });
    };
    /**
     * post请求
     *
     * @param url
     *            不带主机的请求地址
     * @param data
     *            请求数据
     * @param callBack
     *            回调函数
     */
    var postRequest = function (data, callBack) {
        data = sign(data);
        $.ajax({
            url: baseUrl,
            data: JSON.stringify(data),
            contentType: 'application/json;charset=UTF-8',
            dataType: "json",
            type: "post",
            success: function (data) {
                // console.info(data);
                if (data.code == 9091) {
                    if (data.subCode == 10002 && $.isFunction(callBack)) {
                        callBack(data);
                    } else {
                        toastr.warning(data.subMessage);
                    }
                } else {
                    toastr.error(data.message);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $('.myloading').hide();
                console.log(XMLHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };

    /**
     * 签名算法
     *
     * @param obj
     *            需要签名的对象 只是一个map对象
     */
    var sign = function (obj) {
        var time = localStorage.getItem("timeStamp");
        if (!time) {
            getTimeStamp();
            time = localStorage.getItem("timeStamp");
        }
        var timestamp = new Date().getTime();
        var currentTime = timestamp + parseInt(time);
        // 1.重新封装
        var map = {};
        obj.timestamp = currentTime;
        map.method = obj.method;
        map.appKey = obj.appKey;
        if (obj.timestamp) {
            map.timestamp = obj.timestamp;
        } else {
            map.timestamp = currentTime;
        }
        map.signMethod = obj.signMethod;
        if (obj.v) {
            map.v = obj.v;
        }
        if (obj.format) {
            map.format = obj.format;
        }
        if (obj.partnerId) {
            map.partnerId = obj.partnerId;
        }
        if (obj.session) {
            map.session = obj.session;
        }
        if (obj.targetAppKey) {
            map.targetAppKey = obj.targetAppKey;
        }
        if (obj.simplify) {
            map.simplify = obj.simplify;
        }
        //针对文件上传
        if (obj.files) {
            map.files = obj.files;
            map.type = obj.type;
        }
        if (obj.map) {
            for (var i in obj.map) {
                map[i] = obj.map[i];
            }
        }
        var keys = [];
        // 2.根据键排序
        for (var i in map) {
            keys.push(i);
        }
        keys.sort();
        // 3 把所有的键值，相连
        var str = "";
        if (map.signMethod.toLowerCase() == "md5") {
            // 如果是md5的签名算法,字符串前后添加appSecret
            str += appSecret;
        }
        for (var i in keys) {
            var key = keys[i];
            if (key != null && (key + '').length != 0 && map[key] != null && (map[key] + '').length != 0) {
                str += key + map[key];
            }
        }
        if (map.signMethod.toLowerCase() == "md5") {
            // 如果是md5的签名算法,字符串前后添加appSecret
            str += appSecret;
            str = hex_md51(str).toUpperCase();
        } else {
            str = hex_hmac_md51(appSecret, str).toUpperCase();
        }
        obj.sign = str;
        return obj;
    };
    /*
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321. Version 2.1 Copyright (C) Paul
     * Johnston 1999 - 2002. Other contributors: Greg Holt, Andrew Kepert,
     * Ydnar, Lostinet Distributed under the BSD License See
     * http://pajhome.org.uk/crypt/md5 for more info.
     */
    function hex_md51(s) {
        return md5(s, false, false);
    }

    function hex_hmac_md51(key, data) {
        return md5(data, key, false);
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }

    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a = 1732584193,
            b = -271733879,
            c = -1732584194,
            d = 271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
     * Convert an array of little-endian words to a string
     */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
     * Calculate the MD5 of a raw string
     */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
     * Calculate the HMAC-MD5, of a key and some data (raw strings)
     */
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
     * Convert a raw string to a hex string
     */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
     * Encode a string as utf-8
     */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
     * Take string arguments and return either raw or hex encoded strings
     */
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }

    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }

    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }

    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            } else {
                return raw_md5(string);
            }
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        } else {
            return raw_hmac_md5(key, string);
        }
    }

    /**
     * 获取所有的业务
     */
    var getDaiType = function () {
        var images = JSON.parse(localStorage.getItem("daiType"));
        if (!images) {
            var data1 = new data();
            data1.method = "productServiceList";
            postRequest(data1, function (result) {
                var data2 = result.data;
                if (data2) {
                    localStorage.setItem("daiType", JSON.stringify(data2.business));
                }
            })
        }
    };
    var getImageUrl = function (id) {
        var images = JSON.parse(localStorage.getItem("daiType"));
        for (var i = 0; i < images.length; i++) {
            if (id == images[i].did) {
                if (images[i].applogo) {
                    return dingTalk.imgPath + images[i].applogo;
                }
            }
        }
    };
    /**
     * 判断特殊字符
     * @param str 字段
     * @returns {boolean} 如果包含返回true
     */
    var judgeChars = function (str) {
        var pattern = new RegExp("[`~#$^&*={}<>@￥——]");
        if (pattern.test(str)) {
            return true;
        }
        return false;
    };

    return {
        post: postRequest,
        get: getRequest,
        data: data,
        ip: ip,
        payIp:payIp,
        imgPath: imgPath,
        getParam: getParam,
        brandpath: brandpath,
        templateUrl: templateUrl,
        hex_md5: hex_md51,
        sign: sign,
        getTimeStamp: getTimeStamp,
        appKey: appKey,
        getDaiType: getDaiType,
        getImageUrl: getImageUrl,
        error: error,
        info: info,
        warn: warn,
        success: success,
        judgeChars: judgeChars
    }
}());
function checkInvoice(title, info) {
    if (info != null && info != '' && typeof(info) != "undefined") {
        return '<li class="mui-table-view-cell">' +
            title + info +
            '</li>';
    }
    return "";
}
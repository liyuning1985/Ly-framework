/**
 * Description: TinyUI2.0 components
 * Version: 2.6.0
 * Date: 2017-08-12
 */

/**
 * @description
 *  用来注册各组件通用的服务
 */
define('components/common/service/service',[], function () {
    'use strict';
    var toolModule = angular.module('tiny.service', []);
    toolModule.service('tiService', tinyService);

    function tinyService() {
        // contains
        this.contains = function (arr, item) {
            if (angular.isArray(arr)) {
                return _.contains(arr, item);
            }

            return false;
        };
        // add
        this.add = function (arr, item) {
            arr = angular.isArray(arr) ? arr : [];
            if (!_.contains(arr, item)) {
                arr.push(item);
            }

            return arr;
        };
        // remove
        this.remove = function (arr, item) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (arr[i] === item) {
                        arr.splice(i, 1);
                        break;
                    }

                }
            }

            return arr;
        };
    }
    return toolModule.name;
});

define('components/common/utils/browser',[], function(){
    !window.tiny && (window.tiny = {});
    !tiny.utils && (tiny.utils = {});
    tiny.utils.browser = browserDetect();

    /**
     * 检测浏览器的类型及版本
     * @return {Object} [属性version表示浏览器的版本，是字符串类型；小写的浏览器名称属性，是布尔型]
     */
    function browserDetect() {
        var browser = {};
        var userAgent = navigator.userAgent.toLowerCase(), aAgentInfo;

        (aAgentInfo = userAgent.match(/rv:([\d.]+)\) like gecko/)) ? browser.ie = true :
            (aAgentInfo = userAgent.match(/msie ([\d.]+)/)) ? browser.ie = true :
                (aAgentInfo = userAgent.match(/firefox\/([\d.]+)/)) ? browser.firefox = true :
                    (aAgentInfo = userAgent.match(/chrome\/([\d.]+)/)) ? browser.chrome = true :
                        (aAgentInfo = userAgent.match(/opera.([\d.]+)/)) ? browser.opera = true :
                            (aAgentInfo = userAgent.match(/version\/([\d.]+).*safari/)) ? browser.safari = true : 0;

        _.isArray(aAgentInfo) && (browser.version = aAgentInfo[1]);

        return browser;
    }

    return tiny.utils.browser;
})

;
define('components/common/utils/placeholder',["components/common/utils/browser"],function (browser) {
    "use strict";
    !window.tiny && (window.tiny = {});
    !tiny.utils && (tiny.utils = {});
    tiny.utils.placeholder = {};
    var placeholder = tiny.utils.placeholder;

    // 判断浏览器是否支持placeholder属性：通过input标签或者textarea标签是否有placeholder属性判断
    // IE高版本下input设置placeholder时会触发input事件，因此IE高版本下不通过原生placeholder方式来实现
    if ((!window.tiny.utils.browser.ie) && ('placeholder' in document.createElement('input'))) {
        placeholder.setPlaceholder = function(elem, plValue) {
            if (typeof plValue === "string") {
                $(elem).attr("placeholder", plValue);
            }
        }

        placeholder.clearPlaceholder = function(){};

        // tagSearch中需要动态修改placeholder的值，为了和IE9下保持一致，所以需要添加这个方法
        placeholder.updatePlaceholder = placeholder.setPlaceholder;
    } else {
        placeholder.setPlaceholder = setPlaceholder;

        placeholder.clearPlaceholder = clearPlaceholder;

        placeholder.updatePlaceholder = function(elem, plValue) {
            if (typeof plValue === "string") {
                $(elem).attr("tiPlaceholder", plValue);
            }
        };

        var hooks = {
            get : getFn,
            set : setFn
        };
        $.valHooks.input = hooks;
        $.valHooks.textarea = hooks;
        $.propHooks.value = hooks;
    }

    function setPlaceholder(elem, plValue) {
        if (typeof plValue !== "string") {
            return;
        }

        var $element = $(elem);
        var element = $element[0];
        $element.attr("tiPlaceholder", plValue);

        // 动态更新placeholder时，不需要重新记录输入框默认类型
        // 解决问题：password类型输入框时，输入框内容为空时更新placeholder时，避免defaultType成为text
        if (!_.isString($element.data("defaultType"))) {
            $element.data("defaultType", element.type);
        }

        if($element.val() === '') {
            addPlaceholder(element);
        }

        element.onfocus = function() {
            if($element.hasClass("ti-placeholder")) {
                clearPlaceholder(element);
            }
        };

        element.onblur = function() {
            if(element.value === '') {
                addPlaceholder(element);
            }
        }
    }

    function clearPlaceholder(element) {
        var $element = $(element);
        element.value = '';
        $element.removeClass("ti-placeholder");
        if($element.data("defaultType") === "password") {
            element.type = "password";
        }
    }

    function addPlaceholder(element) {
        var $element = $(element);
        element.value = $element.attr("tiPlaceholder");
        $element.addClass("ti-placeholder");
        if($element.data("defaultType") === "password") {
            element.type = "text";
        }
    }

    function getFn(element) {
        var $element = $(element);
        return $element.hasClass("ti-placeholder") ? '' : element.value;
    }

    function setFn(element, value) {
        var $element = $(element);

        if ($element.attr("tiPlaceholder") === undefined) {
            element.value = value;
            return $element;
        }

        if (value === '') {
            element.value = "";
            // 如果当前输入框处于focus状态，不需要添加placeholder
            if (element !== document.activeElement) {
                addPlaceholder(element);
            }
        } else {
            clearPlaceholder(element);
            element.value = value;
        }
        return $element;
    }

    return placeholder;
});
/**
 * @description
 *  用来注册各组件通用的功能
 */
define('components/common/utils/utils',['components/common/utils/placeholder', 'components/common/utils/browser'], function () {
    'use strict';

    var utils = window.tiny.utils ? window.tiny.utils : {};

    utils.isDate = function (date) {
        // underscore的_.isDate()方法没有做Invalid Date判断，因此，组件单独封装一个判断Date的方法
        if (Object.prototype.toString.call(date) === '[object Date]' && date != 'Invalid Date') { // eslint-disable-line eqeqeq
            return true;
        }

        return false;
    };

    // 判断用户定义的事件回调是否包含'(' 和 ')'
    utils.isEventType = function (attrs, eventName) {
        var evtExp = attrs[eventName];
        if (_.isUndefined(evtExp)) {
            return false;
        }
        return evtExp.indexOf('(') !== -1;
    };

    // 执行用户定义的事件回调
    utils.applyCallback = function (obj) {
        var scope = obj.scope; // 上下文
        var attrs = obj.attrs; // 属性列表
        var evtName = obj.evtName; // 事件回调接口名称
        var pObj = obj.params; // 以事件方式提供时，需要通过对象传参
        var pArr = _.map(obj.params, function (value) { // 以属性方式提供时，需要通过数组传参
            return value;
        });
        var isDelay = obj.isDelay; // 是否需要延迟执行

        var temp = {};
        if (!(temp.hasOwnProperty.call(attrs, evtName) && attrs[evtName])) {
            return;
        }

        if (isDelay) {
            setTimeout(function () {
                if (utils.isEventType(attrs, evtName)) {
                    scope[evtName](pObj);
                } else if (_.isFunction(scope[evtName]())) {
                    // 2.0事件提供方式中this为window，以下修改与原方式保持一致
                    scope[evtName]().apply(window, pArr);
                }
                scope.$evalAsync();
            }, 0);
        } else if (utils.isEventType(attrs, evtName)) {
            scope[evtName](pObj);
        } else if (_.isFunction(scope[evtName]())) {
            // 2.0事件提供方式中this为window，以下修改与原方式保持一致
            scope[evtName]().apply(window, pArr);
        }
    };

    /**
     * 判断是否在属性中定义了回调
     * @param scope 组件scope
     * @param attrs 组件的属性attrs
     * @param callbackName 在属性中定义的回调函数的名字
     * @return true: 定义了回调; false: 未定义回调
     */
    utils.isCallbackDefined = function (scope, attrs, callbackName) {
        // return utils.isEventType(attrs, callbackName) && !_.isUndefined(attrs[callbackName]) ||
        //           !utils.isEventType(attrs, callbackName) && _.isFunction(scope[callbackName]());
        return !_.isUndefined(attrs[callbackName]) &&
            (utils.isEventType(attrs, callbackName) || _.isFunction(scope[callbackName]()));
    };

    return utils;
});


// 控件的简体中文词条设置
define('i18n/zh-cn/tiny2Language',{
    // 公共词条
    more_title: '更多',
    ok_btn: '确认',
    cancel_btn: '取消',
    // actionMenu组件词条
    actionmenu_operate_title: '操作',
    // message控件词条
    msg_prompt_title: '提示',
    msg_warn_title: '警告',
    msg_confirm_title: '确认',
    msg_error_title: '错误',
    // 时间日期组件
    date_format: 'yyyy-MM-dd',
    time_format: 'HH:mm',
    date_clear_btn: '清除',
    date_today_btn: '今天',
    date_prev_month_title: '上月',
    date_next_month_title: '下月',
    date_week_start_value: 1,// 不需翻译
    date_week_names_abb: ['日', '一', '二', '三', '四', '五', '六'],
    date_week_names_title: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    date_month_names_abb: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'],
    date_year_suffix_label: '年',
    date_range_begin_label: '开始日期',
    date_range_end_label: '结束日期',
    datetime_range_time_label: '时间：',
    // 分页
    page_goto_label: '跳转', // Pagination控件：goto跳转按钮的title属性值
    page_prev_title: '上一页', // Pagination控件：上一页按钮的title属性值
    page_next_title: '下一页', // Pagination控件：下一页按钮的title属性值
    page_total_label: '总条数:', // Pagination控件：显示消息总条数部分前边的文本
    // 文件上传
    upload_add_file_btn: '添加文件',
    upload_wait_info: '等待上传',
    upload_success_info: '上传成功',
    upload_error_info: '上传失败',
    // 校验
    valid_required_info: '输入不能为空。',
    valid_maxSize_info: '输入长度不能超过{0}。',
    valid_minSize_info: '输入长度不能小于{0}。',
    valid_rangeSize_info: '输入长度范围为{0}到{1}。',
    valid_maxValue_info: '输入值不能超过{0}。',
    valid_minValue_info: '输入值不能小于{0}。',
    valid_rangeValue_info: '输入值必须在{0}到{1}之间。',
    valid_regularCheck_info: '输入值无效。',
    valid_contains_info: '输入值必须包含有字符{0}。',
    valid_notContains_info: '输入值不能含有非法字符{0}。',
    valid_checkScriptInfo_info: '输入值不能含有script标签。',
    valid_equal_info: '输入值必须等于{0}。',
    valid_notEqual_info: '输入值不能等于{0}。',
    valid_port_info: '端口号为0到65535的整数。',
    valid_path_info: '输入值未满足路径格式要求。',
    valid_email_info: '输入email地址无效。',
    valid_date_info: '输入日期无效。',
    valid_url_info: '输入URL无效。',
    valid_integer_info: '输入值不是有效整数。',
    valid_number_info: '输入值不是有效数字。',
    valid_digits_info: '输入值不是有效数字字符。',
    valid_ipv4_info: '输入值不是有效IPV4地址。',
    valid_ipv6_info: '输入值不是有效IPV6地址。',
    // charts 组件
    loadingText: '数据加载中...'
});

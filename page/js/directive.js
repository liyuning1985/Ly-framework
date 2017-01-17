define(["router"], function (router) {
    "use strict";

    var mod = router;

    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };

        if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
            (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                    ("00" + o[k]).substr(("" + o[k]).length));
        return format;
    };

    function setAttr(scope, attr, val) {
        try {
            eval(["scope." + attr, '=', 'val'].join(""));
        } catch (e) {
            console.trace(e);
        }
    }

    function getAttr(scope, attr) {
        var data = null;
        try {
            data = scope.$eval(attr);
        } catch (e) {
            console.trace(e);
        }

        return data;
    }

    function attr2id(attr) {
        return attr.replace(/[\.\/\\]/g, "_");
    }

    mod.setAttr = setAttr;
    mod.getAttr = getAttr;
    mod.attr2id = attr2id;

    var lib = {};
    lib.isNull = function (v) {
        if (null == v) {
            return true;
        }

        if ('string' == typeof v) {
            return 0 == v.length;
        }

        return false;
    };

    lib.ip2string = function (ip) {
        if ('number' != typeof ip) {
            return null;
        }

        return [
            (ip >> 24) & 0xFF,
            (ip >> 16) & 0xFF,
            (ip >> 8) & 0xFF,
            (ip) & 0xFF
        ].join('.');
    };

    lib.string2ip = function (str) {
        if ('string' != typeof str) {
            return null;
        }

        var arr = str.split('.');
        if (arr.length != 4) {
            return null;
        }

        return (parseInt(arr[0]) * 0x1000000) + (parseInt(arr[1]) * 0x10000)
            + (parseInt(arr[2]) * 0x100) + parseInt(arr[3]);
    };

    lib.formatIPv6 = function (str) {
        if (typeof str != 'string') {
            return;
        }

        if (str.indexOf(":") < 0) {
            return;
        }

        var arr = str.split(":");

        if (8 == arr.length) {
            var i = 0;
            for (; i < arr.length; i++) {
                if ("" == arr[i]) {
                    arr[i] = '0';
                }
            }
        } else if (arr.length < 8) {
            var diff = 8 - arr.length;
            var i = 0, pad = "::";
            for (; i < diff; i++) {
                pad += ":";
            }
            return lib.formatIPv6(str.replace("::", pad));
        }

        arr.length = 8;
        return arr.join(":");
    };

    lib.getIPv6 = function (str, len) {
        if (typeof str != 'string') {
            return 0;
        }

        var arr = str.split(":");
        if (arr.length != 8) {
            return 0;
        }

        var l = Math.floor(len / 16);
        var i = 0, ans = 0;
        for (; i < l; i++) {
            ans = ans * 0x1000;
            var hex = parseInt(arr[i], 16);
            ans = ans + (isNaN(hex) ? 0 : hex);
        }
        return ans;
    };

    mod.run(function ($rootScope) {
        $rootScope.lib = lib;
    });

    var uiRouter = angular.module('ui.router.state');   
    var i = 0, uiViewInvoke;
    for (; i < uiRouter._invokeQueue.length; i++){
        var e = uiRouter._invokeQueue[i];
        if ((e[0] == "$compileProvider")
            && (e[1] == "directive")
            && (e[2][0] == "uiView")){
            uiViewInvoke = e;
            break;
        }
    }
    
    uiRouter._invokeQueue.splice(i,1);
    

    mod.directive("uiView", function ($state,$compile,$controller,$injector,$anchorScroll,$rootScope) {
        var viewIsUpdating = false;
        var $animator = $injector.has('$animator') ? $injector.get('$animator') : false;
        
        var config = {
            restrict: 'ECA',
            priority: 1000,
            terminal: true,
            transclude: true,
            compile: function (element, attr, transclude) {
                return function(scope, element, attr) {
                    var viewScope, viewLocals,
                    name = attr[config.name] || attr.name || '',
                    onloadExp = attr.onload || '',
                    animate = $animator && $animator(scope, attr),
                    initialView = transclude(scope), dom;

                    function getKey(){
                        var name = element.data('$uiView');
                        name = (name ? name.name : "");
                        var key = $state.$current.name.split(".");
                        var arr = name.split(".");
                        if ('@' == arr[0]){
                            arr.length = 0;
                        }
                        return key.slice(0, arr.length+1).join("-");
                    }

                    // Returns a set of DOM manipulation functions based on whether animation
                    // should be performed
                    var renderer = function(doAnimate) {
                        return ({
                            "true": {
                                remove: function(element) { animate.leave(element.contents(), element); },
                                restore: function(compiled, element) { animate.enter(compiled, element); },
                                populate: function(template, element) {
                                    var contents = angular.element('<div></div>').html(template).contents();
                                    animate.enter(contents, element);
                                    return contents;
                                }
                            },
                            "false": {
                                remove: function(element) { element.html(''); },
                                restore: function(compiled, element) { element.append(compiled); },
                                populate: function(template, element) {
                                    element.html(template);
                                    return element.contents();
                                }
                            }
                        })[doAnimate.toString()];
                    };

                    // Put back the compiled initial view
                    element.append(initialView);

                    // Find the details of the parent view directive (if any) and use it
                    // to derive our own qualified view name, then hang our own details
                    // off the DOM so child directives can find it.
                    var parent = element.parent().inheritedData('$uiView');
                    if (name.indexOf('@') < 0) name  = name + '@' + (parent ? parent.state.name : '');
                    var view = { name: name, state: null };
                    element.data('$uiView', view);

                    var eventHook = function(event) {
                        if (viewIsUpdating) return;
                        viewIsUpdating = true;

                        try { updateView(true, event); } catch (e) {
                            viewIsUpdating = false;
                            throw e;
                        }
                        viewIsUpdating = false;
                    };

                    scope.$on('$stateChangeSuccess', eventHook);
                    scope.$on('$viewContentLoading', eventHook);
                    updateView(false);

                    function updateView(doAnimate, event) {
                        var locals = $state.$current && $state.$current.locals[name];

                        if (locals === viewLocals) return; // nothing to do

                        var render = renderer(animate && doAnimate);
                        // Remove existing content
                        //render.remove(element);

                        // Destroy previous view scope
                        if (viewScope) {
                            viewScope.$destroy();
                            //viewScope = null;
                        }

                        

                        if (dom){
                            dom.hide();
                        }

                        dom = element.find("#"+getKey());
                        if (dom.length > 0){
                            dom.show();
                            dom.scope().$emit('$viewContentLoaded');
                            return;
                        }

                        if (!locals) {
                            viewLocals = null;
                            view.state = null;
                            // Restore the initial view
                            return render.restore(initialView, element);
                        }

                        viewLocals = locals;
                        view.state = locals.$$state;

                        dom = $("<div id='"+getKey() + "'></div>");
                        dom.html(locals.$template);
                        element.append(dom);

                        

                        // var link;
                        // if(viewScope && isTabclose){
                        //     viewScope.$destroy();
                        //     link = $compile(render.populate(locals.$template, element));
                        //     isTabclose = false;
                        // }else{
                        //     link = $compile(dom);
                        // }

                        var link = $compile(render.populate(locals.$template, element));
                        //var link = $compile(dom);
                        viewScope = scope.$new();

                        if (locals.$$controller) {
                            locals.$scope = viewScope;
                            var controller = $controller(locals.$$controller, locals);
                            dom.children().data('$ngControllerController', controller);
                        }
                        link(viewScope);
                        //console.info(viewScope);
                        setTimeout(function(){
                            viewScope.$apply();
                        }, 200);

                        viewScope.$emit('$viewContentLoaded');
                        if (onloadExp) viewScope.$eval(onloadExp);

                        // TODO: This seems strange, shouldn't $anchorScroll listen for $viewContentLoaded if necessary?
                        // $anchorScroll might listen on event...
                        $anchorScroll();
                    }
                };
            }
        };
        return config;
    });


    mod.directive("fmView", function ($compile, $controller) {
        var config = {
            restrict: 'ECA',
            scope : true,
            link: function(scope, $element, iAttrs) {                    
                var show = getAttr(scope, iAttrs.show);

                function loadView(){
                    $element.hide();

                    var cache = getAttr(scope, iAttrs.cache);
                    if (cache){
                        $element = cache;
                        $element.show();
                        return;
                    }
                
                    var ctrlUrl = getAttr(scope, iAttrs.ctrl);
                    var templateUrl = getAttr(scope, iAttrs.template);    
                    
                    var locals = {
                        $scope: scope
                    };

                    function load(){
                        if (templateUrl.indexOf("<") >= 0){
                            $element.html(templateUrl);
                            var link = $compile($element.contents());
                            link(scope);
                            if (iAttrs.cache){
                                setAttr(scope, iAttrs.cache, $element);
                            }
                        }else{
                            $element.load(templateUrl, function(){
                                var link = $compile($element.contents());
                                link(scope);
                                scope.$apply();

                                if (iAttrs.cache){
                                    setAttr(scope, iAttrs.cache, $element);
                                }
                            });
                        }
                    }

                    if (typeof ctrlUrl == "string"){
                    require([ctrlUrl], function (ctrl) {
                        var controller = $controller(ctrl, locals);
                        load();
                    });
                    }else if (typeof ctrlUrl == "function"){
                        var controller = $controller(ctrlUrl, locals);;
                        load();
                    }else{
                        load();
                    }
                    
                    $element.show();               
                }
                                
                if (iAttrs.show){
                    scope.$watch(iAttrs.show, function (newValue, oldValue) {
                        if (newValue) {
                            loadView();
                        }else{
                            $element.hide();
                        }
                    });
                }else{
                    loadView();
                }
            }
        };
        return config;
    });


    mod.directive("fmFrame", function () {
        var config = {
            restrict: 'EA',
            template: "",
            link: function (scope, iElement, iAttrs) {
                var frame = $("<iframe src='" + iAttrs.src + "'scrolling=auto style='border:none;'></iframe>")
                .on("load", function(){
                    
                    var my = $(this);
                    var e = my;

                    try{
                        e = my.contents();
                    }catch(err){
                        console.log(err);
                    }

                    my.width($(window).width());
                    my.height($(window).height());

                    scope.$watch(iAttrs.mask, function(newVal, oldVal){
                        if (newVal && (newVal.length == 4) && my && e){
                            var w = e.width();
                            if (w < 1000){
                                w = 1000;
                            }

                            var h = e.height();
                            if (h < 600){
                                h = 600;
                            }

                            my.width(w + newVal[1]);
                            my.height(h + newVal[2]);

                            console.log(newVal, e.width(), e.height(), my.width(), my.height(), w, h);

                            my.css({
                                "margin-top" : newVal[0] + "px",
                                "margin-left" : newVal[3] + "px"
                            });
                        }
                    });
                    
                    iElement.show();
                    scope.$apply();
                });

                iElement.append(frame);
                iElement.hide();

            }
        };

        return config;
    });

    function filter(arr, key, str){
        if ((!key) || (!str)){
            return arr;
        }

        var out = [];
        for (var i = 0; i < arr.length; i++){
            var e = arr[i];
            if (e && e[key] && (e[key]+"").indexOf(str) < 0){
                continue;
            }

            out.push(e);
        }

        return out;
    }
    
    mod.directive("fmTable", function () {
        var config = {
            restrict: 'EA',
            templateUrl: "framework/template/table.html",
            scope: {
                key : "=columns",
                rawData : "=data",
                th : "=",
                td : "=",
                tr : "="
            },
            link: function (scope, iElement, iAttrs) {
                scope._parent = scope.$parent;

                scope.OMIT = "...";
                
                scope.page = {
                    list : [10,20,50],
                    size : 10,
                    index: 1,
                    pageList:[],
                    show: 8
                }

                scope.order = {
                    click : function(c){
                        if (!scope.rawData || scope.rawData.length === 0) {
                            return;
                        }
                        var func = null, key = c.data, type = c.type;

                        scope.order.order = scope.order.order != "desc" ? "desc" : "asc";
                        scope.order.key = key;

                        if (!type){
                            if (typeof scope.rawData[0][key] == "number"){
                                type = "number";
                            }else if (parseFloat(scope.rawData[0][key]) == scope.rawData[0][key]){
                                type = "string_number";
                            }else{
                                type = "string";
                            }
                        }

                        if ("number" == type){
                            if ("asc" == scope.order.order){
                                func = function(a, b){
                                    return a[key] - b[key];
                                }
                            }else{
                                func = function(a, b){
                                    return b[key] - a[key];
                                }
                            }
                        }else if ("string_number" == type){
                            if ("asc" == scope.order.order){
                                func = function(a, b){
                                    return (parseFloat(a[key])||0) - (parseFloat(b[key])||0);
                                }
                            }else{
                                func = function(a, b){
                                    return (parseFloat(b[key])||0) - (parseFloat(a[key])||0);
                                }
                            }
                        }else{
                            if ("asc" == scope.order.order){
                                func = function(a, b){
                                    return a[key] == b[key] ? 0 : (a[key] < b[key] ? -1 : 1);
                                }
                            }else{
                                func = function(a, b){
                                    return a[key] == b[key] ? 0 : (a[key] > b[key] ? -1 : 1);
                                }
                            }
                        }
                        
                        scope.order.func = func;
                        scope.rawData = scope.rawData.sort(func);
                        scope.changPage();
                    }
                }

                scope.paging = function(){
                    scope.page.count = Math.ceil(scope.total / scope.page.size);
                    var arr = [];
                    if (scope.page.count <= scope.page.show){
                        for (var i = 0; i < scope.page.count; i++){
                            arr[i] = i + 1;
                        }
                    }else{
                        arr[0] = 1;
                        arr[scope.page.show-1] = scope.page.count;
                        if (scope.page.index < scope.page.show - 2){
                            for (var i = 0; i < scope.page.show - 2; i++){
                                arr[i] = i + 1;
                            }
                            arr[i] = scope.OMIT, i++;
                            arr[i] = scope.page.count;
                        }else if (scope.page.index > scope.page.count - (scope.page.show - 2)){
                            arr[0] = 1;
                            arr[1] = scope.OMIT; 
                            for (var i = 2; i < scope.page.show; i++){
                                arr[i] = scope.page.count - (scope.page.show - 2) + (i - 1);
                            }
                        }else {
                            var min = scope.page.index - Math.floor((scope.page.show - 4) / 2);
                            arr[0] = 1;
                            arr[1] = scope.OMIT; 
                            for (var i = 2; i < scope.page.show - 2; i++){
                                arr[i] = min + (i - 2);
                            }
                            arr[i] = scope.OMIT, i++;
                            arr[i] = scope.page.count;
                        }
                    }
                    return arr;
                }

                scope.filter = function(){
                    var arr = scope.rawData;
                    for (var i = 0; i < scope.key.length; i++){
                        var e = scope.key[i];
                        if (e.filter && e.filterKey){
                            arr = filter(arr, e.data, e.filterKey);
                        }
                    }
                    
                    return arr;
                }

                scope.changPage = function(index){
                    if (('number' == typeof index) && (index > 0) && (index <= scope.page.count)){
                        scope.page.index = index;
                    }

                    var start = (scope.page.index - 1) * scope.page.size;
                    
                    if (iAttrs.total){
                        var func = getAttr(scope.$parent, iAttrs.http);
                        if ("function" == typeof func){
                            func(start, scope.page, scope.key);
                        }
                    }else{
                        var arr = scope.filter();
                        scope.total = arr.length;
                        if (start >= scope.total){
                            start = 0;
                            scope.page.index = 1;
                        }
                        scope.rows = arr.slice(start, start + scope.page.size);
                        scope.page.pageList = scope.paging();
                    }
                    scope.page.indexChange = scope.page.index;
                }

                scope.prev = function(){
                    scope.page.index > 1 && scope.page.index--;
                    scope.changPage();
                }

                scope.next = function(){
                    scope.page.index < scope.page.count && scope.page.index++;
                    scope.changPage();
                }

                scope.changPageSize = function(){
                    scope.page.index = 1;
                    scope.changPage();
                }

                scope.selectPage = function(p){
                    var idx = parseInt(p);
                    if (idx){
                        scope.page.index = idx;
                        scope.changPage();
                    }
                }

                scope.click = function(e){
                    var func = getAttr(scope.$parent, iAttrs.click);
                    if (typeof func == "function"){
                        var s = $(e.target).scope();
                        if ((null != s.rowIndex) && (null != s.cellIndex)){
                            func({
                                rowIndex: s.rowIndex,
                                cellIndex: s.cellIndex,
                                cellKey: scope.key[s.cellIndex].data,
                                rowData : scope.rows[s.rowIndex],
                                cellData : scope.rows[s.rowIndex][scope.key[s.cellIndex].data]
                            });
                        }
                    }
                }

                scope.$watch("rawData", function (newValue, oldValue) {
                    scope.rawData = newValue || [];
                    if (scope.order.order && scope.order.key && scope.order.func){
                        scope.rawData = scope.rawData.sort(scope.order.func);
                    }
                    
                    if (iAttrs.total){
                        scope.total = getAttr(scope.$parent, iAttrs.total);
                        scope.rows = scope.rawData;
                        scope.page.pageList = scope.paging();
                        scope.page.indexChange = scope.page.index;
                    }else{
                        if (oldValue && (oldValue.length > scope.rawData.length)){
                            scope.page.index = 1;
                        }
                        scope.total = scope.rawData.length;
                        scope.changPage();
                    }                    
                });
            }
        };

        return config;
    });
    
    mod.directive("lyTable",function(){
        var config = {
            restrict:'E',
            templateUrl:"../template/table.html",
            scope:{
                
            },
            link:function(scope, iElement, iAttrs) {
                console.info(scope);
                console.info(iElement);
                console.info(iAttrs);
            }
        };
        return config;
    });

    
    mod.directive("fmTemplate", function () {
        return {
            restrict: 'EA',
            link: function (scope, iElement, iAttrs) {
                iElement.hide();
                setAttr(scope, iAttrs.html, iElement.html());
            }
        }
    });

    mod.directive("fmDatetime", function () {
        var config = {
            restrict: 'EA',
            templateUrl: "framework/template/date.html",
            scope: {
                //datetime : "=utc"
            },
            transclude : true,
            link: function (scope, iElement, iAttrs) {
                var date = new Date();
                scope.curDate = date;
                date = new Date(date.getFullYear(), date.getMonth(), 1);
                date = date.valueOf() - ((date.getDay() || 7) * 86400000);
                date = (new Date(date)).valueOf();

                var i = 0, day = [];
                for (var w = 0; w < 6; w++){
                    day[w] = [];
                    for (var d = 0; d < 7; d++){
                        day[w][d] = (new Date(date + (i * 86400000)));
                        i++;
                    }
                }

                scope.day = day;
                scope.time = "00:00:00"
            }
        };

        return config;
    });

    mod.directive('fmDrag', function () {
        var config = {
            restrict: 'EA',
            link: function (scope, iElement, iAttr) {
                iElement.mousedown(function (e) {
                    e.preventDefault();
                    var my = $(this);
                    my.css({
                        cursor: 'move'
                    });

                    var o = my.position();
                    var p = {top: e.pageY, left: e.pageX};

                    $("body").mousemove(function (e) {
                        e.preventDefault();
                        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                        my.css({
                            top: o.top + e.pageY - p.top,
                            left: o.left + e.pageX - p.left,
                            cursor: 'move'
                        });
                    })

                    function unbind(e) {
                        $("body").unbind("mousemove");
                        my.css({
                            cursor: 'auto'
                        });

                        var o = my.position();

                        for (var i in scope.para) {
                            var e = scope.para[i];
                            if (e.name == iAttr.name) {
                                e.axes.x = o.left;
                                e.axes.y = o.top;
                                break;
                            }
                        }
                    }

                    my.mouseup(unbind);
                })
            }
        }

        return config;
    });

    mod.directive('fmResize', function () {
        var config = {
            restrict: 'EA',
            link: function (scope, iElement, iAttr) {
                
                var app = $("<span>&nbsp;</span>").css({
                    cursor: 'e-resize',
                    color: '#c5c5c5',
                    position: 'absolute',
                    right: 0,
                    top: iElement.children().css("margin-top"),
                    'border-right-style' : 'solid',
                    'border-right-color': '#c5c5c5',
                    'border-right-width': 1
                });

                iElement.append(app);

                iElement.css({
                    position:'relative'
                });

                app.mousedown(function (e) {
                    e.preventDefault();
                    var my = iElement;
                    var old = my.css('cursor');

                    my.css({
                        cursor: 'e-resize'
                    });

                    var w = my.width();
                    var p = {top: e.pageY, left: e.pageX};

                    $("body").mousemove(function (e) {
                        e.preventDefault();
                        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();

                        my.width(w + e.pageX - p.left);
                    })

                    function unbind(e) {
                        my.css({
                            cursor: old
                        });
                        $("body").unbind("mousemove");
                    }

                    $("body").mouseup(unbind);
                })
            }
        }

        return config;
    });
    
    mod.directive('fmSelected',function(){
        var config = {
            restrict:"A",
            link:function(scope, iElement, iAttr){  
                iElement.click(function(){
                    $(".colorBlue").removeClass("colorBlue");
                    iElement.addClass("colorBlue");
                });
            }
        }
        return config;
    });

    mod.directive("fmTime", function () {
        var config = {
            restrict: 'EA',
            templateUrl: "framework/template/time.html",
            scope: {
                time: "=tm",
            },
            transclude: true,
            link: function (scope, iElement, iAttrs) {
                var input = iElement[0].children[0];
                var inputValue = iElement[0].children[1];
                $(inputValue).val(scope.time);
                $(input).val(scope.time);
                $(input).bind('input propertychange', function(e) {
                    scope.$apply(function(){
                        var timevalue = $(input).val();
                        scope.time = timevalue;
                    });
                });
            }
               
        };

        return config;
    });
    mod.directive("fmLoading",function(){
        var config = {
            restrict:"E",
            templateUrl: "framework/template/Loading.html",
            scope:{
                timeout:"=",
                show:"=",
                text:"="
            },
            link:function(scope,iElement,iAttrs){
                var second = scope.timeout;
                scope.close = function(){
                    var s = scope._interval;
                    clearInterval(s);
                    scope._show = false;
                    scope.show = false;
                }
                function begin(time){
                    var process = time;
                    var wd = process;
                    scope._second = time;
                    scope._show = true;
                    scope._text = scope.text;
                    scope._width = 0;
                    scope._infoshow = true;
                    scope._closeicon = false;
                    var s = setInterval(function(){
                        scope.$apply(function(){
                            process--;                               
                            scope._second = parseInt(process);                         
                            if(scope._width <100) {
                                scope._width = scope._width+100/wd;
                            }
                            if(scope._second == 0) {
                                scope._closeicon = true;
                            }
                            if(scope._second < 0) { 
                                scope._infoshow = false;
                                clearInterval(s);   
                            }
                            scope._interval = s;
                        });
                    },1000);

                }

                scope.$watch("show",function(newValue,oldValue){
                    if(newValue){
                        clearInterval(scope._interval);
                        begin(scope.timeout);
                    }else {
                        clearInterval(scope._interval);
                        scope._show = newValue;
                    }
                },true);
            }
        };
        return config;
    });

    var isTabclose = false;
    mod.directive("lyTabclose",['$state',function($state){
        var config = {
            restrict:"A",
            link:function(scope, iElement, iAttr) {
                var index = iAttr.tabid;
                iElement.click(function(e){
                    e.stopPropagation();
                    console.info(scope.$parent);
                    var tabs = scope.TopTabs.data;
                    var tabs_length = tabs.length;
                    if((index+1) < tabs_length) {
                        var delname = tabs[index].url;
                        tabs.splice(index,1);
                        scope.TopTabs.TabSelected = tabs[index].id;
                        isTabclose = true;
                        $state.go(tabs[index].url);
                    }else{
                        var delname = tabs[index-1].url;
                        tabs.splice(index-1,1);
                        isTabclose = true;
                        scope.TopTabs.TabSelected = tabs[tabs.length-1].id;
                        $state.go(tabs[tabs.length-1].url);
                    }
                });
            }
        };
        return config;
    }]);
    return mod;
});

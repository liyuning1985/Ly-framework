define(["framework/routerConfig"], function (router) {
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
        for (var k in o) if (new RegExp("(" + k + ")").test(format))
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
    for (; i < uiRouter._invokeQueue.length; i++) {
        var e = uiRouter._invokeQueue[i];
        if ((e[0] == "$compileProvider")
            && (e[1] == "directive")
            && (e[2][0] == "uiView")) {
            uiViewInvoke = e;
            break;
        }
    }

    uiRouter._invokeQueue.splice(i, 1);
/*    mod.directive("uiView", function ($state, $compile, $controller, $injector, $anchorScroll, $rootScope) {
        var viewIsUpdating = false;
        var $animator = $injector.has('$animator') ? $injector.get('$animator') : false;

        var config = {
            restrict: 'ECA',
            priority: 1000,
            terminal: true,
            transclude: true,
            compile: function (element, attr, transclude) {
                return function (scope, element, attr) {
                    var viewScope, viewLocals,
                    name = attr[config.name] || attr.name || '',
                    onloadExp = attr.onload || '',
                    animate = $animator && $animator(scope, attr),
                    initialView = transclude(scope), dom;

                    function getKey() {
                        var name = element.data('$uiView');
                        name = (name ? name.name : "");
                        var key = $state.$current.name.split(".");
                        var arr = name.split(".");
                        if ('@' == arr[0]) {
                            arr.length = 0;
                        }
                        return key.slice(0, arr.length + 1).join("-");
                    }

                    // Returns a set of DOM manipulation functions based on whether animation
                    // should be performed
                    var renderer = function (doAnimate) {
                        return ({
                            "true": {
                                remove: function (element) { animate.leave(element.contents(), element); },
                                restore: function (compiled, element) { animate.enter(compiled, element); },
                                populate: function (template, element) {
                                    var contents = angular.element('<div></div>').html(template).contents();
                                    animate.enter(contents, element);
                                    return contents;
                                }
                            },
                            "false": {
                                remove: function (element) { element.html(''); },
                                restore: function (compiled, element) { element.append(compiled); },
                                populate: function (template, element) {
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
                    if (name.indexOf('@') < 0) name = name + '@' + (parent ? parent.state.name : '');
                    var view = { name: name, state: null };
                    element.data('$uiView', view);

                    var eventHook = function (event) {
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
                        render.remove(element);

                        // Destroy previous view scope
                        if (viewScope) {
                            viewScope.$destroy();
                            //viewScope = null;
                        }

                        if (dom) {
                            dom.hide();
                        }

                        dom = element.find("#" + getKey());
                        if (dom.length > 0) {
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

                        dom = $("<div id='" + getKey() + "'></div>");
                        dom.html(locals.$template);
                        element.append(dom);

                        var link = $compile(render.populate(locals.$template, element));
//                        var link = $compile(dom);
                        viewScope = scope.$new();

                        if (locals.$$controller) {
                            locals.$scope = viewScope;
                            var controller = $controller(locals.$$controller, locals);
                            dom.children().data('$ngControllerController', controller);
                        }
                        link(viewScope);
                        setTimeout(function () {
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
    */


    mod.directive("fmView", function ($compile, $controller) {
        var config = {
            restrict: 'ECA',
            scope: true,
            link: function (scope, $element, iAttrs) {
                var show = getAttr(scope, iAttrs.show);

                function loadView() {
                    $element.hide();

                    var cache = getAttr(scope, iAttrs.cache);
                    if (cache) {
                        $element = cache;
                        $element.show();
                        return;
                    }

                    var ctrlUrl = getAttr(scope, iAttrs.ctrl);
                    var templateUrl = getAttr(scope, iAttrs.template);

                    var locals = {
                        $scope: scope
                    };

                    function load() {
                        if (templateUrl.indexOf("<") >= 0) {
                            $element.html(templateUrl);
                            var link = $compile($element.contents());
                            link(scope);
                            if (iAttrs.cache) {
                                setAttr(scope, iAttrs.cache, $element);
                            }
                        } else {
                            $element.load(templateUrl, function () {
                                var link = $compile($element.contents());
                                link(scope);
                                scope.$apply();

                                if (iAttrs.cache) {
                                    setAttr(scope, iAttrs.cache, $element);
                                }
                            });
                        }
                    }

                    if (typeof ctrlUrl == "string") {
                        require([ctrlUrl], function (ctrl) {
                            var controller = $controller(ctrl, locals);
                            load();
                        });
                    } else if (typeof ctrlUrl == "function") {
                        var controller = $controller(ctrlUrl, locals);;
                        load();
                    } else {
                        load();
                    }

                    $element.show();
                }

                if (iAttrs.show) {
                    scope.$watch(iAttrs.show, function (newValue, oldValue) {
                        if (newValue) {
                            loadView();
                        } else {
                            $element.hide();
                        }
                    });
                } else {
                    loadView();
                }
            }
        };
        return config;
    });

    function filter(arr, key, str) {
        if ((!key) || (!str)) {
            return arr;
        }

        var out = [];
        for (var i = 0; i < arr.length; i++) {
            var e = arr[i];
            if (e && e[key] && (e[key] + "").indexOf(str) < 0) {
                continue;
            }

            out.push(e);
        }

        return out;
    }

    return mod;
});

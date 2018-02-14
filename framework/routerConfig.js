define(["language/keyID",
    "sprintf",
    "app/portal/home/homeService",
    "app/services/tipMessageService",
    "ui-router/angular-ui-router.min"
],
    function (i18n, sprintf, homeService, tipMessageService) {
        "use strict";
        var mod = angular.module("ui.router");
        var tipMessage = new tipMessageService();
        var paramsRegion = {
            "ci": "Region",
            "action": "Query"
        };

        function getResolve($controllerProvider, ctrlPath, ctrlName) {
            return {
                ctrl: function ($q) {
                    var deferred = $q.defer();
                    require([ctrlPath],
                        function (ctrl) {
                            $controllerProvider.register(ctrlName, ctrl);
                            deferred.resolve();
                        });
                    return deferred.promise;
                }
            };
        }

        i18n.sprintf = sprintf.sprintf;
        i18n.split = function (key) {
            try {
                return key.split(/\r\n|\n|\<\s*\w+\s*\/\>/g);
            } catch (e) {
            }
            return [];
        };

        mod.i18n = i18n;

        mod._menuData = {};
        mod._authMap = {};
        mod._authKey = {};

        mod.authMap = function (map) {
            mod._authMap = map;
        };

        mod.updateAuthMap = function (map) {
            mod._authMap = $.extend(mod._authMap, map);
        };

        mod.stateAllow = function (state) {
            //conditions 为一个数组 个数组之间是逻辑去与，每一项是string或数组，如是数据，关系是逻辑取或
            var conditions = [];
            for (var i = 1, len = arguments.length; i < len; i++) {
                conditions.push(arguments[i]);
            }
            mod._authKey[state] = conditions;
        };

        //反逻辑判断
        function isInvalid(state) {
            return !isSupported(state);
        }

        function isSupported(state) {
            var conditions = mod._authKey[state] || [];
            var result = true;
            if (conditions.length) {
                //与
                for (var i = 0, len = conditions.length; i < len; i++) {
                    var item = conditions[i];
                    var type = typeof item;
                    var innerResult = false;
                    if ("string" == type) {
                        innerResult = calNotLogic(item);
                    } else if ("object" == type) {
                        //或
                        for (var j = 0, innerLen = item.length; j < innerLen; j++) {
                            innerResult = (innerResult || calNotLogic(item[j]));
                        }
                    }
                    result = result && innerResult;
                }
            }
            return result;
        }

        function calNotLogic(key) {
            //非
            var isNot = key && key.indexOf("!") === 0;
            return isNot ? (!mod._authMap[key.substr(1)]) : mod._authMap[key];
        }

        var times;

        mod.run(function ($rootScope, $state, $urlService, $q) {
            $rootScope.i18n = i18n;
            $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    if (false && isInvalid(toState.name)) {
                        event.preventDefault();
                        $state.transitionTo(mod.homeState);
                    }
                });
            
            $urlService.rules.otherwise(function(matchValue, urlParts, router) {
                var notPath = urlParts.path;
                var arr = notPath.split("/");
                arr.shift();
                var notState = arr.join(".");
                var defer1 = $q.defer();
                var promise = defer1.promise;
                var stateName = notState;
                var stateModul = arr[0];

                if(stateModul) {
                    var stateConfigUrl = stateModul + "/configures/" + stateModul + "Config";
                    require([stateConfigUrl], function(ctrl){
                        if($state.get(stateName)) {
                            if(times !== stateModul){
                                ctrl();
                                times = stateModul;
                            }                        
                            defer1.resolve(stateName)
                        } else {
                            defer1.reject();
                        }
                    }, function(err){
                        defer1.reject();
                    })
                }

                promise.then(function(state){
                    $state.go(state);
                }, function(err){
                    $state.go("home")
                })

                return promise;
            })
            $urlService.rules.when("", "/home");
        });

        mod.home = function (state) {
            mod.config(function ($urlRouterProvider) {
                mod.homeState = state;
                var url = "/" + state.replace(".", "/");
                $urlRouterProvider.otherwise(url);
                $urlRouterProvider.when("", url);
            });
        };

        mod.when = function (toState, finalState) {
            mod.config(function ($urlRouterProvider) {
                var toUrl = "/" + toState.replace(/\./gi, "/");
                var finalUrl = "/" + finalState.replace(/\./gi, "/");
                $urlRouterProvider.when(toUrl, finalUrl);
            });
        };

        mod.state = function (state, template, ctrlPath, para) {
            var configRouter = function ($stateProvider, $controllerProvider) {
                var url = "/" + state;
                var arr = state.split(".");
                if (arr && arr.length && arr.length > 0) {
                    url = "/" + arr[arr.length - 1];
                }

                if (para && para.length) {
                    url = url + "?" + para.join("&");
                }

                var ctrlName = state + ".ctrl";

                var config = {
                    url: url
                };
                if (template) {
                    config.templateUrl = template;
                } else {
                    config.template = "<div ui-view></div>";
                }

                if (ctrlPath) {
                    if ("function" == typeof ctrlPath) {
                        config.controller = ctrlPath;
                    } else if ("string" == typeof ctrlPath) {
                        config.controller = ctrlName;
                        config.resolve = getResolve($controllerProvider, ctrlPath, ctrlName);
                    }
                    $stateProvider.state(state, config);
                }
                else {
                    if (typeof template === "object") {
                        var views = {};
                        var parentStates = angular.copy(arr);
                        parentStates.splice(arr.length - 1, 1);
                        var ctrlNames = [];
                        var ctrlPaths = [];
                        for (var p in template) {
                            var item = template[p];
                            var name = (parentStates.concat([p, "ctrl"])).join(".");
                            views[p] = {
                                templateUrl: item.templateUrl,
                                controller: name
                            };
                            ctrlNames.push(name);
                            ctrlPaths.push(item.controllerPath);
                        }
                        $stateProvider.state(state, {
                            url: url,
                            views: views,
                            resolve: {
                                "ctrl": function($q) {
                                    var deferred = $q.defer();
                                    require(ctrlPaths,
                                        function () {
                                            var length = ctrlNames.length;
                                            for(var i=0; i<length; i++) {
                                                $controllerProvider.register(ctrlNames[i], arguments[i]);
                                            }
                                            deferred.resolve();
                                        });
                                    return deferred.promise;
                                }
                            }
                        });
                    } else {
                        $stateProvider.state(state, config);
                    }
                }
            }
            
            var frame; 
            try {
                frame = angular.module("framework")
            } catch (error) {
                
            }
            if(frame && frame.register) {
                configRouter(frame.register.stateProvider, frame.register.controllerProvider)
            } else {
                mod.config(["$stateProvider", "$controllerProvider", configRouter]);
            }
        };

        mod.menu = function (type, level, state, text) {
            var e = {
                id: state,
                label: text,
                level: level,
                state: state,
                text: text,
                child: []
            };

            var menu = mod._menuData[type];
            if (null == menu) {
                menu = [];
                mod._menuData[type] = menu;
            }
            menu.push(e);
        };

        mod.menuModify = function (type, level, state) {
            var menu = mod._menuData[type];
            if (null == menu) {
                return;
            }

            for (var i = 0; i < menu.length; i++) {
                var m = menu[i];
                if (level.join() == m.level.join()) {
                    m.state = state;
                }
            }
        };

        mod.menuDelete = function (type, level) {
            var menu = mod._menuData[type];
            if (null == menu) {
                return;
            }

            for (var i = 0; i < menu.length; i++) {
                var m = menu[i];
                if (level.join() == m.level.join()) {
                    menu.splice(i, 1);
                }
            }
        };

        mod.getMenu = function (type) {
            var menu = angular.copy(mod._menuData[type]);
            var index = {};
            var out = {
                child: []
            };
            var temp = [];

            for (var i in menu) {
                var e = menu[i];
                var arr = [];

                if (!(e.level && e.level.length)) {
                    continue;
                }

                e.invalid = isInvalid(e.state);

                index[e.level.join()] = e;

                if (e.level.length > 1) {
                    var supper = index[e.level.slice(0, -1).join()];
                    arr = supper.child || [];
                    e.supper = supper;
                    supper.invalid = false;
                } else {
                    arr = out.child;
                    e.supper = out;
                }

                arr.push(e);
            }

            function trim(node) {
                var arr = node.child;
                node.child = [];
                for (var i = 0; i < arr.length; i++) {
                    var e = arr[i];

                    if (e.child && e.child.length) {
                        trim(e);
                    }

                    if (e.invalid) {
                        continue;
                    }
                    node.child.push(e);
                }

                var invalid = isInvalid(node.state);
                if (!node.child.length) {
                    node.invalid = invalid;
                } else {
                    if (invalid) {
                        node.state = node.child[0].state;
                    }
                }
            }

            trim(out);
            return out.child;
        };
        return mod;
    });

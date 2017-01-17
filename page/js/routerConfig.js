define(["ui-router"],
    function () {
        "use strict";

        var mod = angular.module("ui.router");

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


        mod._menuData = {};
        mod._authMap = {};
        mod._authKey = {};
        mod._stateReplaceMap = {};
        mod._stateLevelMap = {};

        mod.authMap = function (map) {
            mod._authMap = map;
        }

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
                for (var i = 0, len = conditions.length; i < len; i++) {
                    var item = conditions[i];
                    var type = typeof item;
                    var innerResult = false;
                    if ("string" == type) {
                        innerResult = mod._authMap[item];
                    } else if ("object" == type) {
                        for (var j = 0, innerLen = item.length; j < innerLen; j++) {
                            innerResult = (innerResult || mod._authMap[item[j]]);
                        }
                    }
                    result = result && innerResult;
                }
            }
            return result;
        }

        mod.run(function ($rootScope, $state) {
            $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    if (false && isInvalid(toState.name)) {
                        event.preventDefault();
                        $state.transitionTo(mod.homeState);
                    }
                });
        });

        mod.home = function (state) {
            mod.config(function ($urlRouterProvider) {
                mod.homeState = state;
                var url = "/" + state.replace(".", "/");
                $urlRouterProvider.otherwise(url);
                $urlRouterProvider.when("", url);
            });
        }

        mod.when = function (toState, finalState) {
            mod.config(function ($urlRouterProvider) {
                var toUrl = "/" + toState.replace(/\./gi, "/");
                var finalUrl = "/" + finalState.replace(/\./gi, "/");
                $urlRouterProvider.when(toUrl, finalUrl);
            });
        }

        mod.state = function (state, template, ctrlPath, para, force) {
            mod.config(function ($stateProvider, $controllerProvider) {
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
                    if (typeof template == "object") {
                        var views = {};
                        var parentStates = angular.copy(arr);
                        parentStates.splice(arr.length-1, 1);
                        for (var p in template) {
                            var item = template[p];
                            var name = (parentStates.concat([p, "ctrl"])).join(".");
                            views[p] = {
                                templateUrl: item.templateUrl,
                                controller: name,
                                resolve: getResolve($controllerProvider, item.controllerPath, name)
                            };
                        }
                        $stateProvider.state(state, {
                            url: url,
                            views: views
                        });
                        return;
                    }else if (typeof template == "string"){
                        if ("#" == template.charAt(0)){
                            config.template = "<fm-frame src='" + template.substr(1) + "' mask='mask' />";
                        }
                        else if ("<" == template.charAt(0)){
                            config.template = template;
                        }
                        else{
                            config.templateUrl = template;
                        }
                    }
                    
                } else {
                    config.template = "<div ui-view></div>";
                }

                if (ctrlPath) {
                    if ("function" == typeof ctrlPath) {
                        config.controller = ctrlPath;
                    }
                    else if ("string" == typeof ctrlPath) {
                        config.controller = ctrlName;
                        config.resolve = getResolve($controllerProvider, ctrlPath, ctrlName);
                    }
                    else if ("object" == typeof ctrlPath) {
                        config.controller = function($scope){
                            for (var i in ctrlPath){
                                $scope[i] = ctrlPath[i];
                            }
                        }
                    }
                }
                
                if (force){
                    mod._stateReplaceMap[state] = config;
                    
                    $stateProvider.decorator('views', function (s, parent) {
                        var result = {}, views = parent(s);

                        var r = mod._stateReplaceMap[s.name];
                        if (null == r){
                            return views;
                        }
                        
                        angular.forEach(views, function (cfg, name) {
                            if (r.template){
                                cfg.template = r.template;
                            }
                            if (r.templateUrl){
                                cfg.templateUrl = r.templateUrl;
                            }
                            if (r.controller){
                                cfg.controller = r.controller;
                            }
                            if (r.resolve){
                                cfg.resolve = r.resolve;
                            }
                            result[name] = cfg;
                            return result;
                        });
                        
                        return views;
                    });
                }else{
                    $stateProvider.state(state, config);
                }
            });
        };

        mod.menu = function (type, level, state, text, next) {
            var e = {
                level: level,
                state: state,
                text: text,
                type: state,
                child: []
            };

            var menu = mod._menuData[type];
            if (null == menu) {
                menu = [];
                mod._menuData[type] = menu;
            }
            
            if (next){
                var nextLevel = level.slice(0, -1);
                nextLevel.push(next);
                for (var i = 0; i < menu.length; i++){
                    var m = menu[i];
                    if (nextLevel.join() == m.level.join()){
                        break;
                    }
                }
                
                menu.splice(i, 0, e);
            }else{
                menu.push(e);
            }
            
            var map = mod._stateLevelMap[type] || {};
            map[e.state] = e.level;
            mod._stateLevelMap[type] = map;
            return e;
        };
        
        mod.menuModify = function (type, level, state) {
            var menu = mod._menuData[type];
            if (null == menu) {
                return;
            }
            
            for (var i = 0; i < menu.length; i++){
                var m = menu[i];
                if (level.join() == m.level.join()){
                    m.state = state;
                }
            }
        }
        
        mod.menuDelete = function (type, level) {
            var menu = mod._menuData[type];
            if (null == menu) {
                return;
            }
            
            for (var i = 0; i < menu.length; i++){
                var m = menu[i];
                if (level.join() == m.level.join()){
                    menu.splice(i, 1);
                }
            }
        }

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
                    if (supper){
                        arr = supper.child || [];
                        e.supper = supper;
                        supper.invalid = false;
                    }
                } else {
                    arr = out.child;
                    e.supper = out;
                }
                
                e.children = e.child;
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

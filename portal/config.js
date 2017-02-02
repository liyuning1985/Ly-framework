"use strict";
define(["framework/routerConfig"],
    function (router) {
        router.state("home", "home/home.html", "home/home");
        router.state("api", "api/api.html","api/apiCtrl");
        router.home("home");
        router.run(function ($rootScope, $state, $http) {
            $rootScope.mainPage = "portal/menu.html";
            $rootScope.mainCtrl = "portal/menu.js";
        });
        return function () {
            router.menu("main", ["home"], "home", "工作平台", "", "fa-home");
            router.menu("main", ["msys"], "msys", "M系统", "", "fa-home");
            router.menu("main", ["api"], "api", "接口说明", "", " fa-file");
        }
    }
);


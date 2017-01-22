"use strict";
define(["framework/routerConfig"],
    function (router) {
        router.state("home", "home/home.html", "home/home");
        router.home("home");
        router.run(function ($rootScope, $state, $http) {
            $rootScope.mainPage = "portal/menu.html";
            $rootScope.mainCtrl = "portal/menu.js";
        });
        return function () {
            router.menu("main", ["home"], "home", "工作平台","", "fa-home");
        }
    }
);


"use strict";
define(["framework/routerConfig"],
    function (router) {
        router.state("home", "page/home/home.html", "page/home/homeCtrl");
        router.home("home");
        router.run(function ($rootScope, $state, $http) {
            $rootScope.mainPage = "page/portal/menu.html";
            $rootScope.mainCtrl = "page/portal/menuCtrl";
        });
        return function () {
            router.menu("main", ["home"], "home", "工作平台","", "fa-home");
        }
    }
);


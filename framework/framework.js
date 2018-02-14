define([
	"./directive",
	"./routerConfig",
    "./module",
	"bootstrap"
],
function () {
    "use strict";
    var dependency = [
        "ng",
        "ui.router"
    ];

    var framework = angular.module("framework", dependency);
	 framework.config(function($stateProvider, $controllerProvider) {
        framework.register = {
            "stateProvider": $stateProvider,
            "controllerProvider": $controllerProvider
        }
    })
	
    return framework;
});

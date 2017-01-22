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
    return framework;
});

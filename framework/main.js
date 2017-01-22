"use strict";

require.config({
    "baseUrl": "./",
    "paths": {
        "bootstrap": "lib/Bootstrap3.35/js/bootstrap.min",
        "layer": "lib/Bootstrap3.35/js/plugins/layer/layer",
        "ui-router": "lib/angular-ui-router",
        "jquery": "lib/jquery",
        "angular": "lib/angular",
        "routerConfig": "framework/routerConfig",
        "metisMenu": "lib/Bootstrap3.35/js/plugins/metisMenu/jquery.metisMenu",
        "slimscroll": "lib/Bootstrap3.35/js/plugins/slimscroll/jquery.slimscroll.min",
        "hplus": "lib/hplus.min"
    },
    "shim": {
        'cookie': {
            deps: ['jquery']
        },
        'layer': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'metisMenu': {
            deps: ['jquery']
        },
        'slimscroll': {
            deps: ['jquery', 'layer']
        },
        'hplus': {
            deps: ['jquery', 'layer', 'metisMenu', 'slimscroll']
        },
        'ui-router': {
            deps: ['angular'],
            exports: 'router'
        },
        'angular': {
            deps: ['jquery'],
            exports: 'angular'
        }
    },
    waitSeconds: 120,
    urlArgs: "v=" + (new Date()).getTime()
});

require(["framework/framework", "jquery"], function (app, $) {
    var injector = angular.bootstrap($("html"), [app.name]);
    require(['bootstrap', 'layer', 'metisMenu', 'slimscroll', 'hplus']);
});

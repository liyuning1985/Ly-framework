require.config({
	baseUrl:"js",
    paths: {
        jquery: '../lib/jquery',
        localData:'indexdata',
        layer:"/lib/bootstrap-3.3.6/js/plugins/layer/layer",
        bootstrap:'../lib/bootstrap-3.3.6/js/bootstrap.min',
        cookie:'/lib/jquery.cookie',
        metisMenu:'/lib/bootstrap-3.3.6/js/plugins/metisMenu/jquery.metisMenu',
        angular:'../lib/angular',
        "router":"routerConfig",
        "ui-router":"../lib/angular-ui-router",
        "slimscroll":"/lib/bootstrap-3.3.6/js/plugins/slimscroll/jquery.slimscroll.min",
        "hplus":"/lib/bootstrap-3.3.6/js/hplus.min",
        "Ly":"common"
    },
    shim:{
    	'cookie':{
    		deps: ['jquery']
    	},
    	'layer':{
    		deps:['jquery']
    	},
    	'bootstrap':{
    		deps:['jquery']
    	},
    	'metisMenu':{
    		deps:['jquery']
    	},
    	'slimscroll':{
    		deps:['jquery','layer']
    	},
    	'ui-router':{
    		deps:['angular'],
    		exports:'router'
    	},
    	'hplus':{
    		deps:['layer']
    	},
        'ui-router':{
            deps:['angular'],
            exports:'router'
        },
    	'angular':{
    		deps:['jquery'],
    		exports:'angular'
    	}
    }
});

require(['jquery','angular','Ctrlindex'],function($,angular,app){
	var injector = angular.bootstrap($("html"), [app.name]);
    require(['bootstrap','layer','metisMenu','slimscroll','hplus']);
});

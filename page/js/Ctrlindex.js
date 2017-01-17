define(['./directive','ui-router','Ly'],
	function(router,mod,Ly){
	    var dependency = [
	        "ng",
	        "ui.router"
	    ];
	    var framework = angular.module("framework", dependency)
	    	.config(["$stateProvider","$urlRouterProvider","$controllerProvider",function($stateProvider,$urlRouterProvider,$controllerProvider){

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

	    		 $urlRouterProvider.otherwise('/home');
	    		 $stateProvider
	    		 	.state('home',{
	    		 		url:'/home',
	    		 		templateUrl:'home/home.html',
	    		 		controller:'home',
	    		 		resolve:getResolve($controllerProvider, 'home/home.js', 'home')
	    		 	})
			        .state('helper',{
			            url: '/helper',
			            templateUrl:'ExperienceLib/helper/helper.html',
			            controller:'helper',
			            resolve:getResolve($controllerProvider,'ExperienceLib/helper/helper.js','helper')
			        })
			        .state('config',{
			        	url:'config',
			        	templateUrl:'ExperienceLib/config/config.html',
			        	controller:'config',
			        	resolve:getResolve($controllerProvider,'ExperienceLib/config/config.js','config')
			        })
			        .state('log',{
			        	url:'log',
			        	templateUrl:'ExperienceLib/log/log.html',
			        	controller:'log',
			        	resolve:getResolve($controllerProvider,'ExperienceLib/log/log.js','log')
			        })
			        .state('API_Get',{
			        	url:'API_Get',
			        	templateUrl:"API/Get/api_get.html",
			        	controller:"api_get",
			        	resolve:getResolve($controllerProvider,'../API/Get/api_get.js','api_get')
			        })
			        .state('API_Post',{
			        	url:'API_Post',
			        	templateUrl:"API/Post/api_post.html",
			        	controller:"api_post",
			        	resolve:getResolve($controllerProvider,'../API/Post/api_post.js','api_post')
			        })
			        .state('ui_load',{
			        	url:'ui_load',
			        	templateUrl:"ui/load/load.html",
			        	controller:"ui_load",
			        	resolve:getResolve($controllerProvider,'../ui/load/load.js','ui_load')
			        })
			        .state('ui_Grid',{
			        	url:'ui_Grid',
			        	templateUrl:"ui/Grid/Grid.html",
			        	controller:"ui_grid",
			        	resolve:getResolve($controllerProvider,'../ui/Grid/Grid.js','ui_grid')
			        })
			        .state('train_demo1',{
			        	url:'train_demo1',
			        	templateUrl:"Train/Demo1/demo1.html",
			        	controller:"demo1",
			        	resolve:getResolve($controllerProvider,'../Train/Demo1/demo1','demo1')
			        })
	    	}])
	    	.controller('index',['$rootScope','$state','$location',function($rootScope,$state,$location){
	    		$rootScope.$on("$locationChangeSuccess",function(){
	    			var url = $location.url();
	    			url = url.substr(1);
	    			
	    			var tabs = $rootScope.TopTabs.data;
	    			var tabs_length = tabs.length;
	    			var selecteditemindex = 0;
	    			for (var i = 0; i < tabs_length; i++) {
	    				var item = tabs[i];
	    				if(item.url == url) {
	    					selecteditemindex = item.id;
	    					break;
	    				}
	    			}
	    			if(!selecteditemindex) {
	    				$state.go("home");
	    				return;
	    			}
	    			if(selecteditemindex == $rootScope.TopTabs.TabSelected){
	    				return;
	    			}else{
	    				$rootScope.TopTabs.TabSelected = selecteditemindex || 0;
	    				console.info($rootScope.TopTabs.TabSelected);
	    				var itemTab = $rootScope.TopTabs.data.finditem(selecteditemindex);
	    				$state.go(itemTab.url);
	    			}	 
	    			
	    		});
	    		$rootScope.TopTabs = {
	    			data:[
	    				{id:0,name:"工作日志",url:"home"}
	    			],
	    			TabSelected:0,
	    			TabSelect:function(tab){
	    				$rootScope.TopTabs.TabSelected = tab.id;
	    				$state.go(tab.url);
	    			},
	    			closeTab:function(index,event){
						event.stopPropagation();
						var tabs = $rootScope.TopTabs.data;
						var tabs_length = tabs.length;
						var tab = $rootScope.TopTabs.data[index];
						var cache = Ly.findObj("id",tab.id,$rootScope.Cache.List);
						cache.root = "";
						if((index+1) < tabs_length) {
							tabs.splice(index,1);
							$rootScope.TopTabs.TabSelected = tabs[index].id;
							$state.go(tabs[index].url);
						}else{
							tabs.splice(index,1);
							$rootScope.TopTabs.TabSelected = tabs[tabs.length-1].id;
							$state.go(tabs[tabs.length-1].url);
						}
					}
	    		}

	    		$rootScope.Cache = {
	    			List:[		
	    			]
	    		}

	    		$rootScope.LeftMemu = {
	    			List:[
	    				{ id:0,name:"工作日志",icon:" fa-home",url:"home",children:[]},
	    				{id:1,name:"运维助手API",icon:"fa-home",children:[
	    						{id:2,name:"Get",url:"API_Get"},
	    						{id:3,name:"Post",url:"API_Post"}
	    					]
	    				},
	    				{ id:4,name:"组件特效",icon:"fa fa-tag",children:[
								{id:5,name:"加载特效",url:"ui_load"},
								{id:6,name:"Grid组件",url:"ui_Grid"}
							]
						},
						{id:7,name:"学习培训",icon:"fa fa-tag",children:[
								{id:8,name:"Demo1",url:"train_demo1"}
							]
						}
	    			],
	    			SelectMenu:function(menu){
	    				var TopTabs = $rootScope.TopTabs;
	    				var id = menu.id;
	    				var item = TopTabs.data.finditem(id);
	    				if(!item.id) {
	    					if(item.id == 0) {
	    						TopTabs.TabSelected = menu.id;
	    						$state.go(menu.url);
	    						return;
	    					}
	    					var newTab = {};
	    					newTab.id = menu.id;
	    					newTab.name = menu.name;
	    					newTab.url = menu.url;
	    					TopTabs.data.push(newTab);
	    					TopTabs.TabSelected = newTab.id;
	    					$state.go(menu.url);
	    					return;
	    				}else{
	    					TopTabs.TabSelected = menu.id;
	    					$state.go(menu.url);
	    				}

	    			}
	    		}	
	    	}])
	return framework;
});

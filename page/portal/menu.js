define([],function(){
	var Ctrl = ['$rootScope','$state','$location'];
	var CtrlFn = function($rootScope,$state,$location) {
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
				{id:0,name:"统一入口",url:"home"}
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
				var cache = Ly.findObj(id,tab.id,$rootScope.Cache.List);
				console.info(cache);
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

		$rootScope.LeftMemu = {
			List:[
				{ id:0,name:"统一入口",icon:" fa-home",url:"home",children:[]},
				{ id:1,name:"检验库",icon:"fa-cubes",children:[
						{ id:2,name:"经验管理",url:"helper"},
						{ id:3,name:"关联查询",url:"config"},
						{ id:4,name:"操作日志",url:"log"}
					]
				},
				{ id:5,name:"报表中心",icon:"fa-area-chart",children:[
						{ id:6,name:"运维报表",url:"home"},
						{ id:7,name:"实例报表（每天）",url:"home"},
						{ id:8,name:"实例报表（每小时）",url:"home"},
						{ id:9,name:"配置检查",url:"home"}
					]
				},
				{ id:10,name:"文件库",icon:"fa-files-o",children:[
						{ id:11,name:"输出库",url:"home"}
					]
				}
				
			],
			SelectMenu:function(menu){
				var TopTabs = $rootScope.TopTabs;
				var id = menu.id;
				var item = TopTabs.data.finditem(id);
				if(!item.id) {
					var newTab = {};
					newTab.id = menu.id;
					newTab.name = menu.name;
					newTab.url = menu.url;
					TopTabs.data.push(newTab);
					TopTabs.TabSelected = newTab.id;
					return;
				}else{
					TopTabs.TabSelected = menu.id;
				}
			}
		}
	}
	Ctrl.push(CtrlFn);
	return Ctrl;
});

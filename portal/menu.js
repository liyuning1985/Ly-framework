define([
    "framework/routerConfig",
    "framework/common"
], function (mod, Ly) {
    var Ctrl = ["$scope", "$urlRouter", "$rootScope", "$state","$location"];
    var CtrlFn = function ($scope, $urlRouter, $rootScope, $state, $location) {
        var menu = mod.getMenu("main");
        $scope.menuList = menu;


        $rootScope.TopTabs = {
            data: [
                { id: 0, name: "工作平台", state: "home" }
            ],
            TabSelected: 0,
            TabSelect: function (tab) {
                $rootScope.TopTabs.TabSelected = tab.id;
                $state.go(tab.state);
            },
            closeTab: function (index, event) {
                event.stopPropagation();
                var tabs = $rootScope.TopTabs.data;
                var tabs_length = tabs.length;
                var tab = $rootScope.TopTabs.data[index];
                console.info(tab.id);
                var cache = Ly.findObj("id", tab.id, $rootScope.Cache.List);
                cache.root = "";
                if ((index + 1) < tabs_length) {
                    tabs.splice(index, 1);
                    $rootScope.TopTabs.TabSelected = tabs[index].id;
                    $state.go(tabs[index].state);
                } else {
                    tabs.splice(index, 1);
                    $rootScope.TopTabs.TabSelected = tabs[tabs.length - 1].id;
                    $state.go(tabs[tabs.length - 1].state);
                }
            },
            closeotherTab: function () {
                //关闭其他tabs
                var activeTabId = $rootScope.TopTabs.TabSelected;
                var tabs = $rootScope.TopTabs.data;
                if (tabs.length == 1) {
                    return;
                }
                var cache = Ly.findObj("id", activeTabId, $rootScope.Cache.List);
                var indexcache = Ly.findObj("id", 0, $rootScope.Cache.List);
                var newList = [];
                newList.push(indexcache);
                newList.push(cache);
                $rootScope.Cache.List = newList;
                var activeTab = Ly.findObj("id", activeTabId, tabs);
                var indexTab = Ly.findObj("id", 0, tabs);
                var newTabs = [];
                newTabs.push(indexTab);
                newTabs.push(activeTab);
                $rootScope.TopTabs.data = newTabs;
            },
            closeAllTab: function () {
                //关闭所有的tabs 回到首页
                var tabs = $rootScope.TopTabs.data;
                var indexcache = Ly.findObj("id", 0, $rootScope.Cache.List);
                var newList = [];
                newList.push(indexcache);
                var indexTab = Ly.findObj("id", 0, tabs);
                var newTabs = [];
                newTabs.push(indexTab);
                $rootScope.Cache.List = newList;
                $rootScope.TopTabs.data = newTabs;
                $rootScope.TopTabs.TabSelected = 0;
                $state.go("home");
            }
        };

        $rootScope.Cache = {
            List: [
                { id: 0, name: "工作平台", state: "home" }
            ]
        }

        $scope.LeftMemu = {
            SelectMenu: function (menu) {
                var TopTabs = $rootScope.TopTabs;
                var id = menu.id;
                var item = TopTabs.data.finditem(id);
                if (!item.id) {
                    if (item.id == 0) {
                        TopTabs.TabSelected = menu.id;
                        $state.go(menu.state);
                        return;
                    }
                    var newTab = {};
                    newTab.id = menu.id;
                    newTab.name = menu.text;
                    newTab.state = menu.state;
                    TopTabs.data.push(newTab);
                    TopTabs.TabSelected = newTab.id;
                    $state.go(menu.state);
                    return;
                } else {
                    TopTabs.TabSelected = menu.id;
                    $state.go(menu.state);
                }
            }
        }

        var tabsCount = $rootScope.TopTabs.data.length;
        if (tabsCount == 1) {
           location.href = "#/home";
        }
        $urlRouter.sync();
    };
    Ctrl.push(CtrlFn);
    return Ctrl;
});

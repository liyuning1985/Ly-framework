define([
    "framework/routerConfig",
    "framework/common"
], function (mod, Ly) {
    var Ctrl = ["$scope", "$urlRouter", "$rootScope", "$state"];
    var CtrlFn = function ($scope, $urlRouter, $rootScope, $state) {
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
        $urlRouter.sync();
    };
    Ctrl.push(CtrlFn);
    return Ctrl;
});

define([
     "framework/common",
     "framework/routerConfig"
], function (Ly, router) {
    var Ctrl = ["$rootScope", "$scope"];
    var Fn = function ($rootScope, $scope) {
        var id = $rootScope.TopTabs.TabSelected;
        var initMenus = [
            { id: '1', text: "会员登录", isShow: true },
            { id: '2', text: "药妆销售", isShow: false },
            { id: '3', text: "项目销售", isShow: false }
        ]



        $scope.root = {
            activeMenu: initMenus,
            activeId: '0',
            Selectactive: function (m) {
                $scope.root.Road = [];
                var item = {};
                item.id = m.id;
                item.text = m.text;
                $scope.root.Road.push(item);
                console.info($scope.root.Road);
            },
            Road: []
        }
        //console.info($scope);

        $scope.$watch("root", function (newvalue, oldvalue) {
            if (!newvalue) return;
            var CacheList = $rootScope.Cache.List;
            var scope = {}
            var id = $rootScope.TopTabs.TabSelected;
            scope.id = id;
            scope.root = newvalue;
            if (!Ly.findObj("id", scope.id, CacheList)) {
                CacheList.push(scope);
            } else {
                var cache = Ly.findObj("id", scope.id, CacheList);
                cache.root = newvalue;
            }
        }, true);
        init(id);
        function init(id) {
            var CacheList = angular.copy($rootScope.Cache.List);
            var cache = Ly.findObj("id", id, CacheList);
            if (cache) {
                var root = cache.root;
                for (var key in root) {
                    $scope.root[key] = root[key];
                }
            }
        }
    };
    Ctrl.push(Fn);
    return Ctrl;

});

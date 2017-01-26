define([
    "framework/common"
], function (Ly) {
    var Ctrl = ["$rootScope","$scope"];
    var Fn = function ($rootScope,$scope) {
        var id = $rootScope.TopTabs.TabSelected;
        $scope.root = {
            title: ""

        }

        $('#jstree1').jstree({
            'core': {
                'check_callback': true
            },
            'plugins': ['types', 'dnd'],
            'types': {
                'default': {
                    'icon': 'fa fa-folder'
                },
                'html': {
                    'icon': 'fa fa-file-code-o'
                },
                'svg': {
                    'icon': 'fa fa-file-picture-o'
                },
                'css': {
                    'icon': 'fa fa-file-code-o'
                },
                'img': {
                    'icon': 'fa fa-file-image-o'
                },
                'js': {
                    'icon': 'fa fa-file-text-o'
                }

            }
        });
        $scope.$watch("root", function (newvalue, oldvalue) {
            var CacheList = $rootScope.Cache.List;
            console.info($rootScope.TopTabs.TabSelected);
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

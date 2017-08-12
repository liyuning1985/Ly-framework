/**
 * @description
 *  用来注册TinyUI component的AngularJS module
 */
define('components/module',['components/common/service/service', 'components/common/utils/utils', 'i18n/zh-cn/tiny2Language'], function (service, utils, laguage) {
    'use strict';

    // 默认控件语言为中文
    !window.tiny && (window.tiny = {});
    !tiny.language && (tiny.language = laguage);
    // 创建tiny核心模块
    var module = angular.module('tiny', [service]);
    module.config(['$sceProvider', function ($sceProvider) {
        $sceProvider.enabled(false);
    }]);
    return module;
});


/**
 * @description
 * AngularJS version of the tab directive.
 * 定义ti-tab指令,最终返回module名
 */

define('components/accordion/accordion',['components/module'],
    function (module) {
        'use strict';

        module.constant('tiAccordionConfig', {
            closeOthers: true,
            clickToggle: true
        });

        module.controller('tiAccordionController', tiAccordionController);
        tiAccordionController.$inject = ['$scope', '$attrs', 'tiAccordionConfig'];
        function tiAccordionController($scope, $attrs, accordionConfig) {
            // 存放accordion条目数据
            var items = $scope.accordionItems = [];

            this.headClass = $scope.$eval($attrs.headClass); // 支持开发者对手风琴条目头部设置自定义样式
            this.bodyClass = $scope.$eval($attrs.bodyClass); // 支持开发者对手风琴条目展开面板设置自定义样式

            // 设置closeOthers为true的情况下，关闭其他accordion条目
            this.closeOthers = function (openItem) {
                var closeOthers = angular.isDefined($attrs.closeOthers)
                    ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
                if (closeOthers) {
                    angular.forEach(items, function (item) {
                        if (item.open && item !== openItem) {
                            item.open = false;
                        }
                    });
                }
            };

            // 添加某一accordion条目到items数组中
            this.addItem = function (item) {
                items.push(item);
            };

            // 从items数组中删除某一accordion条目
            this.removeItem = function (item) {
                var index = items.indexOf(item);
                if (index !== -1) {
                    items.splice(index, 1);
                }
            };
        }

        // tiAccordion指令的控制器将在子指令中使用
        module.directive('tiAccordion', function () {
            return {
                restrict: 'E',
                controller: tiAccordionController,
                controllerAs: 'accordion',
                transclude: true,
                replace: true,
                templateUrl: '/tiny-components/src/components/accordion/accordion.html'
            };
        });

        module.controller('tiAccordionItemController', tiAccordionItemController);
        tiAccordionItemController.$inject = ['$scope'];
        function tiAccordionItemController($scope) {
            this.setHead = function (element) {
                this.head = element;
            };
        }

        module.directive('tiAccordionItem', tiAccordionItem);
        tiAccordionItem.$inject = ['tiAccordionConfig'];
        function tiAccordionItem(accordionConfig) {
            return {
                require: '^tiAccordion',
                transclude: true,
                restrict: 'E',
                replace: true,
                templateUrl: '/tiny-components/src/components/accordion/accordion-item.html',
                scope: {
                    open: '=?', // 设置面板是否开启
                    disable: '=?', // 设置不可用状态
                    clickToggle: '=?', // 设置用户点击head时是否自动实现状态切换
                    headClick: '&' // 点击头部的回调
                },
                controller: tiAccordionItemController,
                link: function (scope, element, attrs, accordionCtrl) {
                    // 添加当前的accordion到列表中
                    accordionCtrl.addItem(scope);

                    // 用户设置的手风琴条目头部和展开面板的样式
                    scope.headClass = accordionCtrl.headClass ? accordionCtrl.headClass : '';
                    scope.bodyClass = accordionCtrl.bodyClass ? accordionCtrl.bodyClass : '';

                    // 当前手风琴条目面板展开时，且closeOthers设置为true，则关闭其他面板
                    scope.$watch('open', function (value) {
                        if (value) {
                            accordionCtrl.closeOthers(scope);
                        }
                    });

                    // clickToggle标识：用户点击头部时，是否自动实现面板的状态切换
                    var clickToggle = angular.isDefined(attrs.clickToggle)
                        ? scope.$eval(attrs.clickToggle) : accordionConfig.clickToggle;
                    scope.toggleOpen = function () {
                        // 当前手风琴条目可用，且clickToggle为true，则自动实现面板的状态切换
                        if (!scope.disable && clickToggle) {
                            scope.open = !scope.open;
                        }
                        // 触发headClick回调
                        if (typeof scope.headClick() === 'function') {
                            scope.headClick()(scope.open);
                        }
                    };

                    // 当前面板销毁时，自动删除item
                    scope.$on('$destroy', function () {
                        accordionCtrl.removeItem(scope);
                    });
                }
            };
        }

        // 属于tiAccordionItem的子指令，用来设置accordion的head
        module.directive('tiAccordionHead', function () {
            return {
                transclude: true,
                template: '',
                replace: true,
                restrict: 'E',
                require: '^tiAccordionItem',
                link: function (scope, element, attrs, accordionItemCtrl, transclude) {
                    accordionItemCtrl.setHead(transclude(scope, angular.noop));
                }
            };
        });

        // 监听head内容变化，并将head内容放置到合适位置
        module.directive('tiAccordionTransclude', function () {
            return {
                require: '^tiAccordionItem',
                link: function (scope, element, attrs, controller) {
                    scope.$watch(function () {
                        return controller[attrs.tiAccordionTransclude];
                    }, function (heading) {
                        if (heading) {
                            var elem = $(element.find('[ti-accordion-header]')[0]);
                            elem.html('');
                            elem.append(heading);
                        }
                    });
                }
            };
        });

        return module.name;
    }
);


/**
 * @description
 * AngularJS version of the button directive.
 * 定义ti-button指令,最终返回module名
 */

define('components/button/button',["components/module"],
    function(module) {
        'use strict';
        module.directive('tiButton', tiButton);

        function tiButton() {
            var directive = {
                restrict: 'A',
                link: function(scope, $element, attrs){
                    // autofocus功能实现(IE9下兼容性处理)
                    var utils = window.tiny.utils;
                    if($element.attr("autofocus") !== undefined && (utils.browser.ie && utils.browser.version < 10)) {
                        $element[0].focus();
                    }
                }
            };
            return directive;
        }
        return module.name;
    }
);
/**
 * @description
 * AngularJS version of the checkbox directive.
 * 定义ty-checkbox指令,最终返回module名
 */

define('components/checkbox/checkbox',['components/module'],
    function (module) {
        'use strict';

        module.directive('tiCheckbox', tiCheckbox);

        tiCheckbox.$inject = ['$parse'];
        function tiCheckbox($parse) {
            var directive = {
                restrict: 'A',
                priority: 598, // 不能超过ng-if的优先级(600)和tiCheckGroup的优先级(599)
                require: '?ngModel', // 使用AngularJS ngModel情况下，需要调用ngModelCtrl API
                link: link
            };
            return directive;

            function link(scope, $element, attrs, ngModelCtrl) {
                // 获取和设置input[type=checkbox]元素的id属性
                var checkboxId = $element.attr('id');
                if (!checkboxId) {
                    checkboxId = _.uniqueId('ti_checkbox_');
                    $element.attr('id', checkboxId);
                }

                // checkbox-skin用来覆盖默认的checkbox显示，
                // checkbox-label用来覆显示checkbox的label，
                // label标签+for在Firefox focus不生效，因此使用span标签
                var checkboxTpl =
                    "<label class='ti-checkbox' for='<%= id %>'>" +
                        "<span class='ti-checkbox-skin ti-icon ti-icon-checkmark' for='<%= id %>'></span>" +
                        "<label class='ti-checkbox-label' for='<%= id %>'></label>" +
                    '</label>';
                var checkboxDOM = _.template(checkboxTpl)({ id: checkboxId });
                $element.after(checkboxDOM);
                $element.attr('tabindex', '-1');// 取消input元素的tab聚焦行为(input 可聚焦情况下，tab键切换时会聚焦该元素)

                var $tiCheckbox = $element.next();
                // 业务数据变化 =》label的显示变化
                scope.$watch($parse(attrs.tiCheckbox), function (newValue) {
                    var $label = $tiCheckbox.find('.ti-checkbox-label');
                    if (!_.isUndefined(newValue)) { // if value is defined
                        $label.html(newValue);
                    } else {
                        $label.html('');
                    }
                });

                var $checkboxSkin = $tiCheckbox.find('.ti-checkbox-skin');
                // 点选元素后，聚集到对应的checkbox-skin
                $element.on('click', function () {
                    $checkboxSkin.focus();
                });
                // 阻止checkbox-skin和checkbox-label的事件冒泡，防止上层dom绑定的事件被多次触发
                // 原因：span和label使用for和input关联，input上的click等事件也会触发span/label的事件处理，
                //      如果不做处理，上层dom绑定的事件会被触发两次
                $element.next('.ti-checkbox').on('click', function (e) {
                    e.stopPropagation();
                });

                // 灰化状态下，元素可聚焦行为处理
                scope.$watch(function () {
                    return $element.attr('disabled');
                }, function (newValue) {
                    if (newValue) {
                        $checkboxSkin.removeAttr('tabindex');// 灰化状态下，设置tabindex为-1,点击label仍会聚焦，因此此处禁用tabindex
                    } else {
                        $checkboxSkin.attr('tabindex', '0');
                    }
                });

                // 快捷键的处理(Enter和Space)：考虑到交互的友好性及与原生的一致性，
                // 在keyup中做相应的事件处理(keydown和keypress会存在一次点击，多次触发的情况);
                // 此外，需要阻止浏览器默认事件（空格键会触发页面滚动条滚到底部的行为，
                // 默认事件的阻止需要在keyup之前，因此此处在keydown中阻止）
                $checkboxSkin.on('keydown', function (event) {
                    if ($element.attr('disabled')) {
                        return;
                    }
                    var keyCode = event.which || event.keyCode;
                    if ((keyCode === 13) || (keyCode === 108) || (keyCode === 32)) {
                        event.preventDefault();
                    }
                });

                $checkboxSkin.on('keyup', function (event) {
                    if ($element.attr('disabled')) {
                        return;
                    }
                    var keyCode = event.which || event.keyCode;
                    if ((keyCode === 13) || (keyCode === 108) || (keyCode === 32)) {
                        $element[0].checked = !$element[0].checked;// 设置元素的选中状态
                        if (ngModelCtrl) { // 更新Angular指令中的模型值
                            ngModelCtrl.$setViewValue($element[0].checked);
                        }
                        $element.trigger('change');// 触发原生checkbox的change事件，确保change事件生效
                    }
                });
            }
        }
        return module.name;
    }
);

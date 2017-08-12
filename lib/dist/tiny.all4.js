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


/**
 * @description
 * AngularJS version of the checkbox directive.
 * 定义ty-checkbox指令,最终返回module名
 */

define('components/collapse/collapse',['components/module'],
    function (module) {
        'use strict';
        module.directive('tiCollapse', tiCollapse);

        tiCollapse.$inject = ['$parse', '$injector', '$animate'];
        function tiCollapse($parse, $injector, $animate) {
            return {
                link: function (scope, element, attrs) {
                    var fromCss = {};
                    var toCss = {};

                    init(); // 处理默认的关闭/打开状态

                    // 处理动态设置的关闭/打开状态
                    scope.$watch(attrs.tiCollapse, function (willCollapse, hasCollapsed) {
                        // 初始设置不作处理
                        if (willCollapse === hasCollapsed) {
                            return;
                        }
                        if (willCollapse) {
                            collapse(); // 关闭
                        }
                        else {
                            expand(); // 展开
                        }
                    });

                    function init() {
                        fromCss = {
                            height: ''
                        };
                        toCss = {
                            height: '0'
                        };
                        // 根据开发者初始化时设置的面板打开/关闭状态，对面板设置样式
                        if (!scope.$eval(attrs.tiCollapse)) { // 如果初始化设置不关闭面板
                            element.addClass('ti-in')
                                .addClass('ti-collapse')
                                .css(fromCss);
                        }
                        else {
                            element.addClass('ti-collapse')
                                .css(toCss);
                        }
                    }

                    function getScrollFromElement(element) {
                        return {height: element.scrollHeight + 'px'};
                    }

                    function expand() {
                        // 删除关闭样式，添加过渡(transition)样式
                        element.removeClass('ti-collapse')
                            .addClass('ti-collapsing');
                        // 动画处理
                        $animate.addClass(element, 'ti-in', {
                            css: {
                                overflow: 'hidden'
                            },
                            to: getScrollFromElement(element[0])
                        }).then(expandDone);
                    }

                    function expandDone() {
                        element.removeClass('ti-collapsing')
                            .addClass('ti-collapse')
                            .css(fromCss);
                    }

                    function collapse() {
                        element
                            // 在添加collapsing样式类之前进行高度设置，避免动画从高度0开始（collapsing中有设置）
                            .css(getScrollFromElement(element[0]))
                            // 临时删除collapse样式，是为了避免动画跳转到collapsed状态
                            .removeClass('ti-collapse')
                            .addClass('ti-collapsing');

                        $animate.removeClass(element, 'ti-in', {
                            to: toCss
                        }).then(collapseDone);
                    }

                    function collapseDone() {
                        element.css(toCss);
                        element.removeClass('ti-collapsing')
                            .addClass('ti-collapse');
                    }
                }
            };
        }
        return module.name;
    }
);

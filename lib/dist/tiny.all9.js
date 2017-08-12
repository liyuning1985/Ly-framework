define('components/dropdown/dropdown',['components/module', 'components/tip/tip'], function (module) {
    'use strict';

    /**
     * 将下拉面板单独定义为一个指令，方便后续做autoComplate和Searchbox
     */
    module.directive('tiDropdown', tiDropdown);
    tiDropdown.$inject = ['tiTipService'];
    function tiDropdown(tiTipService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                dropdownId: '=?',     // 用于自动化测试识别下拉DOM
                options: '=?',        // 下拉列表数据
                selectedId: '=?',     // 当前选中的ID(适用于单选功能)
                selectedArray: '=?',  // 当前选中项的ID组成的数组(适用于多选功能)
                showStyle: '=?',      // 是否向下展开
                maxHeight: '=?',      // 下拉列表的最大高度，默认为"9999px"
                panelWidth: '=?',     // 下拉列表的宽度
                noDataText: '=?',      // 自定义无匹配项时的提示文本
                dominator: '=?',      // 下拉框的定位元素
                show: '=?',            // 是否显示列表
                select: '&',          // 单选组件时，下拉选项的选中事件（包括点击和回车键）
                change: '&'           // 由用户导致的当前选中项变更（单选：下拉框关闭时判定是否发生变化；多选；Checkbox改变即触发）
            },
            templateUrl: function ($element, attrs) {
                if (_.has(attrs, 'multi')) {
                    return '/tiny-components/src/components/dropdown/dropdownMulti.html';
                }

                return '/tiny-components/src/components/dropdown/dropdownSingle.html';
            },
            link: link
        };

        function link(scope, $element, attrs) {
            init(scope, $element, attrs);
            addBehavior(scope, $element, tiTipService); // 定义事件及事件回调
            addWatcher(scope, $element); // 添加脏值检查回调
        }
    }

    function init(scope, $element, attrs) {
        scope.maxHeight = _.isUndefined(scope.maxHeight) ? '9999px' : scope.maxHeight;
        verifyPanelWidth(scope); // 对panelWidth做合法性处理, 并修正非法值
        scope.isMulti = _.has(attrs, 'multi');
        scope.selctedOption = {}; // 使用快捷键操作得到的当前选中项

        // 设置下拉框的初始展开状态，便于在show的脏值检查中统一确定是否需要触发change事件
        if (scope.show === true) {
            show(scope, $element);
        } else {
            hide(scope, $element);
        }
    }

    function setDropdownId(id, $element) {
        if (!_.isUndefined(id) && id !== '') {
            $element.attr('id', id);
        }
    }

    function verifyPanelWidth(scope) {
        // panelWidth设置为'auto'、'justified'或数字时属于合法情况，不做处理
        if (scope.panelWidth === 'auto' ||
            scope.panelWidth === 'justified' ||
            !_.isNaN(parseInt(scope.panelWidth, 10))) {
            return;
        }

        scope.panelWidth = 'justified';
    }

    function addBehavior(scope, $element, tiTipService) {
        scope.panelMousedown = function (event) {
            event.preventDefault(); // 点击组名时不能使根节点失去焦点

            // 兼容性处理：IE下点击下拉框的滚动条无法阻止根节点失去焦点，兼容性处理
            if (window.tiny.utils.browser.ie === true) {
                (scope.dominator)[0].isPrevented = true;
                event.stopPropagation();
            }
        };

        // 兼容性处理：确保IE下点击组名再点击其他地方时，组件能正常触发对外blur
        scope.groupMousedown = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };

        // 下拉选项的单击操作（不包括组名所在的<li>元素）
        scope.mousedown = function (event, option) {
            event.preventDefault(); // 阻止根节点失去焦点

            // 兼容性处理：IE下点击下拉框的滚动条会导致根节点失去焦点
            if (window.tiny.utils.browser.ie === true) {
                event.stopPropagation();
            }

            if (scope.isMulti === true) {
                // 多选时的处理
                if (_.indexOf(scope.selectedArray, option.id) === -1) {
                    checkItem(scope, angular.copy(option));
                } else {
                    uncheckItem(scope, angular.copy(option));
                }
            } else {
                // 单选时的处理
                scope.selctedOption = angular.copy(option); // 更新当前选中项
                scope.selectedId = scope.selctedOption.id;
                scope.show = false;
                if (_.isFunction(scope.select())) {
                    scope.select()(scope.selctedOption); // 单选时传出当前选中对象
                }
            }
        };

        // 鼠标进入下拉选项时的交互
        scope.mouseenter = function (event) {
            // 若内容无法完整显示，则通过Tooltip显示完整内容
            var $option = $(event.currentTarget);
            var tooltipOptions = {
                content: $option.scope().option.label,
                position: 'top-left'
            };
            tiTipService.setTooltip($option, tooltipOptions);
        };

        // Bug Fixed：若使用原生的滚轮行为，则滚动到下拉面板头部或底部的时候，若继续滚动会触发祖先元素的滚轮事件，导致下拉面板与元素分离
        // 必须要自定义下拉面板的滚轮行为，否则会导致下拉面板与控制元素分离
        $element.on('mousewheel DOMMouseScroll', function (event) {
            event.stopPropagation();
            event.preventDefault();

            // 火狐浏览器需要做兼容性处理
            if (window.tiny.utils.browser.firefox) {
                $element[0].scrollTop += event.originalEvent.detail > 0 ? 120 : -120;
            } else {
                $element[0].scrollTop += event.originalEvent.wheelDelta > 0 ? -120 : 120;
            }
        });

        // 上、下、回车、退出等其他快捷键操作的响应
        scope.keydown = function (event) {
            if (!scope.show) {
                return;
            }

            var keyCode = event.keyCode;
            switch (keyCode) {
                case 38 : // UP键
                    responseUp(scope, $element, event);
                    break;
                case 40 : // DOWN键
                    responseDown(scope, $element, event);
                    break;
                case 27 : // ESC键
                    responseEsc(scope, event);
                    break;
                case 13 : // ENTER键
                case 108 : // ENTER键(数字小键盘)
                    responseEnter(scope, $element, event);
                    break;
                default :
                    break;
            }
        };
        $(document).on('keydown', scope.keydown);

        // 所有使得支配元素位置变化的操作都需要隐藏下拉框
        scope.hiddenPanel = function () {
            scope.show = false;
            scope.$evalAsync();
        };
        $(document).on('mousewheel DOMMouseScroll', scope.hiddenPanel);
        $(window).on('resize', scope.hiddenPanel);
    }

    function addWatcher(scope, $element) {
        scope.$watch('show', function (newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }

            // 每一次下拉框收起时确定是否需要触发单选情况下的change事件
            if (newValue === true) {
                show(scope, $element);
                scope.oldSelectedId = scope.selectedId;
            } else {
                hide(scope, $element);
                if (scope.oldSelectedId !== scope.selectedId && scope.isMulti === false) {
                    if (_.isFunction(scope.change())) {
                        scope.change()(scope.selectedId);
                    }
                }
            }
        });

        // 当下拉列表的父容器通过ng-if控制时，初始化获取的dropdownId为undefined，
        // 因此将初始化和动态修改全部在脏值检查过程中完成
        scope.$watch('dropdownId', function(newValue) {
            setDropdownId(newValue, $element);
        });

        // 数据发生变化时，如果下拉框处于展开状态，需要动态设置下拉框的最大高度以适应新数据
        scope.$watch('options', function () {
            // 下拉框收起的情况下更新数据时，不需要动态设置下拉框的最大高度
            if (scope.show === false) {
                return;
            }

            // 保持当前显示位置不变，根据内容重新设置下拉框的最大高度
            var $dominator = scope.dominator;
            var position = $dominator.offset();
            var dominatorHeight = $dominator[0].offsetHeight;
            var compatibleHeight = document.documentElement.clientHeight ||
                document.body.clientHeight ||
                window.innerHeight;
            var maxHeight;
            if (scope.showStyle === 'down') {
                var availableHeightBelow = compatibleHeight +
                    $(document).scrollTop() -
                    position.top -
                    dominatorHeight;// 输入框下方可用高度
                maxHeight = availableHeightBelow > parseInt(scope.maxHeight, 10) ?
                    scope.maxHeight : availableHeightBelow;
            } else if (scope.showStyle === 'up') {
                var availableHeightOver = position.top -
                    $(document).scrollTop();// 输入框上方可用高度
                maxHeight = availableHeightOver > parseInt(scope.maxHeight, 10) ?
                    scope.maxHeight : availableHeightOver;
            }
            $element.css('max-height', maxHeight + 'px');
        }, true);

        // link由内向外执行，初始化时scope.dominator为undefined，因此将dominator相关操作在脏值检查中完成
        scope.$watch('dominator', function (newValue) {
            if (_.isUndefined(newValue)) {
                return;
            }

            var $dominator = scope.dominator;
            $element.css('line-height', $dominator.outerHeight() + 'px');
            $element.appendTo($('body'));

            // 在支配元素销毁时，销毁下拉框
            scope.dominator.on('$destroy', function () {
                $element.remove();
                scope.$destroy();
                $(document).off('keydown', scope.keydown);
                $(window).off('resize', scope.hiddenPanel);
                $(document).off('mousewheel DOMMouseScroll', scope.hiddenPanel);
            });
        });
    }

    function responseUp(scope, $element, event) {
        event.preventDefault();

        if (scope.isMulti === true) {
            upFnMulti($element);
        } else {
            upFnSingle(scope, $element);
        }
    }

    function responseDown(scope, $element, event) {
        event.preventDefault();

        if (scope.isMulti === true) {
            downFnMulti($element);
        } else {
            downFnSingle(scope, $element);
        }
    }

    function responseEsc(scope, event) {
        event.preventDefault();
        scope.show = false;
        scope.$evalAsync();
    }

    // 关闭下拉框
    function responseEnter(scope, $element) {
        if (scope.isMulti === true) {
            enterFnMulti(scope, $element);
        } else {
            scope.show = false;
            // 触发select事件
            if (_.isFunction(scope.select())) {
                scope.select()(scope.selctedOption); // 单选时传出当前选中对象
            }
        }
        scope.$evalAsync();
    }

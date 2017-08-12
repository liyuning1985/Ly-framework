function enterFnMulti(scope, $element) {
        var $current = $element.find('.ti-dropdown-option-hover');
        if ($current.length < 1) {
            scope.show = false;
        } else if ($current.hasClass('ti-dropdown-option-selected')) {
            uncheckItem(scope, angular.copy($current.scope().option));
        } else {
            checkItem(scope, angular.copy($current.scope().option));
        }
    }

    function checkItem(scope, option) {
        scope.selectedArray.push(option.id);

        // 触发change事件
        if (_.isFunction(scope.change())) {
            scope.change()(scope.selectedArray);
        }
    }

    function uncheckItem(scope, option) {
        scope.selectedArray = _.without(scope.selectedArray, option.id);

        // 触发change事件
        if (_.isFunction(scope.change())) {
            scope.change()(scope.selectedArray);
        }
    }

    function upFnMulti($element) {
        var $allItems = $element.find('.ti-dropdown-option');
        if ($allItems.length < 1) {
            return;
        }

        // 优先查找hover元素，如果没有的话查找当前选中项
        var $current = $allItems.filter('.ti-dropdown-option-hover');
        var $next;
        var index;
        if ($current.length < 1) {
            $current = $allItems.filter('.ti-dropdown-option-selected').first();
        }

        // 查找向下键响应的hover元素
        if ($current.length > 0) {
            index = findIndex($current, $allItems);
        }
        if (index > 0) {
            $next = $($allItems[index - 1]);
        } else {
            $next = $allItems.last();
        }

        // 多选时仅涉及样式变更
        $current.removeClass('ti-dropdown-option-hover');
        $next.addClass('ti-dropdown-option-hover');
        $element.scrollTop($next[0].offsetTop);
    }

    function upFnSingle(scope, $element) {
        var $allItems = $element.find('.ti-dropdown-option');
        if ($allItems.length < 1) {
            return;
        }

        // 确定下一个选中项
        var $current = $allItems.filter('.ti-dropdown-option-selected');
        var $next;
        var index;
        if ($current.length > 0) {
            index = findIndex($current, $allItems);
        }
        if (index > 0) {
            $next = $($allItems[index - 1]);
        } else {
            $next = $allItems.last();
        }

        // 单选时完成事件通知及更新滚动条
        scope.selctedOption = angular.copy($next.scope().option); // 保存上下键选取的值，回车键传出
        scope.selectedId = scope.selctedOption.id;
        scope.$evalAsync();
        $element.scrollTop($next[0].offsetTop);
    }

    function downFnMulti($element) {
        var $allItems = $element.find('.ti-dropdown-option');
        if ($allItems.length < 1) {
            return;
        }

        // 优先查找hover元素，如果没有的话查找当前选中项
        var $current = $allItems.filter('.ti-dropdown-option-hover');
        var $next;
        var index;
        if ($current.length < 1) {
            $current = $allItems.filter('.ti-dropdown-option-selected').first();
        }

        // 查找向下键响应的hover元素
        if ($current.length > 0) {
            index = findIndex($current, $allItems);
        }
        if (index < $allItems.length - 1) {
            $next = $($allItems[index + 1]);
        } else {
            $next = $allItems.first();
        }

        // 多选时仅涉及样式变更
        $current.removeClass('ti-dropdown-option-hover');
        $next.addClass('ti-dropdown-option-hover');
        $element.scrollTop($next[0].offsetTop);
    }

    function downFnSingle(scope, $element) {
        var $allItems = $element.find('.ti-dropdown-option');
        if ($allItems.length < 1) {
            return;
        }

        // 确定下一个选中项
        var $current = $allItems.filter('.ti-dropdown-option-selected');
        var $next;
        var index;
        if ($current.length > 0) {
            index = findIndex($current, $allItems);
        }
        if (index < $allItems.length - 1) {
            $next = $($allItems[index + 1]);
        } else {
            $next = $allItems.first();
        }

        // 单选时完成事件通知及更新滚动条
        scope.selctedOption = angular.copy($next.scope().option); // 保存上下键选取的值，回车键传出
        scope.selectedId = scope.selctedOption.id;
        scope.$evalAsync();
        $element.scrollTop($next[0].offsetTop);
    }

    // 从符合jquery选择器的某一集合中寻找$item所在的序号
    function findIndex($item, $itemCollections) {
        if ($item.length < 1 || $itemCollections.length < 1) {
            return -1;
        }

        for (var i = 0; i < $itemCollections.length; i++) {
            if ($item[0] === $itemCollections[i]) {
                return i;
            }
        }

        return -1;
    }

    // 将下拉框显示出来
    function show(scope, $element) {
        setLayout(scope, $element);
        setShowStyle(scope, $element);
        $element.show();
        setPanelWidth(scope, $element); // 确保在显示之后设置下拉框的宽度，避免滚动条的影响
        setScrollTop(scope, $element); // 滚动条定位至当前选中元素
    }

    // 设置下拉框的行高及最小宽度
    function setLayout(scope, $element) {
        var $dominator = scope.dominator;
        var dominatorHeight = $dominator.outerHeight();
        $element.css({
            'line-height': dominatorHeight + 'px',
            'min-width': $dominator.outerWidth() - 2 + 'px',
            'max-height': scope.maxHeight
        });
    }

    // 确定元素的显示样式，包括位置、最大高度、向上或向下
    function setShowStyle(scope, $element) {
        var $dominator = scope.dominator;
        var dominatorHeight = $dominator.outerHeight();
        var position = $dominator.offset();
        var compatibleHeight = document.documentElement.clientHeight ||
            document.body.clientHeight ||
            window.innerHeight;
        var availableHeightBelow = compatibleHeight +
            $(document).scrollTop() -
            position.top -
            dominatorHeight;// 输入框下方可用高度
        var availableHeightOver = position.top - $(document).scrollTop();// 输入框上方可用高度
        var actualHeight = getActualHeight($element); // 获取下拉框的真实显示高度
        if (actualHeight <= availableHeightBelow) {
            // 1.下方空间足够，向下展开
            $element.css({
                bottom: '',
                top: position.top + dominatorHeight + 'px',
                left: position.left + 'px',
                'max-height': actualHeight + 2 + 'px'
            });
            scope.showStyle = 'down';
        } else if (actualHeight <= availableHeightOver) {
            // 2.下方空间不足，上方空间足够，向上展开
            $element.css({
                top: '',
                bottom: compatibleHeight - position.top + 'px',
                left: position.left + 'px',
                'max-height': actualHeight + 2 + 'px'
            });
            scope.showStyle = 'up';
        } else if (availableHeightOver > availableHeightBelow) {
            // 3.上下空间都不够，上方空间较大，则向上展开
            $element.css({
                top: '',
                bottom: compatibleHeight - position.top - 1 + 'px',
                left: position.left + 'px',
                'max-height': availableHeightOver - 1
            });
            scope.showStyle = 'up';
        } else {
            // 4.上下空间都不够，下方空间较大，则向下展开
            $element.css({
                bottom: '',
                top: position.top + dominatorHeight - 1 + 'px',
                left: position.left + 'px',
                'max-height': availableHeightBelow - 1
            });
            scope.showStyle = 'down';
        }
    }

    // 获取$element在无最大高度限制时的显示高度
    function getActualHeight($element) {
        // 通过临时DOM计算下拉列表的显示高度
        var $temp = $element.clone();
        $temp.css({
            display: 'block',
            visibility: 'hidden',
            left: '-9999px',
            position: 'absolute'
        }).appendTo($('body'));
        var actualHeight = $temp.outerHeight();// 弹出框的显示高度
        $temp.remove();

        return actualHeight;
    }

    function setScrollTop(scope, $element) {
        var $allItems = $element.find('.ti-dropdown-option');
        if ($allItems.length < 1) {
            return;
        }

        var option = {};
        for (var i = 0; i < $allItems.length; i++) {
            option = $($allItems[i]).scope().option;
            if (scope.isMulti === true) {
                // 多选时定位至第一个选中项
                if (_.indexOf(scope.selectedArray, option.id) !== -1) {
                    $element.scrollTop($allItems[i].offsetTop);
                    return;
                }
            } else if (option.id === scope.selectedId) {
                $element.scrollTop($allItems[i].offsetTop);
                return;
            }
        }

        $element.scrollTop($allItems[0].offsetTop);
    }

    function setPanelWidth(scope, $element) {
        var panelWidth = parseInt(scope.panelWidth, 10);
        if (!isNaN(panelWidth)) {
            $element.css('width', parseInt(scope.panelWidth, 10) - 2 + 'px');
        } else if (scope.panelWidth === 'auto') {
            $element.css('width', 'auto');
            // Fix bug: 非IE下滚动条会覆盖部分内容
            if (!window.tiny.utils.browser.ie) {
                // 需要重置宽度设置，根据下拉面板的真实宽度确定是否需要增加滚动条宽度
                $element[0].style.width = null;

                // 有滚动条出现且文本较长时，需要再增加滚动条的宽度，否则内容显示不全，加2是左、右边框的宽度
                var clientWidth = $element[0].clientWidth;
                var offsetWidth = $element[0].offsetWidth;
                var scrollWidth = offsetWidth - clientWidth;
                if (offsetWidth > (clientWidth + 2) &&
                    $element.outerWidth() < ($element.outerWidth() + scrollWidth)) {
                    $element.css('width', $element.outerWidth() + scrollWidth - 2);
                }
            }
        } else {
            // 默认宽度设置，包含justified
            var $dominator = scope.dominator;
            $element.css('width', parseInt($dominator[0].offsetWidth, 10) - 2 + 'px');
        }
    }

    function hide(scope, $element) {
        // scope.$broadcast('elementHide'); // 被提示元素隐藏前需要通知给Tooltip
        $element.hide();
    }

    return module.name;
});

/**
 * 单选下拉组件
 */

define('components/select/select',['components/module', 'components/dropdown/dropdown'],
    function (module) {
        module.directive('tiSelect', tiSelectDirective);
        function tiSelectDirective() {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    placeholderText: '=?',  // 组件的预留文本
                    disable: '=?',          // 控制组件是否可用
                    focused: '=?',          // 控制组件是否获取焦点
                    panelMaxHeight: '=?',   // 下拉面板的最大显示高度，溢出时则出滚动条
                    panelWidth: '=?',       // 下拉面板的宽度，可选值为'justified'(默认),'auto'或自定义宽度，但宽度不能小于select面板的宽度
                    selectedId: '=?',       // 当前选中项的id
                    options: '=?',           // 下拉选项的全部数据
                    noDataText: '=?',        // 无数据时的显示文本
                    change: '&',            // 同原生change事件
                    blur: '&',              // 失去焦点的事件
                    focus: '&',             // 下拉框的focus事件
                    select: '&',            // 下拉选项被选中时需要触发select事件
                    beforeOpen: '&'         // 仅用于异步数据获取
                },
                templateUrl: '/tiny-components/src/components/select/select.html',

                link: function (scope, $element, attrs) {
                    // 默认值设定
                    init(scope, $element, attrs);
                    addBehavior(scope, $element, attrs); // 定义事件回调
                    addWatcher(scope, $element);
                }
            };
        }

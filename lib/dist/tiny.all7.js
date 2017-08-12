    module.directive('tiTip', ['tiTipService', function(tiTipService) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                tooltipModel: '=tiTip'
            },
            link: link
        };

        function link(scope, $element) {
            var tooltipModel = angular.extend({}, tiTipService.getDefaults(), scope.tooltipModel); // 参数合并
            scope.isPrevented = false; // 鼠标移出元素时是否阻止tooltip消失

            addBehaviorByDirective($element, tooltipModel, scope);

            // 当数据发生变化时一律重绘 TODO:content参数变化时单独处理
            scope.$watchCollection('tooltipModel', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                hideTooltipByDirective(scope, {duration: 0});
                if (newValue.show === true && newValue.content !== '') {
                    var newOptions = angular.extend({}, tiTipService.getDefaults(), newValue);
                    showTooltipByDirective($element, newOptions, scope);
                }
            });
        }

        // 指令方式生成时，添加事件
        function addBehaviorByDirective($element, tooltipModel, scope) {
            // 添加控制tooltip显示与隐藏的事件
            var triggerEvt = getTriggerEvt(tooltipModel, CONSTANT_CONFIG.EVENT_MAP); // 获取触发事件
            if (triggerEvt.showEvt === 'click') {
                $element.on('click', function() {
                    scope.tooltipModel.show = !scope.tooltipModel.show;
                    scope.$evalAsync();
                });
            } else {
                // 使得Tooltip显示的事件，如“focus”，“mouseenter”
                $element.on(triggerEvt.showEvt, function() {
                    scope.tooltipModel.show = true;
                    scope.$evalAsync();
                });

                // 使得Tooltip消失的事件，如“blur”，“mouseleave”
                $element.on(triggerEvt.hideEvt, function() {
                    // 当事件对为mouseenter/mouseleave时，在鼠标移动到Tooltip上时，要阻止tooltip消失
                    if (triggerEvt.hideEvt === 'mouseleave') {
                        setTimeout(function() {
                            if (scope.isPrevented === false) {
                                scope.tooltipModel.show = false;
                                scope.$evalAsync();
                            }
                        }, 0);
                    } else {
                        scope.tooltipModel.show = false;
                        scope.$evalAsync();
                    }
                });
            }

            // 当$element销毁时，销毁Tooltip
            $element.on('$destroy', scope.hideTooltip);
        }

        // 指令方式生成时，显示Tooltip
        function showTooltipByDirective($element, tooltipModel, scope) {
            // 生成Tooltip的DOM
            var $tooltipElem = $('<div class="ti-tooltip ti-tooltip-' + tooltipModel.position + '"></div>'); // TODO: XSS防护
            $tooltipElem.html(tooltipModel.content);
            $tooltipElem.addClass(tooltipModel.customClass);
            scope.$tooltipElem = $tooltipElem;

            addHideEvt(scope, $tooltipElem, tooltipModel); // 添加需要隐藏Tooltip的事件

            var layoutParam = getLayoutParam($element, $tooltipElem, tooltipModel); // 获取Tooltip的显示参数
            setTooltipPosition($tooltipElem, layoutParam); // 设置Tooltip的显示样式

            // 设置Tooltip显示时的动画效果
            var showEffect = {
                duration: 0 // 建议控制在300ms以内
            };
            angular.extend(showEffect, scope.tooltipModel.showEffect);
            $tooltipElem.show(showEffect);
        }

        function addHideEvt(scope, $tooltipElem, tooltipModel) {
            // 当事件为mouseenter时，在鼠标移动到Tooltip上时，要阻止tooltip消失
            if (tooltipModel.triggerEvent === 'mouseenter') {
                $tooltipElem.on('mouseenter', function() {
                    scope.isPrevented = true;
                });
                $tooltipElem.on('mouseleave', function() {
                    scope.tooltipModel.show = false;
                    scope.isPrevented = false;
                    scope.$evalAsync();
                });
            }

            scope.hideTooltip = function () {
                scope.tooltipModel.show = false;
                scope.$evalAsync();
            };

            // 任何可能导致元素位置发生变化的交互都需要Tooltip消失
            $(document).on('mousewheel.tiTip DOMMouseScroll.tiTip', scope.hideTooltip);
            $(window).on('resize.tiTip', scope.hideTooltip);
        }

        // 指令方式销毁Tooltip
        function hideTooltipByDirective(scope, tempEffect) {
            if (!scope.$tooltipElem) {
                return;
            }
            $(document).off('mousewheel.tiTip DOMMouseScroll.tiTip', scope.hideTooltip);
            $(window).off('resize.tiTip', scope.hideTooltip);

            // 设置Tooltip消失时的动画效果
            var hideEffect = {
                duration: 0, // 建议控制在300ms以内
                complete: function() {
                    if (scope.$tooltipElem === null) {
                      return;
                    }
                    scope.$tooltipElem.remove();
                    scope.$tooltipElem = null;
                }
            };
            if (angular.isUndefined(tempEffect)) {
                angular.extend(hideEffect, scope.tooltipModel.hideEffect);
            } else {
                angular.extend(hideEffect, tempEffect);
            }
            scope.$tooltipElem.hide(hideEffect);
        }

    }]);

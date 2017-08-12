define('components/tip/tip',['components/module'], function(module) {
    'use strict';

    /**
     * 配置Tooltip的常量参数
     */
    var CONSTANT_CONFIG = {
        WIDTH: '276px', // Tooltip的默认换行宽度
        EVENT_MAP: {
            mouseenter: 'mouseleave',
            focus: 'blur',
            click: 'click',
            none: 'none' // 若Tooltip的显示、隐藏需要自己控制，则事件定义为"none"
        },
        ARROW_HEIGHT: 9// 主要使用场景为参与计算，因此直接使用数值 TODO: 提供修改功能
    };
/************************************tiTipService服务定义****************************************/
    module.provider('tiTipService', tiTipService);
    function tiTipService() {
        var defaultConfig = {
            triggerEvent: 'mouseenter',
            show: false,
            position: 'top',
            content: 'Welcome to use Tiny tooltip.'
        };

        /**
         * 配置整个APP中Tooltip的默认设置
         * @param 用户自定义配置参数集
         */
        this.setDefaults = function(options) {
            angular.extend(defaultConfig, options);
        };

        /**
         * 获取当前默认的Tooltip配置参数集
         * @returns {{triggerEvent: string, show: boolean, position: string, content: string}}
         */
        this.getDefaults = function() {
            return defaultConfig;
        };

        /**
         * 为某一element配置Tooltip
         * @param element[type: jquery Obj]: 被提示元素的DOM对象
         * @param options[type: Obj]: tooltip的配置参数集
         */
         // TODO: element放到判断中
        this.createTip = function($element, options) {
            if (angular.isUndefined($element) || !canCreateTooltip($element)) {
                return;
            }

            // 创建某一元素的Tooltip，配置相关参数，在mouseenter、focus或click事件触发时显示Tooltip
            var tooltipModel = angular.extend({}, defaultConfig, options);
            addBehaviorByService($element, tooltipModel);

            // options为需要更新的参数集
            function show(options) {
                if (angular.isUndefined($element) || $element.length < 1) {
                    return;
                }

                if ($.isPlainObject(options)) {
                    angular.extend($element[0].tiTip.tooltipModel, options); // 更新Tooltip的配置
                }

                showTooltipByService($element, $element[0].tiTip.tooltipModel);
            }

            function hide() {
                if (angular.isUndefined($element) || angular.isUndefined($element[0].tiTip) || $element.tiTip === null) {
                    return;
                }
                $element[0].tiTip.hideTooltip($element)();
            }

            var tipInstance = {
                show: show,
                hide: hide
            };
            return tipInstance;
        };

        // 是否可以在$element上创建Tooltip
        function canCreateTooltip($element) {
            if ($element.length < 1 || $.isPlainObject($element[0].tiTip)) {
                return false;
            }
            return true;
        }

        // 根据元素及内容，设置是否出现Tooltip
        this.setTooltip = function($element, tooltipConfig) {
            if (angular.isUndefined($element) || $element.length < 1) {
                return;
            }

            //this.hide($element); // 先隐藏之前的Tooltip
            $element.removeAttr('title'); // 暂时先使用原生title，后续提供跟踪样式Tip

            // 计算元素的当前显示宽度和完整显示时需要的宽度
            var displayWidth = parseFloat(getComputedStyle($element[0], null).width);
            var $tempNode = $element.clone();
            $tempNode.css({
                "overflow" : "visible",
                "position" : "absolute",
                "visibility" : "hidden"
            });
            $('body').append($tempNode);
            var realWidth = parseFloat(getComputedStyle($tempNode[0], null).width);
            $tempNode.remove();

            // 如果完整显示时的宽度大于当前显示宽度，则自动设置提示信息
            if (realWidth > displayWidth) {
                //this.createTooltip($element, tooltipConfig);
                //this.show($element);
                $element.attr('title', tooltipConfig.content); // 暂时先使用原生title，后续提供跟踪样式Tip
            }
        };

        // 对外暴露的方法
        this.$get = function() {
            return {
                getDefaults: this.getDefaults,
                setDefaults: this.setDefaults,
                createTip: this.createTip,
                setTooltip: this.setTooltip
            };
        };

        // TODO:修改事件传播

        /**
         * 添加Tooltip相关的事件行为 TODO: 修改为config
         * @param element[type: jquery Obj]: 被提示元素
         * @param tooltipModel[type: Obj]: tooltip的配置参数集
         */
        function addBehaviorByService($element, tooltipModel) {

            initConfig($element, tooltipModel); // 设置$element上的默认参数

            addTriggerEvt($element, tooltipModel); // 添加控制tooltip显示与隐藏的事件

            // 仅隐藏Tooltip，内存中仍保存相关数据
            $(document).on('mousewheel.tiTip DOMMouseScroll.tiTip', $element[0].tiTip.hideTooltip($element));
            $(window).on('resize.tiTip', $element[0].tiTip.hideTooltip($element));

            // 当$element销毁时，彻底销毁Tooltip
            $element.on('$destroy', function() {
                if ($element[0].tiTip === null) {
                    return;
                }
                $(document).off('mousewheel.tiTip DOMMouseScroll.tiTip', $element[0].tiTip.hideTooltip($element));
                $(window).off('resize.tiTip', $element[0].tiTip.hideTooltip($element));

                if (!_.isUndefined($element[0].tiTip.tooltipDom)) {
                    $element[0].tiTip.tooltipDom.remove();
                }

                $element[0].tiTip = null;
            });
        }

        /**
         * 设置element上与Tooltip相关的默认值
         * @param element[type: jquery Obj]: 被提示元素
         * @param tooltipModel[type: Obj]: tooltip的配置参数集
         */
        function initConfig($element, tooltipModel) {
            $element[0].tiTip = {
                tooltipModel: tooltipModel,
                hasShown: false, // 标识Tooltip的显示、隐藏状态 TODO: isShown
                isPrevented: false, // mouseenter/mouseleave时，在鼠标移动到Tooltip上时，要阻止tooltip消失
                hideTooltip: function($element) { // TODO:hide
                    // tempEffect仅用于内部隐藏时清除duration，否则调用服务重复调用服务show方法时会导致Tooltip消失
                    return function (tempEffect) {
                        // TODO:VAR TEMP = $element[0].tiTip;
                        if (angular.isUndefined($element[0].tiTip) || $element[0].tiTip === null || !$element[0].tiTip.hasShown) {
                            return;
                        }

                        // 设置Tooltip消失时的动画效果
                        var hideEffect = {
                            duration: 0, // 建议控制在300ms以内
                            complete: function() {
                                $element[0].tiTip.tooltipDom.remove();
                                $element[0].tiTip.hasShown = false;
                            }
                        };
                        if (angular.isUndefined(tempEffect)) {
                            angular.extend(hideEffect, $element[0].tiTip.tooltipModel.hideEffect);
                        } else {
                            angular.extend(hideEffect, tempEffect); // 内部使用时，临时清除duration
                        }
                        $element[0].tiTip.tooltipDom.hide(hideEffect);
                    }
                }
            }
        }

        // 在$element上添加控制Tooltip显示与隐藏的事件 TODO:修改为case语句
        function addTriggerEvt($element, tooltipModel) {
            var triggerEvt = getTriggerEvt(tooltipModel, CONSTANT_CONFIG.EVENT_MAP);
            if (triggerEvt.showEvt === 'click') {
                $element.on('click', function() {
                    if ($element[0].tiTip.hasShown === true) {
                        $element[0].tiTip.hideTooltip($element)();
                    } else {
                        // TODO:代码一致性
                        showTooltipByService($element, tooltipModel);
                    }
                });
            } else {
                $element.on(triggerEvt.showEvt, function() {
                    showTooltipByService($element, tooltipModel);
                });

                $element.on(triggerEvt.hideEvt, function() {
                    // mouseenter/mouseleave时，在鼠标移动到Tooltip上时，要阻止tooltip消失
                    if (triggerEvt.hideEvt === 'mouseleave') {
                        setTimeout(function() {
                            if ($element[0].tiTip.isPrevented === false) {
                                $element[0].tiTip.hideTooltip($element)();
                            }
                        }, 0);
                    } else {
                        $element[0].tiTip.hideTooltip($element)();
                    }
                });
            }
        }

        function showTooltipByService($element, tooltipModel) {
            // 若当前Tooltip未定义或内容为空，则不显示 TODO:定义变量，封装函数
            if (angular.isUndefined($element[0].tiTip)
                || $element[0].tiTip === null) {
                return;
            }

            $element[0].tiTip.hideTooltip($element)({duration: 0});

            // 当内容为空时，仅使tip消失
            if (tooltipModel.content === '') {
                return;
            }

            var $tooltipElem = generateTooltipElem($element, tooltipModel);
            var layoutParam = getLayoutParam($element, $tooltipElem, tooltipModel);
            setTooltipPosition($tooltipElem, layoutParam);

            // 设置Tooltip显示时的动画效果
            var showEffect = {
                duration: 0 // 建议控制在300ms以内
            };
            angular.extend(showEffect, tooltipModel.showEffect);
            $tooltipElem.show(showEffect);
            $element[0].tiTip.hasShown = true;
        }

        // 对position的合法性检查
        // 生成Tooltip的DOM，并处理mouseenter、mouseleave事件
        function generateTooltipElem($element, tooltipModel) {
            var $tooltipElem = $('<div class="ti-tooltip ti-tooltip-' + tooltipModel.position + '"></div>'); // TODO: XSS防护
            $tooltipElem.html(tooltipModel.content);
            $tooltipElem.addClass(tooltipModel.customClass);
            $element[0].tiTip.tooltipDom = $tooltipElem;

            // 当事件为mouseenter时，在鼠标移动到Tooltip上时，要阻止tooltip消失
            if (tooltipModel.triggerEvent === 'mouseenter') {
                $tooltipElem.on('mouseenter', function() {
                    $element[0].tiTip.isPrevented = true;
                });
                $tooltipElem.on('mouseleave', function() {
                    $element[0].tiTip.hideTooltip($element)();
                    $element[0].tiTip.isPrevented = false;
                });
            }

            return $tooltipElem;
        }
    }

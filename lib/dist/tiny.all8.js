/**************************以下为tiTip服务和指令共同调用的公共方法****************************/

    // 获取控制Tooltip显示、消失的事件对
    function getTriggerEvt(tooltipModel, eventMap) {
        return {
            showEvt: tooltipModel.triggerEvent,
            hideEvt: eventMap[tooltipModel.triggerEvent]
        }
    }

    // 当position: "top"时，计算Tooltip的显示参数
    function showTop($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        $temp.css({
            position: 'absolute',
            left: layoutParam.left + 'px'
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth);
        var tooltipHeight = $temp[0].offsetHeight;
        var top = layoutParam.top - tooltipHeight - CONSTANT_CONFIG.ARROW_HEIGHT;
        var leftOffset = ($temp[0].offsetWidth - $element[0].offsetWidth) / 2;
        var left = layoutParam.left - leftOffset;
        $temp.remove();

        return {
            left: left,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "top-left"时，计算Tooltip的显示参数
    function showTopLeft($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        $temp.css({
            position: 'absolute',
            left: layoutParam.left + 'px'
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth);
        var tooltipHeight = $temp[0].offsetHeight;
        var top = layoutParam.top - tooltipHeight - CONSTANT_CONFIG.ARROW_HEIGHT;
        var left = layoutParam.left;
        $temp.remove();

        return {
            left: left,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "top-right"时，计算Tooltip的显示参数
    function showTopRight($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        var right = document.documentElement.clientWidth - layoutParam.left - layoutParam.width + 'px';
        $temp.css({
            position: 'absolute',
            right: right
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth); // 需要设置换行宽度
        var tooltipHeight = $temp[0].offsetHeight;
        var top = layoutParam.top - tooltipHeight - CONSTANT_CONFIG.ARROW_HEIGHT;
        $temp.remove();

        return {
            right: right,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "bottom"时，计算Tooltip的显示参数
    function showBottom($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        $temp.css({
            position: 'absolute',
            left: layoutParam.left + 'px'
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth);
        var top = layoutParam.top + layoutParam.height + CONSTANT_CONFIG.ARROW_HEIGHT;
        var leftOffset = ($temp[0].offsetWidth - $element[0].offsetWidth) / 2;
        var left = layoutParam.left - leftOffset;
        $temp.remove();

        return {
            left: left,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "bottom-left"时，计算Tooltip的显示参数
    function showBottomLeft($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        $temp.css({
            position: 'absolute',
            left: layoutParam.left + 'px'
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth);
        var top = layoutParam.top + layoutParam.height + CONSTANT_CONFIG.ARROW_HEIGHT;
        var left = layoutParam.left;
        $temp.remove();

        return {
            left: left,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "bottom-right"时，计算Tooltip的显示参数
    function showBottomRight($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        var right = document.documentElement.clientWidth - layoutParam.left - layoutParam.width + 'px';
        $temp.css({
            position: 'absolute',
            right: right
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth); // 需要设置换行宽度
        var top = layoutParam.top + layoutParam.height + CONSTANT_CONFIG.ARROW_HEIGHT;
        $temp.remove();

        return {
            right: right,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "left"时，计算Tooltip的显示参数
    function showLeft($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        var right = document.documentElement.clientWidth - layoutParam.left + CONSTANT_CONFIG.ARROW_HEIGHT + 'px';
        $temp.css({
            position: 'absolute',
            right: right
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth); // 需要设置换行宽度
        var topOffset = ($temp[0].offsetHeight - layoutParam.height) / 2;
        var top = layoutParam.top - topOffset;
        $temp.remove();

        return {
            right: right,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "left-top"时，计算Tooltip的显示参数
    function showLeftTop($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        var right = document.documentElement.clientWidth - layoutParam.left + CONSTANT_CONFIG.ARROW_HEIGHT + 'px';
        $temp.css({
            position: 'absolute',
            right: right
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth); // 需要设置换行宽度
        var top = layoutParam.top;
        $temp.remove();

        return {
            right: right,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "left-bottom"时，计算Tooltip的显示参数
    function showLeftBottom($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取被提示元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        var right = document.documentElement.clientWidth - layoutParam.left + CONSTANT_CONFIG.ARROW_HEIGHT + 'px';
        $temp.css({
            position: 'absolute',
            right: right
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth); // 需要设置换行宽度
        var bottom = document.documentElement.clientHeight - layoutParam.top - layoutParam.height;
        $temp.remove();

        return {
            right: right,
            bottom: bottom,
            width: tempWidth
        }
    }

    // 当position: "right"时，计算Tooltip的显示参数
    function showRight($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取被提示元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        var left = layoutParam.left + layoutParam.width + CONSTANT_CONFIG.ARROW_HEIGHT + 'px';
        $temp.css({
            position: 'absolute',
            left: left
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth); // 需要设置换行宽度
        var topOffset = ($temp[0].offsetHeight - layoutParam.height) / 2;
        var top = layoutParam.top - topOffset;
        $temp.remove();

        return {
            left: left,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "right-top"时，计算Tooltip的显示参数
    function showRightTop($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取被提示元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        var left = layoutParam.left + layoutParam.width + CONSTANT_CONFIG.ARROW_HEIGHT + 'px';
        $temp.css({
            position: 'absolute',
            left: left
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth); // 需要设置换行宽度
        var top = layoutParam.top;
        $temp.remove();

        return {
            left: left,
            top: top,
            width: tempWidth
        }
    }

    // 当position: "right-bottom"时，计算Tooltip的显示参数
    function showRightBottom($element, $tooltipElem, tooltipModel) {
        var layoutParam = getElementLayout($element); // 获取被提示元素的布局参数

        // 通过临时DOM计算Tooltip的显示时的布局参数
        var $temp = $tooltipElem.clone();
        var left = layoutParam.left + layoutParam.width + CONSTANT_CONFIG.ARROW_HEIGHT + 'px';
        $temp.css({
            position: 'absolute',
            left: left
        }).appendTo($('body')).show();

        var tempWidth = setTempTooltipWidth($temp, tooltipModel.maxWidth); // 需要设置换行宽度
        var bottom = document.documentElement.clientHeight - layoutParam.top - layoutParam.height;
        $temp.remove();

        return {
            left: left,
            bottom: bottom,
            width: tempWidth
        }
    }

    // 获取Tooltip的定位及宽度参数
    function getLayoutParam($element, $tooltipElem, tooltipModel) {
        var layoutParam = {};
        switch (tooltipModel.position) {
            case 'top':
                layoutParam = showTop($element, $tooltipElem, tooltipModel);
                break;
            case 'top-left':
                layoutParam = showTopLeft($element, $tooltipElem, tooltipModel);
                break;
            case 'top-right':
                layoutParam = showTopRight($element, $tooltipElem, tooltipModel);
                break;
            case 'bottom':
                layoutParam = showBottom($element, $tooltipElem, tooltipModel);
                break;
            case 'bottom-right':
                layoutParam = showBottomRight($element, $tooltipElem, tooltipModel);
                break;
            case 'bottom-left':
                layoutParam = showBottomLeft($element, $tooltipElem, tooltipModel);
                break;
            case 'left':
                layoutParam = showLeft($element, $tooltipElem, tooltipModel);
                break;
            case 'left-top':
                layoutParam = showLeftTop($element, $tooltipElem, tooltipModel);
                break;
            case 'left-bottom':
                layoutParam = showLeftBottom($element, $tooltipElem, tooltipModel);
                break;
            case 'right':
                layoutParam = showRight($element, $tooltipElem, tooltipModel);
                break;
            case 'right-top':
                layoutParam = showRightTop($element, $tooltipElem, tooltipModel);
                break;
            case 'right-bottom':
                layoutParam = showRightBottom($element, $tooltipElem, tooltipModel);
                break;
            default :
                break;
        }

        return layoutParam;
    }

    /**
     * 设置Tooltip最终显示时的布局参数
     * @param tooltipElem：Tooltip的DOM
     * @param layoutParam：通过临时DOM及用户配置计算得出的Tooltip布局参数，部分参数会存在undefined的情况
     */
    function setTooltipPosition($tooltipElem, layoutParam) {
        $tooltipElem.css({
            left: parseInt(layoutParam.left, 10) + 'px',
            top: parseInt(layoutParam.top, 10) + 'px',
            right: parseInt(layoutParam.right, 10) + 'px',
            bottom: parseInt(layoutParam.bottom, 10) + 'px',
            width: parseInt(layoutParam.width, 10) + 'px'
        });
        $tooltipElem.appendTo($('body'));
    }

    /**
     * 获取元素的布局参数，如width, height, left, top
     * @param element [jquery Obj]: 被提示元素的DOM对象
     * @returns {top: number, left: number, width: number, height: number}
     */
    function getElementLayout($element) {
        return {
            top: $element.offset().top,
            left: $element.offset().left,
            width: $element[0].offsetWidth,
            height: $element[0].offsetHeight
        }
    }

    /**
     * 设置Tooltip临时DOM的宽度属性，临时呈现的效果需要与最终呈现的保持一致
     * @param tempTooltip：临时DOM，获取到相关样式后移除
     * @param customWidth：用户自定义的换行宽度
     * @return tempWidth: Tooltip最终显示时，也需要设置相同的宽度
     */
    function setTempTooltipWidth($tempTooltip, customWidth) {
        var tempWidth; // 默认值为undefined，会被css忽略
        if (angular.isDefined(customWidth)) {
            tempWidth = customWidth;
        } else if ($tempTooltip[0].offsetWidth > parseInt(CONSTANT_CONFIG.WIDTH, 10)) {
            tempWidth = CONSTANT_CONFIG.WIDTH;
        }
        $tempTooltip.css('width', tempWidth);

        return tempWidth;
    }

    return module.name;
});

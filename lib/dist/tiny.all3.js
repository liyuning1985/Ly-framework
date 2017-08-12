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

/**
 * @description
 * AngularJS version of the formField directive.
 * 定义ti-formfield指令,最终返回module名
 */

define('components/formfield/formfield',['components/module'],
    function (module) {
        'use strict';

        module.constant('tiFormConst', {

            // 每一个ti-item占4个td
            // 第一个td用来显示“*”，第二个td用来显示label，
            // 第三个td用来显示content, 第四个td是item间距
            tdNumPerItem: 4,

            // item之间的默认间距，适用于多列情况
            colsGap: '70px',

            // ti-btn-item的水平对齐方式
            horizontalAlignOpts: {
                required: 'required', // 与第一个td水平对齐（第一个td用来显示“*”）
                label: 'label',       // 与第二个td水平对齐（第二个td用来显示label）
                content: 'content'   // 与第三个td水平对齐（第三个td用来显示content）
            },

            // 表单内容的垂直对齐方式
            verticalAlign: 'middle'

        });


        module.directive('tiFormfield', tiFormField);
        function tiFormField() {
            return {
                restrict: 'E',
                transclude: true,
                scope: true,
                replace: true,
                controller: tiFormFieldController,
                templateUrl: '/tiny-components/src/components/formfield/formfield.html',
                link: function (scope, element) {
                    // 删除存放ti-item的废弃标签
                    setTimeout(function () {
                        element.find('#' + scope.fieldId).remove();
                    }, 0);
                }
            };
        }

        tiFormFieldController.$inject = ['$scope', '$attrs', 'tiFormConst'];
        function tiFormFieldController($scope, $attrs, tiFormConst) {
            var fieldCtrl = this;
            // ti-item数据列表
            $scope.items = [];
            // 根据cols对ti-item列表分组后的数据
            $scope.groupedItems = [];
            // btn-item数据列表
            $scope.btnItems = [];

            var fieldCols = $scope.$eval($attrs.cols);
            setColsNumber($scope, fieldCols);
            setColsGap($scope, fieldCols, tiFormConst.colsGap);

            // 统一设置表单内容的垂直对齐方式
            setFieldVerticalAlign($scope, $scope.$eval($attrs.verticalAlign), tiFormConst);

            // 用来标识field唯一性的id
            setFieldId($scope);

            fieldCtrl.addCntItem = function addCntItem(item) {
                // 设置某一item的垂直对齐方式
                setItemVerticalAlign(item, item.verticalAlign);

                // 设置每个 label 的最大宽度
                setItemLabelMaxWidth(item, $scope.$eval($attrs.labelMaxWidth));

                // item-label的自定义的样式（垂直对齐方式、最大宽度）
                item.labelStyle = _.extend({}, item.verticalAlign, item.labelMaxWidth);

                // item间距
                item.colsGap = $scope.colsGap;

                $scope.items.push(item);
                $scope.groupedItems = chunkArray($scope.items, $scope.colsNumber);
            };

            fieldCtrl.addBtnItem = function addBtnItem(item) {
                setItemVerticalAlign(item, item.verticalAlign);
                setHorizontalAlign(item, $scope.colsNumber, tiFormConst);
                $scope.btnItems.push(item);
            };
        }
        function chunkArray(array, size) {
            var length = array ? array.length : 0;
            if (!length || size < 1) {
                return [];
            }
            var index = 0,
                resIndex = -1,
                result = new Array(Math.ceil(length / size));
            while (index < length) {
                result[++resIndex] = sliceArray(array, index, (index += size));
            }
            return result;
            /**
             * @param {Array} array The array to slice.
             * @param {number} [start=0] The start position.
             * @param {number} [end=array.length] The end position.
             * @returns {Array} Returns the slice of `array`.
             */
            function sliceArray(array, start, end) {
                var index = -1,
                    length = array.length;
                if (start < 0) {
                    start = -start > length ? 0 : (length + start);
                }
                end = end > length ? length : end;
                if (end < 0) {
                    end += length;
                }
                length = start > end ? 0 : ((end - start) >>> 0);
                start >>>= 0;
                var result = Array(length);
                while (++index < length) {
                    result[index] = array[index + start];
                }
                return result;
            }
        }

        function setColsNumber($scope, fieldCols) {
            var colsNumber = parseInt(fieldCols && fieldCols.number, 10);
            $scope.colsNumber = (_.isNaN(colsNumber) || colsNumber < 1) ? 1 : colsNumber;
        }

        function setColsGap($scope, fieldCols, defaultGap) {
            var customGap = fieldCols && fieldCols.gap;
            var colsNumber = $scope.colsNumber;

            // 初始化item之间的默认间距
            $scope.colsGap = [];
            for (var i = 0; i < colsNumber; i++) {
                // 同一行：两个item之间设置gap，最后一个item的gap为0
                if (i < colsNumber - 1) {
                    $scope.colsGap.push({ width: defaultGap });
                } else {
                    $scope.colsGap.push({ width: '0px' });
                }
            }

            // 用户对各列间距的合法设置
            if (_.isArray(customGap)) {
                var gapLen = _.min([customGap.length, colsNumber]);
                for (var j = 0; j < gapLen; j++) {
                    if (customGap[j] !== '') {
                        $scope.colsGap[j] = { width: customGap[j] };
                    }
                }
            }
        }

        function setHorizontalAlign(item, colsNumber, tiFormConst) {
            var tdNum = tiFormConst.tdNumPerItem;
            var alignOpts = item.alignOpts = tiFormConst.horizontalAlignOpts;

            // 用户未设置对齐方式，则按照AgileUI规范处理单列和多列的对齐方式
            if (!_.has(alignOpts, item.horizontalAlign)) {
                item.horizontalAlign = colsNumber === 1 ? alignOpts.content : alignOpts.label;
            }

            // 根据对齐方式，设置按钮所在的单元格横跨td数量
            switch (item.horizontalAlign) {
                case alignOpts.required:
                    // 与显示*的td对齐
                    item.btnColspan = tdNum * colsNumber;
                    break;
                case alignOpts.label:
                    // 与label对齐时，保留第一个td（用来显示*）
                    item.btnColspan = tdNum * colsNumber - 1;
                    break;
                default:
                    // 与content对齐时，保留前两个td（分别用来显示*和label）
                    item.btnColspan = tdNum * colsNumber - 2;
            }
        }

        function setFieldVerticalAlign(item, align, tiFormConst) {
            var verticalAlign = angular.isDefined(align) ? align : tiFormConst.verticalAlign;
            item.verticalAlign = { 'vertical-align': verticalAlign };
        }

        function setItemVerticalAlign(item, align) {
            if (!angular.isDefined(align)) {
                return;
            }
            item.verticalAlign = { 'vertical-align': align };
        }

        function setItemLabelMaxWidth(item, labelMaxWidth) {
            if (!angular.isDefined(labelMaxWidth)) {
                return;
            }
            item.labelMaxWidth = { 'max-width': labelMaxWidth };
        }

        function setFieldId($scope) {
            $scope.fieldId = 'ti-field-' + $scope.$id + '-' + _.uniqueId();
        }


        module.directive('tiItem', tiItem);
        function tiItem() {
            return {
                require: '^tiFormfield',
                restrict: 'E',
                replace: true,
                template: '',
                transclude: true,
                scope: {
                    hide: '=?',
                    label: '=?',
                    required: '=?',
                    verticalAlign: '=?'
                },
                controller: tiItemController,
                link: function (scope, elm, attrs, fieldCtrl, transclude) {
                    scope.hide = _.isUndefined(scope.hide) ? false : scope.hide;
                    scope.setHasLabel(scope, true); // 初始化时默认item存在label
                    fieldCtrl.addCntItem(scope);
                    scope.$transcludeFn = transclude;
                }
            };
        }

        tiItemController.$inject = ['$scope'];
        function tiItemController($scope) {
            /**
             * 根据item是否包含label,设置content横跨td数
             * @param {Angular Scope} item 每一个ti-item指令对应的scope对象
             * @param {Boolean} hasLabel 标识否有label
             */
            $scope.setHasLabel = function (item, hasLabel) {
                if (hasLabel) { // 有label时，content和label各占一个td
                    item.hasLabel = true;
                    item.cntColspan = 1;
                } else { // 没有label时，content横跨两个td（包含label和content对应的td）
                    item.hasLabel = false;
                    item.cntColspan = 2;
                }
            };
        }


        module.directive('tiBtnItem', tiBtnItem);
        function tiBtnItem() {
            return {
                require: '^tiFormfield',
                restrict: 'E',
                replace: true,
                scope: {
                    hide: '=?',
                    horizontalAlign: '=?',
                    verticalAlign: '=?'
                },
                template: '',
                transclude: true,
                link: function (scope, elm, attrs, fieldCtrl, transclude) {
                    scope.hide = _.isUndefined(scope.hide) ? false : scope.hide;
                    fieldCtrl.addBtnItem(scope);
                    scope.$transcludeFn = transclude;
                }
            };
        }

        module.directive('itemLabelTransclude', function () {
            return {
                restrict: 'A',
                require: '^tiFormfield',
                link: function (scope, elm, attrs) {
                    var item = scope.$eval(attrs.itemLabelTransclude);
                    item.$watch('label', function updateLabel(label) {
                        if (_.isUndefined(label)) {
                            item.setHasLabel(item, false);
                        } else {
                            item.setHasLabel(item, true);

                            elm.html('');
                            elm.append(label);
                        }
                    });
                }
            };
        });


        module.directive('itemContentTransclude', function () {
            return {
                restrict: 'A',
                require: '^tiFormfield',
                link: function (scope, elm, attrs) {
                    var item = scope.$eval(attrs.itemContentTransclude);
                    item.$transcludeFn(item.$parent, function (contents) {
                        // 更新item的label
                        var $itemLabel = contents.filter('ti-item-label');
                        if ($itemLabel.length > 0) {
                            item.label = $itemLabel;
                        }

                        // 更新item的content
                        // 注：当item中有ng-repeat等未被解析的元素时,此时会以注释形式存在,使用not方法及jquery选择器时,
                        //     会把注释性元素删除掉，此处为了保留使用如下方式
                        item.content = contents.filter(function () {
                            return $itemLabel[0] !== this;
                        });

                        elm.html('');
                        elm.append(item.content);
                    });
                }
            };
        });


        module.directive('fieldBtnTransclude', function () {
            return {
                restrict: 'A',
                require: '^tiFormfield',
                link: function (scope, elm, attrs) {
                    var item = scope.$eval(attrs.fieldBtnTransclude);
                    item.$transcludeFn(item.$parent, function (contents) {
                        elm.html('');
                        elm.append(contents);
                    });
                }
            };
        });


        return module.name;
    });


/**
 * @description
 * AngularJS version of the checkbox directive.
 * 定义ty-checkbox指令,最终返回module名
 */

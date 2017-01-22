/// <reference path="../jquery-1.11.1.min.js" />
/// <reference path="../bootstrap.min.js" />
/**
* jQuery Bootstrap Ly 0.0.1
* 
* 这是一个基于Bootstrap布局的js插件,作者LYN
*  
* Author Eden Li [ liyuning1985@163.com ] 
* 
*/
(function ($) {
    //Ly 继承方法
    Function.prototype.LyExtend = function (parent, overrides) {
        if (typeof parent != 'function') return this;
        this.base = parent.prototype;
        this.base.constructor = parent;
        var f = function () { }
        f.prototype = parent.prototype;
        this.prototype = new f();
        this.prototype.constructor = this;
        if (overrides) $.extend(this.prototype, overrides);
    }
    //Ly 延迟加载
    Function.prototype.LyDefer = function (o, defer, args) {
        var fn = this;
        return setTimeout(function () { fn.apply(o, args || []); }, defer);
    }

    //核心对象
    window.Ly = $.Lyui = {
        version: 'V0.0.1',
        managerCount: 0,
        managers: {},
        //扩展
        //1,默认参数     
        //2,本地化扩展 
        defaults: {},
        //3,方法接口扩展
        methods: {},
        //命名空间
        //核心控件,封装了一些常用方法
        core: {},
        //命名空间
        //组件的集合
        controls: {},
        //plugin 插件的集合
        plugins: {},
        managerIdPrev: 'Lyui',
        autoNewId: true,
        error: { managerIsExist: '管理器id已经存在' },
        pluginPrev: 'Ly',
        getId: function (prev) {
            prev = prev || this.managerIdPrev;
            var id = prev + (1000 + this.managerCount);
            this.managerCount++;
            return id;
        },
        add: function (manager) {
            if (arguments.length == 2) {
                var m = arguments[1];
                m.id = m.id || m.options.id || arguments[0].id;
                this.addManager(m);
                return;
            }
            if (!manager.id) manager.id = this.getId(manager.__idPrev());
            this.managers[manager.id] = manager;
        },
        remove: function (arg) {
            if (typeof arg == "string" || typeof arg == "number") {
                delete liger.managers[arg];
            } else if (typeof arg == "object") {
                if (arg instanceof Ly.core.Component) {
                    delete Ly.managers[arg.id];
                } else {
                    if (!$(arg).attr(this.idAttrName)) return false;
                    delete Ly.managers[$(arg).attr(this.idAttrName)];
                }
            }
        },
        get: function (arg, idAttrName) {
            idAttrName = idAttrName || 'Lyuiid';
            if (typeof arg == 'string' || typeof arg == "number") {
                return Ly.managers[arg];
            } else if (typeof arg == "object") {
                var domObj = arg.length ? arg[0] : arg;
                var id = domObj[idAttrName] || $(domObj).attr(idAttrName);
                if (!id) return null;
                return Ly.managers[id];
            }
            return null;
        },
        find: function (type) {
            var arr = [];
            for (var id in this.managers) {
                var manager = this.managers[id];
                if (type instanceof Funcion) {
                    if (manager instanceof type) {
                        arr.push(manager);
                    }
                } else if (type instanceof Array) {
                    if ($.inArray(manager.__getType(), type) != -1) {
                        arr.push(manager);
                    }
                } else {
                    if (manager.__getType() == type) {
                        arr.push(manager);
                    }
                }
            }
            return att;
        },
        run: function (plugin, args, ext) {
            if (!plugin) return;
            ext = $.extend({
                defaultsNamespace: 'LyDefaults',
                methodsNamespace: 'LyMethods',
                controlNamespace: 'controls',
                idAttrName: 'Lyuiid',
                isStatic: false,
                hasElement: true,           //是否拥有element主体(比如drag、resizable等辅助性插件就不拥有)
                propertyToElemnt: null      //链接到element的属性名
            }, ext || {});
            plugin = plugin.replace(/^LyGet/, '');
            plugin = plugin.replace(/^Ly/, '');
            if (this == null || this == window || ext.isStatic) {
                if (!Ly.plugins[plugin]) {
                    Ly.plugins[plugin] = {
                        fn: $[Ly.pluginPrev + plugin],
                        isStatic: true
                    };
                }
                return new $.Lyui[ext.controlNamespace][plugin]($.extend({}, $[ext.defaultsNamespace][plugin] || {}, $[ext.defaultsNamespace][plugin + 'String'] || {}, args.length > 0 ? args[0] : {}));
            }
            if (!Ly.plugins[plugin]) {
                Ly.plugins[plugin] = {
                    fn: $[Ly.pluginPrev + plugin],
                    isStatic: false
                }
            }
            if (/Manager$/.test(plugin)) return Ly.get(this, ext.idAttrName);
            this.each(function () {
                if (this[ext.idAttrName] || $(this).attr(ext.idAttrName)) {
                    var manager = Ly.get(this[ext.idAttrName] || $(this).attr(ext.idAttrName));
                    if (manager && args.length > 0) manager.set(args[0]);
                    return;
                }
                if (args.length >= 1 && typeof args[0] == 'string') return;
                var options = args.length > 0 ? args[0] : null;
                var p = $.extend({}, $[ext.defaultsNamespace][plugin], $[ext.defaultsNamespace][plugin + 'String'], options);
                if (ext.propertyToElemnt) p[ext.propertyToElemnt] = this;
                if (ext.hasElement) {
                    new $.Lyui[ext.controlNamespace][plugin](this, p);
                } else {
                    new $.Lyui[ext.controlNamespace][plugin](p);
                }
            });
            if (this.length == 0) return null;
            if (args.length == 0) return Ly.get(this, ext.idAttrName);
            if (typeof args[0] == 'string') {
                var manager = Ly.get(this, ext.idAttrName);
                if (manager == null) return;
                if (args[0] == "option") {
                    if (args.length == 2)
                        return manager.get(args[1]);  //manager get
                    else if (args.length >= 3)
                        return manager.set(args[1], args[2]);  //manager set
                }
                else {
                    var method = args[0];
                    if (!manager[method]) return; //不存在这个方法
                    var parms = Array.apply(null, args);
                    parms.shift();
                    return manager[method].apply(manager, parms);  //manager method
                }
            }
            return null;
        }
    };

    //扩展对象
    $.LyDefaults = {};

    //扩展对象
    $.LyMethos = {};

    //关联起来
    Ly.defaults = $.LyDefaults;
    Ly.methods = $.LyMethos;
    //获取ligerui对象
    //parm [plugin]  插件名,可为空
    $.fn.Ly = function (plugin) {
        if (plugin) {
            return Ly.run.call(this, plugin, arguments);
        } else {
            return Ly.get(this);
        }
    };
    //组件基类
    //1,完成定义参数处理方法和参数属性初始化的工作
    //2,完成定义事件处理方法和事件属性初始化的工作
    Ly.core.Component = function (options) {
        this.events = this.events || {};
        this.options = options || {};
        this.children = {};
    };
    $.extend(Ly.core.Component.prototype, {
        __getType: function () {
            return 'Ly.core.Component';
        },
        __idPrev: function () {
            return 'Lyui';
        },
        set: function (arg, value) {
            if (!arg) return;
            if (typeof arg == 'object') {
                var tmp;
                if (this.options != arg) {
                    $.extend(this.options, arg);
                    tmp = arg;
                } else {
                    tmp = $.extend({}, arg);
                }
                if (value == undefined || value == true) {
                    for (var p in tmp) {
                        if (p.indexOf('on') == 0)
                            this.set(p, tmp[p]);
                    }
                }
                if (value == undefined || value == false) {
                    for (var p in tmp) {
                        if (p.indexOf('on') != 0)
                            this.set(p, tmp[p]);
                    }
                }
                return;
            }
            var name = arg;
            //事件参数
            if (name.indexOf('on') == 0) {
                if (typeof value == 'function')
                    this.bind(name.substr(2), value);
                return;
            }
            if (!this.options) this.options = {};
            if (this.trigger('propertychange', [arg, value]) == false) return;
            this.options[name] = value;
            var pn = '_set' + name.substr(0, 1).toUpperCase() + name.substr(1);
            if (this[pn]) {
                this[pn].call(this, value);
            }
            this.trigger('propertychanged', [arg, value]);
        },
        get: function (name) {
            var pn = '_get' + name.substr(0, 1).toUpperCase() + name.substr(1);
            if (this[pn]) {
                return this[pn].call(this, name);
            }
            return this.options[name];
        },
        hasBind: function (arg) {
            var name = arg.toLowerCase();
            var event = this.events[name];
            if (event && event.length) return true;
            return false;
        },
        trigger: function (arg, data) {
            if (!arg) return;
            var name = arg.toLowerCase();
            var event = this.events[name];
            if (!event) return;
            data = data || [];
            if ((data instanceof Array) == false) {
                data = [data];
            }
            for (var i = 0; i < event.length; i++) {
                var ev = event[i];
                if (ev.handler.apply(ev.context, data) == false)
                    return false;
            }
        },
        bind: function (arg, handler, context) {
            if (typeof arg == 'object') {
                for (var p in arg) {
                    this.bind(p, arg[p]);
                }
                return;
            }
            if (typeof handler != 'function') return false;
            var name = arg.toLowerCase();
            var event = this.events[name] || [];
            context = context || this;
            event.push({ handler: handler, context: context });
            this.events[name] = event;
        },
        unbind: function (arg, handler) {
            if (!arg) {
                this.events = {};
                return;
            }
            var name = arg.toLowerCase();
            var event = this.events[name];
            if (!event || !event.length) return;
            if (!handler) {
                delete this.events[name];
            }
            else {
                for (var i = 0, l = event.length; i < l; i++) {
                    if (event[i].handler == handler) {
                        event.splice(i, 1);
                        break;
                    }
                }
            }
        },
        destroy: function () {
            Ly.remove(this);
        }
    });

    //界面组件基类, 
    //1,完成界面初始化:设置组件id并存入组件管理器池,初始化参数
    //2,渲染的工作,细节交给子类实现
    //parm [element] 组件对应的dom element对象
    //parm [options] 组件的参数
    Ly.core.UICompnent = function (element, options) {
        Ly.core.UICompnent.base.constructor.call(this, options);
        var extendMethods = this._extendMethods();
        if (extendMethods) $.extend(this, extendMethods);
        this.element = element;
        this._init();
        this._preRender();
        this.trigger('render');
        this._render();
        this.trigger('rendered');
        this._rendered();
    }
    Ly.core.UICompnent.LyExtend(Ly.core.Component, {
        __getType: function () {
            return 'Ly.core.UIComponent';
        },
        _extendMethods: function () { },
        _init: function () {
            this.type = this.__getType();
            if (!this.element) {
                this.id = this.options.id || Ly.getId(this.__idPrev());
            } else {
                this.id = this.options.id || this.element.id || Ly.getId(this.__idPrev());
            }
            Ly.add(this);
            if (!this.element) return;
            var attributes = this.attr();
            if (attributes && attributes instanceof Array) {
                for (var i = 0; i < attributes.length; i++) {
                    var name = attributes[i];
                    this.options[name] = $(this.element).attr(name);
                }
            }
            var p = this.options;
            if ($(this.element).attr("Lyui")) {
                try {
                    var attroptions = $(this.element).attr("Lyui");
                    if (attroption.indexOf('{') != 0) attroptions = "{" + attroptions + "}";
                    eval("attroptions = " + attroptions + ";");
                    if (attroptions) $.extend(p, attroptions);
                } catch (e) {

                }
            }
        },
        _preRender: function () { },
        _rendered: function () {
            if (this.element) {
                $(this.element).attr("Lyuiid", this.id);
            }
        },
        _setCls: function (value) {
            if (this.element && value) {
                $(this.element).addClass(value);
            }
        },
        attr: function () {
            return [];
        },
        destroy: function () {
            if (this.element) {
                $(this.element).remove();
            }
            this.options = null;
            Ly.remove(this);
        }
    });

    //jQuery version fix
    $.fn.live = $.fn.on ? $.fn.on : $.fn.live;
    if (!$.browser) {
        var userAgent = navigator.userAgent.toLowerCase();
        $.browser = {
            version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
            safari: /webkit/.test(userAgent),
            opera: /opera/.test(userAgent),
            msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
            mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
        };
    }
})(jQuery);

/**
* jQuery Bootstrap Ly 0.0.1
* 
* LyAccordion插件
*  
* Author Eden Li [ liyuning1985@163.com ] 
* 
*/
(function ($) {
    $.fn.LyAccordion = function (options) {
        return $.Lyui.run.call(this, "LyAccordion", arguments);
    }
    $.fn.LyGetAccordionManager = function () { return $.Lyui.get(this); }
    $.LyDefaults.Accordion = {
        height: null,
        speed: "normal",
        changeHeightOnResize: false,
        heightDiff: 0
    }
    $.LyMethos.Accordion = {};
    $.Lyui.controls.Accordion = function (element, options) {
        $.Lyui.controls.Accordion.base.constructor.call(this, element, options);
    }
    $.Lyui.controls.Accordion.LyExtend($.Lyui.core.UICompnent, {
        __getType: function () {
            return 'Accordion';
        },
        __idPrev: function () {
            return 'Accordion';
        },
        _extendMethods: function () {
            return $.LyMethos.Accordion;
        },
        _render: function () {
            var g = this, p = this.options;
            console.info(g);
            console.info(p);
        },
        onResize: function () { },
        setHeight: function (height) { }
    });
})(jQuery);

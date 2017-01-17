define(['angular'],function(angular){
	var Ly = {};
	Array.prototype.finditem = function(id) {
		var length = this.length;
		if(length == 0) return {};
		var data = {}
		for (var i = 0; i < length; i++) {
			var item = this[i];
			if(id == item.id) {
				data = item;
				break;
			}
		}
		return data;
	};

    Date.prototype.format = function (fmt) {
	    var o = {
	        "M+": this.getMonth() + 1,
	        "d+": this.getDate(),
	        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
	        "H+": this.getHours(),
	        "m+": this.getMinutes(),
	        "s+": this.getSeconds(),
	        "q+": Math.floor((this.getMonth() + 3) / 3),
	        "S": this.getMilliseconds()
	    };
	    var week = {
	        "0": "\u65e5",
	        "1": "\u4e00",
	        "2": "\u4e8c",
	        "3": "\u4e09",
	        "4": "\u56db",
	        "5": "\u4e94",
	        "6": "\u516d"
	    };
	    if (/(y+)/.test(fmt)) {
	        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    }
	    if (/(E+)/.test(fmt)) {
	        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
	    }
	    for (var k in o) {
	        if (new RegExp("(" + k + ")").test(fmt)) {
	            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	        }
	    }
	    return fmt;
	}

	//判断是否是数组
	Ly.isArray = function(arr){
	    return Object.prototype.toString.apply(arr) === "[object Array]";
	}

	//迭代循环满足条件的对象
	Ly.findObj = function(key,value,arr){
		if(Ly.isArray(arr)) {
			var length = arr.length;
			for (var i = 0; i < length; i++) {
				var item = arr[i];
				if(angular.isObject(item)){
					if(item[key]==value){
						return item;
					}else{
						for(var n in item) {
							var obj = item[n];
							if(Ly.isArray(obj)){
								var result = Ly.findObj(key,value,obj);
								if(angular.isObject(result)){
									return result;
								}
							}
						}
					}
				}
			}
		}
	}
	return Ly;
});



define(['Ly'],function(Ly){
	var Ctrl = ['$scope'];
	var CtrlFn = function($scope) {	
		$scope.UI = {
			nowDate:function(){
				var date = new Date();
				return date.format("yyyy-MM-dd");
			}
		}
	}
	Ctrl.push(CtrlFn);
	return Ctrl;
});

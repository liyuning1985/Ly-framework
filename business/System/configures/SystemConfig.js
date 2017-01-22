define([
   "framework/routerConfig"
], function (router) {
    var viewsUrl = "business/System/views/";
    var controllerUrl = "business/System/controllers/";
    router.state("sys_em_list", viewsUrl + "EmployeeList.html", controllerUrl + "EmployeeListCtrl");
    router.state("sys_role_list", viewsUrl + "RoleList.html", controllerUrl + "RoleListCtrl");
    return function () {
        router.menu("main", ["sys"], "", "系统管理", "", " fa-tag");
        router.menu("main", ["sys", "role"], "sys_role_list", "角色管理");
        router.menu("main", ["sys", "employee"], "sys_em_list", "人员管理");
       // router.menu("main",["sys",])
    }
});

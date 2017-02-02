define([
     "framework/routerConfig"
], function (router) {
    var viewsUrl = "business/Msys/views";
    var controllerUrl = "business/Msys/controllers";
    router.state("msys", {
        "": {
            "templateUrl": viewsUrl + "/nav.html",
            "controllerPath": controllerUrl + "/navCtrl.js"
        },
        "index@msys": {
            templateUrl: viewsUrl + "/index.html",
            controllerPath: controllerUrl + "/navCtrl.js"
        },
        "product@msys": {
            templateUrl: viewsUrl + "/product/productBuy.html",
            controllerPath: controllerUrl + "/product/productBuyCtrl.js"
        },
        "project@msys": {
            templateUrl: viewsUrl + "/project/projectBuy.html",
            controllerPath: controllerUrl + "/project/projectBuyCtrl.js"
        },
        "guestlogin@msys": {
            templateUrl: viewsUrl + "/Guest/GuestLogin.html",
            controllerPath:controllerUrl +"/Guest/GuestLoginCtrl.js"
        }
    });
    return function () {
        
    }
});

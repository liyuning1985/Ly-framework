define(function (require) {
    "use strict";
    var mod = [
        require("portal/config"),
        require("business/System/configures/SystemConfig"),
        require("business/Msys/configures/msysConfig")
    ]
    for (var i in mod) {
        var func = mod[i];
        if (typeof func == "function") {
            func();
        }
    }
});


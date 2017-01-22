define(function (require) {
    "use strict";
    var mod = [
        require("portal/config"),
        require("business/System/configures/SystemConfig")
    ]
    for (var i in mod) {
        var func = mod[i];
        if (typeof func == "function") {
            func();
        }
    }
});


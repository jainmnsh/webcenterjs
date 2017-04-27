"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
function init() {
    var restBaseUrl = "http://192.168.1.49:8888/rest";
    var wcBaseUrl = "http://192.168.1.49:8888/webcenter";
    var csBaseUrl = "http://192.168.1.49:16200/cs";
    lib_1.default.Config.setRestBaseUrl(restBaseUrl);
    lib_1.default.Config.setWcBaseUrl(wcBaseUrl);
    lib_1.default.Config.setCsBaseUrl(csBaseUrl);
    var username = "abarnes";
    var password = "welcome1";
    lib_1.default.Auth.setUserName(username);
    lib_1.default.Auth.setPassword(password);
    expect(restBaseUrl).toBe(lib_1.default.Config.getRestBaseUrl());
}
exports.init = init;
function logout() {
    lib_1.default.Auth.logout();
    expect(true).toBe(true);
}
exports.logout = logout;
//# sourceMappingURL=common.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var common_1 = require("./common");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
beforeAll(common_1.init);
afterAll(common_1.logout);
describe("Authentication", function () {
    it("Perform Login", function (done) {
        lib_1.default.Auth.login().then(function (resourceIndex) {
            done();
            expect(resourceIndex.version).toBeDefined();
        }, function (error) {
            fail("Login failed");
            done();
        });
    }, 3000);
    it("Get Resource Index", function (done) {
        lib_1.default.Auth.getResourceIndex().then(function (resourceIndex) {
            expect(resourceIndex.version).toBeDefined();
            done();
        }, function (error) {
            fail("Failed to get Resource Index");
            done();
        });
    }, 3000);
    it("Get uToken", function () {
        var uToken = lib_1.default.Auth.getUToken();
        expect(uToken).toBeDefined();
    }, 3000);
    it("Get Current User Profile", function (done) {
        lib_1.default.Auth.getCurrentUser().then(function (user) {
            expect(user.guid).toBeDefined();
            done();
        }, function (error) {
            fail("Failed to get WC User Profile");
            done();
        });
    }, 3000);
});
//# sourceMappingURL=auth.spec.js.map
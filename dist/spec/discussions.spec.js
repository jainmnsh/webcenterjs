"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chance_1 = require("chance");
var lib_1 = require("../lib");
var common_1 = require("./common");
var chance = new chance_1.Chance();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
beforeAll(common_1.init);
afterAll(common_1.logout);
afterAll(function () {
    lib_1.default.Auth.logout();
    expect(true).toBe(true);
});
describe("Discussions", function () {
    it("Get Forums", function (done) {
        lib_1.default.Discussions.getForums().then(function (forums) {
            expect(forums).toBeDefined();
            done();
        }, function (error) {
            fail("Failed to Get Forums.");
            done();
        });
    }, 10000);
    xit("Create Forum", function (done) {
        var forumName = chance.word();
        var description = chance.sentence();
        lib_1.default.Discussions.createForum(forumName, forumName + " Display", description).then(function (forum) {
            expect(forum).toBeDefined();
            done();
        }, function (error) {
            fail("Failed to Create Forum.");
            done();
        });
    }, 10000);
});
//# sourceMappingURL=discussions.spec.js.map
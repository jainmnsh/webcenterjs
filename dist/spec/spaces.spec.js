"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chance_1 = require("chance");
var lib_1 = require("../lib");
var common_1 = require("./common");
var chance = new chance_1.Chance();
var listName;
var status;
var portalName;
var attrName;
var message;
var messageId;
var spaceGuid;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
beforeAll(common_1.init);
afterAll(common_1.logout);
describe("Portal", function () {
    it("Get Portal Templates", function (done) {
        lib_1.default.Spaces.getTemplates().then(function (portalTemplates) {
            expect(portalTemplates.resourceType).toBe("urn:oracle:webcenter:spaces:resource:templates");
            done();
        }, function (error) {
            fail("Failed to Get Portal Templates.");
            done();
        });
    }, 20000);
    it("Get Portal Template By Name", function (done) {
        lib_1.default.Spaces.getTemplate("Portal").then(function (portalTemplate) {
            expect(portalTemplate.resourceType).toBe("urn:oracle:webcenter:spaces:resource:template");
            expect(portalTemplate.creator).toBe("system");
            expect(portalTemplate.name).toBe("Portal");
            done();
        }, function (error) {
            fail("Failed to Get Portal Template By Name.");
            done();
        });
    }, 10000);
    it("Get Portal Template Roles", function (done) {
        lib_1.default.Spaces.getTemplateRoles("Portal").then(function (roles) {
            expect(roles.resourceType).toBe("urn:oracle:webcenter:space:roles");
            done();
        }, function (error) {
            fail("Failed to Get Portal Template Roles.");
            done();
        });
    }, 10000);
    it("Get Portal Template Attributes", function (done) {
        lib_1.default.Spaces.getTemplateAttributes("Portal").then(function (attrs) {
            expect(attrs.resourceType).toBe("urn:oracle:webcenter:space:attributes");
            done();
        }, function (error) {
            fail("Failed to Get Portal Attributes.");
            done();
        });
    }, 10000);
    it("Create Portal", function (done) {
        portalName = chance.word();
        var portalDesc = chance.sentence();
        lib_1.default.Spaces.createSpace(portalName, "Portal", portalDesc).then(function (space) {
            spaceGuid = space.guid;
            expect(space.displayName).toBe(portalName);
            expect(space.description).toBe(portalDesc);
            expect(space.templateName).toBe("Portal");
            done();
        }, function (error) {
            fail("Failed to Create Portal.");
            done();
        });
    }, 40000);
    it("Get Portal By Name", function (done) {
        lib_1.default.Spaces.getSpace(portalName).then(function (space) {
            expect(space.displayName).toBe(portalName);
            done();
        }, function (error) {
            fail("Failed to Get Portal By Name.");
            done();
        });
    }, 10000);
    it("Get Portal Members", function (done) {
        lib_1.default.Spaces.getMembers(portalName).then(function (members) {
            expect(members.items.length).toBe(1);
            done();
        }, function (error) {
            fail("Failed to Get Portal Members.");
            done();
        });
    }, 10000);
    it("Create Portal Attribute", function (done) {
        attrName = chance.word();
        var attrDesc = chance.sentence();
        var attrVal = chance.word();
        lib_1.default.Spaces.createAttribute(portalName, attrName, attrVal, attrDesc).then(function (attr) {
            expect(attr.resourceType).toBe("urn:oracle:webcenter:space:attribute");
            expect(attr.name).toBe(attrName);
            expect(attr.value).toBe(attrVal);
            done();
        }, function (error) {
            fail("Failed to Create Portal Attribute.");
            done();
        });
    }, 10000);
    it("Post to Portal Message Board", function (done) {
        message = chance.sentence();
        lib_1.default.Wall.postToPortal(message, spaceGuid).then(function (messageItem) {
            messageId = messageItem.id;
            expect(messageId).toBeDefined();
            expect(messageItem.body).toBe(message);
            done();
        }, function (error) {
            fail("Failed to Post to Portal message board");
            done();
        });
    }, 10000);
    it("Get Portal Message Board", function (done) {
        lib_1.default.Wall.getPortalMessages(spaceGuid).then(function (messageList) {
            var messageItem = messageList.items[0];
            expect(messageItem.id).toBe(messageId);
            done();
        }, function (error) {
            console.log(error);
            fail("Failed to get Portal Message Board");
            done();
        });
    }, 10000);
    it("Get Portal Message by ID", function (done) {
        lib_1.default.Wall.getPortalMessage(messageId, spaceGuid).then(function (messageItem) {
            expect(messageItem.id).toBe(messageId);
            expect(messageItem.body).toBe(message);
            done();
        }, function (error) {
            fail("Failed to get Portal Message by ID");
            done();
        });
    }, 10000);
    it("Delete Portal Message by ID", function (done) {
        lib_1.default.Wall.deletePortalMessage(messageId, spaceGuid).then(function (res) {
            done();
        }, function (error) {
            fail("Failed to Delete Portal Message by ID");
            done();
        });
    }, 10000);
    xit("Get Portal Attribute", function (done) {
        lib_1.default.Spaces.getAttribute(portalName, attrName).then(function (attr) {
            expect(attr.resourceType).toBe("urn:oracle:webcenter:space:attribute");
            expect(attr.name).toBe(attrName);
            done();
        }, function (error) {
            fail("Failed to Get Portal Attribute.");
            done();
        });
    }, 10000);
    it("Get Portal Attributes", function (done) {
        lib_1.default.Spaces.getAttributes(portalName).then(function (attrs) {
            expect(attrs.resourceType).toBe("urn:oracle:webcenter:space:attributes");
            done();
        }, function (error) {
            fail("Failed to Get Portal Attributes.");
            done();
        });
    }, 10000);
    it("Get Portal Site Resources", function (done) {
        lib_1.default.Spaces.getSiteResources(portalName).then(function (resources) {
            expect(resources.resourceType).toBe("urn:oracle:webcenter:spaces:siteresources");
            done();
        }, function (error) {
            fail("Failed to Get Portal Site Resources.");
            done();
        });
    }, 10000);
    it("Delete Portal By Name", function (done) {
        lib_1.default.Spaces.deleteSpace(portalName).then(function (res) {
            done();
        }, function (error) {
            fail("Failed to Get Portal Attributes.");
            done();
        });
    }, 10000);
});
//# sourceMappingURL=spaces.spec.js.map
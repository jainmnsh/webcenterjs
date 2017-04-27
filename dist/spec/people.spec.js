"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chance_1 = require("chance");
var lib_1 = require("../lib");
var common_1 = require("./common");
var chance = new chance_1.Chance();
var listName;
var status;
var message;
var messageId;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
beforeAll(common_1.init);
afterAll(common_1.logout);
describe("People", function () {
    it("Update Status", function (done) {
        status = chance.sentence();
        lib_1.default.People.updateStatus(status).then(function (statusItem) {
            expect(statusItem.note).toBe(status);
            done();
        }, function (error) {
            fail("Failed to update Status");
            done();
        });
    }, 10000);
    it("Get Received Invitations", function (done) {
        lib_1.default.People.getReceivedInvitations().then(function (invitationList) {
            expect(invitationList.resourceType).toBe("urn:oracle:webcenter:people:invitations");
            done();
        }, function (error) {
            fail("Failed to Get Received Invitations.");
            done();
        });
    }, 10000);
    it("Get Sent Invitations", function (done) {
        lib_1.default.People.getSentInvitations().then(function (invitationList) {
            expect(invitationList.resourceType).toBe("urn:oracle:webcenter:people:invitations");
            done();
        }, function (error) {
            fail("Failed to Get Sent Invitations.");
            done();
        });
    }, 10000);
    it("Create List", function (done) {
        listName = chance.word({ length: 10 });
        lib_1.default.People.createList(listName).then(function (listNames) {
            expect(listNames.resourceType).toBeDefined();
            done();
        }, function (error) {
            fail("Failed to Get Self.");
            done();
        });
    }, 10000);
    it("Get List Names", function (done) {
        lib_1.default.People.getListNames().then(function (listNames) {
            if (listNames && listNames.items.length > 0) {
                var filteredListNames = listNames.items.filter(function (lName) {
                    return (lName.name === listName);
                });
                expect(filteredListNames.length).toBe(1);
                done();
            }
            else {
                fail("Get List Names is Empty.");
                done();
            }
        }, function (error) {
            fail("Failed to Get List Names.");
            done();
        });
    }, 10000);
    it("Get Received Feedback", function (done) {
        lib_1.default.People.getReceivedFeedback().then(function (feedbackList) {
            expect(feedbackList.resourceType).toBe("urn:oracle:webcenter:feedback");
            done();
        }, function (error) {
            fail("Failed to Get Received Feedback.");
            done();
        });
    }, 10000);
    it("Get Given Feedback", function (done) {
        lib_1.default.People.getGivenFeedback().then(function (feedbackList) {
            expect(feedbackList.resourceType).toBe("urn:oracle:webcenter:feedback");
            done();
        }, function (error) {
            fail("Failed to Get Given Feedback.");
            done();
        });
    }, 10000);
    it("Get Connections", function (done) {
        lib_1.default.People.getConnections().then(function (personList) {
            expect(personList.resourceType).toBe("urn:oracle:webcenter:people:person:list");
            done();
        }, function (error) {
            fail("Failed to Get Connections.");
            done();
        });
    }, 10000);
    it("Get Self", function (done) {
        lib_1.default.People.getSelf().then(function (person) {
            expect(person.resourceType).toBe("urn:oracle:webcenter:people:person");
            done();
        }, function (error) {
            fail("Failed to Get Self.");
            done();
        });
    }, 10000);
    it("Delete List by Name", function (done) {
        lib_1.default.People.deleteList(listName).then(function (res) {
            done();
        }, function (error) {
            fail("Failed to Delete List with Name : " + listName);
            done();
        });
    }, 10000);
    it("Get Status", function (done) {
        lib_1.default.People.getStatus().then(function (statusItem) {
            expect(statusItem.note).toBe(status);
            done();
        }, function (error) {
            fail("Failed to Get Status");
            done();
        });
    }, 10000);
    it("Post to Message Board", function (done) {
        message = chance.sentence();
        lib_1.default.Wall.postMessage(message).then(function (messageItem) {
            messageId = messageItem.id;
            expect(messageId).toBeDefined();
            expect(messageItem.body).toBe(message);
            done();
        }, function (error) {
            fail("Failed to Post message board");
            done();
        });
    }, 10000);
    it("Get Message Board", function (done) {
        lib_1.default.Wall.getMessageBoard().then(function (messageList) {
            var messageItem = messageList.items[0];
            expect(messageItem.id).toBe(messageId);
            done();
        }, function (error) {
            fail("Failed to get Message Board");
            done();
        });
    }, 10000);
    it("Get Message by ID", function (done) {
        lib_1.default.Wall.getUserMessage(messageId).then(function (messageItem) {
            expect(messageItem.id).toBe(messageId);
            expect(messageItem.body).toBe(message);
            done();
        }, function (error) {
            fail("Failed to get Message by ID");
            done();
        });
    }, 10000);
    xit("Update Message by ID", function (done) {
        message = chance.sentence();
        var messageItem = {
            body: message,
            id: messageId,
            link: null,
            visibilityType: lib_1.default.Wall.getVisibility(),
        };
        lib_1.default.Wall.updateUserMessage(messageItem).then(function (mesgItem) {
            expect(mesgItem.id).toBe(messageId);
            expect(mesgItem.body).toBe(message);
            done();
        }, function (error) {
            fail("Failed to update Message by ID");
            done();
        });
    }, 10000);
    it("Delete Message by ID", function (done) {
        lib_1.default.Wall.deleteUserMessage(messageId).then(function (res) {
            done();
        }, function (error) {
            fail("Delete to get Message by ID");
            done();
        });
    }, 10000);
});
//# sourceMappingURL=people.spec.js.map
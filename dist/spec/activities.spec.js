"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chance_1 = require("chance");
var lib_1 = require("../lib");
var common_1 = require("./common");
var chance = new chance_1.Chance();
var postedMessageId;
var activityId;
var commentId;
var likeId;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
beforeAll(common_1.init);
afterAll(common_1.logout);
describe("Wall Post", function () {
    postedMessageId = null;
    it("Post", function (done) {
        lib_1.default.Wall.postMessage(chance.sentence()).then(function (messageItem) {
            postedMessageId = messageItem.id;
            expect(postedMessageId).toBeDefined();
            done();
        }, function (error) {
            fail("Failed to Wall post.");
            done();
        });
    }, 10000);
    it("Message By ID", function (done) {
        lib_1.default.Wall.getUserMessage(postedMessageId).then(function (messageItem) {
            expect(messageItem.id).toBe(postedMessageId);
            done();
        }, function (error) {
            fail("Failed to find Wall post with ID : " + postedMessageId);
            done();
        });
    }, 10000);
    it("Get Activity for Posted Message", function (done) {
        activityId = null;
        lib_1.default.ActivityStream.getActivities().then(function (activities) {
            if (activities && activities.items && activities.items.length > 0) {
                var filteredActivities = activities.items.filter(function (activity) {
                    var res = false;
                    var templateParams = activity.templateParams;
                    if (templateParams && templateParams.items && templateParams.items.length > 0) {
                        var filteredTParams = templateParams.items.filter(function (param) {
                            if (((postedMessageId === param.id) && (activity.id === param.activityId))) {
                                activityId = activity.id;
                                return true;
                            }
                            else {
                                return false;
                            }
                        });
                        if (filteredTParams.length === 1) {
                            res = true;
                        }
                    }
                    return res;
                });
                expect(filteredActivities.length).toBe(1);
                done();
            }
            else {
                fail("Get Activities Failed");
                done();
            }
        }, function (error) {
            console.log(error);
            fail("Get Activities Failed");
            done();
        });
    }, 10000);
    it("Create Activity Comment", function (done) {
        var comment = {
            text: chance.sentence(),
        };
        lib_1.default.ActivityStream.createActivityCommment(activityId, comment).then(function (res) {
            commentId = res.id;
            expect(res.id).toBeDefined();
            done();
        }, function (error) {
            fail("Failed to Create Activity Comment for Activity ID :" + activityId);
            done();
        });
    }, 10000);
    it("Activity By ID", function (done) {
        lib_1.default.ActivityStream.getActivity(activityId).then(function (activity) {
            expect(activity.id).toBe(activityId);
            done();
        }, function (error) {
            fail("Failed to Get Activity By ID :" + activityId);
            done();
        });
    }, 10000);
    it("Get Activity Comments Summary", function (done) {
        lib_1.default.ActivityStream.getActivityCommentsSummary(activityId).then(function (commentsSummaryItem) {
            expect(commentsSummaryItem.count).toBe(1);
            done();
        }, function (error) {
            fail("Failed to Get Activity Comments Summary for Activity ID : " + activityId);
            done();
        });
    }, 10000);
    it("Get Comments Summary by Object ID & Type", function (done) {
        lib_1.default.ActivityStream.getCommentsSummary("oracle.webcenter.activitystreaming", "activity", activityId).then(function (commentsSummaryItem) {
            expect(commentsSummaryItem.count).toBe(1);
            done();
        }, function (error) {
            fail("Failed to Get Comments Summary for Activity ID : " + activityId);
            done();
        });
    }, 10000);
    it("Delete Activity Comment By ID", function (done) {
        lib_1.default.ActivityStream.deleteActivityComment(activityId, commentId).then(function (res) {
            expect(true).toBe(true);
            done();
        }, function (error) {
            fail("Failed Delete Activity Comment By ID :" + commentId);
            done();
        });
    }, 10000);
    it("Create Activity Like", function (done) {
        var like = {};
        lib_1.default.ActivityStream.createActivityLike(activityId, like).then(function (res) {
            likeId = res.id;
            expect(res.id).toBeDefined();
            done();
        }, function (error) {
            fail("Failed to Create Activity Like for Activity ID :" + activityId);
            done();
        });
    }, 10000);
    it("Get Activity Likes Summary", function (done) {
        lib_1.default.ActivityStream.getActivityLikesSummary(activityId).then(function (likesSummaryItem) {
            expect(likesSummaryItem.count).toBe(1);
            done();
        }, function (error) {
            fail("Failed to Get Activity Likes Summary for Activity ID : " + activityId);
            done();
        });
    }, 10000);
    it("Get Likes Summary by Object ID & Type", function (done) {
        lib_1.default.ActivityStream.getLikesSummary("oracle.webcenter.activitystreaming", "activity", activityId).then(function (likesSummaryItem) {
            expect(likesSummaryItem.count).toBe(1);
            done();
        }, function (error) {
            fail("Failed to Get Likes Summary for Activity ID : " + activityId);
            done();
        });
    }, 10000);
    it("Delete Activity Like By ID", function (done) {
        lib_1.default.ActivityStream.deleteActivityLike(activityId, likeId).then(function (res) {
            expect(true).toBe(true);
            done();
        }, function (error) {
            fail("Failed Delete Activity Like By ID :" + likeId);
            done();
        });
    }, 10000);
    it("Get Activity by ID & Process", function (done) {
        lib_1.default.ActivityStream.getActivity(activityId).then(function (activity) {
            var processedActivity = lib_1.default.ActivityStream.processActivity(activity);
            expect(processedActivity.messageParts).toBeDefined();
            done();
        }, function (error) {
            fail("Failed to Get Activity By ID :" + activityId);
            done();
        });
    }, 10000);
    it("Delete Message By ID", function (done) {
        lib_1.default.Wall.deleteUserMessage(postedMessageId).then(function (res) {
            expect(true).toBe(true);
            done();
        }, function (error) {
            fail("Failed to Delete Message By ID.");
            done();
        });
    }, 10000);
    // This test case is failing since there is no DELETE method in WebCenter REST API
    xit("Delete Activity By ID", function (done) {
        lib_1.default.ActivityStream.deleteActivity(activityId).then(function (res) {
            expect(true).toBe(true);
            done();
        }, function (error) {
            fail("Failed to Delete Activity By ID.");
            done();
        });
    }, 10000);
});
//# sourceMappingURL=activities.spec.js.map
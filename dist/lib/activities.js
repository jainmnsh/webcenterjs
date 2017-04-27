/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Activity Stream provides a streaming view of the activities of your connections, actions taken in portals,
 * and business activities. For example, Activity Stream can note when you or a connection posts feedback,
 * uploads a document, or creates a discussion forum.
 * @preferred
 */
var Config = require("./config");
var Core = require("./core");
// tslint:disable-next-line:max-line-length
var ACTIVITIES_API = "/api/activities?personGuid={personGuid}&personal={personal}&connections={connections}&connectionListIds={connectionListIds}&groupSpaces={groupSpaces}&groupSpaceGuids={groupSpaceGuids}&userGroupSpaceActivities={userGroupSpaceActivities}&followedObjects={followedObjects}&followedObjectsUserActivities={followedObjectsUserActivities}&serviceIds={serviceIds}&advancedQuery={advancedQuery}&fromDate={fromDate}&toDate={toDate}";
var ACTIVITY_API = "/api/activities/{id}";
var ACTIVITY_COMMENTSSUMMARY_API = "/api/activities/{activityId}/commentsSummary";
// tslint:disable-next-line:max-line-length
var COMMENTSSUMMARY_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/commentsSummary";
var ACTIVITY_COMMENTS_API = "/api/activities/{activityId}/comments";
// tslint:disable-next-line:max-line-length
var COMMENTS_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/comments";
// tslint:disable-next-line:max-line-length
var COMMENT_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/comments/{commentId}";
var ACTIVITY_COMMENT_API = "/api/activities/{activityId}/comments/{commentId}";
var ACTIVITY_LIKESSUMMARY_API = "/api/activities/{activityId}/likesSummary";
// tslint:disable-next-line:max-line-length
var LIKESSUMMARY_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/likesSummary";
var ACTIVITY_LIKES_API = "/api/activities/{activityId}/likes";
var LIKES_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/likes";
// tslint:disable-next-line:max-line-length
var LIKE_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/likes/{likeId}";
var ACTIVITY_LIKE_API = "/api/activities/{activityId}/likes/{likeId}";
var ITEMS_PER_PAGE = 40;
/**
 * This method compliments [Activity Stream REST API](https://docs.oracle.com/middleware/11119/wcp/develop/jpsdg_people_rest.htm#JPSDG5980)
 *
 * @param personGuid  GUID for the user to get activities for.
 * @param fromDate  Specifies activities start date (yyyy-mm-dd). Defaults to 7 days from current date.
 * @param toDate  Specifies activities end date (yyyy-mm-dd). Defaults to current date.
 * @param startIndex  startIndex as per [Common Request Query Parameters](https://docs.oracle.com/cloud/latest/webcenter-portal-cloud/WPCSD/GUID-1A218CB7-743A-4E74-A4E9-921F4DD09F3C.htm#GUID-1228CF59-D7E9-4622-80A0-334E0A02D884).
 * @param itemsPerPage  itemsPerPage as per [Common Request Query Parameters](https://docs.oracle.com/cloud/latest/webcenter-portal-cloud/WPCSD/GUID-1A218CB7-743A-4E74-A4E9-921F4DD09F3C.htm#GUID-1228CF59-D7E9-4622-80A0-334E0A02D884).
 * @param personal  get personal activities ?.
 * @param connections  get activities for connections ?.
 * @param connectionListIds  array of connection list ids to fetch activites for.
 * @param groupSpaces  get activities for group spaces?.
 * @param groupSpaceGuids  get activities for group spaces ids.
 * @param userGroupSpaceActivities  get user group spaces activities ?.
 * @param followedObjects  get activities associated with followed objects ?.
 * @param followedObjectsUserActivities  get followed objects user activities ?.
 * @param serviceIds  list of service ids.
 * @param data  data as per [Common Request Query Parameters](https://docs.oracle.com/cloud/latest/webcenter-portal-cloud/WPCSD/GUID-1A218CB7-743A-4E74-A4E9-921F4DD09F3C.htm#GUID-1228CF59-D7E9-4622-80A0-334E0A02D884).
 * @param advancedQuery  .
 * @returns      Comment for special return value.
 */
function getActivities(personGuid, fromDate, toDate, startIndex, itemsPerPage, personal, connections, connectionListIds, groupSpaces, groupSpaceGuids, userGroupSpaceActivities, followedObjects, followedObjectsUserActivities, serviceIds, data, advancedQuery) {
    if (personGuid === void 0) { personGuid = "@me"; }
    if (fromDate === void 0) { fromDate = new Date(Date.now() + (-7 * 24 * 3600 * 1000)); }
    if (toDate === void 0) { toDate = new Date(); }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    if (personal === void 0) { personal = true; }
    if (connections === void 0) { connections = true; }
    if (connectionListIds === void 0) { connectionListIds = []; }
    if (groupSpaces === void 0) { groupSpaces = true; }
    if (groupSpaceGuids === void 0) { groupSpaceGuids = []; }
    if (userGroupSpaceActivities === void 0) { userGroupSpaceActivities = true; }
    if (followedObjects === void 0) { followedObjects = true; }
    if (followedObjectsUserActivities === void 0) { followedObjectsUserActivities = true; }
    if (serviceIds === void 0) { serviceIds = []; }
    if (data === void 0) { data = "data,commentsSummary,likesSummary"; }
    if (advancedQuery === void 0) { advancedQuery = ""; }
    var connectionListIdsCsv;
    var groupSpaceGuidsCsv;
    var serviceIdsCsv;
    var fromDateStr;
    var toDateStr;
    if (connectionListIds.length > 0) {
        connectionListIdsCsv = connectionListIds.join(",");
    }
    if (groupSpaceGuids.length > 0) {
        groupSpaceGuidsCsv = groupSpaceGuids.join(",");
    }
    if (serviceIds.length > 0) {
        serviceIdsCsv = serviceIds.join(",");
    }
    if (fromDate) {
        fromDateStr = fromDate.toISOString();
        fromDateStr = fromDateStr.substring(0, fromDateStr.indexOf("T"));
    }
    if (toDate) {
        toDateStr = toDate.toISOString();
        toDateStr = toDateStr.substring(0, toDateStr.indexOf("T"));
    }
    var params = {
        personGuid: personGuid,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
        personal: personal,
        connections: connections,
        connectionListIdsCsv: connectionListIdsCsv,
        groupSpaces: groupSpaces,
        groupSpaceGuidsCsv: groupSpaceGuidsCsv,
        userGroupSpaceActivities: userGroupSpaceActivities,
        followedObjects: followedObjects,
        followedObjectsUserActivities: followedObjectsUserActivities,
        serviceIdsCsv: serviceIdsCsv,
        data: data,
        advancedQuery: advancedQuery,
        fromDate: fromDateStr,
        toDate: toDateStr,
    };
    return Core.doGet(ACTIVITIES_API, params);
}
exports.getActivities = getActivities;
function createActivity(activity) {
    /*         let activityElement = {
     'serviceId': serviceId,
     'activityType': activityType,
     'scope': scope,
     'detail': item.title,
     'templateParams': {
     'items': [{
     'key': '{actor[0]}',
     'guid': '@me'
     }, {
     'key': '{object[0]}',
     'id': objectId,
     'serviceId': serviceId,
     'type': objectType,
     'displayName': item.title
     }]
     }
     };
     */
    var params = {};
    return Core.doPost(ACTIVITIES_API, activity, params);
}
exports.createActivity = createActivity;
function getActivity(activityId) {
    var params = {
        id: activityId,
    };
    return Core.doGet(ACTIVITY_API, params);
}
exports.getActivity = getActivity;
function deleteActivity(activityId) {
    var params = {
        id: activityId,
    };
    return Core.doDelete(ACTIVITY_API, params);
}
exports.deleteActivity = deleteActivity;
function getActivityCommentsSummary(activityId) {
    var params = {
        activityId: activityId,
    };
    return Core.doGet(ACTIVITY_COMMENTSSUMMARY_API, params);
}
exports.getActivityCommentsSummary = getActivityCommentsSummary;
function getCommentsSummary(serviceId, objectType, objectId) {
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doGet(COMMENTSSUMMARY_API, params);
}
exports.getCommentsSummary = getCommentsSummary;
function getActivityComments(activityId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        activityId: activityId,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(ACTIVITY_COMMENTS_API, params);
}
exports.getActivityComments = getActivityComments;
function deleteActivityComment(activityId, commentId) {
    var params = {
        activityId: activityId,
        commentId: commentId,
    };
    return Core.doDelete(ACTIVITY_COMMENT_API, params);
}
exports.deleteActivityComment = deleteActivityComment;
function createActivityCommment(activityId, comment) {
    var params = {
        activityId: activityId,
    };
    return Core.doPost(ACTIVITY_COMMENTS_API, comment, params);
}
exports.createActivityCommment = createActivityCommment;
function getComments(serviceId, objectType, objectId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(COMMENTS_API, params);
}
exports.getComments = getComments;
function createCommment(serviceId, objectType, objectId, comment) {
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doPost(COMMENTS_API, comment, params);
}
exports.createCommment = createCommment;
function deleteComment(serviceId, objectType, objectId, commentId) {
    var params = {
        commentId: commentId,
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doDelete(COMMENT_API, params);
}
exports.deleteComment = deleteComment;
function getActivityLikesSummary(activityId) {
    var params = {
        activityId: activityId,
    };
    return Core.doGet(ACTIVITY_LIKESSUMMARY_API, params);
}
exports.getActivityLikesSummary = getActivityLikesSummary;
function getLikesSummary(serviceId, objectType, objectId) {
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doGet(LIKESSUMMARY_API, params);
}
exports.getLikesSummary = getLikesSummary;
function getActivityLikes(activityId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        activityId: activityId,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(ACTIVITY_LIKES_API, params);
}
exports.getActivityLikes = getActivityLikes;
function deleteActivityLike(activityId, likeId) {
    var params = {
        activityId: activityId,
        likeId: likeId,
    };
    return Core.doDelete(ACTIVITY_LIKE_API, params);
}
exports.deleteActivityLike = deleteActivityLike;
function createActivityLike(activityId, like) {
    if (like === void 0) { like = {}; }
    var params = {
        activityId: activityId,
    };
    return Core.doPost(ACTIVITY_LIKES_API, like, params);
}
exports.createActivityLike = createActivityLike;
function getLikes(serviceId, objectType, objectId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(LIKES_API, params);
}
exports.getLikes = getLikes;
function createLike(serviceId, objectType, objectId, like) {
    if (like === void 0) { like = {}; }
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doPost(LIKES_API, like, params);
}
exports.createLike = createLike;
function deleteLike(serviceId, objectType, objectId, likeId) {
    var params = {
        likeId: likeId,
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doDelete(LIKE_API, params);
}
exports.deleteLike = deleteLike;
function processActivity(activity) {
    var message = activity.message;
    var messageParts = [];
    var actor;
    var object;
    var actOn;
    var extendedActivity = activity;
    if (activity.detailURL) {
        if (activity.detailURL.indexOf("/cs") < 0) {
            activity.detailURL = Config.getWcBaseUrl() + activity.detailURL;
        }
        else {
            activity.detailURL = activity.detailURL.replace("//cs", Config.getCsBaseUrl());
        }
    }
    if (activity.links) {
        for (var _i = 0, _a = activity.links; _i < _a.length; _i++) {
            var link = _a[_i];
            if (link.resourceType === "urn:oracle:webcenter:messageBoard:message") {
                var capabilities = link.capabilities;
                if (capabilities && capabilities.indexOf("urn:oracle:webcenter:delete") !== -1) {
                    extendedActivity.isDeletable = true;
                    break;
                }
            }
        }
    }
    if (message) {
        var startIdx = message.indexOf("{");
        var endIdx = 0;
        var sStartIdx = void 0;
        var sEndIdx = void 0;
        var selIdx = void 0;
        var selector = void 0;
        if (startIdx === -1) {
            messageParts.push(message);
        }
        while (startIdx !== -1) {
            endIdx = message.indexOf("}", startIdx);
            if (endIdx === -1) {
                // exception
            }
            var chunkMessage = message.substring(startIdx, endIdx + 1);
            startIdx = message.indexOf("{", endIdx);
            sStartIdx = chunkMessage.indexOf("[");
            sEndIdx = chunkMessage.indexOf("]");
            selector = chunkMessage.substring(sStartIdx + 1, sEndIdx);
            selIdx = parseInt(selector, 10);
            var item_1 = void 0;
            for (var idx = 0; idx < activity.templateParams.items.length; idx++) {
                item_1 = activity.templateParams.items[idx];
                if (item_1) {
                    if (item_1.key === chunkMessage) {
                        messageParts.push(item_1);
                        if (selIdx === 0) {
                            if (chunkMessage.indexOf("{actor") > -1) {
                                actor = item_1;
                            }
                            if (chunkMessage.indexOf("{object") > -1) {
                                object = item_1;
                            }
                        }
                    }
                }
            }
            if (startIdx < 0) {
                messageParts.push(message.substring(endIdx + 1));
            }
            else {
                messageParts.push(message.substring(endIdx + 1, startIdx));
            }
        }
        var actOnFound = false;
        var item = void 0;
        for (var idx = 0; idx < activity.templateParams.items.length; idx++) {
            item = activity.templateParams.items[idx];
            if ((!actOnFound) &&
                (item.type === "activity") &&
                (item.serviceId === "oracle.activitystreaming")) {
                actOn = item;
            }
        }
        extendedActivity.primaryObject = object;
        extendedActivity.primaryActor = actor;
        extendedActivity.actOn = actOn;
        extendedActivity.messageParts = messageParts;
        if (extendedActivity.links) {
            for (var _b = 0, _c = extendedActivity.links; _b < _c.length; _b++) {
                var link = _c[_b];
                if (link.resourceType === "urn:oracle:webcenter:messageBoard:message") {
                    var capabilities = link.capabilities;
                    if (capabilities && capabilities.indexOf("urn:oracle:webcenter:delete") !== -1) {
                        extendedActivity.isDeletable = true;
                        break;
                    }
                }
            }
        }
    }
    return extendedActivity;
}
exports.processActivity = processActivity;
//# sourceMappingURL=activities.js.map
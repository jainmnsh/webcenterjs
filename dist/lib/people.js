"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var Core = require("./core");
var INVITATION_API = "/api/people/invitations/{id}";
var INVITATIONS_API = "/api/people/invitations";
var LISTS_API = "/api/people/{guid}/listNames";
var LIST_API = "/api/people/{guid}/listNames/{listid}";
var LIST_MEMBER_API = "/api/people/{guid}/lists/{listid}/members/{memberguid}";
var LISTDETAIL_API = "/api/people/{guid}/lists/{listid}";
var STATUS_API = "/api/people/{guid}/status";
var FEEDBACKS_API = "/api/feedback/{guid}/{selector}";
var FEEDBACK_API = "/api/feedback/{guid}/@self/{mid}";
var ITEMS_PER_PAGE = 40;
/**
 * Get Received [Invitations](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDCHBDB) for the logged in User
 * @returns a Http Promise that will resolve to InvitationList
 */
function getReceivedInvitations(startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:people:invitations", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: {
                q: "invitee:equals:@me",
                startIndex: startIndex,
                itemsPerPage: itemsPerPage,
            },
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getReceivedInvitations = getReceivedInvitations;
/**
 * Get Sent [Invitations](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDCHBDB) for the logged in User
 * @returns a Http Promise that will resolve to InvitationList
 */
function getSentInvitations(startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:people:invitations", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: {
                q: "invitor:equals:@me",
                startIndex: startIndex,
                itemsPerPage: itemsPerPage,
            },
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getSentInvitations = getSentInvitations;
/**
 * Accept an [Invitation](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDECDDG) by its Id
 * @param inviteId Invitation ID, once of the invitation from [[getReceivedInvitations]]
 */
function acceptInvite(inviteId) {
    var invitation = {
        id: inviteId,
        invitee: null,
        invitor: null,
        links: null,
        message: null,
        resourceType: null,
        sentDate: null,
        status: "accepted",
    };
    var params = {
        id: inviteId,
    };
    return Core.doPut(INVITATION_API, invitation, params);
}
exports.acceptInvite = acceptInvite;
function ignoreInvite(inviteId) {
    var invitation = {
        id: inviteId,
        invitee: null,
        invitor: null,
        links: null,
        message: null,
        resourceType: null,
        sentDate: null,
        status: "ignored",
    };
    var params = {
        id: inviteId,
    };
    return Core.doPut(INVITATION_API, invitation, params);
}
exports.ignoreInvite = ignoreInvite;
function deleteInvite(inviteId) {
    var params = {
        id: inviteId,
    };
    return Core.doDelete(INVITATION_API, params);
}
exports.deleteInvite = deleteInvite;
function createInvite(userGuid, invitationMessage) {
    var invitation = {
        id: null,
        invitee: {
            displayName: null,
            guid: userGuid,
            id: null,
            links: null,
            resourceType: null,
        },
        invitor: null,
        links: null,
        message: invitationMessage,
        resourceType: null,
        sentDate: null,
        status: null,
    };
    return Core.doPost(INVITATIONS_API, invitation);
}
exports.createInvite = createInvite;
/*
 * A List is a simple Contact Group
 */
function getListNames() {
    var params = {
        guid: "@me",
    };
    return Core.doGet(LISTS_API, params);
}
exports.getListNames = getListNames;
function getReceivedFeedback(guid, startIndex, itemsPerPage) {
    if (guid === void 0) { guid = "@me"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        guid: guid,
        selector: "@self",
    };
    return Core.doGet(FEEDBACKS_API, params);
}
exports.getReceivedFeedback = getReceivedFeedback;
function getGivenFeedback(guid, startIndex, itemsPerPage) {
    if (guid === void 0) { guid = "@me"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        guid: guid,
        selector: "@all",
    };
    return Core.doGet(FEEDBACKS_API, params);
}
exports.getGivenFeedback = getGivenFeedback;
function createFeedback(feedback, receiverGuid) {
    var params = {
        guid: receiverGuid,
        selector: "@self",
    };
    var feedbackItem = {
        author: null,
        body: feedback,
        created: null,
        deleteAllowed: true,
        hideAllowed: true,
        id: null,
        links: null,
        receivedUser: {
            displayName: null,
            guid: receiverGuid,
            id: null,
            links: null,
            resourceType: null,
        },
        resourceType: null,
    };
    return Core.doPost(FEEDBACKS_API, feedbackItem, params);
}
exports.createFeedback = createFeedback;
function deleteFeedback(mid, guid) {
    if (guid === void 0) { guid = "@me"; }
    var params = {
        guid: guid,
    };
    return Core.doDelete(FEEDBACK_API, params);
}
exports.deleteFeedback = deleteFeedback;
function getPersonList(listId, attrs, links, projection, startIndex, itemsPerPage) {
    if (listId === void 0) { listId = "@self"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    if (listId === "@self") {
        // requested self profile
        var pars = {
            guid: "@me",
            listid: listId,
        };
        return Core.doGet(LISTDETAIL_API, pars);
    }
    else {
        var attrsCsv = "";
        var linksCsv = "";
        if (links && links.length > 0) {
            linksCsv = links.join(",");
        }
        if (attrs && attrs.length > 0) {
            attrsCsv = attrs.join(",");
        }
        var pars = {
            data: attrsCsv,
            guid: "@me",
            itemsPerPage: itemsPerPage,
            links: linksCsv,
            listid: listId,
            projection: projection,
            startIndex: startIndex,
        };
        return Core.doGet(LISTDETAIL_API, pars);
    }
}
exports.getPersonList = getPersonList;
function getConnections(startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var listId = "@connections";
    return this.getPersonList(listId, null, null, null, startIndex, itemsPerPage);
}
exports.getConnections = getConnections;
function getSelf(attrs, links) {
    var attrsCsv = "";
    var linksCsv = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }
    var pars = {
        data: attrsCsv,
        guid: "@me",
        links: linksCsv,
        listid: "@self",
    };
    return Core.doGet(LISTDETAIL_API, pars);
}
exports.getSelf = getSelf;
function createList(listName) {
    var listObject = {
        links: null,
        name: listName,
        resourceType: null,
    };
    var params = {
        guid: "@me",
    };
    return Core.doPost(LISTS_API, listObject, params);
}
exports.createList = createList;
function deleteList(listId) {
    var params = {
        guid: "@me",
        listid: listId,
    };
    return Core.doDelete(LIST_API, params);
}
exports.deleteList = deleteList;
function deleteMemberFromList(listId, memberGuid) {
    var params = {
        guid: "@me",
        listid: listId,
        memberguid: memberGuid,
    };
    return Core.doDelete(LIST_MEMBER_API, params);
}
exports.deleteMemberFromList = deleteMemberFromList;
function addMemberToList(listId, memberGuid, message) {
    /*
     Adding a member to a listId = '@connections' will send an invite to the user before adding to the connections list
     */
    var listMember = {
        guid: memberGuid,
        message: message,
        links: null,
        resourceType: null,
    };
    var pars = {
        guid: "@me",
        listid: listId,
    };
    return Core.doPost(LISTDETAIL_API, listMember, pars);
}
exports.addMemberToList = addMemberToList;
function getPerson(query, data, links) {
    /*
     * data – A standard set that returns all the standard data for the response, but does not include status, manager, reportees, or photos.
     * 1. If both the projection and data query string parameters are present, the data parameter will be used to determine which data to return.
     * 2. If you specify the constant 'data' as the data parameter, all the basic information will be returned for the resource.
     * 3. The data parameter can also take any of the following values comma-separated values to return the corresponding data:
     *      guid, id, displayName, birthday, language, timeZone, name, addresses, organizations, workEmail, phoneNumbers, manager, reportees, photos, and/or status.
     *
     * The data parameter can also take a predefined set parameter like basic. For example, if you specify data=basic, it is the equivalent of specifying data=guid, id, displayName.
     * You can also specify additional parameters as needed. For example, you could specify data=basic,birthday.
     */
    /*
     * links - links – A standard set that returns all the standard links for the response, but does not include status, manager, reportees, or photos.
     * If both the projection and links query string parameters are present, the links parameter will be used to determine which links to return.
     * If you specify the constant 'links' as the links parameter, all the basic information will be returned for the resource.
     *
     * The links parameter also takes zero or more of the following comma-separated parameter:
     *      person, profile, icon, status, messageBoard, activities, personActivities, connectionActivities, connections, listNames, invitation, givenFeedback, receivedFeedback, userGivenFeedback, manager, reportees, and/or member.
     *
     * The links parameter can also take a predefined set parameter like basic. For example, if you specify data=basic, it is the equivalent of specifying data=guid, id, displayName.
     * You can also specify additional parameters as needed. For example, you could specify data=basic,birthday.
     */
    /*
     * query formats are
     * loginid:equals:<loginid>
     * guid:equals:<guid>
     * email:equals:<email>
     */
    if (!data) {
        data = "basic,\n                birthday,\n                language,\n                timeZone,\n                name,\n                addresses,\n                organizations,\n                workEmail,\n                phoneNumbers,\n                manager,\n                reportees,\n                photos,\n                status";
    }
    if (!links) {
        links = "person,\n                profile,\n                icon,\n                status,\n                messageBoard,\n                activities,\n                personActivities,\n                connectionActivities,\n                connections,\n                listNames,\n                invitation,\n                givenFeedback,\n                receivedFeedback,\n                userGivenFeedback,\n                manager,\n                reportees,\n                member";
    }
    var params = {
        q: query,
        data: data,
        links: links,
    };
    return Core.getResourceUrl("urn:oracle:webcenter:people:person", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: params,
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getPerson = getPerson;
function getPersonByLoginId(loginId, attrs, links) {
    var attrsCsv = "";
    var linksCsv = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }
    if (loginId) {
        var query = "loginid:equals:" + loginId;
        return this.getPerson(query, attrsCsv, linksCsv);
    }
}
exports.getPersonByLoginId = getPersonByLoginId;
function getPersonByGuid(guid, attrs, links) {
    var attrsCsv = "";
    var linksCsv = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }
    var query = "guid:equals:" + guid;
    return this.getPerson(query, attrsCsv, linksCsv);
}
exports.getPersonByGuid = getPersonByGuid;
function getPersonByEmail(email, attrs, links) {
    var attrsCsv = "";
    var linksCsv = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }
    var query = "email:equals:" + email;
    return this.getPerson(query, attrsCsv, linksCsv);
}
exports.getPersonByEmail = getPersonByEmail;
function getStatus(userGuid) {
    if (userGuid === void 0) { userGuid = "@me"; }
    var pars = {
        guid: "@me",
    };
    return Core.doGet(STATUS_API, pars);
}
exports.getStatus = getStatus;
function updateStatus(message) {
    var statusItem = {
        links: null,
        note: message,
        resourceType: null,
    };
    var pars = {
        guid: "@me",
    };
    return Core.doPut(STATUS_API, statusItem, pars);
}
exports.updateStatus = updateStatus;
//# sourceMappingURL=people.js.map
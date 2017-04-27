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
var tslib_1 = require("tslib");
var axios_1 = require("axios");
var Core = require("./core");
var WALL_API = "/api/messageBoards/{board-type}/{guid}";
var WALL_MESSAGE_TYPE_API = "/api/messageBoards/{board-type}/{guid}/{messageType}";
var WALL_MESSAGE_API = "/api/messageBoards/{board-type}/{guid}/messages/{mid}";
var ITEMS_PER_PAGE = 40;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["DEFAULT"] = 0] = "DEFAULT";
    MessageType[MessageType["PRIVATE"] = 1] = "PRIVATE";
    MessageType[MessageType["PUBLIC"] = 2] = "PUBLIC";
    MessageType[MessageType["HIDDEN"] = 3] = "HIDDEN";
    MessageType[MessageType["PRIVATE_HIDDEN"] = 4] = "PRIVATE_HIDDEN";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var BoardType;
(function (BoardType) {
    BoardType[BoardType["PERSON"] = 0] = "PERSON";
    BoardType[BoardType["SPACE"] = 1] = "SPACE";
})(BoardType = exports.BoardType || (exports.BoardType = {}));
function getMessageBoard(startIndex, itemsPerPage, params, projection) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:messageBoard", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: tslib_1.__assign({}, params, { projection: projection,
                startIndex: startIndex,
                itemsPerPage: itemsPerPage })
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getMessageBoard = getMessageBoard;
function getMessages(guid, messageType, boardType, startIndex, itemsPerPage) {
    if (guid === void 0) { guid = "@me"; }
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (boardType === void 0) { boardType = BoardType.PERSON; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    if (messageType === MessageType.DEFAULT) {
        var params = {
            "board-type": boardType === BoardType.SPACE ? "space" : "person",
            guid: guid,
            itemsPerPage: itemsPerPage,
            startIndex: startIndex,
        };
        return Core.doGet(WALL_API, params);
    }
    else {
        var mType = void 0;
        switch (messageType) {
            case MessageType.PRIVATE:
                mType = "private";
                break;
            case MessageType.PUBLIC:
                mType = "public";
                break;
            case MessageType.HIDDEN:
                mType = "hidden";
                break;
            case MessageType.PRIVATE_HIDDEN:
                mType = "private_hidden";
                break;
            default:
                mType = null;
                break;
        }
        var pars = {
            "board-type": boardType === BoardType.SPACE ? "space" : "person",
            guid: guid,
            itemsPerPage: itemsPerPage,
            "messageType": mType,
            startIndex: startIndex,
        };
        return Core.doGet(WALL_MESSAGE_TYPE_API, pars);
    }
}
exports.getMessages = getMessages;
function getUserMessages(userGuid, messageType, startIndex, itemsPerPage) {
    if (userGuid === void 0) { userGuid = "@me"; }
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return getMessages(userGuid, messageType, BoardType.PERSON, startIndex, itemsPerPage);
}
exports.getUserMessages = getUserMessages;
function getPortalMessages(portalScopeId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return getMessages(portalScopeId, MessageType.DEFAULT, BoardType.SPACE, startIndex, itemsPerPage);
}
exports.getPortalMessages = getPortalMessages;
function getVisibility(guid, messageType, boardType) {
    if (guid === void 0) { guid = "@me"; }
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (boardType === void 0) { boardType = BoardType.PERSON; }
    var mType = "private";
    if (guid === "@me") {
        switch (messageType) {
            case MessageType.DEFAULT:
                mType = "private";
                break;
            case MessageType.PRIVATE:
                mType = "private";
                break;
            case MessageType.PUBLIC:
                mType = "public";
                break;
            case MessageType.HIDDEN:
                mType = "hidden";
                break;
            case MessageType.PRIVATE_HIDDEN:
                mType = "private_hidden";
                break;
            default:
                mType = "private";
                break;
        }
    }
    else {
        switch (messageType) {
            case MessageType.DEFAULT:
                mType = "private";
                break;
            case MessageType.PRIVATE:
                mType = "private";
                break;
            case MessageType.PUBLIC:
                mType = "public";
                break;
            case MessageType.HIDDEN:
                mType = "private";
                break;
            case MessageType.PRIVATE_HIDDEN:
                mType = "private";
                break;
            default:
                mType = "private";
                break;
        }
    }
    if (boardType === BoardType.SPACE) {
        mType = null;
    }
    return mType;
}
exports.getVisibility = getVisibility;
function post(messageText, messageType, boardType, guid, linkItem) {
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (boardType === void 0) { boardType = BoardType.PERSON; }
    if (guid === void 0) { guid = "@me"; }
    var wallMessageItem = {
        author: null,
        body: messageText,
        created: null,
        id: null,
        link: linkItem,
        links: null,
        resourceType: null,
        type: null,
        visibilityType: getVisibility(guid, messageType, boardType),
    };
    var pars = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid: guid,
    };
    return Core.doPost(WALL_API, wallMessageItem, pars);
}
exports.post = post;
function postMessage(messageText, messageType, userGuid, linkItem) {
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (userGuid === void 0) { userGuid = "@me"; }
    return post(messageText, messageType, BoardType.PERSON, userGuid, linkItem);
}
exports.postMessage = postMessage;
function postToPortal(messageText, portalScopeId, linkItem) {
    return post(messageText, MessageType.PUBLIC, BoardType.SPACE, portalScopeId, linkItem);
}
exports.postToPortal = postToPortal;
function getMessage(messageId, boardType, guid) {
    if (boardType === void 0) { boardType = BoardType.PERSON; }
    if (guid === void 0) { guid = "@me"; }
    var pars = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid: guid,
        "mid": messageId,
    };
    return Core.doGet(WALL_MESSAGE_API, pars);
}
exports.getMessage = getMessage;
function getUserMessage(messageId, userGuid) {
    if (userGuid === void 0) { userGuid = "@me"; }
    return getMessage(messageId, BoardType.PERSON, userGuid);
}
exports.getUserMessage = getUserMessage;
function getPortalMessage(messageId, portalScopeId) {
    return getMessage(messageId, BoardType.SPACE, portalScopeId);
}
exports.getPortalMessage = getPortalMessage;
function update(messageId, boardType, guid, messageItem) {
    var pars = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid: guid,
        "mid": messageId,
    };
    return Core.doPut(WALL_MESSAGE_API, messageItem, pars);
}
exports.update = update;
function updateUserMessage(messageItem, userGuid) {
    if (userGuid === void 0) { userGuid = "@me"; }
    return update(messageItem.id, BoardType.PERSON, userGuid, messageItem);
}
exports.updateUserMessage = updateUserMessage;
function updatePortalMessage(messageItem, portalScopeId) {
    return this.update(messageItem.id, "space", portalScopeId, messageItem);
}
exports.updatePortalMessage = updatePortalMessage;
function deleteIntrn(messageId, boardType, guid) {
    var pars = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid: guid,
        "mid": messageId,
    };
    return Core.doDelete(WALL_MESSAGE_API, pars);
}
function deleteUserMessage(messageId, userGuid) {
    if (userGuid === void 0) { userGuid = "@me"; }
    return deleteIntrn(messageId, BoardType.PERSON, userGuid);
}
exports.deleteUserMessage = deleteUserMessage;
function deletePortalMessage(messageId, portalScopeId) {
    return deleteIntrn(messageId, BoardType.SPACE, portalScopeId);
}
exports.deletePortalMessage = deletePortalMessage;
//# sourceMappingURL=wall.js.map
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
var Core = require("./core");
var FORUMS_API = "/api/discussions/forums";
var FORUM_API = "/api/discussions/forums/{id}";
var FORUM_TOPICS_API = "/api/discussions/forums/{forumId}/topics";
var FORUM_TOPIC_API = "/api/discussions/forums/{forumId}/topics/{id}";
var SPACE_FORUMS_API = "/api/spaces/{spaceName}/discussions/forums";
var FORUM_TOPIC_MESSAGES_API = "/api/discussions/forums/{forumId}/topics/{topicId}/messages";
var FORUM_TOPIC_MESSAGE_API = "/api/discussions/forums/{forumId}/topics/{topicId}/messages/{id}";
var ITEMS_PER_PAGE = 40;
function getForums(startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(FORUMS_API, params);
}
exports.getForums = getForums;
function getPortalForums(portalName, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
        spaceName: portalName,
    };
    return Core.doGet(SPACE_FORUMS_API, params);
}
exports.getPortalForums = getPortalForums;
function createForum(name, displayName, description) {
    var forum = {
        author: null,
        createdBy: null,
        createdOn: null,
        description: description,
        displayName: displayName ? displayName : name,
        favorite: null,
        id: null,
        links: null,
        locked: false,
        messageCount: null,
        modifiedByUser: null,
        name: name,
        parentId: null,
        resourceType: null,
        topicCount: null,
        updatedBy: null,
        updatedOn: null,
        webUrl: null,
    };
    var params = {};
    return Core.doPost(FORUMS_API, forum, params);
}
exports.createForum = createForum;
function updateForum(forum) {
    var params = {};
    return Core.doPut(FORUMS_API, forum, params);
}
exports.updateForum = updateForum;
function updateForum2(name, displayName, description) {
    var forum = {
        author: null,
        createdBy: null,
        createdOn: null,
        description: description,
        displayName: displayName ? displayName : name,
        favorite: null,
        id: null,
        links: null,
        locked: false,
        messageCount: null,
        modifiedByUser: null,
        name: name,
        parentId: null,
        resourceType: null,
        topicCount: null,
        updatedBy: null,
        updatedOn: null,
        webUrl: null,
    };
    var params = {};
    return Core.doPut(FORUMS_API, forum, params);
}
exports.updateForum2 = updateForum2;
function getForum(forumId) {
    var params = {
        id: forumId,
    };
    return Core.doGet(FORUM_API, params);
}
exports.getForum = getForum;
function deleteForum(forumId) {
    var params = {
        id: forumId,
    };
    return Core.doDelete(FORUM_API, params);
}
exports.deleteForum = deleteForum;
/*
 * Topics for a Forum
 */
function getTopics(forumId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
        forumId: forumId,
    };
    return Core.doGet(FORUM_TOPICS_API, params);
}
exports.getTopics = getTopics;
function getTopic(forumId, topicId) {
    var params = {
        id: topicId,
        forumId: forumId,
    };
    return Core.doGet(FORUM_TOPIC_API, params);
}
exports.getTopic = getTopic;
function deleteTopic(forumId, topicId) {
    var params = {
        id: topicId,
        forumId: forumId,
    };
    return Core.doDelete(FORUM_TOPIC_API, params);
}
exports.deleteTopic = deleteTopic;
function createTopic(forumId, subject, body) {
    var topic = {
        body: body,
        forumId: forumId,
        subject: subject,
    };
    var params = {
        forumId: forumId,
    };
    return Core.doPost(FORUM_TOPICS_API, topic, params);
}
exports.createTopic = createTopic;
function updateTopic(topic) {
    var params = {
        forumId: topic.forumId,
        id: topic.id,
    };
    return Core.doPut(FORUM_TOPIC_API, topic, params);
}
exports.updateTopic = updateTopic;
function updateTopic2(forumId, topicId, subject, body) {
    var topic = {
        body: body,
        forumId: forumId,
        subject: subject,
    };
    var params = {
        forumId: forumId,
        id: topicId,
    };
    return Core.doPut(FORUMS_API, topic, params);
}
exports.updateTopic2 = updateTopic2;
/*
 * Topic Messages
 */
function getMessages(forumId, topicId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
        forumId: forumId,
        topicId: topicId,
    };
    return Core.doGet(FORUM_TOPIC_MESSAGES_API, params);
}
exports.getMessages = getMessages;
function getMessage(forumId, topicId, messageId) {
    var params = {
        id: messageId,
        forumId: forumId,
        topicId: topicId,
    };
    return Core.doGet(FORUM_TOPIC_MESSAGE_API, params);
}
exports.getMessage = getMessage;
function deleteMessage(forumId, topicId, messageId) {
    var params = {
        id: messageId,
        forumId: forumId,
        topicId: topicId,
    };
    return Core.doDelete(FORUM_TOPIC_MESSAGE_API, params);
}
exports.deleteMessage = deleteMessage;
function createMessage(forumId, topicId, subject, body) {
    var message = {
        body: body,
        forumId: forumId,
        topicId: topicId,
        subject: subject,
    };
    var params = {
        forumId: forumId,
        topicId: topicId,
    };
    return Core.doPost(FORUM_TOPIC_MESSAGES_API, message, params);
}
exports.createMessage = createMessage;
function updateMessage(message) {
    var params = {
        forumId: message.forumId,
        id: message.id,
        topicId: message.topicId,
    };
    return Core.doPut(FORUM_TOPIC_MESSAGE_API, message, params);
}
exports.updateMessage = updateMessage;
function updateMessage2(forumId, topicId, messageId, subject, body) {
    var topic = {
        body: body,
        forumId: forumId,
        subject: subject,
        topicId: topicId,
    };
    var params = {
        forumId: forumId,
        topicId: topicId,
        id: messageId,
    };
    return Core.doPut(FORUM_TOPIC_MESSAGE_API, topic, params);
}
exports.updateMessage2 = updateMessage2;
//# sourceMappingURL=discussions.js.map
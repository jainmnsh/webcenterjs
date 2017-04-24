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


import * as Core from "./core";
import * as Discussions from "./types/discussions";

const FORUMS_API: string = "/api/discussions/forums";
const FORUM_API: string = "/api/discussions/forums/{id}";
const FORUM_TOPICS_API: string = "/api/discussions/forums/{forumId}/topics";
const FORUM_TOPIC_API: string = "/api/discussions/forums/{forumId}/topics/{id}";
const SPACE_FORUMS_API: string = "/api/spaces/{spaceName}/discussions/forums";
const FORUM_TOPIC_MESSAGES_API: string = "/api/discussions/forums/{forumId}/topics/{topicId}/messages";
const FORUM_TOPIC_MESSAGE_API: string = "/api/discussions/forums/{forumId}/topics/{topicId}/messages/{id}";

const ITEMS_PER_PAGE: number = 40;

export function getForums(
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Discussions.Forums> {
    const params: {} = {
        startIndex,
        itemsPerPage,
    };
    return Core.doGet(FORUMS_API, params);
}

export function getPortalForums(
    portalName: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Discussions.Forums> {
    const params: {} = {
        startIndex,
        itemsPerPage,
        spaceName: portalName,
    };
    return Core.doGet(SPACE_FORUMS_API, params);
}

export function createForum(
    name: string,
    displayName?: string,
    description?: string): Promise<Discussions.Forum> {
    const forum: Discussions.Forum = {
        author: null,
        createdBy: null,
        createdOn: null,
        description,
        displayName: displayName ? displayName : name,
        favorite: null,
        id: null,
        links: null,
        locked: false,
        messageCount: null,
        modifiedByUser: null,
        name,
        parentId: null,
        resourceType: null,
        topicCount: null,
        updatedBy: null,
        updatedOn: null,
        webUrl: null,
    };
    const params: {} = {
    };
    return Core.doPost(FORUMS_API, forum, params);
}
export function updateForum(forum: Discussions.Forum): Promise<Discussions.Forum> {
    const params: {} = {
    };
    return Core.doPut(FORUMS_API, forum, params);
}
export function updateForum2(
    name: string,
    displayName?: string,
    description?: string): Promise<Discussions.Forum> {
    const forum: Discussions.Forum = {
        author: null,
        createdBy: null,
        createdOn: null,
        description,
        displayName: displayName ? displayName : name,
        favorite: null,
        id: null,
        links: null,
        locked: false,
        messageCount: null,
        modifiedByUser: null,
        name,
        parentId: null,
        resourceType: null,
        topicCount: null,
        updatedBy: null,
        updatedOn: null,
        webUrl: null,
    };
    const params: {} = {
    };
    return Core.doPut(FORUMS_API, forum, params);
}
export function getForum(forumId: string): Promise<Discussions.Forum> {
    const params: any = {
        id: forumId,
    };
    return Core.doGet(FORUM_API, params);
}
export function deleteForum(forumId: string): Promise<void> {
    const params: {} = {
        id: forumId,
    };
    return Core.doDelete(FORUM_API, params);
}

/*
 * Topics for a Forum
 */

export function getTopics(
    forumId: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Discussions.Topics> {
    const params: {} = {
        startIndex,
        itemsPerPage,
        forumId,
    };
    return Core.doGet(FORUM_TOPICS_API, params);
}

export function getTopic(forumId: string, topicId: string): Promise<Discussions.Topic> {
    const params: {} = {
        id: topicId,
        forumId,
    };
    return Core.doGet(FORUM_TOPIC_API, params);
}

export function deleteTopic(forumId: string, topicId: string): Promise<void> {
    const params: {} = {
        id: topicId,
        forumId,
    };
    return Core.doDelete(FORUM_TOPIC_API, params);
}

export function createTopic(forumId: string, subject: string, body: string): Promise<Discussions.Topic> {
    const topic: {} = {
        body,
        forumId,
        subject,
    };
    const params: {} = {
        forumId,
    };
    return Core.doPost(FORUM_TOPICS_API, topic, params);
}

export function updateTopic(topic: Discussions.Topic): Promise<Discussions.Topic> {
    const params: {} = {
        forumId: topic.forumId,
        id: topic.id,
    };
    return Core.doPut(FORUM_TOPIC_API, topic, params);
}
export function updateTopic2(
    forumId: string,
    topicId: string,
    subject: string,
    body: string): Promise<Discussions.Topic> {
    const topic: any = {
        body,
        forumId,
        subject,
    };
    const params: {} = {
        forumId,
        id: topicId,
    };
    return Core.doPut(FORUMS_API, topic, params);
}

/*
 * Topic Messages
 */
export function getMessages(
    forumId: string,
    topicId: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Discussions.Messages> {
    const params: {} = {
        startIndex,
        itemsPerPage,
        forumId,
        topicId,
    };
    return Core.doGet(FORUM_TOPIC_MESSAGES_API, params);
}

export function getMessage(
    forumId: string,
    topicId: string,
    messageId: string): Promise<Discussions.Message> {
    const params: {} = {
        id: messageId,
        forumId,
        topicId,
    };
    return Core.doGet(FORUM_TOPIC_MESSAGE_API, params);
}

export function deleteMessage(forumId: string, topicId: string, messageId: string): Promise<void> {
    const params: {} = {
        id: messageId,
        forumId,
        topicId,
    };
    return Core.doDelete(FORUM_TOPIC_MESSAGE_API, params);
}

export function createMessage(
    forumId: string,
    topicId: string,
    subject: string,
    body: string): Promise<Discussions.Message> {
    const message: {} = {
        body,
        forumId,
        topicId,
        subject,
    };
    const params: {} = {
        forumId,
        topicId,
    };
    return Core.doPost(FORUM_TOPIC_MESSAGES_API, message, params);
}

export function updateMessage(message: Discussions.Message): Promise<Discussions.Message> {
    const params: {} = {
        forumId: message.forumId,
        id: message.id,
        topicId: message.topicId,
    };
    return Core.doPut(FORUM_TOPIC_MESSAGE_API, message, params);
}
export function updateMessage2(
    forumId: string,
    topicId: string,
    messageId: string,
    subject: string,
    body: string): Promise<Discussions.Message> {
    const topic: {} = {
        body,
        forumId,
        subject,
        topicId,
    };
    const params: {} = {
        forumId,
        topicId,
        id: messageId,
    };
    return Core.doPut(FORUM_TOPIC_MESSAGE_API, topic, params);
}

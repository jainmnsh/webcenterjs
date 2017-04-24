import * as Common from "./common";

export interface Categories extends Common.PaginatedLinked, Common.LinkedItem<Category> {
    category: Category[];
}

export interface Category extends Container {
    categoryCount: number;
    forumCount: number;
}

export interface Container extends DiscussionBase {
    name: string;
    displayName: string;
    description: string;
    updatedBy: string;
    modifiedByUser: Common.PersonReference;
}

export interface DiscussionBase extends Common.Linked {
    createdBy: string;
    webUrl: string;
    createdOn: Date;
    updatedOn: Date;
    id: string;
    parentId: string;
    author: Common.PersonReference;
    favorite: boolean;
}

export interface Forum extends Container {
    topicCount: number;
    messageCount: number;
    locked: boolean;
}

export interface Forums extends Common.PaginatedLinked, Common.LinkedItem<Forum> {
    forum: Forum[];
}

export interface Message extends DiscussionBase {
    subject: string;
    body: string;
    forumId: string;
    topicId: string;
    hasAttachment: boolean;
    numberOfReplies: number;
    depth: number;
    hidden: boolean;
}

export interface Messages extends Common.PaginatedLinked, Common.LinkedItem<Message> {
    message: Message[];
}

export interface Topic extends Message {
    updatedBy: string;
    modifiedByUser: Common.PersonReference;
    messageCount: number;
    locked: boolean;
}

export interface Topics extends Common.PaginatedLinked, Common.LinkedItem<Topic> {
    topic: Topic[];
}
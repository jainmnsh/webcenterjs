///<reference path="./common.d.ts" />
declare namespace WebCenter {
    export namespace Discussions {

        interface Categories extends Common.PaginatedLinked, Common.LinkedItem<Category> {
            category: Category[];
        }

        interface Category extends Container {
            categoryCount: number;
            forumCount: number;
        }

        interface Container extends DiscussionBase {
            name: string;
            displayName: string;
            description: string;
            updatedBy: string;
            modifiedByUser: Common.PersonReference;
        }

        interface DiscussionBase extends Common.Linked {
            createdBy: string;
            webUrl: string;
            createdOn: Date;
            updatedOn: Date;
            id: string;
            parentId: string;
            author: Common.PersonReference;
            favorite: boolean;
        }

        interface Forum extends Container {
            topicCount: number;
            messageCount: number;
            locked: boolean;
        }

        interface Forums extends Common.PaginatedLinked, Common.LinkedItem<Forum> {
            forum: Forum[];
        }

        interface Message extends DiscussionBase {
            subject: string;
            body: string;
            forumId: string;
            topicId: string;
            hasAttachment: boolean;
            numberOfReplies: number;
            depth: number;
            hidden: boolean;
        }

        interface Messages extends Common.PaginatedLinked, Common.LinkedItem<Message> {
            message: Message[];
        }

        interface Topic extends Message {
            updatedBy: string;
            modifiedByUser: Common.PersonReference;
            messageCount: number;
            locked: boolean;
        }

        interface Topics extends Common.PaginatedLinked, Common.LinkedItem<Topic> {
            topic: Topic[];
        }
    }
}

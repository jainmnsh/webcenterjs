///<reference path="./common.d.ts" />

declare namespace WebCenter {
    export namespace Feedback {
        interface FeedbackEntryItem extends Common.Linked {
            id: string;
            body: string;
            author: Common.PersonReference;
            receivedUser: Common.PersonReference;
            created: Date;
            hideAllowed: boolean;
            deleteAllowed: boolean;
        }

        interface FeedbackEntryList extends Common.PaginatedLinked {
            message: FeedbackEntryItem[];
        }
    }
}

import * as Common from "./common";

export interface FeedbackEntryItem extends Common.Linked {
    id: string;
    body: string;
    author: Common.PersonReference;
    receivedUser: Common.PersonReference;
    created: Date;
    hideAllowed: boolean;
    deleteAllowed: boolean;
}

export interface FeedbackEntryList extends Common.PaginatedLinked {
    message: FeedbackEntryItem[];
}
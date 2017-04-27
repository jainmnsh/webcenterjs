import * as Common from "./common";
import * as Spaces from "./spaces";
export interface CommentItem extends Common.Linked {
    id?: string;
    text: string;
    created?: Date;
    author?: Common.PersonReference;
}
export interface CommentList extends Common.PaginatedLinked {
    items: CommentItem[];
}
export interface CommentsSummaryItem extends Common.Linked {
    count: number;
    comments: CommentList;
}
export interface LikeItem extends Common.Linked {
    id?: string;
    created?: Date;
    author?: Common.PersonReference;
}
export interface LikeList extends Common.PaginatedLinked {
    items: LikeItem[];
}
export interface LikesSummaryItem extends Common.Linked {
    count: number;
    like: LikeItem;
}
export interface Activity extends Common.Linked {
    message?: string;
    id?: string;
    permission?: string;
    displayMessage?: string;
    description?: string;
    displayDescription?: string;
    serviceId: string;
    activityType: string;
    scope?: string;
    groupSpace?: Spaces.GroupSpaceReference;
    createdDate?: Date;
    detail?: string;
    detailURL?: string;
    isSummary?: boolean;
    templateParams: TemplateParameters;
}
export interface ActivityList extends Common.PaginatedLinked {
    items: Activity[];
}
export interface Parameter extends Common.Linked {
    key?: string;
    id?: string;
    type?: string;
    displayName?: string;
    created?: Date;
    author?: Common.PersonReference;
    description?: string;
    serviceId?: string;
    activityId?: string;
    guid?: string;
    department?: string;
    email?: string;
    jobTitle?: string;
    manager?: Common.PersonReference;
    primaryId?: string;
    typeDisplayName?: string;
    status?: string;
    iconUrl?: string;
    modified?: Date;
    modifiedByUser?: Common.PersonReference;
    commentsSummary?: CommentsSummaryItem;
    commentsCount?: number;
    likesSummary?: LikesSummaryItem;
    likesCount?: number;
}
export interface TemplateParameters {
    items: Parameter[];
}

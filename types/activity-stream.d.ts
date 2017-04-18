///<reference path="./common.d.ts" />

declare namespace WebCenter {
    export namespace ActivityStream {
        interface CommentItem extends Common.Linked {
            id?: string;
            text: string;
            created?: Date;
            author?: Common.PersonReference;
        }

        interface CommentList extends Common.PaginatedLinked {
            items: CommentItem[];
        }

        interface CommentsSummaryItem extends Common.Linked {
            count: number;
            comments: CommentList;
        }

        interface LikeItem extends Common.Linked {
            id: string;
            created: Date;
            author: Common.PersonReference;
        }

        interface LikeList extends Common.PaginatedLinked {
            items: LikeItem[];
        }

        interface LikesSummaryItem extends Common.Linked {
            count: number;
            like: LikeItem;
        }

        interface Activity extends Common.Linked {
            message?: string;
            id?: string;
            permission?: string;
            displayMessage?: string;
            description?: string;
            displayDescription?: string;
            serviceId: string;
            activityType: string;
            scope?: string;
            groupSpace?: Common.GroupSpaceReference;
            createdDate?: Date;
            detail?: string;
            detailURL?: string;
            isSummary?: boolean;
            templateParams: TemplateParameters;
        }

        interface ActivityList extends Common.PaginatedLinked {
            items: Activity[];
        }

        interface Parameter extends Common.Linked {
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

        interface TemplateParameters {
            items: Parameter[];
        }
    }
}

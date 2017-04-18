///<reference path="./common.d.ts" />

declare namespace WebCenter {
    export namespace Events {
        interface GSCategoryItem extends Common.Linked {
            name: string;
        }

        interface GSCategoryList extends Common.PaginatedLinked {
            gsCategory: GSCategoryItem[];
        }

        interface GSEventItem extends Common.Linked {
            location: string;
            priority: number;
            id: string;
            category: string;
            details: string;
            summary: string;
            duration: number;
            isAllDayEvent: boolean;
            startTime: Date;
            endTime: Date;
            created: Date;
            modified: Date;
            author: Common.PersonReference;
            modifiedByUser: Common.PersonReference;
            groupSpace: Common.GroupSpaceReference;
        }

        interface GSEventList extends Common.PaginatedLinked {
            gsEvent: GSEventItem[];
        }

    }
}

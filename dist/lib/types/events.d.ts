import * as Common from "./common";
import * as Spaces from "./spaces";
export interface GSCategoryItem extends Common.Linked {
    name: string;
}
export interface GSCategoryList extends Common.PaginatedLinked {
    gsCategory: GSCategoryItem[];
}
export interface GSEventItem extends Common.Linked {
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
    groupSpace: Spaces.GroupSpaceReference;
}
export interface GSEventList extends Common.PaginatedLinked {
    gsEvent: GSEventItem[];
}

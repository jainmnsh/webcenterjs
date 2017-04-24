import * as Common from "./common";
export interface WallLink {
    name?: string;
    url?: string;
    icon?: string;
    description?: string;
    mimeType?: string;
    objectId?: string;
    objectType?: string;
    serviceId?: string;
}

export interface WallMessageItem extends Common.Linked {
    id?: string;
    type?: string;
    body: string;
    author?: Common.PersonReference;
    created?: Date;
    visibilityType: string;
    link?: WallLink;
}

export interface WallMessageList extends Common.PaginatedLinked {
    items: WallMessageItem[];
}
///<reference path="./common.d.ts" />
declare namespace WebCenter {
    export namespace Wall {

        interface WallLink {
            name?: string;
            url?: string;
            icon?: string;
            description?: string;
            mimeType?: string;
            objectId?: string;
            objectType?: string;
            serviceId?: string;
        }

        interface WallMessageItem extends Common.Linked {
            id?: string;
            type?: string;
            body: string;
            author?: Common.PersonReference;
            created?: Date;
            visibilityType: string;
            link?: WallLink;
        }

        interface WallMessageList extends Common.PaginatedLinked {
            items: WallMessageItem[];
        }

    }
}

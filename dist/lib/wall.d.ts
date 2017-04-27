import * as Wall from "./types/wall";
export declare enum MessageType {
    DEFAULT = 0,
    PRIVATE = 1,
    PUBLIC = 2,
    HIDDEN = 3,
    PRIVATE_HIDDEN = 4,
}
export declare enum BoardType {
    PERSON = 0,
    SPACE = 1,
}
export declare function getMessageBoard(startIndex?: number, itemsPerPage?: number, params?: any, projection?: string): Promise<Wall.WallMessageList>;
export declare function getMessages(guid?: string, messageType?: MessageType, boardType?: BoardType, startIndex?: number, itemsPerPage?: number): Promise<Wall.WallMessageList>;
export declare function getUserMessages(userGuid?: string, messageType?: MessageType, startIndex?: number, itemsPerPage?: number): Promise<Wall.WallMessageList>;
export declare function getPortalMessages(portalScopeId: string, startIndex?: number, itemsPerPage?: number): Promise<Wall.WallMessageList>;
export declare function getVisibility(guid?: string, messageType?: MessageType, boardType?: BoardType): string;
export declare function post(messageText: string, messageType?: MessageType, boardType?: BoardType, guid?: string, linkItem?: Wall.WallLink): Promise<Wall.WallMessageItem>;
export declare function postMessage(messageText: string, messageType?: MessageType, userGuid?: string, linkItem?: Wall.WallLink): Promise<Wall.WallMessageItem>;
export declare function postToPortal(messageText: string, portalScopeId: string, linkItem?: Wall.WallLink): Promise<Wall.WallMessageItem>;
export declare function getMessage(messageId: string, boardType?: BoardType, guid?: string): Promise<Wall.WallMessageItem>;
export declare function getUserMessage(messageId: string, userGuid?: string): Promise<Wall.WallMessageItem>;
export declare function getPortalMessage(messageId: string, portalScopeId: string): Promise<Wall.WallMessageItem>;
export declare function update(messageId: string, boardType: BoardType, guid: string, messageItem: Wall.WallMessageItem): Promise<Wall.WallMessageItem>;
export declare function updateUserMessage(messageItem: Wall.WallMessageItem, userGuid?: string): Promise<Wall.WallMessageItem>;
export declare function updatePortalMessage(messageItem: Wall.WallMessageItem, portalScopeId: string): Promise<Wall.WallMessageItem>;
export declare function deleteUserMessage(messageId: string, userGuid?: string): Promise<{}>;
export declare function deletePortalMessage(messageId: string, portalScopeId: string): Promise<{}>;

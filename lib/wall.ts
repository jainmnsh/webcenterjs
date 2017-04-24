/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import axios, {AxiosResponse} from "axios";
import * as Core from "./core";
import * as Wall from "./types/wall";

const WALL_API: string = "/api/messageBoards/{board-type}/{guid}";
const WALL_MESSAGE_TYPE_API: string = "/api/messageBoards/{board-type}/{guid}/{messageType}";
const WALL_MESSAGE_API: string = "/api/messageBoards/{board-type}/{guid}/messages/{mid}";

const ITEMS_PER_PAGE: number = 40;

export enum MessageType {
    DEFAULT,
    PRIVATE,
    PUBLIC,
    HIDDEN,
    PRIVATE_HIDDEN,
}

export enum BoardType {
    PERSON,
    SPACE,
}

export function getMessageBoard(
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE,
    params?: any,
    projection?: string): Promise<Wall.WallMessageList> {
    return Core.getResourceUrl(
        "urn:oracle:webcenter:messageBoard",
        null).then((url: string) => {
        const resPromise: any = axios.get(url, {
            params : {
                ...params,
                projection,
                startIndex,
                itemsPerPage,
            }
        });
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

export function getMessages(
    guid: string = "@me",
    messageType: MessageType = MessageType.DEFAULT,
    boardType: BoardType = BoardType.PERSON,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Wall.WallMessageList> {
    if (messageType === MessageType.DEFAULT) {
        const params: {} = {
            "board-type": boardType === BoardType.SPACE ? "space" : "person",
            guid,
            itemsPerPage,
            startIndex,
        };
        return Core.doGet(WALL_API, params);
    } else {
        let mType: string;
        switch (messageType) {
            case MessageType.PRIVATE:
                mType = "private";
                break;
            case MessageType.PUBLIC:
                mType = "public";
                break;
            case MessageType.HIDDEN:
                mType = "hidden";
                break;
            case MessageType.PRIVATE_HIDDEN:
                mType = "private_hidden";
                break;
            default:
                mType = null;
                break;
        }

        const pars: any = {
            "board-type": boardType === BoardType.SPACE ? "space" : "person",
            guid,
            itemsPerPage,
            "messageType": mType,
            startIndex,
        };
        return Core.doGet(WALL_MESSAGE_TYPE_API, pars);
    }
}

export function getUserMessages(
    userGuid: string = "@me",
    messageType: MessageType = MessageType.DEFAULT,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Wall.WallMessageList> {
    return getMessages(userGuid, messageType, BoardType.PERSON, startIndex, itemsPerPage);
}

export function getPortalMessages(
    portalScopeId: string,
    messageType: MessageType = MessageType.DEFAULT,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Wall.WallMessageList> {
    return this.getMessages(portalScopeId, BoardType.SPACE , messageType, startIndex, itemsPerPage);
}

export function post(
    messageText: string,
    messageType: MessageType = MessageType.DEFAULT,
    boardType: BoardType = BoardType.PERSON,
    guid: string = "@me",
    linkItem?: Wall.WallLink,
): Promise<Wall.WallMessageItem> {
    let mType: string = "private";
    if (guid === "@me") {
        switch (messageType) {
            case MessageType.DEFAULT:
                mType = "private";
                break;
            case MessageType.PRIVATE:
                mType = "private";
                break;
            case MessageType.PUBLIC:
                mType = "public";
                break;
            case MessageType.HIDDEN:
                mType = "hidden";
                break;
            case MessageType.PRIVATE_HIDDEN:
                mType = "private_hidden";
                break;
            default:
                mType = "private";
                break;
        }
    } else {
        switch (messageType) {
            case MessageType.DEFAULT:
                mType = "private";
                break;
            case MessageType.PRIVATE:
                mType = "private";
                break;
            case MessageType.PUBLIC:
                mType = "public";
                break;
            case MessageType.HIDDEN:
                mType = "private";
                break;
            case MessageType.PRIVATE_HIDDEN:
                mType = "private";
                break;
            default:
                mType = "private";
                break;
        }
    }
    if (boardType === BoardType.SPACE) {
        mType = void 0;
    }
    const wallMessageItem: Wall.WallMessageItem = {
        author: null,
        body: messageText,
        created: null,
        id: null,
        link: linkItem,
        links: null,
        resourceType: null,
        type: null,
        visibilityType: mType,
    };
    const pars: {} = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid,
    };
    return Core.doPost(WALL_API, wallMessageItem, pars);
}

export function postMessage(
    messageText: string,
    messageType: MessageType = MessageType.DEFAULT,
    userGuid: string = "@me",
    linkItem?: Wall.WallLink): Promise<Wall.WallMessageItem> {
    return post(messageText, messageType, BoardType.PERSON, userGuid, linkItem);
}

export function postToPortal(
    messageText: string,
    portalScopeId: string,
    linkItem?: Wall.WallLink): Promise<Wall.WallMessageItem> {
   return post(messageText, MessageType.DEFAULT, BoardType.SPACE, portalScopeId, linkItem);
}

export function getMessage(
    messageId: string,
    boardType: BoardType = BoardType.PERSON,
    guid: string = "@me"): Promise<Wall.WallMessageItem> {
    const pars: {} = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid,
        "mid": messageId,
    };
    return Core.doGet(WALL_MESSAGE_API, pars);
}

export function getUserMessage(messageId: string, userGuid: string = "@me"): Promise<Wall.WallMessageItem> {
    return getMessage(messageId, BoardType.PERSON, userGuid);
}

export function getPortalMessage(messageId: string, portalScopeId: string): Promise<Wall.WallMessageItem> {
    return getMessage(messageId, BoardType.SPACE, portalScopeId);
}

export function update(
    messageId: string,
    boardType: BoardType,
    guid: string,
    messageItem: Wall.WallMessageItem): Promise<Wall.WallMessageItem> {
    const pars: {} = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid,
        "mid": messageId,
    };
    return Core.doPut(WALL_MESSAGE_API, messageItem, pars);
}

export function updateUserMessage(
    messageItem: Wall.WallMessageItem,
    userGuid: string = "@me"): Promise<Wall.WallMessageItem> {
    return update(messageItem.id, BoardType.PERSON, userGuid, messageItem);
}

export function updatePortalMessage(
    messageItem: Wall.WallMessageItem,
    portalScopeId: string): Promise<Wall.WallMessageItem> {
    return this.update(messageItem.id, "space", portalScopeId, messageItem);
}

function deleteIntrn(messageId: string, boardType: BoardType, guid: string): Promise<{}> {
    const pars: any = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid,
        "mid": messageId,
    };
    return Core.doDelete(WALL_MESSAGE_API, pars);
}

export function deleteUserMessage(messageId: string, userGuid: string = "@me"): Promise<{}> {
    return deleteIntrn(messageId, BoardType.PERSON, userGuid);
}

export function deletePortalMessage(messageId: string, portalScopeId: string): Promise<{}> {
    return deleteIntrn(messageId, BoardType.SPACE, portalScopeId);
}

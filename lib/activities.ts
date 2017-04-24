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

import * as Config from "./config";
import * as Core from "./core";
import * as ActivityStream from "./types/activity-stream";

// tslint:disable-next-line:max-line-length
const ACTIVITIES_API: string = "/api/activities?personGuid={personGuid}&personal={personal}&connections={connections}&connectionListIds={connectionListIds}&groupSpaces={groupSpaces}&groupSpaceGuids={groupSpaceGuids}&userGroupSpaceActivities={userGroupSpaceActivities}&followedObjects={followedObjects}&followedObjectsUserActivities={followedObjectsUserActivities}&serviceIds={serviceIds}&advancedQuery={advancedQuery}";
const ACTIVITY_API: string = "/api/activities/{id}";
const ACTIVITY_COMMENTSSUMMARY_API: string = "/api/activities/{activityId}/commentsSummary";
// tslint:disable-next-line:max-line-length
const COMMENTSSUMMARY_API: string = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/commentsSummary";
const ACTIVITY_COMMENTS_API: string = "/api/activities/{activityId}/comments";
// tslint:disable-next-line:max-line-length
const COMMENTS_API: string = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/comments";
// tslint:disable-next-line:max-line-length
const COMMENT_API: string = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/comments/{commentId}";
const ACTIVITY_COMMENT_API: string = "/api/activities/{activityId}/comments/{commentId}";
const ACTIVITY_LIKESSUMMARY_API: string = "/api/activities/{activityId}/likesSummary";
// tslint:disable-next-line:max-line-length
const LIKESSUMMARY_API: string = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/likesSummary";
const ACTIVITY_LIKES_API: string = "/api/activities/{activityId}/likes";
const LIKES_API: string = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/likes";
// tslint:disable-next-line:max-line-length
const LIKE_API: string = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/likes/{likeId}";
const ACTIVITY_LIKE_API: string = "/api/activities/{activityId}/likes/{likeId}";

const ITEMS_PER_PAGE: number = 40;

export function getActivities(
    personGuid: string = "@me",
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE,
    personal: boolean = true,
    connections: boolean = true,
    connectionListIds: string[] = [],
    groupSpaces: boolean = true,
    groupSpaceGuids: string[] = [],
    userGroupSpaceActivities: boolean = true,
    followedObjects: boolean = true,
    followedObjectsUserActivities: boolean = true,
    serviceIds: string[] = [],
    data: string = "data,commentsSummary,likesSummary",
    advancedQuery: string = ""): Promise<ActivityStream.ActivityList> {

    let connectionListIdsCsv: string;
    let groupSpaceGuidsCsv: string;
    let serviceIdsCsv: string;
    if (connectionListIds.length > 0) {
        connectionListIdsCsv = connectionListIds.join(",");
    }
    if (groupSpaceGuids.length > 0) {
        groupSpaceGuidsCsv = groupSpaceGuids.join(",");
    }
    if (serviceIds.length > 0) {
        serviceIdsCsv = serviceIds.join(",");
    }
    const params: {} = {
        personGuid,
        startIndex,
        itemsPerPage,
        personal,
        connections,
        connectionListIdsCsv,
        groupSpaces,
        groupSpaceGuidsCsv,
        userGroupSpaceActivities,
        followedObjects,
        followedObjectsUserActivities,
        serviceIdsCsv,
        data,
        advancedQuery,
    };
    return Core.doGet(ACTIVITIES_API, params);
}

export function createActivity(
    activity: ActivityStream.Activity): Promise<ActivityStream.Activity> {
    /*         let activityElement = {
     'serviceId': serviceId,
     'activityType': activityType,
     'scope': scope,
     'detail': item.title,
     'templateParams': {
     'items': [{
     'key': '{actor[0]}',
     'guid': '@me'
     }, {
     'key': '{object[0]}',
     'id': objectId,
     'serviceId': serviceId,
     'type': objectType,
     'displayName': item.title
     }]
     }
     };
     */
    const params: {} = {};
    return Core.doPost(ACTIVITIES_API, activity, params);
}

export function getActivity(activityId: string): Promise<ActivityStream.Activity> {
    const params: {} = {
        id: activityId,
    };
    return Core.doGet(ACTIVITY_API, params);
}

export function deleteActivity(activityId: string): Promise<{}> {
    const params: {} = {
        id: activityId,
    };
    return Core.doDelete(ACTIVITY_API, params);
}

export function getActivityCommentsSummary(activityId: string): Promise<ActivityStream.CommentsSummaryItem> {
    const params: {} = {
        activityId,
    };
    return Core.doGet(ACTIVITY_COMMENTSSUMMARY_API, params);
}

export function getCommentsSummary(
    serviceId: string,
    objectType: string,
    objectId: string): Promise<ActivityStream.CommentsSummaryItem> {
    const params: {} = {
        serviceId,
        objectType,
        objectId,
    };
    return Core.doGet(COMMENTSSUMMARY_API, params);
}

export function getActivityComments(
    activityId: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE,
    ): Promise<ActivityStream.CommentList> {
    const params: {} = {
        activityId,
        startIndex,
        itemsPerPage,
    };
    return Core.doGet(ACTIVITY_COMMENTS_API, params);
}

export function deleteActivityComment(activityId: string, commentId: string): Promise<{}> {
    const params: {} = {
        activityId,
        commentId,
    };
    return Core.doDelete(ACTIVITY_COMMENT_API, params);
}

export function createActivityCommment(
    activityId: string,
    comment: ActivityStream.CommentItem): Promise<ActivityStream.CommentItem> {
    const params: {} = {
        activityId,
    };
    return Core.doPost(ACTIVITY_COMMENTS_API, comment, params);
}

export function getComments(
    serviceId: string,
    objectType: string,
    objectId: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<ActivityStream.CommentList> {
    const params: {} = {
        serviceId,
        objectType,
        objectId,
        startIndex,
        itemsPerPage,
    };
    return Core.doGet(COMMENTS_API, params);
}

export function createCommment(
    serviceId: string,
    objectType: string,
    objectId: string,
    comment: ActivityStream.CommentItem): Promise<ActivityStream.CommentItem> {
    const params: {} = {
        serviceId,
        objectType,
        objectId,
    };
    return Core.doPost(COMMENTS_API, comment, params);
}

export function deleteComment(serviceId: string, objectType: string, objectId: string, commentId: string): Promise<{}> {
    const params: {} = {
        commentId,
        serviceId,
        objectType,
        objectId,
    };
    return Core.doDelete(COMMENT_API, params);
}

export function getActivityLikesSummary(activityId: string): Promise<ActivityStream.LikesSummaryItem> {
    const params: {} = {
        activityId,
    };
    return Core.doGet(ACTIVITY_LIKESSUMMARY_API, params);
}

export function getLikesSummary(
    serviceId: string,
    objectType: string,
    objectId: string): Promise<ActivityStream.LikesSummaryItem> {
    const params: {} = {
        serviceId,
        objectType,
        objectId,
    };
    return Core.doGet(LIKESSUMMARY_API, params);
}

export function getActivityLikes(
    activityId: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<ActivityStream.LikeList> {
    const params: {} = {
        activityId,
        startIndex,
        itemsPerPage,
    };
    return Core.doGet(ACTIVITY_LIKES_API, params);
}

export function deleteActivityLike(activityId: string, likeId: string): Promise<{}> {
    const params: {} = {
        activityId,
        likeId,
    };
    return Core.doDelete(ACTIVITY_LIKE_API, params);
}

export function createActivityLike(
    activityId: string,
    like: ActivityStream.LikeItem = {}): Promise<ActivityStream.LikeItem> {
    const params: {} = {
        activityId,
    };
    return Core.doPost(ACTIVITY_LIKES_API, like, params);
}

export function getLikes(
    serviceId: string,
    objectType: string,
    objectId: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<ActivityStream.LikeList> {
    const params: {} = {
        serviceId,
        objectType,
        objectId,
        startIndex,
        itemsPerPage,
    };
    return Core.doGet(LIKES_API, params);
}

export function createLike(
    serviceId: string,
    objectType: string,
    objectId: string,
    like: ActivityStream.LikeItem = {}): Promise<ActivityStream.LikeItem> {
    const params: {} = {
        serviceId,
        objectType,
        objectId,
    };
    return Core.doPost(LIKES_API, like, params);
}

export function deleteLike(serviceId: string, objectType: string, objectId: string, likeId: string): Promise<{}> {
    const params: {} = {
        likeId,
        serviceId,
        objectType,
        objectId,
    };
    return Core.doDelete(LIKE_API, params);
}

export function processActivity(activity: ActivityStream.Activity) {
    const message: string = activity.message;
    const messageParts: any[] = [];
    let actor: ActivityStream.Parameter;
    let object: ActivityStream.Parameter;
    let actOn: ActivityStream.Parameter;
    const extendedActivity: any = activity;

    if (activity.detailURL) {
        if (activity.detailURL.indexOf("/cs") < 0) {
            activity.detailURL = Config.getWcBaseUrl() + activity.detailURL;
        } else {
            activity.detailURL = activity.detailURL.replace("//cs", Config.getCsBaseUrl());
        }
    }

    if (activity.links) {
        for (const link of activity.links) {
            if (link.resourceType === "urn:oracle:webcenter:messageBoard:message") {
                const capabilities: string = link.capabilities;
                if (capabilities && capabilities.indexOf("urn:oracle:webcenter:delete") !== -1) {
                    extendedActivity.isDeletable = true;
                    break;
                }
            }
        }
    }

    if (message) {
        let startIdx: number = message.indexOf("{");
        let endIdx: number = 0;
        let sStartIdx: number;
        let sEndIdx: number;
        let selIdx: number;
        let selector: string;

        if (startIdx === -1) {
            messageParts.push(message);
        }

        while (startIdx !== -1) {
            endIdx = message.indexOf("}", startIdx);
            if (endIdx === -1) {
                // exception
            }
            const chunkMessage: string = message.substring(startIdx, endIdx + 1);
            startIdx = message.indexOf("{", endIdx);
            sStartIdx = chunkMessage.indexOf("[");
            sEndIdx = chunkMessage.indexOf("]");
            selector = chunkMessage.substring(sStartIdx + 1, sEndIdx);
            selIdx = parseInt(selector, 10);
            let item: ActivityStream.Parameter;

            for (let idx: number = 0; idx < activity.templateParams.items.length; idx++) {
                item = activity.templateParams.items[idx];
                if (item) {
                    if (item.key === chunkMessage) {
                        messageParts.push(item);
                        if (selIdx === 0) {
                            if (chunkMessage.indexOf("{actor") > -1) {
                                actor = item;
                            }
                            if (chunkMessage.indexOf("{object") > -1) {
                                object = item;
                            }
                        }
                    }
                }
            }

            if (startIdx < 0) {
                messageParts.push(message.substring(endIdx + 1));
            } else {
                messageParts.push(message.substring(endIdx + 1, startIdx));
            }
        }
        const actOnFound: boolean = false;
        let item: ActivityStream.Parameter;
        for (let idx: number = 0; idx < activity.templateParams.items.length; idx++) {
            item = activity.templateParams.items[idx];
            if (
                (!actOnFound) &&
                (item.type === "activity") &&
                (item.serviceId === "oracle.activitystreaming")) {
                actOn = item;
            }
        }
        extendedActivity.primaryObject = object;
        extendedActivity.primaryActor = actor;
        extendedActivity.actOn = actOn;
        extendedActivity.messageParts = messageParts;

        if (extendedActivity.links) {
            for (const link of extendedActivity.links) {
                if (link.resourceType === "urn:oracle:webcenter:messageBoard:message") {
                    const capabilities: string = link.capabilities;
                    if (capabilities && capabilities.indexOf("urn:oracle:webcenter:delete") !== -1) {
                        extendedActivity.isDeletable = true;
                        break;
                    }
                }
            }
        }
    }
    return extendedActivity;
}

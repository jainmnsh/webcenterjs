import * as ActivityStream from "./types/activity-stream";
/**
 * This method compliments [Activity Stream REST API](https://docs.oracle.com/middleware/11119/wcp/develop/jpsdg_people_rest.htm#JPSDG5980)
 *
 * @param personGuid  GUID for the user to get activities for.
 * @param fromDate  Specifies activities start date (yyyy-mm-dd). Defaults to 7 days from current date.
 * @param toDate  Specifies activities end date (yyyy-mm-dd). Defaults to current date.
 * @param startIndex  startIndex as per [Common Request Query Parameters](https://docs.oracle.com/cloud/latest/webcenter-portal-cloud/WPCSD/GUID-1A218CB7-743A-4E74-A4E9-921F4DD09F3C.htm#GUID-1228CF59-D7E9-4622-80A0-334E0A02D884).
 * @param itemsPerPage  itemsPerPage as per [Common Request Query Parameters](https://docs.oracle.com/cloud/latest/webcenter-portal-cloud/WPCSD/GUID-1A218CB7-743A-4E74-A4E9-921F4DD09F3C.htm#GUID-1228CF59-D7E9-4622-80A0-334E0A02D884).
 * @param personal  get personal activities ?.
 * @param connections  get activities for connections ?.
 * @param connectionListIds  array of connection list ids to fetch activites for.
 * @param groupSpaces  get activities for group spaces?.
 * @param groupSpaceGuids  get activities for group spaces ids.
 * @param userGroupSpaceActivities  get user group spaces activities ?.
 * @param followedObjects  get activities associated with followed objects ?.
 * @param followedObjectsUserActivities  get followed objects user activities ?.
 * @param serviceIds  list of service ids.
 * @param data  data as per [Common Request Query Parameters](https://docs.oracle.com/cloud/latest/webcenter-portal-cloud/WPCSD/GUID-1A218CB7-743A-4E74-A4E9-921F4DD09F3C.htm#GUID-1228CF59-D7E9-4622-80A0-334E0A02D884).
 * @param advancedQuery  .
 * @returns      Comment for special return value.
 */
export declare function getActivities(personGuid?: string, fromDate?: Date, toDate?: Date, startIndex?: number, itemsPerPage?: number, personal?: boolean, connections?: boolean, connectionListIds?: string[], groupSpaces?: boolean, groupSpaceGuids?: string[], userGroupSpaceActivities?: boolean, followedObjects?: boolean, followedObjectsUserActivities?: boolean, serviceIds?: string[], data?: string, advancedQuery?: string): Promise<ActivityStream.ActivityList>;
export declare function createActivity(activity: ActivityStream.Activity): Promise<ActivityStream.Activity>;
export declare function getActivity(activityId: string): Promise<ActivityStream.Activity>;
export declare function deleteActivity(activityId: string): Promise<{}>;
export declare function getActivityCommentsSummary(activityId: string): Promise<ActivityStream.CommentsSummaryItem>;
export declare function getCommentsSummary(serviceId: string, objectType: string, objectId: string): Promise<ActivityStream.CommentsSummaryItem>;
export declare function getActivityComments(activityId: string, startIndex?: number, itemsPerPage?: number): Promise<ActivityStream.CommentList>;
export declare function deleteActivityComment(activityId: string, commentId: string): Promise<{}>;
export declare function createActivityCommment(activityId: string, comment: ActivityStream.CommentItem): Promise<ActivityStream.CommentItem>;
export declare function getComments(serviceId: string, objectType: string, objectId: string, startIndex?: number, itemsPerPage?: number): Promise<ActivityStream.CommentList>;
export declare function createCommment(serviceId: string, objectType: string, objectId: string, comment: ActivityStream.CommentItem): Promise<ActivityStream.CommentItem>;
export declare function deleteComment(serviceId: string, objectType: string, objectId: string, commentId: string): Promise<{}>;
export declare function getActivityLikesSummary(activityId: string): Promise<ActivityStream.LikesSummaryItem>;
export declare function getLikesSummary(serviceId: string, objectType: string, objectId: string): Promise<ActivityStream.LikesSummaryItem>;
export declare function getActivityLikes(activityId: string, startIndex?: number, itemsPerPage?: number): Promise<ActivityStream.LikeList>;
export declare function deleteActivityLike(activityId: string, likeId: string): Promise<{}>;
export declare function createActivityLike(activityId: string, like?: ActivityStream.LikeItem): Promise<ActivityStream.LikeItem>;
export declare function getLikes(serviceId: string, objectType: string, objectId: string, startIndex?: number, itemsPerPage?: number): Promise<ActivityStream.LikeList>;
export declare function createLike(serviceId: string, objectType: string, objectId: string, like?: ActivityStream.LikeItem): Promise<ActivityStream.LikeItem>;
export declare function deleteLike(serviceId: string, objectType: string, objectId: string, likeId: string): Promise<{}>;
export declare function processActivity(activity: ActivityStream.Activity): any;

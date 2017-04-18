import axios from "axios";
import * as Core from "./core";

const EVENTS_API: string = "/api/spaces/{guid}/events?startDate={startDate}&endDate={endDate}";
const EVENT_API: string = "/api/spaces/{guid}/events/{id}";
const EVENT_CATEGORIES_API: string = "/api/spaces/{guid}/eventCategories";
const DEFAULT_SCOPE_ID: string = "s8bba98ff_4cbb_40b8_beee_296c916a23ed";

/*
 * Valid date formats are
 * yyyy-MM-dd
 * yyyy-MM-ddZ
 * yyyy-MM-dd'T'HH:mm:ss
 * yyyy-MM-dd'T'HH:mm:ssZ
 */

/*
 * Events are not applicable for defaultScope yet.
 */

export function getPortalEvents(
    portalGuid: string,
    startDate: string,
    endDate: string): Promise<WebCenter.Events.GSEventList> {
    const params: {} = {
        guid: portalGuid,
        startDate,
        endDate,
    };
    return Core.doGet(EVENTS_API, params);
}

export function createPortalEvent(
    portalGuid: string,
    eventSummary: string,
    startTime: string,
    endTime: string,
    priority: number = 3,
    location?: string,
    category?: string,
    details?: string): Promise<WebCenter.Events.GSEventItem> {
    const eventItem: {} = {
        author: null,
        category,
        created: null, // UTC_MILLISEC
        details,
        duration: null,
        endTime, // UTC_MILLISEC
        groupSpace: null,
        id: null,
        isAllDayEvent: false,
        links: null,
        location,
        modified: null, // UTC_MILLISEC
        modifiedByUser: null,
        priority,
        resourceType: null,
        startTime, // UTC_MILLISEC
        summary: eventSummary,
    };

    const params: {} = {
        guid: portalGuid,
    };

    return Core.doPost(EVENTS_API, eventItem, params);
}

export function getPortalEvent(portalGuid: string, eventId: string): Promise<WebCenter.Events.GSEventItem> {
    const params: {} = {
        guid: portalGuid,
        id: eventId,
    };
    return Core.doGet(EVENT_API, params);
}

export function updatePortalEvent(
    portalGuid: string,
    event: WebCenter.Events.GSEventItem): Promise<WebCenter.Events.GSEventItem> {
    const params: {} = {
        guid: portalGuid,
        id: event.id,
    };
    return Core.doPut(EVENT_API, event, params);
}

export function deletePortalEvent(portalGuid: string, eventId: string): Promise<void> {
    const params: {} = {
        guid: portalGuid,
        id: eventId,
    };
    return Core.doDelete(EVENT_API, params);
}

export function getPortalEventCategories(portalGuid: string): Promise<WebCenter.Events.GSCategoryItem> {
    const params: {} = {
        guid: portalGuid,
    };
    return Core.doGet(EVENT_CATEGORIES_API, params);
}

export function createPortalEventCategory(
    portalGuid: string,
    categoryName: string): Promise<WebCenter.Events.GSCategoryItem> {
    const category: WebCenter.Events.GSCategoryItem = {
        links: null,
        name: categoryName,
        resourceType: null,
    };
    const params: {} = {
        guid: portalGuid,
    };
    return Core.doPost(EVENT_CATEGORIES_API, category, params);
}

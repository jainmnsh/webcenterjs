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

import axios from "axios";
import * as Core from "./core";
import * as Events from "./types/events";

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
    endDate: string): Promise<Events.GSEventList> {
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
    details?: string): Promise<Events.GSEventItem> {
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

export function getPortalEvent(portalGuid: string, eventId: string): Promise<Events.GSEventItem> {
    const params: {} = {
        guid: portalGuid,
        id: eventId,
    };
    return Core.doGet(EVENT_API, params);
}

export function updatePortalEvent(
    portalGuid: string,
    event: Events.GSEventItem): Promise<Events.GSEventItem> {
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

export function getPortalEventCategories(portalGuid: string): Promise<Events.GSCategoryItem> {
    const params: {} = {
        guid: portalGuid,
    };
    return Core.doGet(EVENT_CATEGORIES_API, params);
}

export function createPortalEventCategory(
    portalGuid: string,
    categoryName: string): Promise<Events.GSCategoryItem> {
    const category: Events.GSCategoryItem = {
        links: null,
        name: categoryName,
        resourceType: null,
    };
    const params: {} = {
        guid: portalGuid,
    };
    return Core.doPost(EVENT_CATEGORIES_API, category, params);
}

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

import axios, { AxiosResponse } from "axios";
import * as Core from "./core";
import * as Feedback from "./types/feedback";
import * as People from "./types/people";

const INVITATION_API: string = "/api/people/invitations/{id}";
const INVITATIONS_API: string = "/api/people/invitations";
const LISTS_API: string = "/api/people/{guid}/listNames";
const LIST_API: string = "/api/people/{guid}/listNames/{listid}";
const LIST_MEMBER_API: string = "/api/people/{guid}/lists/{listid}/members/{memberguid}";
const LISTDETAIL_API: string = "/api/people/{guid}/lists/{listid}";
const STATUS_API: string = "/api/people/{guid}/status";
const FEEDBACKS_API: string = "/api/feedback/{guid}/{selector}";
const FEEDBACK_API: string = "/api/feedback/{guid}/@self/{mid}";

const ITEMS_PER_PAGE: number = 40;

/**
 * Get Received [Invitations](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDCHBDB) for the logged in User
 * @returns a Http Promise that will resolve to InvitationList
 */
export function getReceivedInvitations(
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<People.InvitationList> {

    return Core.getResourceUrl(
        "urn:oracle:webcenter:people:invitations",
        null).then((url: string) => {
        const resPromise: any = axios.get(url,{
            params: {
                q: "invitee:equals:@me",
                startIndex,
                itemsPerPage,
            },
        });
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

/**
 * Get Sent [Invitations](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDCHBDB) for the logged in User
 * @returns a Http Promise that will resolve to InvitationList
 */
export function getSentInvitations(
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<People.InvitationList> {
    return Core.getResourceUrl(
        "urn:oracle:webcenter:people:invitations",
        null).then((url: string) => {
        const resPromise: any = axios.get(url,{
            params: {
                q: "invitor:equals:@me",
                startIndex,
                itemsPerPage,
            },
        });
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

/**
 * Accept an [Invitation](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDECDDG) by its Id
 * @param inviteId Invitation ID, once of the invitation from [[getReceivedInvitations]]
 */
export function acceptInvite(inviteId: string): Promise<any> {
    const invitation: People.InvitationItem = {
        id: inviteId,
        invitee: null,
        invitor: null,
        links: null,
        message: null,
        resourceType: null,
        sentDate: null,
        status: "accepted",
    };

    const params: {} = {
        id: inviteId,
    };
    return Core.doPut(INVITATION_API, invitation, params);
}

export function ignoreInvite(inviteId: string): Promise<any> {
    const invitation: People.InvitationItem = {
        id: inviteId,
        invitee: null,
        invitor: null,
        links: null,
        message: null,
        resourceType: null,
        sentDate: null,
        status: "ignored",
    };

    const params: {} = {
        id: inviteId,
    };
    return Core.doPut(INVITATION_API, invitation, params);
}

export function deleteInvite(inviteId: string): Promise<any> {
    const params: {} = {
        id: inviteId,
    };
    return Core.doDelete(INVITATION_API, params);
}

export function createInvite(userGuid: string, invitationMessage: string): Promise<void> {
    const invitation: People.InvitationItem = {
        id: null,
        invitee: {
            displayName: null,
            guid: userGuid,
            id: null,
            links: null,
            resourceType: null,
        },
        invitor: null,
        links: null,
        message: invitationMessage,
        resourceType: null,
        sentDate: null,
        status: null,
    };
    return Core.doPost(INVITATIONS_API, invitation);
}

/*
 * A List is a simple Contact Group
 */
export function getListNames(): Promise<People.ListNames> {
    const params: {} = {
        guid: "@me",
    };
    return Core.doGet(LISTS_API, params);
}

export function getReceivedFeedback(
    guid: string = "@me",
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Feedback.FeedbackEntryList> {
    const params: {} = {
        guid,
        selector: "@self",
    };
    return Core.doGet(FEEDBACKS_API, params);
}

export function getGivenFeedback(
    guid: string = "@me",
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Feedback.FeedbackEntryList> {
    const params: {} = {
        guid,
        selector: "@all",
    };
    return Core.doGet(FEEDBACKS_API, params);
}

export function createFeedback(feedback: string, receiverGuid: string): Promise<Feedback.FeedbackEntryItem> {
    const params: {} = {
        guid: receiverGuid,
        selector: "@self",
    };

    const feedbackItem: Feedback.FeedbackEntryItem = {
        author: null,
        body: feedback,
        created: null,
        deleteAllowed: true,
        hideAllowed: true,
        id: null,
        links: null,
        receivedUser: {
            displayName: null,
            guid: receiverGuid,
            id: null,
            links: null,
            resourceType: null,
        },
        resourceType: null,
    };

    return Core.doPost(FEEDBACKS_API, feedbackItem, params);
}

export function deleteFeedback(mid: string, guid: string = "@me"): Promise<Feedback.FeedbackEntryItem> {
    const params: {} = {
        guid,
    };

    return Core.doDelete(FEEDBACK_API, params);
}

export function getPersonList(
    listId: string = "@self",
    attrs?: string[],
    links?: string[],
    projection?: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<People.PersonList> {
    if (listId === "@self") {
        // requested self profile
        const pars: {} = {
            guid: "@me",
            listid: listId,
        };
        return Core.doGet(LISTDETAIL_API, pars);
    } else {
        let attrsCsv: string = "";
        let linksCsv: string = "";
        if (links && links.length > 0) {
            linksCsv = links.join(",");
        }
        if (attrs && attrs.length > 0) {
            attrsCsv = attrs.join(",");
        }

        const pars: any = {
            data: attrsCsv,
            guid: "@me",
            itemsPerPage,
            links: linksCsv,
            listid: listId,
            projection,
            startIndex,
        };
        return Core.doGet(LISTDETAIL_API, pars);
    }
}

export function getConnections(
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<People.PersonList> {
    const listId: string = "@connections";
    return this.getPersonList(listId, null, null, null, startIndex, itemsPerPage);
}

export function getSelf(attrs?: string[], links?: string[]): Promise<People.Person> {
    let attrsCsv: string = "";
    let linksCsv: string = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }

    const pars: {} = {
        data: attrsCsv,
        guid: "@me",
        links: linksCsv,
        listid: "@self",
    };
    return Core.doGet(LISTDETAIL_API, pars);
}

export function createList(listName: string): Promise<People.ListNames> {
    const listObject: People.ListName = {
        links: null,
        name: listName,
        resourceType: null,
    };
    const params: {} = {
        guid: "@me",
    };

    return Core.doPost(LISTS_API, listObject, params);
}

export function deleteList(listId: string): Promise<any> {
    const params: {} = {
        guid: "@me",
        listid: listId,
    };
    return Core.doDelete(LIST_API, params);
}

export function deleteMemberFromList(listId: string, memberGuid: string): Promise<any> {
    const params: {} = {
        guid: "@me",
        listid: listId,
        memberguid: memberGuid,
    };
    return Core.doDelete(LIST_MEMBER_API, params);
}

export function addMemberToList(
    listId: string,
    memberGuid: string,
    message?: string): Promise<People.ListMember> {
    /*
     Adding a member to a listId = '@connections' will send an invite to the user before adding to the connections list
     */
    const listMember: People.ListMember = {
        guid: memberGuid,
        message,
        links: null,
        resourceType: null,
    };

    const pars: {} = {
        guid: "@me",
        listid: listId,
    };
    return Core.doPost(LISTDETAIL_API, listMember, pars);
}

export function getPerson(query: string, data?: string, links?: string): Promise<People.Person> {
    /*
     * data – A standard set that returns all the standard data for the response, but does not include status, manager, reportees, or photos.
     * 1. If both the projection and data query string parameters are present, the data parameter will be used to determine which data to return.
     * 2. If you specify the constant 'data' as the data parameter, all the basic information will be returned for the resource.
     * 3. The data parameter can also take any of the following values comma-separated values to return the corresponding data:
     *      guid, id, displayName, birthday, language, timeZone, name, addresses, organizations, workEmail, phoneNumbers, manager, reportees, photos, and/or status.
     *
     * The data parameter can also take a predefined set parameter like basic. For example, if you specify data=basic, it is the equivalent of specifying data=guid, id, displayName.
     * You can also specify additional parameters as needed. For example, you could specify data=basic,birthday.
     */

    /*
     * links - links – A standard set that returns all the standard links for the response, but does not include status, manager, reportees, or photos.
     * If both the projection and links query string parameters are present, the links parameter will be used to determine which links to return.
     * If you specify the constant 'links' as the links parameter, all the basic information will be returned for the resource.
     *
     * The links parameter also takes zero or more of the following comma-separated parameter:
     *      person, profile, icon, status, messageBoard, activities, personActivities, connectionActivities, connections, listNames, invitation, givenFeedback, receivedFeedback, userGivenFeedback, manager, reportees, and/or member.
     *
     * The links parameter can also take a predefined set parameter like basic. For example, if you specify data=basic, it is the equivalent of specifying data=guid, id, displayName.
     * You can also specify additional parameters as needed. For example, you could specify data=basic,birthday.
     */

    /*
     * query formats are
     * loginid:equals:<loginid>
     * guid:equals:<guid>
     * email:equals:<email>
     */

    if (!data) {
        data = `basic,
                birthday,
                language,
                timeZone,
                name,
                addresses,
                organizations,
                workEmail,
                phoneNumbers,
                manager,
                reportees,
                photos,
                status`;
    }

    if (!links) {
        links = `person,
                profile,
                icon,
                status,
                messageBoard,
                activities,
                personActivities,
                connectionActivities,
                connections,
                listNames,
                invitation,
                givenFeedback,
                receivedFeedback,
                userGivenFeedback,
                manager,
                reportees,
                member`;
    }

    const params: {} = {
        q: query,
        data,
        links,
    };

    return Core.getResourceUrl("urn:oracle:webcenter:people:person", null).then((url: string) => {
        const resPromise: any = axios.get(url, {
            params,
        });
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

export function getPersonByLoginId(
    loginId: string,
    attrs?: string[],
    links?: string[]): Promise<People.Person> {
    let attrsCsv: string = "";
    let linksCsv: string = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }

    if (loginId) {
        const query: string = "loginid:equals:" + loginId;
        return this.getPerson(query, attrsCsv, linksCsv);
    }
}

export function getPersonByGuid(guid: string, attrs?: string[], links?: string[]): Promise<People.Person> {
    let attrsCsv: string = "";
    let linksCsv: string = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }

    const query: string = "guid:equals:" + guid;
    return this.getPerson(query, attrsCsv, linksCsv);
}

export function getPersonByEmail(email: string, attrs?: string[], links?: string[]): Promise<People.Person> {
    let attrsCsv: string = "";
    let linksCsv: string = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }

    const query: string = "email:equals:" + email;
    return this.getPerson(query, attrsCsv, linksCsv);
}

export function getStatus(userGuid: string = "@me"): Promise<People.StatusItem> {
    const pars: {} = {
        guid: "@me",
    };
    return Core.doGet(STATUS_API, pars);
}
export function updateStatus(message: string): Promise<People.StatusItem> {
    const statusItem: People.StatusItem = {
        links: null,
        note: message,
        resourceType: null,
    };
    const pars: {} = {
        guid: "@me",
    };
    return Core.doPut(STATUS_API, statusItem, pars);
}

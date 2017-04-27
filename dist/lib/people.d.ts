import * as Feedback from "./types/feedback";
import * as People from "./types/people";
/**
 * Get Received [Invitations](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDCHBDB) for the logged in User
 * @returns a Http Promise that will resolve to InvitationList
 */
export declare function getReceivedInvitations(startIndex?: number, itemsPerPage?: number): Promise<People.InvitationList>;
/**
 * Get Sent [Invitations](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDCHBDB) for the logged in User
 * @returns a Http Promise that will resolve to InvitationList
 */
export declare function getSentInvitations(startIndex?: number, itemsPerPage?: number): Promise<People.InvitationList>;
/**
 * Accept an [Invitation](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDECDDG) by its Id
 * @param inviteId Invitation ID, once of the invitation from [[getReceivedInvitations]]
 */
export declare function acceptInvite(inviteId: string): Promise<any>;
export declare function ignoreInvite(inviteId: string): Promise<any>;
export declare function deleteInvite(inviteId: string): Promise<any>;
export declare function createInvite(userGuid: string, invitationMessage: string): Promise<void>;
export declare function getListNames(): Promise<People.ListNames>;
export declare function getReceivedFeedback(guid?: string, startIndex?: number, itemsPerPage?: number): Promise<Feedback.FeedbackEntryList>;
export declare function getGivenFeedback(guid?: string, startIndex?: number, itemsPerPage?: number): Promise<Feedback.FeedbackEntryList>;
export declare function createFeedback(feedback: string, receiverGuid: string): Promise<Feedback.FeedbackEntryItem>;
export declare function deleteFeedback(mid: string, guid?: string): Promise<Feedback.FeedbackEntryItem>;
export declare function getPersonList(listId?: string, attrs?: string[], links?: string[], projection?: string, startIndex?: number, itemsPerPage?: number): Promise<People.PersonList>;
export declare function getConnections(startIndex?: number, itemsPerPage?: number): Promise<People.PersonList>;
export declare function getSelf(attrs?: string[], links?: string[]): Promise<People.Person>;
export declare function createList(listName: string): Promise<People.ListNames>;
export declare function deleteList(listId: string): Promise<any>;
export declare function deleteMemberFromList(listId: string, memberGuid: string): Promise<any>;
export declare function addMemberToList(listId: string, memberGuid: string, message?: string): Promise<People.ListMember>;
export declare function getPerson(query: string, data?: string, links?: string): Promise<People.Person>;
export declare function getPersonByLoginId(loginId: string, attrs?: string[], links?: string[]): Promise<People.Person>;
export declare function getPersonByGuid(guid: string, attrs?: string[], links?: string[]): Promise<People.Person>;
export declare function getPersonByEmail(email: string, attrs?: string[], links?: string[]): Promise<People.Person>;
export declare function getStatus(userGuid?: string): Promise<People.StatusItem>;
export declare function updateStatus(message: string): Promise<People.StatusItem>;

import { Chance } from "chance";
import WebCenter from "../lib";
import {init, logout } from "./common";

import {
  FeedbackEntryList,
  Forums,
  InvitationList,
  ListName,
  ListNames,
  Person,
  PersonList,
  StatusItem,
  WallMessageItem,
  WallMessageList} from "../lib";

const chance: any = new Chance();

let listName: string;
let status: string;
let message: string;
let messageId: string;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(init);
afterAll(logout);

describe("People", () => {

  it("Update Status", (done: any) => {
    status = chance.sentence();
    WebCenter.People.updateStatus(status).then((statusItem: StatusItem) => {
      expect(statusItem.note).toBe(status);
      done();
    }, (error: any) => {
      fail("Failed to update Status");
      done();
    });
  }, 10000);

  it("Get Received Invitations", (done: any) => {
    WebCenter.People.getReceivedInvitations().then((invitationList: InvitationList) => {
      expect(invitationList.resourceType).toBe("urn:oracle:webcenter:people:invitations");
      done();
    }, (error: any) => {
      fail("Failed to Get Received Invitations.");
      done();
    });
  }, 10000);

  it("Get Sent Invitations", (done: any) => {
    WebCenter.People.getSentInvitations().then((invitationList: InvitationList) => {
      expect(invitationList.resourceType).toBe("urn:oracle:webcenter:people:invitations");
      done();
    }, (error: any) => {
      fail("Failed to Get Sent Invitations.");
      done();
    });
  }, 10000);

  it("Create List", (done: any) => {
    listName = chance.word({length: 10});
    WebCenter.People.createList(listName).then((listNames: ListNames) => {
      expect(listNames.resourceType).toBeDefined();
      done();
    }, (error: any) => {
      fail("Failed to Get Self.");
      done();
    });
  }, 10000);

  it("Get List Names", (done: any) => {
    WebCenter.People.getListNames().then((listNames: ListNames) => {
      if (listNames && listNames.items.length > 0) {
        const filteredListNames: ListName[] = listNames.items.filter(
          (lName: ListName) => {
            return (lName.name === listName);
          });
        expect(filteredListNames.length).toBe(1);
        done();
      }else {
        fail("Get List Names is Empty.");
        done();
      }
    }, (error: any) => {
      fail("Failed to Get List Names.");
      done();
    });
  }, 10000);

  it("Get Received Feedback", (done: any) => {
    WebCenter.People.getReceivedFeedback().then((feedbackList: FeedbackEntryList) => {
      expect(feedbackList.resourceType).toBe("urn:oracle:webcenter:feedback");
      done();
    }, (error: any) => {
      fail("Failed to Get Received Feedback.");
      done();
    });
  }, 10000);

  it("Get Given Feedback", (done: any) => {
    WebCenter.People.getGivenFeedback().then((feedbackList: FeedbackEntryList) => {
      expect(feedbackList.resourceType).toBe("urn:oracle:webcenter:feedback");
      done();
    }, (error: any) => {
      fail("Failed to Get Given Feedback.");
      done();
    });
  }, 10000);

  it("Get Connections", (done: any) => {
    WebCenter.People.getConnections().then((personList: PersonList) => {
      expect(personList.resourceType).toBe("urn:oracle:webcenter:people:person:list");
      done();
    }, (error: any) => {
      fail("Failed to Get Connections.");
      done();
    });
  }, 10000);

  it("Get Self", (done: any) => {
    WebCenter.People.getSelf().then((person: Person) => {
      expect(person.resourceType).toBe("urn:oracle:webcenter:people:person");
      done();
    }, (error: any) => {
      fail("Failed to Get Self.");
      done();
    });
  }, 10000);

  it("Delete List by Name", (done: any) => {
    WebCenter.People.deleteList(listName).then((res: any) => {
      done();
    }, (error: any) => {
      fail("Failed to Delete List with Name : " + listName);
      done();
    });
  }, 10000);

  it("Get Status", (done: any) => {
    WebCenter.People.getStatus().then((statusItem: StatusItem) => {
      expect(statusItem.note).toBe(status);
      done();
    }, (error: any) => {
      fail("Failed to Get Status");
      done();
    });
  }, 10000);

  it("Post to Message Board", (done: any) => {
    message = chance.sentence();
    WebCenter.Wall.postMessage(message).then((messageItem: WallMessageItem) => {
      messageId = messageItem.id;
      expect(messageId).toBeDefined();
      expect(messageItem.body).toBe(message);
      done();
    }, (error: any) => {
      fail("Failed to Post message board");
      done();
    });
  }, 10000);

  it("Get Message Board", (done: any) => {
    WebCenter.Wall.getMessageBoard().then((messageList: WallMessageList) => {
      let messageItem: WallMessageItem = messageList.items[0];
      expect(messageItem.id).toBe(messageId);
      done();
    }, (error: any) => {
      fail("Failed to get Message Board");
      done();
    });
  }, 10000);

  it("Get Message by ID", (done: any) => {
    WebCenter.Wall.getUserMessage(messageId).then((messageItem: WallMessageItem) => {
      expect(messageItem.id).toBe(messageId);
      expect(messageItem.body).toBe(message);
      done();
    }, (error: any) => {
      fail("Failed to get Message by ID");
      done();
    });
  }, 10000);

  xit("Update Message by ID", (done: any) => {
    message = chance.sentence();
    let messageItem: WallMessageItem = {
      body: message,
      id: messageId,
      link: null,
      visibilityType: WebCenter.Wall.getVisibility(),
    };

    WebCenter.Wall.updateUserMessage(messageItem).then((mesgItem: WallMessageItem) => {
      expect(mesgItem.id).toBe(messageId);
      expect(mesgItem.body).toBe(message);
      done();
    }, (error: any) => {
      fail("Failed to update Message by ID");
      done();
    });
  }, 10000);

  it("Delete Message by ID", (done: any) => {
    WebCenter.Wall.deleteUserMessage(messageId).then((res: any) => {
      done();
    }, (error: any) => {
      fail("Delete to get Message by ID");
      done();
    });
  }, 10000);

});

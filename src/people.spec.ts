import { Chance } from "chance";
import WebCenter from ".";

const chance: any = new Chance();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(() => {
    const restBaseUrl: string = "http://krowddev.darden.com/rest";
    const wcBaseUrl: string = "http://krowddev.darden.com/webcenter";
    const csBaseUrl: string = "http://krowddev.darden.com/cs";

    WebCenter.Config.setRestBaseUrl(restBaseUrl);
    // WebCenter.Config.setWcBaseUrl(wcBaseUrl);
    // WebCenter.Config.setCsBaseUrl(csBaseUrl);

    const username: string = "880690388";
    const password: string = "Darden88";

    WebCenter.Auth.setUserName(username);
    WebCenter.Auth.setPassword(password);

    expect(restBaseUrl).toBe(WebCenter.Config.getRestBaseUrl());
});

afterAll(() => {
    WebCenter.Auth.logout();
    expect(true).toBe(true);
});

describe("People", () => {

  it("Get Received Invitations", (done: any) => {
    WebCenter.People.getReceivedInvitations().then((invitationList: WebCenter.People.InvitationList) => {
        expect(invitationList.resourceType).toBe("urn:oracle:webcenter:people:invitations");
        done();
    }, (error: any) => {
      fail("Failed to Get Received Invitations.");
      done();
    });
  }, 10000);

  it("Get Sent Invitations", (done: any) => {
    WebCenter.People.getSentInvitations().then((invitationList: WebCenter.People.InvitationList) => {
        expect(invitationList.resourceType).toBe("urn:oracle:webcenter:people:invitations");
        done();
    }, (error: any) => {
      fail("Failed to Get Sent Invitations.");
      done();
    });
  }, 10000);

  it("Get List Names", (done: any) => {
    WebCenter.People.getListNames().then((listNames: WebCenter.People.ListNames) => {
        expect(listNames.resourceType).toBe("urn:oracle:webcenter:people:person:listNames");
        done();
    }, (error: any) => {
      fail("Failed to Get List Names.");
      done();
    });
  }, 10000);

  it("Get Received Feedback", (done: any) => {
    WebCenter.People.getReceivedFeedback().then((feedbackList: WebCenter.Feedback.FeedbackEntryList) => {
        expect(feedbackList.resourceType).toBe("urn:oracle:webcenter:feedback");
        done();
    }, (error: any) => {
      fail("Failed to Get Received Feedback.");
      done();
    });
  }, 10000);

  it("Get Given Feedback", (done: any) => {
    WebCenter.People.getGivenFeedback().then((feedbackList: WebCenter.Feedback.FeedbackEntryList) => {
        expect(feedbackList.resourceType).toBe("urn:oracle:webcenter:feedback");
        done();
    }, (error: any) => {
      fail("Failed to Get Given Feedback.");
      done();
    });
  }, 10000);

  it("Get Connections", (done: any) => {
    WebCenter.People.getConnections().then((personList: WebCenter.People.PersonList) => {
        expect(personList.resourceType).toBe("urn:oracle:webcenter:people:person:list");
        done();
    }, (error: any) => {
      fail("Failed to Get Connections.");
      done();
    });
  }, 10000);

  it("Get Self", (done: any) => {
    WebCenter.People.getSelf().then((person: WebCenter.People.Person) => {
        expect(person.resourceType).toBe("urn:oracle:webcenter:people:person");
        done();
    }, (error: any) => {
      fail("Failed to Get Connections.");
      done();
    });
  }, 10000);

});

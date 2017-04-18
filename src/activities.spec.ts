import { Chance } from "chance";
import WebCenter from ".";

const chance: any = new Chance();

let postedMessageId: string;
let activityId: string;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(() => {
    const restBaseUrl: string = "http://krowddev.darden.com/rest";
    const wcBaseUrl: string = "http://krowddev.darden.com/webcenter";
    const csBaseUrl: string = "http://krowddev.darden.com/cs";

    WebCenter.Config.setRestBaseUrl(restBaseUrl);
    WebCenter.Config.setWcBaseUrl(wcBaseUrl);
    WebCenter.Config.setCsBaseUrl(csBaseUrl);

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

/*
  serviceId: 'oracle.webcenter.peopleconnections.wall',
  activityType: 'postself', 
*/

describe("Activity Stream", () => {
  postedMessageId = null;
  it("Post", (done: any) => {
    WebCenter.Wall.postMessage(chance.sentence()).then((messageItem: WebCenter.Wall.WallMessageItem) => {
        postedMessageId = messageItem.id;
        expect(postedMessageId).toBeDefined();
        done();
    }, (error: any) => {
      fail("Failed to Wall post.");
      done();
    });
  }, 10000);

  it("Message By ID", (done: any) => {
    WebCenter.Wall.getUserMessage(postedMessageId).then((messageItem: WebCenter.Wall.WallMessageItem) => {
        expect(messageItem.id).toBe(postedMessageId);
        done();
    }, (error: any) => {
      fail("Failed to find Wall post with ID : " + postedMessageId);
      done();
    });
  }, 10000);

  it("Get Activity for Posted Message", (done: any) => {
    activityId = null;
    WebCenter.ActivityStream.getActivities().then((activities: WebCenter.ActivityStream.ActivityList) => {
      if (activities && activities.items && activities.items.length > 0 ) {
        const filteredActivities: WebCenter.ActivityStream.Activity[] = activities.items.filter(
          (activity: WebCenter.ActivityStream.Activity) => {
            let res: boolean = false;
            const templateParams: WebCenter.ActivityStream.TemplateParameters  = activity.templateParams;
            if (templateParams && templateParams.items && templateParams.items.length > 0) {
              const filteredTParams: WebCenter.ActivityStream.Parameter [] = templateParams.items.filter(
                (param: WebCenter.ActivityStream.Parameter) => {
                  if (((postedMessageId === param.id) && (activity.id === param.activityId))) {
                    activityId = activity.id;
                    return true;
                  } else {
                    return false;
                  }
              });
              if (filteredTParams.length === 1) {
                res = true;
              }
            }
            return res;
        });
        expect(filteredActivities.length).toBe(1);
        done();
      }else {
        fail("Get Activities Failed");
        done();
      }
    }, (error: any) => {
      fail("Get Activities Failed");
      done();
    });
  }, 10000);

  it("Activity By ID", (done: any) => {
    WebCenter.ActivityStream.getActivity(activityId).then((activity: WebCenter.ActivityStream.Activity) => {
        console.log(activity);
        expect(activity.id).toBe(activityId);
        done();
    }, (error: any) => {
      fail("Failed to Get Activity By ID :" + activityId);
      done();
    });
  }, 10000);

  it("Create Activity Comment", (done: any) => {
    WebCenter.ActivityStream.getActivityCommentsSummary(activityId).then(
      (commentsSummaryItem: WebCenter.ActivityStream.CommentsSummaryItem) => {
        expect(true).toBe(true);
        done();
    }, (error: any) => {
      fail("Failed to Get Activity Comments Summary for Activity ID : " + activityId);
      done();
    });
  }, 10000);

  it("Get Activity Comments Summary", (done: any) => {
    WebCenter.ActivityStream.getActivityCommentsSummary(activityId).then(
      (commentsSummaryItem: WebCenter.ActivityStream.CommentsSummaryItem) => {
        expect(true).toBe(true);
        done();
    }, (error: any) => {
      fail("Failed to Get Activity Comments Summary for Activity ID : " + activityId);
      done();
    });
  }, 10000);

  it("Get Comments Summary by Object ID & Type", (done: any) => {
    WebCenter.ActivityStream.getCommentsSummary(
      "oracle.webcenter.peopleconnections.wall",
      "message",
      postedMessageId).then(
      (commentsSummaryItem: WebCenter.ActivityStream.CommentsSummaryItem) => {
        expect(true).toBe(true);
        done();
    }, (error: any) => {
      fail("Failed to Get Comments Summary.");
      done();
    });
  }, 10000);

  it("Delete Message By ID", (done: any) => {
        WebCenter.Wall.deleteUserMessage(postedMessageId).then((res: any) => {
            expect(true).toBe(true);
            done();
        }, (error: any) => {
          fail("Failed to Delete Message By ID.");
          done();
        });
      }, 10000);

  // This test case is failing since there is no DELETE method in WebCenter REST API
  it("Delete Activity By ID", (done: any) => {
      WebCenter.ActivityStream.deleteActivity(activityId).then((res: any) => {
          expect(true).toBe(true);
          done();
      }, (error: any) => {
        fail("Failed to Delete Activity By ID.");
        done();
      });
    }, 10000);


  /* it("Post Activity", (done: any) => {
      const payload: WebCenter.ActivityStream.Activity = {
        activityType: "postself",
        detail: chance.sentence(),
        scope: null,
        serviceId: "oracle.webcenter.peopleconnections.wall",
        templateParams: {
          items: [
            {
              guid: "@me",
            },
          ],
        },
      };
      WebCenter.ActivityStream.createActivity(payload).then((activity: WebCenter.ActivityStream.Activity) => {
          expect(activity.id).toBeDefined();
          done();
      }, (error: any) => {
        fail("Failed to Wall post.");
        done();
      });
    }, 10000);
    */

  

});

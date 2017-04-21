import { Chance } from "chance";
import WebCenter from "../lib";
import {init, logout } from "./common";

const chance: any = new Chance();

let postedMessageId: string;
let activityId: string;
let commentId: string;
let likeId: string;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(init);
afterAll(logout);

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

  it("Create Activity Comment", (done: any) => {
    const comment: WebCenter.ActivityStream.CommentItem = {
      text: chance.sentence(),
    };
    WebCenter.ActivityStream.createActivityCommment(activityId, comment).then(
      (res: WebCenter.ActivityStream.CommentItem) => {
        commentId = res.id;
        expect(res.id).toBeDefined();
        done();
    }, (error: any) => {
      fail("Failed to Create Activity Comment for Activity ID :" + activityId);
      done();
    });
  }, 10000);

  it("Activity By ID", (done: any) => {
    WebCenter.ActivityStream.getActivity(activityId).then((activity: WebCenter.ActivityStream.Activity) => {
        expect(activity.id).toBe(activityId);
        done();
    }, (error: any) => {
      fail("Failed to Get Activity By ID :" + activityId);
      done();
    });
  }, 10000);

  it("Get Activity Comments Summary", (done: any) => {
    WebCenter.ActivityStream.getActivityCommentsSummary(activityId).then(
      (commentsSummaryItem: WebCenter.ActivityStream.CommentsSummaryItem) => {
        expect(commentsSummaryItem.count).toBe(1);
        done();
    }, (error: any) => {
      fail("Failed to Get Activity Comments Summary for Activity ID : " + activityId);
      done();
    });
  }, 10000);

  it("Get Comments Summary by Object ID & Type", (done: any) => {
      WebCenter.ActivityStream.getCommentsSummary(
        "oracle.webcenter.activitystreaming",
        "activity",
        activityId).then(
        (commentsSummaryItem: WebCenter.ActivityStream.CommentsSummaryItem) => {
          expect(commentsSummaryItem.count).toBe(1);
          done();
      }, (error: any) => {
        fail("Failed to Get Comments Summary for Activity ID : " + activityId);
        done();
      });
    }, 10000);

  it("Delete Activity Comment By ID", (done: any) => {
    WebCenter.ActivityStream.deleteActivityComment(activityId, commentId).then((res: any) => {
        expect(true).toBe(true);
        done();
    }, (error: any) => {
      fail("Failed Delete Activity Comment By ID :" + commentId);
      done();
    });
  }, 10000);

  it("Create Activity Like", (done: any) => {
    const like: WebCenter.ActivityStream.LikeItem = {
    };
    WebCenter.ActivityStream.createActivityLike(activityId, like).then(
      (res: WebCenter.ActivityStream.LikeItem) => {
        likeId = res.id;
        expect(res.id).toBeDefined();
        done();
    }, (error: any) => {
      fail("Failed to Create Activity Like for Activity ID :" + activityId);
      done();
    });
  }, 10000);

  it("Get Activity Likes Summary", (done: any) => {
    WebCenter.ActivityStream.getActivityLikesSummary(activityId).then(
      (likesSummaryItem: WebCenter.ActivityStream.LikesSummaryItem) => {
        expect(likesSummaryItem.count).toBe(1);
        done();
    }, (error: any) => {
      fail("Failed to Get Activity Likes Summary for Activity ID : " + activityId);
      done();
    });
  }, 10000);

  it("Get Likes Summary by Object ID & Type", (done: any) => {
      WebCenter.ActivityStream.getLikesSummary(
        "oracle.webcenter.activitystreaming",
        "activity",
        activityId).then(
        (likesSummaryItem: WebCenter.ActivityStream.LikesSummaryItem) => {
          expect(likesSummaryItem.count).toBe(1);
          done();
      }, (error: any) => {
        fail("Failed to Get Likes Summary for Activity ID : " + activityId);
        done();
      });
    }, 10000);

  it("Delete Activity Like By ID", (done: any) => {
    WebCenter.ActivityStream.deleteActivityLike(activityId, likeId).then((res: any) => {
        expect(true).toBe(true);
        done();
    }, (error: any) => {
      fail("Failed Delete Activity Like By ID :" + likeId);
      done();
    });
  }, 10000);

  it("Get Activity by ID & Process", (done: any) => {
    WebCenter.ActivityStream.getActivity(activityId).then((activity: WebCenter.ActivityStream.Activity) => {
        const processedActivity: any = WebCenter.ActivityStream.processActivity(activity);
        expect(processedActivity.messageParts).toBeDefined();
        done();
    }, (error: any) => {
      fail("Failed to Get Activity By ID :" + activityId);
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
  /*it("Delete Activity By ID", (done: any) => {
      WebCenter.ActivityStream.deleteActivity(activityId).then((res: any) => {
          expect(true).toBe(true);
          done();
      }, (error: any) => {
        fail("Failed to Delete Activity By ID.");
        done();
      });
    }, 10000);*/
});

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const init = require("./init");
const { db } = require("./firebase");
const conversationTool = require("./conversation");
const messenger = require("./messenger");
const appSert = "508a4f9750fc6ddc002b1d96cd13a305";

const runtimeOpts = {
  timeoutSeconds: 13,
  memory: "128MB"
};

exports.remote = functions.runWith(runtimeOpts).region("asia-northeast1");

exports.initGroups = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .database.ref("/users/{userId}/dkmh")
  .onWrite(async (change, context) => {
    const idUser = context.params.userId;
    try {
      const r = await init.initGroups(idUser,change);
      // more task
      if (r) {
        return db.ref("users/" + idUser + "/init").update({
          group: true
        });
      } else {
        return db.ref("users/" + idUser + "/init").update({
          group: false
        });
      }
    } catch (error) {
      console.log(error);
      return db.ref("users/" + idUser + "/init").update({
        group: false
      });
    }


  });

exports.initUser = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .database.ref("/users/{userId}/")
  .onCreate(async (snapshot, context) => {
    const user = snapshot.val();
    const idUser = context.params.userId;
    try {
      await init.initChatTong(user);
      return db.ref("users/" + idUser + "/init").update({
        chattong: true
      });
    } catch (error) {
      console.log(error);
      return db.ref("users/" + idUser + "/init").update({
        chattong: false
      });
    }
  });

exports.changeTimestampConversation = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .database.ref("/room_names/{roomId}/timestamp")
  .onUpdate(async (change, context) => {
    const timestamp = change.after.val();
    const rommId = context.params.roomId;
    try {
      await conversationTool.updateTimestamp(rommId, timestamp);
    } catch (error) {
      console.log(error);
    }
  });


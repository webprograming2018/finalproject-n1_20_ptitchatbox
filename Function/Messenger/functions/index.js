const functions = require("firebase-functions");
const conversationTool = require("./conversation");
const { db } = require("./firebase");
const appSert = "8fb31491b282da2b8731c33e62605c14";
const messenger = require("./messenger");

const runtimeOpts = {
  timeoutSeconds: 13,
  memory: "128MB"
};


exports.closeRoom = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .database.ref("/room_names/{roomId}/isClose")
  .onWrite(async (change, context) => {
    if (!change.after.exists()) {
      return;
    }
    const after = change.after.val();
    const rommId = context.params.roomId;
    const closerNap = await db
      .ref("room_names/" + rommId + "/closer")
      .once("value");
    const closer = closerNap.val();
    const task = [];
    if (after === true) {
      const fillRoom = await db
        .ref("forward/")
        .orderByChild("conversation_id")
        .equalTo(rommId)
        .once("value");

      fillRoom.forEach(item => {
        task.push(db.ref("forward/" + item.key + "/conversation_id").remove());
        const data = item.val();
        if (data.psid && item.key !== closer) {
          messenger.sendAPI.sendNotifi(
            data.psid,
            "Bot",
            "Cuộc trò với người lạ của bạn đã kết thúc"
          );
        }
      });
    }
  });

exports.messageAdd = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .database.ref("/messages/{roomId}/{messageId}")
  .onCreate(async (snapshot, context) => {
    const message = snapshot.val();
    const rommId = context.params.roomId;

    try {
      await Promise.all([
        conversationTool.handleMessageAdd(rommId, message),
        conversationTool.forwardMessage(rommId, message)
      ]);
    } catch (error) {
      console.log(error);
    }
  });

  exports.connectMessenger = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .database.ref("/connectmessenger/{mssvHash}")
  .onWrite(async (change, context) => {
    const mssvHash = context.params.mssvHash;

    let data = null;
    
    if (change.before.exists()&&change.after.exists()) {
      //change
      data = change.after.val();
      //return null;
    }
    // Exit when the data is deleted.
    if (!change.after.exists()) {
      //delete
      const task = [];
      const data = change.before.val();
      if(data.psid){
        const mssvSnap = await db.ref("users/"+mssvHash+"/mssv").once("value");
        const mssv = mssvSnap.val();
        task.push(messenger.sendAPI.sendNotifi(
          data.psid,
          "Bot",
          `Bot đã ngắt kết nối với sinh viên: ${mssv}.`
        ));
      }
      task.push(db.ref("forward/"+mssvHash+"/psid").remove());
      
      return Promise.all(task);
    }

    if (!change.before.exists()&&change.after.exists()) {
      //create
      data = change.after.val();
      //return null;
    }
    
    if(!data||!data.signed_request){
      return null;
    }else{



      const result = messenger.parse_signed_request(data.signed_request,appSert);

      const filterUser =await  db.ref("forward/").orderByChild('psid').equalTo(result.psid).once('value');
      const task = [];

      const taskpre = await Promise.all([
        db.ref("forward/"+mssvHash+"/psid").once("value"),
        db.ref("users/"+mssvHash+"/mssv").once("value")
      ]);


      const psidold = taskpre[0].val();
      const mssv = taskpre[1].val();

      filterUser.forEach((item)=>{
        tash.push(db.ref("forward/"+item.key+"/psid").remove());
      })

      await Promise.all(task);

      const task2 = [];

      task2.push(db.ref("forward/"+mssvHash).update({
        psid:result.psid
      }));

      if(psidold!==result.psid){
        task2.push(messenger.sendAPI.sendNotifi(
          result.psid,
          "Bot",
          `Bot đã kết nối với sinh viên: ${mssv}`
        ));
        if(psidold){
          task2.push(messenger.sendAPI.sendNotifi(
            psidold,
            "Bot",
            `Bot đã ngắt kết nối với sinh viên: ${mssv}.`
          ));
        }
      }
      return Promise.all(task2);
    }
  });

  exports.sendToBot = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const linking = await db.ref("linkid/"+uid).once("value");
    const id = linking.val();
    const psidSnap = await db.ref("forward/"+id+"/psid").once("value");
    const psid = psidSnap.val();
    messenger.sendAPI.sendNotifi(
      psid,
      "Bot",
      `${data.message}`
    );
  })

// (async function() {
//   const after = true;
//   const before = false;
//   const rommId = "-LUJxlqIdpe_h6k1prpe";
//   const closerNap = await db
//     .ref("room_names/" + rommId + "/closer")
//     .once("value");
//   const closer = closerNap.val();
//   const task = [];
//   if (after === true && !before) {
//     const fillRoom = await db
//       .ref("forward/")
//       .orderByChild("conversation_id")
//       .equalTo(rommId)
//       .once("value");

//     fillRoom.forEach(item => {
//       task.push(db.ref("forward/" + item.key + "/conversation_id").remove());
//       const data = item.val();
//       if (data.psid && closer && item.key !== closer) {
//         messenger.sendAPI.sendNotifi(
//           data.psid,
//           "Bot",
//           "Cuộc trò chuyện đã đóng lại"
//         );
//       }
//     });
//   }
// })();

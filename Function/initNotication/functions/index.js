const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { db } = require("./firebase");

const runtimeOpts = {
  timeoutSeconds: 13,
  memory: "128MB"
};

exports.remote = functions.runWith(runtimeOpts).region("asia-northeast1");

exports.initNotification = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .database.ref("/fcmTokens/{token}")
  .onCreate(async (snapshot, context) => {
    const token = context.params.token;
    console.log("Token: "+token);
    try {
	    const message = {
	        webpush: {
	          notification: {
	            title: "Register notification success !",
	            body: "App đã xin được quyền để gửi thông báo cho bạn",
	            requireInteraction: true,
	            icon: "/badge-icon.png"
	          }
	        },
	        token: token
	     };
		admin.messaging().send(message)
		  .then((response) => {
		    // Response is a message ID string.
		    console.log('Successfully sent message:', response);
		})
		.catch((error) => {
		    console.log('Error sending message:', error);
		});
    } catch (error) {
      console.log(error);
    }
  });

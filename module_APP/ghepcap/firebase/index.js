//server
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatbox-ver4.firebaseio.com"
});

const firestore = admin.firestore();
const firebase = admin.database();
firestore.settings({ timestampsInSnapshots: true });

module.exports = {
  admin,
  firebase
};

//server
const admin = require("firebase-admin");

/*const functions = require("firebase-functions");

admin.initializeApp(functions.config().firebase);*/

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatbox-ver4.firebaseio.com"
});

const db = admin.database();

module.exports = {
    admin,
    db
}

const {db} = require("./firebase");

db.ref("/qldt").once('value').then((data)=>{
    console.log(Object.keys(data.val()).length);
});

// (async () => {
//     await db.ref("andanh").remove();
//     await   db.ref("connectmessenger").remove();
//     await  db.ref("conversation").remove();
//     await  db.ref("forward").remove();
//     await   db.ref("inbound").remove();
//     await   db.ref("members").remove();
//     await  db.ref("messages").remove();
//     await   db.ref("metadata").remove();
//     await   db.ref("privatemember").remove();
    
//     await   db.ref("public").remove();
//     await   db.ref("room_names").remove();
//     await   db.ref("status").remove();
//     await   db.ref("users").remove();
//     await  db.ref("linkid").remove();
//     await  db.ref("fcmTokens").remove();
//     await  db.ref("tailieu").remove();
//     await   db.ref("topicnotification").remove();
//     await  db.ref("metadata").remove();
//     console.log("xong");
// })()


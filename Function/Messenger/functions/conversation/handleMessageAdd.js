const { db } = require("../firebase");

module.exports = handleMessageAdd;

async function handleMessageAdd(conversation_id, message) {
  const memberSnap = await db
    .ref("privatemember/" + conversation_id)
    .once("value");

  const {members} = memberSnap.val();
  const timestamp = message.timestamp;
  const latestMessage = getLatestMessage(message);
  const latestUserReply = message.author;

  const task = [];

  //update timestamp cua conversation

  task.push(
    db.ref("room_names/" + conversation_id).update({
      timestamp,
      latestMessage,
      latestUserReply
    })
  );

  // trigger cho cac user

  for (let idUser in members) {
    const obj = {
      type: "conversation",
      action: "message_add",
      payload: {
        conversation_id,
        message
      }
    };
    task.push(db.ref("inbound/" + idUser).set(obj));
  }

  return await Promise.all(task);
}

function getLatestMessage(message) {
  if (message.type === "text") {
    return message.data.text;
  } else if (message.type === "emoji") {
    return "đã gửi một emoji";
  } else if (message.type === "file" && message.file.type === "img") {
    return "đã gửi một hình ảnh";
  } else if (message.type === "file") {
    return "đã gửi một file";
  } else {
    return "đã gửi một tin nhắn";
  }
}

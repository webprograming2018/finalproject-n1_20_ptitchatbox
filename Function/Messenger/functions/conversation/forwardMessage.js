const MessengerTool = require("../messenger");
const { db } = require("../firebase");

/*db.ref("messages/6efe7da5ce07503d1a17b8c4a0c6dc32").limitToLast(1).on("child_added",(snap)=>{
    forwardMessage("6efe7da5ce07503d1a17b8c4a0c6dc32",snap.val());
})*/

module.exports = forwardMessage;

async function forwardMessage(conversation_id, message) {
  const fillRoom = await db
    .ref("forward/")
    .orderByChild("conversation_id")
    .equalTo(conversation_id)
    .once("value");

  const result = [];
  fillRoom.forEach(item => {
    result.push({
      key: item.key,
      data: item.val()
    });
  });

  // tim ra uid
  const access = await db
    .ref("room_names/" + conversation_id + "/public")
    .once("value");

  let idFill = "";
  if (access.val()) {
    if (message.type === "system" && message.action && message.action.forward) {
      idFill = message.action.user;
    } else {
      idFill = message.author;
    }
  } else {
    let uid = null;
    if (message.type === "system" && message.action && message.action.forward) {
      uid = message.action.user;
    } else {
      uid = message.author;
    }
    const linking = await db.ref("linkid/" + uid).once("value");
    idFill = linking.val();
  }

  const fillter = result.filter(
    item => item.data.psid !== undefined && item.key !== idFill
  );

  if (fillter.length === 0) {
    return;
  }

  const task = [];
  if (message.psid) {
    // day la tin nhan den tu messenger

    fillter.forEach(item => {
      task.push(handleMessenger(item.data.psid, message));
    });
  } else {
    // tin nhan den tu web

    fillter.forEach(item => {
      task.push(handleWeb(item.data.psid, message));
    });
  }

  try {
    const r = await Promise.all(task);

    if (r.length > 0 && r[0] === false) {
      return MessengerTool.sendAPI.sendNotifi(
        message.psid,
        "Bot",
        "Bot không nhận dạng được tin nhắn này. Send bởi trigger messageAdd"
      );
    }
  } catch (error) {
    return MessengerTool.sendAPI.sendNotifi(
      message.psid,
      "Bot",
      "Có lỗi khi cố gắng chuyển tiếp tin nhắn này"
    );
  }
}

async function handleMessenger(psid, message) {
  const messenger = message.messenger;
  const messagesend = {};
  if (messenger.text) {
    messagesend.text = messenger.text;
  } else if (
    messenger.attachments &&
    messenger.attachments[0].type &&
    messenger.attachments[0].payload.url
  ) {
    messagesend.attachment = {
      type: messenger.attachments[0].type,
      payload: {
        url: messenger.attachments[0].payload.url
      }
    };
  } else {
    return false;
  }
  return MessengerTool.sendAPI.sendRawBody({
    recipient: {
      id: psid
    },
    message: messagesend
  });
}

async function handleWeb(psid, message) {
  const messagesend = {};
  if (message.type === "file" && message.data.file.type === "img") {
    messagesend.attachment = {
      type: "image",
      payload: {
        url: message.data.file.url
      }
    };
  } else if (message.type === "file") {
    messagesend.attachment = {
      type: "file",
      payload: {
        url: message.data.file.url
      }
    };
  } else if (message.type === "text") {
    messagesend.text = message.data.text;
  } else if (message.type === "emoji") {
    messagesend.text = message.data.emoji;
  } else if (
    message.type === "system" &&
    message.action &&
    message.action.forward
  ) {
    if (message.action.type === "addBasicInfo") {
      MessengerTool.sendAPI.sendNotifi(
        psid,
        "Bot",
        "Người kia vừa thông thông tin của họ vào cuộc trò chuyện ( Context => Friend )"
      );
    } else if (message.action.type === "addMark") {
      MessengerTool.sendAPI.sendNotifi(
        psid,
        "Bot",
        "Người kia vừa thông thông tin của họ vào cuộc trò chuyện ( Context => Friend )"
      );
    }
    return ;
  } else {
    return false;
  }
  return MessengerTool.sendAPI.sendRawBody({
    recipient: {
      id: psid
    },
    message: messagesend
  });
}

const { db, admin } = require("../firebase");

//addMark("AUwUxdYUoxaRLpqIN6ydnZjVzXJ3","BAS1106","B14DCCN762B14DCAT091")
//addMark('GDUELIvH2xYOV4BH2nKjcKB4jOF3','BAS1106','-LRxFOCaMj1Q3nKw2r9k')
module.exports = {
  addBasicInfo,
  addMark,
  removeBasicInfo,
  removeMark
};

async function addBasicInfo(uid, iduser, att, conversation_id) {
  const Snap = await Promise.all([
    db.ref("users/" + iduser + "/" + att).once("value"),
    db.ref("room_names/" + conversation_id + "/public").once("value")
  ]);

  const value = Snap[0].val();
  const public_access = Snap[1].val();

  if (!iduser || !value) {
    throw new Error("Error remote function: addBasicInfo");
  }

  if (public_access) {

    const idUserInConversation = public_access ? iduser : uid;

    const SnapCon = await db
      .ref("members/" + conversation_id + "/" + idUserInConversation +"/access")
      .once("value");
    if (!SnapCon.val()) {
      throw new Error("Access denied when call remote function: addBasicInfo");
    }

    const name_user_snap = await db
      .ref("public/" + idUserInConversation + "/full_name")
      .once("value");
    const name_user = name_user_snap.val();
    const message = {
      timestamp: admin.database.ServerValue.TIMESTAMP,
      type: "system",
      author: "system",
      action:{
        type:"addBasicInfo",
        user:idUserInConversation,
        forward:true
      },
      data: {
        text: `${name_user} đã thêm thông tin về ${att} của họ vào cuộc trò chuyện`
      }
    };

    const obj = {};
    obj[att] = value;
    await Promise.all([
      db
        .ref(
          "members/" +
            conversation_id +
            "/" +
            idUserInConversation +
            "/basicinfo"
        )
        .update(obj),
      db.ref("messages/" + conversation_id).push(message)
    ]);
  } else {
    const idUserInConversation = uid;

    const SnapCon = await db
      .ref("andanh/" + idUserInConversation + "/conversation_id")
      .once("value");

    if (!SnapCon.val() && SnapCon.val() !== conversation_id) {
      const SnapCon = await db
        .ref("members/" + conversation_id + "/" + idUserInConversation +"/access")
        .once("value");
      if (!SnapCon.val()) {
        throw new Error(
          "Access denied when call remote function: addBasicInfo"
        );
      }
    }

    const name_user_snap = await db
      .ref("public/" + idUserInConversation + "/nick_name")
      .once("value");
    const name_user = name_user_snap.val();

    const message = {
      timestamp: admin.database.ServerValue.TIMESTAMP,
      type: "system",
      author: "system",
      action:{
        type:"addBasicInfo",
        user:idUserInConversation,
        forward:true
      },
      data: {
        text: `${name_user || 'Người kia'} đã thêm thông tin về ${att} của họ vào cuộc trò chuyện`
      }
    };

    const obj = {};
    obj[att] = value;
    await Promise.all([
      db
        .ref(
          "members/" +
            conversation_id +
            "/" +
            idUserInConversation +
            "/basicinfo"
        )
        .update(obj),
      db.ref("messages/" + conversation_id).push(message)
    ]);
  }
  return { sucess: true };
}

async function addMark(uid, iduser, msmh, conversation_id) {
  const Snap = await Promise.all([
    db.ref("users/" + iduser + "/bangdiem").once("value"),
    db.ref("room_names/" + conversation_id + "/public").once("value")
  ]);

  const bangdiem = Snap[0].val();
  const public_access = Snap[1].val();

  if (!iduser || !bangdiem) {
    throw new Error("Error remote function: addMark");
  }
  let diem = null;
  for (let i in bangdiem) {
    const namhoc = bangdiem[i];
    for (let j of namhoc) {
      if (msmh === j[1]) {
        diem = j;
        break;
      }
    }
  }
  if (!diem) {
    throw new Error("Mark not found");
  }

  if (public_access) {
    const idUserInConversation = iduser;

    const SnapCon = await db
      .ref("members/" + conversation_id + "/" + idUserInConversation +"/access")
      .once("value");
    if (!SnapCon.val()) {
      throw new Error("Access denied when call remote function: addMark");
    }

    const name_user_snap = await db
      .ref("public/" + idUserInConversation + "/full_name")
      .once("value");
    const name_user = name_user_snap.val();

    const message = {
      timestamp: admin.database.ServerValue.TIMESTAMP,
      type: "system",
      author: "system",
      action:{
        type:"addMark",
        user:idUserInConversation,
        forward:true
      },
      data: {
        text: `${name_user} thêm kết quả môn học ${msmh} của họ vào cuộc trò chuyện`
      }
    };

    const obj = {};
    obj[msmh] = diem;

    await Promise.all([
      db
        .ref(
          "members/" +
            conversation_id +
            "/" +
            idUserInConversation +
            "/bangdiem"
        )
        .update(obj),
      db.ref("messages/" + conversation_id).push(message)
    ]);
  } else {
    const idUserInConversation = uid;

    const SnapCon = await db
      .ref("andanh/" + idUserInConversation + "/conversation_id")
      .once("value");

    if (!SnapCon.val() || SnapCon.val() !== conversation_id) {
      const SnapCon = await db
        .ref("members/" + conversation_id + "/" + idUserInConversation + "/access")
        .once("value");
      if (!SnapCon.val()) {
        throw new Error(
          "Access denied when call remote function: addBasicInfo"
        );
      }
    }

    const name_user_snap = await db
      .ref("public/" + idUserInConversation + "/nick_name")
      .once("value");
    const name_user = name_user_snap.val();

    const message = {
      timestamp: admin.database.ServerValue.TIMESTAMP,
      type: "system",
      author: "system",
      action:{
        type:"addMark",
        user:idUserInConversation,
        forward:true
      },
      data: {
        text: `${name_user || 'Người kia'} thêm kết quả môn học ${msmh} của họ vào cuộc trò chuyện`
      }
    };

    const obj = {};
    obj[msmh] = diem;

    await Promise.all([
      db
        .ref(
          "members/" +
            conversation_id +
            "/" +
            idUserInConversation +
            "/bangdiem"
        )
        .update(obj),
      db.ref("messages/" + conversation_id).push(message)
    ]);
  }
  return { sucess: true };
}

async function removeBasicInfo(uid, iduser, att, conversation_id) {
  const Snap = await Promise.all([
    db.ref("room_names/" + conversation_id + "/public").once("value")
  ]);

  const public_access = Snap[0].val();

  if (!iduser) {
    throw new Error("Error remote function: addBasicInfo");
  }

  if (public_access) {
    const idUserInConversation = iduser;
    const SnapCon = await db
      .ref("members/" + conversation_id + "/" + idUserInConversation + "/access")
      .once("value");
    if (!SnapCon.val()) {
      throw new Error("Access denied when call remote function: addBasicInfo");
    }
    await db
      .ref(
        "members/" +
          conversation_id +
          "/" +
          idUserInConversation +
          "/basicinfo/" +
          att
      )
      .remove();
    return { sucess: true };
  } else {
    const idUserInConversation = uid;
    const SnapCon = await db
      .ref("andanh/" + idUserInConversation + "/conversation_id")
      .once("value");
    if (!SnapCon.val() || SnapCon.val() !== conversation_id) {
      const SnapCon = await db
        .ref("members/" + conversation_id + "/" + idUserInConversation + "/access")
        .once("value");
      if (!SnapCon.val()) {
        throw new Error(
          "Access denied when call remote function: addBasicInfo"
        );
      }
    }
    await db
      .ref(
        "members/" +
          conversation_id +
          "/" +
          idUserInConversation +
          "/basicinfo/" +
          att
      )
      .remove();
    return { sucess: true };
  }
}

async function removeMark(uid,iduser, msmh, conversation_id) {
  const Snap = await Promise.all([
    db.ref("room_names/" + conversation_id + "/public").once("value")
  ]);

  const public_access = Snap[0].val();

  if (!iduser) {
    throw new Error("Error remote function: addMark");
  }

  if (public_access) {
    const idUserInConversation = public_access ? iduser : uid;

    const SnapCon = await db
      .ref("members/" + conversation_id + "/" + idUserInConversation + "/access")
      .once("value");
    if (!SnapCon.val()) {
      throw new Error("Access denied when call remote function: addBasicInfo");
    }

    await db
      .ref(
        "members/" +
          conversation_id +
          "/" +
          idUserInConversation +
          "/bangdiem/" +
          msmh
      )
      .remove();

    return { sucess: true };
  } else {
    const idUserInConversation = uid;
    const SnapCon = await db
      .ref("andanh/" + idUserInConversation + "/conversation_id")
      .once("value");

    if (!SnapCon.val() || SnapCon.val() !== conversation_id) {
      const SnapCon = await db
        .ref("members/" + conversation_id + "/" + idUserInConversation + "/access")
        .once("value");
      if (!SnapCon.val()) {
        throw new Error(
          "Access denied when call remote function: addBasicInfo"
        );
      }
    }
    await db
      .ref(
        "members/" +
          conversation_id +
          "/" +
          idUserInConversation +
          "/bangdiem/" +
          msmh
      )
      .remove();

    return { sucess: true };
  }
}

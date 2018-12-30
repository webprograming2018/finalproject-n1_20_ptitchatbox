const { db, admin } = require("../firebase");
const HASH = require("../md5");

module.exports = initGroupChat;

//initGroupChat("abcd");

async function initGroupChat(idUser) {
  let userdata = await db.ref("users/" + idUser).once("value");
  userdata = userdata.val();

  const dkmh = userdata.dkmh;
  if (!dkmh) {
    return false;
  }

  const id = userdata.id;
  const mssv = userdata.mssv;
  const ten_sv = userdata.ten_sv;
  const task = [];

  await db.ref("public/" + id).update({
    class: userdata.lop,
    full_name: userdata.ten_sv
  });

  for (let msmh in dkmh) {
    const mh = dkmh[msmh];
    const conversation_id = getIdConversationFromMaLop(mh);
    const tenmh = mh.tenMh;
    const nmh = mh.NMH;
    //await joinGroups(id, conversation_id, mssv, ten_sv, tenmh, nmh);

    task.push(joinGroups(id, conversation_id, mssv, ten_sv, tenmh, nmh));
  }
  console.log("init groups success");
  try {
    await Promise.all(task);
  } catch (error) {
    debugger;
  }

  return true;
}

function getIdConversationFromMaLop(mh) {
  const maLop = mh.maLop;
  return HASH(maLop);
}

async function joinGroups(id, conversation_id, mssv, nameSV, tenMh, nmh) {
  const snapCon = await db.ref("room_names/" + conversation_id).once("value");
  const conversation = snapCon.val();
  const task = [];

  const _member = await db
    .ref("members/" + conversation_id + "/" + id)
    .once("value");

  if (_member.val()) {
    return;
  }

  if (!conversation) {
    task.push(
      db.ref("/room_names/" + conversation_id).set({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        type: "group",
        public: true,
        name: `${tenMh} nhóm ${nmh}`
      })
    );

    const _mem = {};
    _mem[id] = true;
    task.push(db.ref("privatemember/"+conversation_id).update({
        type:'group',
        members:_mem
    }))

  }else{

    const _mem = {};
    _mem[id] = true;
    task.push(db.ref("privatemember/"+conversation_id+"/members").update(_mem))
  }

  const obj = {};
  obj[id] = { access: true };

  let [publicInfo] = await Promise.all([db.ref("public/" + id).once("value")]);

  if (publicInfo.val()) {
    const value = publicInfo.val();
    if (value.share) {
      obj[id] = value.share;
    }
  }

  task.push(db.ref("members/" + conversation_id).update(obj));

  const message = {
    timestamp: admin.database.ServerValue.TIMESTAMP,
    type: "system",
    author: "system",
    data: {
      text: `${nameSV} được thêm vào nhóm chat`
    }
  };

  const _tmp = {};
  _tmp[conversation_id] = {
    timestamp: admin.database.ServerValue.TIMESTAMP
  };
  // push public info

  const memRoom = {};
  memRoom[id] = true;

  task.push(db.ref("/room_names/" + conversation_id +"/members").update(memRoom))
  task.push(db.ref("conversation/" + id+"/groups").update(_tmp));
  task.push(db.ref("messages/" + conversation_id).push(message));

  await Promise.all(task);
  return;
}

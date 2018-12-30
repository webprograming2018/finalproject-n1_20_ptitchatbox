const { firebase, admin } = require("../firebase");
const md5 = require("md5");
const messenger = require("../messenger");

const refAnDanh = firebase
  .ref("/andanh")
  .orderByChild("isSearch")
  .equalTo(true);

refAnDanh.on("child_added", async data => {
  const linking = await firebase.ref("linkid/" + data.key).once("value");
  const iduser = linking.val();
  const _user = await firebase.ref("users/" + iduser).once("value");
  if (!data.val()) {
    return;
  }
  const user = _user.val();
  console.log("Add user: " + data.key);
  queue_online.push({
    ...user,
    id: data.key,
    time: data.val().time,
    mssv: user.id
  });
  firebase.ref("/metadata").update({
    queue: queue_online.length
  });
});
refAnDanh.on("child_removed", data => {
  queue_online = queue_online.filter(item => item.id != data.key);
  firebase.ref("/metadata").update({
    queue: queue_online.length
  });
  console.log("Remove user: " + data.key);
});

let queue_online = [];

console.log("Bat dau chay");
setTimeout(() => {
  run();
}, 5000);

async function run() {
  let cache = -1;
  while (true) {
    if (cache != queue_online.length) {
      cache = queue_online.length;
    }

    queue_online.sort((a, b) => {
      return a.time - b.time;
    });
    //console.log(queue_online.length);
    const q = new Date().getTime();
    const r = ghepcap();

    if (r.length == 0) {
      const delay = new Date().getTime() - q;
      if (delay < 1000) {
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 2000 - delay);
        });
      }
      continue;
    }

    r.sort(xeprank);
    if (new Date().getTime() - queue_online[0].time > 15000) {
      //Ưu tiên
      let a = queue_online[0];
      let b = null;
      for (let i = r.length - 1; i >= 0; i--) {
        if (
          r[i].dk &&
          (r[i].a.mssv == queue_online[0].mssv ||
            r[i].b.mssv == queue_online[0].mssv)
        ) {
          //ghep cap. r[i]
          b = r[i].a.mssv == queue_online[0].mssv ? r[i].b : r[i].a;
          break;
        }
      }
      if (!b) {
        for (let k in queue_online) {
          const item = queue_online[k];
          if (
            item.mssv != queue_online[0].mssv &&
            item.mssv != r[r.length - 1].a.mssv &&
            item.mssv != r[r.length - 1].b.mssv
          ) {
            b = item;
            break;
          }
        }
        if (!b) {
          b = queue_online[1];
        }
      }
      //ghep cap a,b;
      await addConversation(a.id, b.id, a.mssv, b.mssv);
      const _tmp = [];
      for (const i in queue_online) {
        const item = queue_online[i];
        if (item.mssv != a.mssv && item.mssv != b.mssv) {
          _tmp.push(item);
        }
      }
      queue_online = _tmp;
    } else if (r[r.length - 1].dk) {
      let a = r[r.length - 1].a;
      let b = r[r.length - 1].b;
      await addConversation(a.id, b.id, a.mssv, b.mssv, r[r.length - 1].dk);

      const _tmp = [];
      for (const i in queue_online) {
        const item = queue_online[i];
        if (item.mssv != a.mssv && item.mssv != b.mssv) {
          _tmp.push(item);
        }
      }
      queue_online = _tmp;
    }

    const delay = new Date().getTime() - q;
    if (delay < 1000) {
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 1000 - delay);
      });
    }
  }
}

function xeprank(a, b) {
  //Tiêu chí mạnh nhất. Khác giới - cùng quê - tuổi nam >= nữ
  if (dk1(a)) {
    a["dk"] = 1;
    return 1;
  } else if (dk1(b)) {
    b["dk"] = 1;
    return -1;
  }
  // tiêu chí 2. Khác giới tuổi nam >= nữ

  if (dk2(a)) {
    a["dk"] = 2;
    return 1;
  } else if (dk2(b)) {
    b["dk"] = 2;
    return -1;
  }

  // khác giới tính
  if (dk3(a)) {
    a["dk"] = 3;
    return 1;
  } else if (dk3(b)) {
    a["dk"] = 3;
    return -1;
  }

  // cung que
  if (dk4(a)) {
    a["dk"] = 4;
    return 1;
  } else if (dk4(b)) {
    b["dk"] = 4;
    return -1;
  }

  // cung khoa và cùng khóa học
  if (dk5(a)) {
    a["dk"] = 5;
    return 1;
  } else if (dk5(b)) {
    b["dk"] = 5;
    return -1;
  }

  return 0;
}

function dk1(a) {
  //Tiêu chí mạnh nhất. Khác giới - cùng quê - tuổi nam >= nữ
  if (a.r.noi_sinh) {
    if (a.a.gioi_tinh == "Nam" && a.b.gioi_tinh == "Nữ") {
      if (a.r.tuoi.a >= a.r.tuoi.b) {
        return true;
      }
    } else if (a.a.gioi_tinh == "Nữ" && a.b.gioi_tinh == "Nam") {
      if (a.r.tuoi.b >= a.r.tuoi.a) {
        return true;
      }
    }
  }
  return false;
}

function dk2(a) {
  // tiêu chí 2. Khác giới tuổi nam >= nữ
  if (a.a.gioi_tinh == "Nam" && a.b.gioi_tinh == "Nữ") {
    if (a.r.tuoi.a >= a.r.tuoi.b) {
      return true;
    }
  } else if (a.a.gioi_tinh == "Nữ" && a.b.gioi_tinh == "Nam") {
    if (a.r.tuoi.b >= a.r.tuoi.a) {
      return true;
    }
  }

  return false;
}

function dk3(a) {
  // khác giới tính
  if (!a.r.gioi_tinh) {
    return true;
  }
  return false;
}

function dk4(a) {
  // cung que
  if (a.r.noi_sinh) {
    return true;
  }
  return false;
}

function dk5(a) {
  // cung khoa và cùng khóa học
  if (a.r.khoa && a.r.khoa_hoc) {
    return true;
  }
  return false;
}

function ghepcap() {
  const cap = [];
  for (let i = 0; i < queue_online.length; i++) {
    for (let j = i + 1; j < queue_online.length; j++) {
      if (i == j) continue;
      cap.push({ a: queue_online[i], b: queue_online[j] });
    }
  }
  const diemchung = cap.map(e => {
    const _t = timDiemChung(e.a, e.b);
    return { ...e, r: _t };
  });

  return diemchung;
}

function timDiemChung(a, b) {
  const thuoctinhchung = [];
  for (let i in a) {
    for (let j in b) {
      if (i == j && a[i] && b[i]) {
        thuoctinhchung.push(i);
      }
    }
  }
  const result = {};
  for (let i of thuoctinhchung) {
    if (i == "ngay_sinh") {
      const tuoi_a = a[i].split("/")[2];
      const tuoi_b = b[i].split("/")[2];
      result["tuoi"] = {
        a: new Date().getFullYear() - parseInt(tuoi_a),
        b: new Date().getFullYear() - parseInt(tuoi_b)
      };
      if (tuoi_a == tuoi_b) {
        result[i] = true;
      } else {
        result[i] = false;
      }
      continue;
    }
    if (a[i] == b[i]) {
      result[i] = true;
    } else {
      result[i] = false;
    }
  }
  return result;
}

async function addConversation(
  sender_id_hash,
  reception_id_hash,
  mssv1,
  mssv2
) {
  const task = [];
  const obj = {};
  const db = firebase;

  const _tmpCon = await db.ref("/room_names").push({
    timestamp: admin.database.ServerValue.TIMESTAMP,
    type: "friend",
    public: false
  });

  const idCon = _tmpCon.key;

  obj[sender_id_hash] = { access: true };
  obj[reception_id_hash] = { access: true };

  let [publicSender, publicReception] = await Promise.all([
    db.ref("public/" + sender_id_hash).once("value"),
    db.ref("public/" + reception_id_hash).once("value")
  ]);

  if (publicSender.val()) {
    const value = publicSender.val();
    if (value.share) {
      obj[sender_id_hash] = value.share;
    }
  }
  if (publicReception.val()) {
    const value = publicReception.val();
    if (value.share) {
      obj[reception_id_hash] = value.share;
    }
  }

  task.push(db.ref("/members/" + idCon).set(obj));

  const message = {
    timestamp: admin.database.ServerValue.TIMESTAMP,
    type: "system",
    author: "system",
    data: {
      text: "Cuộc trò chuyện đã bắt đầu."
    }
  };

  task.push(
    db.ref("andanh/" + sender_id_hash).update({
      conversation_id: idCon,
      isSearch: false
    })
  );
  task.push(
    db.ref("andanh/" + reception_id_hash).update({
      conversation_id: idCon,
      isSearch: false
    })
  );

  const _mem = {};
  _mem[mssv1] = true;
  _mem[mssv2] = true;

  task.push(
    db.ref("privatemember/" + idCon).update({
      type: "friend",
      members: _mem
    })
  );

  const roomMem = {};
  roomMem[sender_id_hash] = true;
  roomMem[reception_id_hash] = true;
  task.push(db.ref("room_names/" + idCon + "/members").update(roomMem));

  task.push(db.ref("messages/" + idCon).push(message));

  task.push(
    db.ref("forward/" + mssv1).update({
      conversation_id: idCon
    })
  );
  task.push(
    db.ref("forward/" + mssv2).update({
      conversation_id: idCon
    })
  );

  const task2 = [];
  task2.push(db.ref("forward/" + mssv1 + "/psid").once("value"));
  task2.push(db.ref("forward/" + mssv2 + "/psid").once("value"));
  const result2 = await Promise.all(task2);
  result2.forEach(item => {
    if (item.val()) {
      task.push(
        messenger.sendAPI.sendNotifi(
          item.val(),
          "Bot",
          "Cuộc trò chuyện mới đã bắt đầu. Hãy chào nhau đi nào"
        )
      );
    }
  });

  await Promise.all(task);
  return { conversation_id: idCon };
}

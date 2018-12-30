const connect = require("../mysql")();
const { db, admin } = require("../firebase");
const HASH = require("../md5");

/*sendMessage("GDUELIvH2xYOV4BH2nKjcKB4jOF3",{
    mssv:"B14DCCN160",
    message:{
        type:"text",
        message:"test"
    }
})*/

module.exports = joinChatTong;

/*joinChatTong({
    id:'791e627696421279b66fd511f03507ac',
    lop:"D15CNPM4( )",
    ten_sv:"Nguyễn Văn Thường"
})*/

async function joinChatTong(user) {
  console.log(user);
  const sender_id_hash = user.id;

  const snapCon = await db.ref("room_names/chattong").once("value");
  const conversation = snapCon.val();

  const task = [];

  //Cần update user vào firebase
  task.push(
    db.ref("public/" + sender_id_hash).update({
      class: user.lop,
      full_name: user.ten_sv
    })
  );

  if (!conversation) {
    task.push(
      db.ref("/room_names/chattong").set({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        type: "group",
        name: "Mọi người",
        avatar: "/img/moinguoi.jpg",
        public: true
      })
    );

    const _mem = {};
    _mem[sender_id_hash] = true;
    task.push(db.ref("privatemember/chattong").update({
        type:'group',
        members:_mem
    }))

  }else{
    const _mem = {};
    _mem[sender_id_hash] = true;
    task.push(db.ref("privatemember/chattong/members").update(_mem))
  }

  const _memberRoom = {};
  _memberRoom[sender_id_hash] = true;
  task.push(db.ref("/room_names/chattong/members").update(_memberRoom))

  const obj = {};
  obj[sender_id_hash] = { access: true };

  task.push(db.ref("/members/chattong").update(obj));

  const message = {
    timestamp: admin.database.ServerValue.TIMESTAMP,
    type: "system",
    author: "system",
    data: {
      text: `${user.ten_sv} đã được thêm vào group`
    }
  };

  task.push(db.ref("messages/chattong").push(message));

  await Promise.all(task);
  return { success: true };
}

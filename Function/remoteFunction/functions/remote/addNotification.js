const { db, admin } = require("../firebase");

module.exports = {
  addNotificationTKB,
  unsubscribeFromTopicTKB,
  addNotificationLichThi,
  unsubscribeFromTopicLichThi
};

/*addNotificationLichThi(
  "AUwUxdYUoxaRLpqIN6ydnZjVzXJ3",
  "c4wCSPc58KA:APA91bEoBaRJaa60rgEQXySbYSBd9HdjO-_HF0apRLHj5HJrbaADuxS1a7UomVegcxEZ3A1fR1Puj0PhNsg-yjlIeW5Fa50HKtL0P6w5_G6dQd7KaWniLFwQZbpuKuBu51TMxTZpQCmY"
);*/

/*addNotificationTKB(
  "TOJVpQo3a6fzrlnXNQo38DbF3Vs2",
  "cN3HvsyURcg:APA91bH4mCxmECfNI1x-Ydl2rF-m6YVnEduBCvXx8iHEm8jw0URlhjkcYnvak3_XigVCdQyQQVIDs9EvpAnfARmSl-Aq0bgd4nXkvWrd9HJNDNWxfggLCepTGWIMJvj3mUdB_Wd19fFC"
);*/

//sendMessage();
/*async function sendMessage() {
  const message = {
    webpush: {
      notification: {
        title: "Test",
        body:
          "Test thu thong bao",
      }
    },
    topic: "D15-114"
  };
  try{
    const r = await messaging.send(message);
    return r;
  }catch(error){
      debugger
  }

}*/
async function unsubscribeFromTopicTKB(uid,token){
    const userSnap = await db.ref("users/" + uid).once("value");
    const user = userSnap.val();
    if (!user.dkmh) {
      throw new Error("Dữ liệu TKB của bạn chưa được cập nhập.");
    }
    const task = [];
    for (let i in user.dkmh) {
        const mh = user.dkmh[i];
        const maLop = mh.maLop;
        const _task = admin.messaging().unsubscribeFromTopic(token,maLop)
        task.push(_task);
    }
    const r = await Promise.all(task);

    for(let i in r){
        if(r[i].failureCount === 1){
          throw r[i].errors[0].error.toString()
        }
    }
  
    await db.ref('fcmTokens/'+token).update({
        tkb:false
    })
  
    return {success:true};
}

async function unsubscribeFromTopicLichThi(uid,token){
  const userSnap = await db.ref("users/" + uid).once("value");
  const user = userSnap.val();
  if (!user.dkmh) {
    throw new Error("Dữ liệu TKB của bạn chưa được cập nhập.");
  }
  const lichthi = user.lichthi;
  const task = [];
  for(let i in lichthi){
      const monhoc = lichthi[i];
      const msmh = monhoc[1];
      const ngaythi = monhoc[6].split('/');
      const giothi = monhoc[7].split(':');
      if(ngaythi.length!==3||giothi.length!==2){

          throw new Error("Validate lich thi error");
      }
      const phongthi = monhoc[9];
      const date = ngaythi.concat(giothi);
      const maLop = msmh + date.join('') + phongthi.replace('-','').replace(',','');
      const _task = admin.messaging().unsubscribeFromTopic(token,maLop)
      task.push(_task);
  }
  const r = await Promise.all(task);

  for(let i in r){
      if(r[i].failureCount === 1){
        throw r[i].errors[0].error.toString()
      }
  }
  await db.ref('fcmTokens/'+token).update({
      lichthi:false
  })

  return {success:true};
}

function converDate(date){
  return new Date(new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok'
  })).getTime();
}

async function addNotificationLichThi(uid, token){
    const userSnap = await db.ref("users/" + uid).once("value");
    const user = userSnap.val();
    if (!user.lichthi) {
      throw new Error("Dữ liệu TKB của bạn chưa được cập nhập.");
    }

    const lichthi = user.lichthi;

    const task = [];
    const map = [];
    const mapLopHoc = [];
    for(let i in lichthi){
        const monhoc = lichthi[i];
        const msmh = monhoc[1];
        const ngaythi = monhoc[6].split('/');
        const giothi = monhoc[7].split(':');
        if(ngaythi.length!==3||giothi.length!==2){
            throw new Error("Validate lich thi error");
        }
        const phongthi = monhoc[9];
        const date = ngaythi.reverse().concat(giothi);
        const maLop = msmh + date.join('') + phongthi.replace('-','').replace(',','');

        map[i] = {
            tenMh:monhoc[2],
            time:date.join('-'),
            phong:phongthi,
            type:'lichthi'
        }
        mapLopHoc[i] = maLop;
        
        const _taskHandle = db.ref("topicnotification/" + maLop).once("value");
        task.push(_taskHandle);
    }
    const result = await Promise.all(task);

    const task2 = [];
    for(let i in lichthi){
        if(!result[i].val()){
            //update
            const _task2 = db.ref("topicnotification/" + mapLopHoc[i]).update(map[i]);
            task2.push(_task2);
        }
    }

    await Promise.all(task2);

    const task3 = [];
    for(let i in mapLopHoc){
        const _task3 = admin.messaging().subscribeToTopic(token, mapLopHoc[i]);
        task3.push(_task3);
    }

    const r = await Promise.all(task3);
    for(let i in r){
        if(r[i].failureCount === 1){
          throw r[i].errors[0].error;
        }
    }
  
    await db.ref('fcmTokens/'+token).update({
        lichthi:true
    })
  
    return {success:true};

}

async function addNotificationTKB(uid, token) {
  const userSnap = await db.ref("users/" + uid).once("value");
  const user = userSnap.val();
  if (!user.dkmh) {
    throw new Error("Dữ liệu TKB của bạn chưa được cập nhập.");
  }

  const task = [];
  const map = [];
  for (let i in user.dkmh) {
    const mh = user.dkmh[i];
    const maLop = mh.maLop;
    map.push(i);
    const _taskHandle = db.ref("topicnotification/" + maLop).once("value");
    task.push(_taskHandle);
  }
  const topics = await Promise.all(task);

  const task2 = [];
  for (let i in topics) {
    const mh = user.dkmh[map[i]];
    const maLop = mh.maLop;
    const tenMh = mh.tenMh;
    const timetkb = convertTKBMh(mh);
    if (!topics[i].val()) {
      const _task2 = db.ref("topicnotification/" + maLop).update({
        tenmh: tenMh,
        time: timetkb,
        type:'tkb'
      });
      task2.push(_task2);
    }
  }
  await Promise.all(task2);

  const task3 = [];
  for (let i in user.dkmh) {
    const mh = user.dkmh[i];
    const maLop = mh.maLop;
    const _task3 = admin.messaging().subscribeToTopic(token, maLop);
    task3.push(_task3);
  }

  const r = await Promise.all(task3);
  for(let i in r){
      if(r[i].failureCount === 1){
        throw r[i].errors[0].error;
      }
  }

  await db.ref('fcmTokens/'+token).update({
      tkb:true
  })

  return {success:true};
}

function convertTKBMh(mh) {
  const TUAN = mh.TUAN;
  const tietBD = mh.tietBD;
  const THU = mh.THU;
  const PHONG = mh.PHONG;
  let result = [];
  for (let i = 0; i < TUAN.length; i++) {
    const tuan = TUAN[i];
    const thu = THU[i];
    const tietbd = tietBD[i];
    const phong = PHONG[i];
    const arr = getTimeStart(tuan, thu, tietbd, phong);
    result = result.concat(arr);
  }
  return result;
}

function getTimeStart(tuan, thu, tietbd, phong) {
  // dem so tuan
  const countTuan = tuan.length;
  const result = [];
  for (let i = 0; i < countTuan; i++) {
    if (tuan[i] === "-") continue;
    const thuTime = converWeekToTime(thu);
    const tietBDTime = converTietDBToTime(tietbd);
    const obj = {
      time: i * 24 * 7 + thuTime * 24 + tietBDTime,
      phong: phong
    };

    result.push(obj);
  }

  result.sort((a,b)=>{
    return a.time - b.time;
  })
  return result;
}

function converWeekToTime(e) {
  if (e === "Hai") return 0;
  if (e === "Ba") return 1;
  if (e === "Tư") return 2;
  if (e === "Năm") return 3;
  if (e === "Sáu") return 4;
  if (e === "Bảy") return 5;
  if (e === "CN") return 6;
  return null;
}

function converTietDBToTime(e) {
  const tietbd = parseInt(e);
  if (tietbd <= 4) {
    return 6 + tietbd;
  } else {
    return 7 + tietbd;
  }
}

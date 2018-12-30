const functions = require("firebase-functions");
const crawler = require("./crawler");
const { db, admin } = require("./firebase");
const HASH = require("./md5");
const request = require("request");
const config = require("./config.json");
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const runtimeOpts = {
  timeoutSeconds: 13,
  memory: "256MB"
};

exports.connectQLDT = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return connectQLDT(
      context && context.auth ? context.auth.uid : null,
      data.username,
      data.password,
      data.session,
      data.idforapp,
      data.psid
    );
  });

exports.updateQLDT = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return updateQLDT(context.auth.uid, data.password, data.session);
  });

exports.disconnectQLDT = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return disconnectQLDT(context.auth.uid);
  });

/*test();
async function test(){
  const r = await connectQLDT('AUwUxdYUoxaRLpqIN6ydnZjVzXJ3','B14DCCN762','Khatvong96');
  debugger
}*/

//disconnectQLDT("gp0cv1LBEiRHSddlCZPbvyjIJNq1")

async function disconnectQLDT(uid) {
  try {
    const idUserSnap = await db.ref("linkid/" + uid + "/public").once("value");
    const idUser = idUserSnap.val();
    // remove linking va remove forward
    if(!idUser){
      return false;
    }

    const task = [];
    const filter = await db
      .ref("linkid")
      .orderByChild("public")
      .equalTo(idUser)
      .once("value");
    filter.forEach(item => {
      task.push(db.ref("linkid/" + item.key).remove());
    });
    task.push(db.ref("forward/" + idUser).remove());
    task.push(db.ref("users/" + idUser + "/idforapp").remove());
    task.push(db.ref("users/" + idUser + "/idforpage").remove());

    await Promise.all(task);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

//connectQLDT(null,"b14dccn762","Khatvong96",null,null,"2122442017778545")

async function connectQLDT(
  uid,
  username,
  password,
  session,
  idforapp,
  idforpage
) {
  try {
    if (!idforapp && !idforpage) {
      throw new Error("Method invalid");
    }

    const data = session
      ? await crawler.loginQLDT(null, null, session)
      : await crawler.loginQLDT(username, password);

    if (data.user.type !== "sv") {
      return {
        success: false,
        error: "Invalid user",
        user: data.user
      };
    }

    const taskdisconnect = [];

    // ngat ket noi voi tai khoan hien tai
    const iduser2_ = HASH(data.user.mssv);
    const filter2 = await db
      .ref("linkid")
      .orderByChild("public")
      .equalTo(iduser2_)
      .once("value");
    filter2.forEach(item => {
      taskdisconnect.push(db.ref("linkid/" + item.key).remove());
    });
    taskdisconnect.push(db.ref("forward/" + iduser2_).remove());
    taskdisconnect.push(db.ref("users/" + iduser2_ + "/idforapp").remove());
    taskdisconnect.push(db.ref("users/" + iduser2_ + "/idforpage").remove());

    if (idforpage) {
      idforapp = await getIdForAppFromPsid(idforpage);
      if (idforapp) {
        taskdisconnect.push(disconnectQLDT(idforapp));
      }
      taskdisconnect.push(disconnectQLDT(idforpage));
    } else if (idforapp) {
      idforpage = await getPSIDFromIdforapp(idforapp);
      if (idforpage) {
        taskdisconnect.push(disconnectQLDT(idforpage));
      }
      taskdisconnect.push(disconnectQLDT(idforapp));
    }

    if(uid){
      taskdisconnect.push(disconnectQLDT(uid));
    }

    await Promise.all(taskdisconnect);

    // kiem tra linking


    /*
    if(oldUserData&&oldUserId){
      await db.ref('users/'+oldUserId).remove();
      await db.ref('users/'+uid).update(oldUserData);
      return {
        success:true
      };
    }*/
    ///////////////////////////////////////////

    const [infoAndMark, dkmh, lichthi] = await Promise.all([
      crawler.infoAndMark(data.cookie),
      crawler.crawlerDKMH(data.user.mssv, data.cookie),
      crawler.crawlerLichThi(data.cookie)
    ]);
    if (infoAndMark.error) {
      // save body
      await db.ref("error/" + data.user.mssv).update({
        diemthi: infoAndMark
      });
    }
    if (dkmh.error) {
      //save body
      await db.ref("error/" + data.user.mssv).update({
        dkmh
      });
    }

    const update__ = { ...infoAndMark.baseinfo };
    if(idforapp){
      update__["idforapp"] = idforapp;
    }
    if(idforpage){
      update__["idforpage"] = idforpage;
    }

    const r = await crawler.updateCSDL({
      diem: infoAndMark.diem,
      basicInfo: update__,
      dkmh,
      lichthi,
      uid
    });

    return {
      success: true,
      data
    };
  } catch (ex) {
    console.log(ex);
    return {
      success: false,
      error: ex.message
    };
  }
}

//updateQLDT('AUwUxdYUoxaRLpqIN6ydnZjVzXJ3',null,'ASP.NET_SessionId=0d4nevzf5hy1cgej3jsq2ryt')

async function updateQLDT(uid, password, session) {
  try {
    //handle tk đã liên kết với với uid khác

    const linkidSnap = await db.ref("linkid/" + uid).once("value");
    const idUser = linkidSnap.val();
    if (!idUser) {
      throw new Error("Tài khoản không tồn tại");
    }

    const _mssvSnap = await db.ref("users/" + idUser + "/mssv").once("value");
    const _mssv = _mssvSnap.val();
    if (!_mssv) {
      throw new Error("Error: Có linkid nhưng không có mssv trong user data");
    }

    const data = session
      ? await crawler.loginQLDT(null, null, session)
      : await crawler.loginQLDT(_mssv, password);

    if (data.user.mssv !== _mssv) {
      throw new Error(
        `Session là của một người dùng khác ( you: ${_mssv}. session: ${
          data.user.mssv
        })`
      );
    }

    if (data.user.type !== "sv") {
      return {
        success: false,
        error: "Invalid user",
        user: data.user
      };
    }

    /*
    if(oldUserData&&oldUserId){
      await db.ref('users/'+oldUserId).remove();
      await db.ref('users/'+uid).update(oldUserData);
      return {
        success:true
      };
    }*/
    ///////////////////////////////////////////

    const [infoAndMark, dkmh, lichthi] = await Promise.all([
      crawler.infoAndMark(data.cookie),
      crawler.crawlerDKMH(data.user.mssv, data.cookie),
      crawler.crawlerLichThi(data.cookie)
    ]);
    if (infoAndMark.error) {
      // save body
      await db.ref("error/" + data.uid).update({
        diemthi: infoAndMark.error
      });
    }
    if (dkmh.error) {
      //save body
      await db.ref("error/" + data.uid).update({
        dkmh: dkmh.error
      });
    }

    const r = await crawler.updateCSDL({
      diem: infoAndMark.diem,
      basicInfo: infoAndMark.baseinfo,
      dkmh,
      lichthi,
      uid
    });
    return r;
  } catch (ex) {
    return {
      success: false,
      error: ex.message
    };
  }
}

function getIdForAppFromToken(token) {
  const url = `https://graph.facebook.com/v3.2/me?access_token=${token}`;
  return new Promise((resolve, reject) => {
    request.get(url, (error, res, body) => {
      if (error) {
        return reject(error);
      }
      const data = JSON.parse(body);
      if (data && data.id) {
        return resolve(data.id);
      } else {
        return reject(new Error("Lỗi không xác định"));
      }
    });
  });
}

function getIdForAppFromPsid(psid) {
  const url = `https://graph.facebook.com/v3.2/${psid}/ids_for_apps?app=2229693873710059&access_token=${
    config.PAGE_ACCESS_TOKEN
  }&appsecret_proof=${config.SCRETPROOF}`;
  return new Promise((resolve, reject) => {
    request.get(url, (error, res, body) => {
      if (error || res.statusCode !== 200) {
        return reject(new Error("Co loi khi get idforapp from psid"));
      }
      const { data } = JSON.parse(body);
      if (data && data[0] && data[0].id) {
        return resolve(data[0].id);
      } else {
        return resolve(null);
      }
    });
  });
}

function getPSIDFromIdforapp(idforapp) {
  const url = `https://graph.facebook.com/v3.2/${idforapp}/ids_for_pages?app=2229693873710059&access_token=${
    config.PAGE_ACCESS_TOKEN
  }&appsecret_proof=${config.SCRETPROOF}`;
  return new Promise((resolve, reject) => {
    request.get(url, (error, res, body) => {
      if (error || res.statusCode !== 200) {
        return reject(new Error("Co loi khi get idforapp from psid"));
      }
      const { data } = JSON.parse(body);
      if (data && data[0] && data[0].id) {
        return resolve(data[0].id);
      } else {
        return resolve(null);
      }
    });
  });
}

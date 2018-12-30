const { db } = require("../firebase");
const connect = require("../mysql")();
module.exports = getAllDiemFromMsmh;

async function getAllDiemFromMsmh(uid, hocki, msmhs) {
  const snapMssv = await db.ref("users/" + uid + "/mssv").once("value");
  const mssv = snapMssv.val();
  if (!mssv) {
    throw new Error("access denied");
  }
  const task = [];
  const h = hocki.split("-");
  const hk = String(h[1]) + h[0];
  for (const msmh of msmhs) {
    const sql = `SELECT thiL1,thiL2,TKCH FROM \`ptitvl\`.\`${hk}\` WHERE \`maMH\`="${msmh}"`;
    const _t = new Promise((resolve, reject) => {
      connect.query(sql, (err, res) => {
        if (err) {
          return resolve({ err: String(err) });
        }
        return resolve(res);
      });
    });
    task.push(_t);
  }
  const r = await Promise.all(task);

  if (r[0].err&&r[0].err.indexOf('ER_NO_SUCH_TABLE')>0) {
    const task = [];
    for (const msmh of msmhs) {
      const sql = `SELECT thiL1,thiL2,TKCH FROM \`ptitchatbox\`.\`${hocki}\` WHERE \`maMH\`="${msmh}"`;
      const _t = new Promise((resolve, reject) => {
        connect.query(sql, (err, res) => {
          if (err) {
            return resolve({ err: String(err) });
          }
          return resolve(res);
        });
      });
      task.push(_t);
    }
    const r = await Promise.all(task);
    return {
      data:r,
      source:'origin'
    };
  } else {
    return {
      data:r,
      source:'other'
    };
  }
}

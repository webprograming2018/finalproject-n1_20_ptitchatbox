// parse dữ liệu raw data từ request thành các tham số để xử lý về sau
const AppData = require("../appdata");

module.exports = function(req, res, next) {
  let data = "";
  req.appData = {};
  req.setEncoding("utf8");
  req.on("data", chunk => {
    if (chunk) data += chunk;
  });
  req.on("end", () => {
    req.appData.rawBody = data;
    const regex = new RegExp(
      `Content-Disposition: form-data; name="(.*?)"(.*?)-`,
      "g"
    );
    const input = data.replace(/\n|\r/g, "");
    const fields = {};
    let c = false;
    while ((match = regex.exec(input))) {
      fields[match[1]] = match[2];
      c = true;
    }
    if (c) {
      req.appData.fields = fields;
    }
    const cookie = req.headers["cookie"];
    const regexSession = new RegExp(`ASP.NET_SessionId=(.*?);`);
    const matchSession = regexSession.exec(cookie + ";");
    if (matchSession) {
      const session = matchSession[1];
      req.appData.session = session;
      AppData.SESSION[session] = AppData.SESSION[session] || {};
    }

    next();
  });
};

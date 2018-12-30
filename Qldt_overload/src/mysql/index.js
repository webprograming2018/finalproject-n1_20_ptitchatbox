const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "35.221.73.112",
  user: "root",
  password: "",
  database: "qldtoverload"
});

connection.connect((err) => {
  if (err) throw err

});

module.exports = connection;

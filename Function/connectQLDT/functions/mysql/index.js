const mysql = require('mysql');

/**
 * TODO(developer): specify SQL connection details
 */

module.exports = ()=>{
  const connectionName = process.env.INSTANCE_CONNECTION_NAME || 'chatbox-ver4:asia-northeast1:chatbox-ver4';
  const dbUser = process.env.SQL_USER || 'root';
  const dbPassword = process.env.SQL_PASSWORD || '';
  const dbName = process.env.SQL_NAME || 'ptitchatbox';
  
  const mysqlConfig = {
    connectionLimit: 1,
    user: dbUser,
    password: dbPassword,
    database: dbName
  };
  
  mysqlConfig.socketPath = `/cloudsql/${connectionName}`;
  return mysql.createPool(mysqlConfig);
}

// module.exports = ()=>{
//   return connect  = mysql.createPool({
//     connectionLimit : 1,
//     host            : 'localhost',
//     user            : 'root',
//     password        : '',
//     database        : 'ptitchatbox'
//   });
// }



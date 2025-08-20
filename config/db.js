const mysql = require('mysql2');
require('dotenv').config();

// if(process.env.NODE_ENV !== 'development') {
// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });
// }
// else{
//   const connection = mysql.createConnection(process.env.MYSQL_URL);
//   // const connection = mysql.createConnection({
//     //   host: process.env.MYSQLHOST,
//   //   user: process.env.MYSQLUSER,
//   //   password: process.env.MYSQLPASSWORD,
//   //   database: process.env.MYSQLDATABASE
//   // });
// }
const connection = mysql.createConnection(process.env.MYSQL_URL);

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database.');
});

module.exports = connection;
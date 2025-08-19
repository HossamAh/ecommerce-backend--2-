const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.NODE_ENV === "development" ? process.env.DB_HOST : process.env.MYSQLHOST,
  user: process.env.NODE_ENV === "development" ? process.env.DB_USER : process.env.MYSQLUSER,
  password: process.env.NODE_ENV === "development" ? process.env.DB_PASSWORD : process.env.MYSQLPASSWORD,
  database: process.env.NODE_ENV === "development" ? process.env.DB_NAME : process.env.MYSQLDATABASE
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database.');
});

module.exports = connection;
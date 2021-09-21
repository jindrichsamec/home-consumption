const mysql = require("mysql2/promise");
const config = require("../config");

let connection = null;

async function createConnection() {
  connection = await mysql.createConnection(config.mysql);

  connection.connect((err) => {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  });

  connection.on("error", (err) => {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Connection to the MySQL server is usually
      createConnection(); // lost due to either server restart, or a
    } else {
      // connnection idle timeout (the wait_timeout
      throw err; // server variable configures this)
    }
  });
}

async function getMysqlConnection() {
  if (connection === null) {
    await createConnection();
  }
  return connection;
}

async function setupDatabase() {
  const connection = await getMysqlConnection();
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${config.mysql.database}`
  );
  await connection.query(
    "CREATE TABLE  IF NOT EXISTS `consumption` (`id` int(11) unsigned NOT NULL AUTO_INCREMENT,`createdAt` datetime NOT NULL DEFAULT current_timestamp(),`gas` int(11) DEFAULT NULL,`electricity` int(11) DEFAULT NULL,`hotWater` int(11) DEFAULT NULL,`coldWater` int(11) DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
  );
  return connection.query(
    "CREATE TABLE  IF NOT EXISTS `temperature` (`id` int(11) unsigned NOT NULL AUTO_INCREMENT, `temperature` int(11) DEFAULT NULL, `humidity` int(11) DEFAULT NULL, `battery` int(11) DEFAULT NULL, `createdAt` datetime NOT NULL DEFAULT current_timestamp(), `deviceMacAddress` varchar(50) NOT NULL DEFAULT '', PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
  );

}

module.exports = {
  getMysqlConnection,
  setupDatabase
}

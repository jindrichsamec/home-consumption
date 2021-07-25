const koa = require("koa");
const Router = require("koa-router");
const mysql = require("mysql2/promise");
const bodyParser = require("koa-bodyparser");
const config = require("./config");

let connection = null;

async function getMysqlConnection() {
  if (connection === null) {
    connection = await mysql.createConnection(config.mysql);
  }
  return connection;
}

async function setupDatabase() {
  const connection = await getMysqlConnection();
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${config.mysql.database}`
  );
  return connection.query(
    "CREATE TABLE  IF NOT EXISTS `consumption` (`id` int(11) unsigned NOT NULL AUTO_INCREMENT,`createdAt` datetime NOT NULL DEFAULT current_timestamp(),`gas` int(11) DEFAULT NULL,`electricity` int(11) DEFAULT NULL,`hotWater` int(11) DEFAULT NULL,`coldWater` int(11) DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
  );
}

async function insertConsumption(
  gas = null,
  electricity = null,
  coldWater = null,
  hotWater = null
) {
  const values = [];
  gas !== null && values.push(`gas = ${gas}`);
  electricity !== null && values.push(`electricity = ${electricity}`);
  hotWater !== null && values.push(`hotWater = ${hotWater}`);
  coldWater !== null && values.push(`coldWater = ${coldWater}`);

  if (values.length > 0) {
    const connection = await getMysqlConnection();
    return connection.query(`INSERT INTO consumption SET ${values.join(", ")}`);
  }

}

const router = new Router({ prefix: "/api/1.0" });
router.put("/reading", async (ctx, next) => {
  try {
    const { body } = ctx.request;
    const {
      gas = null,
      electricity = null,
      hotWater = null,
      coldWater = null,
    } = body;
    await insertConsumption(gas, electricity, coldWater, hotWater);
    ctx.response.status = 200;
  } catch (err) {
    console.error("Saving failed because of: ", err.message);
    ctx.response.status = 500;
  }

  next();
});

setupDatabase()
  .then(() => {
    const app = new koa();
    app.use(bodyParser());
    app.use(router.routes());
    app.listen(config.apiServerPort);
    console.info(`Started and listening on port ${config.apiServerPort}`);
  })
  .catch((err) => {
    process.nextTick(() => {
      console.error(`Application fails because ${err}. Bye!`);
      process.exit(1);
    });
  });

const { getMysqlConnection } = require('../dbClient/mysql')

async function insertTemperature(
  temperature = null,
  humidity = null,
  battery = null,
  deviceMacAddress = null
) {
  const values = [];
  humidity !== null && values.push(`humidity = ${humidity}`);
  temperature !== null && values.push(`temperature = ${temperature}`);
  battery !== null && values.push(`battery = ${battery}`);
  deviceMacAddress !== null && values.push(`deviceMacAddress = "${deviceMacAddress}"`);

  if (values.length > 0) {
    const connection = await getMysqlConnection();
    return connection.query(`INSERT INTO temperature SET ${values.join(", ")}`);
  }
}

module.exports = {
  insertTemperature
}

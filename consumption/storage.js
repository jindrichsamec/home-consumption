const { getMysqlConnection } = require('../dbClient/mysql')

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

module.exports = {
  insertConsumption
}

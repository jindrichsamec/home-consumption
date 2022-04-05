const got = require('got')

const config = require('../config')

async function sendWebhook(
  temperature = null,
  humidity = null,
  deviceMacAddress = null
) {
  temperature !== null && got.get(
    `http://${config.homebridgeHost}/?accessoryId=${deviceMacAddress}:temp&value=${temperature / 10}`,
  );

  humidity !== null && got.get(
    `http://${config.homebridgeHost}/?accessoryId=${deviceMacAddress}:humidity&value=${humidity / 10}`,
  );
}

module.exports = {
  insertTemperature
}

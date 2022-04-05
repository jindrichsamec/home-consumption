const fetch = require('node-fetch')

const config = require('../config')

async function sendWebhook(
  temperature = null,
  humidity = null,
  deviceMacAddress = null
) {
  temperature !== null && fetch(
    `http://${config.homebridgeHost}/?accessoryId=${deviceMacAddress}:temp&value=${temperature / 10}`,
  );

  humidity !== null && fetch(
    `http://${config.homebridgeHost}/?accessoryId=${deviceMacAddress}:humidity&value=${humidity / 10}`,
  );
}

module.exports = {
  sendWebhook
}

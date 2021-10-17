const noble = require("@abandonware/noble");
const { Parser, EventTypes, SERVICE_DATA_UUID } = require("./parser");
const { insertTemperature } = require("./storage");

// const MI_TOKEN = "27535a40329effc1de539201b8280c15";
const TOKENS = [
  "453e4ddc667863f2c8665d3e29ae7c8f",
  "87f532e43b1523c4e461ffb650f03d5c",
  "00adb26a0d30e6a9b3173962a8753bc9",
  "b4ca84809a1bb1cf62419f3e5f614b0a"
];

noble.on("stateChange", async (state) => {
  if (state === "poweredOn") {
    console.log("Scanning for BLE peripherals...");
    await noble.startScanningAsync([], true);
  } else {
    console.log("Stopping scanning...");
  }
});

function getValidServiceData(serviceData) {
  return (
    serviceData &&
    serviceData.find((data) => data.uuid.toLowerCase() === SERVICE_DATA_UUID)
  );
}


const measurements = [];

const findOrCreateMeasurement = (deviceMacAddress) => {
  let measurement = measurements.find((m) => m.deviceMacAddress === deviceMacAddress)
  if (!measurement) {
    measurement = createMeasurement(deviceMacAddress)
    measurements.push(measurement)
  }
  return measurement;
}

const createMeasurement = (deviceMacAddress) => {
  return {
  temperature: null,
  humidity: null,
  battery: null,
  deviceMacAddress,
};
}

noble.on("discover", async (peripheral) => {
  const { advertisement: { serviceData, localName } = {}, id, address } = peripheral;

  const miData = getValidServiceData(serviceData);

  if (localName === 'LYWSD03MMC' && address && miData) {
    const parsed = TOKENS.map((token) => {
      try {
        const result = new Parser(miData.data, token).parse();
        return {result, token};
      } catch(err) {
        console.error(`Parsing with token "${token}" fails because "${err.message}. Address: ${address} Name: ${localName}"`)
      }
      return {result: null, token}
    });

    const {result, token} = parsed.find((p) => Boolean(p.result));

    if (!result) {
      console.log(`No result for device Address: ${address} Name: ${localName}"`)
      return;
    }

    if (!result.frameControl.hasEvent) {
      return;
    }
    const { eventType, event } = result;
    console.log(`ADDRESS: ${address} Token: ${token} Event:`, event);
    const measurement = findOrCreateMeasurement(address);
    switch (eventType) {
      case EventTypes.temperature: {
        measurement.temperature = event.temperature * 10;
        break;
      }
      case EventTypes.humidity: {
        measurement.humidity = event.humidity * 10;
        break;
      }
      case EventTypes.battery: {
        measurement.battery = event.battery;
        break;
      }
      case EventTypes.temperatureAndHumidity: {
        measurement.temperature = event.temperature * 10;
        measurement.humidity = event.humidity * 10;
        break;
      }
    }
  }
});

const intervalId = setInterval(() => {
  measurements.forEach((measurement) => {
    insertTemperature(
      measurement.temperature,
      measurement.humidity,
      measurement.battery,
      measurement.deviceMacAddress
    );
    console.dir(measurement);
  })

}, 5 * 60 * 1000);

// A4:C1:38:22:DF:73

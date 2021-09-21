const noble = require("@abandonware/noble");
const { Parser, EventTypes, SERVICE_DATA_UUID } = require("./parser");
const { insertTemperature } = require('./storage')

const MI_TOKEN = "27535a40329effc1de539201b8280c15";

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

const measurement = {
  temperature: null,
  humidity: null,
  battery: null,
  deviceMacAddress: '-'
};

noble.on("discover", async (peripheral) => {
  const { advertisement: { serviceData } = {}, id, address } = peripheral;

  const miData = getValidServiceData(peripheral.advertisement.serviceData);
  if (peripheral.advertisement.localName && miData) {
    const result = new Parser(miData.data, MI_TOKEN).parse();

    if (result == null) {
      return;
    }

    if (!result.frameControl.hasEvent) {
      return;
    }

    const { eventType, event } = result;
    measurement.deviceMacAddress = peripheral.address;
    switch (eventType) {
      case EventTypes.temperature: {
        measurement.temperature = event.temperature * 10;
        break;
      }
      case EventTypes.humidity: {
        measurement.humidity = event.humidity * 10;
        break;
      }
      case EventTypes.battery: {
        measurement.battery = event.battery;
        break;
      }
      case EventTypes.temperatureAndHumidity: {
        measurement.temperature = event.temperature;
        measurement.humidity = event.humidity;
        break;
      }
    }
  }
});

const intervalId = setInterval(() => {
  insertTemperature(measurement.temperature, measurement.humidity, measurement.battery, measurement.deviceMacAddress);
  console.dir(measurement)
}, 5 * 60 * 1000);

// A4:C1:38:22:DF:73

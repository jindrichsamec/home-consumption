#!/usr/bin/env node
const { setupDatabase } = require('./dbClient/mysql')
const config = require("./config");
const server = require('./consumption/httpApiServer')
require('./temperature')

setupDatabase()
  .then(() => {
    server.listen(config.apiServerPort);
    console.info(`Started and listening on port ${config.apiServerPort}`);
  })
  .catch((err) => {
    process.nextTick(() => {
      console.error(`Application fails because ${err}. Bye!`);
      process.exit(1);
    });
  });

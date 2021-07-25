require('dotenv').config()
const env = require('env-var');

module.exports = {
  mysql: {
    host: env.get('MYSQL_HOST').required().asString(),
    database: env.get('MYSQL_DATABASE').required().asString(),
    user: env.get('MYSQL_USER').required().asString(),
    password: env.get('MYSQL_PASSWORD').required().asString(),
  },
  apiServerPort: env.get('API_SERVER_PORT').default(3000).asPortNumber(),
}

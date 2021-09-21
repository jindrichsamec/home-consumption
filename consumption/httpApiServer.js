const koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const { validate } = require("jsonschema");
const readingSchema = require("./reading.schema.json")
const { insertConsumption } = require('./storage')

const router = new Router({ prefix: "/api/1.0" });
router.put("/reading", async (ctx, next) => {
  try {
    const { body } = ctx.request;
    const validationResult = validate(body, readingSchema);
    if (validationResult.valid) {
      const {
        gas = null,
        electricity = null,
        hotWater = null,
        coldWater = null,
      } = body;
      await insertConsumption(gas, electricity, coldWater, hotWater);
      ctx.response.status = 200;
    } else {
      console.warn("Invalid input", validationResult.errors);
      ctx.response.status = 400;
      ctx.response.body = validationResult.errors;
    }
  } catch (err) {
    console.error("Saving failed because of: ", err.message);
    ctx.response.status = 500;
  }

  next();
});

const app = new koa();
app.use(bodyParser());
app.use(router.routes());

module.exports = app

const { Schema, model } = require("mongoose");
const userSettingsSchema = new Schema({
  _id: Schema.Types.ObjectId,
  prefix: String,
  userMessages: [Object]
});

module.exports = model("userSettings", userSettingsSchema, "discordUserSettings");

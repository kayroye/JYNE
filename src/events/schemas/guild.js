const { Schema, model } = require("mongoose");
const guildSchema = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: String,
  guildName: String,
  guildIcon: { type: String, required: false },
  guildSettings: {
    respondToMessages: { type: Boolean, default: true },
    hangmanSettings: [{
      word: { type: String, required: true },
      category: { type: String, required: true },
    }]
  },
  currentQueue: [Object],
});

module.exports = model("Guild", guildSchema, "guilds");

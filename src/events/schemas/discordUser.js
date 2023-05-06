const { Schema, model, default: mongoose } = require("mongoose");
const discordUserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  userId: String,
  userName: String,
  elysium: { type: Number, required: true },
  subscribed: { type: Boolean, required: true },
  lastDaily: Date,
  lastWeekly: Date,
  favoriteWords: [Object],
  guildSentIn: [Object],
  commandHistory: [Object],
  highScores: {
    gtnEasy: { type: Number },
    gtnMedium: { type: Number },
    gtnHard: { type: Number },
    blackjackWins: { type: Number }
  },
  achievements: [String],
  inGuilds: [String],
  settings: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "userSettings",
  },
  aiGenerations: [Object],
  strikes: Number,
});

module.exports = model("discordUser", discordUserSchema, "discordUsers");

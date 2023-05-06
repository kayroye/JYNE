const mongoose = require("mongoose");
const Guilddb = require("../src/events/schemas/guild.js");
const discordUser = require("../src/events/schemas/discordUser.js");
const userSettings = require("../src/events/schemas/userSettings.js");


module.exports = {
    createUser: async function createUser(userId, userName) {
        const newUserSettings = await new userSettings({
          _id: mongoose.Types.ObjectId(),
        });
        await newUserSettings.save().catch((err) => console.log(err));
      
        const newUser = await new discordUser({
          _id: mongoose.Types.ObjectId(),
          userId: userId,
          userName: userName,
          elysium: 50,
          subscribed: false,
          settings: newUserSettings._id,
          achievements: []
        });
        await newUser.save().catch((err) => console.log(err));
      }
}
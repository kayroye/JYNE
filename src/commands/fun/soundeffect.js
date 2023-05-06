const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const mongoose = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("soundeffect")
    .setDescription("Sends a sound effect of your choice in the chat.")
    .addStringOption((option) =>
      option
        .setName("sound")
        .setDescription("The sound effect you would like to send.")
        .setRequired(true)
        .addChoices(
          { name: "Rizzed Up", value: "rizz" },
          { name: "Vine Boom", value: "vineboom"}
        )
    ),
  async execute(interaction) {
    const sound = interaction.options.getString("sound");
    const message = await interaction.deferReply();
    if(sound === "rizz") {
        interaction.editReply({content: "<:oioi:869254735734145096>", files: ['src/assets/soundEffects/rizz.mp3']})
    } else if(sound === "vineboom") {
        interaction.editReply({content: "<:WHAT:927675480981794876>", files: ['src/assets/soundEffects/vineboom.mp3']})
    }
  },
};

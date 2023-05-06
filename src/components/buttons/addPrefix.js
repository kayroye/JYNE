const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const mongoose = require("mongoose");
const DiscordUser = require("../../events/schemas/discordUser.js");
const userSettings = require("../../events/schemas/userSettings.js");

module.exports = {
  data: {
    name: "addPrefix",
  },
  async execute(interaction, client) {
    const modal = new ModalBuilder().setTitle("User Settings - Prefix").setCustomId("prefixSet");

    const input = new TextInputBuilder()
      .setCustomId("newPrefix")
      .setLabel("What would you like your prefix to be?")
      .setPlaceholder("Examples: Master, Mr., Mrs., Dr., Sir, Lady, Lord, etc.")
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
};

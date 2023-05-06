const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
  } = require("discord.js");
  const Guild = require("../../events/schemas/guild.js");
  const mongoose = require("mongoose");
  
  module.exports = {
    data: {
      name: "removeHangmanWord",
    },
    async execute(interaction, client) {
        const modal = new ModalBuilder().setTitle("Server Settings - Hangman").setCustomId("removeHangmanWord");

        const word = new TextInputBuilder()
            .setCustomId("removingHangmanWord")
            .setLabel("What word would you like to remove?")
            .setPlaceholder("Type a word here!")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(word));
        await interaction.showModal(modal);
    },
};
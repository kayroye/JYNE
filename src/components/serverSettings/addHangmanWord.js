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
      name: "addHangmanWord",
    },
    async execute(interaction, client) {
        const modal = new ModalBuilder().setTitle("Server Settings - Hangman").setCustomId("addHangmanWord");

        const word = new TextInputBuilder()
            .setCustomId("newHangmanWord")
            .setLabel("What word would you like to add?")
            .setPlaceholder("Type a word here!")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

            const category = new TextInputBuilder()
            .setCustomId("newHangmanCategory")
            .setLabel("What category is the word in?")
            .setPlaceholder("Type a category here!")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(word), new ActionRowBuilder().addComponents(category));
        await interaction.showModal(modal);

    },
};
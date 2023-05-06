const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextInputBuilder,
    TextInputStyle,
  } = require("discord.js");
  const mongoose = require("mongoose");
  const Guild = require("../../events/schemas/guild.js");
  
  module.exports = {
    data: {
      name: "addHangmanWord",
    },
    async execute(interaction, client) {
        let newWord = interaction.fields.getTextInputValue("newHangmanWord");
        let newCategory = interaction.fields.getTextInputValue("newHangmanCategory");

        const guild = await Guild.findOne({
            guildId: interaction.guild.id,
        });

        // check if the word already exists
        const wordExists = guild.guildSettings.hangmanSettings.find((word) => word.word === newWord);
        if (wordExists) {
            const embed = new EmbedBuilder()
            .setTitle("Server Settings")
            .setDescription(`The word ${newWord} already exists in the hangman game!`)
            .setThumbnail(
                "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
              )
            .setColor(0xff0000)
            .setTimestamp();
            await interaction.update({ embeds: [embed] });
            return;
        } else {
            // add the word to the database
            guild.guildSettings.hangmanSettings.push({ word: newWord, category: newCategory });
            await guild.save();
            const embed = new EmbedBuilder()
            .setTitle("Server Settings")
            .setDescription(`The word ${newWord} has been added to the hangman game under the category ${newCategory}!`)
            .setThumbnail(
                "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
              )
            .setColor(0x00deff)
            .setTimestamp();
            await interaction.update({ embeds: [embed] });
        }
    },
};

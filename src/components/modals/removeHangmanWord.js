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
      name: "removeHangmanWord",
    },
    async execute(interaction, client) {
        let newWord = interaction.fields.getTextInputValue("removingHangmanWord");
        // get the first word from the input
        newWord = newWord.split(" ")[0];

        const guild = await Guild.findOne({
            guildId: interaction.guild.id,
        });

        // check if the word exists
        const wordExists = guild.guildSettings.hangmanSettings.find((word) => word.word === newWord);
        if (wordExists) {
            // remove the word's object from the array
            guild.guildSettings.hangmanSettings = guild.guildSettings.hangmanSettings.filter((word) => word.word !== newWord);
            await guild.save();
            const embed = new EmbedBuilder()
            .setTitle("Server Settings")
            .setDescription(`The word ${newWord} has been removed from the hangman game!`)
            .setThumbnail(
                "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
              )
            .setColor(0x00deff)
            .setTimestamp();
            await interaction.update({ embeds: [embed] });
            return;
        } else {
            const embed = new EmbedBuilder()
            .setTitle("Server Settings")
            .setDescription(`The word ${newWord} is not in your server's wordlist!`)
            .setThumbnail(
                "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
              )
            .setColor(0xff0000)
            .setTimestamp();
            await interaction.update({ embeds: [embed] });
        }
    },
};

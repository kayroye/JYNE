const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const mongoose = require("mongoose");
const DiscordUser = require("../../events/schemas/discordUser.js");

module.exports = {
  data: {
    name: "prefixSet",
  },
  async execute(interaction, client) {
    const prefix = interaction.fields.getTextInputValue("newPrefix");
    const user = await DiscordUser.findOne({
        userId: interaction.user.id,
    }).populate("settings");
    // make the prefix one word
    const prefixArray = prefix.split(" ");
    const newPrefix = prefixArray[0];
    // update the prefix
    user.settings.prefix = newPrefix;
    await user.settings.save();
    const embed = new EmbedBuilder()
      .setTitle("New prefix set!")
      .setDescription(`Your new prefix is: ${newPrefix}!`)
      .setThumbnail(
        "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
      )
      .addFields({
        name: "Example",
        value: `${newPrefix} ${user.userName} I've found some results for...`,
      })
      .setColor(0x00deff)
      .setTimestamp();
    await interaction.update({ embeds: [embed], components: [] });
  },
};

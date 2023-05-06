const {
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
const Guild = require("../../events/schemas/guild.js");
const mongoose = require("mongoose");

module.exports = {
  data: {
    name: "eAutoResponses",
  },
  async execute(interaction, client) {
    let currentGuild = await Guild.findOne({ guildId: interaction.guild.id });
    currentGuild.guildSettings.respondToMessages = true;
    const embed = new EmbedBuilder()
      .setTitle("Server Settings")
      .setDescription(
        `Here you can edit how J.Y.N.E behaves in ${currentGuild.guildName}.`
      )
      .setThumbnail(
        "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
      )
      .addFields({
        name: "Auto Responses",
        value: `${
          currentGuild.guildSettings.respondToMessages
            ? "**Enabled**"
            : "**Disabled**"
        }.`,
      })
      .setFooter({ text: "Page 1" })
      .setColor(0x00deff)
      .setTimestamp();
    const enable = new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setLabel("Enable")
      .setCustomId("eAutoResponses")
      .setDisabled(currentGuild.guildSettings.respondToMessages);
    const disable = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel("Disable")
      .setCustomId("dAutoResponses")
      .setDisabled(!currentGuild.guildSettings.respondToMessages);
    const row = new ActionRowBuilder().addComponents([enable, disable]);
    await interaction.update({ embeds: [embed], components: [row] });
    await currentGuild.save();
  },
};

const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "cancelPrefix",
  },
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("You do not have a prefix set.")
      .setDescription("Cancelled.")
      .setThumbnail("https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png")
      .setColor(0x00deff)
      .setTimestamp();
    await interaction.update({ embeds: [embed], components: [] });
  },
};

const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
  } = require("discord.js");

module.exports = {
    data: {
        name: "payCancel",
    },
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("Payment Cancelled")
            .setThumbnail("https://media.discordapp.net/attachments/933049423217459251/1068206447709671424/elysium_central_bank.png?width=468&height=468")
            .setDescription("You have cancelled your payment.")
            .setColor(0x6490cd)
            .setTimestamp();
        await interaction.update({ embeds: [embed], components: [] });
    }
}
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const mongoose = require("mongoose");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay another user Elysium.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to pay.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of Elysium you want to pay.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    if (amount < 1) {
      await interaction.reply({
        content: `You can't pay less than 1 <:elysium:1068187873909690508> Elysium!`,
        ephemeral: true,
      });
    } else {
      if (user) {
        if (user.id === interaction.user.id) {
          await interaction.reply({
            content: `You can't pay yourself!`,
            ephemeral: true,
          });
        } else {
          const payer = await DiscordUser.findOne({
            userId: interaction.user.id,
          });
          const payee = await DiscordUser.findOne({ userId: user.id });

          if (!payer) {
            await interaction.reply({
              content: `You don't have any Elysium to pay! You can get some by using the \`/daily\` or \`/balance\` commands.`,
              ephemeral: true,
            });
          } else if (!payee) {
            await interaction.reply({
              content: `This user doesn't have a balance to receive Elysium! They can get some by using the \`/daily\` or \`/balance\` commands.`,
              ephemeral: true,
            });
          } else if (payer.elysium < amount) {
            await interaction.reply({
              content: `You don't have enough Elysium to pay!`,
              ephemeral: true,
            });
          } else {
            const embed = new EmbedBuilder()
              .setTitle("Confirm Payment")
              .setThumbnail("https://media.discordapp.net/attachments/933049423217459251/1068206447709671424/elysium_central_bank.png?width=468&height=468")
              .setDescription(
                `Are you sure you want to pay ${user.username} ${amount} <:elysium:1068187873909690508> Elysium?`
              )
              .setColor(0x6490cd)
              .setFooter({
                text: `Transaction ID: $${amount}#${user.id}`,
              })
              .setTimestamp();
            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("payConfirm")
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId("payCancel")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger)
            );
            await interaction.reply({
              embeds: [embed],
              components: [row],
              ephemeral: true,
            });
          }
        }
      }
    }
  },
};

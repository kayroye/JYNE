const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const { createUser } = require("../../newUser.js");
const mongoose = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Returns your balance.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to check the balance of.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    if (user) {
      const userBalance = await DiscordUser.findOne({ userId: user.id });
      if (!userBalance) {
        // if the user is not in the database, add them
        createUser(user.id, user.username);
        const embed = new EmbedBuilder()
          .setTitle("Elysium Balance")
          .setDescription(
            `${user.username} has 50 <:elysium:1068187873909690508> Elysium.`
          )
          .setColor(0x6490cd)
          .setTimestamp();

        await interaction.reply({
          content: `This user was not in my database. They have been added and given Elysium.`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setTitle("Elysium Balance")
          .setDescription(
            `${user.username} has ${userBalance.elysium} <:elysium:1068187873909690508> Elysium.`
          )
          .setColor(0x6490cd)
          .setTimestamp();
        await interaction.reply({
          content: `Here is the balance of ${user.username}:`,
          embeds: [embed],
        });
      }
    } else {
      const userBalance = await DiscordUser.findOne({
        userId: interaction.user.id,
      });
      if (!userBalance) {
        // if the user is not in the database, add them
        createUser(interaction.user.id, interaction.user.username);
        const embed = new EmbedBuilder()
          .setTitle("Elysium Balance")
          .setDescription(`You have 50 <:elysium:1068187873909690508> Elysium.`)
          .setColor(0x6490cd)
          .setTimestamp();

        await interaction.reply({
          content: `You were not in my database. I added and gave you Elysium.`,
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setTitle("Elysium Balance")
          .setDescription(
            `You have ${userBalance.elysium} <:elysium:1068187873909690508> Elysium.`
          )
          .setColor(0x6490cd)
          .setTimestamp();
        await interaction.reply({
          content: `Here is your balance:`,
          embeds: [embed],
        });
      }
    }
  },
};

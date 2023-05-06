const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const mongoose = require("mongoose");
const DiscordUser = require("../../events/schemas/discordUser.js");

module.exports = {
  data: {
    name: "payConfirm",
  },
  async execute(interaction) {
    // get the embed
    const embed = interaction.message.embeds[0];
    // get the user
    let payer = interaction.user.id;
    // get the payee from the footer (everything after the #)
    let payee = embed.footer.text.split("#")[1];
    // get the amount from the footer (everything before the # but after the space)
    let amount = embed.footer.text.split("#")[0].split("$")[1];
    amount = parseInt(amount);
    // get the payer's document
    payer = await DiscordUser.findOne({ userId: payer });
    // get the payee's document
    payee = await DiscordUser.findOne({ userId: payee });
    // subtract the amount from the payer's document
    payer.elysium -= amount;
    // add the amount to the payee's document
    payee.elysium += amount;
    console.log(payee.elysium);
    let success = true;
    // save the payer's document
    await payer
      .save()
    // save the payee's document
    await payee.save();
    // send the payee a message saying they've been paid
    const payeeUser = await interaction.client.users.fetch(payee.userId);
    try {
      await payeeUser.send(
        `>>> You have received ${amount} <:elysium:1068187873909690508> Elysium from ${interaction.user.username}!\nYou can view your balance by using the \`/balance\` command.
          `
      );
    } catch (err) {
      success = false;
    }
    // edit the embed
    const newEmbed = new EmbedBuilder()
      .setTitle("Payment Successful!")
      .setThumbnail(
        "https://media.discordapp.net/attachments/933049423217459251/1068206447709671424/elysium_central_bank.png?width=468&height=468"
      )
      .setDescription(
        `You have successfully paid ${payee.userName} ${amount} <:elysium:1068187873909690508> Elysium!`
      )
      .setColor(0x6490cd)
      .setTimestamp();
    // edit the embed
    await interaction.update({ embeds: [newEmbed], components: [] });
    if (!success) {
      // send a message to the channel saying the payee needs to enable DMs
      await interaction.channel.send({ content: `<@${payee.userId}>, ${payer.userName} has paid you ${amount} <:elysium:1068187873909690508> Elysium! Please enable DMs from server members to receive this message in the future.`});
    }
  },
};

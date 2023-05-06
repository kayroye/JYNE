const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
    AttachmentBuilder,
} = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");

module.exports = {
  data: {
    name: "nextCreation",
  },
  async execute(interaction, client) {
    // get the embed from the message
    const prevEmbed = interaction.message.embeds[0];
    // get everything after the # in the footer
    let toSubtract = prevEmbed.footer.text.split("#")[1];
    toSubtract = parseInt(toSubtract);
    // get the user
    const user = await DiscordUser.findOne({ userId: interaction.user.id }).populate("settings");
    const theIndex = user.aiGenerations.length - toSubtract - 1;

    let date = new Date(user.aiGenerations[theIndex].dateCreated);
    let usersName = user.userName;
    if (user.settings.prefix !== "" && user.settings.prefix !== undefined) {
        usersName = user.settings.prefix + " " + user.userName;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${usersName}'s AI Creations`)
      .setDescription(
        `These are the AI-generated images you have made, **${usersName}**.`
      )
      .setThumbnail(
        "https://media.discordapp.net/attachments/1051228955425914933/1071485063721664542/dream-img-done.gif?width=676&height=676"
      )
      .setColor(0x00deff)
      .setFooter({ text: `In Your Gallery: Image #${toSubtract + 1}` })
      .setTimestamp();
    date = date.toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    embed.addFields(
      {
        name: `Prompt`,
        value: user.aiGenerations[theIndex].prompt,
      },
      {
        name: `Seed`,
        value: `${user.aiGenerations[theIndex].seed}`,
      },
      {
        name: `Date Created`,
        value: date + " EST",
      }
    );
    const file = new AttachmentBuilder(
      user.aiGenerations[theIndex].pathToImage
    );
    embed.setImage(`attachment://${user.aiGenerations[theIndex].fileName}`);

    const previousImage = new ButtonBuilder()
      .setCustomId("previousCreation")
      .setLabel("⬅️")
      .setStyle(ButtonStyle.Primary);
    const nextImage = new ButtonBuilder()
      .setCustomId("nextCreation")
      .setLabel("➡️")
      .setStyle(ButtonStyle.Primary);

      if(toSubtract + 1 === user.aiGenerations.length){
        nextImage.setDisabled(true);
      }

    const row = new ActionRowBuilder()
        .addComponents(previousImage, nextImage);

    interaction.update({
        embeds: [embed],
        files: [file],
        components: [row],
    });
  },
};

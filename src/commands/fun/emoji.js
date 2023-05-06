const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emoji")
    .setDescription("This command will send an emoji of your choice.")
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("The emoji you would like to send.")
        .setRequired(true)
        .addChoices(
          { name: "woe", value: "woeis" },
          { name: "oioi", value: "oioi" },
          { name: "pengdance", value: "pengdance" },
          { name: "pepesleep", value: "pepesleep"},
          { name: "pepesword", value: "pepesword" },
          { name: "pepesmile", value: "pepesmile"},
          { name: "woris", value: "woris"},
          { name: "ohyeah", value: "ohyeah"},
          { name: "niceone", value: "niceone"}
        )
    ),
  async execute(interaction) {
    const emoji = interaction.options.getString("emoji");
    console.log(emoji);
    const message = await interaction.deferReply();
    if (emoji === "woeis") {
      await interaction.editReply("https://cdn.discordapp.com/emojis/864589487971369001.webp?size=48&quality=lossless");
    } else if (emoji === "oioi") {
      await interaction.editReply("<:oioi:869254735734145096>");
    } else if (emoji === "pengdance") {
      await interaction.editReply("https://cdn.discordapp.com/emojis/931199700609159218.gif?size=48&quality=lossless");
    } else if (emoji === "pepesleep") {
        await interaction.editReply("https://cdn.discordapp.com/emojis/931209316017520641.webp?size=48&quality=lossless");
    } else if (emoji === "pepesword") {
        await interaction.editReply("https://cdn.discordapp.com/emojis/931206643256004679.gif?size=56&quality=lossless");
    } else if (emoji === "pepesmile") {
        await interaction.editReply("https://cdn.discordapp.com/emojis/882310578931134484.webp?size=48&quality=lossless");
    } else if (emoji === "woris") {
        await interaction.editReply("https://cdn.discordapp.com/emojis/994677336844804176.webp?size=48&quality=lossless");
    } else if (emoji === "ohyeah") {
        await interaction.editReply("https://cdn.discordapp.com/emojis/986957231356534787.webp?size=48&quality=lossless");
    } else if (emoji === "niceone") {
        await interaction.editReply("https://cdn.discordapp.com/emojis/853022442615341066.webp?size=48&quality=lossless");
    }
  },
};

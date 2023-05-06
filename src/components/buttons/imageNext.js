const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "imageNext",
  },
  async execute(interaction, client) {
    let i = 0;
    // get the footer from the embed
    const footer = interaction.message.embeds[0].footer.text;
    // get the title from the embed
    let title = interaction.message.embeds[0].title;
    // set i to the last characters of the footer text
    i = footer.substring(footer.indexOf("•") + 2);
    // convert i to a number
    i = Number(i - 1);
    if (i < 0) {
      i = 0;
    }
    i++;
    // read the cache
    const cache = JSON.parse(fs.readFileSync("imageSearchCache.json"));
    // get the length of the value array
    const listLength = cache.value.length;
    if (listLength === 1) {
      i = 0;
    }
    try {
      let description =
        "[" +
        cache.value[i].title +
        "]" +
        "(" +
        cache.value[i].webpageUrl +
        ")";
      let image = cache.value[i].url;
      const imageEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setImage(image)
        .setFooter({ text: `Results from USearch • ${i + 1}` })
        .addFields({
          name: "Image",
          value: `[Link to Image](${image})`,
          inline: true,
        })
        .setTimestamp();
      const nextButton = new ButtonBuilder()
        .setCustomId("imageNext")
        .setLabel("➡")
        .setStyle(ButtonStyle.Primary);
      if (i === listLength - 1) {
        nextButton.setDisabled(true);
      }
      const previousButton = new ButtonBuilder()
        .setCustomId("imagePrevious")
        .setLabel("⬅")
        .setStyle(ButtonStyle.Primary);
      const actionRow = new ActionRowBuilder().addComponents([
        previousButton,
        nextButton,
      ]);
      await interaction.update({
        embeds: [imageEmbed],
        components: [actionRow],
      });
    } catch (error) {
      console.log(error);
      const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("An error occurred while trying to get the next image.")
        .setColor("0xff0000");
      await interaction.update({ embeds: [errorEmbed] });
    }
  },
};

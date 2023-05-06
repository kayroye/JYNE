const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "imagePrevious",
  },
  async execute(interaction, client) {
    let j = 0;
    // get the footer from the embed
    const footer = interaction.message.embeds[0].footer.text;
    // get the title from the embed
    let title = interaction.message.embeds[0].title;
    // set i to the last characters of the footer text
    j = footer.substring(footer.indexOf("•") + 2);
    // convert i to a number
    j = Number(j - 2);
    if (j < 0) {
      j = 0;
    }
    // read the cache
    const cache = JSON.parse(fs.readFileSync("imageSearchCache.json"));
    // get the length of the value array
    const listLength = cache.value.length;
    try {
      let description =
        "[" +
        cache.value[j].title +
        "]" +
        "(" +
        cache.value[j].webpageUrl +
        ")";
      let image = cache.value[j].url;
      const imageEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setImage(image)
        .setFooter({ text: `Results from USearch • ${j + 1}` })
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
      const previousButton = new ButtonBuilder()
        .setCustomId("imagePrevious")
        .setLabel("⬅")
        .setStyle(ButtonStyle.Primary);
    if (j === 0 ){
        previousButton.setDisabled(true);
    }
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

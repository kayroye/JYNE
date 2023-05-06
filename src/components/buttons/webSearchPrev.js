const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "webSearchPrev",
  },
  async execute(interaction) {
    // get embed from interaction
    const prevEmbed = interaction.message.embeds[0];
    // get footer text
    const footer = prevEmbed.footer.text;
    console.log(footer);
    // set j to the last character of the footer text
    let j = footer.charAt(footer.length - 1);
    // convert j to a number
    j = Number(j - 2);
    if (j < 0) {
      j = 0;
    }
    console.log(j);
    // read cache.json file
    const cache = JSON.parse(fs.readFileSync("cache.json"));
    
    let image = cache.value[j].image.url;
    if (image === "") {
      image = null;
    }
    const embed = new EmbedBuilder()
      .setTitle(cache.value[j].title)
      .setURL(cache.value[j].url)
      .setDescription(cache.value[j].snippet)
      .setThumbnail("https://cdn.discordapp.com/attachments/1051228955425914933/1057891055585996810/webIMG.png")
      .setImage(image)
      .setFooter({ text: `Data from USearch.com • ${j + 1}` })
      .setTimestamp();
    const next = new ButtonBuilder()
      .setCustomId("webSearchNext")
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary);
    const prev = new ButtonBuilder()
      .setCustomId("webSearchPrev")
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary);

    if (j === 0) {
      prev.setDisabled(true);
    }
    
    const row = new ActionRowBuilder().addComponents(prev, next);
    interaction.update({ embeds: [embed], components: [row] });
  },
};

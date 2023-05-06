const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "dictPrev",
  },
  async execute(interaction) {
    // get embed from interaction
    const prevEmbed = interaction.message.embeds[0];
    // get footer text
    const footer = prevEmbed.footer.text;
    console.log(footer);
    // set j to the characters after the the word "•"
    let j = footer.substring(footer.indexOf("•") + 2);
    console.log(j);
    // convert j to a number
    j = Number(j - 2);
    if (j < 0) {
      j = 0;
    }
    // read cache.json file
    const cache = JSON.parse(fs.readFileSync("dictCache.json"));
    let likes = cache.list[j].thumbs_up;
    likes = likes.toLocaleString();
    let dislikes = cache.list[j].thumbs_down;
    dislikes = dislikes.toLocaleString();
    const embed = new EmbedBuilder()
      .setTitle(cache.list[j].word)
      .setURL(cache.list[j].permalink)
      .setThumbnail("https://cdn.discordapp.com/attachments/1051228955425914933/1057883617143038103/dictIMG.png")
      .setDescription(cache.list[j].definition)
      .addFields(
        { name: "Example", value: cache.list[j].example },
        { name: "Author", value: cache.list[j].author },
        { name: "Likes", value: likes },
        { name: "Dislikes", value: dislikes }
      )
      .setFooter({ text: "Data from Urban Dictionary" + ` • ${j + 1}` });
    const dictNext = new ButtonBuilder()
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("dictNext");
    const dictPrev = new ButtonBuilder()
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("dictPrev");
    if (j === 0) {
      dictPrev.setDisabled(true);
    }
    const dictRow = new ActionRowBuilder().addComponents(dictPrev, dictNext);
    interaction.update({ embeds: [embed], components: [dictRow] });
  },
};

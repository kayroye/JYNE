const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "dictNext",
  },
  async execute(interaction) {
    let i = 0;
    // get embed from interaction
    const prevEmbed = interaction.message.embeds[0];
    // get footer text
    const footer = prevEmbed.footer.text;
    console.log(footer);
    // set i to the last characters of the footer text
    i = footer.substring(footer.indexOf("•") + 2);
    // convert i to a number
    i = Number(i - 1);
    if (i < 0) {
      i = 0;
    }
    i++;
    console.log(i);
    // read cache.json file
    const cache = JSON.parse(fs.readFileSync("dictCache.json"));
    // get the length of the list
    const listLength = cache.list.length;
    let likes = cache.list[i].thumbs_up;
    likes = likes.toLocaleString();
    let dislikes = cache.list[i].thumbs_down;
    dislikes = dislikes.toLocaleString();
    const embed = new EmbedBuilder()
      .setTitle(cache.list[i].word)
      .setURL(cache.list[i].permalink)
      .setThumbnail("https://cdn.discordapp.com/attachments/1051228955425914933/1057883617143038103/dictIMG.png")
      .setDescription(cache.list[i].definition)
      .addFields(
        { name: "Example", value: cache.list[i].example },
        { name: "Author", value: cache.list[i].author },
        { name: "Likes", value: likes },
        { name: "Dislikes", value: dislikes }
      )
      .setFooter({ text: "Data from Urban Dictionary" + ` • ${i + 1}` });
    const dictNext = new ButtonBuilder()
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("dictNext");
    const dictPrev = new ButtonBuilder()
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("dictPrev");
    // if i is equal to the length of the list (user is on the last page)
    if (i === listLength - 1) {
      dictNext.setDisabled(true);
    }
    const dictRow = new ActionRowBuilder().addComponents(dictPrev, dictNext);
    interaction.update({ embeds: [embed], components: [dictRow] });
  },
};

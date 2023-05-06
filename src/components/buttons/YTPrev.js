const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "YTPrev",
  },
  async execute(interaction) {
    let i = 0;
    // get message from interaction
    const prevMessage = interaction.message;
    console.log(prevMessage);
    // set i to the last character of the message text
    j = prevMessage.content.charAt(prevMessage.content.length - 1);
    // convert i to a number
    j = Number(j - 2);
    if (j < 0) {
      j = 0;
    }
    i++;
    console.log(i);
    // read cache.json file
    const cache = JSON.parse(fs.readFileSync("YTcache.json"));
    let link = cache.items[j].url;
    const items = cache.results;
    if (link === "") {
      link = cache.items[j - 1].url;
    }
    link += ` • Result #${j + 1}`;
    const next = new ButtonBuilder()
      .setCustomId("YTNext")
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary);
    const prev = new ButtonBuilder()
      .setCustomId("YTPrev")
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary);
    if (j === 0) {
        prev.setDisabled(true);
    }
    if (j === items) {
        next.setDisabled(true);
    }
    const row = new ActionRowBuilder().addComponents(prev, next);
    interaction.update({ content: link, components: [row] });
  },
};

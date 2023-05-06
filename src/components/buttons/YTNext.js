const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "YTNext",
  },
  async execute(interaction) {
    let i = 0;
    // get message from interaction
    const prevMessage = interaction.message;
    console.log(prevMessage)
    // set i to the last character of the message text
    i = prevMessage.content.charAt(prevMessage.content.length - 1);
    // convert i to a number
    i = Number(i - 1);
    if (i < 0) {
      i = 0;
    }
    i++;
    console.log(i);
    // read cache.json file
    const cache = JSON.parse(fs.readFileSync("YTcache.json"));
    let link = cache.items[i].url;
    const items = cache.results;
    if (link === "") {
      link = cache.items[i - 1].url;
    }
    link += ` • Result #${i + 1}`;
    const next = new ButtonBuilder()
      .setCustomId("YTNext")
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary);
    const prev = new ButtonBuilder()
      .setCustomId("YTPrev")
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary);
      if (i === 0) {
        prev.setDisabled(true);
    }
    if (i === (items - 1)) {
        next.setDisabled(true);
    }
    const row = new ActionRowBuilder().addComponents(prev, next);
    interaction.update({ content: link, components: [row] });
  },
};

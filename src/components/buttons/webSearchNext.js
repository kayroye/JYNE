const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
  } = require("discord.js");
  const fs = require("fs");
  
  module.exports = {
    data: {
      name: "webSearchNext",
    },
    async execute(interaction) {
      let i = 0;
      // get embed from interaction
      const prevEmbed = interaction.message.embeds[0];
      // get footer text
      const footer = prevEmbed.footer.text;
      console.log(footer);
      // set i to the last character of the footer text
      i = footer.charAt(footer.length - 1);
      // convert i to a number
      i = Number(i - 1);
      if (i < 0) {
        i = 0;
      }
      i++;
      console.log(i);
      // read cache.json file
      const cache = JSON.parse(fs.readFileSync("cache.json"));
      let image = cache.value[i].image.url;
      if (image === "") {
        image = null;
      }
      const embed = new EmbedBuilder()
        .setTitle(cache.value[i].title)
        .setURL(cache.value[i].url)
        .setThumbnail("https://cdn.discordapp.com/attachments/1051228955425914933/1057891055585996810/webIMG.png")
        .setDescription(cache.value[i].snippet)
        .setImage(image)
        .setFooter({ text: `Data from USearch.com • ${i + 1}` })
        .setTimestamp();
      const next = new ButtonBuilder()
        .setCustomId("webSearchNext")
        .setLabel("➡")
        .setStyle(ButtonStyle.Primary);
      const prev = new ButtonBuilder()
        .setCustomId("webSearchPrev")
        .setLabel("⬅")
        .setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(prev, next);
      interaction.update({ embeds: [embed], components: [row] });
    },
  };
  
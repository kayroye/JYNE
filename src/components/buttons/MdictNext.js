const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "MdictNext",
  },
  async execute(interaction) {
    let i = 0;
    // get embed from interaction
    const prevEmbed = interaction.message.embeds[0];
    // get title text
    const title = prevEmbed.title;
    console.log(title);
    // set i to the last characters of the footer text
    i = title.substring(title.indexOf("•") + 2);
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
    const listLength = cache.length;
    let etitle = cache[i].meta.id;
    console.log(etitle);
    console.log(cache[i].shortdef);
    // remove all chars after ':'
    etitle = etitle.replace(/:.*/, "");
    let pronunciation = "";
    if (cache[i].hwi.hw === etitle) {
      pronunciation = "Same as word";
    } else {
      pronunciation = cache[i].hwi.prs[0].mw;
    }
    etitle += ` •  ${i + 1}`;
    let shortDef = "";
    // put all short definitions into one string
    for (let items = 0; items < cache[i].shortdef.length; items++) {
      shortDef += cache[i].shortdef[items];
      shortDef += "\n";
    }
    // put all stems into one string
    let stems = "";
    for (let items = 0; items < cache[i].meta.stems.length; items++) {
      stems += cache[i].meta.stems[items];
      stems += "\n";
    }
    const MdictNext = new ButtonBuilder()
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("MdictNext");
    const MdictPrev = new ButtonBuilder()
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("MdictPrev");
    const dictRow = new ActionRowBuilder().addComponents(MdictPrev, MdictNext);
    if (cache[i].meta.offensive === true) {
      const embed = new EmbedBuilder()
        .setTitle("This word has offensive definitions.")
        .setDescription("Please continue searching.");

      await interaction.editReply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(etitle)
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/1051228955425914933/1057883617143038103/dictIMG.png"
        )
        .addFields(
          { name: "Definition", value: shortDef },
          { name: "Part of Speech", value: cache[i].fl },
          { name: "Pronunciation", value: pronunciation },
          { name: "Related Words", value: stems }
        )
        .setColor("#A06029")
        .setFooter({ text: "Data from Merriam-Webster" });
      const MdictRow = new ActionRowBuilder().addComponents(
        MdictPrev,
        MdictNext
      );
      // if i is equal to the length of the list (user is on the last page)
      if (i === listLength - 1) {
        MdictNext.setDisabled(true);
      }
      interaction.update({ embeds: [embed], components: [dictRow] });
    }
  },
};

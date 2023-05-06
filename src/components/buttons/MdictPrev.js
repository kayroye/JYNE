const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "MdictPrev",
  },
  async execute(interaction) {
    // get embed from interaction
    const prevEmbed = interaction.message.embeds[0];
    // get title text
    const title = prevEmbed.title;
    console.log(title);
    // set i to the last characters of the footer text
    j = title.substring(title.indexOf("•") + 2);
    // convert i to a number
    j = Number(j - 2);
    if (j < 0) {
      j = 0;
    }
    console.log(j);
    // read cache.json file
    const cache = JSON.parse(fs.readFileSync("dictCache.json"));
    // get the length of the list
    const listLength = cache.length;
    let etitle = cache[j].meta.id;
    console.log(etitle);
    console.log(cache[j].shortdef);
    // remove all chars after ':'
    etitle = etitle.replace(/:.*/, "");
    let pronunciation = "";
    if (cache[j].hwi.hw === etitle) {
      pronunciation = "Same as word";
    } else {
      pronunciation = cache[j].hwi.prs[0].mw;
    }
    etitle += ` •  ${j + 1}`;
    let shortDef = "";
    // put all short definitions into one string
    for (let items = 0; items < cache[j].shortdef.length; items++) {
      shortDef += cache[j].shortdef[items];
      shortDef += "\n";
    }
    // put all stems into one string
    let stems = "";
    for (let items = 0; items < cache[j].meta.stems.length; items++) {
      stems += cache[j].meta.stems[items];
      stems += "\n";
    }

    const embed = new EmbedBuilder()
      .setTitle(etitle)
      .setThumbnail("https://cdn.discordapp.com/attachments/1051228955425914933/1057883617143038103/dictIMG.png")
      .addFields(
        { name: "Definition", value: shortDef },
        { name: "Part of Speech", value: cache[j].fl },
        { name: "Pronunciation", value: pronunciation },
        { name: "Related Words", value: stems }
      )
      .setFooter({ text: "Data from Merriam-Webster" })
      .setColor("#A06029");
    const MdictNext = new ButtonBuilder()
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("MdictNext");
    const MdictPrev = new ButtonBuilder()
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("MdictPrev");
    const MdictRow = new ActionRowBuilder().addComponents(MdictPrev, MdictNext);
    // if i is equal to the length of the list (user is on the last page)
    if (j === 0) {
      MdictPrev.setDisabled(true);
    }
    const dictRow = new ActionRowBuilder().addComponents(MdictPrev, MdictNext);
    interaction.update({ embeds: [embed], components: [dictRow] });
  },
};

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");
const axios = require("axios");
const nodeyourmeme = require("nodeyourmeme");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("define")
    .setDescription("This command will define a word.")
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("The word you would like to define")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("dictionary")
        .setDescription("The dictionary you would like to use")
        .setRequired(true)
        .addChoices(
          { name: "Urban Dictionary", value: "urban" },
          { name: "Merriam-Webster", value: "merriam" },
          { name: "Knowyourmeme", value: "knowyourmeme" }
        )
    ),
  async execute(interaction) {
    const message = await interaction.deferReply();
    const word = interaction.options.getString("word");
    const dictionary = interaction.options.getString("dictionary");

    if (dictionary === "urban") {
      try {
        const response = await axios.get(
          `https://api.urbandictionary.com/v0/define?term=${word}`
        );
        const mainResponse = response.data;
        if (mainResponse.list.length === 0) { 
          const embed = new EmbedBuilder()
            .setTitle("This word was not found.")
            .setDescription("Please try another word.")
            .setColor("#A06029")
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/1051228955425914933/1057883617143038103/dictIMG.png"
            );
          await interaction.editReply({ embeds: [embed] });
          return;
        }
        // convert the response to a string
        let stringResponse = JSON.stringify(mainResponse);
        // replace all instances of \r with nothing
        stringResponse = stringResponse.replace(/\\r/g, "");
        fs.writeFileSync("dictCache.json", stringResponse, (err) => {
          if (err) {
            console.log(err);
          }
        });
        let likes = mainResponse.list[0].thumbs_up;
        likes = likes.toLocaleString();
        let dislikes = mainResponse.list[0].thumbs_down;
        dislikes = dislikes.toLocaleString();
        let example = mainResponse.list[0].example;
        if (example === "") {
          example = "No example provided.";
        }
        const embed = new EmbedBuilder()
          .setTitle(mainResponse.list[0].word)
          .setURL(mainResponse.list[0].permalink)
          .setThumbnail(
            "https://cdn.discordapp.com/attachments/1051228955425914933/1057883617143038103/dictIMG.png"
          )
          .setDescription(mainResponse.list[0].definition)
          .addFields(
            { name: "Example", value: example },
            { name: "Author", value: mainResponse.list[0].author },
            { name: "Likes", value: likes },
            { name: "Dislikes", value: dislikes }
          )
          .setFooter({ text: "Data from Urban Dictionary • 1" });
        const dictNext = new ButtonBuilder()
          .setLabel("➡")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("dictNext");
        const dictPrev = new ButtonBuilder()
          .setLabel("⬅")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
          .setCustomId("dictPrev");
        const dictRow = new ActionRowBuilder().addComponents(
          dictPrev,
          dictNext
        );
        interaction.editReply({ embeds: [embed], components: [dictRow] });
      } catch (error) {
        console.log(error);
      }
    } else if (dictionary === "merriam") {
      // set mWord to the first word of word
      let mWord = word.split(" ")[0];
      try {
        const response = await axios.get(
          `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${mWord}?key=078cdb96-dec9-4614-9d0a-5d55cc7e57bb`
        );
        try {
          if (response.data[0].meta.offensive === true) {
            const embed = new EmbedBuilder()
              .setTitle("This word has offensive definitions.")
              .setDescription("Please try another word.");
            return interaction.editReply({ embeds: [embed] });
          } else {
            const mainResponse = response.data;
            // convert the response to a string
            let stringResponse = JSON.stringify(mainResponse);
            fs.writeFileSync("dictCache.json", stringResponse, (err) => {
              if (err) {
                console.log(err);
              }
            });
            let title = mainResponse[0].meta.id;
            // remove all chars after ':'
            title = title.replace(/:.*/, "");
            title += " • 1";
            // put all short definitions into one string
            let shortDef = "";
            for (let i = 0; i < mainResponse[0].shortdef.length; i++) {
              shortDef += mainResponse[0].shortdef[i];
              shortDef += "\n";
            }
            // put all stems into one string
            let stems = "";
            for (let i = 0; i < mainResponse[0].meta.stems.length; i++) {
              stems += mainResponse[0].meta.stems[i];
              stems += "\n";
            }
            const embed = new EmbedBuilder()
              .setTitle(title)
              .setThumbnail(
                "https://cdn.discordapp.com/attachments/1051228955425914933/1057883617143038103/dictIMG.png"
              )
              .addFields(
                { name: "Definition", value: shortDef },
                { name: "Part of Speech", value: mainResponse[0].fl },
                { name: "Pronunciation", value: mainResponse[0].hwi.prs[0].mw },
                { name: "Related Words", value: stems }
              )
              .setColor("#A06029")
              .setFooter({ text: "Data from Merriam-Webster" });
            const MdictNext = new ButtonBuilder()
              .setLabel("➡")
              .setStyle(ButtonStyle.Primary)
              .setCustomId("MdictNext");
            const MdictPrev = new ButtonBuilder()
              .setLabel("⬅")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
              .setCustomId("MdictPrev");
            const MdictRow = new ActionRowBuilder().addComponents(
              MdictPrev,
              MdictNext
            );
            interaction.editReply({ embeds: [embed], components: [MdictRow] });
          }
        } catch (error) {
          // take the values out of the data array and put them in a string
          const didUMean = response.data;
          let responseString = "";
          // take the values out of the data array and put them in a string
          for (let i = 0; i < 5; i++) {
            responseString += didUMean[i];
            responseString += "\n";
          }
          const embed = new EmbedBuilder()
            .setTitle("This word was not found.")
            .setDescription("Please try another word.")
            .setColor("#A06029")
            .addFields({ name: "Did you mean...", value: responseString })
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/1051228955425914933/1057883617143038103/dictIMG.png"
            );
          interaction.editReply({ embeds: [embed] });
        }
      } catch (error) {
        console.log(error);
      }
    } else if (dictionary === "knowyourmeme") {

      let memeResult;
      const memeLoad = await nodeyourmeme
        .search(word)
        .then(async (result) => {
          memeResult = result;
          const memeEmbed = new EmbedBuilder()
            .setTitle(memeResult.name)
            .setDescription(memeResult.about)
            .setFooter({ text: `Results provided by Knowyourmeme.com` })
            .setColor(0x00ae86)
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/1051228955425914933/1058160905252257802/memeIMG.png"
            )
            .setTimestamp();
          await interaction.editReply({
            embeds: [memeEmbed]
          });
        })
        .catch((err) => {
          console.log(err);
          const memeEmbed = new EmbedBuilder()
            .setTitle("No results found.")
            .setDescription("Try searching for something else.")
            .setFooter({ text: `Results provided by Knowyourmeme.com` })
            .setColor(0x00ae86)
            .setTimestamp();
          interaction.editReply({ embeds: [memeEmbed] });
        });
    }
  },
};

const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const axios = require("axios");
const fs = require("fs");

module.exports = {
    data: {
        name: "geniusYT"
    },
    async execute(interaction) {
        // get the title from the embed
        const message = await interaction.deferReply();
        const title = interaction.message.embeds[0].title;
        console.log(title);
        const options = {
            method: "GET",
            url: "https://youtube-search-results.p.rapidapi.com/youtube-search/",
            params: { q: title },
            headers: {
              "X-RapidAPI-Key": process.env.RAPID_API_KEY,
              "X-RapidAPI-Host": "youtube-search-results.p.rapidapi.com",
            },
          };
      
          axios
            .request(options)
            .then(async function (response) {
              console.log(response.data);
              let stringly = JSON.stringify(response.data);
              // replace all instances of <b> with ** and </b> with **
              stringly = stringly.replace(/<b>/g, "**");
              stringly = stringly.replace(/<\/b>/g, "**");
              // write to file
              fs.writeFileSync("YTcache.json", stringly, (err) => {
                if (err) {
                  console.log(err);
                }
              });
              // get how many items found
              const items = response.data.results;
              if (items === 0) {
                // send a message to the channel
                await interaction.reply("No results found.");
                return;
              } else {
                let link = response.data.items[0].url;
                const next = new ButtonBuilder()
                  .setCustomId("YTNext")
                  .setLabel("➡")
                  .setStyle(ButtonStyle.Primary);
                const prev = new ButtonBuilder()
                  .setCustomId("YTPrev")
                  .setLabel("⬅")
                  .setStyle(ButtonStyle.Primary)
                  .setDisabled(true);
                if (link === undefined || link === null || link === "") {
                  link = "No results found.";
                  prev.setDisabled(true);
                  next.setDisabled(true);
                } else {
                  link += ` • Result #1`;
                }
                if (items === 1) {
                  next.setDisabled(true);
                  prev.setDisabled(true);
                }
                const row = new ActionRowBuilder().addComponents([prev, next]);
                await interaction.editReply({ content: link, components: [row] });
              }
            })
            .catch(function (error) {
              console.error(error);
            });
    }
};
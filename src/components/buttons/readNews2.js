const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  const request = require("request");
  const cheerio = require("cheerio");
  const fs = require("fs");
  
  module.exports = {
    data: {
      name: "readNews2",
    },
    async execute(interaction) {
      const message = await interaction.deferReply();
      const prevEmbed = interaction.message.embeds[0];
      // get link from field 1
      const urlOld = prevEmbed.fields[1].value;
      // remove everything up to '('
      let linkNew = urlOld.substring(urlOld.indexOf("(") + 1);
      // remove last character
      linkNew = linkNew.substring(0, linkNew.length - 1);
      // run the link through webseeking command
      request(linkNew, async function (error, response, html) {
        // Check for errors
        if (!error) {
          // Load the data into cheerio and save it to a variable
          // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
          const $ = cheerio.load(html);
  
          // An empty array to save the data that we'll scrape
          const result = [];
  
          // Select each element in the HTML body from which you want information.
          // NOTE: Cheerio selectors function similarly to jQuery's selectors,
          // but be sure to visit the package's npm page to see how it works
          $("h1").each(function (i, element) {
            // Save the text of the element in a "title" variable
            const title = $(element).text();
  
            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            const link = $(element).children().attr("href");
  
            // Save these results in an object that we'll push into the result array we defined earlier
            result.push({
              title: title,
              link: link,
            });
          });
  
          $("p").each(function (i, element) {
            let title = $(element).text();
            // remove all newlines and tabs and replace with a space
            title = title.replace(/(\r\n|\n|\r|\t)/gm, " ");
            // remove all double spaces
            title = title.replace(/  +/g, " ");
            const link = $(element).children().attr("href");
            result.push({
              title: title,
              link: link,
            });
          });
  
          // Log the result once cheerio analyzes each of its selected elements
          console.log(result);
          // Make a string of the result titles
          let resultString = "";
          for (let i = 0; i < result.length; i++) {
            // if the title has any /n or /t, remove them
            result[i].title = result[i].title.replace(/(\r\n|\n|\r|\t)/gm, " ");
            if (i < result.length - 1) {
              // check if the string after is the same as the current
              if (result[i].title === result[i + 1].title) {
                // if so, remove the current
                result.splice(i, 1);
              }
            }
            if (i === 0) {
              resultString += `**${result[i].title}** `;
            }
            resultString += result[i].title + " ";
          }
          // remove double spaces
          resultString = resultString.replace(/  +/g, " ");
          // put the result string into a text file
          fs.writeFile("msft.txt", resultString, function (err) {
            if (err) throw err;
            console.log("Saved!");
          });
  
          // call the python function to get the sentiment analysis
          const { spawn } = require("child_process");
          const pythonProcess = spawn("python", [
            `../../commands/fun/summarizer.py`,
          ]);
          let pythonResult = "";
          // try to get result from python script
          // if it takes more than 10 seconds, send a message saying it took too long
          pythonProcess.stdout.on("data", async (data) => {
            pythonResult = data.toString();
            // Remove all text before the words "Summarized Text:"
            pythonResult = pythonResult.substring(
              pythonResult.indexOf("Summarized Article:")
            );
            // Remove all � characters
            pythonResult = pythonResult.replace(/�/g, "");
            console.log(pythonResult);
            await interaction.editReply(pythonResult);
            setTimeout(async () => {
              if (pythonResult === "") {
                pythonProcess.kill();
                await interaction.reply(
                  "Sorry, it took too long to get the sentiment analysis."
                );
              }
            }, 10000);
          });
        } else {
          console.log("Error: " + error);
          await interaction.reply("Error: " + error);
        }
      });
    },
  };
  
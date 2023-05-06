const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();
const { Client } = require("twitter-api-sdk");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search the internet for a query.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("web")
        .setDescription("Search the web for a query.")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("The query you would like to search for.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("images")
        .setDescription("Search the web for images.")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("The query you would like to search for.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("youtube")
        .setDescription("Search YouTube for videos.")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("The query you would like to search for.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("news")
        .setDescription(
          "This command will pull up news articles based on a search term."
        )
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("The term you would like to search for")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("search_location")
            .setDescription("Where you would like to search for news.")
            .addChoices(
              { name: "United States", value: "us" },
              { name: "United Kingdom", value: "gb" },
              { name: "Canada", value: "ca" },
              { name: "India", value: "in" },
              { name: "Germany", value: "de" },
              { name: "Russia", value: "ru" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("sort")
            .setDescription("Set the sort priority of the articles.")
            .addChoices(
              { name: "Relevancy", value: "relevancy" },
              { name: "Popularity", value: "popularity" },
              { name: "Date", value: "publishedAt" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("Set the category of the articles.")
            .addChoices(
              { name: "Business", value: "business" },
              { name: "Entertainment", value: "entertainment" },
              { name: "General", value: "general" },
              { name: "Health", value: "health" },
              { name: "Science", value: "science" },
              { name: "Sports", value: "sports" },
              { name: "Technology", value: "technology" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("genius")
        .setDescription(
          "This command will pull up a song based on a search term."
        )
        .addStringOption((option) =>
          option
            .setName("search_type")
            .setDescription("The type of search you would like to perform")
            .addChoices({ name: "Song", value: "song" })
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("The term you would like to search for")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("twitter")
        .setDescription(
          "This command will pull up a tweet based on a search term."
        )
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("The term you would like to search for")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("author")
            .setDescription("The tweet author's username")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const message = await interaction.deferReply();
    if (subcommand === "web") {
      const query = interaction.options.getString("query");
      console.log(query);
      new Promise(async (resolve, reject) => {
        try {
          response = await axios.get(
            "https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/WebSearchAPI",
            {
              headers: {
                "X-RapidAPI-Key": process.env.RAPID_API_KEY,
                "X-RapidAPI-Host":
                  "contextualwebsearch-websearch-v1.p.rapidapi.com",
              },
              params: {
                q: query,
                pageNumber: "1",
                pageSize: "10",
                autoCorrect: "true",
              },
            }
          );
        } catch (error) {
          reject(error);
          console.log(error);
        }
        if (response) {
          const mainResponse = response.data;
          // replace all instances of <b> with ** and </b> with **
          stringy = JSON.stringify(mainResponse);
          stringy = stringy.replace(/<b>/g, "**");
          stringy = stringy.replace(/<\/b>/g, "**");
          resolve(mainResponse);
          // write mainResponse to a file using fs
          fs.writeFileSync("cache.json", stringy, (err) => {
            if (err) {
              console.log(err);
            }
          });
          try {
            let title = response.data.value[0].title;
            title = title.replace(/<b>/g, "**");
            title = title.replace(/<\/b>/g, "**");
            let description = response.data.value[0].snippet;
            description = description.replace(/<b>/g, "**");
            description = description.replace(/<\/b>/g, "**");
            let image = response.data.value[0].image.url;

            if (description === "") {
              description = "No description available.";
            }
            if (image === "") {
              image = null;
            }

            const embed = new EmbedBuilder()
              .setTitle(title)
              .setThumbnail(
                "https://cdn.discordapp.com/attachments/1051228955425914933/1057891055585996810/webIMG.png"
              )
              .setURL(response.data.value[0].url)
              .setDescription(description)
              .setImage(image)
              .setFooter({ text: "Data from USearch.com • 1" })
              .setTimestamp();
            const next = new ButtonBuilder()
              .setCustomId("webSearchNext")
              .setLabel("➡")
              .setStyle(ButtonStyle.Primary);
            const prev = new ButtonBuilder()
              .setCustomId("webSearchPrev")
              .setLabel("⬅")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true);
            const row = new ActionRowBuilder().addComponents(prev, next);
            interaction.editReply({ embeds: [embed], components: [row] });
          } catch (error) {
            console.log(error);
            await interaction.editReply("An error occurred while searching.");
          }
        }
      });
    } else if (subcommand === "news") {
      const NewsAPI = require("newsapi");
      const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
      const query = interaction.options.getString("query");
      console.log(query);

      let sort = "relevancy";
      if (interaction.options.getString("sort") !== null) {
        sort = interaction.options.getString("sort");
      }

      let country = "us";
      if (interaction.options.getString("search_location") !== null) {
        country = interaction.options.getString("search_location");
        const category = interaction.options.getString("category");
        const response = await newsapi.v2.topHeadlines({
          q: query,
          language: "en",
          country: country,
          category: category,
          sortBy: sort,
          pageSize: 3,
        });
        // store the article titles and descriptions as objects in an array
        // then loop through the array and add the fields to the embed
        const responses = [];
        for (let i = 0; i < 3; i++) {
          if (
            response.articles[i] === null ||
            response.articles[i] === undefined
          ) {
            break;
          } else {
            responses.push({
              name: response.articles[i].title,
              value:
                "[" +
                response.articles[i].description +
                "](" +
                response.articles[i].url +
                ")",
            });
          }
        }
        const embed = new EmbedBuilder();
        embed.setTitle(
          `Top 3 News Articles for '${query}' in ${country.toUpperCase()}`
        );
        if (category !== null) {
          embed.setDescription(
            "You added a search location, so the results have been set to *top headlines* in that country."
          );
        } else {
          embed.setDescription(
            "You added a search location, so the results have been set to *top headlines* in that country. You should also add a category to narrow down the results."
          );
        }
        embed.setColor("#008ae6");
        try {
          embed.addFields(responses);
        } catch (error) {
          embed.setDescription("An error occurred.");
          embed.setImage(response.articles[0].urlToImage);
          embed.setColor("#ff0000");
        }
        embed.setFooter({ text: "Powered by NewsAPI.org" });
        embed.setTimestamp();
        const readNews1 = new ButtonBuilder()
          .setCustomId("readNews1")
          .setLabel("Read Article 1")
          .setStyle(ButtonStyle.Primary);
        const readNews2 = new ButtonBuilder()
          .setCustomId("readNews2")
          .setLabel("Read Article 2")
          .setStyle(ButtonStyle.Primary);
        const readNews3 = new ButtonBuilder()
          .setCustomId("readNews3")
          .setLabel("Read Article 3")
          .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(
          readNews1,
          readNews2,
          readNews3
        );
        await interaction.editReply({ embeds: [embed], components: [row] });
      } else {
        const response = await newsapi.v2.everything({
          q: query,
          language: "en",
          sortBy: sort,
          pageSize: 3,
        });
        const responses = [];
        for (let i = 0; i < 3; i++) {
          if (
            response.articles[i] === null ||
            response.articles[i] === undefined
          ) {
            break;
          } else {
            responses.push({
              name: response.articles[i].title,
              value:
                "[" +
                response.articles[i].description +
                "](" +
                response.articles[i].url +
                ")",
            });
          }
        }
        const embed = new EmbedBuilder();
        embed.setTitle(`Top News Articles for '${query}'`);
        embed.setColor("#008ae6");
        try {
          embed.addFields(responses);
          embed.setImage(response.articles[0].urlToImage);
        } catch (error) {
          embed.setDescription("Not enough results found.");
          embed.setColor("#ff0000");
        }
        embed.setFooter({ text: "Powered by NewsAPI.org" });
        embed.setTimestamp();
        const readNews1 = new ButtonBuilder()
          .setCustomId("readNews1")
          .setLabel("Read Article 1")
          .setStyle(ButtonStyle.Primary);
        const readNews2 = new ButtonBuilder()
          .setCustomId("readNews2")
          .setLabel("Read Article 2")
          .setStyle(ButtonStyle.Primary);
        const readNews3 = new ButtonBuilder()
          .setCustomId("readNews3")
          .setLabel("Read Article 3")
          .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(
          readNews1,
          readNews2,
          readNews3
        );
        await interaction.editReply({ embeds: [embed], components: [row] });
      }
    } else if (subcommand === "images") {
      const query = interaction.options.getString("query");
      console.log(query);
      new Promise(async (resolve, reject) => {
        try {
          response = await axios.get(
            "https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/ImageSearchAPI",
            {
              headers: {
                "X-RapidAPI-Key": process.env.RAPID_API_KEY,
                "X-RapidAPI-Host":
                  "contextualwebsearch-websearch-v1.p.rapidapi.com",
              },
              params: {
                q: query,
                pageNumber: "1",
                pageSize: "10",
                autoCorrect: "true",
              },
            }
          );
        } catch (error) {
          reject(error);
          console.log(error);
        }
        if (response) {
          console.log(response.data);
          const mainResponse = response.data;
          resolve(mainResponse);
          stringy = JSON.stringify(mainResponse);
          fs.writeFileSync("imageSearchCache.json", stringy, (err) => {
            if (err) {
              console.log(err);
            }
          });
          try {
            let description =
              "[" +
              mainResponse.value[0].title +
              "]" +
              "(" +
              mainResponse.value[0].webpageUrl +
              ")";
            let title = "Showing results for '" + query + "'";
            let image = mainResponse.value[0].url;
            const embed = new EmbedBuilder()
              .setTitle(title)
              .setDescription(description)
              .setImage(image)
              .setColor(0x00ff00)
              .setFooter({ text: "Results from USearch • 1" })
              .addFields({
                name: "Image",
                value: `[Link to Image](${image})`,
                inline: true,
              })
              .setTimestamp();
            const nextButton = new ButtonBuilder()
              .setCustomId("imageNext")
              .setLabel("➡")
              .setStyle(ButtonStyle.Primary);
            const previousButton = new ButtonBuilder()
              .setCustomId("imagePrevious")
              .setLabel("⬅")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true);
            const row = new ActionRowBuilder().addComponents([
              previousButton,
              nextButton,
            ]);
            await interaction.editReply({ embeds: [embed], components: [row] });
          } catch (error) {
            console.log(error);
          }
        }
      });
    } else if (subcommand === "youtube") {
      const query = interaction.options.getString("query");
      console.log(query);
      const options = {
        method: "GET",
        url: "https://youtube-search-results.p.rapidapi.com/youtube-search/",
        params: { q: query },
        headers: {
          "X-RapidAPI-Key":
            "95d56ab599msh4e75749e6ed0ccdp1a655djsn23f9ac852267",
          "X-RapidAPI-Host": "youtube-search-results.p.rapidapi.com",
        },
      };

      axios
        .request(options)
        .then(async function (response) {
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
            await interaction.editReply("No results found.");
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
    } else if (subcommand === "genius") {
      var api = require("genius-api");
      var genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);
      const query = interaction.options.getString("query");
      console.log(query);
      genius.search(query).then(async function (response) {
        try {
          let stringly = JSON.stringify(response);
          // write to file
          fs.writeFileSync("geniusCache.json", stringly, (err) => {
            if (err) {
              console.log(err);
            }
          });
        } catch (err) {
          console.log(err);
        }
        try {
          const song = response.hits[0].result;
          const songTitle = song.full_title;
          const lyricsURL = song.url;
          const songThumbnail = song.song_art_image_thumbnail_url;
          const songImage = song.primary_artist.header_image_url;
          let featuredArtists = [];
          // get all featured artists if the featured_artists array is not empty
          if (song.featured_artists.length > 0) {
            featuredArtists.push({
              name: song.primary_artist.name,
              value: "[Link to Artist]" + "(" + song.primary_artist.url + ")",
              inline: true,
            });
            for (let i = 0; i < song.featured_artists.length; i++) {
              featuredArtists.push({
                name: song.featured_artists[i].name,
                value:
                  "[Link to Artist]" + "(" + song.featured_artists[i].url + ")",
              });
            }
            featuredArtists.push({
              name: "Lyrics",
              value: "[Link to Lyrics]" + "(" + lyricsURL + ")",
              inline: true,
            });
          }
          const songEmbed = new EmbedBuilder()
            .setTitle(songTitle)
            .setImage(songThumbnail)
            .setFooter({ text: "Powered by Genius • 1" })
            .setColor("#ffff00")
            .setTimestamp();
          if (featuredArtists.length > 0) {
            songEmbed.addFields(featuredArtists);
          } else {
            songEmbed.addFields(
              {
                name: song.primary_artist.name,
                value: "[Link to Artist]" + "(" + song.primary_artist.url + ")",
                inline: true,
              },
              {
                name: "Lyrics",
                value: "[Link to Lyrics]" + "(" + lyricsURL + ")",
                inline: true,
              }
            );
          }
          if (
            songImage !==
            "https://assets.genius.com/images/default_avatar_300.png?1671727067"
          ) {
            songEmbed.setThumbnail(songImage);
          }
          const searchYT = new ButtonBuilder()
            .setLabel("Search YouTube")
            .setStyle(ButtonStyle.Danger)
            .setCustomId("geniusYT");
          const buttonQuery = query.replace(/ /g, "%20");
          const searchSpotify = new ButtonBuilder()
            .setLabel("Search Spotify")
            .setStyle(ButtonStyle.Link)
            .setURL("https://open.spotify.com/search/" + buttonQuery);
          const searchAppleMusic = new ButtonBuilder()
            .setLabel("Search Apple Music")
            .setStyle(ButtonStyle.Link)
            .setURL("https://music.apple.com/us/search?term=" + buttonQuery);
          const nextSearch = new ButtonBuilder()
            .setLabel("Next ➡")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("geniusNext");
          const previousSearch = new ButtonBuilder()
            .setLabel("⬅ Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
            .setCustomId("geniusPrev");

          const row = new ActionRowBuilder().addComponents(
            previousSearch,
            nextSearch,
            searchYT,
            searchSpotify,
            searchAppleMusic
          );

          await interaction.editReply({
            embeds: [songEmbed],
            components: [row],
          });
        } catch (error) {
          console.log(error);
          const errorEmbed = new EmbedBuilder()
            .setTitle("Error!")
            .setDescription(
              "There was an error with your request. Please try again."
            )
            .setThumbnail(
              "https://media.discordapp.net/attachments/933049423217459251/1066800304831598633/jyne_fail.png"
            )
            .setColor("#ff0000")
            .setTimestamp();
          await interaction.editReply({ embeds: [errorEmbed] });
        }
      });
    } else if (subcommand === "twitter") {
      const query = interaction.options.getString("query");
      const author = interaction.options.getString("author");

      // get the bearer token
      const config = {
        headers: {
          Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        },
      };

      if (author) {
        const user = await axios
          .get(
            `https://api.twitter.com/2/users/by/username/${author}?user.fields=profile_image_url`,
            config
          )
          .then((response) => {
            console.log(response.data.data);
            return response.data.data;
          })
          .catch((error) => {
            console.log(error);
            const errorEmbed = new EmbedBuilder()
              .setTitle("Error, that user does not exist.")
              .setDescription("Please check your spelling and try again.")
              .setColor("#ff0000")
              .setThumbnail(
                "https://media.discordapp.net/attachments/933049423217459251/1066800304831598633/jyne_fail.png"
              )
              .setTimestamp();
            interaction.editReply({ embeds: [errorEmbed] });
            return false;
          });

        if (!user) {
          return;
        }

        let pagination_token = "";
        let more_results = false;

        const firstTweet = await axios
          .get(
            `https://api.twitter.com/2/users/${user.id}/tweets?tweet.fields=created_at,public_metrics,author_id&max_results=100&&media.fields=preview_image_url,url&expansions=attachments.media_keys`,
            config
          )
          .then((response) => {
            try {
              pagination_token = response.data.meta.next_token;
              more_results = true;
            } catch (error) {
              console.log("No more results.");
            }

            return response.data.data;
          })
          .catch((error) => {
            console.log(error);
          });

        const tweets = [];
        for (let i = 0; i < firstTweet.length; i++) {
          tweets.push(firstTweet[i]);
        }

        while (more_results) {
          const nextTweets = await axios
            .get(
              `https://api.twitter.com/2/users/${user.id}/tweets?tweet.fields=created_at,public_metrics,author_id&max_results=100&pagination_token=${pagination_token}&media.fields=preview_image_url,url&expansions=attachments.media_keys`,
              config
            )
            .then((response) => {
              try {
                pagination_token = response.data.meta.next_token;
                more_results = true;
              } catch (error) {
                console.log("No more results.");
                more_results = false;
              }

              return response.data.data;
            })
            .catch((error) => {
              console.log(error);
            });

          for (let i = 0; i < nextTweets.length; i++) {
            tweets.push(nextTweets[i]);
          }

          if (tweets.length >= 100) {
            more_results = false;
          }
        }
        console.log(tweets.length);
        let title;
        if (query !== "#all" && query !== "#All" && query !== "#a") {
          for (let i = 0; i < tweets.length; i++) {
            // if the search query is not part of the tweet text, remove it from the array
            if (!tweets[i].text.includes(query)) {
              tweets.splice(i, 1);
              i--;
            }
          }
          title = `Tweets by ${user.name} with the word **"${query}"**`;
        } else {
          title = `Tweets by ${user.name}`;
        }


        if (tweets.length === 0) {
          const noTweetsEmbed = new EmbedBuilder()
            .setTitle(
              `0 results found by ${user.name} with the word **"${query}"**`
            )
            .setThumbnail(user.profile_image_url)
            .setColor("#1da1f2")
            .addFields({
              name: "No Tweet Data",
              value: "No recent tweets found with the search query.",
            })
            .setTimestamp();
          return await interaction.editReply({ embeds: [noTweetsEmbed] });
        }
        // put the tweets array into a json file
        fs.writeFile(
          "tweetCache.json",
          JSON.stringify(tweets, null, 2),
          (err) => {
            if (err) throw err;
            console.log("Data written to file cache!");
          }
        );

        let tweetTime = new Date(tweets[0].created_at);
        tweetTime = tweetTime.toLocaleString("en-US", {
          timeZone: "America/New_York",
        });

        let tweetText = tweets[0].text;
        if (tweetText.length > 1024) {
          tweetText = tweetText.substring(0, 1000) + "...";
        }
        // if the tweet text has &amp; in it, replace it with &
        if (tweetText.includes("&amp;")) {
          console.log("replacing &amp; with &");
          tweetText = tweetText.replace(/&amp;/g, "&");
          console.log(tweetText);
        }
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(`${tweetText} - ${tweetTime} EST`)
          .setThumbnail(user.profile_image_url)
          .setColor("#1da1f2")
          .setTimestamp()
          .addFields(
            {
              name: `Likes ❤:`,
              value: `${tweets[0].public_metrics.like_count}`,
              inline: true,
            },
            {
              name: `Retweets 🔁:`,
              value: `${tweets[0].public_metrics.retweet_count}`,
              inline: true,
            },
            {
              name: `Impressions 📊:`,
              value: `${tweets[0].public_metrics.impression_count}`,
              inline: true,
            }
          )
          .setFooter({ text: `@${user.username} • #1` });

        const nextTweet = new ButtonBuilder()
          .setLabel("➡")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("nextTweet");
        if (tweets.length === 1) nextTweet.setDisabled(true);
        const previousTweet = new ButtonBuilder()
          .setLabel("⬅")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
          .setCustomId("prevTweet");
        const linkToTweet = new ButtonBuilder()
          .setLabel("🔗")
          .setStyle(ButtonStyle.Link)
          .setURL(
            `https://twitter.com/${user.username}/status/${tweets[0].id}`
          );
        const row = new ActionRowBuilder().addComponents(
          previousTweet,
          nextTweet,
          linkToTweet
        );

        await interaction.editReply({
          embeds: [embed],
          components: [row],
          content: `${tweets.length} results found!`,
        });
      }
    } else {
      await interaction.editReply("No subcommand provided.");
    }
  },
};

const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "prevTweet",
  },
  async execute(interaction) {
    // get embed from interaction
    const prevEmbed = interaction.message.embeds[0];
    // get data from embed
    const footer = prevEmbed.footer.text;
    const title = prevEmbed.title;
    const thumbnail = prevEmbed.thumbnail.url;
    // set i to the last characters of the footer text
    j = footer.substring(footer.indexOf("#") + 1);
    // convert i to a number
    j = Number(j - 2);
    if (j < 0) {
      j = 0;
    }
    const tweets = JSON.parse(fs.readFileSync("tweetCache.json"));
    let tweetTime = new Date(tweets[j].created_at);
    tweetTime = tweetTime.toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    // set the username to everything in the footer before the first space
    const username = footer.substring(
      footer.indexOf("@") + 1,
      footer.indexOf(" ")
    );
    let tweetText = tweets[j].text;
        if (tweetText.length > 1024) {
          tweetText = tweetText.substring(0, 1000) + "...";
        }
        if (tweetText.includes("&amp;")) {
          console.log("replacing &amp; with &");
          tweetText = tweetText.replace(/&amp;/g, "&");
        }
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(`${tweetsText} - ${tweetTime} EST`)
      .setThumbnail(thumbnail)
      .setColor("#1da1f2")
      .setTimestamp()
      .addFields(
        {
          name: `Likes ❤:`,
          value: `${tweets[j].public_metrics.like_count}`,
          inline: true,
        },
        {
          name: `Retweets 🔁:`,
          value: `${tweets[j].public_metrics.retweet_count}`,
          inline: true,
        },
        {
          name: `Impressions 📊:`,
          value: `${tweets[j].public_metrics.impression_count}`,
          inline: true,
        }
      )
      .setFooter({ text: `@${username} • #${j + 1}` });

    const nextTweet = new ButtonBuilder()
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("nextTweet");
    const previousTweet = new ButtonBuilder()
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("prevTweet");
      if (j === 0) {
        previousTweet.setDisabled(true);
      }
    const linkToTweet = new ButtonBuilder()
      .setLabel("🔗")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://twitter.com/${username}/status/${tweets[j].id}`);
    const row = new ActionRowBuilder().addComponents(
      previousTweet,
      nextTweet,
      linkToTweet
    );

    interaction.update({
      embeds: [embed],
      components: [row],
    });
  },
};

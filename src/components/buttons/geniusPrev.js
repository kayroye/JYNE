const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "geniusPrev",
  },
  async execute(interaction) {
    let j = 0;
    console.log("here!")
    // get the footer from the embed
    const footer = interaction.message.embeds[0].footer.text;
    // set i to the last characters of the footer text
    j = footer.substring(footer.indexOf("•") + 2);
    // convert j to a number
    j = Number(j - 2);
    if (j < 0) {
      j = 0;
    }
    console.log(j);
    // read the cache
    const cache = JSON.parse(fs.readFileSync("geniusCache.json"));
    // get the length of the hits array
    const listLength = cache.hits.length;
    let song = cache.hits[j].result;
    const songTitle = song.full_title;
    const lyricsURL = song.url;
    const songThumbnail = song.song_art_image_thumbnail_url;
    const songImage = song.primary_artist.header_image_url;
    const query = song.title;
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
          value: "[Link to Artist]" + "(" + song.featured_artists[i].url + ")",
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
      .setFooter({ text: `Powered by Genius •  ${j + 1}` })
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
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("geniusNext");
    const previousSearch = new ButtonBuilder()
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("geniusPrev");

    if (j === 0) {
      previousSearch.setDisabled(true);
    }

    const row = new ActionRowBuilder().addComponents(
      previousSearch,
      nextSearch,
      searchYT,
      searchSpotify,
      searchAppleMusic
    );

    await interaction.update({ embeds: [songEmbed], components: [row] });
  },
};

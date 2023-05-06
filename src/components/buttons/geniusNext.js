const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: "geniusNext",
  },
  async execute(interaction) {
    let i = 0;
    // get the footer from the embed
    const footer = interaction.message.embeds[0].footer.text;
    // set i to the last characters of the footer text
    i = footer.substring(footer.indexOf("•") + 2);
    // convert i to a number
    i = Number(i - 1);
    if (i < 0) {
      i = 0;
    }
    i++;
    // read the cache
    const cache = JSON.parse(fs.readFileSync("geniusCache.json"));
    // get the length of the hits array
    const listLength = cache.hits.length;
    if (listLength === 1) {
      i = 0;
    }
    let song = cache.hits[i].result;
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
      for (let j = 0; j < song.featured_artists.length; j++) {
        featuredArtists.push({
          name: song.featured_artists[j].name,
          value: "[Link to Artist]" + "(" + song.featured_artists[j].url + ")",
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
      .setFooter({ text: `Powered by Genius •  ${i + 1}` })
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

    if (i === listLength - 1) {
      nextSearch.setDisabled(true);
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

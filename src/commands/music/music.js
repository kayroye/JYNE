const {
  SlashCommandBuilder,
  EmbedBuilder,
  GuildMember,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const { QueryType, GuildQueue } = require("discord-player");
const Guild = require("../../events/schemas/guild.js");
const mongoose = require("mongoose");
const { Player } = require("discord-player");
const Genius = require("genius-lyrics");
const { search } = require("nodeyourmeme");
const Client = new Genius.Client(
  "Mo06e7GqjY4UBdlI4IsSKPfe7K5i54IjxhZcLuSrm1v4LolAbrvovZWb3KTgwcv9"
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Play a song or playlist or control the queue")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Play a song or playlist")
        .addStringOption((option) =>
          option
            .setName("song")
            .setDescription("The song or playlist you want to play")
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("play_next")
            .setDescription("Add the track(s) to the front of the queue?")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("stop")
        .setDescription("Stop the music and clear the queue")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("queue").setDescription("Show the current queue")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("lyrics")
        .setDescription("Get the lyrics of the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("jumpto")
        .setDescription("Jump to a specific song in the queue")
        .addIntegerOption((option) =>
          option
            .setName("song")
            .setDescription("The song you want to jump to")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("volume")
        .setDescription("Sets the volume to a specific global value")
        .addIntegerOption((option) =>
          option
            .setName("level")
            .setDescription("A value from 1-100")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a song from the queue")
        .addIntegerOption((option) =>
          option
            .setName("song")
            .setDescription("The song you want to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("controls").setDescription("Show the music controls")
    ),
  async execute(interaction, client) {
    const player = Player.singleton(client);
    player.extractors.loadDefault();

    const channel = interaction.member.voice.channel;
    if (!channel)
      return interaction.reply("You are not connected to a voice channel!");

    function millisToMinutesAndSeconds(millis) {
      var minutes = Math.floor(millis / 60000);
      var seconds = ((millis % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "play") {
      const query = interaction.options.getString("song");
      const playNext = interaction.options.getBoolean("play_next");
      await interaction.reply(
        `🔎 | Searching for ${query} <a:loading:1083830223063232552>`
      );
      const queue = player.nodes.create(interaction.guild, {
        metadata: {
          channel: interaction.channel,
          client: interaction.guild.members.me,
          requestedBy: interaction.user,
        },
        selfDeaf: true,
        volume: 25,
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 300000,
        leaveOnEnd: true,
        leaveOnEndCooldown: 300000,
        skipOnNoStream: true,
      });
      const search = await player.search(query, {
        searchEngine: QueryType.AUTO,
      });

      if (!search.tracks[0]) {
        return await interaction.followUp(
          "❌ | Could not find any streams for this track."
        );
      }

      if (!queue.connection)
        await queue.connect(interaction.member.voice?.channelId);

      if (playNext && queue.isPlaying()) {
        search.playlist
          ? await interaction.followUp(
              "❌ | You cannot add a playlist to the front of the queue."
            )
          : queue.insertTrack(search.tracks[0]);
      } else {
        search.playlist
          ? queue.addTrack(search.tracks)
          : queue.addTrack(search.tracks[0]);
      }

      if (!queue.isPlaying() && !queue.isEmpty() && search.tracks[0]) await queue.node.play();

      if (!queue.node.isPlaying() && !queue.node.isPaused() && !queue.isPlaying()) {
        await interaction.followUp(
          "❌ | Could not find a proper stream for this track! Skipping..."
        );
        return void queue.node.skip();
      }

      const progressBar = queue.node.createProgressBar({
        length: 9,
      });
      const timeLeft = millisToMinutesAndSeconds(queue.estimatedDuration);
      const embed = new EmbedBuilder()
        .setTitle(
          `Current song: **${queue.currentTrack.title}** - *${queue.currentTrack.author}*`
        )
        .setColor(0x00deff)
        .setDescription(
          `${progressBar}\n\nVolume 🔊: ${queue.node.volume} | Queue Time Left ⏳: ${timeLeft}`
        )
        .setThumbnail(queue.currentTrack.thumbnail)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });
      let valueString = ``;
      for (let i = 0; i < queue.tracks.size; i++) {
        valueString += `${i + 1}. ${queue.tracks.at(i).title} - ${
          queue.tracks.at(i).author
        }\n`;
        if (i === 4) break;
      }

      if (valueString.length > 0) {
        embed.addFields({
          name: `Up Next`,
          value: valueString,
        });
      }

      const prevTrack = new ButtonBuilder()
        .setLabel("⏪")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("prevTrack");
      const resume = new ButtonBuilder()
        .setLabel("▶")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("resume");
      const nextTrack = new ButtonBuilder()
        .setLabel("⏩")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("nextTrack");
      const shuffle = new ButtonBuilder()
        .setLabel("🔀")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("shuffle");
      const repeat = new ButtonBuilder().setCustomId("repeatMode");

      if (queue.repeatMode === 0) {
        repeat.setLabel("🔁");
        repeat.setStyle(ButtonStyle.Secondary);
      } else if (queue.repeatMode === 1) {
        repeat.setLabel("🔂");
        repeat.setStyle(ButtonStyle.Primary);
      } else if (queue.repeatMode === 2) {
        repeat.setLabel("🔁");
        repeat.setStyle(ButtonStyle.Primary);
      }

      const row = new ActionRowBuilder().addComponents([
        prevTrack,
        resume,
        nextTrack,
        shuffle,
        repeat,
      ]);

      return await interaction.followUp({
        embeds: [embed],
        components: [row],
      });
    } else if (subcommand === "queue") {
      const queue = player.nodes.get(interaction.guild);
      await interaction.deferReply();
      if (!queue || !queue.currentTrack)
        return void interaction.followUp({
          content: "❌ | No music is being played!",
        });
      const currentTrack = queue.currentTrack;
      const tracks = queue.tracks;
      const embed = new EmbedBuilder()
        .setTitle("Server Queue")
        .setColor(0x00deff)
        .setThumbnail(queue.currentTrack.thumbnail)
        .setDescription(
          `**Current Track**\n${currentTrack.title} - ${currentTrack.author}`
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });

      if (tracks.size > 0) {
        let upNextString = `\n\n**Up Next**\n`;
        for (let index = 0; index < tracks.size; index++) {
          upNextString += `**${index + 1}.** ${tracks.at(index).title} - *${
            tracks.at(index).author
          }*\n`;
          if (index === 24) {
            upNextString += `+${tracks.size - (index + 1)} more tracks`;
            break;
          }
        }
        embed.setDescription(
          `**Current Track**\n${currentTrack.title} - ${currentTrack.author} ${upNextString}`
        );
      }

      if (queue.tracks.size < 1) {
        embed.setDescription(
          `**Current Track**\n${currentTrack.title} - ${currentTrack.author}\n\nThere is nothing else in the queue. Add some more music!`
        );
      }

      return await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === "stop") {
      const queue = player.nodes.get(interaction.guild);
      await interaction.deferReply();
      if (!queue)
        return void interaction.followUp({
          content: "❌ | No music is being played!",
        });
      queue.node.stop();
      return void interaction.followUp({ content: "⏹ | Stopped the music!" });
    } else if (subcommand === "lyrics") {
      const queue = player.nodes.get(interaction.guild);
      await interaction.deferReply();
      let results;
      try {
        results = await Client.songs.search(
          `${queue.currentTrack.title} ${queue.currentTrack.author}`
        );
      } catch (error) {
        results = false;
      }

      const response = results[0];
      if (!response)
        return await interaction.editReply(
          "Could not find lyrics for this song!"
        );
      let lyrics = await response.lyrics();
      let lyrics2 = "Empty";
      if (lyrics.length > 2048) {
        // set lyrics2 to lyrics, but the lyrics after the first 2048 characters and add "..." to the end
        lyrics2 = "..." + lyrics.slice(2048, lyrics.length);
        // set lyrics to the first 2048 characters
        lyrics = lyrics.slice(0, 2048) + "...";
      }
      const embed = new EmbedBuilder()
        .setTitle(
          `Lyrics for ${queue.currentTrack.title} by ${queue.currentTrack.author}`
        )
        .setColor(0x00deff)
        .setDescription(lyrics)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });
      const embed2 = new EmbedBuilder()
        .setTitle(`Page 2 of Lyrics`)
        .setColor(0x00deff)
        .setDescription(lyrics2)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });
      await interaction.editReply({ embeds: [embed] });
      if (lyrics2 !== "Empty") {
        await interaction.followUp({ embeds: [embed2] });
      }
    } else if (subcommand === "jumpto") {
      const queue = player.nodes.get(interaction.guild);
      await interaction.deferReply();
      let song = interaction.options.getInteger("song");
      let success = true;
      if (!song)
        return await interaction.editReply("Please provide a song number!");
      song--;
      if (song > queue.tracks.size)
        return await interaction.editReply("That song is not in the queue!");
      try {
        queue.node.skipTo(queue.tracks.at(song));
      } catch (error) {
        success = false;
      }
      return void interaction.followUp({
        content: success
          ? `⏭ | Jumped to song #${song + 1}!`
          : "❌ | Could not jump to that song!",
      });
    } else if (subcommand === "remove") {
      const queue = player.nodes.get(interaction.guild);
      await interaction.deferReply();
      if (!queue || !queue.isPlaying())
        return void interaction.followUp({
          content: "❌ | No music is being played!",
        });
      let song = interaction.options.getInteger("song");
      if (!song)
        return await interaction.editReply("Please provide a song number!");
      song--;
      if (song > queue.tracks.size)
        return await interaction.editReply("That song is not in the queue!");
      let success = queue.node.remove(queue.tracks.at(song));
      return void interaction.followUp({
        content: success
          ? `🗑 | Removed song #${song + 1}!`
          : "❌ | Could not remove that song!",
      });
    } else if (subcommand === "controls") {
      const queue = player.nodes.get(interaction.guild);
      await interaction.deferReply();
      if (!queue || !queue.isPlaying())
        return void interaction.followUp({
          content: "❌ | No music is being played!",
        });
      const progressBar = queue.node.createProgressBar({
        length: 9,
      });
      const timeLeft = millisToMinutesAndSeconds(queue.estimatedDuration);
      const embed = new EmbedBuilder()
        .setTitle(
          `Current song: **${queue.currentTrack.title}** - *${queue.currentTrack.author}*`
        )
        .setColor(0x00deff)
        .setDescription(
          `${progressBar}\n\nVolume 🔊: ${queue.node.volume} | Queue Time Left ⏳: ${timeLeft}`
        )
        .setThumbnail(queue.currentTrack.thumbnail)
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.tag}` });
      let valueString = ``;
      for (let i = 0; i < queue.tracks.size; i++) {
        valueString += `${i + 1}. ${queue.tracks.at(i).title} - ${
          queue.tracks.at(i).author
        }\n`;
        if (i === 4) break;
      }

      if (valueString.length > 0) {
        embed.addFields({
          name: `Up Next`,
          value: valueString,
        });
      }

      const prevTrack = new ButtonBuilder()
        .setLabel("⏪")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("prevTrack");
      const resume = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId("resume");
      const nextTrack = new ButtonBuilder()
        .setLabel("⏩")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("nextTrack");
      const shuffle = new ButtonBuilder()
        .setLabel("🔀")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("shuffle");
      const repeat = new ButtonBuilder().setCustomId("repeatMode");

      if (queue.repeatMode === 0) {
        repeat.setLabel("🔁");
        repeat.setStyle(ButtonStyle.Secondary);
      } else if (queue.repeatMode === 1) {
        repeat.setLabel("🔂");
        repeat.setStyle(ButtonStyle.Primary);
      } else if (queue.repeatMode === 2) {
        repeat.setLabel("🔁");
        repeat.setStyle(ButtonStyle.Primary);
      }

      if (queue.node.isPlaying) {
        resume.setLabel("▶");
      } else {
        resume.setLabel("⏸");
      }

      const row = new ActionRowBuilder().addComponents([
        prevTrack,
        resume,
        nextTrack,
        shuffle,
        repeat,
      ]);

      return await interaction.editReply({
        embeds: [embed],
        components: [row],
      });
    } else if (subcommand === "volume") {
      const queue = player.nodes.get(interaction.guild);
      if (!queue) {
        return await interaction.reply("❌ | There is no music playing!");
      }

      const volumeLevel = interaction.options.getInteger("level");
      if (volumeLevel >= 1 && volumeLevel <= 100) {
        queue.node.setVolume(volumeLevel);
        if (volumeLevel >= 1 && volumeLevel <= 50) {
          await interaction.reply(`🔉 | Set the volume to ${volumeLevel}.`);
        } else {
          await interaction.reply(`🔊 | Set the volume to ${volumeLevel}.`);
        }
      } else {
        await interaction.reply(`Please choose a value between 1-100.`);
      }
    }
  },
};

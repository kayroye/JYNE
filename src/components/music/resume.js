const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { Player } = require("discord-player");

module.exports = {
  data: {
    name: "resume",
  },
  async execute(interaction, client) {
    function millisToMinutesAndSeconds(millis) {
      var minutes = Math.floor(millis / 60000);
      var seconds = ((millis % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    const player = Player.singleton(client);
    const queue = player.nodes.get(interaction.guild);
    if (!queue)
      return void interaction.followUp({
        content: "❌ | No music is being played!",
      });

    const progressBar = queue.node.createProgressBar({
      length: 9,
    });
    let title;
    if (!queue.currentTrack.title) {
      title = "Title Not Found";
    } else {
      title = queue.currentTrack.title;
    }
    const timeLeft = millisToMinutesAndSeconds(queue.estimatedDuration);
    const embed = new EmbedBuilder()
      .setTitle(`Current song: **${title}** - *${queue.currentTrack.author}*`)
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

    if (queue.node.isPlaying()) {
      const success = queue.node.pause();
      resume.setLabel("⏸");
      await interaction.update({
        embeds: [embed],
        components: [row],
      });
      return void interaction.followUp({
        content: success
          ? "⏸ | Paused the music!"
          : "❌ | Could not pause the music!",
      });
    } else {
      const success = queue.node.resume();
      resume.setLabel("▶");
      await interaction.update({
        embeds: [embed],
        components: [row],
      });
      return void interaction.followUp({
        content: success
          ? "▶ | Resumed the music!"
          : "❌ | Could not resume the music!",
      });
    }
  },
};

const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { Player } = require("discord-player");

module.exports = {
  data: {
    name: "repeatMode",
  },
  async execute(interaction, client) {

    function millisToMinutesAndSeconds(millis) {
      var minutes = Math.floor(millis / 60000);
      var seconds = ((millis % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    const player = Player.singleton(client);
    const queue = player.nodes.get(interaction.guild);
    if (!queue || !queue.isPlaying())
      return void interaction.followUp({
        content: "❌ | No music is being played!",
      });
    let success;
    let repeatMode = queue.repeatMode;
    console.log(repeatMode);
    try {
      repeatMode++;
      if (repeatMode === 3) {
        repeatMode = 0;
      }
      queue.setRepeatMode(repeatMode);
      success = true;
    } catch (error) {
      success = undefined;
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
      .setLabel("⏯")
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

    let followUpMessage = "";

    if (queue.repeatMode === 0) {
      repeat.setLabel("🔁");
      repeat.setStyle(ButtonStyle.Secondary);
      followUpMessage = "➡ | The repeat mode has been set to *off*.";
    } else if (queue.repeatMode === 1) {
      repeat.setLabel("🔂");
      repeat.setStyle(ButtonStyle.Primary);
      followUpMessage = "🔂 | The repeat mode has been set to *this track*.";
    } else if (queue.repeatMode === 2) {
      repeat.setLabel("🔁");
      repeat.setStyle(ButtonStyle.Primary);
      followUpMessage = "🔁 | The repeat mode has been set to *this queue*.";
    }

    const row = new ActionRowBuilder().addComponents([
      prevTrack,
      resume,
      nextTrack,
      shuffle,
      repeat,
    ]);

    await interaction.update({
      embeds: [embed],
      components: [row],
    });

    if (success) {
      if (repeatMode === 0) {
        return void interaction.followUp(followUpMessage);
      } else if (repeatMode === 1) {
        return void interaction.followUp(followUpMessage);
      } else if (repeatMode === 2) {
        return void interaction.followUp(followUpMessage);
      } else {
        throw console.error("what");
      }
    } else {
      interaction.followUp("There was an error setting the repeat mode!");
    }
  },
};

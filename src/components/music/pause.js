const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { Player } = require("discord-player");

module.exports = {
  data: {
    name: "pause",
  },
  async execute(interaction, client) {
    const player = Player.singleton(client);
    const queue = player.nodes.get(interaction.guild);
    await interaction.deferReply();
    if (!queue)
      return void interaction.followUp({
        content: "❌ | No music is being played!",
      });
    const success = queue.node.pause();
    return void interaction.followUp({
      content: success
        ? "⏸ | Paused the music!"
        : "❌ | Could not pause the music!",
    });
  },
};

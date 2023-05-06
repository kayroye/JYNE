const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { Player } = require("discord-player");

module.exports = {
  data: {
    name: "shuffle",
  },
  async execute(interaction, client) {
    const player = Player.singleton(client);
    const queue = player.nodes.get(interaction.guild);
    await interaction.deferReply();
    if (!queue)
      return void interaction.followUp({
        content: "❌ | No music is being played!",
      });
    queue.tracks.shuffle();
    return void interaction.followUp({
      content:  "🔀 | Shuffled the queue!",
    });
  },
};

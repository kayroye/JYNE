const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { Player } = require("discord-player");

module.exports = {
  data: {
    name: "prevTrack",
  },
  async execute(interaction, client) {
    const player = Player.singleton(client);
    const queue = player.nodes.get(interaction.guild);
    await interaction.deferReply();
    if (!queue)
      return void interaction.followUp({
        content: "❌ | No music is being played!",
      });
    let success;
    try {
      success = await queue.history.back();
    } catch (error) {
      success = undefined;
    }
    
    return void interaction.followUp({
      content: success
        ? "⏮ | Returning to previous song..."
        : "❌ | Could not go back to the previous song!",
    });
  },
};

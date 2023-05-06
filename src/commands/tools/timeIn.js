const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timein")
    .setDescription("Returns the time in a specified location.")
    .addStringOption((option) =>
      option
        .setName("location")
        .setDescription("The location you want to know the time of.")
        .setRequired(true)
        .addChoices(
          { name: "New York/Toronto", value: "America/New_York" },
          { name: "Chicago", value: "America/Chicago" },
          { name: "California", value: "America/Los_Angeles" },
          { name: "London", value: "Europe/London" },
          { name: "Berlin", value: "Europe/Berlin" }
        )
    ),
  async execute(interaction) {
    const location = interaction.options.getString("location");
    const embed = new EmbedBuilder()
      .setTitle(`The time in that area is:`)
      .setDescription(
        `\`\`\`js\n${new Date().toLocaleString("en-US", {
          timeZone: location,
        })}\`\`\``
      )
      .setColor(0x00deff)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

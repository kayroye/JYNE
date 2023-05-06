const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Repeats a message, like an echo!")
    .addStringOption((option) =>
      option
        .setName("phrase")
        .setDescription("The phrase you would like me to repeat")
        .setRequired(true)
    ),
  async execute(interaction) {
    let phrase = interaction.options.getString("phrase");
    let thePhrase = phrase;
    console.log(phrase);
    phrase = phrase.toLowerCase();
    if (
      phrase.includes("fuck") ||
      phrase.includes("shit") ||
      phrase.includes("bitch") ||
      phrase.includes("nigga") ||
      phrase.includes("nigger") ||
      phrase.includes("bitches")
    ) {
      await interaction.reply(
        "A user wanted me to curse pretty badly, but I choose not to."
      );
    } else {
      
      await interaction.reply(thePhrase);
    }
  },
};

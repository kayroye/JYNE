const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translate text to another language")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text you want to translate")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("output_language")
        .setDescription("The language you want to translate to")
        .setRequired(true)
        .addChoices(
          { name: "English", value: "en" },
          { name: "Arabic", value: "ar" },
          { name: "Spanish", value: "es" },
          { name: "Dutch", value: "nl" },
          { name: "French", value: "fr" },
          { name: "German", value: "de" },
          { name: "Italian", value: "it" },
          { name: "Japanese", value: "ja" },
          { name: "Korean", value: "ko" },
          { name: "Russian", value: "ru" },
          { name: "Chinese", value: "zh" },
          { name: "Punjabi", value: "pa" }
        )
    ),
  async execute(interaction) {
    let text = interaction.options.getString("text");
    console.log(text);
    const language = interaction.options.getString("output_language");
    const { translate } = require("@vitalets/google-translate-api");
    const embed = new EmbedBuilder()
      .setTitle("Translation ⏩ " + language.toUpperCase())
      .setDescription("Translating...")
      .setColor(0x0d78ef)
      .setFooter({
        text: "Powered by Google Translate",
      });
    const message = await interaction.reply({ embeds: [embed] });
    if (text === "^") {
      // Get the previous message from the channel
      try {
      const messages = await interaction.channel.messages.fetch({ limit: 2 });
      const previousMessage = messages.last();
      const translated = await translate(previousMessage, { to: language });
      console.log(translated.text);
      const translatedEmbed = new EmbedBuilder()
        .setTitle("Translation ⏩ " + language.toUpperCase())
        .setDescription(translated.text)
        .setColor(0x4486ce)
        .setFooter({
          text: "Powered by Google Translate",
          iconUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/2048px-Google_Translate_logo.svg.png",
        });
        await interaction.editReply({ embeds: [translatedEmbed] });
    } catch (error) {
        const translatedEmbed = new EmbedBuilder()
        .setTitle("Translation ⏩ " + language.toUpperCase())
        .setDescription("There was an error translating your message.")
        .setColor(0x4486ce)
        .setFooter({
            text: "Powered by Google Translate",
            iconUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/2048px-Google_Translate_logo.svg.png",
        });
        await interaction.editReply({ embeds: [translatedEmbed] });
    }
      
    } else {
      const translated = await translate(text, { to: language });
      console.log(translated.text);
      const translatedEmbed = new EmbedBuilder()
        .setTitle("Translation ⏩ " + language.toUpperCase())
        .setDescription(translated.text)
        .setColor(0x4486ce)
        .setFooter({
          text: "Powered by Google Translate",
          iconUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/2048px-Google_Translate_logo.svg.png",
        });
      await interaction.editReply({ embeds: [translatedEmbed] });
    }
  },
};

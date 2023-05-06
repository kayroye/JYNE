const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const DiscordUser = require("../../events/schemas/discordUser.js");
const mongoose = require("mongoose");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Communicate with me by having me respond to a message.")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("The text to turn into an image.")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    let user = await DiscordUser.findOne({
      userId: interaction.user.id,
    }).populate("settings");
    // if no user is found, return an error
    if (!user) {
      return await interaction.editReply(
        "You are not in my database! Use the commands /daily or /balance to become registered."
      );
    }

    let usersName = interaction.guild.members.cache.get(
      interaction.user.id
    ).nickname;
    if (usersName == null) {
      usersName = interaction.user.username;
    }
    if (user.settings.prefix) {
      usersName = user.settings.prefix + " " + usersName;
    }

    const prompt = interaction.options.getString("prompt");

    if(prompt.length > 400) {
        return await interaction.editReply(
            "That prompt was a little long, can you make it shorter?"
          );
    }

    let thread;

    try {
      thread = await interaction.channel.threads.create({
        name: `Chat with ${usersName}`,
        autoArchiveDuration: 60,
        reason: "A user has started a chat with me.",
      });
    } catch (error) {
      return await interaction.editReply(
        "I was unable to create a thread and start a chat."
      );
    }

    let messages = [
      {
        role: "system",
        content:
          "You are a female discord bot named J.Y.N.E (stands for Just Your Neighborhood Executable) that is very knowledgeable and very funny. Your responses should be very concise, simple, and easy to read, with a bit of comedic value. Only if a user is being serious should you be serious as well. If a user seems lost or bored, attempt to persuade the user to use your commands. These include but are not limited to: /blackjack, /gtn, /daily (for elysium). If it seems like the user may want more information from one of your responses, advise them to use /chat to continue the conversation.",
      },
      {
        role: "user",
        content: `My name is ${usersName}. ${prompt}`,
      },
    ];

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 400,
    });

    messages.push({
      role: "assistant",
      content: response.data.choices[0].message.content,
    });

    await interaction.editReply(
      `I made a thread so we can chat, ${usersName}. Join it to continue the conversation!`
    );

    thread.send(response.data.choices[0].message.content).catch(console.error);

    const filter = (m) => m.content.length > 0 && !m.author.bot;

    let timeout = null;

    const collector = thread.createMessageCollector({ filter, max: 10, time: 300_000 });
    collector.on("collect", async (m) => {

      thread.sendTyping();

      messages.push({
        role: "user",
        content: m.content,
      });

      const newResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 400,
      });

      messages.push({
        role: "assistant",
        content: newResponse.data.choices[0].message.content,
      });

      thread.send(newResponse.data.choices[0].message.content);
    });
    collector.on("end", async (collected) => {
      if (collected.size === 15) {
        thread.send("We've been talking for a bit! Due to token limitations, I have to close the chat. Open a new one if you want to restart!");
        thread.setLocked(true).catch(console.error);
      } else {
        thread.send(
          `Thanks for the talk ${usersName}! I'll close this chat now.`
        );
        thread.setLocked(true).catch(console.error);
      }
    });
  },
};

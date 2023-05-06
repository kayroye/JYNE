const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const achievements = require("../../../achievements.json");
const { createUser } = require("../../newUser.js");
const Guild = require("../../events/schemas/guild.js");
const mongoose = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hangman")
    .setDescription("Play a game of hangman with the bot!")
    .addBooleanOption((option) =>
      option
        .setName("solo")
        .setDescription("Should the bot play with you only?")
        .setRequired(true)
    ),
  async execute(interaction) {
    const solo = interaction.options.getBoolean("solo");
    const hangmanMessage = await interaction.deferReply({ fetchReply: true });
    let user = await DiscordUser.findOne({
      userId: interaction.user.id,
    }).populate("settings");
    if (!user) {
      return await interaction.reply({
        content:
          "You need to have an account to play this game! Please use the `/daily` or `/balance` commands to create an account.",
        ephemeral: true,
      });
    }

    let playerName = user.userName;

    if (user.settings.prefix) {
      playerName = user.settings.prefix + " " + playerName;
    }

    let guildId;
    try {
      guildId = interaction.guild.id;
    } catch (error) {
      return await interaction.reply("This game cannot be played in your DMs!");
    }

    let guessesRemaining = 5;
    let boughtGuess = false;
    let players = [];
    const achievedToday = [];

    async function awardUser(maxElysium) {
      // take the amount of guesses it took to get the number and multiply the max elysium by that number
      let elysium = Math.floor(maxElysium * guessesRemaining);
      // if the elysium is less than 1, set it to 1
      if (elysium < 1) {
        elysium = 1;
      }
      // add the elysium to the user's balance
      user.elysium += elysium;
      // change high score if needed

      // save the user
      await user.save();
      return elysium;
    }

    async function checkAchievements() {
      user = await DiscordUser.findOne({ userId: interaction.user.id });
      let playerAchievements;
      const embed = new EmbedBuilder();
      if(players.length > 0) {
        for(let i = 0; i < players.length; i++) {
          const checkUser = await DiscordUser.findOne({ userId: players[i] });
          if(checkUser) {
            let playerAchievements = checkUser.achievements;
            if(!playerAchievements.includes("hangmanMulti")) {
              playerAchievements.push("hangmanMulti");
              embed.setDescription(`Other players have unlocked achievements in this list!\nDo \`/my achievements\` to see what they are!`);
            }
            if (!playerAchievements.includes("hangmanPlayed")) {
              playerAchievements.push("hangmanPlayed");
              embed.setDescription(`Other players have unlocked achievements in this list!\nDo \`/my achievements\` to see what they are!`);
            }
            await checkUser.save();
        }
      }
      achievedToday.push("hangmanMulti");
      achievedToday.push("hangmanPlayed");

      playerAchievements = user.achievements;
      
      if (!playerAchievements.includes("hangmanMulti")) {
        playerAchievements.push("hangmanMulti");
        await user.save();
      }
    } else {
      playerAchievements = user.achievements;
    }

    if (!playerAchievements.includes("hangmanPlayed")) {
      playerAchievements.push("hangmanPlayed");
      if(!achievedToday.includes("hangmanPlayed")) {
        achievedToday.push("hangmanPlayed");
      }
      await user.save();
    }

    if(!playerAchievements.includes("hangmanPlayed10") || !playerAchievements.includes("hangmanPlayed100")) {
      let plays  = 1;
      for (let i = 0; i < user.commandHistory.length; i++) {
        // check how many times the command gtn appears in the array of objects
        if (user.commandHistory[i].command === "hangman") {
          plays++;
        }
      }
      console.log(plays);
      if (plays >= 10 && !playerAchievements.includes("hangmanPlayed10")) {
        console.log("here");
        playerAchievements.push("hangmanPlayed10");
        achievedToday.push("hangmanPlayed10");
      }

      if (plays >= 100 && !playerAchievements.includes("hangmanPlayed100")) {
        playerAchievements.push("hangmanPlayed100");
        achievedToday.push("hangmanPlayed100");
      }

      await user.save();
    }

    if(achievedToday.length > 0) {
      embed
        .setTitle("Achievements Unlocked!")
        .setColor(0x00deff)
        .setTimestamp();
      const fieldsToAdd = [];
      for (const achievement of achievedToday) {
        // find where the achievement is in the achievements.json file
        const achievementIndex = achievements.findIndex(
          (a) => a.id === achievement
        );
        fieldsToAdd.push({
          name: achievements[achievementIndex].title,
          value: achievements[achievementIndex].description,
        });
      }
      embed.addFields(fieldsToAdd);
      await interaction.followUp({ embeds: [embed] });
    }
  }

    if (solo) {
      const currentGuild = await Guild.findOne({ guildId: guildId });
      const hangmanWords = currentGuild.guildSettings.hangmanSettings;
      const chosenWord =
        hangmanWords[Math.floor(Math.random() * hangmanWords.length)];
      let blankString = "";
      for (let i = 0; i < chosenWord.word.length; i++) {
        if (chosenWord.word.charAt(i) === " ") {
          blankString += " ";
        } else {
          blankString += "-";
        }
      }

      const hangmanEmbed = new EmbedBuilder()
        .setTitle("Hangman")
        .setDescription(
          blankString +
            "\n\n" +
            `Guess a letter to start the game, ${playerName}!`
        )
        .setColor(0x00deff)
        .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
        .addFields(
          {
            name: "Guesses Remaining",
            value: "5",
          },
          {
            name: "Hint",
            value: chosenWord.category,
          },
          {
            name: "Extra Guesses",
            value: `Type \`^\` to use 7 <:elysium:1068187873909690508> Elysium for an extra guess!`,
          }
        );

      const hangmanMessage = await interaction.editReply({
        embeds: [hangmanEmbed],
        fetchReply: true,
        ephemeral: true,
      });

      const hangmanFilter = (m) =>
        m.content.length === 1 && m.author.id === interaction.user.id;
      const hangmanCollector = interaction.channel.createMessageCollector({
        filter: hangmanFilter,
        time: 90_000,
      });
      let guessedLetters = [];
      hangmanCollector.on("collect", async (m) => {
        m.content = m.content.toLowerCase();
        if (guessedLetters.includes(m.content)) {
          return await m.reply("You have already guessed that letter!");
        } else if (m.content === "^") {
          if (user.elysium < 7) {
            return await m.reply("You do not have enough Elysium to do that!");
          }
          user.elysium -= 7;
          await user.save();
          guessesRemaining++;

          await m.reply({ content: "An extra guess has been added!" });
          boughtGuess = true;
        } else {
          guessedLetters.push(m.content);
          let newBlankString = "";
          for (let i = 0; i < chosenWord.word.length; i++) {
            if (guessedLetters.includes(chosenWord.word.charAt(i).toLowerCase())) {
              newBlankString += chosenWord.word.charAt(i);
            } else if (chosenWord.word.charAt(i) === " ") {
              newBlankString += " ";
            } else {
              newBlankString += "-";
            }
          }
          if (chosenWord.word.includes(m.content)) {
            if (newBlankString === chosenWord.word) {
              hangmanCollector.stop();
              const winEmbed = new EmbedBuilder()
                .setTitle("Hangman")
                .setDescription(
                  `Congrats, ${playerName}, you won! The word was ${chosenWord.word}!`
                )
                .addFields(
                  {
                    name: "Guesses Remaining",
                    value: `${guessesRemaining}`,
                  },
                  {
                    name: "Guessed Letters",
                    value: `${guessedLetters.join(", ")}`,
                  },
                  {
                    name: "Hint",
                    value: `${chosenWord.category}`,
                  }
                )
                .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
                .setColor(0x00deff);
              const wonElysium = await awardUser(5);
              winEmbed.addFields({
                name: "Rewards",
                value: `+${wonElysium} <:elysium:1068187873909690508> Elysium`,
              });
              await m.reply({ embeds: [winEmbed], ephemeral: true });
              checkAchievements();
            } else {
              const correctEmbed = new EmbedBuilder()
                .setTitle("Hangman")
                .setDescription(newBlankString + "\n\n" + "Guess a letter!")
                .setColor(0x00deff)
                .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
                .addFields(
                  {
                    name: "Guesses Remaining",
                    value: `${guessesRemaining}`,
                  },
                  {
                    name: "Guessed Letters",
                    value: `${guessedLetters.join(", ")}`,
                  },
                  {
                    name: "Hint",
                    value: `${chosenWord.category}`,
                  },
                  {
                    name: "Extra Guesses",
                    value: `Type \`^\` to use 7 <:elysium:1068187873909690508> Elysium for an extra guess!`,
                  }
                );
              await m.reply({ embeds: [correctEmbed], ephemeral: true });
            }
          } else {
            guessesRemaining--;
            if (guessesRemaining === 0) {
              hangmanCollector.stop();
              const loseEmbed = new EmbedBuilder()
                .setTitle("Hangman")
                .setDescription(
                  "You lost! The word was " + chosenWord.word + "!"
                )
                .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
                .setColor(0x00E0FF);
              await m.reply({ embeds: [loseEmbed], ephemeral: true });
              checkAchievements();
            } else {
              const incorrectEmbed = new EmbedBuilder()
                .setTitle("Hangman")
                .setDescription(newBlankString + "\n\n" + "Guess a letter!")
                .setColor(0x00E0FF)
                .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
                .addFields(
                  {
                    name: "Guesses Remaining",
                    value: `${guessesRemaining}`,
                  },
                  {
                    name: "Guessed Letters",
                    value: `${guessedLetters.join(", ")}`,
                  },
                  {
                    name: "Hint",
                    value: `${chosenWord.category}`,
                  },
                  {
                    name: "Extra Guesses",
                    value: `Type \`^\` to use 7 <:elysium:1068187873909690508> Elysium for an extra guess!`,
                  }
                );
              await m.reply({
                embeds: [incorrectEmbed],
                content: "That letter is not in the word, try again!",
                ephemeral: true,
              });
            }
          }
        }
      });
      hangmanCollector.on("end", async (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setTitle("Hangman")
            .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
            .setDescription(
              "You took too long to guess! The word was " +
                chosenWord.word +
                "!"
            )
            .setColor(0x00deff);
          await hangmanMessage.edit({
            embeds: [timeoutEmbed],
            ephemeral: true,
          });
        }
      });
    } else {
      const currentGuild = await Guild.findOne({ guildId: guildId });
      const hangmanWords = currentGuild.guildSettings.hangmanSettings;
      const chosenWord =
        hangmanWords[Math.floor(Math.random() * hangmanWords.length)];
      let blankString = "";
      for (let i = 0; i < chosenWord.word.length; i++) {
        if (chosenWord.word.charAt(i) === " ") {
          blankString += " ";
        } else {
          blankString += "-";
        }
      }

      const hangmanEmbed = new EmbedBuilder()
        .setTitle("Hangman")
        .setDescription(
          blankString +
            "\n\n" +
            `Guess a letter to start the game, ${playerName}!`
        )
        .setColor(0x00deff)
        .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
        .addFields(
          {
            name: "Guesses Remaining",
            value: "5",
          },
          {
            name: "Hint",
            value: chosenWord.category,
          },
          {
            name: "Extra Guesses",
            value: `Type \`^\` to use 7 <:elysium:1068187873909690508> Elysium for an extra guess!`,
          }
        );
      const hangmanMessage = await interaction.editReply({
        embeds: [hangmanEmbed],
        fetchReply: true,
      });
      const hangmanFilter = (m) => m.content.length === 1;
      const hangmanCollector = interaction.channel.createMessageCollector({
        filter: hangmanFilter,
        time: 90_000,
      });
      let guessedLetters = [];
      hangmanCollector.on("collect", async (m) => {
        m.content = m.content.toLowerCase();
        if (
          !players.includes(m.author.id) &&
          m.author.id !== interaction.user.id
        ) {
          players.push(m.author.id);
        }
        if (m.content.length > 1) {
          return await m.reply("You can only guess one letter at a time!");
        } else if (guessedLetters.includes(m.content)) {
          return await m.reply("You have already guessed that letter!");
        } else if (m.content === "^") {
          // get the user that said that
          const userPurchase = await DiscordUser.findOne({ userId: m.author.id });
          if (userPurchase.elysium < 7) {
            return await m.reply("You do not have enough Elysium to do that!");
          }
          userPurchase.elysium -= 7;
          await userPurchase.save();
          guessesRemaining++;

          await m.reply({ content: "An extra guess has been added!" });
          boughtGuess = true;
        } else {
          guessedLetters.push(m.content);
          let newBlankString = "";
          for (let i = 0; i < chosenWord.word.length; i++) {
            if (guessedLetters.includes(chosenWord.word.charAt(i).toLowerCase())) {
              newBlankString += chosenWord.word.charAt(i);
            } else if (chosenWord.word.charAt(i) === " ") {
              newBlankString += " ";
            } else {
              newBlankString += "-";
            }
          }
          if (chosenWord.word.includes(m.content)) {
            if (newBlankString === chosenWord.word) {
              hangmanCollector.stop();
              const winEmbed = new EmbedBuilder()
                .setTitle("Hangman")
                .setDescription(
                  `Congrats, ${playerName}, you won! The word was ${chosenWord.word}!`
                )
                .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
                .addFields(
                  {
                    name: "Guesses Remaining",
                    value: `${guessesRemaining}`,
                  },
                  {
                    name: "Guessed Letters",
                    value: `${guessedLetters.join(", ")}`,
                  },
                  {
                    name: "Hint",
                    value: `${chosenWord.category}`,
                  }
                )
                .setColor(0x00deff);
              const wonElysium = await awardUser(3);
              if (players.length > 0) {
                for (let i = 0; i < players.length; i++) {
                  if (players[i] === interaction.user.id) continue;
                  let currentUser = await DiscordUser.findOne({
                    userId: players[i],
                  });
                  currentUser.elysium += wonElysium;
                  await currentUser.save();
                }
                winEmbed.addFields({
                  name: "Rewards",
                  value: `+${wonElysium} <:elysium:1068187873909690508> Elysium for everyone that played!`,
                });
                winEmbed.setDescription(
                  `Congrats, everyone, you got the word! It was ${chosenWord.word}!`
                );
              } else {
                winEmbed.addFields({
                  name: "Rewards",
                  value: `+${wonElysium} <:elysium:1068187873909690508> Elysium`,
                });
              }
              await m.reply({ embeds: [winEmbed] });
              checkAchievements();
            } else {
              const correctEmbed = new EmbedBuilder()
                .setTitle("Hangman")
                .setDescription(newBlankString + "\n\n" + "Guess a letter!")
                .setColor(0x00deff)
                .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
                .addFields(
                  {
                    name: "Guesses Remaining",
                    value: `${guessesRemaining}`,
                  },
                  {
                    name: "Guessed Letters",
                    value: `${guessedLetters.join(", ")}`,
                  },
                  {
                    name: "Hint",
                    value: `${chosenWord.category}`,
                  },
                  {
                    name: "Extra Guesses",
                    value: `Type \`^\` to use 7 <:elysium:1068187873909690508> Elysium for an extra guess!`,
                  }
                );
              await m.reply({ embeds: [correctEmbed] });
            }
          } else {
            guessesRemaining--;
            if (guessesRemaining === 0) {
              hangmanCollector.stop();
              const loseEmbed = new EmbedBuilder()
                .setTitle("Hangman")
                .setDescription(
                  "You lost! The word was " + chosenWord.word + "!"
                )
                .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
                .setColor(0x00deff);
              await m.reply({ embeds: [loseEmbed] });
              checkAchievements();
            } else {
              const incorrectEmbed = new EmbedBuilder()
                .setTitle("Hangman")
                .setDescription(newBlankString + "\n\n" + "Guess a letter!")
                .setColor(0x00E0FF)
                .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
                .addFields(
                  {
                    name: "Guesses Remaining",
                    value: `${guessesRemaining}`,
                  },
                  {
                    name: "Guessed Letters",
                    value: `${guessedLetters.join(", ")}`,
                  },
                  {
                    name: "Hint",
                    value: `${chosenWord.category}`,
                  },
                  {
                    name: "Extra Guesses",
                    value: `Type \`^\` to use 7 <:elysium:1068187873909690508> Elysium for an extra guess!`,
                  }
                );
              await m.reply({
                embeds: [incorrectEmbed],
                content: "That letter is not in the word, try again!",
              });
            }
          }
        }
      });
      hangmanCollector.on("end", async (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setTitle("Hangman")
            .setDescription(
              "You took too long to guess! The word was " +
                chosenWord.word +
                "!"
            )
            .setThumbnail("https://cdn.discordapp.com/attachments/1059650699463499899/1073412381352402984/hangmanJyne.png")
            .setColor(0x00deff);
          await hangmanMessage.edit({ embeds: [timeoutEmbed] });
        }
      });
    }
  },
};

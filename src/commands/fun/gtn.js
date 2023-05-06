const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const achievements = require("../../../achievements.json")
const { createUser } = require("../../newUser.js");
const mongoose = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gtn")
    .setDescription("A Guess the number game!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("easy")
        .setDescription("Starts a game of Guess the number on easy mode.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("medium")
        .setDescription("Starts a game of Guess the number on medium mode.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("hard")
        .setDescription("Starts a game of Guess the number on hard mode.")
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    let user = await DiscordUser.findOne({
      userId: interaction.user.id,
    }).populate("settings");
    if (!user) {
      await createUser(interaction.user.id, interaction.user.username);
      user = await DiscordUser.findOne({
        userId: interaction.user.id,
      }).populate("settings");
    }
    // set the player's name to their nickname if they have one
    let playerName = interaction.guild.members.cache.get(
      interaction.user.id
    ).nickname;
    if (playerName == null) {
      playerName = interaction.user.username;
    }
    if (user.settings.prefix) {
      playerName = user.settings.prefix + " " + playerName;
    }

    const playerAchievements = user.achievements;
    const achievedToday = [];

    let guesses = 0;

    // make a function
    async function awardUser(maxElysium) {
      // take the amount of guesses it took to get the number and divide the max elysium by that number
      let elysium = Math.floor(maxElysium / guesses);
      // if the elysium is less than 1, set it to 1
      if (elysium < 1) {
        elysium = 1;
      }
      // add the elysium to the user's balance
      user.elysium += elysium;
      // change high score if needed
      if (subcommand === "easy") {
        if (user.highScores.gtnEasy === undefined) {
          user.highScores.gtnEasy = guesses;
        } else if (user.highScores.gtnEasy > guesses) {
          user.highScores.gtnEasy = guesses;
        } else if (!user.highScores.gtnEasy) {
          user.highScores.gtnEasy = guesses;
        }
      } else if (subcommand === "medium") {
        if (user.highScores.gtnMedium === undefined) {
          user.highScores.gtnMedium = guesses;
        } else if (user.highScores.gtnMedium > guesses) {
          user.highScores.gtnMedium = guesses;
        } else if (!user.highScores.gtnMedium) {
          user.highScores.gtnMedium = guesses;
        }
      } else if (subcommand === "hard") {
        if (user.highScores.gtnHard === undefined) {
          user.highScores.gtnHard = guesses;
        } else if (user.highScores.gtnHard > guesses) {
          user.highScores.gtnHard = guesses;
        } else if (!user.highScores.gtnHard) {
          user.highScores.gtnHard = guesses;
        }
      }
      // save the user
      await user.save();
      return elysium;
    }

    async function checkAchievements() {
      // update the user
      user = await DiscordUser.findOne({
        userId: interaction.user.id,
      }).populate("settings");
      if(!playerAchievements.includes("gtnPlayed")) {
        playerAchievements.push("gtnPlayed");
        achievedToday.push("gtnPlayed");
      }

      if(!playerAchievements.includes("gtnPlayed10")) {
        let plays  = 1;
        for (let i = 0; i < user.commandHistory.length; i++) {
          // check how many times the command gtn appears in the array of objects
          if (user.commandHistory[i].command === "gtn") {
            plays++;
          }
        }
        console.log(plays);
        if (plays >= 10) {
          playerAchievements.push("gtnPlayed10");
          achievedToday.push("gtnPlayed10");
        }

        if (plays >= 100) {
          playerAchievements.push("gtnPlayed100");
          achievedToday.push("gtnPlayed100");
        }
      }

      if(subcommand === "easy") {
        if (!playerAchievements.includes("gtnE1") && guesses === 1) {
          playerAchievements.push("gtnE1");
          achievedToday.push("gtnE1");
        }
      }

      if(subcommand === "medium") {
        if (!playerAchievements.includes("gtnM1") && guesses === 1) {
          playerAchievements.push("gtnM1");
          achievedToday.push("gtnM1");
        }
      }

      if(subcommand === "hard") {
        if (!playerAchievements.includes("gtnH1") && guesses === 1) {
          playerAchievements.push("gtnH1");
          achievedToday.push("gtnH1");
        }
      }
      user.achievements = playerAchievements;
      await user.save();

      if(achievedToday.length > 0) {
        const embed = new EmbedBuilder()
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

    if (subcommand === "easy") {
      // Generate a random number from 1 to 10
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      const embed = new EmbedBuilder()
        .setTitle("Guess the Number (Easy)")
        .setDescription(
          `I'm thinking of a number between 1 and 10. Can you guess it?\nYou have 45 seconds!`
        )
        .addFields({
          name: "Current Player",
          value: playerName,
        })
        .setThumbnail(
          "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
        )
        .setColor(0x00deff)
        .setTimestamp();
      // send the embed and wait for a response
      await interaction.reply({ embeds: [embed] });
      // Create a message collector with filter
      const filter = (m) => m.author.id === interaction.user.id;
      // create a message collector in the channel the command was sent in
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 45_000,
      });
      // boolean for if the user has guessed the number
      let guessed = false;
      collector.on("collect", async (m) => {
        console.log(`Collected ${m.content}`);
        guesses++;
        if (m.content === randomNumber.toString()) {
          const awardedElysium = await awardUser(10);
          const embed = new EmbedBuilder()
            .setTitle("Guess the Number (Easy)")
            .setDescription(
              `Great job **${playerName}**, you guessed the number! It was **${randomNumber}**.`
            )
            .setThumbnail(
              "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
            )
            .addFields(
              {
                name: "Elysium Gained",
                value: `+${awardedElysium} <:elysium:1068187873909690508> Elysium`,
              },
              {
                name: "Your Least Amount of Guesses",
                value: `${user.highScores.gtnEasy} guesses`,
              }
            )
            .setColor(0x00deff)
            .setTimestamp();
          interaction.followUp({ embeds: [embed] });
          await checkAchievements();
          guessed = true;
          collector.stop();
          return;
        } else {
          let guessedNum = parseInt(m.content);
          if (guessedNum > randomNumber) {
            interaction.followUp("Too high!");
          } else if (guessedNum < randomNumber) {
            interaction.followUp("Too low!");
          }
        }
      });
      collector.on("end", (collected) => {
        if (guessed === true) return;
        const embed = new EmbedBuilder()
          .setTitle("Guess the Number (Easy)")
          .setDescription(
            `You didn't guess the number! It was **${randomNumber}**!`
          )
          .setThumbnail(
            "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
          )
          .setColor(0x00deff)
          .setTimestamp();
        interaction.followUp({ embeds: [embed] });
      });
    } else if (subcommand === "medium") {
      const randomNumber = Math.floor(Math.random() * 50) + 1;
      const embed = new EmbedBuilder()
        .setTitle("Guess the Number (Medium)")
        .setDescription(
          `I'm thinking of a number between 1 and 50. Can you guess it?\nYou have 1 minute!`
        )
        .addFields({
          name: "Current Player",
          value: playerName,
        })
        .setThumbnail(
          "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
        )
        .setColor(0x00deff)
        .setTimestamp();
      // send the embed and wait for a response
      await interaction.reply({ embeds: [embed] });
      // Create a message collector with filter
      const filter = (m) => m.author.id === interaction.user.id;
      // create a message collector in the channel the command was sent in
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 60_000,
      });
      // boolean for if the user has guessed the number
      let guessed = false;
      collector.on("collect", async (m) => {
        console.log(`Collected ${m.content}`);
        guesses++;
        if (m.content === randomNumber.toString()) {
          const awardedElysium = await awardUser(25);
          const embed = new EmbedBuilder()
            .setTitle("Guess the Number (Medium)")
            .setDescription(
              `Great job **${playerName}**, you guessed the number! It was **${randomNumber}**.`
            )
            .setThumbnail(
              "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
            )
            .addFields(
              {
                name: "Elysium Gained",
                value: `+${awardedElysium} <:elysium:1068187873909690508> Elysium`,
              },
              {
                name: "Least Amount of Guesses",
                value: `${user.highScores.gtnMedium} guesses`,
              }
            )
            .setColor(0x00deff)
            .setTimestamp();
          interaction.followUp({ embeds: [embed] });
          await checkAchievements();
          guessed = true;
          collector.stop();
          return;
        } else {
          let guessedNum = parseInt(m.content);
          if (guessedNum > randomNumber) {
            interaction.followUp("Too high!");
          } else if (guessedNum < randomNumber) {
            interaction.followUp("Too low!");
          }
        }
      });
      collector.on("end", (collected) => {
        if (guessed === true) return;
        const embed = new EmbedBuilder()
          .setTitle("Guess the Number (Medium)")
          .setDescription(
            `You didn't guess the number! It was **${randomNumber}**!`
          )
          .setThumbnail(
            "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
          )
          .setColor(0x00deff)
          .setTimestamp();
        interaction.followUp({ embeds: [embed] });
      });
    } else if (subcommand === "hard") {
      const randomNumber = Math.floor(Math.random() * 100) + 1;
      const embed = new EmbedBuilder()
        .setTitle("Guess the Number (Hard)")
        .setDescription(
          `I'm thinking of a number between 1 and 100. Can you guess it?\nYou have 2 minutes!`
        )
        .addFields({
          name: "Current Player",
          value: playerName,
        })
        .setThumbnail(
          "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
        )
        .setColor(0x00deff)
        .setTimestamp();
      // send the embed and wait for a response
      await interaction.reply({ embeds: [embed] });
      // Create a message collector with filter
      const filter = (m) => m.author.id === interaction.user.id;
      // create a message collector in the channel the command was sent in
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 120_000,
      });
      // boolean for if the user has guessed the number
      let guessed = false;
      collector.on("collect", async (m) => {
        console.log(`Collected ${m.content}`);
        guesses++;
        if (m.content === randomNumber.toString()) {
          const awardedElysium = await awardUser(40);
          const embed = new EmbedBuilder()
            .setTitle("Guess the Number (Hard)")
            .setDescription(
              `Great job **${playerName}**, you guessed the number! It was **${randomNumber}**.`
            )
            .setThumbnail(
              "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
            )
            .addFields(
              {
                name: "Elysium Gained",
                value: `+${awardedElysium} <:elysium:1068187873909690508> Elysium`,
              },
              {
                name: "Least Amount of Guesses",
                value: `${user.highScores.gtnHard} guesses`,
              }
            )
            .setColor(0x00deff)
            .setTimestamp();
          interaction.followUp({ embeds: [embed] });
          await checkAchievements();
          guessed = true;
          collector.stop();
          return;
        } else {
          let guessedNum = parseInt(m.content);
          if (guessedNum > randomNumber) {
            interaction.followUp("Too high!");
          } else if (guessedNum < randomNumber) {
            interaction.followUp("Too low!");
          }
        }
      });
      collector.on("end", (collected) => {
        if (guessed === true) return;
        const embed = new EmbedBuilder()
          .setTitle("Guess the Number (Hard)")
          .setDescription(
            `You didn't guess the number! It was **${randomNumber}**!`
          )
          .setThumbnail(
            "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
          )
          .setColor(0x00deff)
          .setTimestamp();
        interaction.followUp({ embeds: [embed] });
      });
    } else {
      await interaction.reply("Something went wrong.");
    }
  },
};

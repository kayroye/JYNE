const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const mongoose = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Shows the leaderboard for specific statistics.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("elysium")
        .setDescription(
          "Shows the leaderboard for users with the most Elysium."
        )
        .addBooleanOption((option) =>
          option
            .setName("in_server")
            .setDescription("Choose to only show users in the server.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("gtn")
        .setDescription(
          "Shows the leaderboard for users with the best Guess the Number scores."
        )
        .addStringOption((option) =>
          option
            .setName("difficulty")
            .setDescription("Choose the difficulty of the leaderboard.")
            .setRequired(true)
            .addChoices(
              {
                name: "Easy",
                value: "easy",
              },
              {
                name: "Medium",
                value: "medium",
              },
              {
                name: "Hard",
                value: "hard",
              }
            )
        )
        .addBooleanOption((option) =>
          option
            .setName("in_server")
            .setDescription("Choose to only show users in the server.")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const message = await interaction.deferReply();
    if (subcommand === "elysium") {
      const inServer = interaction.options.getBoolean("in_server");
      if (inServer) {
        const users = await DiscordUser.find({
          elysium: { $gt: 0 },
        })
          .sort({ elysium: -1 })
          .limit(10);
        console.log(users);
        // check if a user has the guild in their inGuilds array
        let filteredUsers = users.filter((user) =>
          user.inGuilds.includes(interaction.guild.id)
        );
        console.log(filteredUsers);
        const embed = new EmbedBuilder()
          .setTitle("Elysium Leaderboard")
          .setDescription(
            `The leaderboard for the most Elysium in ${interaction.guild.name}.`
          )
          .setColor(0x6490cd)
          .setTimestamp();
        const fieldsToAdd = [];
        for (let i = 0; i < filteredUsers.length; i++) {
          fieldsToAdd.push({
            name: `${i + 1}. ${filteredUsers[i].userName}`,
            value: `${filteredUsers[i].elysium} <:elysium:1068187873909690508> Elysium`,
            inline: true,
          });
        }
        embed.addFields(fieldsToAdd);
        await interaction.editReply({
          embeds: [embed],
        });
      } else {
        const users = await DiscordUser.find().sort({ elysium: -1 }).limit(10);
        const embed = new EmbedBuilder()
          .setTitle("Elysium Leaderboard")
          .setDescription(`The leaderboard for the most Elysium.`)
          .setColor(0x6490cd)
          .setTimestamp();
        const fieldsToAdd = [];
        for (let i = 0; i < users.length; i++) {
          fieldsToAdd.push({
            name: `${i + 1}. ${users[i].userName}`,
            value: `${users[i].elysium} <:elysium:1068187873909690508> Elysium`,
            inline: true,
          });
        }
        embed.addFields(fieldsToAdd);
        await interaction.editReply({
          embeds: [embed],
        });
      }
    } else if (subcommand === "gtn") {
      const inServer = interaction.options.getBoolean("in_server");
      const difficulty = interaction.options.getString("difficulty");
      if (inServer) {
        const embed = new EmbedBuilder()
          .setTitle(`Guess the Number (${difficulty}) Leaderboard`)
          .setDescription(
            `The leaderboard for the best Guess the Number scores in ${interaction.guild.name}.`
          )
          .setThumbnail(
            "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
          )
          .setColor(0x6490cd)
          .setTimestamp();
        const fieldsToAdd = [];
        if (difficulty === "easy") {
          const users = await DiscordUser.find({
            gtnEasy: { $gt: 0 },
          })
            .sort({ gtnEasy: 1 })
            .limit(10);

          let filteredUsers = users.filter((user) =>
            user.inGuilds.includes(interaction.guild.id)
          );

          // filter out any undefined high scores
          filteredUsers = filteredUsers.filter((user) => user.highScores.gtnEasy);
          // sort by lowest guesses
          filteredUsers.sort((a, b) => a.highScores.gtnEasy - b.highScores.gtnEasy);

          for (let i = 0; i < filteredUsers.length; i++) {
            fieldsToAdd.push({
              name: `${i + 1}. ${filteredUsers[i].userName}`,
              value: `${filteredUsers[i].highScores.gtnEasy} guesses`,
              inline: true,
            });
          }

        } else if (difficulty === "medium") {

          const users = await DiscordUser.find({
            gtnMedium: { $gt: 0 },
          })
            .sort({ gtnMedium: 1 })
            .limit(10);

          let filteredUsers = users.filter((user) =>
            user.inGuilds.includes(interaction.guild.id)
          );

          filteredUsers = filteredUsers.filter((user) => user.highScores.gtnMedium);
          // sort by lowest guesses
          filteredUsers.sort((a, b) => a.highScores.gtnMedium - b.highScores.gtnMedium);

          for (let i = 0; i < filteredUsers.length; i++) {
            fieldsToAdd.push({
              name: `${i + 1}. ${filteredUsers[i].userName}`,
              value: `${filteredUsers[i].highScores.gtnMedium} guesses`,
              inline: true,
            });
          }

        } else if (difficulty === "hard") {

          const users = await DiscordUser.find({
            gtnHard: { $gt: 0 },
          })
            .sort({ gtnHard: 1 })
            .limit(10);

          let filteredUsers = users.filter((user) =>
            user.inGuilds.includes(interaction.guild.id)
          );

          filteredUsers = filteredUsers.filter((user) => user.highScores.gtnHard);
          // sort by lowest guesses
          filteredUsers.sort((a, b) => a.highScores.gtnHard - b.highScores.gtnHard);

          for (let i = 0; i < filteredUsers.length; i++) {
            fieldsToAdd.push({
              name: `${i + 1}. ${filteredUsers[i].userName}`,
              value: `${filteredUsers[i].highScores.gtnHard} guesses`,
              inline: true,
            });
          }

        }
        embed.addFields(fieldsToAdd);
        await interaction.editReply({
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setTitle(`Guess the Number (${difficulty}) Leaderboard`)
          .setDescription(`The leaderboard for the best Guess the Number scores.`)
          .setThumbnail(
            "https://media.discordapp.net/attachments/1051228955425914933/1068630929519673344/image.png?width=672&height=676"
          )
          .setColor(0x6490cd)
          .setTimestamp();
        const fieldsToAdd = [];
        if (difficulty === "easy") {
          const users = await DiscordUser.find()
            .limit(10);

          // filter out any undefined high scores
          let filteredUsers = users.filter((user) => user.highScores.gtnEasy);
          // sort by lowest guesses
          filteredUsers.sort((a, b) => a.highScores.gtnEasy - b.highScores.gtnEasy);

          for (let i = 0; i < filteredUsers.length; i++) {
            fieldsToAdd.push({
              name: `${i + 1}. ${filteredUsers[i].userName}`,
              value: `${filteredUsers[i].highScores.gtnEasy} guesses`,
              inline: true,
            });
          }

        } else if (difficulty === "medium") {

          const users = await DiscordUser.find()
            .sort({ gtnMedium: 1 })
            .limit(10);

          let filteredUsers = users.filter((user) => user.highScores.gtnMedium);
          // sort by lowest guesses
          filteredUsers.sort((a, b) => a.highScores.gtnMedium - b.highScores.gtnMedium);

          for (let i = 0; i < filteredUsers.length; i++) {
            fieldsToAdd.push({
              name: `${i + 1}. ${filteredUsers[i].userName}`,
              value: `${filteredUsers[i].highScores.gtnMedium} guesses`,
              inline: true,
            });
          }

        } else if (difficulty === "hard") {

          const users = await DiscordUser.find()
            .sort({ gtnHard: 1 })
            .limit(10);

          let filteredUsers = users.filter((user) => user.highScores.gtnHard);
          // sort by lowest guesses
          filteredUsers.sort((a, b) => a.highScores.gtnHard - b.highScores.gtnHard);

          for (let i = 0; i < filteredUsers.length; i++) {
            fieldsToAdd.push({
              name: `${i + 1}. ${filteredUsers[i].userName}`,
              value: `${filteredUsers[i].highScores.gtnHard} guesses`,
              inline: true,
            });
          }

        }
        embed.addFields(fieldsToAdd);
        await interaction.editReply({
          embeds: [embed],
        });
      }
    }
  },
};

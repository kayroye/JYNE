const {
  SlashCommandBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
} = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const userSettings = require("../../events/schemas/userSettings.js");
const achievements = require("../../../achievements.json");
const mongoose = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("my")
    .setDescription("Returns your settings.")
    .addSubcommand((subcommand) =>
      subcommand.setName("prefix").setDescription("Returns your prefix.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("analytics")
        .setDescription("Returns data collected on you.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("subscription")
        .setDescription("Returns your subscription status.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("achievements")
        .setDescription("Returns your achievements.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("creations")
        .setDescription("Shows your AI-generated creations.")
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = await DiscordUser.findOne({ userId: interaction.user.id });
    if (!user) {
      return await interaction.reply(
        'There is no data for your user. Type "/balance" or "/daily" to become registered.'
      );
    }
    const thisUsersSettings = await userSettings.findOne({
      _id: user.settings,
    });
    let usersName = user.userName;
    if (thisUsersSettings) {
      if (thisUsersSettings.prefix) {
        usersName = thisUsersSettings.prefix + " " + user.userName;
      }
    }
    if (subcommand === "prefix") {
      // check if the user has a custom prefix
      if (thisUsersSettings) {
        if (thisUsersSettings.prefix) {
          const embed = new EmbedBuilder()
            .setTitle("User Settings")
            .setDescription(
              `Your prefix is: ${thisUsersSettings.prefix}.\nWould you like to change it?`
            )
            .setThumbnail(
              "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
            )
            .setColor(0x00deff)
            .setTimestamp();
          const yes = new ButtonBuilder()
            .setCustomId("addPrefix")
            .setLabel("✅")
            .setStyle(ButtonStyle.Primary);
          const row = new ActionRowBuilder().addComponents(yes);
          await interaction.reply({
            embeds: [embed],
            ephemeral: true,
            components: [row],
          });
        } else {
          const embed = new EmbedBuilder()
            .setTitle("You don't have a prefix set.")
            .setDescription("Would you like to set one?")
            .setThumbnail(
              "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
            )
            .setColor(0x00deff)
            .setTimestamp();
          const yes = new ButtonBuilder()
            .setCustomId("addPrefix")
            .setLabel("✅")
            .setStyle(ButtonStyle.Primary);
          const no = new ButtonBuilder()
            .setCustomId("cancelPrefix")
            .setLabel("❌")
            .setStyle(ButtonStyle.Primary);
          const row = new ActionRowBuilder().addComponents(yes, no);
          await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true,
          });
        }
      } else {
        await interaction.reply("There was an error.");
      }
    } else if (subcommand === "analytics") {
      await interaction.deferReply();
      const embed = new EmbedBuilder()
        .setTitle("Server/User Analytics")
        .setDescription(
          `This is the data I have collected on you, **${usersName}**.`
        )
        .setThumbnail(
          "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
        )
        .setColor(0x00deff)
        .setTimestamp();

      // get the most used command
      let mostUsedCommand = "None";
      let mostUsedCommandCount = 0;
      // check how many times a command shows up in the array
      for (let i = 0; i < user.commandHistory.length; i++) {
        let command = user.commandHistory[i].command;
        let count = 0;
        for (let j = 0; j < user.commandHistory.length; j++) {
          if (user.commandHistory[j].command === command) {
            count++;
          }
        }
        if (count > 1 && count > mostUsedCommandCount) {
          mostUsedCommand = command;
          mostUsedCommandCount = count;
        }
      }

      // get the most said words
      let mostUsedWords = [];
      let mostUsedWordsCount = [];

      // get the words with the highest count
      for (let i = 0; i < user.favoriteWords.length; i++) {
        if (mostUsedWords.length >= 3) break;
        let word = user.favoriteWords[i].word;
        let count = user.favoriteWords[i].count;
        // compare this word's count against all others
        for (let j = 0; j < user.favoriteWords.length; j++) {
          if (
            user.favoriteWords[j].count > count &&
            !mostUsedWords.includes(user.favoriteWords[j].word)
          ) {
            count = user.favoriteWords[j].count;
            word = user.favoriteWords[j].word;
          }
        }
        mostUsedWords.push(word);
        mostUsedWordsCount.push(count);
      }

      // try to get the current server
      try {
        let currentGuild = interaction.guild.name;
        // check if the guild name is in the guildSentIn array
        let guildFound = false;
        let guildFoundIndex = 0;
        for (let i = 0; i < user.guildSentIn.length; i++) {
          if (user.guildSentIn[i].guildName === currentGuild) {
            guildFoundIndex = i;
            guildFound = true;
            break;
          }
        }
        if (guildFound) {
          embed.addFields({
            name: "Words Sent In This Server",
            value: `${user.guildSentIn[guildFoundIndex].count} words`,
          });
        }
      } catch {
        let mostWordsSent = 0;
        let mostGuildName = "None";
        for (let i = 0; i < user.guildSentIn.length; i++) {
          if (user.guildSentIn[i].count > mostWordsSent) {
            mostWordsSent = user.guildSentIn[i].count;
            mostGuildName = user.guildSentIn[i].guildName;
          }
        }
        embed.addFields({
          name: "Server With Most Words Sent",
          value: `${mostGuildName} (${mostWordsSent} words)`,
        });
      }

      embed.addFields({
        name: "Most Used Command",
        value: `${mostUsedCommand} (${mostUsedCommandCount} times)`,
      });

      for (let i = 0; i < mostUsedWords.length; i++) {
        embed.addFields({
          name: `Most Used Word #${i + 1}`,
          value: `${mostUsedWords[i]} (${mostUsedWordsCount[i]} times)`,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === "subscription") {
      const embed = new EmbedBuilder()
        .setTitle("User Settings")
        .setColor(0x00deff)
        .setThumbnail(
          "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
        )
        .addFields({
          name: "Subscription Status",
          value: user.subscribed ? "Subscribed" : "Not Subscribed",
        })
        .setTimestamp();
      if (user.subscribed) {
        embed.setDescription(
          `You are subscribed to J.Y.N.E, and have access to premium services/commands.`
        );
      } else {
        embed.setDescription("You are not currently subscribed to J.Y.N.E.");
      }
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === "achievements") {
      const embed = new EmbedBuilder()
        .setTitle("Unlocked Achievements")
        .setDescription(
          `These are the achievements you have unlocked, **${usersName}**. You can unlock more by playing games and using commands.`
        )
        .setThumbnail(
          "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
        )
        .setColor(0x00deff)
        .setTimestamp();
      unlockedAchievements = [];
      for (let i = 0; i < user.achievements.length; i++) {
        unlockedAchievements.push(
          achievements.find((a) => a.id === user.achievements[i])
        );
      }
      if (unlockedAchievements.length > 0) {
        for (let i = 0; i < unlockedAchievements.length; i++) {
          embed.addFields({
            name: unlockedAchievements[i].title,
            value: unlockedAchievements[i].description,
          });
        }
      } else {
        embed.setDescription("You have not unlocked any achievements yet.");
      }
      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === "creations") {
      if (user.aiGenerations.length === 0)
        return interaction.reply("You have not made any AI creations yet.");
      const embed = new EmbedBuilder()
        .setTitle(`${usersName}'s AI Creations`)
        .setDescription(
          `These are the AI-generated images you have made, **${usersName}**.`
        )
        .setThumbnail(
          "https://media.discordapp.net/attachments/1051228955425914933/1071485063721664542/dream-img-done.gif?width=676&height=676"
        )
        .setColor(0x00deff)
        .setFooter({ text: "In Your Gallery: Image #1" })
        .setTimestamp();
      lastIndex = user.aiGenerations.length - 1;
      let date = new Date(user.aiGenerations[lastIndex].dateCreated);
      date = date.toLocaleString("en-US", {
        timeZone: "America/New_York",
      });
      embed.addFields(
        {
          name: `Prompt`,
          value: user.aiGenerations[lastIndex].prompt,
        },
        {
          name: `Seed`,
          value: `${user.aiGenerations[lastIndex].seed}`,
        },
        {
          name: `Date Created`,
          value: date + " EST",
        }
      );
      const file = new AttachmentBuilder(
        user.aiGenerations[lastIndex].pathToImage
      );
      embed.setImage(`attachment://${user.aiGenerations[lastIndex].fileName}`);

      const previousImage = new ButtonBuilder()
        .setCustomId("previousCreation")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
      const nextImage = new ButtonBuilder()
        .setCustomId("nextCreation")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary);

      if (user.aiGenerations.length === 1) {
        nextImage.setDisabled(true);
      }

      const row = new ActionRowBuilder().addComponents(
        previousImage,
        nextImage
      );
      await interaction.reply({
        embeds: [embed],
        files: [file],
        components: [row],
      });
    } else {
      await interaction.reply("Something went wrong.");
    }
  },
};

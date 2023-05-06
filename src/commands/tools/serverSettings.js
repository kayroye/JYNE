const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const Guild = require("../../events/schemas/guild.js");
const mongoose = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-settings")
    .setDescription("View and edit the server settings.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View the server settings.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting to view.")
            .addChoices(
              {
                name: "Auto Responses",
                value: "respondToMessages",
              },
              {
                name: "Hangman",
                value: "hangman",
              }
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit the server settings.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting to edit.")
            .addChoices(
              {
                name: "Auto Responses",
                value: "respondToMessages",
              },
              {
                name: "Hangman",
                value: "hangman",
              }
            )
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const currentGuild = await Guild.findOne({ guildId: guildId });
    const setting = interaction.options.getString("setting");
    console.log(currentGuild);
    if (subcommand === "view") {
      if (setting === "respondToMessages") {
        const respondToMessages = currentGuild.guildSettings.respondToMessages;
        const embed = new EmbedBuilder()
          .setTitle("Server Settings")
          .setDescription(
            `Here you can view how J.Y.N.E behaves in ${currentGuild.guildName}.`
          )
          .setThumbnail(
            "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
          )
          .addFields({
            name: "Auto Responses",
            value: `Auto responses are messages that J.Y.N.E will send when certain keywords are used. Currently, auto responses are ${
              respondToMessages ? "enabled" : "disabled"
            }.`,
          })
          .setFooter({ text: "Page 1" })
          .setColor(0x00deff)
          .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      } else if (setting === "hangman") {
        const hangmanWords = currentGuild.guildSettings.hangmanSettings;
        const embed = new EmbedBuilder()
          .setTitle("Server Settings")
          .setDescription(
            `Here you can view words used for hangman games in your server.`
          )
          .setThumbnail(
            "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
          )
          .setColor(0x00deff)
          .setTimestamp();
        for (let i = 0; i < hangmanWords.length; i++) {
          embed.addFields({
            name: `${i + 1}. ${hangmanWords[i].word}`,
            value: `Category: ${hangmanWords[i].category}`,
          });
          if(i === 7) break;
        }
        if (hangmanWords.length > 8) {
          embed.setFooter({ text: "Page 1" });
          const next = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("➡")
            .setCustomId("hangmanNext");
          const prev = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("⬅")
            .setCustomId("hangmanPrev")
            .setDisabled(true);
          const row = new ActionRowBuilder().addComponents([prev, next]);
          await interaction.reply({ embeds: [embed], components: [row] });
        } else {
          await interaction.reply({ embeds: [embed] });
        }
      }
    } else if (subcommand === "edit") {
      if (setting === "respondToMessages") {
        const respondToMessages = currentGuild.guildSettings.respondToMessages;
        const embed = new EmbedBuilder()
          .setTitle("Server Settings")
          .setDescription(
            `Here you can edit how J.Y.N.E behaves in ${currentGuild.guildName}.`
          )
          .setThumbnail(
            "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
          )
          .addFields({
            name: "Auto Responses",
            value: `${respondToMessages ? "**Enabled**" : "**Disabled**"}.`,
          })
          .setFooter({ text: `${interaction.user.id}` })
          .setColor(0x00deff)
          .setTimestamp();
        const enable = new ButtonBuilder()
          .setStyle(ButtonStyle.Success)
          .setLabel("Enable")
          .setCustomId("eAutoResponses")
          .setDisabled(respondToMessages);
        const disable = new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setLabel("Disable")
          .setCustomId("dAutoResponses")
          .setDisabled(!respondToMessages);
        const row = new ActionRowBuilder().addComponents([enable, disable]);
        await interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });
      } else if (setting === "hangman") {
        const hangmanWords = currentGuild.guildSettings.hangmanSettings;
        const embed = new EmbedBuilder()
          .setTitle("Server Settings")
          .setDescription(
            `Would you like to add a word for use in Hangman games, or remove one?`
          )
          .setThumbnail(
            "https://media.discordapp.net/attachments/927705264302489643/1068305578226634803/settingsgear.png"
          )
          .setColor(0x00deff)
          .setTimestamp();
        const add = new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel("Add +")
          .setCustomId("addHangmanWord");
        const remove = new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setLabel("Remove -")
          .setCustomId("removeHangmanWord");
        const row = new ActionRowBuilder().addComponents([add, remove]);
        await interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });
      }
    }
  },
};

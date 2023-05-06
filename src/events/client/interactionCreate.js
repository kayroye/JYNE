const { Events, InteractionType } = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const mongoose = require("mongoose");
const { createUser } = require("../../newUser.js");

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        // get the guild the command was used in
        const guild = interaction.guild;
        console.log(
          `${interaction.user.tag} in #${interaction.channel.name} used command ${commandName} in ${guild.name}`
        );
      } catch (error) {
        console.log(`${interaction.user.tag} used command ${commandName}`);
      }
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
      try {
        // get the user who used the command
        let user = await DiscordUser.findOne({ userId: interaction.user.id });
        if (!user) {
          await createUser(interaction.user.id, interaction.user.username);
          user = await DiscordUser.findOne({ userId: interaction.user.id });
        }

        // get the current date and time
        const date = new Date();
        // add the command to the user's command history
        user.commandHistory.push({
          command: commandName,
          date: date,
        });

        // check for any global achievements
        if (!user.achievements.includes("jyneUsed100") && user.commandHistory.length === 100) {
          user.achievements.push("jyneUsed100");
        }
        // save the updated user to the database
        await user.save();
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button) return new Error("There is no code for this button!");

      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this button!",
          ephemeral: true,
        });
      }
    } else if (interaction.isSelectMenu()) {
      const { selectMenus } = client;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      if (!menu) return new Error("There is no code for this menu!");

      try {
        await menu.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this menu!",
          ephemeral: true,
        });
      }
    } else if (interaction.isContextMenuCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const contextCommand = commands.get(commandName);
      if (!contextCommand) return;

      try {
        await contextCommand.execute(interaction, client);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.type == InteractionType.ApplicationCommandAutocomplete)
    {
      const  {commands}  = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.type == InteractionType.ModalSubmit) {
      const { modals } = client;
      const { customId } = interaction;
      const modal = modals.get(customId);
      if (!modal) return new Error("There is no code for this modal!");

      try {
        await modal.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this modal!",
          ephemeral: true,
        });
      }
    }
  },
};

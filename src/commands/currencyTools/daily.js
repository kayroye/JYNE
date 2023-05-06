const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const { createUser } = require("../../newUser.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Get your daily Elysium."),
    async execute(interaction) {
        const user = await DiscordUser.findOne({ userId: interaction.user.id });
        if (!user) {
            await createUser(interaction.user.id, interaction.user.username);
            const newUser = await DiscordUser.findOne({ userId: interaction.user.id });
            newUser.elysium += 5;
            newUser.lastDaily = Date.now();
            await newUser.save();
            const embed = new EmbedBuilder()
                .setTitle("Daily Elysium")
                .setThumbnail("https://media.discordapp.net/attachments/933049423217459251/1068206447709671424/elysium_central_bank.png?width=468&height=468")
                .setDescription(`You have received 55 <:elysium:1068187873909690508> Elysium!`)
                .setColor(0x6490cd)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } else {
            const lastDaily = user.lastDaily;
            const now = Date.now();
            const difference = now - lastDaily;
            const hours = Math.floor(difference / 1000 / 60 / 60);
            if (hours < 24) {
                const embed = new EmbedBuilder()
                    .setTitle("Daily Elysium")
                    .setThumbnail("https://media.discordapp.net/attachments/933049423217459251/1068206447709671424/elysium_central_bank.png?width=468&height=468")
                    .setDescription(`You have already claimed your daily Elysium! Come back in ${24 - hours} hours.`)
                    .setColor(0x6490cd)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            } else {
                user.elysium += 5;
                user.lastDaily = Date.now();
                await user.save();
                const embed = new EmbedBuilder()
                    .setTitle("Daily Elysium")
                    .setThumbnail("https://media.discordapp.net/attachments/933049423217459251/1068206447709671424/elysium_central_bank.png?width=468&height=468")
                    .setDescription(`You have received 5 <:elysium:1068187873909690508> Elysium!`)
                    .setColor(0x6490cd)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            }
        }
    },
};
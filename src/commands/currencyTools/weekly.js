const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("weekly")
        .setDescription("Get your weekly Elysium."),
    async execute(interaction) {
        const user = await DiscordUser.findOne({ userId: interaction.user.id });
        if (!user) {
            const newUser = new DiscordUser({
                _id: mongoose.Types.ObjectId(),
                userId: interaction.user.id,
                elysium: 60,
                lastWeekly: Date.now(),
                achievements: [],
            });
            await newUser.save();
            const embed = new EmbedBuilder()
                .setTitle("Weekly Elysium")
                .setThumbnail("https://media.discordapp.net/attachments/933049423217459251/1068206447709671424/elysium_central_bank.png?width=468&height=468")
                .setDescription(`You have received 60 <:elysium:1068187873909690508> Elysium!`)
                .setColor(0x6490cd)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } else {
            const lastWeekly = user.lastWeekly;
            const now = Date.now();
            const difference = now - lastWeekly;
            const hours = Math.floor(difference / 1000 / 60 / 60);
            if (hours < 168) {
                const embed = new EmbedBuilder()
                    .setTitle("Weekly Elysium")
                    .setThumbnail("https://media.discordapp.net/attachments/933049423217459251/1068206447709671424/elysium_central_bank.png?width=468&height=468")
                    .setDescription(`You have already claimed your weekly Elysium! Come back in about ${Math.floor((168 - hours) / 24)} days.`)
                    .setColor(0x6490cd)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            } else {
                user.elysium += 10;
                user.lastWeekly = Date.now();
                await user.save();
                const embed = new EmbedBuilder()
                    .setTitle("Weekly Elysium")
                    .setThumbnail("https://media.discordapp.net/attachments/933049423217459251/1068206447709671424/elysium_central_bank.png?width=468&height=468")
                    .setDescription(`You have received 10 <:elysium:1068187873909690508> Elysium!`)
                    .setColor(0x6490cd)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            }
        }
    },
};
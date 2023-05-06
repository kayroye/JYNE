const { ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "calcButton4",
    },
    async execute(interaction, client) {
        // get the content of the message
        let content = interaction.message.content;
        // remove all ` characters
        content = content.replace(/`/g, "");
        if(content === "0") {
            content = "4";
        }
        else {
            content += "4";
        }
        // create the new message
        const newMessage = `\`\`\`${content}\`\`\``;
        // create the new buttons
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("calcButton1")
                    .setLabel("1")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButton2")
                    .setLabel("2")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButton3")
                    .setLabel("3")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButtonMultiply")
                    .setLabel("x")
                    .setStyle(ButtonStyle.Primary),
            );
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("calcButton4")
                    .setLabel("4")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButton5")
                    .setLabel("5")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButton6")
                    .setLabel("6")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButtonDivide")
                    .setLabel("/")
                    .setStyle(ButtonStyle.Primary),
            );
        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("calcButton7")
                    .setLabel("7")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButton8")
                    .setLabel("8")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButton9")
                    .setLabel("9")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButtonAdd")
                    .setLabel("+")
                    .setStyle(ButtonStyle.Primary),
            );
        const row4 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("calcButton0")
                    .setLabel("0")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButtonDecimal")
                    .setLabel(".")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButtonEquals")
                    .setLabel("=")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("calcButtonSubtract")
                    .setLabel("-")
                    .setStyle(ButtonStyle.Primary),
            );
        const row5 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("calcButtonClear")
                    .setLabel("Clear")
                    .setStyle(ButtonStyle.Danger),
            );
        // edit the message
        await interaction.update({
            content: newMessage,
            components: [row1, row2, row3, row4, row5],
        });
    }
}
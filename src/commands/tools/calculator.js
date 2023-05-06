const {SlashCommandBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("calculator")
        .setDescription("This command will open a calculator.")
        .addStringOption(option =>
            option.setName("expression")
                .setDescription("The expression to calculate.")
                .setRequired(false)),
    async execute(interaction) {
        const message = await interaction.deferReply();
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
        if (interaction.options.getString("expression")) {
            // check the expression for letters
            const expression = interaction.options.getString("expression");
            let letters = expression.match(/[a-w]/gi);
            let letters2 = expression.match(/[y-z]/gi);
            if (letters || letters2) {
                await interaction.editReply({ content: "You can only use numbers in the expression.", ephemeral: true });
            } else {
                await interaction.editReply({
                    content: "```" + interaction.options.getString("expression") + "```",
                    components: [row1, row2, row3, row4, row5],
                });
            }
        } else {
        await interaction.editReply({
            content: "```0```",
            components: [row1, row2, row3, row4, row5],
        });
    }
    }
}
module.exports = {
    data: {
        name: "selectmenu",
    },
    async execute(interaction, client) {
        await interaction.reply({ content: `You selected: ${interaction.values[0]}`, ephemeral: true });
    },
};

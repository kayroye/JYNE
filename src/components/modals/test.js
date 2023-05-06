module.exports = {
    data: {
        name: "test",
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: `You said ${interaction.fields.getTextInputValue('testInput')}`,
            ephemeral: true,
        });
    }
}
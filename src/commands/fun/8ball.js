const { SlashCommandBuilder } = require('discord.js');

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
  }

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Answers a yes/no question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question you would like to ask')
                .setRequired(true)),
	async execute(interaction) {
        const eightballNum = between(1, 6);
        if (eightballNum === 1) { await interaction.reply('That is a resounding no')}
        else if (eightballNum === 2) { await interaction.reply('It is not looking likely')}
        else if (eightballNum === 3) { await interaction.reply('Too hard to tell')}
        else if (eightballNum === 4) { await interaction.reply('It is quite possible')}
        else if (eightballNum === 5) { await interaction.reply('Definitely')}
        else if (eightballNum === 6) { await interaction.reply('<:oioi:869254735734145096>')}
	},
};
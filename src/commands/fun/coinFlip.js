const { SlashCommandBuilder } = require('discord.js');

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
  }

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Flips a coin!'),
	async execute(interaction) {
        const coinFlipNum = between(1, 2)
        if (coinFlipNum === 1) { 
            await interaction.reply('Heads!')
        } else {
            await interaction.reply('Tails!')
        }
	},
};
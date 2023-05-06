const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Asks a question users can vote on.')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('The first option.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('The second option.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('The third option.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('The fourth option.')
                .setRequired(false)),
    async execute(interaction, client) {
        const message = await interaction.reply({ content: 'Loading...', fetchReply: true });

        let question = interaction.options.getString('question');
        let option1 = interaction.options.getString('option1');
        let option2 = interaction.options.getString('option2');

        // make first letter of option uppercase
        option1 = option1.charAt(0).toUpperCase() + option1.slice(1);
        option2 = option2.charAt(0).toUpperCase() + option2.slice(1);

        let option3 = interaction.options.getString('option3');
        let option4 = interaction.options.getString('option4');

        let isThirdOption = false;
        let isFourthOption = false;

        // if the last character of the question is not a question mark, add it
        if(question.charAt(question.length - 1) !== '?') {
            question += '?';
        }
            

        if(option3) {
            isThirdOption = true;
            option3 = option3.charAt(0).toUpperCase() + option3.slice(1);
        }

        if(option4) {
            isFourthOption = true;
            option4 = option4.charAt(0).toUpperCase() + option4.slice(1);
        }

        let userNickname = interaction.member.nickname;
        if(!userNickname) {
            userNickname = interaction.user.tag;
        }

        const embed = new EmbedBuilder()
            .setTitle(question)
            .setDescription(`1️⃣: ${option1}\n2️⃣: ${option2}\n${isThirdOption ? `3️⃣: ${option3}\n` : ''}${isFourthOption ? `4️⃣: ${option4}\n` : ''}`)
            .setColor('#0099ff')
            .setAuthor({ name: userNickname, iconURL: interaction.user.avatarURL() })
            .setThumbnail("https://cdn.discordapp.com/attachments/1051228955425914933/1061141886217236610/pollIMG.png")
            .setTimestamp();

        await message.edit({ content: ' ', embeds: [embed] });
        message.react("1️⃣");
        message.react("2️⃣");

        if(isThirdOption) {
            message.react("3️⃣");
        }

        if(isFourthOption) {
            message.react("4️⃣");
        }
    },
};
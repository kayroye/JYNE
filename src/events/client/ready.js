const { Events, ActivityType } = require('discord.js')

module.exports = {
    name: 'ready',
    once: true,
    // When the client is ready, run this code (only once)
    async execute(client) {
        // wait 1 second 
        await new Promise(r => setTimeout(r, 1000));
        // log that the bot is online in the console
        console.log(`J.Y.N.E is online, logged in as ${client.user.tag}`);
        // set the bot's activity 
        await client.user.setPresence({
            activities: [{
                name: '/daily | /leaderboard | /search',
                type: ActivityType.Playing
            }],
            status: 'online'
        });
    },
};
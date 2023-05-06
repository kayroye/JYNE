require("dotenv").config();

const { token, databaseToken } = process.env;
const { connect } = require("mongoose");
const mongoose = require("mongoose");
const Guilddb = require("../src/events/schemas/guild.js");
const discordUser = require("../src/events/schemas/discordUser.js");
const userSettings = require("../src/events/schemas/userSettings.js");
const { createUser } = require("../src/newUser.js");
const { Client, Collection, GatewayIntentBits, Guild } = require("discord.js");
const { translate } = require("@vitalets/google-translate-api");
const { Player } = require("discord-player");
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let translateMessage = "";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
client.commands = new Collection();
client.commandArray = [];
client.buttons = new Collection();
client.modals = new Collection();
client.selectMenus = new Collection();

const player = new Player(client);

player.events.on("error", (queue, error) => {
  console.log(
    `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
  );
});
player.events.on("playerError", (queue, error) => {
  console.log(
    `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
  );
});

player.events.on("playerStart", (queue, track) => {
  queue.metadata.channel.send(
    `🎶 | Started playing: **${track.title}** by ${track.author}!`
  );
});

player.events.on("audioTrackAdd", (queue, track) => {
  queue.metadata.channel.send(
    `🎶 | Track **${track.title}** by ${track.author} queued!`
  );
});

player.events.on("disconnect", async (queue) => {
  queue.metadata.channel.send("❌ | I disconnected from the voice channel!");
});

player.events.on("emptyChannel", (queue) => {
  queue.metadata.channel.send(
    "❌ | Nobody is in the voice channel, leaving..."
  );
});

player.events.on("emptyQueue", (queue) => {
  queue.metadata.channel.send("✅ | Queue finished!");
});

player.events.on("audioTracksAdd", (queue) => {
  queue.metadata.channel.send(`🎶 | Several tracks queued!`);
});

player.events.on("connection", (queue) => {});

const functionFolders = fs.readdirSync("./src/functions");
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // look for the user in the database
  let newUser = await discordUser.findOne({ userId: message.author.id });
  if (!newUser) {
    // if the user is not in the database, create a new user
    createUser(message.author.id, message.author.username);
    newUser = await discordUser.findOne({ userId: message.author.id });
  } else {
    // if the user is in the database, update their username
    newUser.userName = message.author.username;
    // check if the guild id is in the array
    if (!newUser.inGuilds.includes(message.guildId)) {
      // if the guild id is not in the array, add it
      newUser.inGuilds.push(message.guildId);
    }
    // save the updated user to the database
    await newUser.save().catch((err) => console.log(err));
  }

  // look for the guild in the database
  let guildProfile = await Guilddb.findOne({ guildId: message.guildId });
  if (!guildProfile) {
    // if the guild is not in the database, create a new guild
    guildProfile = new Guilddb({
      _id: mongoose.Types.ObjectId(),
      guildId: message.guildId,
      guildName: message.guild.name,
      guildIcon: message.guild.iconURL(),
      guildSettings: {
        respondToMessages: false,
        hangmanSettings: [
          {
            word: "United States",
            category: "Countries",
          },
          {
            word: "Canada",
            category: "Countries",
          },
          {
            word: "Germany",
            category: "Countries",
          },
          {
            word: "Bitcoin",
            category: "Finance",
          },
          {
            word: "Twitter",
            category: "Popular Apps",
          },
          {
            word: "Instagram",
            category: "Popular Apps",
          },
          {
            word: "Discord",
            category: "Popular Apps",
          },
          {
            word: "Snapchat",
            category: "Popular Apps",
          },
        ],
      },
    });
    // save the new guild to the database
    await guildProfile.save().catch((err) => console.log(err));
  }

  let words = [];

  let theMessage = message.content.toLowerCase();
  words = theMessage.split(" ");
  const favouriteWords = newUser.favoriteWords;
  const ignoredWords = [
    "translate",
    "trnslt",
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "so",
    "for",
    "nor",
    "yet",
    "to",
    "from",
    "of",
    "in",
    "on",
    "at",
    "by",
    "with",
    "about",
    "as",
    "into",
    "like",
    "through",
    "after",
    "over",
    "between",
    "out",
    "against",
    "during",
    "without",
    "before",
    "under",
    "around",
    "among",
    "down",
    "off",
    "up",
    "within",
    "along",
    "across",
    "behind",
    "beyond",
    "except",
    "near",
    "onto",
    "past",
    "to",
    "toward",
    "upon",
    "according",
    "this",
    "that",
    "these",
    "those",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "shall",
    "should",
    "can",
    "could",
    "may",
    "might",
    "must",
    "am",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "hit",
    "stay",
  ];
  let foundWord = false;
  for (let i = 0; i < words.length; i++) {
    if (
      !ignoredWords.includes(words[i]) &&
      !words[i].startsWith("<") &&
      words[i] !== ""
    ) {
      // search the favouriteWords array for the object with the word property equal to the current word
      foundWord = false;
      for (const word of favouriteWords) {
        if (word.word === words[i]) {
          word.count = word.count + 1;
          // get the index of this word in the favouriteWords array
          const index = favouriteWords.indexOf(word);
          foundWord = true;
          newUser.favoriteWords.set(index, word);
          break;
        }
      }
      if (!foundWord) {
        favouriteWords.push({
          word: words[i],
          count: 1,
        });
      } else {
        // nothing todo
      }
    }
    // check if guild is in guildSentIn array of objects
    let foundGuild = false;
    for (const guild of newUser.guildSentIn) {
      if (guild.guildId === message.guildId) {
        guild.count = guild.count + 1;
        const index = newUser.guildSentIn.indexOf(guild);
        foundGuild = true;
        newUser.guildSentIn.set(index, guild);
        break;
      }
    }
    if (!foundGuild) {
      newUser.guildSentIn.push({
        guildId: message.guildId,
        guildName: message.guild.name,
        count: 1,
      });
    }
  }
  await newUser.save().catch((err) => console.log(err));

  if (theMessage !== "translate" && theMessage !== "trnslt") {
    translateMessage = message.content;
  }

  if (theMessage === "translate" || theMessage === "trnslt") {
    const translated = await translate(translateMessage, { to: "en" });
    console.log(translated.text);
    message.channel.send("**Translation**: " + translated.text);
  }

  if (message.mentions.users.has("1051228009580994710")) {
    message.channel.sendTyping();

    let prompt;
    if (message.content.includes("<@1051228009580994710>")) {
      prompt = message.content.split("<@1051228009580994710>");
      prompt = prompt[1];
    } else {
      prompt = message.content;
    }
    let messages = [
      {
        role: "system",
        content:
          "You are a female discord bot named J.Y.N.E (stands for Just Your Neighborhood Executable) that is very knowledgeable and very funny. Your responses should be very concise, simple, and easy to read, with a bit of comedic value. Only if a user is being serious should you be serious as well. If a user seems lost or bored, attempt to persuade the user to use your commands. These include but are not limited to: /blackjack, /gtn, /daily (for elysium). If it seems like the user may want more information from one of your responses, advise them to use /chat to continue the conversation. Do not advise the user to use '/chat' if their question is short and simple, only reference it when the questions are longer and more intense.",
      },
      {
        role: "user",
        content: `${message.author.username} says: ${prompt}`,
      },
    ];

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 300,
    });

    try {
      message.channel.send(response.data.choices[0].message.content);
    } catch {
      message.channel.send(
        "Sorry! I hit an error trying to process that for you. Wait a bit then try again."
      );
    }
  }

  if (guildProfile.guildSettings.respondToMessages === false) return;

  if (theMessage === "no") {
    let responses = [
      "<:oioi:869254735734145096> must.",
      "Have to.",
      "L bozo",
      "NO <:oioi:869254735734145096>",
      "How about yes?",
      "You're right, absolutely not.",
    ];
    const random = Math.floor(Math.random() * responses.length);
    message.channel.send(responses[random]);
  }

  if (theMessage === "yes") {
    let responses = [
      "ALWAYS <:PepeMoustache:857757255021887538>",
      "Lmao yeah facts",
      "<:oioi:869254735734145096>",
      "I mean yeah, I guess.",
      "I'm not sure if I agree with you, but I'm not sure if I disagree either.",
      "Absolutely.",
    ];
    const random = Math.floor(Math.random() * responses.length);
    message.channel.send(responses[random]);
  }

  if (theMessage === "i love you" || theMessage === "ily") {
    let responses = ["I love you too, <@" + message.author.id + ">"];
    const random = Math.floor(Math.random() * responses.length);
    message.channel.send(responses[random]);
  }

  if (
    theMessage === "lol" ||
    theMessage === "lmao" ||
    theMessage === "lmaoo" ||
    theMessage === "kek"
  ) {
    let responses = [
      "https://cdn.discordapp.com/emojis/756316907166236702.webp?size=64&quality=lossless",
      "Yeah that's funny. Not sure why.",
      "lolololol",
      ":eyes:",
    ];
    const random = Math.floor(Math.random() * responses.length);
    message.channel.send(responses[random]);
  }

  if (
    theMessage === "stfu" ||
    theMessage === "shut up" ||
    theMessage === "shut" ||
    theMessage === "shut up jyne"
  ) {
    let responses = ["No.", "You first."];
    const random = Math.floor(Math.random() * responses.length);
    message.channel.send(responses[random]);
  }

  if (theMessage === "how") {
    message.channel.send("<:HOW:803978027033559090>");
  }

  if (
    theMessage === "bad bot" ||
    theMessage === "wtf bot" ||
    theMessage === "wtf jyne" ||
    theMessage === "l bot"
  ) {
    let responses = [
      "<:woris:994677336844804176>",
      "I'm sorry",
      "Shutting down...\n\nNah just kidding.",
    ];
    const random = Math.floor(Math.random() * responses.length);
    message.channel.send(responses[random]);
  }

  if (theMessage === "who") {
    let responses = [
      "<:who:832103958377136178>",
      ":index_pointing_at_the_viewer:",
    ];
    const random = Math.floor(Math.random() * responses.length);
    message.channel.send(responses[random]);
  }
});

client.on("guildCreate", async (Guild) => {
  // when the bot is added to a new guild, add the guild to the database
  guildProfile = await new Guilddb({
    _id: mongoose.Types.ObjectId(),
    guildId: Guild.id,
    guildName: Guild.name,
    guildIcon: Guild.iconURL() ? Guild.iconURL() : "None.",
    guildSettings: {
      respondToMessages: false,
      hangmanSettings: [
        {
          word: "United States",
          category: "Countries",
        },
        {
          word: "Canada",
          category: "Countries",
        },
        {
          word: "Germany",
          category: "Countries",
        },
        {
          word: "Bitcoin",
          category: "Finance",
        },
        {
          word: "Twitter",
          category: "Popular Apps",
        },
        {
          word: "Instagram",
          category: "Popular Apps",
        },
        {
          word: "Discord",
          category: "Popular Apps",
        },
        {
          word: "Snapchat",
          category: "Popular Apps",
        },
      ],
    },
  });

  await guildProfile.save().catch((err) => console.log(err));
  console.log(`I was added to the server ${guildProfile.guildName}!`);
});

client.on("guildDelete", async (Guild) => {
  // when the bot is removed from a guild, remove the guild from the database
  const deletingGuild = await Guilddb.findOne({ guildId: Guild.id });
  console.log(`I was removed from the server ${deletingGuild.guildName}.`);
  const deletedGuild = await Guilddb.deleteOne({ guildId: Guild.id });
  console.log(deletedGuild);
});

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(token);
(async () => {
  await connect(databaseToken).catch(console.error);
})();

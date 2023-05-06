const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");
const DiscordUser = require("../../events/schemas/discordUser.js");
const achievements = require("../../../achievements.json");
const mongoose = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Plays a game of Blackjack with the bot!")
    .addIntegerOption((option) =>
      option
        .setName("bet")
        .setDescription("The amount of Elysium you're willing to bet")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const bet = interaction.options.getInteger("bet");

    // get the user from the users db
    let user = await DiscordUser.findOne({
      userId: interaction.user.id,
    }).populate("settings");
    // if no user is found, return an error
    if (!user) {
      return await interaction.editReply(
        "You are not in my database! Use the commands /daily or /balance to become registered."
      );
    }

    // Check if user has enough elysium to bet
    if (user.elysium < bet) {
      return await interaction.editReply(
        "You do not have enough <:elysium:1068187873909690508> Elysium to bet!"
      );
    }

    // set the player's name to their nickname if they have one
    let playerName = interaction.guild.members.cache.get(
      interaction.user.id
    ).nickname;
    if (playerName == null) {
      playerName = interaction.user.username;
    }
    if (user.settings.prefix) {
      playerName = user.settings.prefix + " " + playerName;
    }

    // Set variables
    const starting1 = Math.floor(Math.random() * 11 + 1);
    const starting2 = Math.floor(Math.random() * 11 + 1);

    let playerTotal = starting1 + starting2;

    const embed = new EmbedBuilder()
      .setTitle("Blackjack")
      .setDescription(
        `You got a **${starting1}** and a **${starting2}**, therefore your total is **${playerTotal}**.`
      )
      .setThumbnail(
        "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676"
      )
      .setColor(0x00deff)
      .setTimestamp();

    // Achievements checker
    const playerAchievements = user.achievements;
    const achievedToday = [];

    async function checkAchievements(won, bet) {
      user = await DiscordUser.findOne({ userId: interaction.user.id });
      let timesWon = user.highScores.blackjackWins;
      if ((!timesWon || timesWon < 1) && won === true) {
        timesWon = 1;
        playerAchievements.push("blackjackWon1");
        achievedToday.push("blackjackWon1");
      } else if (won === true) {
        timesWon += 1;
      }

      if (bet >= 100 && won === true) {
        playerAchievements.push("blackjackBigBet");
        achievedToday.push("blackjackBigBet");
      }

      if (timesWon === 10) {
        playerAchievements.push("blackjackWon10");
        achievedToday.push("blackjackWon10");
      } else if (timesWon === 100) {
        playerAchievements.push("blackjackWon100");
        achievedToday.push("blackjackWon100");
      }

      user.achievements = playerAchievements;
      user.highScores.blackjackWins = timesWon;
      await user.save();

      if (achievedToday.length > 0) {
        const achievementEmbed = new EmbedBuilder()
          .setTitle("Achievements Unlocked!")
          .setColor(0x00deff)
          .setTimestamp();
        const fieldsToAdd = [];
        for (const achievement of achievedToday) {
          // find where the achievement is in the achievements.json file
          const achievementIndex = achievements.findIndex(
            (a) => a.id === achievement
          );
          fieldsToAdd.push({
            name: achievements[achievementIndex].title,
            value: achievements[achievementIndex].description,
          });
        }
        achievementEmbed.addFields(fieldsToAdd);
        await interaction.followUp({ embeds: [achievementEmbed] });
      }
    }

    // if the player gets 21 right away, they win, and their elysium is 1.5x
    // if the player gets 22 right away, they lose immediately
    // if the player does not, the game continues
    if (playerTotal === 21) {
      await interaction.editReply({ embeds: [embed] });
      const earnings = Math.floor(bet * 1.5) - bet;
      const winningEmbed = new EmbedBuilder()
        .setTitle("Blackjack")
        .setDescription(
          `Blackjack! You've won right off the bat, congratulations, ${playerName}!`
        )
        .setThumbnail(
          "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676"
        )
        .setColor(0x00deff)
        .addFields(
          {
            name: "Your Bet",
            value: `${bet} <:elysium:1068187873909690508> Elysium`,
          },
          {
            name: "Your Earnings",
            value: `+${earnings} <:elysium:1068187873909690508> Elysium`,
          },
          {
            name: "Current Balance",
            value: `${
              user.elysium + bet
            } <:elysium:1068187873909690508> Elysium`,
          }
        );
      // award the player their earnings
      user.elysium += earnings;
      await user.save();
      await interaction.followUp({ embeds: [winningEmbed] });
      checkAchievements(true, bet);
    } else if (playerTotal === 22) {
      await interaction.editReply({ embeds: [embed] });
      const instantLoseEmbed = new EmbedBuilder()
        .setTitle("Blackjack")
        .setDescription(
          `Thats unfortunate... You've lost right off the bat! Sorry, ${playerName}.`
        )
        .setThumbnail(
          "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676"
        )
        .setColor(0x00deff)
        .addFields(
          {
            name: "Your Losses",
            value: `-${bet} <:elysium:1068187873909690508> Elysium`,
          },
          {
            name: "Current Balance",
            value: `${
              user.elysium - bet
            } <:elysium:1068187873909690508> Elysium`,
          }
        );
      // award the player their earnings
      user.elysium -= bet;
      await user.save();
      return await interaction.followUp({ embeds: [instantLoseEmbed] });
    } else {
      await interaction.editReply({ embeds: [embed] });
      await interaction.followUp({
        content: `Would you like to 'hit' or 'stay', **${playerName}**?`,
        fetchReply: true,
      });
      // create message collector to have the user play
      const blackjkFilter = (m) =>
        (m.content.length === 3 || m.content.length === 4) &&
        m.author.id === interaction.user.id;
      const blackjackCollector = interaction.channel.createMessageCollector({
        filter: blackjkFilter,
        time: 60_000,
      });
      blackjackCollector.on("collect", async (m) => {
        m.content = m.content.toLowerCase();
        // if they hit, roll a number and add it to the playertotal
        if (m.content === "hit") {
          const newRoll = Math.floor(Math.random() * 11 + 1);
          playerTotal += newRoll;
          // if the new player total is over 21, the player lost
          if (playerTotal > 21) {
            const lostEmbed = new EmbedBuilder()
              .setTitle("Blackjack")
              .setThumbnail(
                "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676"
              )
              .setDescription(
                `You hit and got a ${newRoll}. Your new total is ${playerTotal}, which loses the game.\nSorry, ${playerName}.`
              )
              .addFields(
                {
                  name: "Your Losses",
                  value: `-${bet} <:elysium:1068187873909690508> Elysium`,
                },
                {
                  name: "Current Balance",
                  value: `${
                    user.elysium - bet
                  } <:elysium:1068187873909690508> Elysium`,
                }
              );
            // Deduct the bet from users balance
            user.elysium -= bet;
            await user.save();
            // stop the collector from getting new messages
            blackjackCollector.stop();
            return await m.reply({ embeds: [lostEmbed] });
          }
          // if the new player total is 21, tell them, and let the bot now play
          else if (playerTotal === 21) {
            blackjackCollector.stop();
            const instant21Embed = {
              title: "Blackjack",
              description: `You hit and got a **${newRoll}**. Your new total is **${playerTotal}**! Now it's my turn...`,
              color: 0x00deff,
              thumbnail: {
                url: "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676",
              },
              timestamp: new Date().toISOString(),
            };

            const botPlayingMsg = await interaction.followUp({
              embeds: [instant21Embed],
            });

            // set bot variables
            const bStarting1 = Math.floor(Math.random() * 11 + 1);
            const bStarting2 = Math.floor(Math.random() * 11 + 1);

            let botTotal = bStarting1 + bStarting2;
            instant21Embed.description += `\nI drew and got a **${bStarting1}** and a **${bStarting2}**. My total is **${botTotal}**.`;

            // variable to determine if the bot should hit again
            let botHitAgain = true;

            // varibale to determine if the bot lost
            let botLost = "false";

            // if the bot's total is less than 16, hit again
            if (botTotal < 16) {
              instant21Embed.description += "\nI'm going to hit!\n";
            } else if (botTotal > 21) {
              instant21Embed.description += "\nDang! I lost!";
              botLost = "true";
              botHitAgain = false;
            } else if (botTotal === playerTotal && botTotal > 16) {
              instant21Embed.description += "\nWow! Looks like we tied!";
              botLost = "tie";
              botHitAgain = false;
            } else {
              instant21Embed.description += "\nI'll stay.";
              botHitAgain = false;
              if (botTotal > playerTotal) {
                botLost = "false";
              } else {
                botLost = "true";
              }
            }

            // edit the message
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await botPlayingMsg.edit({ embeds: [instant21Embed] });

            while (botHitAgain) {
              // draw another card (number) and add it to bot total
              const bNext = Math.floor(Math.random() * 11 + 1);
              botTotal = botTotal + bNext;

              instant21Embed.description = `I hit and got a **${bNext}**! My total is now **${botTotal}**.`;

              // bot total checks
              if (botTotal < 16) {
                instant21Embed.description += "\nI'm going to hit again!\n";
              } else if (botTotal > 21) {
                instant21Embed.description += "\nDang! I lost!";
                botLost = "true";
                botHitAgain = false;
              } else if (botTotal === playerTotal && botTotal > 16) {
                instant21Embed.description += "\nWow! Looks like we tied!";
                botLost = "tie";
                botHitAgain = false;
              } else {
                instant21Embed.description += "\nI'm I'll stay on this one.";
                botHitAgain = false;
                if (botTotal > playerTotal) {
                  botLost = "false";
                } else {
                  botLost = "true";
                }
              }

              await botPlayingMsg.edit({ embeds: [instant21Embed] });
              await new Promise((resolve) => setTimeout(resolve, 1300));
            }

            // checks for if the bot won or not
            const botCheckEmbed = new EmbedBuilder()
              .setTitle("Blackjack")
              .setThumbnail(
                "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676"
              )
              .setColor(0x00deff)
              .setTimestamp();
            if (botLost === "true") {
              botCheckEmbed.setDescription(
                `Looks like you bested me! Congrats, ${playerName}!`
              );
              const earnings = Math.floor(bet * 1.5) - bet;
              botCheckEmbed.addFields(
                {
                  name: "Your Bet",
                  value: `${bet} <:elysium:1068187873909690508> Elysium`,
                },
                {
                  name: "Your Earnings",
                  value: `+${earnings} <:elysium:1068187873909690508> Elysium`,
                },
                {
                  name: "Current Balance",
                  value: `${
                    user.elysium + earnings
                  } <:elysium:1068187873909690508> Elysium`,
                }
              );
              // award the player their earnings
              user.elysium += earnings;
              await user.save();
              checkAchievements(true, bet);
            } else if (botLost === "tie") {
              botCheckEmbed.setDescription(
                `Looks like we got all tied up! Until next time, ${playerName}!`
              );
              botCheckEmbed.addFields(
                {
                  name: "Your Bet",
                  value: `${bet} <:elysium:1068187873909690508> Elysium`,
                },
                {
                  name: "Your Earnings",
                  value: `+0 <:elysium:1068187873909690508> Elysium`,
                },
                {
                  name: "Current Balance",
                  value: `${
                    user.elysium
                  } <:elysium:1068187873909690508> Elysium`,
                }
              );
            } else {
              botCheckEmbed.setDescription(
                `It seems I've won this round, ${playerName}! Thanks for playing, try again soon!`
              );
              botCheckEmbed.addFields(
                {
                  name: "Your Losses",
                  value: `-${bet} <:elysium:1068187873909690508> Elysium`,
                },
                {
                  name: "Current Balance",
                  value: `${
                    user.elysium - bet
                  } <:elysium:1068187873909690508> Elysium`,
                }
              );
              // remove elysium from users account
              user.elysium -= bet;
              await user.save();
            }

            await interaction.followUp({ embeds: [botCheckEmbed] });
          }
          // if the new player total is not over 21, continue the game
          else {
            const hitEmbed = new EmbedBuilder()
              .setTitle("Blackjack")
              .setDescription(
                `You hit and got a **${newRoll}**. Your new total is **${playerTotal}**!`
              )
              .setThumbnail(
                "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676"
              )
              .setTimestamp()
              .setColor(0x00deff);
            await m.reply({
              embeds: [hitEmbed],
              content: `Good hit! Would you like to 'hit' or 'stay', ${playerName}?`,
            });
          }
        } else if (m.content === "stay") {
          blackjackCollector.stop();
          const stayingEmbed = {
            title: "Blackjack",
            description: `Sure thing, ${playerName}. Your total is **${playerTotal}**! Now it's my turn...`,
            color: 0x00deff,
            timestamp: new Date().toISOString(),
            thumbnail: {
              url: "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676",
            },
          };

          const botPlayingMsg = await interaction.followUp({
            embeds: [stayingEmbed],
          });

          // set bot variables
          const bStarting1 = Math.floor(Math.random() * 11 + 1);
          const bStarting2 = Math.floor(Math.random() * 11 + 1);

          let botTotal = bStarting1 + bStarting2;
          stayingEmbed.description += `\nI drew and got a **${bStarting1}** and a **${bStarting2}**. My total is **${botTotal}**.`;

          // variable to determine if the bot should hit again
          let botHitAgain = true;

          // varibale to determine if the bot lost
          let botLost = "false";

          // if the bot's total is less than 16, hit again
          if (botTotal < 16) {
            stayingEmbed.description += "\nI'm going to hit!\n";
          } else if (botTotal > 21) {
            stayingEmbed.description += "\nDang! I lost!";
            botLost = "true";
            botHitAgain = false;
          } else if (botTotal === playerTotal && botTotal > 16) {
            stayingEmbed.description += "\nWow! Looks like we tied!";
            botLost = "tie";
            botHitAgain = false;
          } else {
            stayingEmbed.description += "\nI'll stay.";
            botHitAgain = false;
            if (botTotal > playerTotal) {
              botLost = "false";
            } else {
              botLost = "true";
            }
          }

          // edit the message
          await botPlayingMsg.edit({ embeds: [stayingEmbed] });
          await new Promise((resolve) => setTimeout(resolve, 2000));

          while (botHitAgain) {
            // draw another card (number) and add it to bot total
            const bNext = Math.floor(Math.random() * 11 + 1);
            botTotal = botTotal + bNext;

            stayingEmbed.description += `I hit and got a **${bNext}**! My total is now **${botTotal}**.`;

            // bot total checks
            if (botTotal < 16) {
              stayingEmbed.description += "\nI'm going to hit again!\n";
            } else if (botTotal > 21) {
              stayingEmbed.description += "\nDang! I lost!";
              botLost = "true";
              botHitAgain = false;
            } else if (botTotal === playerTotal && botTotal > 16) {
              stayingEmbed.description += "\nWow! Looks like we tied!";
              botLost = "tie";
              botHitAgain = false;
            } else {
              stayingEmbed.description += "\nI'll stay on this one.";
              botHitAgain = false;
              if (botTotal > playerTotal) {
                botLost = "false";
              } else {
                botLost = "true";
              }
            }

            await new Promise((resolve) => setTimeout(resolve, 1300));
            await botPlayingMsg.edit({ embeds: [stayingEmbed] });
          }

          // checks for if the bot won or not
          const botCheckEmbed = new EmbedBuilder()
            .setTitle("Blackjack")
            .setColor(0x00deff)
            .setThumbnail(
              "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676"
            )
            .setTimestamp();
          if (botLost === "true") {
            botCheckEmbed.setDescription(
              `Looks like you bested me! Congrats, ${playerName}!`
            );
            const earnings = Math.floor(bet * 1.5) - bet;
            botCheckEmbed.addFields(
              {
                name: "Your Bet",
                value: `${bet} <:elysium:1068187873909690508> Elysium`,
              },
              {
                name: "Your Earnings",
                value: `+${earnings} <:elysium:1068187873909690508> Elysium`,
              },
              {
                name: "Current Balance",
                value: `${
                  user.elysium + earnings
                } <:elysium:1068187873909690508> Elysium`,
              }
            );
            // award the player their earnings
            user.elysium += earnings;
            await user.save();
            checkAchievements(true, bet);
          } else if (botLost === "tie") {
            botCheckEmbed.setDescription(
              `Looks like we got all tied up! Until next time, ${playerName}!`
            );
            botCheckEmbed.addFields(
              {
                name: "Your Bet",
                value: `${bet} <:elysium:1068187873909690508> Elysium`,
              },
              {
                name: "Your Earnings",
                value: `+0 <:elysium:1068187873909690508> Elysium`,
              },
              {
                name: "Current Balance",
                value: `${
                  user.elysium
                } <:elysium:1068187873909690508> Elysium`,
              }
            );
          } else {
            botCheckEmbed.setDescription(
              `It seems I've won this round, ${playerName}! Thanks for playing, try again soon!`
            );
            botCheckEmbed.addFields(
              {
                name: "Your Losses",
                value: `-${bet} <:elysium:1068187873909690508> Elysium`,
              },
              {
                name: "Current Balance",
                value: `${
                  user.elysium - bet
                } <:elysium:1068187873909690508> Elysium`,
              }
            );
            // remove elysium from users account
            user.elysium -= bet;
            await user.save();
          }

          await interaction.followUp({ embeds: [botCheckEmbed] });
        }
      });
      blackjackCollector.on("end", async (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setTitle("Blackjack")
            .setDescription(
              `You took too long to respond, ${playerName}! I ended the game.`
            )
            .setThumbnail(
              "https://media.discordapp.net/attachments/1059650699463499899/1073652053110439987/blackjackJyne.png?width=773&height=676"
            )
            .setColor(0x00deff);
          await interaction.followUp({
            embeds: [timeoutEmbed],
          });
        }
      });
    }
  },
};

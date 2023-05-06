const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
var ChessWebAPI = require("chess-web-api");

var chessAPI = new ChessWebAPI({
  queue: true,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chess")
    .setDescription("This command will pull up data from Chess.com.")
    .addStringOption((option) =>
      option
        .setName("option")
        .setDescription("Choose an option.")
        .setRequired(true)
        .addChoices(
          { name: "Stats", value: "Stats" },
          { name: "Profile", value: "Profile" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("player")
        .setDescription("The name of the player you are looking for.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const player = interaction.options.getString("player");
    const option = interaction.options.getString("option");
    console.log(player, option);
    const message = await interaction.deferReply();
    if (option === "Profile") {
      chessAPI.getPlayer(`${player}`).then(
        async function (response) {
          const playerInfo = response.body;
          let playerJoined = new Date(playerInfo.joined * 1000);
          let playerLastOnline = new Date(playerInfo.last_online * 1000);
          let playerAvatar = "";
          playerJoined = playerJoined.toLocaleString("en-GB", {
            hour12: false,
          });
          playerLastOnline = playerLastOnline.toLocaleString("en-GB", {
            hour12: false,
          });
          try {
            playerAvatar = playerInfo.avatar.toString();
          } catch (error) {
            console.log(error);
            playerAvatar =
              "https://www.chess.com/bundles/web/images/noavatar_l.84a92436.gif";
          }
          let playerFollowers = playerInfo.followers.toString();
          // get the last two characters from the country url
          let playerCountry = playerInfo.country.slice(-2);
          const embed = new EmbedBuilder()
            .setTitle(player + "'s Chess.com Profile")
            .setURL(playerInfo.url)
            .setColor("#77b300")
            .setFooter({
              text: "Data from Chess.com",
              iconURL:
                "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fslack-files2.s3-us-west-2.amazonaws.com%2Favatars%2F2018-01-13%2F298422983363_10ccb3eb4c43017cd041_512.png&f=1&nofb=1&ipt=6d9b0f389261664f64436fe4b4f9e554d8e8f12e2ef43396915025f08e1d9a52&ipo=images",
            })
            .setTimestamp()
            .setThumbnail(playerAvatar)
            .addFields(
              { name: "Followers", value: playerFollowers },
              { name: "Member Since", value: playerJoined },
              { name: "Last Online", value: playerLastOnline },
              { name: "Country", value: playerCountry.toUpperCase() }
            );

          await interaction.editReply({ embeds: [embed] });
        },
        async function (err) {
          console.error(err);
          await interaction.editReply("Player not found.");
        }
      );
    } else if (option === "Stats") {
      chessAPI.getPlayerStats(`${player}`).then(
        async function (response) {
          let playerAvatar;
          const playerStats = response.body;
          try {
            chessAPI.getPlayer(`${player}`).then(async function (response) {
              const playerInfo = response.body;
              try {
                playerAvatar = playerInfo.avatar.toString();
              } catch (err) {
                playerAvatar =
                  "https://www.chess.com/bundles/web/images/noavatar_l.84a92436.gif";
              }
            });
          } catch (err) {
            console.error(err);
          }
          try {
            const playerRapidScore =
              playerStats.chess_rapid.last.rating.toString();
            const playerRapidRecord =
              playerStats.chess_rapid.record.win.toString() +
              "/" +
              playerStats.chess_rapid.record.loss.toString() +
              "/" +
              playerStats.chess_rapid.record.draw.toString();

            const playerBlitzScore =
              playerStats.chess_blitz.last.rating.toString();
            const playerBlitzRecord =
              playerStats.chess_blitz.record.win.toString() +
              "/" +
              playerStats.chess_blitz.record.loss.toString() +
              "/" +
              playerStats.chess_blitz.record.draw.toString();

            const playerBulletScore =
              playerStats.chess_bullet.last.rating.toString();
            const playerBulletRecord =
              playerStats.chess_bullet.record.win.toString() +
              "/" +
              playerStats.chess_bullet.record.loss.toString() +
              "/" +
              playerStats.chess_bullet.record.draw.toString();
            const embed = new EmbedBuilder()
              .setTitle(player + "'s Chess.com Stats")
              .setURL("https://www.chess.com/member/" + player)
              .setColor("#77b300")
              .setDescription("Presented as 'Score' (Wins/Losses/Draws)")
              .setThumbnail(playerAvatar)
              .setFooter({
                text: "Data from Chess.com",
                iconURL:
                  "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fslack-files2.s3-us-west-2.amazonaws.com%2Favatars%2F2018-01-13%2F298422983363_10ccb3eb4c43017cd041_512.png&f=1&nofb=1&ipt=6d9b0f389261664f64436fe4b4f9e554d8e8f12e2ef43396915025f08e1d9a52&ipo=images",
              })
              .setTimestamp()
              .setThumbnail(playerAvatar)
              .addFields(
                {
                  name: "Rapid",
                  value: playerRapidScore + " (" + playerRapidRecord + ")",
                },
                {
                  name: "Blitz",
                  value: playerBlitzScore + " (" + playerBlitzRecord + ")",
                },
                {
                  name: "Bullet",
                  value: playerBulletScore + " (" + playerBulletRecord + ")",
                }
              );

            await interaction.editReply({ embeds: [embed] });
          } catch (error) {
            console.log(error);
            await interaction.editReply(
              "Player has insufficient data (or not found)."
            );
          }
        },
        function (err) {
          console.error(err);
        }
      );
    }
  },
};

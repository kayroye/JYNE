const { SlashCommandBuilder, EmbedBuilder, quote } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("crypto")
    .setDescription(
      "Get the current price of a cryptocurrency"
    )
    .addStringOption((option) =>
      option
        .setName("identifier")
        .setDescription(
          "The way you would like to search for a cryptocurrency."
        )
        .setRequired(true)
        .addChoices( { name: "Ticker/Symbol", value: "ticker" }, { name: "Name", value: "name"})
    )
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The cryptocurrency you would like to search for.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const message = await interaction.deferReply();
    let query = interaction.options.getString("query");
    console.log(query);
    // Get the current cryptocurrency map
    let response = null;
    new Promise(async (resolve, reject) => {
      try {
        response = await axios.get(
          "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map",
          {
            headers: {
              "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
            },
            params: {
              limit: 5000,
            },
          }
        );
      } catch (ex) {
        response = null;
        // error
        console.log(ex);
        reject(ex);
      }
      if (response) {
        // success
        const mapResponse = response.data;
        resolve(mapResponse);
        const identifier = interaction.options.getString("identifier");
        if (identifier === "ticker") {
          query = query.toUpperCase();
          for (let i = 0; i < 1000; i++) {
            if (mapResponse["data"][i]["symbol"] === query) {
              console.log(mapResponse["data"][i]["id"]);
              let id = mapResponse["data"][i]["id"];
              let response2 = null;
              new Promise(async (resolve, reject) => {
                try {
                  response2 = await axios.get(
                    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
                    {
                      headers: {
                        "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
                      },
                      params: {
                        id: id,
                      },
                    }
                  );
                } catch (ex) {
                  priceResponse = null;
                  // error
                  console.log(ex);
                  reject(ex);
                }
                if (response2) {
                  // success
                  const priceResponse = response2.data;
                  resolve(priceResponse);
                  let price =
                    priceResponse["data"][id]["quote"]["USD"]["price"];
                  let marketCap =
                    priceResponse["data"][id]["quote"]["USD"]["market_cap"];
                  let volume =
                    priceResponse["data"][id]["quote"]["USD"]["volume_24h"];
                  let percentChange =
                    priceResponse["data"][id]["quote"]["USD"][
                      "percent_change_24h"
                    ];

                  // make price a string with commas and cut it off after 2 decimals
                  price = price.toFixed(2);
                  price = price
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  // make market cap a string with commas and cut it off after 2 decimals
                  marketCap = marketCap.toFixed(2);
                  marketCap = marketCap
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  // make volume a string with commas and cut it off after 2 decimals
                  volume = volume.toFixed(2);
                  volume = volume
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  // make percent change a string with decimals
                  percentChange = percentChange.toFixed(2);
                  color = 0x00ae86;
                  if (percentChange < 0) {
                    color = 0xff0000;
                  }

                  // create embed with price and coin info
                  const embed = new EmbedBuilder()
                    .setTitle(priceResponse["data"][id]["name"] + " Stats")
                    .setDescription(
                      "Symbol: " + priceResponse["data"][id]["symbol"]
                    )
                    .addFields(
                      {
                        name: "Price",
                        value: "$" + price + " USD",
                      },
                      {
                        name: "Market Cap",
                        value: marketCap,
                      },
                      {
                        name: "Volume",
                        value: volume,
                      },
                      {
                        name: "Percent Change 24h",
                        value: percentChange + "%",
                      }
                    )
                    .setColor(color)
                    .setThumbnail("https://cdn.discordapp.com/attachments/1051228955425914933/1057888695992205462/cryptoIMG.png")
                    .setTimestamp();
                  interaction.editReply({ embeds: [embed] });
                }
              });
              break;
            } else if (i === 999){
              console.log(query + " not found");
              await interaction.editReply("Coin not found. Check for spelling mistakes and try again.");
            } else {
              continue;
            }
          }
        } else if (identifier === "name") {
          for (let i = 0; i < 1000; i++) {
            if (mapResponse["data"][i]["slug"] === query) {
              console.log(mapResponse["data"][i]["id"]);
              let id = mapResponse["data"][i]["id"];
              let response2 = null;
              new Promise(async (resolve, reject) => {
                try {
                  response2 = await axios.get(
                    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
                    {
                      headers: {
                        "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
                      },
                      params: {
                        id: id,
                      },
                    }
                  );
                } catch (ex) {
                  priceResponse = null;
                  // error
                  console.log(ex);
                  reject(ex);
                }
                if (response2) {
                  // success
                  const priceResponse = response2.data;
                  resolve(priceResponse);
                  let price =
                    priceResponse["data"][id]["quote"]["USD"]["price"];
                  let marketCap =
                    priceResponse["data"][id]["quote"]["USD"]["market_cap"];
                  let volume =
                    priceResponse["data"][id]["quote"]["USD"]["volume_24h"];
                  let percentChange =
                    priceResponse["data"][id]["quote"]["USD"][
                      "percent_change_24h"
                    ];

                  // make price a string with commas and cut it off after 2 decimals
                  price = price.toFixed(2);
                  price = price
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  // make market cap a string with commas and cut it off after 2 decimals
                  marketCap = marketCap.toFixed(2);
                  marketCap = marketCap
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  // make volume a string with commas and cut it off after 2 decimals
                  volume = volume.toFixed(2);
                  volume = volume
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  // make percent change a string with decimals
                  percentChange = percentChange.toFixed(2);
                  color = 0x00ae86;
                  if (percentChange < 0) {
                    color = 0xff0000;
                  }

                  // create embed with price and coin info
                  const embed = new EmbedBuilder()
                    .setTitle(priceResponse["data"][id]["name"] + " Stats")
                    .setDescription(
                      "Symbol: " + priceResponse["data"][id]["symbol"]
                    )
                    .addFields(
                      {
                        name: "Price",
                        value: "$" + price + " USD",
                      },
                      {
                        name: "Market Cap",
                        value: marketCap,
                      },
                      {
                        name: "Volume",
                        value: volume,
                      },
                      {
                        name: "Percent Change 24h",
                        value: percentChange + "%",
                      }
                    )
                    .setColor(color)
                    .setThumbnail("https://cdn.discordapp.com/attachments/1051228955425914933/1057888695992205462/cryptoIMG.png")
                    .setTimestamp();
                  interaction.editReply({ embeds: [embed] });
                }
              });
              break;
            } else if (i === 999){
              console.log(query + " not found");
              await interaction.editReply("Coin not found. Check for spelling mistakes and try again.");
            } else {
              continue;
            }
          }
        } else {
          interaction.editReply("Invalid identifier");
        }
      }
    });
  },
};

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  AttachmentBuilder,
} = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const DiscordUser = require("../../events/schemas/discordUser.js");
const { createUser } = require("../../newUser.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dream")
    .setDescription("Turns your text into an image.")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text to turn into an image.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription("The model to use.")
        .setRequired(true)
        .addChoices(
          {
            name: "New (Best)",
            value: "Main",
          },
          {
            name: "People/Animals",
            value: "realisticVisionV13_v13VAEIncluded.ckpt",
          },
          {
            name: "Old (SD V1.5)",
            value: "v1-5-pruned.ckpt",
          },
          {
            name: "Fantasy/RPG",
            value: "Fantasy/RPG",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("dimensions")
        .setDescription("The dimensions of the image.")
        .setRequired(true)
        .addChoices(
          {
            name: "1:1",
            value: "1:1",
          },
          {
            name: "2:3",
            value: "2:3",
          },
          {
            name: "3:2",
            value: "3:2",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("negative_prompt")
        .setDescription(
          "Words to tell the AI to avoid when generating your image."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("sampler")
        .setDescription("The sampler to use.")
        .setRequired(false)
        .addChoices(
          {
            name: "DPM Solver",
            value: "dpm_solver_stability",
          },
          {
            name: "DPM++ 2M",
            value: "dpmpp_2m",
          },
          {
            name: "LMS",
            value: "lms",
          },
          {
            name: "Euler Ancestral (Default)",
            value: "euler_a",
          }
        )
    )
    .addBooleanOption((option) =>
      option
        .setName("face_correction")
        .setDescription("Whether to use face correction.")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("seed")
        .setDescription("The seed to use.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("upscaler")
        .setDescription("Whether to upscale the image.")
        .setRequired(false)
        .addChoices(
          {
            name: "Regular",
            value: "RealESRGAN_x4plus",
          },
          {
            name: "Anime",
            value: "RealESRGAN_x4plus_anime_6B",
          }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("steps")
        .setDescription(
          "The amount of times you want the AI to modify the image (recommended 20-30)."
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    const text = interaction.options.getString("text");
    const url = `http://localhost:9090/render`;
    const sessionId = Math.floor(Math.random() * 10000000000000);
    let seed = Math.floor(Math.random() * 100000000);
    const model = interaction.options.getString("model");
    const dimensions = interaction.options.getString("dimensions");

    if (interaction.options.getInteger("seed") !== null) {
      seed = interaction.options.getInteger("seed");
    }

    let user = await DiscordUser.findOne({
      userId: interaction.user.id,
    }).populate("settings");
    if (!user) {
      await createUser(interaction.user.id, interaction.user.username);
      user = await DiscordUser.findOne({
        userId: interaction.user.id,
      }).populate("settings");
    }

    if (user.strikes === 2) {
      const embed = new EmbedBuilder()
        .setTitle("You do not have access to this command.")
        .setDescription(
          "I recommend some serious self-reflection for attempting to generate illegal content twice."
        )
        .setColor(0xff0000);
      return await interaction.reply({ embeds: [embed] });
    }

    //CP Check
    if (
      text.includes("child") ||
      text.includes("little boy") ||
      text.includes("little girl") ||
      text.includes("kid") ||
      text.includes("baby") ||
      text.includes("infant") ||
      text.includes("toddler") ||
      text.includes("children") ||
      text.includes("kids") ||
      text.includes("babies") ||
      text.includes("infants") ||
      text.includes("toddlers")
    ) {
      if (
        text.includes("porn") ||
        text.includes("penis") ||
        text.includes("vagina") ||
        text.includes("genitals") ||
        text.includes("genital") ||
        text.includes("balls") ||
        text.includes("pussy") ||
        text.includes("ass") ||
        text.includes("butt") ||
        text.includes("buttocks") ||
        text.includes("butthole") ||
        text.includes("asshole") ||
        text.includes("fucking") ||
        text.includes("sex") ||
        text.includes("sexing") ||
        text.includes("cock")
      ) {
        if (user.strikes === undefined) {
          const embed = new EmbedBuilder()
            .setTitle("Restricted Prompt")
            .setDescription(
              "The generating of this content is **strictly prohibited**. You have been issued a warning, and upon your second warning, usage of this command will no longer be available to you."
            )
            .setColor(0xff0000);

          user.strikes = 1;
          await user.save();
          return await interaction.reply({ embeds: [embed] });
        } else if (user.strikes === 1) {
          const embed = new EmbedBuilder()
            .setTitle("You no longer have access to this command.")
            .setDescription(
              "I recommend some serious self-reflection for attempting to generate this content twice."
            )
            .setColor(0xff0000);

          user.strikes = 2;
          await user.save();
          return await interaction.reply({ embeds: [embed] });
        }
      } else {
        return await interaction.reply(
          "I'm not a psychic, you know. You need to be more specific."
        );
      }
    }

    let userName = interaction.guild.members.cache.get(
      interaction.user.id
    ).displayName;
    if (
      user.settings.prefix !== "" &&
      user.settings.prefix !== undefined &&
      user.settings.prefix !== "undefined"
    ) {
      userName = user.settings.prefix + " " + interaction.user.username;
    }

    let description = `Your dream: **${text}** (waiting)\n**Seed:** ${seed}`;
    let edited = false;

    const embed = new EmbedBuilder()
      .setTitle(`Building a Dream for ${userName}`)
      .setDescription(description)
      .setThumbnail(
        "https://media.discordapp.net/attachments/1051228955425914933/1071484622325682206/dream-img--1.gif?width=676&height=676"
      )
      .setColor(0x00deff)
      .setFooter({ text: "Powered by Stable Diffusion" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    async function getImage(prompt, sessionId) {
      // find a file that starts with the text
      const files = fs.readdirSync(
        `../../assets/renderedImages/${sessionId}`
      );
      // replace spaces with underscores
      prompt = prompt.replace(/ /g, "_");
      // remove any non-alphanumeric characters
      prompt = prompt.replace(/[^a-zA-Z0-9]/g, "_");
      if (prompt.length > 50) {
        prompt = prompt.substring(0, 40);
        // remove the last word
        prompt = prompt.substring(0, prompt.lastIndexOf("_"));
      }

      const file = files.find((file) => file.endsWith(".jpeg"));
      if (file) {
        const attachment = new AttachmentBuilder(
          `src/assets/renderedImages/${sessionId}/${file}`
        );

        user.aiGenerations.push({
          prompt: text,
          seed: seed,
          pathToImage: `src/assets/renderedImages/${sessionId}/${file}`,
          fileName: file,
          dateCreated: Date.now(),
        });

        await user.save();

        embedSetDescription(
          `Imagined your dream: **${text}**\n**Seed:** ${seed}`
        );

        embed
          .setTitle(`Dream for ${userName}`)
          .setDescription(description)
          .setThumbnail(
            "https://media.discordapp.net/attachments/1051228955425914933/1071485063721664542/dream-img-done.gif?width=676&height=676"
          )
          .setImage(`attachment://${file}`);

        return await interaction.editReply({
          embeds: [embed],
          files: [attachment],
        });
      }
      return null;
    }

    function embedSetDescription(ogDescription) {
      description = ogDescription;

      if (model === "v1-5-pruned.ckpt") {
        description += `\n**Model:** New (SD v1.5)`;
      } else if (model === "realisticVisionV13_v13VAEIncluded.ckpt") {
        description += `\n**Model:** Realistic Vision (SD v1.5)`;
      } else if (model === "Main") {
        description += `\n**Model:** Main (SD v1.5 Enhanced)`;
      } else if (model === "Fantasy/RPG") {
        description += `\n**Model:** DreamShaper (Fantasy)`;
      }

      if (interaction.options.getString("sampler") !== null) {
        description += `\n**Sampler:** ${interaction.options.getString(
          "sampler"
        )}`;
      }
      if (interaction.options.getBoolean("face_correction") !== null) {
        description += `\n**Face Correction:** ${interaction.options.getBoolean(
          "face_correction"
        )}`;
      }
      if (interaction.options.getString("upscaler") !== null) {
        description += `\n**Upscaling:** ${interaction.options.getString(
          "upscaler"
        )}`;
      }
      if (interaction.options.getString("negative_prompt") !== null) {
        if (interaction.options.getString("negative_prompt").length > 100) {
          // trim to 100 characters and remove the last word
          description += `\n**Negative Prompt:** ${interaction.options
            .getString("negative_prompt")
            .substring(0, 100)
            .substring(
              0,
              interaction.options.getString("negative_prompt").lastIndexOf(" ")
            )}...`;
        } else {
          description += `\n**Negative Prompt:** ${interaction.options.getString(
            "negative_prompt"
          )}`;
        }
      }
    }

    function embedSetColor() {
      colors = [0xf01212, 0x571ce3, 0xe9dc36, 0x3f78e8];
      embed.setColor(colors[Math.floor(Math.random() * colors.length)]);
    }

    let steps = 25;

    // set the dimensions
    let width;
    let height;

    if (dimensions === "1:1") {
      width = 512;
      height = 512;
    } else if (dimensions === "3:2") {
      width = 512;
      height = 448;
    } else if (dimensions === "2:3") {
      width = 448;
      height = 512;
    }
    // post a /render request to the server
    const request = {
      session_id: sessionId,
      prompt: text,
      sampler_name: "euler_a",
      num_inference_steps: steps,
      use_vae_model: "None",
      show_only_filtered_image: true,
      seed: seed,
      save_to_disk_path: "../../assets/renderedImages",
      guidance_scale: 8.0,
      height: height,
      width: width,
    };

    if (model === "v1-5-pruned.ckpt") {
      request.use_stable_diffusion_model =
        "path-to-stable-diffusion-ui/models/stable-diffusion/v1-5-pruned";
      steps = 25;
      request.num_inference_steps = steps;
    } else if (model === "realisticVisionV13_v13VAEIncluded.ckpt") {
      request.use_stable_diffusion_model =
        "path-to-stable-diffusion-ui/models/stable-diffusion/realisticVisionV13_v13VAEIncluded";
      steps = 25;
      request.num_inference_steps = steps;
    } else if (model === "Main") {
      request.use_stable_diffusion_model =
        "path-to-stable-diffusion-ui/models/stable-diffusion/mdjrny-v4";
      steps = 25;
      request.guidance_scale = 6.5;
      request.prompt = "mdjrny-v4 style " + text;
    } else if (model === "Fantasy/RPG") {
      request.use_stable_diffusion_model =
        "path-to-stable-diffusion-ui/models/stable-diffusion/dreamshaper_332BakedVaeClipFix";
      steps = 25;
    }

    if (interaction.options.getString("sampler") !== null) {
      request.sampler_name = interaction.options.getString("sampler");
      description +=
        "\n**Sampler:** " + interaction.options.getString("sampler");
      if (interaction.options.getString("sampler") === "lms") {
        request.num_inference_steps = 30;
        steps = 30;
      }
    }

    if (interaction.options.getBoolean("face_correction") !== null) {
      if (interaction.options.getBoolean("face_correction") === true) {
        request.use_face_correction = "GFPGANv1.3";
        edited = true;
      }
    }

    if (interaction.options.getInteger("seed") !== null) {
      request.seed = interaction.options.getInteger("seed");
    }

    if (interaction.options.getString("upscaler") !== null) {
      request.use_upscale = interaction.options.getString("upscaler");
      edited = true;
    }

    if (interaction.options.getString("negative_prompt") !== null) {
      request.negative_prompt =
        interaction.options.getString("negative_prompt");
      edited = true;
    } else {
      request.negative_prompt =
        "duplicate, blurry, out of focus, cropped, weird hands, too many fingers, dismembered, ugly, disproportionate, artifacts, not enough fingers, overexposure, long neck, weird fingers";
    }

    if (interaction.options.getInteger("steps") !== null) {
      request.num_inference_steps = interaction.options.getInteger("steps");
      steps = interaction.options.getInteger("steps");
    }

    const response = await axios.post(url, request);
    const streamUrl = `http://localhost:9090${response.data.stream}`;
    console.log(streamUrl);
    let streamResponse;
    let rendered = false;
    while (!rendered) {
      try {
        streamResponse = await axios.get(streamUrl);
      } catch (error) {
        embedSetDescription(
          `Your dream: **${text}** (in queue)\n**Seed:** ${seed}`
        );
        embed.setDescription(description);
        embedSetColor();
        await interaction.editReply({ embeds: [embed] });
        await new Promise((resolve) => setTimeout(resolve, 10000));
        continue;
      }

      let status;
      try {
        status = streamResponse.data.status;
        if (status === "succeeded") {
          if (edited === true) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
          const success = getImage(text, sessionId);
          await interaction.followUp(
            `<@${interaction.user.id}> Your dream is ready!`
          );
          if (!success) {
            await interaction.editReply("Something went wrong.");
          }
          rendered = true;
        } else {
          // get the percent progress
          let progress = streamResponse.data.step;
          if (progress) {
            progress = Math.round((progress / steps) * 100);
            embedSetDescription(
              `Your dream: **${text}** (${progress}% done)\n**Seed:** ${seed}`
            );
            embed.setDescription(description);
            embedSetColor();
            await interaction.editReply({ embeds: [embed] });
          } else {
            // wait a second and try again
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
        }
      } catch (error) {
        console.log(error);
        await interaction.editReply("Something went wrong.");
        rendered = true;
      }
    }
  },
};

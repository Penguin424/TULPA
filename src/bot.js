const fs = require("fs");
const Discord = require("discord.js");
const Bot = require("./client/Client.js");
const { token, prefix } = require("./config.json");
const { join } = require("path");

const bot = new Bot();
bot.commads = new Discord.Collection();

const commadsFiles = fs
  .readdirSync(join(__dirname, "/commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commadsFiles) {
  const commad = require(join(__dirname, "/commands", "/", file));
  bot.commads.set(commad.name, commad);
}

bot.once("ready", () => {
  console.log("Ready!");
});

bot.once("reconnecting", () => {
  console.log("Reconnecting!");
});

bot.once("disconnect", () => {
  console.log("Disconnect!");
});

bot.on("message", async (msg) => {
  const args = msg.content.slice(prefix.length).split(/ +/);
  const commadName = args.shift().toLowerCase();
  const command = bot.commads.get(commadName);

  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;

  try {
    if (command !== undefined) {
      command.execute(msg);
    } else {
      msg.reply("El comando que quisiste ejecutar a un no esta programado");
    }
  } catch (error) {
    console.error(error);
    msg.reply("Hubo un error al ejecutar el comando");
  }
});

bot.login(token);

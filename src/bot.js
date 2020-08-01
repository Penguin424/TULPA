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

console.log(bot.commads);

bot.once("ready", () => {
  console.log("Ready!");
});

bot.once("reconnecting", () => {
  console.log("Reconnecting!");
});

bot.once("disconnect", () => {
  console.log("Disconnect!");
});

bot.login(token);

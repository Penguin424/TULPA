const { config } = require('dotenv');
config();

const { Client } = require('discord.js');
const { prefix } = require('./config.json');

const bot = new Client();

bot.on('ready', () => {
  console.log('Bot on ready');
});

bot.on('message', async (message) => {
  if (message.content.startsWith(`${prefix}ping`)) {
    // message.channel.send('pong');
    message.reply('pong!');
    console.log(message.guild);
  }

  if (message.content.startsWith(`${prefix}kick`)) {
    const member = message.mentions.members.first();

    if (member) {
      const kikmember = await member.kick();

      console.log(kikmember.user.username);
      message.channel.send(
        `Ha ${kikmember.user.username} le gusta la verga por eso a sido expulsado`
      );
    }
  }
});

bot.login(process.env.DISCORD_TOKEN);
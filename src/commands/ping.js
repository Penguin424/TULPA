module.exports = {
  name: "ping",
  description: "Contesta Pong! al usuario que lo ejecute",
  execute(message) {
    console.log(message.content);
    message.reply("Pong!");
  },
};

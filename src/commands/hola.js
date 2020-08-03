module.exports = {
  name: "hola",
  description: "Contesta Mundo al usuario que lo ejecute",
  execute(message) {
    console.log(message.content);
    message.reply("Mundo");
  },
};

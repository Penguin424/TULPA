const ytdl = require("ytdl-core");

module.exports = {
  name: "play",
  description: "Reproduce una cancion",
  async execute(msg) {
    try {
      const args = msg.content.split(" ");
      const queue = msg.client.queue;
      const serverQueue = msg.client.queue.get(msg.guild.id);
      const voiceChannel = msg.member.voice.channel;
      const permissions = voiceChannel.permissionsFor(msg.client.user);
      const songInfo = await ytdl.getInfo(args[1]);
      const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
      };

      if (!voiceChannel) {
        return msg.channel.send(
          "Necesitas estar en un canal de voz para que pueda reproducir musica"
        );
      }

      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return msg.channel.send("Necesito permisos para conectarme y hablar en tu canal de voz");
      }

      if (!serverQueue) {
        const queueContruct = {
          textChannel: msg.channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 5,
          playing: true,
        };

        queue.set(msg.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
          var connection = await voiceChannel.join();
          queueContruct.connection = connection;
          this.play(msg, queueContruct.songs[0]);
        } catch (err) {
          console.log(err);
          queue.delete(msg.guild.id);
          return msg.channel.send(err);
        }
      } else {
        serverQueue.songs.push(song);
        return msg.channel.send(`${song.title} fue agregada a la cola!`);
      }

      console.log(args);
      console.log(queue);
      console.log(serverQueue);
    } catch (error) {
      console.log(error);
      message.channel.send(error.message);
    }
  },
  play(message, song) {
    const queue = message.client.queue;
    const guild = message.guild;
    const serverQueue = queue.get(message.guild.id);

    console.log(serverQueue);

    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }

    console.log(song.url);

    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        this.play(message, serverQueue.songs[0]);
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Emepezo a reproducirse: **${song.title}**`);
  },
};

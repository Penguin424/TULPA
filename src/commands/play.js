const ytdl = require("ytdl-core");
const ytsr = require("ytsr");

module.exports = {
  name: "play",
  description: "Reproduce una cancion",
  async execute(msg) {
    try {
      const args = msg.content.split(" ").slice(1).join(" ");
      let songInfo;
      let song;

      if (args.startsWith("https://")) {
        songInfo = await ytdl.getInfo(args);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
        };
      } else {
        let cancion = await msg.content.split(" ").slice(1).join(" ");

        let resultados = await ytsr.getFilters(cancion);

        let filter = await resultados.get("Type").find((v) => v.name === "Video");

        let videos = await ytsr(filter.ref, { limit: 5, nextpageRef: filter.ref });
        let linksVideos = videos.items.map((l) => l.link);

        let formatoPrint = await videos.items
          .map((item, index) => {
            return `${index} - ${item.title}`;
          })
          .join("\n");

        msg.reply(`\nEscoje tu cancion\n${formatoPrint}`);

        let data = await msg.channel.awaitMessages((a) => a.content, { max: 2, time: 60000 });

        let link = linksVideos[data.array()[1].content];

        songInfo = await ytdl.getInfo(link);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
        };
      }

      const queue = msg.client.queue;
      const serverQueue = msg.client.queue.get(msg.guild.id);
      const voiceChannel = msg.member.voice.channel;
      const permissions = voiceChannel.permissionsFor(msg.client.user);
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

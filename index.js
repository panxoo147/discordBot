// Watch my Discord Bot Project Tutorial video here: https://youtu.be/pDQAn18-2go - Discord Bot Tutorial | JavaScript & Node.js

require('dotenv').config();

const axios = require('axios');
const { Client, GatewayIntentBits, Guild, MessageMentions: { USERS_PATTERN } } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus, generateDependencyReport } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const fs = require("fs");
const path = require('path');
const ffmpeg = require('ffmpeg-static');
const { Readable, PassThrough } = require('stream');
const sodium = require('libsodium-wrappers');
const client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]
});
const logStream = fs.createWriteStream('log.txt', { flags: 'a' });
client.on('ready', () => {
    console.log('bot is ready');
})
const mutedUsers = new Set();
let connection;
const queue = new Map(); // Store queue for each guild

client.on('messageCreate', async (message) => {
    if (message.author.id !== "346988582793117697" && mutedUsers.has(message.author.id) ) {
      await message.delete();
      return;
    }
    if (message.content.startsWith('/mts')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        const mention_user = message.mentions.users.first();
        if (!mention_user) {
            message.channel.send(` not found mention member`)
            message.delete()
            return;
        }
        const user = message.guild.members.cache.get(mention_user.id);
        user.voice.setMute(false);
        user.voice.setDeaf(true);
        console.log(JSON.stringify(message.author))
        console.log(message.channel.messages)

        // message.channel.send(`${message.author} request payload : ${message.content}` )
        message.delete()
    }
    else if (message.content.startsWith('/umt')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        const mention_user = message.mentions.users.first();
        if (!mention_user) {
            message.channel.send(` not found mention member`)
            message.delete()
            return;
        }
        const user = message.guild.members.cache.get(mention_user.id);
        // user.voice.setMute(false);
        // user.voice.setDeaf(false);
        // console.log(JSON.stringify(user.messages))
        message.delete()
    }
    else if (message.content.startsWith('/apl')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        const url = message.content.split(' ')[1];
        ytdl.getInfo(url).then(_ => console.log(_))
    }
    else if (message.content.startsWith('/pst')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        const url = message.content.split(' ')[1];
        if (ytdl.validateURL(url)) {
            const serverQueue = queue.get(message.guild.id) || { songs: [], connection: null, player: null };

            serverQueue.songs.push(url);

            if (!serverQueue.connection) {
                const connection = joinVoiceChannel({
                    channelId: message.member.voice.channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                try {
                    await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
                    console.log('Voice connection is ready');
                } catch (error) {
                    console.error('Error establishing voice connection:', error);
                    return message.reply('Failed to join voice channel in time.');
                }

                serverQueue.connection = connection;
                queue.set(message.guild.id, serverQueue);

                playNext(message.guild.id);
            } else {
                message.channel.send('Added to queue.');
            }
        } else {
            message.channel.send('Please provide a valid YouTube URL.');
        }
        message.delete();
    }
    else if (message.content.startsWith('/stpb')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        const serverQueue = queue.get(message.guild.id);
        if (serverQueue && serverQueue.connection) {
            serverQueue.connection.destroy();
            message.reply('Stop player');
        }
        message.delete();
    }
    if (message.content.startsWith('!queue')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        const serverQueue = queue.get(message.guild.id);
        if (serverQueue && serverQueue.songs.length > 0) {
            message.reply(`Current queue: \n${serverQueue.songs.join('\n')}`);
        } else {
            message.reply('The queue is currently empty.');
        }
    }

    if (message.content.startsWith('!skip')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        const serverQueue = queue.get(message.guild.id);
        if (serverQueue && serverQueue.connection) {
            serverQueue.player.stop();
            message.reply('Skipped to the next track.');
        } else {
            message.reply('There is nothing to skip.');
        }
    }

    if (message.content.startsWith('!clear')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        queue.delete(message.guild.id);
        message.reply('Queue cleared.');
    }
    if (message.content.startsWith('!Ja')) {
        const mention_user = message.mentions.users.first();
        const guild = message.guild;
        const member = guild.members.cache.get(mention_user.id);
        const voiceChannel = member.voice.channel;
        console.log(voiceChannel)
        // '757261945073303685'
        connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
            console.log('Voice connection is ready');
        } catch (error) {
            console.error('Error establishing voice connection:', error);
            return message.reply('Failed to join voice channel in time.');
        }
        playSoundPad('soundpad/JDANG.mp3')
        message.delete();
    }

    if (message.content.startsWith('!setmute')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        const mentionedUser = message.mentions.users.first();

        if (!mentionedUser) {
            // return message.reply('Please mention a user to mute.');
        }

        const guild = message.guild;
        const member = guild.members.cache.get(mentionedUser.id);

        if (!member) {
            return message.send('User not found in this guild.');
        }

        await member.voice.setMute(true);
        mutedUsers.add(member.id);
        message.channel.send(`${mentionedUser} หุบปาก ! ! !`);

        // Function to continuously check if the user unmutes themselves
        const checkUnmute = async () => {
            if (!mutedUsers.has(member.id)) return;

            if (!member.voice.channel) {
                setTimeout(checkUnmute, 1000);
                return; // If the user is not in a voice channel, check again later
            }

            if (!member.voice.serverMute) {
                message.channel.send(`${mentionedUser} เห้ยน้องทำไร`);
                await member.voice.setMute(true);
            }

            setTimeout(checkUnmute, 1000);
        };

        checkUnmute();
    }
    if (message.content.startsWith('!unmute')) {
        if (message.author.id !== "346988582793117697") {
            message.reply('Bot ของ PANPAN เพื่อ PANPAN เท่านั้น UwU')
            return;
        }
        const mentionedUser = message.mentions.users.first();

        if (!mentionedUser) {
            return message.reply('Please mention a user to unmute.');
        }

        const guild = message.guild;
        const member = guild.members.cache.get(mentionedUser.id);
        if (!member.voice.channel) {
            console.log('user not in voice server')
            return;
        }
        if (!member) {
            return message.channel.send('User not found in this guild.');
        }

        await member.voice.setMute(false);
        mutedUsers.delete(member.id);
        message.channel.send(`${mentionedUser} ลูกพี่กูให้โอกาศมึงนะรอบนี้`);
    }
    if(message.content.startsWith('!rmmsg')) {
        message.channel.messages.fetch({
            limit: 100 // Change `100` to however many messages you want to fetch
        }).then((messages) => { 
            const botMessages = [];
            messages.filter(m => m.author.id === "380406430852841482").forEach(msg => botMessages.push(msg))
            message.channel.bulkDelete(botMessages).then(() => {
                message.channel.send("Cleared bot messages").then(msg => msg.delete({
                    timeout: 300
                }))
            });
        })
        message.delete();
    }

})
const playSoundPad = async (url) => {
    const resource = createAudioResource(url);
    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!');
    });

    player.on(AudioPlayerStatus.Idle, () => {
        console.log('The audio player is idle, playing next track...');
        connection.destroy()
    });

    player.on('error', error => {
        console.error('Error playing audio:', error);
    });
}
const playNext = async (guildId) => {
    const serverQueue = queue.get(guildId);
    if (!serverQueue || !serverQueue.songs.length) {
        if (serverQueue && serverQueue.connection) serverQueue.connection.destroy();
        queue.delete(guildId);
        return;
    }

    const url = serverQueue.songs.shift();
    const filePath = path.resolve(__dirname, 'audio.mp3');

    const stream = ytdl(url, { filter: 'audioonly' });
    const fileStream = fs.createWriteStream(filePath);

    stream.pipe(fileStream);

    fileStream.on('finish', () => {
        console.log('Download complete');

        const resource = createAudioResource(filePath);
        const player = createAudioPlayer();

        player.play(resource);
        serverQueue.connection.subscribe(player);
        serverQueue.player = player;

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('The audio player has started playing!');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('The audio player is idle, playing next track...');
            fs.unlink(filePath, err => {
                if (err) console.error('Error deleting file:', err);
                else console.log('File deleted');
            });
            playNext(guildId);
        });

        player.on('error', error => {
            console.error('Error playing audio:', error);
            serverQueue.connection.destroy();
            queue.delete(guildId);
        });
    });

    fileStream.on('error', err => {
        console.error('Error downloading file:', err);
        queue.delete(guildId);
    });
};

console.log = function (message) {
    logStream.write(new Date().toISOString() + ' - ' + JSON.stringify(message) + '\n');
    process.stdout.write(new Date().toISOString() + ' - ' + JSON.stringify(message) + '\n'); // Also print to the console
};
client.login(process.env.DISCORD_BOT_ID);

// let msgId = ["1266286649252253707","1266284400233025536","1266283188343537706","1266283176334983232","1266281490912641148","1266281446595624960","1266281376546816151","1266281273358290964","1266281249308147804","1266281181994029100","1266281177220780124","1266280976288321646","1266280899880812634","1266280819832651818","1266280670943117403","1266280700701577278","1266280668581597215","1266280699044827288","1266280666572783617","1266280697199595592","1266280665293389884","1266280695546777692","1266280663334522902","1266280693919387730","1266280662042935317","1266280673061109832","1266280641289261209","1266280640026906697","1266280638101590187","1266280636038123621","1266280634003751045","1266280632431149128","1266280630556168223","1266280610327040051","1266280608552845383","1266280606442979388","1266280603997700117","1266280601174937621","1266280599207936131","1266280596787822613","1266280594602463234","1266280573916414057","1266280571731181642","1266280570019774534","1266280568199446602","1266280566563536916","1266280564965507092","1266280562608439298","1266280541607690336","1266280539489435681","1266280537736085598","1266280535974740029","1266280534179450961","1266280532489142334","1266280530496720918","1266280510875893802","1266280508996845608","1266280506622873601","1266280504588636332","1266280503091138610","1266280501124006011","1266280498871668747","1266280478248407080","1266280476604239883","1266280422585929740","1266280336678195211","1266280326259277994","1266280313156538429","1266280283154415708","1266280276024365109","1266280278159003762","1266280256457674773","1266280254775754804","1266280252297183324","1266280250040651868","1266280248417189969","1266280242214080543","1266097904347648090","1266097103957131416","1266096918451458100","1266096915397869631","1266096835756560394","1266090198899359856","1266089337083400335","1266072621276205127","1266040379883388940","1266023759697936529","1266023734960066686","1265976182600630333","1265967571627278380","1265964152162353166","1265931264397938755","1265930698104246425","1265930677149237279","1265930663367020655","1265930414053134418","1265930311665979392","1265920010774253599","1265919812580671540","1265919705449893911","1266287273939308576"]

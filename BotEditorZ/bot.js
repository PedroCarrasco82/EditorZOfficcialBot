const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config/config.json');
const botController = require('./controller/botController');

function updatedState(){
    client.user.setActivity({
        name: `Official bot EditorZ`
    });
}

client.on("ready", ()=>botController.botReady(client));

client.on("guildCreate", (guild)=>botController.guildCreate(client, guild));

client.on("guildDelete", (guild)=>botController.guildDelete(client, guild));

client.on("message", (message)=>botController.messageController(client, message));

client.login(config.token);

const commands = require('../Commands/botCommands');
const config = require('../config.json');
const roleManager = require('../Utils/roleManager');

const botController = {
    async messageController(client, message){
        if(message.author.bot) { return; }
    
        const customMessage = message.content === "Quem é a mais gatona?" ? "customMessage" : null;
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const comando = args.shift().toLowerCase();

        const commandExecute = {...commands};
        const userLanguage = await roleManager.getUserLanguage(message.author, client);
        
        if(userLanguage){
            commandExecute.language = userLanguage.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        }
        
        commandExecute.client = client;

        if(commandExecute[customMessage || comando]){
            await commandExecute[customMessage || comando](message);
        }
    },

    async guildDelete(client, guild){
        console.log(`O bot foi removido do servidor: ${guild.name}`);
        updatedState(client);
    },

    async guildCreate(client, guild){
        console.log(`O bot entrou no servidor: ${guild.name} (id: ${guild.id}). População: ${guild.memberCount} membros!`);
        updatedState(client);
    },

    async botReady(client){
        console.log(`O bot foi iniciado, com ${ client.users.cache.size} usuários, em ${client.channels.cache.size} canais, em ${client.guilds.cache.size} ${client.guilds.cache.size > 1 ? "servidores" : "servidor"}.`);
        updatedState(client);
    }

};

function updatedState(client){
    client.user.setActivity({
        name: `Official bot EditorZ`
    });
}

module.exports = botController;
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const ytdl = require('ytdl-core');
const userSchema = require('./schemas/user.schema');

let usershasQuestion = [];

function updatedState(){
    client.user.setActivity({
        name: `Official bot EditorZ`
    });
}

client.on("ready", ()=>{
    console.log(`O bot foi iniciado, com ${ client.users.cache.size} usuários, em ${client.channels.cache.size} canais, em ${client.guilds.cache.size} ${client.guilds.cache.size > 1 ? "servidores" : "servidor"}.`);
    updatedState();
});

client.on("guildCreate", guild => {
    console.log(`O bot entrou no servidor: ${guild.name} (id: ${guild.id}). População: ${guild.memberCount} membros!`);
    
    updatedState();

    // client.channels.cache.forEach(channel => {
    //     if(channel.createdTimestamp === guild.createdTimestamp && channel.type === 'text')
    //         channel.send('Chegueeei')
    // })[=]
});

client.on("guildDelete", guild => {
    console.log(`O bot foi removido do servidor: ${guild.name}`);
    updatedState();
});

client.on("message", async message => {
    if(message.author.bot) { return; }
    
    const customMessage = message.content === "Quem é a mais gatona?" ? "customMessage" : null;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const comando = args.shift().toLowerCase();

    const userLanguage = catchUserLanguage(message.member);
    
    const commandExecute = {...commands};
    commandExecute.language = userLanguage.name;
    
    if(commandExecute[customMessage || comando]){
       await commandExecute[customMessage || comando](message);
    }
});

const commands = {
    language:'',

    async roles(message) {

        const roles = await getUserRoles(message.author);
    
        const rolesName = roles.map(e => e.name);
        
        const rolesText = rolesName.reduce((previousValue, currentValue, index, array) => {
    
            if(index === array.length - 1)
                return previousValue + "** e **" + currentValue;
            else{
                return previousValue+"**, **"+currentValue;
            }
    
        }).replace('@','');
        
        message.reply("Você tem o(s) cargo(s) **"+rolesText+ "**");
    },

    async customMessage(message) {
        message.reply("A aline, óbvio");
    },

    async help(message) {
        message.channel.send('')
    },

    async drive(message){
        const username = message.author.username;
        const discriminator = message.author.discriminator;

        const roles = await getUserRoles(message.author);

        const hasMandatoryRole = roles.find(e => e.name === 'Editing Sometimes');

        if(hasMandatoryRole){
            const dmMessage = client.users.cache.get(message.author.id);

            console.log(usershasQuestion)

            if(message.channel.type === 'dm'){
                if(!!!usershasQuestion.find( e => e === message.author.id)){
                    usershasQuestion.push(message.author.id);

                const filter = m => m.author.id === message.author.id;
                dmMessage.send('Olá, digite seu e-mail:');
                const email = await message.channel.awaitMessages(filter, {time: 100000, max: 1, errors: ['time','max']});
                dmMessage.send('Confirme seu e-mail.');
                const emailConfirm = await message.channel.awaitMessages(filter, {time: 100000, max: 1, errors: ['time','max']});
                
                if(email.first().content === emailConfirm.first().content){

                    dmMessage.send('Digite o nome do seu Woozen:');
                    const woozName = await message.channel.awaitMessages(filter, {time: 100000, max: 1, errors: ['time','max']});
                    dmMessage.send('Digite seu nome no instagram:');
                    const instagramName = await message.channel.awaitMessages(filter, {time: 100000, max: 1, errors: ['time','max']});
                    
                    dmMessage.send('Muito obrigado(a) pelas informações, aguarde o convite do drive no seu email!(Isso pode levar um tempinho)');
                    
                    const userProperties = userSchema.validate({
                        requestDate: message.createdAt,
                        discordUsername: username,
                        discordDiscriminator: discriminator,
                        woozName: woozName.first().content,
                        instagramName: instagramName.first().content,
                        email: email.first().content
                    });
                    
                    if(userProperties.error){
                        userProperties.error.details.forEach(detail => {
                            dmMessage.send(detail.message);
                        })
                    }

                }else {
                    dmMessage.send('Os email`s não coincidem, por favor, utilize o !drive para fazer o questionário novamente');
                }
                    usershasQuestion = usershasQuestion.filter(e => e !== message.author.id);
                    return;
                } 
            }else{

                message.reply('Olá, dê uma olhadinha na sua DM :wink:');
                dmMessage.send('Olá, tudo bem? Para acessar o drive, digite !drive aqui na DM.');
            }
            

        }else{
            const emoji = client.guilds.cache.find(e => e.name === 'PBE -  EditorZ').emojis.cache.find(e => e.name == 'EditorZ');
            
            message.channel.send('Olá '+message.author.toString()+', infelizmente você ainda não pode ter acesso ao Google Drive! '+
            '\n- Para ter acesso ao Google Drive, é necessário que você tenha atingido o nível 1 no servidor. '+
            '\n- Para subir de nível, basta conversar com outros usuários nas salas de chat.'+
            '\n- Utilize o comando: **!rank** para ver seu nível atual'+
            '\n*Atenciosamente, equipe EditorZ* '+emoji.toString());
        }
    },

    async portugues(message){
        await addLanguageByRoleID(message.member, '745772024302927902');
        await removeRole(message.member, 'Member');
        message.delete();
    },

    async english(message){
        await addLanguageByRoleID(message.member, '745772098240118784');
        await removeRole(message.member, 'Member');
        message.delete();
    },

    async espanol(message){
        await addLanguageByRoleID(message.member, '745772124391866458');
        await removeRole(message.member, 'Member');
        message.delete();
    },

    async francais(message){
        await addLanguageByRoleID(message.member, '745772064090357821');
        await removeRole(message.member, 'Member');
        await message.delete();
    }

}

async function addLanguageByRoleID(member, roleID){

    if(!(catchUserLanguage(member))){
        const currentRole = client.guilds.cache.get(member.guild.id).roles.cache.get(roleID);
        console.log(currentRole.name);
        await member.roles.add(currentRole);
    }
}

async function removeRole(member, RoleName){
    const roles = await getUserRoles(member);

    const removeRole = roles.filter(e => {
        return e.name === RoleName;
    });

    await member.roles.remove(removeRole);
}

async function getUserRoles(member){
    
    const roles = client.guilds.cache.find(e => e.name === 'PBE -  EditorZ')
    .members.cache.get(member.id)
    .roles.cache;


    return roles;
}

function catchUserLanguage(member){
    const roleFilter = (role, key, roleMap) => {
        let langs = ['English', 'Français', 'Espanõl', 'Português'];
        return langs.indexOf(role.name) > -1;
    };
    
    const langRoles = member.roles.cache.find(roleFilter);

    return langRoles;
}

client.login(config.token);
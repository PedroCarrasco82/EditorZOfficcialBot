const Discord = require('discord.js');
const client = new Discord.Client();

const messages = require('./messages.json');
const config = require('./config.json');
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
    
    const userLanguage = await catchUserLanguage(message.author);
    
    const commandExecute = {...commands};
    commandExecute.language = userLanguage.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    if(commandExecute[customMessage || comando]){
       await commandExecute[customMessage || comando](message);
    }
});

const commands = {
    language:'',

    async roles(message) {
        const roleMessage = message[this.language];

        const roles = await getUserRoles(message.author);
    
        const rolesName = roles.map(e => e.name);
        
        const rolesText = rolesName.reduce((previousValue, currentValue, index, array) => {
    
            if(index === array.length - 1)
                return previousValue + "** "+roleMessage.additive+" **" + currentValue;
            else{
                return previousValue+"**, **"+currentValue;
            }
    
        }).replace('@','');
        
        message.reply(roleMessage.roleText+"**"+rolesText+ "**");
    },

    async customMessage(message) {
        message.reply("A aline, óbvio");
    },

    async help(message) {
        message.channel.send('')
    },

    async drive(message){
        const messageLanguage = messages[this.language];
        const username = message.author.username;
        const discriminator = message.author.discriminator;

        const roles = await getUserRoles(message.author);

        const hasMandatoryRole = roles.find(e => e.name === 'Editing Sometimes');

        if(hasMandatoryRole){
            const dmMessage = client.users.cache.get(message.author.id);

            if(message.channel.type === 'dm'){
                
                if(!!!usershasQuestion.find( e => e === message.author.id)){
                    usershasQuestion.push(message.author.id);
                
                const dmQuizText = messageLanguage.dmQuiz;

                const filter = m => m.author.id === message.author.id;

                const messageNameW = await dmMessage.send(dmQuizText.woozenName);
                const woozName = await message.channel.awaitMessages(filter, {time: 100000, max: 1, errors: ['time','max']});
                
                const filterEmoji = (reaction, user)=> {
                    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                };

                let wrongEmail = true;
                let email;
                let count = 1;

                while(wrongEmail){

                    if(count===1){
                        dmMessage.send(dmQuizText.email);
                    }else{
                        dmMessage.send(dmQuizText.wrongEmail);
                    }
                    email = await message.channel.awaitMessages(filter, {time: 100000, max: 1, errors: ['time','max']});
                   
                    const confirmEmail = await dmMessage.send(dmQuizText.confirmEmail);

                    confirmEmail.react('✅').then(()=> confirmEmail.react('❌'));

                    wrongEmail = await confirmEmail.awaitReactions(filterEmoji, {time:100000, max: 1})
                        .then(collected=>{
                            if(collected.first().emoji.name === '✅'){
                                return false;
                            }
                            else{
                                count++;
                                return true;
                            }
                        });     
                }
               
                    
                const hasInstagramMessage = await dmMessage.send(dmQuizText.hasInstagram);

                hasInstagramMessage.react('✅').then(()=> hasInstagramMessage.react('❌'));

                const hasInstagram = await hasInstagramMessage.awaitReactions(filterEmoji, {time:100000, max: 1}).then(collected=>collected.first().emoji.name); 
                
                let instagramName;

                if(hasInstagram === '✅'){
                    dmMessage.send(dmQuizText.instagramName);
                    instagramName = await (await message.channel.awaitMessages(filter, {time: 100000, max: 1, errors: ['time','max']})).first().content;
                    await dmMessage.send(dmQuizText.quizDone);
                }else{
                    await dmMessage.send(dmQuizText.dontHaveInstagramDone);
                }
                                
                const userProperties = userSchema.validate({
                    requestDate: message.createdAt,
                    discordUsername: username,
                    discordDiscriminator: discriminator,
                    woozName: woozName.first().content,
                    instagramName: instagramName,
                    email: email.first().content
                });
                
                if(userProperties.error){
                    userProperties.error.details.forEach(detail => {
                        dmMessage.send(detail.message);
                    })
                }


                usershasQuestion = usershasQuestion.filter(e => e !== message.author.id);
                return;
                } 
            }else{

                message.reply(messageLanguage.alertToSeeDM);
                dmMessage.send(messageLanguage.driveAccessInstructionDM.part1 + message.author.toString() + messageLanguage.driveAccessInstructionDM.part2);
            }
            

        }else{
            const emoji = client.guilds.cache.find(e => e.name === 'PBE -  EditorZ').emojis.cache.find(e => e.name == 'EditorZ');
            
            message.channel.send(messageLanguage.driveAccessInstruction.part1 + message.author.toString() + messageLanguage.driveAccessInstruction.part2+emoji.toString());
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
    
    const roles = await client.guilds.cache.find(e => e.name === 'PBE -  EditorZ')
    .members.cache.get(member.id)
    .roles.cache;


    return roles;
}

async function catchUserLanguage(member){
    const roleFilter = (role, key, roleMap) => {
        let langs = ['English', 'Francais', 'Espanol', 'Portugues'];
        return langs.indexOf(role.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")) > -1;
    };
    
    const langRoles = (await getUserRoles(member)).find(roleFilter);

    return langRoles;
}

client.login(config.token);
const messages = require('../messages.json');
const roleManager = require('../Utils/roleManager');
const userSchema = require('../schemas/user.schema');
const driveManager = require('../Utils/driveManager');
require('dotenv/config');


let usershasQuestion = [];

const commands = {
    client: null,

    language:null,

    async roles(message) {
        const roleMessage = messages[this.language];

        const roles = await roleManager.getUserRoles(message.author, this.client);
    
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
        if(messageLanguage){
            const username = message.author.username;
            const discriminator = message.author.discriminator;

            const roles = await roleManager.getUserRoles(message.author, this.client);

            const hasMandatoryRole = roles.find(e => e.name === process.env.MANDATORY_ROLE);

            if(hasMandatoryRole){
                const dmMessage = this.client.users.cache.get(message.author.id);

                if(message.channel.type === 'dm'){
                    
                    if(!!!usershasQuestion.find( e => e === message.author.id)){
                        usershasQuestion.push(message.author.id);
                    
                    const dmQuizText = messageLanguage.dmQuiz;

                    const filter = m => m.author.id === message.author.id;

                    const messageNameW = await dmMessage.send(dmQuizText.woozenName);

                    let wrongWoozName = true;

                    let woozName;

                    do{
                        woozName = await message.channel.awaitMessages(filter, {time: 100000, max: 1, errors: ['time','max']});
                        
                        if(woozName.first().content.includes(' ')){
                            dmMessage.send(dmQuizText.invalidWoozName);
                            wrongWoozName = true;
                        }else{
                            wrongWoozName = false;
                        }

                    }while(wrongWoozName)
                    
                    
                    const filterEmoji = (reaction, user)=> {
                        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                    };

                    let wrongEmail = true;
                    let email;
                    let count = 1;

                    while(wrongEmail){

                        if(count===1){
                            dmMessage.send(dmQuizText.email);
                        }else if(count > 1){
                            dmMessage.send(dmQuizText.wrongEmail);
                        }else if(count === 0){
                            dmMessage.send(dmQuizText.wrongEmailDomain);
                        }

                        email = await message.channel.awaitMessages(filter, {time: 100000, max: 1, errors: ['time','max']});

                        if(email.first().content.includes('@') && email.first().content.split('@')[1] === 'gmail.com'){
                            const confirmEmail = await dmMessage.send(dmQuizText.confirmEmail);

                            confirmEmail.react('✅').then(()=> confirmEmail.react('❌'));                            
                            wrongEmail = await confirmEmail.awaitReactions(filterEmoji, {time:100000, max: 1})
                            .then(collected=>{
                                if(collected.first().emoji.name === '✅'){
                                    return false;
                                }
                                else{
                                    count+=2;
                                    return true;
                                }
                            });   
                        }else{
                            count = 0;
                        }
  
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


                    const dateRequestGMT = new Date(message.createdAt);
                    const dateBrasilia = new Date(dateRequestGMT.valueOf() - dateRequestGMT.getTimezoneOffset() * 60000);

                    const user = {
                        requestDate: dateBrasilia,
                        discordUsername: username,
                        discordDiscriminator: discriminator,
                        woozName: woozName.first().content,
                        instagramName: instagramName || '',
                        email: email.first().content,
                        language: this.language
                    };
                                    
                    const userProperties = userSchema.validate(user);
                    
                    if(userProperties.error){
                        userProperties.error.details.forEach(detail => {
                            dmMessage.send(detail.message);
                        });
                        return;
                    }

                    console.log(userProperties.value);

                    driveManager.user = user;

                    driveManager.emailMessage = messageLanguage.emailMessage;

                    await driveManager.permissionAccessDrive();


                    usershasQuestion = usershasQuestion.filter(e => e !== message.author.id);
                    return;
                    } 
                }else{

                    message.reply(messageLanguage.alertToSeeDM);
                    dmMessage.send(messageLanguage.driveAccessInstructionDM.part1 + message.author.toString() + messageLanguage.driveAccessInstructionDM.part2);
                }
                

            }else{
                const emoji = this.client.guilds.cache.find(e => e.name === 'PBE -  EditorZ').emojis.cache.find(e => e.name == 'EditorZ');
                
                message.channel.send(messageLanguage.driveAccessInstruction.part1 + message.author.toString() + messageLanguage.driveAccessInstruction.part2+emoji.toString());
            }
        }else{
            message.channel.send('Escolha a sua linguagem no chat **language**');
        }
    },

    async portugues(message){
        await roleManager.addLanguageByRoleID(message.member, process.env.PORTUGUESE_ID, this.client);
        await roleManager.removeRole(message.member, process.env.STANDARD_ROLE, this.client);
        message.delete();
    },

    async english(message){
        await roleManager.addLanguageByRoleID(message.member, process.env.ENGLISH_ID, this.client);
        await roleManager.removeRole(message.member, process.env.STANDARD_ROLE, this.client);
        message.delete();
    },

    async espanol(message){
        await roleManager.addLanguageByRoleID(message.member, process.env.SPANISH_ID, this.client);
        await roleManager.removeRole(message.member, process.env.STANDARD_ROLE, this.client);
        message.delete();
    },

    async francais(message){
        await roleManager.addLanguageByRoleID(message.member, process.env.FRENCH_ID, this.client);
        await roleManager.removeRole(message.member, process.env.STANDARD_ROLE, this.client);
        await message.delete();
    }

}

module.exports = commands;
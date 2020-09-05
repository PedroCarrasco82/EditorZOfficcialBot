require('dotenv/config');

const roleManager = {
    async addRoleByID(member, roleID, client){

        if(!(await this.getUserLanguage(member, client))){
            const currentRole = await client.guilds.cache.get(member.guild.id).roles.cache.get(roleID);
            console.log(currentRole.name);
            await member.roles.add(currentRole);
        }
    },
    
    async removeRole(member, RoleName, client){
        const roles = await this.getUserRoles(member, client);
    
        const removeRole = roles.filter(e => {
            return e.name === RoleName;
        });
    
        await member.roles.remove(removeRole);
    },
    
    async getUserRoles(member, client){
        
        const roles = await client.guilds.cache.find(e => e.name === process.env.SERVER_NAME)
        .members.cache.get(member.id)
        .roles.cache;
    
    
        return roles;
    },
    
    async getAllRoles(client){
        console.log(process.env.SERVER_NAME);
        return client.guilds.cache.find(e => e.name === process.env.SERVER_NAME).roles.cache;
    },
    
    async getUserLanguage(member, client){
        const roleFilter = (role, key, roleMap) => {
            let langs = ['English', 'Francais', 'Espanol', 'Portugues'];
            return langs.indexOf(role.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")) > -1;
        };
        
        const langRoles = (await this.getUserRoles(member, client)).find(roleFilter);
    
        return langRoles;
    },

    async addRoleByName(member, roleName, client){
        const roleFilter = (role, key, roleMap) => {
            return role.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "") === roleName;
        };
        
        const roleAdd = (await this.getAllRoles(client)).find(roleFilter);

        member.roles.add(roleAdd);
    },

    async getUserMember(author, client){
        return client.guilds.cache.find(e => e.name === process.env.SERVER_NAME).members.cache.get(author.id);
    }
}

module.exports = roleManager;
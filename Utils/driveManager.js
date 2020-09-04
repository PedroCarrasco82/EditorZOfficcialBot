const {google} = require('googleapis');
const googleAccess = require('./googleAccess');

require('dotenv/config');

const driveManager = {

    user: {
        requestDate: null,
        discordUsername: null,
        discordDiscriminator: null,
        email: null,
        woozName: null,
        instagramName: null,
        language: null
    },

    emailMessage: null,

    async permissionAccessDrive() {
        const auth = await googleAccess();

        if(auth){
            const drive = await google.drive({ version: 'v3', auth});
    
            await drive.permissions.create({
                fileId: process.env.DRIVE_ID,
                emailMessage: this.emailMessage,
                requestBody: {
                    role: 'reader',
                    type:'user',
                    emailAddress: this.user.email
                }
            });
        }

    },

    async readSheet(auth){

    }
}

module.exports = driveManager;
const {google} = require('googleapis');
const googleAccess = require('./googleAccess');

require('dotenv/config');

const driveManager = {

    emailMessage: null,

    async permissionAccessDrive(user) {
        const auth = await googleAccess();
        if(auth){
            const drive = await google.drive({ version: 'v3', auth});

        await drive.permissions.create({
            fileId: process.env.DRIVE_ID,
            emailMessage: this.emailMessage,
            requestBody: {
                role: 'reader',
                type:'user',
                emailAddress: user.email
            }
        });
        }

    },

    async addUserInDriveSheet(user){
        const auth = await googleAccess();
        if(auth){
            
        const sheets = await google.sheets({version: 'v4', auth});

        console.log(user.language);

        const spreadSheetId = languageSheet[user.language];

        console.log(spreadSheetId);

        const values = await sheets.spreadsheets.get({
            spreadsheetId: spreadSheetId,
            includeGridData: true
          });
      
        const rowCount = values.data.sheets[0].data[0].rowData.length + 1;
          

        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadSheetId,
            range: 'A'+rowCount,
            valueInputOption: 'RAW',
        
            requestBody: {
                values:[
                    [
                        user.requestDate,
                        user.email,
                        user.woozName,
                        user.discordUsername,
                        user.discordDiscriminator,
                        user.instagramName
                    ]
                ]
            }
        });
        }
    },

    async userIncludesInDrive(discriminator, language){
        const auth = await googleAccess();

        if(auth){

            const spreadSheetId = languageSheet[language];

            const sheets = await google.sheets({version: 'v4', auth});

            const values = await sheets.spreadsheets.get({
            spreadsheetId: spreadSheetId,
            includeGridData: true
            });

            const hasAccess = values.data.sheets[0].data[0].rowData
                .map(e => e.values)
                    .find(e => e && e[4].formattedValue == discriminator);


             return !!hasAccess;

        } 
    },

    async addReportInSheet(report){
        const auth = await googleAccess();
        if(auth){
            
        const sheets = await google.sheets({version: 'v4', auth});

        const spreadsheetId = process.env.REPORT_SHEET_ID;

        const values = await sheets.spreadsheets.get({
            spreadsheetId,
            includeGridData: true
          });
      
        const rowCount = values.data.sheets[0].data[0].rowData.length + 1;
          

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'A'+rowCount,
            valueInputOption: 'RAW',
        
            requestBody: {
                values:[
                    [
                        report.requestData,
                        report.userName,
                        report.userDiscriminator,
                        report.message
                    ]
                ]
            }
        });
        }
    },

    async allUserReports(discriminator){
        const auth = await googleAccess();

        if(auth){
            
            const sheets = await google.sheets({version: 'v4', auth});
            const spreadsheetId = process.env.REPORT_SHEET_ID;

            const values = await sheets.spreadsheets.get({
                spreadsheetId,
                includeGridData: true
            });

            const reports = values.data.sheets[0].data[0].rowData
                    .map(e => e.values)
                        .filter(e => e && e[2].formattedValue == discriminator);

            return reports;

        }

    }
}

const languageSheet = {
    Portugues: process.env.PORTUGUESE_SPREADSHEET_ID,
    Francais: process.env.FRENCH_SPREADSHEET_ID,
    English: process.env.ENGLISH_SPREADSHEET_ID,
    Espanol: process.env.SPANISH_SPREADSHEET_ID
}

module.exports = driveManager;
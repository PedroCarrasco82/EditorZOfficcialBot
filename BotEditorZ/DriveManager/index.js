const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const message = require('../messages.json');
require('dotenv/config');


// If modifying these scopes, delete token.json.
const SCOPES = require('./utils/DriveScopes');

const TOKEN_PATH = './DriveManager/token.json';

async function driveManager(user){

    const emailMessage = message[user.language].emailMessage;

    fs.readFile('./DriveManager/credentials.json', async (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);

        await authorize(JSON.parse(content), permissionDrive);
      });
      
      async function permissionDrive(auth) {
          const drive = await google.drive({ version: 'v3', auth});
      
          await drive.permissions.create({
              fileId: process.env.DRIVE_ID,
              emailMessage,
              requestBody: {
                  role: 'reader',
                  type:'user',
                  emailAddress: user.email
              }
          })
      
      }
      
}

async function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  
  fs.readFile(TOKEN_PATH, async (err, token) => {
    if (err) return await getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}


async function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

module.exports = driveManager;
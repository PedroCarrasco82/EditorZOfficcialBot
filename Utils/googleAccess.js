const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const util = require('util');
require('dotenv/config');

const SCOPES = require('../config/DriveScopes');

const TOKEN_PATH = './config/token.json';

async function googleApiAccess(){

        const readFile = util.promisify(fs.readFile);

        const {oAuth2Client, token} = await (await readFile('./config/credentials.json').then(async (content) => {          
          return await authorize(JSON.parse(content));
        }).catch(err =>console.log('Error loading client secret file:', err)));

        if(token){
          oAuth2Client.setCredentials(token);

          return oAuth2Client;
        }

}

async function authorize(credentials) {

  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

      const readFile = util.promisify(fs.readFile);

      return readFile(TOKEN_PATH).then(async (generateToken) => {
        oAuth2Client.setCredentials(JSON.parse(generateToken));
        return {
          oAuth2Client,
          token: JSON.parse(generateToken)
        };

      }).catch(async err => {
        console.log(err)
        if(err){
          return await getAccessToken(oAuth2Client);
        }
      });
}


async function getAccessToken(oAuth2Client) {
  
  const authUrl = await oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('Authorize this app by visiting this url:', authUrl);
  
  const rl = await readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let tokenReturn;

  await rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);

      tokenReturn = token;

      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });

    });
  });

  return {
    token: tokenReturn,
    oAuth2Client
  }

}

module.exports = googleApiAccess;
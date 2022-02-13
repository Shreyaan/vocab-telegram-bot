// bot.js

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
// This file would be created soon
const parser = require('./parser.js');
// const allWords = require('./allWords.js');

require('dotenv').config();

// const nthline = require('nthline');
const filePath =('./words.csv');

const csv = require('csv-parser')
const fs = require('fs')
const results = [];

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

// exports.printWord = async function printWord() {
 


const token = process.env.TELEGRAM_TOKEN;
let bot;

if (process.env.NODE_ENV === 'production') {
   bot = new TelegramBot(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
   bot = new TelegramBot(token, { polling: true });
}

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id, `/word - send /word plus the word whose definition you want
    
/random- send this to get definition of a random word`);
    
    });

// Matches "/word whatever"
bot.onText(/\/word (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const word = match[1];
  axios
    .get(`${process.env.OXFORD_API_URL}/entries/en-gb/${word}`, {
      params: {
        fields: 'definitions',
        strictMatch: 'false'
      },
      headers: {
        app_id: process.env.OXFORD_APP_ID,
        app_key: process.env.OXFORD_APP_KEY
      }
    })
    .then(response => {
      const parsedHtml = parser(response.data);
      bot.sendMessage(chatId, parsedHtml, { parse_mode: 'HTML' });
    })
    .catch(error => {
      const errorText = error.response.status === 404 ? `No definition found for the word: <b>${word}</b>` : `<b>An error occured, please try again later</b>`;
      bot.sendMessage(chatId, errorText, { parse_mode:'HTML'})
    });
});
bot.onText(/\/random/, (msg) => {
  let lineNo = getRandomInt(0, 5348);
  // let parts;
  // // let wordLine = nthline(lineNo, filePath);
  // nthline(lineNo, filePath).then(line => { parts = line.split('\t');})

  // // let parts = wordLine.split('\t');
  
  
  let randomWord;
  let randomWordDef;

  fs.createReadStream('words.csv')
  .pipe(csv({ separator: '\t'}))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // console.log(results[100]);

    randomWord= results[lineNo]['word']
    randomWordDef= results[lineNo]['definition']
    bot.sendMessage(msg.chat.id, `Random Word:
${randomWord}
  
Definition:
${randomWordDef}`);
    
  });

 

});

// bot.js

// Move the package imports to the top of the file
const express = require('express')
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

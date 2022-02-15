// bot.js

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const parser = require("./parser.js");

require("dotenv").config();

const filePath = "./words.csv";

const csv = require("csv-parser");
const fs = require("fs");
const results = [];

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const token = process.env.TELEGRAM_TOKEN;
let bot;

if (process.env.NODE_ENV === "production") {
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new TelegramBot(token, { polling: true });
}

// Start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `/word - send /word plus the word whose definition you want
    
/random- send this to get definition of a random word`
  );
});

// Matches "/word whatever"
bot.onText(/\/word (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const word = match[1];
  axios
    // .get(`${process.env.OXFORD_API_URL}/entries/en-gb/${word}`, {
    //   params: {
    //     fields: "definitions",
    //     strictMatch: "false",
    //   },
    //   headers: {
    //     app_id: process.env.OXFORD_APP_ID,
    //     app_key: process.env.OXFORD_APP_KEY,
    //   },
    // })
    // .then((response) => {
    //   const parsedHtml = parser(response.data);
    //   bot.sendMessage(chatId, parsedHtml, { parse_mode: "HTML" });
    // })
    // .catch((error) => {
    //   const errorText =
    //     error.response.status === 404
    //       ? `get rekt 🔥🔥🔥 coz definition not found for the word: <b>${word}</b>`
    //       : `<b>An error occured, please try again later</b>`;
    //   bot.sendMessage(chatId, errorText, { parse_mode: "HTML" });
    // });

    var options = {
      method: 'GET',
      url: `https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`,
      headers: {
        'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
        'x-rapidapi-key': 'db62831c7cmshea0b63b2012e4f9p1b9665jsnc7a6ebb0abab'
      }
    };
    
    axios.request(options).then(function (response) {
      // console.log(response.data);
      // bot.sendMessage(chatId, parsedHtml, { parse_mode: "HTML" });
      bot.sendMessage(chatId, response.data);
      
    }).catch(function (error) {
      console.error(error);
      bot.sendMessage(chatId, error);

    });
});

// gives random word
bot.onText(/\/random/, (msg) => {
  let lineNo = getRandomInt(0, 5348);
  let randomWord;
  let randomWordDef;

  fs.createReadStream("words.csv")
    .pipe(csv({ separator: "\t" }))
    .on("data", (data) => results.push(data))
    .on("end", () => {
      randomWord = results[lineNo]["word"];
      randomWordDef = results[lineNo]["definition"];
      bot.sendMessage(
        msg.chat.id,
        `Random Word:
${randomWord}
  
Definition:
${randomWordDef}`
      );
    });
});

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post("/" + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

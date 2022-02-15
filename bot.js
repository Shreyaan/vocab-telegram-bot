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
const { json } = require("body-parser");
const app = express();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const token = process.env.TELEGRAM_TOKEN;
const RapidApitoken = process.env.rapid;
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
    
/random- send this to get definition of a random word

/urban- get definition from Urban Dictionary`
  );
});

// Matches "/word whatever"
bot.onText(/\/word (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const word = match[1];
  axios;

  var options = {
    method: "GET",
    url: `https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`,
    headers: {
      "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
      "x-rapidapi-key": RapidApitoken,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      let responseData = response.data;
      let wordResponse = responseData["word"];
      let categoryWord = responseData["definitions"][0]["partOfSpeech"];
      let firstDef = responseData["definitions"][0]["definition"];

      bot.sendMessage(
        chatId,
        `Word: ${wordResponse}

${responseData["definitions"].length} definition(s) found for the word

CATEGORY: ${categoryWord}

DEFINITION: ${firstDef}
         `
      );

      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      sleep(700).then(() => {
        responseData["definitions"].shift();
        responseData["definitions"].forEach((element, index) => {
          let thisIndex = index + 2;
          bot.sendMessage(
            chatId,
            ` definition number ${thisIndex}: ${element["definition"]} `
          );
        });
      });
    })
    .catch(function (error) {
      if (error.response.status == 404) {
        bot.sendMessage(
          chatId,
          `lmao rekt 🔥🔥
word not defined in this try to use /urban command 
      `
        );
      } else {
        bot.sendMessage(
          chatId,
          `there has been an unexpected error
${error} 
please contact dev at @bruh7814
      `
        );
      }
    });
});

bot.onText(/\/urban (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const word = match[1];
  let numberOfDef;
  // if(match[2] == '1' || match[2] == '2' || match[2] == '3' || match[2] == '4' || match[2] == '5' || match[2] == '6' || match[2] == '7' || match[2] == '8' || match[2] == '9' )
  // {numberOfDef = match[2];}

  // note -add number detection this upper part was for that but doest work

  axios;

  var options = {
    method: "GET",
    url: "https://mashape-community-urban-dictionary.p.rapidapi.com/define",
    params: { term: word },
    headers: {
      "x-rapidapi-host": "mashape-community-urban-dictionary.p.rapidapi.com",
      "x-rapidapi-key": RapidApitoken,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      let responseData = response.data;
      let defination = responseData["list"][0]["definition"];
      let example = responseData["list"][0]["example"];

      if (numberOfDef == null || numberOfDef == undefined) {
        bot.sendMessage(
          chatId,
          `Word: ${word}

${responseData["list"].length} definition(s) found for the word

DEFINITION: ${defination}

Example: ${example}



** please ignore "["  , "]" thats an issue with api cant fix it :/ 

    `
        );
      } else {
        numberOfDef = parseInt(numberOfDef);
        bot.sendMessage(
          chatId,
          `Word: ${word}
${responseData["list"].length} definition(s) found for the word

DEFINITION: ${responseData["list"][++numberOfDef]["definition"]}

Example: ${example}


    `
        );
      }
    })
    .catch(function (error) {
      console.log(error);
      bot.sendMessage(
        chatId,
        `lmao rekt 🔥🔥
word not defined`
      );
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

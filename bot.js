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
const { query } = require("express");
const app = express();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const token = process.env.TELEGRAM_TOKEN;
const RapidApitoken = process.env.rapid;
const mdapi = process.env.mdapi;
const wordnik_api = process.env.wordnik_api;
let bot;

if (process.env.NODE_ENV === "production") {
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new TelegramBot(token, { polling: true });
}

//functions
function wordnik(msg, match) {
  const chatId = msg.chat.id;
  const word = match[1];
  let CapitalWord = word.toLowerCase();

  var config = {
    method: "get",
    url: `https://api.wordnik.com/v4/word.json/${CapitalWord}/definitions?limit=7&includeRelated=false&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=1unu9ftgcqef2drgpzj1n4m3t8xx9d9ph0yrtk8uly9929k92`,
    headers: {
      wordnik: wordnik_api,
    },
  };

  axios(config)
    .then(function (response) {
      let responseData = response.data;

      // Check if we have valid definitions
      if (!responseData || responseData.length === 0 || !responseData[0].text) {
        throw new Error("No valid definitions found");
      }

      let message = `${responseData.length} definitions found for ${word}\n\n`;

      responseData.forEach((element, index) => {
        // Only add definition if text and partOfSpeech exist
        if (element.text && element.partOfSpeech) {
          message += `(${index + 1})  ${element.partOfSpeech}:\n    ${
            element.text
          }\n\n`;
        }
      });

      bot.sendMessage(chatId, message);
    })
    .catch(function (error) {
      bot.sendMessage(
        chatId,
        `Sorry no definition found 😔😔\n\nTrying Urban Dictionary`
      );
      urbanDic(msg, match);
    });
}

function urbanDic(msg, match) {
  const chatId = msg.chat.id;
  const word = match[1];

  const url = `https://unofficialurbandictionaryapi.com/api/search?term=${encodeURIComponent(
    word
  )}&strict=false&matchCase=false&limit=4&page=1&multiPage=false`;

  axios
    .get(url)
    .then(function (response) {
      const { data, found } = response.data;

      if (!found || data.length === 0) {
        throw new Error("No definitions found");
      }

      const firstDef = data[0];
      const message = `Word: ${word}

${data.length} definition(s) found

DEFINITION: ${firstDef.meaning}

Example: ${firstDef.example}

You can see other definitions here: https://www.urbandictionary.com/define.php?term=${encodeURIComponent(
        word
      )}`;

      bot.sendMessage(chatId, message);
    })
    .catch(function (error) {
      console.error("Urban Dictionary API error:", error);
      const querySe = encodeURIComponent(word);
      bot.sendMessage(
        chatId,
        `Sorry no definition found
    
I would suggest you to google it 
here's the link 
https://www.google.com/search?q=${querySe}`
      );
    });
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
      // If no definitions found, fall back to wordnik
      if (!responseData.definitions || responseData.definitions.length <= 0) {
        return wordnik(msg, match);
      }

      let wordResponse = responseData.word;
      let definationString = "";

      responseData.definitions.forEach((element, index) => {
        definationString += `
${++index}:
CATEGORY: ${element.partOfSpeech}
DEFINITION:${element.definition}

        `;
      });

      return bot.sendMessage(
        chatId,
        `Word: ${wordResponse}

${responseData.definitions.length} definition(s) found for the word

Definition(s): ${definationString}
         `
      );
    })
    .catch(function (error) {
      console.error("Error fetching definition:", error.message);
      // Fallback to wordnik for any error
      return wordnik(msg, match);
    });
});

//gets word from Urban Dictionary
bot.onText(/\/urban (.+)/, (msg, match) => {
  urbanDic(msg, match);
});

//gets word from wordnik
bot.onText(/\/wordnik (.+)/, (msg, match) => {
  wordnik(msg, match);
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

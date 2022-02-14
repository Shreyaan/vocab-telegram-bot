# vocab-telegram-bot
**This telegram bot gives you definitions of words or will give you random words with definitions to increase your vocabulary**

got the csv file of words from https://www.npmjs.com/package/learn-a-word

## Features
/word (word) for definition of a word

/random for random word

# How to use
## Clone this project

```bash
> git clone https://github.com/Shreyaan/vocab-telegram-bot
```

## Install the dependencies:
Before running the below command, make sure you're in the project directory that
you've just cloned!!

```bash
> npm install
```

### Usage
Before running this bot, first add OXFORD_API_URL, OXFORD_APP_ID, OXFORD_APP_KEY, TELEGRAM_TOKEN in .env file or in heroku's Config Vars (if you are using heroku remember to also add HEROKU_URL) 
You can get Oxford api url,key and app id from https://developer.oxforddictionaries.com/ and telegram token from https://t.me/botfather

```bash
> npm start

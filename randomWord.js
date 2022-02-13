// source https://www.npmjs.com/package/learn-a-word

const nthline = require('nthline');
const filePath = __dirname + '/words.csv';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

// exports.printWord = async function printWord() {
    let lineNo = getRandomInt(0, 5348);
    let wordLine = await nthline(lineNo, filePath);
    let parts = wordLine.split('\t');
    let randomWord= parts[0];
    let randomWordDef=parts[1];

   return (randomWord,randomWordDef)
// }

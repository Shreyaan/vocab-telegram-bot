const csv = require('csv-parser')
const fs = require('fs')
const results = [];

fs.createReadStream('words.csv')
  .pipe(csv({ separator: '\t'}))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results[100]);
   
    
  });
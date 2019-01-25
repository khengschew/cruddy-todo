const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;
const bb = require('bluebird');

bb.promisifyAll(fs);

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

const readCounter = (callback) => {
  return fs.readFileAsync(exports.counterFile)
    .then ( (fileData) => callback(null, Number(fileData)) )
    .catch ( (err) => callback(null, 0) );
};

const writeCounter = (count, callback) => {
  var counterString = zeroPaddedNumber(count);
  return fs.writeFileAsync(exports.counterFile, counterString)
    .then( () => callback(null, counterString) )
    .catch( err => callback(err) );
};

// Public API - Fix this function //////////////////////////////////////////////

exports.getNextUniqueId = (callback) => {
  readCounter((blank, num = 0) => {
    counter = num;
    return counter + 1;
  })
    .then( (counter) => writeCounter(counter, callback) );

  // Original callback format:
  // readCounter((blank, num = 0) => {
  //   counter = num;
  //   counter = counter + 1;
  //   writeCounter(counter, callback);
  // });
};



// Configuration -- DO NOT MODIFY //////////////////////////////////////////////

exports.counterFile = path.join(__dirname, 'counter.txt');

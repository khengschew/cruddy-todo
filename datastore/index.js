const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const bb = require('bluebird');

bb.promisifyAll(fs);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id;
  counter.getNextUniqueId((blank, counterString) => {
    id = counterString;
    items[id] = text;
    fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, () => { callback(null, { id, text }); });
  });
};

exports.readAll = (callback) => {
  return fs.readdirAsync(exports.dataDir)
    .then((files) => {
      var promises = _.map(files, (file) => {
        return fs.readFileAsync(path.join(exports.dataDir, file));
      });
      promises.push(files);
      return promises;
    })
    .then(texts => Promise.all(texts))
    .then(texts => {
      var ids = texts.pop();
      return _.map(ids, (id, index) => {
        var fileName = id.split('.');
        return { id: fileName[0], text: texts[index].toString() };
      });
    })
    .then(data => (callback(null, data)))
    .catch(err => console.log(`Error :${err}`));

    
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, id + '.txt'),
    (err, fileData) => {
      if (!fileData || err) {
        callback(new Error(`No item with id: ${id}`));
      } else {
        callback(null, {id, text:fileData.toString()});
      }
    }
  );
};

exports.update = (id, text, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if(_.contains(files, id + '.txt')) {
      fs.writeFile(path.join(exports.dataDir, id + '.txt'), text, (err) => {
        if (err) {
          callback(new Error(`Error: ${err}`));
        } else {
          items[id] = text;
          callback(null, { id, text });
        }
      });
    } else {
      callback(new Error(`Error: ${err}`));
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, id +'.txt'), (err) => {
    // report an error if item not found
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      var item = items[id];
      delete items[id];
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

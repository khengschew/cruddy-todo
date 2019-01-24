const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

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
  fs.readdir(exports.dataDir, (err, files) => {
    var data = _.map(files, (file) => {
      var fileName = file.split('.');
      return { id: fileName[0], text: fileName[0] };
    });
    callback(null, data);
  });
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
  // readdir
  // callback: _.contains(dir, id)
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
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

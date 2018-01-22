const db = require('mongoose');

module.exports = function (done) {
  db.Promise = global.Promise;
  db.models = {};
  db.modelSchemas = {};
  db.connect('mongodb://127.0.0.1:27017/typingFunTest',
      function (err, db) {
        if (err) {
          console.log(err);
          done(err);
        }
        console.log('connect to database typingFunTest');
        done();
      });
};
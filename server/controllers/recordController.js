const dataManager = require("../../localModules").userDataManager;

// const Article  = require('../models/article');

function main(router) {
  router.route('/record/save')
    .post((req, res, next) => {
      console.log(req.body);
    });
}

module.exports = main;
var appRoot = require('app-root-path');
var MODELS = require(appRoot + '/models');

var express = require('express');
var server = require('./server.js');

var router = express.Router();

// define the home page route
//router.get('/', server.memberList);

router.get('/', function(req, res) {
  MODELS.MEMBERS.findAll().then(members => {
    console.log(members);
  })
});


router.put('/', function(req, res) {
  MODELS.MEMBERS.findAll().then(members => {
  })
});

router.post('/:mermberID', function(req, res) {
  const mermberID = req.params.mermberID;
});

router.delete('/:mermberID', function(req, res) {
  const mermberID = req.params.mermberID;
  MODELS.MEMBERS.destroy({where: {MEMBER_ID: mermberID}})
  .then(result => {
     res.json({});
  })
  .catch(err => {
     console.error(err);
  });
});

module.exports = router;
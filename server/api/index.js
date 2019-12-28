const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

fs.readdirSync(__dirname).forEach(file => {
  
  if( file == './' || file == 'index.js' || file == 'common' )
    return;

  router.use('/' + file, require(__dirname + '/' + file));
});

router.get('/', function(req, res) {

});

module.exports = router;
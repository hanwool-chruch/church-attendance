var port = Number(process.env.PORT || 8000);

var express = require('express');

var app = express()
  , routes = require('./server/routes')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io')
  , fs = require('fs')
  , pkginfo = require('./package')
  , passport = require('passport')
  , bodyParser = require('body-parser');

app.use(express.static(__dirname + '/app'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = app.listen(port, function() { 
	console.log('Listening on port %d', server.address().port); 
});
	

	
app.get('/rest/member', routes.userList);
app.post('/rest/member', routes.saveUser);
app.get('/rest/member/:memberId', routes.user);
app.get('/rest/codeList', routes.codeList);
app.get('/rest/att', routes.attList);

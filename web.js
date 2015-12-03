var port = Number(process.env.PORT || 8000);

var express = require('express');

var app = express()
  , routes = require('./server/routes')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io')
  , fs = require('fs')
  , pkginfo = require('./package')
  , passport = require('passport');

app.use(
		
	express.static(__dirname + '/app')); 

	var server = app.listen(port, function() { 
		console.log('Listening on port %d', server.address().port); 
	}
	
);
	
app.get('/rest/member', routes.userList);
app.get('/rest/member/:memberId', routes.user);
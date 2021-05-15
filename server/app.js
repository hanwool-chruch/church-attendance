const express = require('express')
const app = express()
const port = 8080
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const jsonParser = require('json-parser');

app.use(bodyParser.json())
app.use(cookieParser())

app.all('/api/*', function(req, res, next) {

  if( req.path == "/api/manager/login")
    return next()

  if(req.cookies==null || req.cookies.globals==null) {
    req.depart = "S10"
  }else if(req.body !=undefined && req.body.depart !=undefined){
    req.depart = req.body.depart
  }
  else{
    var parser_data = jsonParser.parse(req.cookies.globals);
    currentUser = parser_data.currentUser
    if(currentUser==null || currentUser.username == null) {
      req.depart = "S10"
    }
    else {
      req.depart = currentUser.username
    }
  }

  return next()
})

app.use(express["static"](__dirname + "/../app"))
app.use('/api', require('./api'));
server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
require('./socket').createSocketIO(server)

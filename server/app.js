const express = require('express')
const app = express()
const port = 8000
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const jsonParser = require('json-parser');

app.use(bodyParser.json())
app.use(cookieParser())

app.all('/api/*', function(req, res, next) {

  var parser_data = jsonParser.parse(req.cookies.globals);
  currentUser = parser_data.currentUser

  if(req.cookies==null || req.cookies.globals==null || currentUser==null || currentUser.username == null)
    req.depart = "S1"
  else
    req.depart = currentUser.username

  next()
})

app.use(express["static"](__dirname + "/../app"))
app.use('/api', require('./api'));
server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
require('./socket').createSocketIO(server)

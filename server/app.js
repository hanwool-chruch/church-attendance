const express = require('express')
const app = express()
const port = 8080
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')


require('@google-cloud/debug-agent').start({
  serviceContext: {
    service: 'WOONG',
    version: 'v1.0'
  }
});

app.use(bodyParser.json())
app.use(cookieParser())


app.use(express["static"](__dirname + "/../app"))
app.use('/api', require('./api'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

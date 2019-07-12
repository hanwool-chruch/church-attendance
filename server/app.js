const express = require('express')
const app = express()
const port = 3000

const router = express.Router();
router.use('/api', require('./api'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const express = require('express');
const router = express.Router();
router.use('/member', require('./member'));
module.exports = router;
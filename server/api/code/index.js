const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')

const express = require('express')
const router = express.Router()
const controller = require('./controller.js')

const helper = require(appRoot + '/server/api/common/http_helper.js')

router.get('/', helper.createResponseFn(controller.codeList))


module.exports = router

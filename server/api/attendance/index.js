const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')

const express = require('express')
const router = express.Router()

const controller = require('./controller.js')
const helper = require(appRoot + '/server/api/common/http_helper.js')

router.get('/list', helper.createResponseFn(controller.getAttendanceList))
router.get("/detail/:id", helper.createResponseFn(controller.getAttendanceDetail));

router.post("/title", helper.createResponseFn(controller.updateWorshipTitle));
router.post("/massage", helper.createResponseFn(controller.updateWorshipMessage));
router.post("/report", helper.createResponseFn(controller.updateReport));

router.post("/select", helper.createResponseFn(controller.createAttendance));
router.post("/deselect", helper.createResponseFn(controller.deleteAttendance));

module.exports = router

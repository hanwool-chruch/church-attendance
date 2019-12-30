const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')

const express = require('express')
const router = express.Router()

const controller = require('./controller.js')
const helper = require(appRoot + '/server/api/common/http_helper.js')

router.get('/list', helper.createResponseFn(controller.getPartList))

router.post('/part_name', helper.createResponseFn(controller.updatePartName))
router.post('/teacher_name', helper.createResponseFn(controller.updateTeacherName))

router.put('/', helper.createResponseFn(controller.createPart))
router.delete('/:partCD', helper.createResponseFn(controller.deletePart))


module.exports = router

const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')

const express = require('express')
const router = express.Router()

const controller = require('./controller.js')
const helper = require(appRoot + '/server/api/common/http_helper.js')

router.get('/list/withPart', helper.createResponseFn(controller.memberListWithPart))

router.get('/list/sortedName', helper.createResponseFn(controller.sortedNameList))
router.get('/list/longAbsentee', helper.createResponseFn(controller.longAbsenteeList))
router.get('/list/latestAbsentee', helper.createResponseFn(controller.latestAbsenteeList))
router.get('/list/baptism', helper.createResponseFn(controller.baptismList))
router.get('/list/birthday', helper.createResponseFn(controller.birthDayMemberList))

router.get('/list/total', helper.createResponseFn(controller.baptismList))

router.get('/:mermberID', helper.createResponseFn(controller.detailMember))
router.put('/', helper.createResponseFn(controller.updateMember))
router.post('/', helper.createResponseFn(controller.insertMember))
router.delete('/:mermberID', helper.createResponseFn(controller.deleteMember))

module.exports = router

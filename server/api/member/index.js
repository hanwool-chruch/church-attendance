const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')

const express = require('express')
const router = express.Router()

const c = require('./controller.js')
const helper = require(appRoot + '/server/api/common/http_helper.js')

router.get('/list/withPart', helper.createResponseFn(c.memberListWithPart))

router.get('/list/sortedName', helper.createResponseFn(c.sortedNameList))
router.get('/list/longAbsentee', helper.createResponseFn(c.longAbsenteeList))
router.get('/list/latestAbsentee', helper.createResponseFn(c.latestAbsenteeList))
router.get('/list/baptism', helper.createResponseFn(c.baptismList))

router.get('/list/total', helper.createResponseFn(c.baptismList))

router.get('/:mermberID', helper.createResponseFn(c.detailMember))
router.put('/', helper.createResponseFn(c.insertMember))
router.post('/', helper.createResponseFn(c.updateMember))
router.delete('/:mermberID', helper.createResponseFn(c.deleteMember))

module.exports = router

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
router.get('/list/need/part', helper.createResponseFn(controller.needToMathPartMemberList))
router.get('/list/need/more', helper.createResponseFn(controller.needMoreInformation))

router.get('/list/attributeRatio', helper.createResponseFn(controller.getMemberListWithAttendance))
router.get('/list/teacher', helper.createResponseFn(controller.getTeacherList))
router.get('/list/promoted', helper.createResponseFn(controller.getPromotedStudents))
router.get('/list/total', helper.createResponseFn(controller.baptismList))
router.get('/downLoad/excel', helper.createDownloadFn(controller.downLoadExcel))

router.get('/:memberID', helper.createResponseFn(controller.detailMember))
router.put('/', helper.createResponseFn(controller.updateMember))
router.post('/', helper.createResponseFn(controller.insertMember))
router.delete('/:memberID', helper.createResponseFn(controller.deleteMember))
router.get('/attendance/:memberID', helper.createResponseFn(controller.attendances))
router.get('/history/:memberID', helper.createResponseFn(controller.getHistory))

router.post('/part', helper.createResponseFn(controller.updatePart))
router.post('/uploadPhoto/:memberID', helper.createResponseFn(controller.uploadPhoto))

module.exports = router

const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')
const Sequelize = MODELS.Sequelize


const memmberController = require(appRoot + '/server/api/member/controller.js')
const attendanceController = require(appRoot + '/server/api/attendance/controller.js')

var _ = {};

_.getPartList = async (req) => {
 
  const depart = req.depart
  return await MODELS.PARTS.findAll(
  {
    raw: true,
    order: [
      ['ORDERBY_NO', 'ASC']
    ],
    where: {
      DEPART_CD: depart,
    }
  })
}

_.updatePartName = async (req) => {
  const part = req.body
  const depart = req.depart

  return await MODELS.PARTS.update(
    {
      PART_NAME: part.PART_NAME
    },
    {
      where: { DEPART_CD: depart,  PART_CD: part.PART_CD },
      returning: true
    })
}

_.updateTeacherName = async (req) => {
  const part = req.body
  const depart = req.depart

  return await MODELS.PARTS.update(
    {
      TEACHER_NAME: part.TEACHER_NAME
    },
    {
      where: { DEPART_CD: depart,  PART_CD: part.PART_CD },
      returning: true
    })
}

_.createPart = async (req) => {
  const part = req.body
  const depart = req.depart

  part.DEPART_CD = depart

  return await MODELS.PARTS.create(
    part,
    {
      returning: true
    })
}

_.deletePart  = async (req) => {
  const depart = req.depart
  const partCD = req.params.partCD

  return await MODELS.PARTS.destroy(
    {
      where: { DEPART_CD: depart, PART_CD: partCD },
      returning: true
    })
}

module.exports = _

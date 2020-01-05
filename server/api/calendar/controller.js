const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')
const Sequelize = MODELS.Sequelize


const memberController = require(appRoot + '/server/api/member/controller.js')
const attendanceController = require(appRoot + '/server/api/attendance/controller.js')

var _ = {};

_.calendar = async (req) => {
  return{
    worship: await attendanceController.worshipList(req),
    member : await memberController.sortedNameList(req),
  }
};

module.exports = _
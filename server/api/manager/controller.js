const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')
const sequelize = MODELS.Sequelize
const CODE = require(appRoot + '/server/api/common/code.js')

const Sequelize = MODELS.Sequelize
const memberCtl = require(appRoot + '/server/api/member/controller.js')
const Op = MODELS.Op

var _ = {};

_.login = async (req) => {
  const manager = req.body
  return await MODELS.MANAGERS.findAll({
      raw: true,
      where: {
        CRYPTOGRAM: manager.CRYPTOGRAM,
        DEPART_CD:  manager.DEPART_DT,
        AUTH_TYPE:  manager.AUTH_TYPE
      }
    });
}

module.exports = _

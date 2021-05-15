const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')

var _ = {};

/*
_.getLastSubday = async () => {
  var query = [ 
    "select date(now() - interval (weekday( now()))% 7 + 1 day) 'lastSunday'"
    ].join('')
    
    result = await MODELS.sequelize.query(query, { 
       raw: true, 
       type: MODELS.Sequelize.QueryTypes.SELECT 
    })

    return result[0].lastSunday;
}
*/

_.getLastSubday = async () => {
    var query = [
        "select date(now() - interval (weekday( now()))% 7 + 1 day) 'lastSunday'"
    ].join('')

    result = await MODELS.sequelize.query(query, {
        raw: true,
        type: MODELS.Sequelize.QueryTypes.SELECT
    })

    return result[0].lastSunday;
}


module.exports = _
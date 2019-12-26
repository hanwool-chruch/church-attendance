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

/*
getAttList: $http.createGetRequestFn(PREFIX_API + "/list"),
getDetail: $http.createGetRequestFn(PREFIX_API + "/detail"),
save: function(pDt, musicInfo, etcMsg) {
  return $http.createPostRequestFn(PREFIX_API + "/detail/" + pDt, {
    musicInfo: musicInfo,
    etcMsg: etcMsg
  })();
},
saveInfo: function(pDt, musicInfo) {
  return $http.createPostRequestFn(PREFIX_API + "/info/" + pDt, {
    musicInfo: musicInfo
  })();
},
saveEtcMsg: function(pDt, etcMsg) {
  return $http.createPostRequestFn(PREFIX_API + "/massage/" + pDt, {
    etcMsg: etcMsg
  })();
},
        saveReport: function(pDt, report) {
  return $http.createPostRequestFn(PREFIX_API + "/report/" + pDt, {
    report: report
  })();
},
select: function(pDt, memberId, attYn) {
     switch (attYn) {
    case "Y":
      return $http.createPostRequestFn(PREFIX_API + "/deselect/" + pDt, {
        memberId: memberId
      })();
    case "N":
      return $http.createPostRequestFn(PREFIX_API + "/select/" + pDt, {
        memberId: memberId
      })();
  }
}
*/
//router.put("/etc_msg/:id", routes.saveEtcMsg);

//router.post("/select/:id", routes.select);
//router.delete("/deselect/:id", routes.deselect);

//app.get("/rest/att/:practiceDt/:practiceCd", routes.attInfoDetail);
//app.put("/rest/att/:practiceDt/:partCd/report", routes.saveReport);


module.exports = router

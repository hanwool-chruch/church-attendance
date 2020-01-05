const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')
const sequelize = MODELS.Sequelize

const memberCtl = require(appRoot + '/server/api/member/controller.js')
const Op = MODELS.Op

var _ = {};

_.getAllAttendances = async (req) => {
  const depart = req.depart
  return await MODELS.ATTENDANCES.findAll({
    raw: true,
    where: { DEPART_CD: depart },
    attributes: ['WORSHIP_DT', [sequelize.fn('COUNT', sequelize.col('*')), 'attendanceCnt']],
    group: ['WORSHIP_DT']
  });
}

_.attendanceList = async (req) => {
  const depart = req.depart
  const workshipDT = req.params.id;

  return await MODELS.ATTENDANCES.findAll({
    raw: true,
    where: { DEPART_CD: depart, WORSHIP_DT: workshipDT },
    attributes: ['WORSHIP_DT', 'MEMBER_ID']
  });
}

_.worshipList = async (req) => {
  const depart = req.depart 
  return await MODELS.WORSHIPS.findAll(
    {
      raw: true,
      where: {
        DEPART_CD: depart, 
        WORSHIP_DT: {
          [Op.lt]: new Date(),
        }
      },
      order: [["WORSHIP_DT", 'DESC']],
    }
  );
}

_.reportList = async (req) => {
  const depart = req.depart
  const workshipDT = req.params.id;
  
  return await MODELS.REPORTS.findAll(
    {
      raw: true,
      where: { DEPART_CD: depart, WORSHIP_DT: workshipDT  }
    }
  );
}

_.getAttendanceList = async (req) => {
  const depart = req.depart
	const worships = await _.worshipList(req)
	const attendances = await _.getAllAttendances(req)

  resultList = worships.map((worship) => {
    matchAttendance = attendances.find(attendance => attendance.WORSHIP_DT == worship.WORSHIP_DT)
    worship.attendanceCnt = (matchAttendance == undefined) ? 0 : matchAttendance.attendanceCnt;
    return worship
	})

	return resultList
}

_.getAttendanceDetail = async (req) => {
  const depart = req.depart
  const conditionWorkship = (req.params && req.params.id) ?  {WORSHIP_DT: req.params.id} : {};   

  const worship = await MODELS.WORSHIPS.findOne(
    {
      raw: true,
      where: {
          DEPART_CD: depart, 
          WORSHIP_DT: req.params.id
      }          
    }
  )

  const memberListWithPart = await memberCtl.memberListWithPart(req)
  const attendances = await _.attendanceList(req)
  const reports = await _.reportList(req)

  memberListWithPart.forEach(part => {
    if(part == undefined) return;
    if(part.memberList == undefined ) return;

    reports.forEach(report => {
      if(part.PART_CD == report.PART_CD){
        part.REPORT = report.REPORT
        return;
      }
    })

    part.memberList.forEach(member => {
      member.attYn = 'N';
      attendances.forEach(attendance => {
        if(member.MEMBER_ID == attendance.MEMBER_ID){
            member.attYn = 'Y'
            return
        }
      })
    })
  })

	return  {   		
    worship   : worship, 
    memberList: memberListWithPart, 
  }
}

_.updateWorshipTitle = async (req) => {
  const body = req.body
  const depart = req.depart
  const WORSHIP_DT = body.WORSHIP_DT;
  const title = body.TITLE;

  let data =  await MODELS.WORSHIPS.update({TITLE: title}, {
    where: { DEPART_CD: depart, WORSHIP_DT: WORSHIP_DT }
  });
  console.log(data);
  return data;
}

_.updateWorshipMessage = async (req) => {
  const body = req.body
  const depart = req.depart
  const WORSHIP_DT = body.WORSHIP_DT;
  const message = body.MESSAGE;

  return await MODELS.WORSHIPS.update({MESSAGE: message}, {
    where: { DEPART_CD: depart, WORSHIP_DT: WORSHIP_DT }
  });
}


_.updateReport = async (req) => {
  const body = req.body
  const depart = req.depart
  const WORSHIP_DT = body.WORSHIP_DT;
  const PART_CD = body.PART_CD;
  const REPORT = body.REPORT;
  
  await  MODELS.REPORTS.destroy({
    where: { DEPART_CD: depart, WORSHIP_DT: WORSHIP_DT, PART_CD: PART_CD }
  });

  return await MODELS.REPORTS.upsert({REPORT: REPORT, DEPART_CD: depart, WORSHIP_DT: WORSHIP_DT, PART_CD: PART_CD});
}

_.createAttendance = async (req) => {
  const body = req.body
  const WORSHIP_DT = body.WORSHIP_DT;
  const MEMBER_ID = body.MEMBER_ID;
  const depart = req.depart

  return await MODELS.ATTENDANCES.findOrCreate({
    raw: true,
    where: { DEPART_CD: depart, WORSHIP_DT: WORSHIP_DT, MEMBER_ID: MEMBER_ID}
  });
}

_.deleteAttendance = async (req) => {
  const body = req.body
  const WORSHIP_DT = body.WORSHIP_DT;
  const MEMBER_ID = body.MEMBER_ID;
  const depart = req.depart


  return await MODELS.ATTENDANCES.destroy({
    raw: true,
    where: { DEPART_CD: depart, WORSHIP_DT: WORSHIP_DT, MEMBER_ID: MEMBER_ID}
  });
}

module.exports = _

const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')
const Sequelize = MODELS.Sequelize


const memmberController = require(appRoot + '/server/api/member/controller.js')
const attendanceController = require(appRoot + '/server/api/attendance/controller.js')

var _ = {};

/* 장기 결석자 리스트 */
_.rankList = async (req) => {

  const depart = req.depart
  members = await memmberController.sortedNameList(req);
  attendances = await attendanceController.getAllAttendances(req);
  var memeber_results = [];

  members.map(function(member){
	member.times = new Date(member.createdAt).getTime();
  });

  attendances.map(function(attendance){
    attendance.total_count = 0;
    members.map(function(member){
      if( member.times < new Date(attendance.WORSHIP_DT).getTime() ){
        attendance.total_count += 1;
      }
    });
    memeber_results.push(attendance);
  });

  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()-1)
  var lastSunday = new Date(today.setDate(today.getDate()-today.getDay()))

  if(lastSunday != null)
	  last_worship = lastSunday.toISOString().slice(0, 10);

  var query1 = "SELECT GENDER_CD i, COUNT(*) c FROM members WHERE DEPART_CD = :depart GROUP BY GENDER_CD desc ";

  var query2 = [
    'SELECT GENDER_CD i, COUNT(*) c FROM members M, attendances A',
    ' WHERE  M.DEPART_CD = :depart AND M.MEMBER_ID = A.MEMBER_ID AND WORSHIP_DT=:worship_dt',
    ' GROUP BY M.GENDER_CD desc'
    ].join('')

  var query3 = [
    'SELECT P.PART_CD i, COUNT(M.PART_CD) c FROM members M, parts P ',
    ' WHERE M.DEPART_CD = :depart AND M.PART_CD = P.PART_CD ',
    ' GROUP BY M.PART_CD',
    ].join('')

  var query4 = [
    'SELECT P.PART_CD i, count(A.PART_CD) c FROM parts P left outer join',
    ' (SELECT M.MEMBER_ID, M.PART_CD FROM attendances A, members M ',
	' WHERE M.DEPART_CD = :depart AND M.MEMBER_ID = A.MEMBER_ID and A.WORSHIP_DT= :worship_dt) A',
	' ON P.PART_CD = A.PART_CD group by P.PART_CD order by P.PART_CD' 
    ].join('')

  total_gender = await MODELS.sequelize.query(query1, { raw: true, replacements: { depart: depart }, type: Sequelize.QueryTypes.SELECT})
  last_gender = await MODELS.sequelize.query(query2, { raw: true, replacements: { depart: depart, worship_dt: last_worship}, type: Sequelize.QueryTypes.SELECT})
  total_part = await MODELS.sequelize.query(query3, { raw: true, replacements: { depart: depart }, type: Sequelize.QueryTypes.SELECT})
  last_part = await MODELS.sequelize.query(query4, { raw: true, replacements: { depart: depart, worship_dt: last_worship }, type: Sequelize.QueryTypes.SELECT})
  
  part_list = await MODELS.PARTS.findAll(
    {
      raw: true,
      where: { DEPART_CD: depart }
    }
  )

  return {
	member: memeber_results,
	total_gender : total_gender, 
	last_gender : last_gender, 
	total_part : total_part, 
	last_part : last_part,
	part_list : part_list
  }
}



module.exports = _

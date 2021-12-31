const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')
const CODE = require(appRoot + '/server/api/common/code.js')
const CONFIG = require(appRoot + '/server/api/common/config.js')
const UTIL = require(appRoot + '/server/api/common/util.js')

const Sequelize = MODELS.Sequelize

const Upload = require('./upload.js')
const Excel = require('./excel.js')

const ruleLongAbsentee = '3 MONTH'
const ruleLatestAbsentee = '1 MONTH'
const Op = Sequelize.Op;

var _ = {};

const ATTRIBUTE = {
  MEMBER_LIST: ['MEMBER_TYPE', 'PHOTO', 'MEMBER_ID', 'MEMBER_NAME', 'PHONE_NO', 'BIRTHDAY', 'PART_CD', 'STATUS_CD', 'BAPTISM_CD', 'createdAt', 'GENDER_CD', 'MOTHER_PHONE', 'FATHER_PHONE'],
  MEMBER_JOIN: ['MEMBER_TYPE', 'PHOTO', 'M.MEMBER_ID', 'MEMBER_NAME', 'PHONE_NO', 'BIRTHDAY', 'PART_CD', 'STATUS_CD','DEPART_CD']
}

const covertMemberList = (member) => {

  if (member.PHONE_NO === "" || member.PHONE_NO === null || member.PHONE_NO == undefined)
    member.PHONE_NO = "010-0000-0000"
  if (member.BIRTHDAY === "" || member.BIRTHDAY === null || member.BIRTHDAY == undefined)
    member.BIRTHDAY = "0000-00-00"

  member.PHOTO_URL = (member.PHOTO == 0) ? "blank.png" : member.PHOTO + "?" + (Date.now());
  member.BIRTHDAY = member.BIRTHDAY.substr(2)
 // member.att_ratio = (member.att_ratio == null) ? 0: member.att_ratio

  return member
}

const covertAttendanceView = (member) => {
  CONFIG.ATTRIBUTE_RULE.map(function(rule) {
    if(member.att_ratio <= rule.max && member.att_ratio >= rule.min){
      return member.color = rule.color
    }
  })

  member.ATTENDANCE = member.att_ratio + "% (" + member.att_count + "/"+  member.weeks + ")" 
  return member
}

_.getMemberListWithAttendance = async (req) => {
  const depart = req.depart

  order = "att_ratio DESC"
  const last_sunday = await UTIL.getLastSubday();

  var query = [ 
    " SELECT " + ATTRIBUTE.MEMBER_JOIN.toString() + ", att_count, week(curdate()) weeks, ROUND((att_count/week(curdate())) * 100, 0) att_ratio"
    , " FROM "
    , "     (SELECT member.*, (ifnull (c_att, 0)) As att_count"
    , "        FROM members member LEFT OUTER JOIN"
    , "             (SELECT MEMBER_ID, COUNT(*) c_att"
    , "                FROM attendances WHERE WORSHIP_DT > '2021-01-01' AND  WORSHIP_DT <= :last_sunday"
    , "      GROUP BY MEMBER_ID) A"
    , "        ON member.MEMBER_ID = A.MEMBER_ID) M"
    , " WHERE DEPART_CD = :depart AND M.MEMBER_TYPE= :memberType "
    , " ORDER BY :order"
    ].join('')

    const members = await MODELS.sequelize.query(query, { 
      raw: true, 
      replacements: { depart: depart, order: order, memberType: CODE.MEMBER_TYPE.STUDENT, last_sunday: last_sunday },
      type: Sequelize.QueryTypes.SELECT,
    })

    return members
          .map(covertAttendanceView)
          .sort(function(a, b) {
            return b.att_ratio - a.att_ratio ;
          })
}

_.memberListWithPart = async (req) => {

  const depart = req.depart
  const PARTS = await MODELS.PARTS.findAll(
    {
      raw: true,
      where: {
        DEPART_CD: depart
      },
      order: [
        ['ORDERBY_NO', 'ASC']
      ],
    });
  
  lastIndex = PARTS.length;

  PARTS.push({
    PART_NAME : "선생님"
  })

  const members = await _.getMemberListWithAttendance(req)
  const teachers = await _.getTeacherList(req)
  
  let partList = PARTS.map(function (part) {
    part.memberList = [];
    return part
  })

  members
  .map(covertMemberList)
  .map(covertAttendanceView)
  .map((member) => {
    index = -1;

    for (i = 0; i < partList.length; i++) {
      if (member.PART_CD == partList[i].PART_CD)
        index = i;
    }   

    if (index > -1) partList[index].memberList.push(member);
  })
  
  teachers  
  .map(covertMemberList)
  .map((member) => {
    member.ATTENDANCE = member.BIRTHDAY
    partList[lastIndex].memberList.push(member);
  })

  return partList
}

_.sortedNameList = async (req) => {
  const depart = req.depart
  members = await MODELS.MEMBERS.findAll(
    {
      raw: true,
      where: {
        DEPART_CD: depart,
        MEMBER_TYPE: CODE.MEMBER_TYPE.STUDENT
      },
      order: [
        ['MEMBER_NAME', 'ASC']
      ],
      attributes: ATTRIBUTE.MEMBER_LIST
    })

  return members

}

_.allMemberList = async (req) => {
  const depart = req.depart
  return await MODELS.MEMBERS.findAll(
    {
      raw: true,
      where: {
        DEPART_CD: depart,
      },
      order: [
        ['MEMBER_NAME', 'ASC']
      ],
      attributes: ATTRIBUTE.MEMBER_LIST
    })
}

_.getTeacherList = async (req) => {
  const depart = req.depart
  return await MODELS.MEMBERS.findAll(
    {
      raw: true,
      where: {
        DEPART_CD: depart,
        [Op.or]: [ 
          {MEMBER_TYPE: CODE.MEMBER_TYPE.TEACHER},
          {MEMBER_TYPE: CODE.MEMBER_TYPE.MINISTER},
        ]
        
      },
      order: [
        ['MEMBER_NAME', 'ASC']
      ],
      attributes: ATTRIBUTE.MEMBER_LIST
    })
}

_.birthDayMemberList = async (req) => {
  const depart = req.depart
  return await MODELS.MEMBERS.findAll(
    {
      raw: true,
      order: [
        ['MEMBER_NAME', 'ASC']
      ],
      where: {
        [Op.and]: [{ DEPART_CD: depart }, Sequelize.where(
          Sequelize.fn("MONTH", Sequelize.col("BIRTHDAY")),
          Sequelize.fn("MONTH", Sequelize.fn("NOW"))
        )]
      },
      attributes: ATTRIBUTE.MEMBER_LIST
    })
}

_.needToMathPartMemberList = async (req) => {
  const depart = req.depart
  return await MODELS.MEMBERS.findAll(
    {
      raw: true,
      order: [
        ['MEMBER_NAME', 'ASC']
      ],
      where: {
        DEPART_CD: depart,
        PART_CD: 0,
        MEMBER_TYPE: CODE.MEMBER_TYPE.STUDENT
      },
      attributes: ATTRIBUTE.MEMBER_LIST
    })
}

_.needMoreInformation = async (req) => {
  const depart = req.depart
  return await MODELS.MEMBERS.findAll(
    {
      raw: true,
      order: [
        ['MEMBER_NAME', 'ASC']
      ],
      where: {
        DEPART_CD: depart,
        [Op.or]: [
          { BIRTHDAY: '' }, 
          { GENDER_CD: 3 },
          {[Op.and]: [ {PHONE_NO:''}, {MOTHER_PHONE:''}, {FATHER_PHONE:''}]}
        ]
      },
      attributes: ATTRIBUTE.MEMBER_LIST
    })
}

_.getPromotedStudents = async (req) => {
    const depart = req.depart
    const result = await MODELS.MEMBERS.findAll(
        {
            raw: true,
            order: [
                ['MEMBER_NAME', 'ASC']
            ],
            where: {
                DEPART_CD: depart,
                await: 1,
                MEMBER_TYPE: CODE.MEMBER_TYPE.STUDENT
            },
            attributes: ATTRIBUTE.MEMBER_LIST
        });
    return result;
}

/* 장기 결석자 리스트 */
_.longAbsenteeList = async (req) => {
  const depart = req.depart
  var query = [
    'SELECT * FROM ( ' +
    ' SELECT ' + ATTRIBUTE.MEMBER_JOIN.toString() + ', count(A.MEMBER_ID) cnt FROM members M ',
    ' LEFT JOIN',
    ' (SELECT MEMBER_ID from attendances WHERE DEPART_CD = :depart AND WORSHIP_DT BETWEEN DATE_ADD(NOW(),INTERVAL-'+ ruleLongAbsentee +' ) AND NOW()) A ',
    ' ON M.MEMBER_ID = A.MEMBER_ID ',
    ' group by M.MEMBER_ID HAVING count(A.MEMBER_ID) = 0) J',
    ' WHERE J.DEPART_CD = :depart AND J.MEMBER_TYPE= :memberType '
  ].join('')

  return await MODELS.sequelize.query(query, { 
    raw: true, 
    replacements: { depart: depart, memberType: CODE.MEMBER_TYPE.STUDENT }, 
    type: Sequelize.QueryTypes.SELECT 
  })
}

/* 최근 결석자 리스트 */
_.latestAbsenteeList = async (req) => {
  const depart = req.depart
  var query = [
    'SELECT * FROM ( ' +
    ' SELECT ' + ATTRIBUTE.MEMBER_JOIN.toString() + ', count(A.MEMBER_ID) cnt FROM members M ',
    ' LEFT JOIN',
    ' (SELECT MEMBER_ID from attendances WHERE DEPART_CD = :depart AND WORSHIP_DT BETWEEN DATE_ADD(NOW(),INTERVAL-'+ ruleLatestAbsentee +' ) AND NOW()) A ',
    ' ON M.MEMBER_ID = A.MEMBER_ID group by M.MEMBER_ID HAVING count(A.MEMBER_ID) = 0) J',
    ' WHERE J.DEPART_CD = :depart AND J.MEMBER_TYPE= :memberType',
  ].join('')

  return await MODELS.sequelize.query(query, { 
    raw: true, 
    replacements: { depart: depart, memberType: CODE.MEMBER_TYPE.STUDENT }, 
    type: Sequelize.QueryTypes.SELECT 
  })
}

/* 셰례 대상자 리스트 */
_.baptismList = async (req) => {

  const overMiddle = [6, 7, 10]
  const depart = req.depart

  checkBaptism = (overMiddle.includes(depart)) ? CODE.BAPTISM.BAPTISM : CODE.BAPTISM.INFANT

  return await MODELS.MEMBERS.findAll(
    {
      raw: true,
      order: [
        ['MEMBER_NAME', 'ASC']
      ],
      where: {
        DEPART_CD: depart,
        MEMBER_TYPE: CODE.MEMBER_TYPE.STUDENT,
        BAPTISM_CD: {
          [Sequelize.Op.ne]: checkBaptism
        }
      },
      attributes: ATTRIBUTE.MEMBER_LIST
    })
}

_.insertMember = async (req) => {
  const member = req.body
  const depart = req.depart

  member.DEPART_CD = depart

  return await MODELS.MEMBERS.create(
    member,
    {
      returning: true
    })
}

_.updateMember = async (req) => {
  const member = req.body
  const depart = req.depart

  return await MODELS.MEMBERS.update(
    member,
    {
      where: { DEPART_CD: depart, MEMBER_ID: member.MEMBER_ID },
      returning: true
    })
}

_.deleteMember = async (req) => {
  const memberID = req.params.memberID
  const depart = req.depart

  return await MODELS.MEMBERS.destroy(
    {
      where: { DEPART_CD: depart, MEMBER_ID: memberID },
      returning: true
    })
}

_.detailMember = async (req) => {
  const memberID = req.params.memberID
  const depart = req.depart
  let member = await MODELS.MEMBERS.findOne(
    {
      raw: true,
      where: { DEPART_CD: depart, MEMBER_ID: memberID }
    })

  return member
};

_.updatePart = async (req) => {
  const data = req.body
  const depart = req.depart

  return await MODELS.MEMBERS.update(
    {
      PART_CD: data.PART_CD
    },
    {
      where: { DEPART_CD: depart,  MEMBER_ID: data.MEMBER_ID },
      returning: true
    })
}

_.getHistory = async (req) => {
  const depart = req.depart
  const memberID = req.params.memberID;

  return await MODELS.HISTORYS.findAll(
  {
    raw: true,
    where: { MEMBER_ID: memberID },
    order: [
      ['createdAt', 'DESC']
    ],
  })
}

_.attendances = async (req) => {
  const depart = req.depart
  const member_id = req.params.memberID;

  const last_sunday = await UTIL.getLastSubday();
  var query = [
    "SELECT DATE_FORMAT(W.WORSHIP_DT, '%m-%d') WORSHIP_DT, if (isnull (A.MEMBER_ID), 0, 1) att_check"
   ," FROM worships W"
   ," LEFT OUTER JOIN "
   ,"       (SELECT * FROM attendances where MEMBER_ID= :member_id ) A "
   ,"       ON W.WORSHIP_DT = A.WORSHIP_DT"
   ," WHERE W.WORSHIP_DT <= :lastSunday AND W.WORSHIP_DT > '2021-01-01' AND  W.DEPART_CD = :depart"
  ].join('')

  return await MODELS.sequelize.query(query, { 
    raw: true, 
    replacements: { 
      depart: depart, 
      member_id: member_id, 
      lastSunday: last_sunday
    }, 
    type: Sequelize.QueryTypes.SELECT 
  })
}

_.uploadPhoto = async (req) => {
  let filename = await Upload.upload(req)
  req.filename = filename
  await _.updateMemberImageFlag(req)
  return filename
}

_.updateMemberImageFlag = async (req) => {
  const filename = req.filename
  const depart = req.depart
  const memberID = req.params.memberID

  return await MODELS.MEMBERS.update(
    {PHOTO: filename},
    {
      where: { DEPART_CD: depart, MEMBER_ID: memberID },
      returning: true
    })
}


_.downLoadExcel = async (req) => {

  const depart = req.depart
	var query = [
	' SELECT '
	,' T.MEMBER_ID 고유번호,'
	,' P.PART_NAME 반명,'
	,' P.TEACHER_NAME 반선생님,'
	,' T.MEMBER_NAME 이름, C1.NAME 성별, T.BIRTHDAY 생일,'
	,' C2.NAME 세례여부, C3.NAME 출석상태, ROUND((att_count / weeks) * 100, 0) 출석율, CONCAT(att_count,"/",weeks) 출석기록,'
	,' T.SCHOOL 학교, T.PHONE_NO 전화번호, T.ADDRESS 주소,'
	,' T.MOTHER_NAME 엄마이름, T.MOTHER_PHONE 엄마휴대폰, T.FATHER_NAME 아빠이름, T.FATHER_PHONE 아빠번호,'
	,' T.ETC_MSG 기타내용, T.createdAt 등록일'
	,' FROM '
	,'	(SELECT '
	,'			M.*, '
	,'					(IFNULL(c_att, 0)) AS att_count, '
	,'					WEEK(CURDATE())  weeks '
	,'	FROM '
	,'			members M '
	,'	LEFT OUTER JOIN (SELECT '
	,'			MEMBER_ID, COUNT(*) c_att '
	,'	FROM '
	,'			attendances '
	,'	GROUP BY MEMBER_ID) A ON M.MEMBER_ID = A.MEMBER_ID) T '
	,' LEFT OUTER JOIN parts P ON P.PART_CD = T.PART_CD '
	,' LEFT OUTER JOIN codes C1 ON C1.CODE_ID = T.GENDER_CD AND C1.KIND = "GENDER"'
	,' LEFT OUTER JOIN codes C2 ON C2.CODE_ID = T.BAPTISM_CD AND C1.KIND = "BAPTISM"'
    ,' LEFT OUTER JOIN codes C3 ON C3.CODE_ID = T.STATUS_CD  AND C1.KIND = "STATUS"'
    ,' WHERE T.DEPART_CD = :depart AND MEMBER_TYPE = 1 '
	,' ORDER BY 반명, 출석율 DESC'
	].join('')
  
  members = await MODELS.sequelize.query(query, { 
     raw: true, 
     replacements: { depart: depart },
     type: Sequelize.QueryTypes.SELECT 
  })

  return await Excel.createExcel(members, depart)
}

module.exports = _
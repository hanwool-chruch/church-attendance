const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')
const Sequelize = MODELS.Sequelize

const ruleLongAbsentee = '3 MONTH'
const ruleLatestAbsentee = '1 MONTH'
const Op = Sequelize.Op;

var _ = {};

const ATTRIBUTE = {
  MEMBER_LIST: ['PHOTO', 'MEMBER_ID', 'MEMBER_NAME', 'PHONE_NO', 'BIRTHDAY', 'PART_CD', 'STATUS_CD', 'BAPTISM_CD', 'createdAt']
}

const covertMemberList = (member) => {

  if (member.PHONE_NO === "" || member.PHONE_NO === null || member.PHONE_NO == undefined)
    member.PHONE_NO = "010-0000-0000"
  if (member.BIRTHDAY === "" || member.BIRTHDAY === null || member.BIRTHDAY == undefined)
    member.BIRTHDAY = "0000-00-00"

  if (member.PHOTO == undefined) member.PHOTO = "default-man.jpg";

  member.BIRTHDAY = member.BIRTHDAY.substr(2)

  return member
}

_.memberListWithPart = async (req) => {

  const depart = req.depart
  const PARTS = await MODELS.PARTS.findAll(
    {
      raw: true,
      where: {
        DEPART_CD: depart
      }
    });

  const members = await _.sortedNameList(req)

  let partList = PARTS.map(function (part) {
    part.memberList = [];
    return part
  })

  members
    .map(covertMemberList)
    .map((member) => {
      index = -1;

      for (i = 0; i < partList.length; i++) {
        if (member.PART_CD == partList[i].PART_CD)
          index = i;
      }

      if (index > -1) partList[index].memberList.push(member);
    })

  return partList
}

_.sortedNameList = async (req) => {
  const depart = req.depart
  return await MODELS.MEMBERS.findAll(
    {
      raw: true,
      where: {
        DEPART_CD: depart
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
        PART_CD: 0
      },
      attributes: ATTRIBUTE.MEMBER_LIST
    })
}

/* 장기 결석자 리스트 */
_.longAbsenteeList = async (req) => {
  const depart = req.depart
  var query = [
    'SELECT * FROM ( ' +
    ' SELECT M.MEMBER_NAME, M.MEMBER_ID, M.PHONE_NO, M.BIRTHDAY, M.PART_CD, STATUS_CD, M.DEPART_CD, count(A.MEMBER_ID) cnt FROM members M ',
    ' LEFT JOIN',
    ' (SELECT MEMBER_ID from attendances WHERE DEPART_CD = :depart AND WORSHIP_DT BETWEEN DATE_ADD(NOW(),INTERVAL-3 MONTH ) AND NOW()) A ',
    ' ON M.MEMBER_ID = A.MEMBER_ID  group by M.MEMBER_ID HAVING count(A.MEMBER_ID) = 0) J',
    ' WHERE J.DEPART_CD = :depart'
  ].join('')

  return await MODELS.sequelize.query(query, { raw: true, replacements: { depart: depart }, type: Sequelize.QueryTypes.SELECT })
}

/* 최근 결석자 리스트 */
_.latestAbsenteeList = async (req) => {
  const depart = req.depart
  var query = [
    'SELECT * FROM ( ' +
    ' SELECT M.MEMBER_NAME, M.MEMBER_ID, M.PHONE_NO, M.BIRTHDAY, M.PART_CD, STATUS_CD, M.DEPART_CD, count(A.MEMBER_ID) cnt FROM members M ',
    ' LEFT JOIN',
    ' (SELECT MEMBER_ID from attendances WHERE DEPART_CD = :depart AND WORSHIP_DT BETWEEN DATE_ADD(NOW(),INTERVAL-1 MONTH ) AND NOW()) A ',
    ' ON M.MEMBER_ID = A.MEMBER_ID  group by M.MEMBER_ID HAVING count(A.MEMBER_ID) = 0) J',
    ' WHERE J.DEPART_CD = :depart',
  ].join('')

  return await MODELS.sequelize.query(query, { raw: true, replacements: { depart: depart }, type: Sequelize.QueryTypes.SELECT })
}

/* 셰례 대상자 리스트 */
_.baptismList = async (req) => {

  const overMiddle = ["middle", "high"]
  const depart = req.depart

  if (overMiddle.includes(depart)) {
    checkBaptism = "BAPTISM"
  }
  else {
    checkBaptism = "INFANT"
  }

  return await MODELS.MEMBERS.findAll(
    {
      raw: true,
      order: [
        ['MEMBER_NAME', 'ASC']
      ],
      where: {
        DEPART_CD: depart,
        BAPTISM_CD: {
          [Sequelize.Op.ne]: checkBaptism
        }
      },
      attributes: ATTRIBUTE.MEMBER_LIST
    })
}

_.insertMember = async (req) => {

  const member = req.body.member

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
  const memberID = req.params.mermberID
  const depart = req.depart

  return await MODELS.MEMBERS.destroy(
    {
      where: { DEPART_CD: depart, MEMBER_ID: memberID },
      returning: true
    })
}

_.detailMember = async (req) => {
  const memberID = req.params.mermberID
  const depart = req.depart
  const member = await MODELS.MEMBERS.findOne(
    {
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

module.exports = _
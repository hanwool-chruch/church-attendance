var appRoot = require('app-root-path')
var MODELS = require(appRoot + '/models')
const Sequelize = MODELS.Sequelize

const ruleLongAbsentee = '3 MONTH'
const ruleLatestAbsentee = '1 MONTH'

var _ = {};

const ATTRIBUTE = {
	MEMBER_LIST : ['MEMBER_ID', 'MEMBER_NAME', 'PHONE_NO', 'BIRTHDAY', 'PART_CD', 'STATUS_CD', 'BAPTISM_CD']
}

const covertMemberList = (member) => {
    
    if(member.PHONE_NO === "" || member.PHONE_NO === null || member.PHONE_NO == undefined)
        member.PHONE_NO = "010-0000-0000"
    if(member.BIRTHDAY === "" || member.BIRTHDAY === null || member.BIRTHDAY == undefined)
        member.BIRTHDAY = "0000-00-00"

    member.BIRTHDAY = member.BIRTHDAY.substr(2)

    return member
}

_.memberListWithPart = async () => {
	const PARTS = await MODELS.PARTS.findAll({raw: true});
	const members = _.sortedMemberList();
	
    let partList = PARTS.map(function(part){
        part.memberList = [];
        return part
    })

	return members
			.map(covertMemberList)
			.map((member) => {
				index = -1;

				for(i=0; i < partList.length; i++ ){
					if(member.PART_CD == partList[i].PART_CD)
						index = i; 
				}

				if(index > -1) partList[index].memberList.push(member);
			})
	}

_.sortedMemberList = async () => {
	return await MODELS.MEMBERS.findAll(
	{
		raw: true,
		order: [
			['MEMBER_NAME', 'ASC']
		],
		attributes: ATTRIBUTE.MEMBER_LIST
	})
}

_.birthDayMemberList = async () => {
	return await MODELS.MEMBERS.findAll(
	{
		raw: true,
		order: [
			['MEMBER_NAME', 'ASC']
		],
		where: Sequelize.where(
			Sequelize.fn("MONTH", Sequelize.col("BIRTHDAY")),
			Sequelize.fn("MONTH", Sequelize.fn("NOW"))
		),
		attributes: ATTRIBUTE.MEMBER_LIST
	})
}

/* 장기 결석자 리스트 */
_.longAbsenteeList = async () => {
	var query = [  
	'SELECT M.MEMBER_ID, MEMBER_NAME, PHONE_NO, BIRTHDAY, PART_CD, STATUS_CD, BAPTISM_CD',
	'  FROM MEMBERS M',
	'  LEFT JOIN (', 
	'    SELECT * from ATTENDANCES ',
	'     WHERE WORSHIP_DT BETWEEN DATE_ADD(NOW(),INTERVAL-'+ ruleLongAbsentee +' ) AND NOW()) A',
	'        ON M.MEMBER_ID = A.MEMBER_ID',
	'    GROUP BY M.MEMBER_ID',
	'    HAVING count(A.MEMBER_ID) = 0'
	].join('')

	return await MODELS.sequelize.query(query)
}

/* 최근 결석자 리스트 */
_.latestAbsenteeList = async () => {
	var query = [  
	'SELECT M.MEMBER_ID, MEMBER_NAME, PHONE_NO, BIRTHDAY, PART_CD, STATUS_CD, BAPTISM_CD',
	'  FROM MEMBERS M',
	'  LEFT JOIN (', 
	'    SELECT * from ATTENDANCES ',
	'     WHERE WORSHIP_DT BETWEEN DATE_ADD(NOW(),INTERVAL-'+ ruleLatestAbsentee +' ) AND NOW()) A',
	'        ON M.MEMBER_ID = A.MEMBER_ID',
	'    GROUP BY M.MEMBER_ID',
	'    HAVING count(A.MEMBER_ID) = 0'
	].join('')
	
	return await MODELS.sequelize.query(query)
}

/* 셰례 대상자 리스트 */
_.baptismList = async () => {

	const overMiddle = ["middle", "high"]

	db_type = "INFANT"

	if( overMiddle.includes(db_type) ) {
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
			BAPTISM_CD: {
				[Sequelize.Op.ne]: checkBaptism
			}
		},
		attributes: ATTRIBUTE.MEMBER_LIST
	})
}

_.insertMember = async (member) => {
	return await MODELS.MEMBERS.create(
		member,
	{
		returning: true
	})
}

_.updateMember = async (member) => {
	return await MODELS.MEMBERS.update(
		member,
	{
		where: { MEMBER_ID : member.MEMBER_ID }, 
		returning: true
	})
}

_.deleteMember = async (member) => {
	return await MODELS.MEMBERS.destroy(
	{
		where: { MEMBER_ID : member.MEMBER_ID }, 
		returning: true
	})
}

_.detailMember = function(member_id) {	
	const member = await MODELS.MEMBERS.findOne(
	{
		where: { MEMBER_ID : member_id }
	})
	
	return member
};

module.exports = _
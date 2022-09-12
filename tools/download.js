const appRoot = require('app-root-path')
const downloadPath = appRoot + "/app/downloads";
const CONFIG = require(appRoot + '/server/api/common/config.js')
const excel = require('excel4node')
const MODELS = require(appRoot + '/models')

const _ ={};
_.createExcel = async function(members, type) {

	var workbook = new excel.Workbook({
		defaultFont: {
			size: 11,
			name: '맑은 고딕'
		},
		defaultBorder: {
			left: {
				style: "thin",
				color: "#222222"
			},
			right: {
				style: "thin",
				color: "#222222"
			},
			top: {
				style: "thin",
				color: "#222222"
			},
			bottom: {
				style: "thin",
				color: "#222222"
			},
			outline: true
		}
	});

	const boldSytle = workbook.createStyle({
		font: {
			bold: true,
		}
	});

	const fitSytle = workbook.createStyle({
		alignment: {
			shrinkToFit: true,
		}
	});

	// Add Worksheets to the workbook
	var worksheet = workbook.addWorksheet('members');

	rIndex = 1

	if(members != null && members.length > 0){
		cIndex = 1
		for( var key in members[0] ) {
			worksheet.cell(rIndex, cIndex).string(key).style(boldSytle);
			cIndex++
		}
		rIndex++
	}


	members.map(function(member){
		cIndex = 1
		style_color = ""

		CONFIG.ATTRIBUTE_RULE.map(function(rule) {
			if(member["출석율"] <= rule.max && member["출석율"] >= rule.min){
				style_color = rule.color
			}
		})

		for( var key in member ) {
			value = (member[key] != null) ? member[key] :  member[key] = "";

			if(value == "")
			{
				if(key == "출석상태" || key == "세례여부")
				{
					value = "정보없음"
				}
			}

			if(key == "출석율"){
				value = value + "%"
			}

			if( typeof value == "string" ){
				if(key == "출석율"){
					if(style_color == undefined || style_color == "")  style_color = "#007bff"

					worksheet.cell(rIndex, cIndex).string(value).style({font: {color: style_color, bold: true}})
				}
				else{
					worksheet.cell(rIndex, cIndex).string(value).style(fitSytle)
				}
			}

			if( typeof value == "number" ){
				worksheet.cell(rIndex, cIndex).number(value).style(fitSytle)
			}

			if( typeof value == "object" ){
				worksheet.cell(rIndex, cIndex).date(value).style({numberFormat: 'yyyy-mm-dd'}).style(fitSytle)
			}
			cIndex++
		}
		rIndex++
	});

	var save_file = downloadPath + '/전체명단_전체.xlsx';
	await workbook.write(save_file)
	return save_file
};


_.downLoadExcel = async () => {

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
		,'					(WEEK(CURDATE()) - WEEK(createdAt)) weeks '
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
		,' WHERE MEMBER_TYPE = 1 '
		,' ORDER BY 반명, 출석율 DESC'
	].join('')
	console.log(query)
	members = await MODELS.sequelize.query(query, {
		raw: true,
		replacements: {},
		type: Sequelize.QueryTypes.SELECT
	})

	return await _.createExcel(members, depart)
}

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
	,'					(WEEK(CURDATE()) - WEEK(createdAt)) weeks '
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
	,' WHERE MEMBER_TYPE = 1 '
	,' ORDER BY 반명, 출석율 DESC'
].join('')
console.log(query)

let promise = _.downLoadExcel().then((blob) => {
	console.log("d");
})
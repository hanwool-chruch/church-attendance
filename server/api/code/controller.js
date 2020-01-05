const appRoot = require('app-root-path')
const MODELS = require(appRoot + '/models')
const Sequelize = MODELS.Sequelize

var _ = {};

const ATTRIBUTE = {
	MEMBER_LIST: ['MEMBER_ID', 'MEMBER_NAME', 'PHONE_NO', 'BIRTHDAY', 'PART_CD', 'STATUS_CD', 'BAPTISM_CD']
}

_.codeList = async (req) => {
	
	const depart = req.depart

	const CODES = await MODELS.CODES.findAll({ 
		raw: true,    
		order: [
			['CODE_ID', 'ASC']
		], 
	})

	const PARTS = await MODELS.PARTS.findAll(
		{
			raw: true,
			where: {
				DEPART_CD: depart
			}
		}
	);

	let partList = [], baptismList = [], statusList = [], genderList = [];

	CODES.map((code) => {
		switch (code.KIND) {
			case "BAPTISM":
				baptismList.push(code);
				break;
			case "GENDER":
				genderList.push(code);
				break;
			case "STATUS":
				statusList.push(code);
				break;
		}
	})

	return {
		partList: PARTS,
		baptismList: baptismList,
		genderList: genderList,
		statusList: statusList
	}
}

module.exports = _

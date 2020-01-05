const appRoot = require('app-root-path')
const downloadPath = appRoot + "/app/downloads";
const CONFIG = require(appRoot + '/server/api/common/config.js')
const excel = require('excel4node')

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
	
	var save_file = downloadPath + '/전체명단_' + CONFIG.PART_LIST[type] + '.xlsx';
	await workbook.write(save_file)
	return save_file
};

module.exports = _
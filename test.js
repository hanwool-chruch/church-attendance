// Require library
var excel = require('excel4node');
var db_config = {};

const mysql = require('mysql');
const async = require('async');


const Q = require('q');
const multer = require('multer');
const Sharp = require('sharp');

const DB_LIST = ['infant','child','kindergarten','preschool','elementary','middle','high', 'english'];


var db = {};

/* 
	Heroku 서비스 mysql 이용시 필수
	무료 티어로 mysql 이용시 접속이 수시로 끊기기 때문에 재접속 해줘야 함
*/
function handleDisconnect(type) {

	db[type] = {};

	db[type] = mysql.createConnection(db_config[type]);

	db[type].connect(function(err) {
		if (err) {
			setTimeout(handleDisconnect, 2000);
		}
		
		/*db[type].query("set time_zone = 'Asia/Seoul'", {}, function(err, rows){
		});*/

	});
	
	db[type].on('error', function(err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDisconnect();
		} else {
			throw err;
		}
	});
}


DB_LIST.map(function(db_name) {
	db_config[db_name] = {
			host     : '34.85.14.32',
			database : 'db_' + db_name
	};

	handleDisconnect(db_name);	//최초 DB 접속

});


function getDBConnector(db_type)
{
	if (db[db_type] == undefined || db[db_type] == null  )
	{
		handleDisconnect(db_type);
	}else{
		return db[db_type];
	}
}


var db = getDBConnector('infant');

var query1 = [ 
" SELECT *, att_count, weeks, ROUND((att_count/weeks) * 100, 0) att_ratio "
, " FROM "
, "     (SELECT M.*, (ifnull (c_att, 0)) As att_count, (week(curdate()) - week(REG_DT)) weeks"
, "        FROM CHOIR_MEMBER M LEFT OUTER JOIN "
, "             (SELECT MEMBER_ID, COUNT(*) c_att "
, "                FROM CHOIR_ATTENDANCE "
, "      GROUP BY MEMBER_ID) A "
, "        ON M.MEMBER_ID = A.MEMBER_ID) T "
, " ORDER BY PART_CD, att_ratio DESC limit 1"
].join('')


// Create a new instance of a Workbook class
var workbook = new excel.Workbook();

// Add Worksheets to the workbook
var worksheet = workbook.addWorksheet('Sheet 1');

// Create a reusable style
var style = workbook.createStyle({
  font: {
    color: '#FF0800',
    size: 12
  },
  numberFormat: '$#,##0.00; ($#,##0.00); -'
});

db.query(query1, [], function(err, rows){	
	console.log(err)
	if(typeof rows === 'object') {
		members = rows.map(row => {
			if(row.PHONE_NO === "" || row.PHONE_NO === null)
				row.PHONE_NO = row.MOTHER_PHONE;
			
			return row;
		});				

		console.log(rows)
    rIndex = 1

    if(members != null && members.length > 0){
      for( var key in member ) {
        worksheet.cell(rIndex, cIndex).string(key)
        cIndex++
        rIndex++
        break;
      }      
    }
    
		members.map(function(member){
      cIndex = 1     

			for( var key in member ) {					
        console.log(key)
        if
				worksheet.cell(rIndex, cIndex).string(member[key])
				cIndex++
			}
			rIndex++
		});
		
		workbook.write('woong.xlsx');

	}
});

/*
// Set value of cell A1 to 100 as a number type styled with paramaters of style
worksheet.cell(1,1).number(100).style(style);

// Set value of cell B1 to 300 as a number type styled with paramaters of style
worksheet.cell(1,2).number(200).style(style);

// Set value of cell C1 to a formula styled with paramaters of style
worksheet.cell(1,3).formula('A1 + B1').style(style);

// Set value of cell A2 to 'string' styled with paramaters of style
worksheet.cell(2,1).string('string').style(style);

// Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
worksheet.cell(3,1).bool(true).style(style).style({font: {size: 14}});
*/




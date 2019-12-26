var db_config = {};

const mysql = require('mysql');
const async = require('async');    // 콜백 지옥에서 벗어나기 위한 모듈


const Q = require('q');
const multer = require('multer');
const Sharp = require('sharp');
const path = require('path');
const mime = require('mime');
const fs = require('fs');


const DB_LIST = ['infant','child','kindergarten','preschool','elementary','middle','high', 'english'];
const PART_LIST = {
	'infant': '영아부',
	'child': '유아부',
	'kindergarten': '유치부',
	'preschool': '유년부',
	'elementary': '초등부',
	'middle': '중등부',
	'high': '고등부',
	'english': '영어예배'
};

const excel = require('excel4node');

const ATT_RULE = [
	{max: 100, min: 81, color: "#007bff"},
	{max:  80, min: 61, color: "#28a745"},
	{max:  60, min: 41, color: "#ffc107"},
	{max:  40, min:  0, color: "#dc3545"}
];

const ATT_RULE2 = {
	'infant': [],
	'child': ['B1', 'B2', 'B3', 'B4'],
	'kindergarten': ['LOVE1', 'LOVE2', 'LOVE3', 'LOVE4', 'LOVE5'],
	'preschool': ['LOVE1', 'LOVE2', 'LOVE3', 'LOVE4', 'LOVE5'],
	'elementary': ['6-1','6-2','6-3','6-4'],
	'middle': ['7', '8', '9', '91'],
	'high': ['6', '7', '8'],
	'english': [],
};


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
		
		db[type].query("set time_zone = 'Asia/Seoul'", {}, function(err, rows){
		});

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
			user     : 'woong',
			password : 'gksksladmlwksu!',
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


exports.calendar = function(req, res) {
	
	var db = getDBConnector(req.db_type);

	var query1 = "SELECT WORSHIP_DT start, INFO title FROM CHOIR_WORSHIP";
	var query2 = "SELECT BIRTHDAY start, CONCAT(MEMBER_NM, '생일') title FROM members where BIRTHDAY != '' ";

	async.parallel({
    	worship_event : function(callback) {
    		db.query(query1, [], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	member_event: function(callback) {
    		db.query(query2, [], function(err, rows){
    			callback(null, rows);
    		});
    	} 
    }, function(err, results) {
    	res.send({
    		worship : results.worship_event, 
    		member : results.member_event
    	});
  });
};


/* 
	출석순위

	교회의 결산 주기는 전년도 12월부터 올해 11월까지임.
	데이터는 결산주기에 맞춰서 표시됨.

	추후 과거 데이터도 볼 수 있도록 개선할 예정임
*/
exports.rank = function(req, res) {

	var db = getDBConnector(req.db_type);
	var results = [];
	
	async.waterfall([
		function(callback) {
			db.query("SELECT WORSHIP_DT, count(*) att_count FROM attendances group by WORSHIP_DT order by WORSHIP_DT", [], function(err, attendances){	
				callback(null, attendances);
			});
		}, function(attendances, callback) {			
				db.query("SELECT MEMBER_NM, MEMBER_ID memberId, REG_DT FROM members", [], function(err, members) {
					
					members.map(function(member){
						member.times = new Date(member.REG_DT).getTime();
					});

					attendances.map(function(attendance){
						attendance.total_count = 0;
						members.map(function(member){
							if( member.times < new Date(attendance.WORSHIP_DT).getTime() ){
								attendance.total_count += 1;
							}
						});
						results.push(attendance);
					});

					callback(results);
				});	
		}
	], function(member_results) {		
				
			var now = new Date();
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()-1);
			var lastSunday = new Date(today.setDate(today.getDate()-today.getDay()))						
			if(lastSunday!=null)
				last_worship = lastSunday.toISOString().slice(0, 10);

			//SELECT WORSHIP_DT FROM attendances order by WORSHIP_DT desc limit 1;
			var query1 = "SELECT GENDER_CD i, COUNT(*) c FROM members group by GENDER_CD desc ";
			var query2 = "SELECT GENDER_CD i, COUNT(*) c FROM members M, attendances A where M.MEMBER_ID = A.MEMBER_ID and WORSHIP_DT=? group by M.GENDER_CD desc"
			var query3 = "SELECT p.PART_NM i, COUNT(m.PART_CD) c FROM members m, CHOIR_PART p where m.PART_CD = p.PART_CD group by m.PART_CD";

			var query4 = "SELECT p.PART_NM i, COUNT(M.PART_CD) c FROM members M, attendances A, CHOIR_PART p where M.MEMBER_ID = A.MEMBER_ID and M.PART_CD = p.PART_CD and WORSHIP_DT=? group by M.PART_CD"
			var query4 = "SELECT PART_NM i, count(A.PART_CD) c FROM CHOIR_PART P left outer join (SELECT M.MEMBER_ID, M.PART_CD" 
								 + " from attendances A, members M " 
                 + " where M.MEMBER_ID = A.MEMBER_ID and A.WORSHIP_DT=?) A ON P.PART_CD = A.PART_CD group by P.PART_CD order by P.PART_CD";                


			async.parallel({
			total_gender : function(callback) {
				db.query(query1, [], function(err, rows){
					callback(null, rows);
				});
			},
			last_gender: function(callback) {
				db.query(query2, [last_worship], function(err, rows){
					callback(null, rows);
				});
			},
			total_part: function(callback) {
				db.query(query3, [], function(err, rows){
					callback(null, rows);
				});
			},
			last_part: function(callback) {
				db.query(query4, [last_worship], function(err, rows){
					callback(null, rows);
				});
			}
		}, function(err, results) {
			res.send({
				member: member_results,
				total_gender : results.total_gender, 
				last_gender : results.last_gender, 
				total_part : results.total_part, 
				last_part : results.last_part 
			});
		});
	});



};


/* 연습정보 목록 */
exports.attList = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var page = req.params.page;
	var size = 50;
	var sRow = (page-1) * size;
	
	var query =
        "SELECT "+
        "	    i.WORSHIP_DT practiceDt,  "+
        "	    i.WORSHIP_CD practiceCd,  "+
        "	    i.INFO info,  "+
        "	    i.ETC_MSG etcMsg,  "+
				"	    CONCAT('주일예배') practiceNm, "+
				"	    i.LOCK_YN lockYn, "+
        "	    (SELECT COUNT(*) FROM attendances a WHERE a.WORSHIP_DT=i.WORSHIP_DT) attendanceCnt "+
        "  FROM CHOIR_WORSHIP i "+
        " WHERE DATE(i.WORSHIP_DT) < date_add(NOW(), interval +4 day) "+
        " ORDER BY i.WORSHIP_DT DESC Limit ?,?";

	db.query(query, [sRow, size], function(err, rows){
		res.send(rows);
	});
};

/* 연습정보 상세(출석정보 포함) */
exports.attInfoDetail = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;

	var query1 =
        "SELECT "+
        "	    i.WORSHIP_DT practiceDt,  "+
        "	    i.WORSHIP_CD practiceCd,  "+
        "	    i.INFO info,  "+
        "	    i.ETC_MSG etcMsg,  "+
        "	    i.LOCK_YN lockYn, "+
        "	    CONCAT('주일예배') practiceNm, "+
        "	    (SELECT COUNT(*) FROM attendances a WHERE a.WORSHIP_DT=i.WORSHIP_DT) attendanceCnt "+
        "  FROM CHOIR_WORSHIP i "+
        " WHERE i.WORSHIP_DT = ? ";

  var query2 = " SELECT MEMBER_NM, MEMBER_ID memberId, PART_CD, STATUS_CD " +
		         " FROM members";
	
	var query3 = " SELECT MEMBER_ID memberId" +
		         "   FROM attendances " + 
						 "    where WORSHIP_DT = ? ";

	var query4 = " SELECT * " +
		         "   FROM CHOIR_REPORT " + 
						 "    where WORSHIP_DT = ? ";

    async.parallel({
    	attInfo : function(callback) {
    		db.query(query1, [practiceDt, practiceCd], function(err, row){
    			callback(null, row[0]);
    		});
    	},
    	memberList: function(callback) {
    		db.query(query2, [], function(err, rows){
    			callback(null, rows);
    		});
    	},
			attList: function(callback) {
    		db.query(query3, [practiceDt, practiceCd], function(err, rows){
    			callback(null, rows);
    		});
    	},
			reportList: function(callback) {
    		db.query(query4, [practiceDt], function(err, rows){
    			callback(null, rows);
    		});
    	}
    }, function(err, results) {
    	res.send({
    		attInfo : results.attInfo, 
    		memberList : results.memberList, 
    		attList : results.attList, 
    		reportList : results.reportList 
    	});
    });
};

/* 대원목록*/
exports.memberList = function(req, res) {

	var db = getDBConnector(req.db_type);
  var query1 = [ 
  " SELECT MEMBER_NM, MEMBER_ID, PHONE_NO, BIRTHDAY, PART_CD, STATUS_CD, MOTHER_PHONE, att_count, weeks, ROUND((att_count/weeks) * 100, 0) att_ratio"
  , " FROM "
  , "     (SELECT M.*, (ifnull (c_att, 0)) As att_count, (week(curdate()) - week(REG_DT)) weeks"
  , "        FROM members M LEFT OUTER JOIN "
  , "             (SELECT MEMBER_ID, COUNT(*) c_att "
  , "                FROM attendances "
  , "      GROUP BY MEMBER_ID) A "
  , "        ON M.MEMBER_ID = A.MEMBER_ID) T "
  , " ORDER BY PART_CD, att_ratio DESC"
  ].join('')
             
	async.parallel({
		memberList: function(callback) {
			db.query(query1, [], function(err, rows){

				if(typeof rows === 'object') {
					rows = rows.map(row => {
						if(row.PHONE_NO === "" || row.PHONE_NO === null)
							row.PHONE_NO = row.MOTHER_PHONE;
						
						return row;
					});				
				}

				callback(null, rows);
			});
		}    	
	}, function(err, results) {

		res.send(results.memberList);
	});
};

/* 대원목록-이름순*/
exports.sortedMemberList = function(req, res) {

	var db = getDBConnector(req.db_type);
	var query1 = " SELECT MEMBER_NM, MEMBER_ID, PHONE_NO, BIRTHDAY, PART_CD, STATUS_CD, MOTHER_PHONE " +
		         " FROM members a ORDER BY a.MEMBER_NM";


	async.parallel({
		memberList: function(callback) {



			db.query(query1, [], function(err, rows){
				callback(null, rows);
			});
		}    	
	}, function(err, results) {

		res.send(results.memberList);
	});
};


/* 대원목록-장결자*/
exports.longAbsentee = function(req, res) {
	var db = getDBConnector(req.db_type);
	var query1 = "SELECT M.MEMBER_NM, M.MEMBER_ID, M.PHONE_NO, M.BIRTHDAY, M.PART_CD, STATUS_CD, count(A.MEMBER_ID)  "
		         + " FROM members M left join (select * from attendances WHERE WORSHIP_DT BETWEEN DATE_ADD(NOW(),INTERVAL-3 MONTH ) AND NOW()) A "
	           + " ON M.MEMBER_ID = A.MEMBER_ID "
						 + " GROUP BY M.MEMBER_ID "
						 + " HAVING count(A.MEMBER_ID) = 0 ";

	async.parallel({
		memberList: function(callback) {
			db.query(query1, [], function(err, rows){
				callback(null, rows);
			});
		}    	
	}, function(err, results) {
		res.send(results.memberList);
	});
};

/* 대원목록-최근 결석자*/
exports.latestAbsentee = function(req, res) {

	var db = getDBConnector(req.db_type);
	var query1 = "SELECT M.MEMBER_NAME, M.MEMBER_ID, M.PHONE_NO, M.BIRTHDAY, M.PART_CD, STATUS_CD, count(A.MEMBER_ID)  "
		         + " FROM members M left join (select * from attendances WHERE WORSHIP_DT BETWEEN DATE_ADD(NOW(),INTERVAL-1 MONTH ) AND NOW()) A "
	           + " ON M.MEMBER_ID = A.MEMBER_ID "
						 + " GROUP BY M.MEMBER_ID "
						 + " HAVING count(A.MEMBER_ID) = 0 ";

	async.parallel({
		memberList: function(callback) {
			db.query(query1, [], function(err, rows){
				callback(null, rows);
			});
		}    	
	}, function(err, results) {

		res.send(results.memberList);
	});
};

/* 대원목록- 셰례*/
exports.baptism = function(req, res) {

	var db = getDBConnector(req.db_type);

	if(req.db_type == "infant")
		checkBaptism = "INFANT";
	else
		checkBaptism = "BAPTISM";

	var query1 = " SELECT MEMBER_NM, MEMBER_ID, PHONE_NO, BIRTHDAY, PART_CD, STATUS_CD, BAPTISM_CD " +
		         " FROM members a WHERE BAPTISM_CD != ? ORDER BY a.MEMBER_NM";
		
	async.parallel({
		memberList: function(callback) {
			db.query(query1, [checkBaptism], function(err, rows){				
				callback(null, rows);
			});
		}    	
	}, function(err, results) {

		res.send(results.memberList);
	});
};

/* 대원목록 - 이번달 생일*/
exports.birthDayMemberList = function(req, res) {

	var db = getDBConnector(req.db_type);

	if(req.db_type == "infant")
		checkBaptism = "INFANT";
	else
		checkBaptism = "BAPTISM";

	var query1 = " SELECT MEMBER_NM, MEMBER_ID, PHONE_NO, BIRTHDAY, PART_CD, STATUS_CD, BAPTISM_CD " +
		         " FROM members a where MONTH(BIRTHDAY) = MONTH(NOW())";

	async.parallel({
		memberList: function(callback) {
			db.query(query1, [checkBaptism], function(err, rows){				
				callback(null, rows);
			});
		}    	
	}, function(err, results) {

		res.send(results.memberList);
	});
};


exports.attributeRatioList = function(req, res) {

  var db = getDBConnector(req.db_type);

	var query1 = [ 
	" SELECT T.PHONE_NO, T.MEMBER_ID, T.MEMBER_NM, att_count, weeks, ROUND((att_count/weeks) * 100, 0) att_ratio"
	," FROM "
	, "     (SELECT M.PHONE_NO, M.MEMBER_NM, M.MEMBER_ID, REG_DT, (ifnull (c_att, 0)) As att_count, (week(curdate()) - week(REG_DT)) weeks"
	, "        FROM members M LEFT OUTER JOIN "
	, "             (SELECT MEMBER_ID, COUNT(*) c_att "
	, "                FROM attendances WHERE WORSHIP_CD= 'WORSHIP' "
	, "      GROUP BY MEMBER_ID) A "
	, "        ON M.MEMBER_ID = A.MEMBER_ID) T "
	, " ORDER BY att_ratio DESC"
  ].join('')

	async.parallel({
		memberList: function(callback) {
			db.query(query1, [], function(err, rows){				
				callback(null, rows);
			});
		}    	
	}, function(err, results) {

		res.send(results.memberList);
	});
};

/* 대원 상세정보 */
exports.member = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var query1 = " SELECT * FROM members WHERE MEMBER_ID = ? ";

  var query2 = [
    "SELECT DATE_FORMAT(W.WORSHIP_DT, '%m-%d') WORSHIP_DT, if (isnull (A.MEMBER_ID), 0, 1) att_check"
   ," FROM CHOIR_WORSHIP W"
   ," LEFT OUTER JOIN "
   ,"       (SELECT * FROM attendances where MEMBER_ID= ? AND WORSHIP_CD= 'WORSHIP') A "
   ,"       ON W.WORSHIP_DT = A.WORSHIP_DT "
   ," WHERE W.WORSHIP_DT < now()"
  ].join('')
  
  async.parallel({
		member : function(callback) {
			db.query(query1, [req.params.memberId], function(err, rows){
				if(rows == null || rows.length === 0) {
					callback(null, null);
				} else {
					rows
					callback(null, rows[0]);	
				}
			});
		},
		attendnceList : function(callback) {
			db.query(query2, [req.params.memberId,req.params.memberId,req.params.memberId], function(err, rows){
				callback(null, rows);
			});
		}
	}, function(err, results){
		if(results.member === null) {
			return res.send([]);
		} else {
			return res.send({
				member 			: results.member, 
				attendnceList 	: results.attendnceList
			});
		}
	});
};

/* 코드정보 */
exports.codeList = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var query1 = "SELECT GRP_CD, CMN_CD, CMN_NM FROM CHOIR_CODE ORDER BY orderby_no";
	var query2 = "SELECT PART_CD, PART_NM, TEACHER_NM FROM CHOIR_PART ORDER BY orderby_no";

	var partList=[], baptismList=[], statusList=[], genderList=[];

	db.query(query1, [], function(err, codes) {			
		codes.forEach(function(code) {
			switch(code.GRP_CD) {
				case "BAPTISM":
					baptismList.push(code);
					break;
				case "GENDER":
					genderList.push(code);
					break;
				case "STATUS":
					statusList.push(code);
					break;
				default:
					// code block
			}
		});

		db.query(query2, [], function(err, result) {
			res.send({
				partList 		: result, 
				baptismList : baptismList, 
				genderList 	: genderList, 
				statusList 	: statusList
			});		
		});		
	})
}
/* 마감처리 */
exports.lockAtt = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;

	db.query("UPDATE CHOIR_WORSHIP SET LOCK_YN = 'Y' WHERE WORSHIP_DT = ? AND WORSHIP_CD = ? AND LOCK_YN = 'N'", [ practiceDt, practiceCd ], function() {
		res.send({ result: 'success' });
	});
};

/* 마감 취소 처리*/
exports.unlockAtt = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;

	db.query("UPDATE CHOIR_WORSHIP SET LOCK_YN = 'N' WHERE WORSHIP_DT = ? AND WORSHIP_CD = ? AND LOCK_YN = 'Y'", [ practiceDt, practiceCd ], function() {
		res.send({ result: 'success' });
	});
};

/* 출석체크 */
exports.select = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var memberId = req.body.memberId;

	async.waterfall([
		function(callback) {
			db.query("SELECT COUNT(*) cnt FROM attendances i WHERE i.WORSHIP_DT = ? AND i.MEMBER_ID = ? ", [ practiceDt, practiceCd, memberId ], function(err, rows){	
				callback(null, rows[0].cnt);
			});
		}, function(cnt, callback) {
			if(cnt == 0) {
				db.query("INSERT INTO attendances VALUES (?,?,?)", [ practiceDt, practiceCd, memberId ], function() {
					callback(null, "done");
				});	
			} else {
				callback(null, 'done');
			}
		}
	], function() {
		res.send({ result: 'success' });
	});
};

/* 출석체크 해제 */
exports.deselect = function(req, res) {

	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var memberId = req.body.memberId;

	db.query("DELETE FROM attendances WHERE WORSHIP_DT = ? AND MEMBER_ID = ?", [ practiceDt, memberId ], function() {
		res.send({ result: 'success' });
	});
};

/* 연습곡 갱신 */
exports.saveMusicInfo = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var musicInfo = req.body.musicInfo;

	db.query("UPDATE CHOIR_WORSHIP SET INFO = ? WHERE WORSHIP_DT = ? ", [ musicInfo,  practiceDt, practiceCd ], function() {
		res.send({ result: 'success' });
	});
};

/* 메모 갱신 */
exports.saveEtcMsg = function(req, res) {

	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var etcMsg = req.body.etcMsg;

	db.query("UPDATE CHOIR_WORSHIP SET ETC_MSG = ? WHERE WORSHIP_DT = ? ", [ etcMsg,  practiceDt, practiceCd ], function() {
		res.send({ result: 'success' });
	});
};

/* 리포트 갱신 */
exports.saveReport = function(req, res) {

	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var partCd = req.params.partCd;
	var etcMsg = req.body.etcMsg;

	async.waterfall([
		function(callback) {
			db.query("SELECT COUNT(*) cnt FROM CHOIR_REPORT i WHERE i.WORSHIP_DT = ? AND i.PART_CD = ?", [ practiceDt, partCd ], function(err, rows){
				callback(null, rows[0].cnt);
			});
		},
		function(cnt, callback) {
			if(cnt == 0) {
				db.query("INSERT into CHOIR_REPORT(WORSHIP_DT, PART_CD, REPORT) VALUES(?,?,?)", [ practiceDt, partCd, etcMsg ], function(){
					callback(null, 'success');
				});
			} 
			else {				
				db.query("UPDATE CHOIR_REPORT SET REPORT = ? WHERE WORSHIP_DT = ? and PART_CD = ?", [ etcMsg,  practiceDt, partCd ], function() {
					res.send({ result: 'success' });
				});

				callback(null, 'success');	// 이미 생성된 연습정보가 존재하는 경우(중복)
			}
		}
	], function(err, result) {
		res.send({ result: result });	
	});
};

/* 연습정보 제거 */
exports.removeAttInfo = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	
	async.series([
		function(callback) {
			db.query("DELETE FROM attendances WHERE WORSHIP_DT = ? ", [ practiceDt, practiceCd], function() {
				callback(null, null);	
			});
		},
		function(callback) {
			db.query("DELETE FROM CHOIR_WORSHIP WHERE WORSHIP_DT = ? ", [ practiceDt, practiceCd],function() {
				callback(null, null);
			});
		}
	], function() {
		res.send({ result: 'success' });
	});
};

/* 연습정보 생성 */
exports.createPracticeInfo = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var etgMsg = req.body.etgMsg;
	var musicInfo = req.body.musicInfo;

	async.waterfall([
		function(callback) {
			db.query("SELECT COUNT(*) cnt FROM CHOIR_WORSHIP i WHERE i.WORSHIP_DT = ? AND i.WORSHIP_CD = ?", [ practiceDt, practiceCd ], function(err, rows){
				callback(null, rows[0].cnt);
			});
		},
		function(cnt, callback) {
			if(cnt == 0) {
				db.query("INSERT into CHOIR_WORSHIP(WORSHIP_DT, WORSHIP_CD, MUSIC_INFO, ETC_MSG) VALUES(?,?,?,?)", [ practiceDt, practiceCd, musicInfo, etgMsg ], function(){
					callback(null, 'success');
				});
			} else {
				callback(null, 'dup');	// 이미 생성된 연습정보가 존재하는 경우(중복)
			}
		}
	], function(err, result) {
		res.send({ result: result });	
	});
};

/* 회의록 목록*/
exports.docList = function(req, res) {

	var db = getDBConnector(req.db_type);
	var query = "SELECT MEET_SEQ meetSeq,MEET_DT meetDt,MEET_TITLE meetTitle,REPLACE(MEET_CONTENTS,'\n','<br/>') meetContents,REG_DT regDt,UPT_DT uptDt,LOCK_YN lockYn FROM MEETTING_DOC ORDER BY MEET_DT DESC, MEET_SEQ DESC";
	db.query(query, {}, function(err, rows){
		res.send(rows);
	});
};

/* 회의록 생성 */
exports.createDoc = function(req, res) {

	var db = getDBConnector(req.db_type);
	var meetDt = req.body.meetDt;
	var meetTitle = req.body.meetTitle;
	var meetContents = req.body.meetContents;

	db.query("INSERT into MEETTING_DOC(MEET_DT, MEET_TITLE, MEET_CONTENTS, REG_DT, UPT_DT) VALUES(?,?,?,current_timestamp,current_timestamp)",
		[ meetDt, meetTitle, meetContents], function() {
		res.send({ result: 'success' });
	});
};

/* 회의록 상세정보*/
exports.modifyDoc = function(req, res) {

	var db = getDBConnector(req.db_type);
	var docId = req.params.docId;
	db.query("SELECT MEET_SEQ meetSeq,MEET_DT meetDt,MEET_TITLE meetTitle,MEET_CONTENTS meetContents,REG_DT regDt,UPT_DT uptDt,LOCK_YN lockYn FROM meetting_doc WHERE MEET_SEQ = ?", [ docId ], function(err, row){
		res.send(row[0]);
	});
};

/* 회의록 수정 */
exports.updateDoc = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var meetDt = req.body.meetDt;
	var meetTitle = req.body.meetTitle;
	var meetContents = req.body.meetContents;
	var meetSeq = req.body.meetSeq;

	db.query("UPDATE MEETTING_DOC set MEET_DT = ?,MEET_TITLE = ?,MEET_CONTENTS = ?,UPT_DT = current_timestamp WHERE MEET_SEQ = ?",
		[ meetDt, meetTitle, meetContents, meetSeq], function() {
		res.send({ result: 'success' });	
	});
};

/*회의록 제거*/
exports.removeDoc = function(req, res) {
	
	var db = getDBConnector(req.db_type);

	db.query("delete FROM MEETTING_DOC WHERE MEET_SEQ = ?", [req.body.meetSeq], function() {
		res.send({ result: 'success' });
	});
};

/* 회의록 마감*/
exports.closeDoc = function(req, res) {
	var db = getDBConnector(req.db_type);

	db.query("UPDATE MEETTING_DOC set LOCK_YN = 'Y' WHERE MEET_SEQ = ?", [req.body.meetSeq], function() {
		res.send({ result: 'success' });	
	});
};

/* 대원정보 저장 */
exports.insertMember = function(req, res) {

	var db = getDBConnector(req.db_type);
	var member = req.body;

	var query =
        "INSERT into members ( " +
        "   MEMBER_NM," +
        "   BIRTHDAY," +
        "   PHONE_NO," +
        "   ADDRESS," +
        "   PART_CD," +
        "   GENDER_CD," +
				"   BAPTISM_CD," +
				"   STATUS_CD," +
				"   FATHER_NM," +
				"   FATHER_PHONE," +
				"   MOTHER_NM," +
				"   MOTHER_PHONE," +
				"   SCHOOL," +
        "   ETC_MSG," +
        "   REG_DT," +
        "   MODIFY_DT ) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp, current_timestamp)";

	db.query(query, [ 
			member.MEMBER_NM, 
			member.BIRTHDAY,
			member.PHONE_NO, 
			member.ADDRESS, 
			member.PART_CD, 
			member.GENDER_CD, 
			member.BAPTISM_CD,
			member.STATUS_CD, 
			member.FATHER_NM, 
			member.FATHER_PHONE, 
			member.MOTHER_NM, 
			member.MOTHER_PHONE, 
			member.SCHOOL,
			member.ETC_MSG
		], function(err) {
		console.log(err);
		res.send({ result: 'success' });
	});
};

/* 대원정보 저장 */
exports.updateMember = function(req, res) {

	var db = getDBConnector(req.db_type);
	var member = req.body;

	var	query =
    "UPDATE members"+
		"   SET MEMBER_NM=?, " +
        "   BIRTHDAY=?," +
        "   PHONE_NO=?," +
        "   ADDRESS=?," +
        "   PART_CD=?," +
        "   GENDER_CD=?," +
				"   BAPTISM_CD=?," +
				"   STATUS_CD=?," +
				"   FATHER_NM=?," +
				"   FATHER_PHONE=?," +
				"   MOTHER_NM=?," +
				"   MOTHER_PHONE=?," +
				"   SCHOOL=?," +
        "   ETC_MSG=? " +
		" WHERE MEMBER_ID=?";
	
	db.query(query, [ 
			member.MEMBER_NM, 
			member.BIRTHDAY,
			member.PHONE_NO,
			member.ADDRESS, 
			member.PART_CD, 
			member.GENDER_CD, 
			member.BAPTISM_CD,
			member.STATUS_CD, 
			member.FATHER_NM, 
			member.FATHER_PHONE, 
			member.MOTHER_NM, 
			member.MOTHER_PHONE, 
			member.SCHOOL,
			member.ETC_MSG,
			member.MEMBER_ID,
	], function(err, rows) {
		res.send({ result: 'success' });
	});
};


exports.deleteMember = function(req, res) {
	var db = getDBConnector(req.db_type);
	var member = req.body;
	
	memberId = req.params.memberId;

	db.query("DELETE FROM members WHERE MEMBER_ID = ?", [memberId], function(err) {
		res.send({ result: 'success' });
	});
}

exports.uploadPhoto = function(req, res) {
  upload(req, res).then(function (file) {
    res.json(file);
  }, function (err) {
    res.send(500, err);
  });
}

exports.downLoadExcel = function(req, res) {
	var db = getDBConnector(req.db_type);

	var query = [ 
	' SELECT '
	,' T.MEMBER_ID 고유번호,' 
	,' P.PART_NM 반명,'
	,' P.TEACHER_NM 반선생님,'
	,' T.MEMBER_NM 이름, C1.CMN_NM 성별, T.BIRTHDAY 생일,' 
	,' C2.CMN_NM 세례여부, C3.CMN_NM 출석상태, ROUND((att_count / weeks) * 100, 0) 출석율, CONCAT(att_count,"/",weeks) 출석기록,'
	,' T.SCHOOL 학교, T.PHONE_NO 전화번호, T.ADDRESS 주소,'
	,' T.MOTHER_NM 엄마이름, T.MOTHER_PHONE 엄마휴대폰, T.FATHER_NM 아빠이름, T.FATHER_PHONE 아빠번호,'
	,' T.ETC_MSG 기타내용, T.REG_DT 등록일'
	,' FROM '
	,'	(SELECT '
	,'			M.*, '
	,'					(IFNULL(c_att, 0)) AS att_count, '
	,'					(WEEK(CURDATE()) - WEEK(REG_DT)) weeks '
	,'	FROM '
	,'			members M '
	,'	LEFT OUTER JOIN (SELECT '
	,'			MEMBER_ID, COUNT(*) c_att '
	,'	FROM '
	,'			attendances '
	,'	GROUP BY MEMBER_ID) A ON M.MEMBER_ID = A.MEMBER_ID) T '
	,' LEFT OUTER JOIN CHOIR_PART P ON P.PART_CD = T.PART_CD '
	,' LEFT OUTER JOIN CHOIR_CODE C1 ON C1.CMN_CD = T.GENDER_CD '
	,' LEFT OUTER JOIN CHOIR_CODE C2 ON C2.CMN_CD = T.BAPTISM_CD '
	,' LEFT OUTER JOIN CHOIR_CODE C3 ON C3.CMN_CD = T.STATUS_CD '
	,' ORDER BY 반명, 출석율 DESC' 
	].join('')
	
	db.query(query, [], function(err, members){	
		if(err == null) {
			filename = createExcel(members, req.db_type)
			res.download(filename)
		}else{
			res.send({ result: 'error' });
		}
	})
}

const upload = function (req, res) {
	
	var db = getDBConnector(req.db_type);
	var ab_imagePath = "/home/litty17/app/photo/" + req.db_type;
	var new_image_name;

	var memberId = req.params.memberId;

  var deferred = Q.defer();
  var storage = multer.diskStorage({

    // 서버에 저장할 폴더
    destination: function (req, file, cb) {
      cb(null, ab_imagePath);
    },

    // 서버에 저장할 파일 명
    filename: function (req, file, cb) {			
      file.uploadedFile = {
        name: req.params.memberId,
        ext: file.mimetype.split('/')[1]       
      };

			ori_image_name = file.uploadedFile.name + '.' + file.uploadedFile.ext;
			new_image_name = file.uploadedFile.name + '_resize.' + file.uploadedFile.ext;
			updateMemberImage(db, new_image_name, memberId);

			Sharp(ab_imagePath + '/' + ori_image_name)
				.resize(400,400)
        .toFile(ab_imagePath + '/' + new_image_name, function (err) {
            cb(null, new_image_name);
       });
    }
  });

  var upload_file = multer({ storage: storage }).single('file');
  upload_file(req, res, function (err, data) {
    if (err) deferred.reject();
    else 
		{

				deferred.resolve(new_image_name);
		}
  });
  return deferred.promise;
};

const updateMemberImage = function(db, imagePath, memberId) {

	var	query =
    "UPDATE members"+
		"   SET PHOTO=? " +
		" WHERE MEMBER_ID=?";
	
	db.query(query, [ 
			imagePath, 
			memberId,
	], function(err, rows) {
	});
};

const createExcel = function(members, db_type, res) {

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
		
		ATT_RULE.map(function(rule) {	
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
	
	var save_file = '/home/litty17/app/downloads/전체명단_' + PART_LIST[db_type] + '.xlsx';
	workbook.write(save_file)
	return save_file
};

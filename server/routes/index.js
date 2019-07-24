var db_config = {};

const mysql = require('mysql');
const async = require('async');    // 콜백 지옥에서 벗어나기 위한 모듈


const Q = require('q');
const multer = require('multer');
const Sharp = require('sharp');


db_config.infant = {
    host     : process.env.MYSQL_URL,
    user     : process.env.MYSQL_ID,
    password : process.env.MYSQL_PASS,
    database : process.env.MYSQL_DB
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


handleDisconnect("infant");	//최초 DB 접속
handleDisconnect("high");	//최초 DB 접속
handleDisconnect("middle");	//최초 DB 접속
handleDisconnect("kindergarten");	//최초 DB 접속

function getDBConnector(db_type)
{
	if (db[db_type] == undefined || db[db_type] == null  )
	{
		handleDisconnect(db_type);
	}else{
		return db[db_type];
	}
}

/*  
	장기 결석자 목록 (3주)
	지금은 사용하지 않음
	나중에 사용할지도 몰라 쿼리는 남겨둠
*/


exports.calendar = function(req, res) {
	
	var db = getDBConnector(req.db_type);

	var query1 = "SELECT WORSHIP_DT start, INFO title FROM CHOIR_WORSHIP";
	var query2 = "SELECT BIRTHDAY start, CONCAT(MEMBER_NM, '생일') title FROM CHOIR_MEMBER where BIRTHDAY != '' ";

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
			db.query("SELECT WORSHIP_DT, count(*) att_count FROM CHOIR_ATTENDANCE group by WORSHIP_DT order by WORSHIP_DT", [], function(err, attendances){	
				callback(null, attendances);
			});
		}, function(attendances, callback) {			
				db.query("SELECT MEMBER_NM, MEMBER_ID memberId, REG_DT FROM CHOIR_MEMBER", [], function(err, members) {
					
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

			//SELECT WORSHIP_DT FROM CHOIR_ATTENDANCE order by WORSHIP_DT desc limit 1;
			var query1 = "SELECT GENDER_CD i, COUNT(*) c FROM CHOIR_MEMBER group by GENDER_CD desc ";
			var query2 = "SELECT GENDER_CD i, COUNT(*) c FROM CHOIR_MEMBER M, CHOIR_ATTENDANCE A where M.MEMBER_ID = A.MEMBER_ID and WORSHIP_DT=? group by M.GENDER_CD desc"
			var query3 = "SELECT p.PART_NM i, COUNT(m.PART_CD) c FROM CHOIR_MEMBER m, CHOIR_PART p where m.PART_CD = p.PART_CD group by m.PART_CD";

			var query4 = "SELECT p.PART_NM i, COUNT(M.PART_CD) c FROM CHOIR_MEMBER M, CHOIR_ATTENDANCE A, CHOIR_PART p where M.MEMBER_ID = A.MEMBER_ID and M.PART_CD = p.PART_CD and WORSHIP_DT=? group by M.PART_CD"
			var query4 = "SELECT PART_NM i, count(A.PART_CD) c FROM CHOIR_PART P left outer join (SELECT M.MEMBER_ID, M.PART_CD" 
								 + " from CHOIR_ATTENDANCE A, CHOIR_MEMBER M " 
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
					console.log(rows);
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
        "	    (SELECT COUNT(*) FROM CHOIR_ATTENDANCE a WHERE a.WORSHIP_DT=i.WORSHIP_DT) attendanceCnt "+
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
        "	    (SELECT COUNT(*) FROM CHOIR_ATTENDANCE a WHERE a.WORSHIP_DT=i.WORSHIP_DT) attendanceCnt "+
        "  FROM CHOIR_WORSHIP i "+
        " WHERE i.WORSHIP_DT = ? ";

  var query2 = " SELECT MEMBER_NM, MEMBER_ID memberId, PART_CD, STATUS_CD " +
		         " FROM CHOIR_MEMBER";
	
	var query3 = " SELECT MEMBER_ID memberId" +
		         "   FROM CHOIR_ATTENDANCE " + 
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

/* 출석체크 */
exports.select = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var memberId = req.body.memberId;

	async.waterfall([
		function(callback) {
			db.query("SELECT COUNT(*) cnt FROM CHOIR_ATTENDANCE i WHERE i.WORSHIP_DT = ? AND i.MEMBER_ID = ? ", [ practiceDt, practiceCd, memberId ], function(err, rows){	
				callback(null, rows[0].cnt);
			});
		}, function(cnt, callback) {
			if(cnt == 0) {
				db.query("INSERT INTO CHOIR_ATTENDANCE VALUES (?,?,?)", [ practiceDt, practiceCd, memberId ], function() {
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

	db.query("DELETE FROM CHOIR_ATTENDANCE WHERE WORSHIP_DT = ? AND MEMBER_ID = ?", [ practiceDt, memberId ], function() {
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
			db.query("DELETE FROM CHOIR_ATTENDANCE WHERE WORSHIP_DT = ? ", [ practiceDt, practiceCd], function() {
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


exports.uploadPhoto = function(req, res) {
  upload(req, res).then(function (file) {
    res.json(file);
  }, function (err) {
    res.send(500, err);
  });
}

var upload = function (req, res) {
	
	var db = getDBConnector(req.db_type);
	var ab_imagePath = "/home/ubuntu/church-management/app/photo/" + req.db_type;
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

var updateMemberImage = function(db, imagePath, memberId) {

	console.log(imagePath);

	var	query =
    "UPDATE CHOIR_MEMBER"+
		"   SET PHOTO=? " +
		" WHERE MEMBER_ID=?";
	
	db.query(query, [ 
			imagePath, 
			memberId,
	], function(err, rows) {
	});
};


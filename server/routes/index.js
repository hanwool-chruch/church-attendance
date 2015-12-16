var db_config = {
    host     : process.env.MYSQL_URL  || 'us-cdbr-iron-east-03.cleardb.net',
    user     : process.env.MYSQL_ID   || 'b884ba11ab5f27',
    password : process.env.MYSQL_PASS || '42d453a9',
    database : process.env.MYSQL_DB   || 'heroku_08834d64f8b1271'
};

var db;

var mysql = require('mysql'),
    async = require('async');    // 콜백 지옥에서 벗어나기 위한 모듈

/* 
	Heroku 서비스 mysql 이용시 필수
	무료 티어로 mysql 이용시 접속이 수시로 끊기기 때문에 재접속 해줘야 함
*/
function handleDisconnect() {
	db = mysql.createConnection(db_config);
	db.connect(function(err) {
		if (err) {
			setTimeout(handleDisconnect, 2000);
		}
	});
	
	db.on('error', function(err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDisconnect();
		} else {
			throw err;
		}
	});
}

handleDisconnect();	//최초 DB 접속

/*  
	장기 결석자 목록 (3주)
	지금은 사용하지 않음
	나중에 사용할지도 몰라 쿼리는 남겨둠
*/
exports.absentMembers = function(req, res) {

	var query =
        "SELECT C.MEMBER_ID memberId, " +
        "       C.MEMBER_NM memberNm, " +
        "       C.PART_CD partCd, " +
        "       (SELECT ORDERBY_NO FROM CHOIR_PART D WHERE D.PART_CD=C.PART_CD) ORDERBY_NO," +
        "       C.PHONE_NO phoneNo  " +
        "  FROM CHOIR_MEMBER C WHERE STATUS_CD='O' " +
        "   AND PART_CD !='E' " +
        "   AND NOT EXISTS ( " +
        "                     SELECT A.MEMBER_ID " +
        "                       FROM (SELECT MEMBER_ID, " +
        "                                    PRACTICE_DT, " +
        "                                    PRACTICE_CD " +
        "                               FROM CHOIR_ATTENDANCE) A, " +
        "                            (SELECT PRACTICE_DT, " +
        "                                    PRACTICE_CD " +
        "                               FROM CHOIR_PRACTICE_INFO " +
        "                              WHERE PRACTICE_CD='AM' " +
        "                                AND LOCK_YN='Y' " +
        "                           ORDER BY PRACTICE_DT DESC LIMIT 3) B " +
        "                      WHERE A.PRACTICE_DT = B.PRACTICE_DT " +
        "                        AND A.PRACTICE_CD = B.PRACTICE_CD " +
        "                        AND C.MEMBER_ID = A.MEMBER_ID ) " +
        " ORDER BY ORDERBY_NO ASC";
	
	db.query(query, {}, function(err, rows){
		res.send(rows);
	});
};

/* 
	출석순위

	교회의 결산 주기는 전년도 12월부터 올해 11월까지임.
	데이터는 결산주기에 맞춰서 표시됨.

	추후 과거 데이터도 볼 수 있도록 개선할 예정임
*/
exports.rank = function(req, res) {

	var curDate = new Date();
	var curYear = curDate.getFullYear();
	var curMonth = (curDate.getMonth()+1);

	var startDt = '';
	var endDt = '';
	
	if(curMonth == 12) {
		startDt = curYear + "-12-01";
		endDt = (curYear+1) + "-11-30";
	} else {
		startDt = (curYear-1) + "-12-01";
		endDt = (curYear) + "-11-30";
	}

	var query =
        "  SELECT * " +
        "    FROM ( "+
        "         SELECT MEMBER_ID   memberId, " +
        "                  MEMBER_NM   memberNm, " +
        "                  PART_CD     partCd, " +
        "                  (SELECT POSITION_NM FROM CHOIR_POSITION CP WHERE CP.POSITION_CD = a.POSITION_CD) positionNm, " +
        "                  (SELECT C_POSITION_NM FROM CHOIR_C_POSITION CP WHERE CP.C_POSITION_CD = a.C_POSITION_CD) cPositionNm, " +
        "                  (SELECT COUNT(pi.PRACTICE_DT) sp FROM CHOIR_PRACTICE_INFO pi WHERE pi.PRACTICE_DT between ? AND ? AND pi.PRACTICE_CD='AM' AND pi.LOCK_YN='Y') amPracticeCnt, " +
        "                  (SELECT COUNT(c.PRACTICE_DT) am FROM CHOIR_PRACTICE_INFO pi, CHOIR_ATTENDANCE c WHERE pi.PRACTICE_DT between ? AND ? AND pi.PRACTICE_DT=c.PRACTICE_DT AND pi.PRACTICE_CD=c.PRACTICE_CD AND c.PRACTICE_CD='AM' AND c.MEMBER_ID=a.MEMBER_ID AND pi.LOCK_YN='Y') amCnt, " +
        "                  (SELECT COUNT(pi.PRACTICE_DT) sp FROM CHOIR_PRACTICE_INFO pi WHERE pi.PRACTICE_DT between ? AND ? AND pi.PRACTICE_CD='PM' AND pi.LOCK_YN='Y') pmPracticeCnt, " +
        "                  (SELECT COUNT(c.PRACTICE_DT) pm FROM CHOIR_PRACTICE_INFO pi, CHOIR_ATTENDANCE c WHERE pi.PRACTICE_DT between ? AND ? AND pi.PRACTICE_DT=c.PRACTICE_DT AND pi.PRACTICE_CD=c.PRACTICE_CD AND c.PRACTICE_CD='PM' AND c.MEMBER_ID=a.MEMBER_ID AND pi.LOCK_YN='Y') pmCnt, " +
        "                  (SELECT COUNT(pi.PRACTICE_DT) sp FROM CHOIR_PRACTICE_INFO pi WHERE pi.PRACTICE_DT between ? AND ? AND pi.PRACTICE_CD='SP' AND pi.LOCK_YN='Y') spPracticeCnt, " +
        "                  (SELECT COUNT(c.PRACTICE_DT) sp FROM CHOIR_PRACTICE_INFO pi, CHOIR_ATTENDANCE c WHERE pi.PRACTICE_DT between ? AND ? AND pi.PRACTICE_DT=c.PRACTICE_DT AND pi.PRACTICE_CD=c.PRACTICE_CD AND c.PRACTICE_CD='SP' AND c.MEMBER_ID=a.MEMBER_ID AND pi.LOCK_YN='Y') spCnt " +
        "             FROM CHOIR_MEMBER a " +
        "            WHERE a.STATUS_CD='O' ) m " +
        "   ORDER BY m.amCnt desc, m.pmCnt DESC, m.spCnt DESC, m.memberNm ";

	db.query(query, [
		startDt,
		endDt,
		startDt,
		endDt,
		startDt,
		endDt,
		startDt,
		endDt,
		startDt,
		endDt,
		startDt,
		endDt
	], function(err, rows){
		res.send(rows);
	});
};

/* 연습정보 목록 */
exports.attList = function(req, res) {
	
	var page = req.params.page;
	var size = 50;
	var sRow = (page-1) * size;
	
	var query =
        "SELECT "+
        "	    i.PRACTICE_DT practiceDt,  "+
        "	    i.PRACTICE_CD practiceCd,  "+
        "	    i.MUSIC_INFO musicInfo,  "+
        "	    i.ETC_MSG etcMsg,  "+
        "	    i.LOCK_YN lockYn,  "+
        "	    IF(i.LOCK_YN='Y','마감',NULL) lockNm,  "+
        "	    p.PRACTICE_NM practiceNm, "+
		"       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE ca.MEMBER_ID = cm.MEMBER_ID AND ca.PRACTICE_DT = i.PRACTICE_DT AND ca.PRACTICE_CD = i.PRACTICE_CD AND cm.PART_CD = 'S' ) s, "+
        "       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE ca.MEMBER_ID = cm.MEMBER_ID AND ca.PRACTICE_DT = i.PRACTICE_DT AND ca.PRACTICE_CD = i.PRACTICE_CD AND cm.PART_CD = 'A' ) a, "+
        "       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE ca.MEMBER_ID = cm.MEMBER_ID AND ca.PRACTICE_DT = i.PRACTICE_DT AND ca.PRACTICE_CD = i.PRACTICE_CD AND cm.PART_CD = 'T' ) t, "+
        "       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE ca.MEMBER_ID = cm.MEMBER_ID AND ca.PRACTICE_DT = i.PRACTICE_DT AND ca.PRACTICE_CD = i.PRACTICE_CD AND cm.PART_CD = 'B' ) b, "+
        "       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE ca.MEMBER_ID = cm.MEMBER_ID AND ca.PRACTICE_DT = i.PRACTICE_DT AND ca.PRACTICE_CD = i.PRACTICE_CD AND cm.PART_CD = 'E' ) e, "+
        "	    (SELECT COUNT(*) FROM CHOIR_ATTENDANCE a WHERE a.PRACTICE_DT=i.PRACTICE_DT AND a.PRACTICE_CD=i.PRACTICE_CD) attendanceCnt "+
        "  FROM CHOIR_PRACTICE_INFO i, CHOIR_PRACTICE p "+
        " WHERE i.PRACTICE_CD = p.PRACTICE_CD "+
        " ORDER BY i.PRACTICE_DT DESC , p.ORDERBY_NO DESC Limit ?,?";

	db.query(query, [sRow, size], function(err, rows){
		res.send(rows);
	});
};

/* 연습정보 상세(출석정보 포함) */
exports.attInfoDetail = function(req, res) {

	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;

	var query1 =
        "SELECT "+
        "	    i.PRACTICE_DT practiceDt,  "+
        "	    i.PRACTICE_CD practiceCd,  "+
        "	    i.MUSIC_INFO musicInfo,  "+
        "	    i.ETC_MSG etcMsg,  "+
        "	    i.LOCK_YN lockYn, "+
        "	    p.PRACTICE_NM practiceNm, "+
        "	    (SELECT COUNT(*) FROM CHOIR_ATTENDANCE a WHERE a.PRACTICE_DT=i.PRACTICE_DT AND a.PRACTICE_CD=i.PRACTICE_CD) attendanceCnt "+
        "  FROM CHOIR_PRACTICE_INFO i, CHOIR_PRACTICE p "+
        " WHERE i.PRACTICE_CD = p.PRACTICE_CD "+
        "   AND i.PRACTICE_DT = ? AND i.PRACTICE_CD = ? ";

    var query2 =
        "SELECT * " +
        "  FROM ( "+
        "         SELECT  "+
        " 			     MEMBER_ID   memberId, "+
        "                (SELECT IF(COUNT(*)=0,'N','Y') FROM CHOIR_ATTENDANCE ca WHERE ca.PRACTICE_DT=? AND ca.PRACTICE_CD=? AND ca.MEMBER_ID = a.MEMBER_ID) attYn, "+
        " 			     MEMBER_NM   memberNm, "+
        " 			     (SELECT C_POSITION_NM FROM CHOIR_C_POSITION CP WHERE CP.C_POSITION_CD = a.C_POSITION_CD) cPositionNm, "+
        " 			     PHONE_NO    phoneNo, "+
        " 			     PART_CD     partCd, "+
        " 			     (SELECT POSITION_NM FROM CHOIR_POSITION CP WHERE CP.POSITION_CD = a.POSITION_CD) positionNm, "+
        " 			     STATUS_CD   statusCd, "+
        " 			     (SELECT STATUS_NM FROM CHOIR_STATUS CS WHERE CS.STATUS_CD = a.STATUS_CD) statusNm, "+
        " 			     ETC_MSG     etcMsg "+
        " 			FROM CHOIR_MEMBER a ) m "+
        " WHERE statusCd = ? "+
        "   AND partCd = ? "+
        " ORDER BY memberNm ";
	
	var query3 =
        "SELECT * " +
        "  FROM ( "+
		"         SELECT  "+
		" 			     MEMBER_ID   memberId, "+
		"                (SELECT IF(COUNT(*)=0,'N','Y') FROM CHOIR_ATTENDANCE ca WHERE ca.PRACTICE_DT=? AND ca.PRACTICE_CD=? AND ca.MEMBER_ID = a.MEMBER_ID) attYn, "+
		" 			     MEMBER_NM   memberNm, "+
		" 			     (SELECT C_POSITION_NM FROM CHOIR_C_POSITION CP WHERE CP.C_POSITION_CD = a.C_POSITION_CD) cPositionNm, "+
		" 			     PHONE_NO    phoneNo, "+
		" 			     PART_CD     partCd, "+
		" 			     (SELECT POSITION_NM FROM CHOIR_POSITION CP WHERE CP.POSITION_CD = a.POSITION_CD) positionNm, "+
		" 			     STATUS_CD   statusCd, "+
		" 			     (SELECT STATUS_NM FROM CHOIR_STATUS CS WHERE CS.STATUS_CD = a.STATUS_CD) statusNm, "+
		" 			     ETC_MSG     etcMsg "+
		" 			FROM CHOIR_MEMBER a ) m "+
		" WHERE statusCd = ? "+
		" ORDER BY memberNm ";

    async.parallel({
    	attInfo : function(callback) {
    		db.query(query1, [practiceDt, practiceCd], function(err, row){
    			callback(null, row[0]);
    		});
    	},
    	s : function(callback) {
    		db.query(query2, [practiceDt, practiceCd, 'O', 'S'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	a : function(callback) {
    		db.query(query2, [practiceDt, practiceCd, 'O', 'A'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	t : function(callback) {
    		db.query(query2, [practiceDt, practiceCd, 'O', 'T'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	b : function(callback) {
    		db.query(query2, [practiceDt, practiceCd, 'O', 'B'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	e : function(callback) {
    		db.query(query2, [practiceDt, practiceCd, 'O', 'E'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	h : function(callback) {
    		db.query(query3, [practiceDt, practiceCd, 'H'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	x : function(callback) {
    		db.query(query3, [practiceDt, practiceCd, 'X'], function(err, rows){
    			callback(null, rows);
    		});
    	}
    }, function(err, results) {
    	res.send({
    		attInfo : results.attInfo, 
    		s 		: results.s, 
    		a 		: results.a, 
    		t 		: results.t, 
    		b 		: results.b, 
    		e 		: results.e, 
    		h 		: results.h, 
    		x 		: results.x
    	});
    });
};

/* 대원목록*/
exports.memberList = function(req, res) {
	var query1 = 
        " 			SELECT  "+
        " 			    MEMBER_ID   memberId, "+
        " 			    MEMBER_NM   memberNm, "+
        " 			    b.C_POSITION_NM cPositionNm, "+
        " 			    c.POSITION_NM positionNm "+
        " 			FROM "+
        " 			    choir_member a, "+
        " 			    CHOIR_C_POSITION b, "+
        " 			    CHOIR_POSITION c "+
        "         WHERE a.C_POSITION_CD = b.C_POSITION_CD AND a.POSITION_CD = c.POSITION_CD"+
        "           AND a.STATUS_CD = ? "+
        "           AND a.PART_CD = ? "+
        "      ORDER BY a.MEMBER_NM ";

    var query2 = 
        " 			SELECT  "+
        " 			    MEMBER_ID   memberId, "+
        " 			    MEMBER_NM   memberNm, "+
        " 			    b.C_POSITION_NM cPositionNm, "+
        " 			    c.POSITION_NM positionNm "+
        " 			FROM "+
        " 			    choir_member a, "+
        " 			    CHOIR_C_POSITION b, "+
        " 			    CHOIR_POSITION c "+
        "         WHERE a.C_POSITION_CD = b.C_POSITION_CD AND a.POSITION_CD = c.POSITION_CD"+
        "         AND a.STATUS_CD = ? "+
        "         ORDER BY a.MEMBER_NM ";

    async.parallel({
    	s: function(callback) {
    		db.query(query1, ['O', 'S'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	a: function(callback) {
    		db.query(query1, ['O', 'A'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	t: function(callback) {
    		db.query(query1, ['O', 'T'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	b: function(callback) {
    		db.query(query1, ['O', 'B'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	e: function(callback) {
    		db.query(query1, ['O', 'E'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	h: function(callback) {
    		db.query(query2, ['H'], function(err, rows){
    			callback(null, rows);
    		});
    	},
    	x: function(callback) {
    		db.query(query2, ['X'], function(err, rows){
    			callback(null, rows);
    		});
    	}
    	
    }, function(err, results) {
    	res.send({
    		s : results.s, 
    		a : results.a, 
    		t : results.t, 
    		b : results.b, 
    		e : results.e, 
    		h : results.h, 
    		x : results.x
    	});
    });
};

/* 대원 상세정보 */
exports.member = function(req, res) {
	
	var query1 =
        " SELECT * " +
        "   FROM ( "+
        " 			SELECT "+
        " 			       MEMBER_ID   memberId, "+
        " 			       MEMBER_NM   memberNm, "+
        " 			       a.C_POSITION_CD   cPositionCd, "+
        " 			       (SELECT C_POSITION_NM FROM CHOIR_C_POSITION CP WHERE CP.C_POSITION_CD = a.C_POSITION_CD) cPositionNm, "+
        " 			       PHONE_NO    phoneNo, "+
        " 			       PART_CD     partCd, "+
        " 			       (SELECT PART_NM FROM CHOIR_PART CP WHERE CP.PART_CD = a.PART_CD) partNm, "+
        " 			       a.POSITION_CD     positionCd, "+
        " 			       (SELECT POSITION_NM FROM CHOIR_POSITION CP WHERE CP.POSITION_CD = a.POSITION_CD) positionNm, "+
        " 			       STATUS_CD   statusCd, "+
        " 			       (SELECT STATUS_NM FROM CHOIR_STATUS CS WHERE CS.STATUS_CD = a.STATUS_CD) statusNm, "+
        " 			       ETC_MSG     etcMsg "+
        " 			  FROM choir_member a ) m "+
        " WHERE memberId = ? ";

	var query2 =
        "SELECT " +
        "       distinct left(a.practice_dt, 7) month, " +
        "       a.practice_dt, a.practice_cd, " +
        "       b.member_id " +
        "  FROM " +
        "       (SELECT practice_dt, practice_cd FROM choir_practice_info) a left outer join  " +
        "       (SELECT p.practice_dt, p.practice_cd, a.member_id " +
        "          FROM choir_practice_info p inner join " +
        "               choir_attendance a " +
        "            ON p.practice_dt = a.practice_dt " +
        "           AND p.practice_cd = a.practice_cd " +
        "         WHERE member_id = ?) b " +
        "    ON a.practice_dt = b.practice_dt " +
        " WHERE left(a.practice_dt, 7) >= (SELECT min(left(practice_dt, 7)) as mm FROM choir_attendance WHERE member_id= ?) " +
        "   AND left(a.practice_dt, 7) <= (SELECT max(left(practice_dt, 7)) as mm FROM choir_attendance WHERE member_id= ?) " +
		" ORDER BY month DESC, practice_dt ASC, practice_cd";
	
	async.parallel({
		member : function(callback) {
			db.query(query1, [req.params.memberId], function(err, rows){
				if(rows.length === 0) {
					callback(null, null);
				} else {
					callback(null, rows[0]);	
				}
			});
		},
		attMonthList : function(callback) {
			db.query(query2, [req.params.memberId,req.params.memberId,req.params.memberId], function(err, rows){
				callback(null, rows);
			});
		}
	}, function(err, results){
		if(results.member === null) {
			return res.send(null);
		} else {
			return res.send({
				member 			: results.member, 
				attMonthList 	: results.attMonthList
			});
		}
	});
};

/* 코드정보 */
exports.codeList = function(req, res) {

	var query1 = "SELECT * FROM choir_c_position 	ORDER BY orderby_no";
	var query2 = "SELECT * FROM choir_position 		ORDER BY orderby_no";
	var query3 = "SELECT * FROM choir_part 			ORDER BY orderby_no";
	var query4 = "SELECT * FROM choir_practice 		ORDER BY orderby_no";
	var query5 = "SELECT * FROM choir_status 		ORDER BY orderby_no";

	async.parallel({
		cPositionList : function(callback) {
			db.query(query1, [], function(err, rows){
				callback(null, rows);
			});
		},
		positionList : function(callback) {
			db.query(query2, [], function(err, rows){
				callback(null, rows);
			});
		},
		partList : function(callback) {
			db.query(query3, [], function(err, rows){
				callback(null, rows);
			});
		},
		practiceList : function(callback) {
			db.query(query4, [], function(err, rows){
				callback(null, rows);
			});
		},
		statusList : function(callback) {
			db.query(query5, [], function(err, rows){
				callback(null, rows);
			});
		}
	}, function(err, results){
		res.send({
			cPositionList 	: results.cPositionList, 
			positionList 	: results.positionList, 
			partList 		: results.partList, 
			practiceList 	: results.practiceList, 
			statusList 		: results.statusList
		});
	});
};

/* 마감처리 */
exports.lockAtt = function(req, res) {
	
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;

	db.query("UPDATE CHOIR_PRACTICE_INFO SET LOCK_YN = 'Y' WHERE PRACTICE_DT = ? AND PRACTICE_CD = ? AND LOCK_YN = 'N'", [ practiceDt, practiceCd ], function() {
		res.send({ result: 'success' });
	});
};

/* 마감 취소 처리*/
exports.unlockAtt = function(req, res) {
	
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;

	db.query("UPDATE CHOIR_PRACTICE_INFO SET LOCK_YN = 'N' WHERE PRACTICE_DT = ? AND PRACTICE_CD = ? AND LOCK_YN = 'Y'", [ practiceDt, practiceCd ], function() {
		res.send({ result: 'success' });
	});
};

/* 출석체크 */
exports.select = function(req, res) {
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var memberId = req.body.memberId;

	async.waterfall([
		function(callback) {
			db.query("SELECT COUNT(*) cnt FROM choir_attendance i WHERE i.PRACTICE_DT = ? AND i.PRACTICE_CD = ? AND i.MEMBER_ID = ? ", [ practiceDt, practiceCd, memberId ], function(err, rows){	
				callback(null, rows[0].cnt);
			});
		}, function(cnt, callback) {
			if(cnt == 0) {
				db.query("INSERT INTO choir_attendance VALUES (?,?,?)", [ practiceDt, practiceCd, memberId ], function() {
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
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var memberId = req.body.memberId;

	db.query("DELETE FROM CHOIR_ATTENDANCE WHERE PRACTICE_DT = ? AND PRACTICE_CD = ? AND MEMBER_ID = ?", [ practiceDt, practiceCd, memberId ], function() {
		res.send({ result: 'success' });
	});
};

/* 연습곡 갱신 */
exports.saveMusicInfo = function(req, res) {
	
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var musicInfo = req.body.musicInfo;

	db.query("UPDATE CHOIR_PRACTICE_INFO SET MUSIC_INFO = ? WHERE PRACTICE_DT = ? AND PRACTICE_CD = ?", [ musicInfo,  practiceDt, practiceCd ], function() {
		res.send({ result: 'success' });
	});
};

/* 메모 갱신 */
exports.saveEtcMsg = function(req, res) {
	
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var etcMsg = req.body.etcMsg;

	db.query("UPDATE CHOIR_PRACTICE_INFO SET ETC_MSG = ? WHERE PRACTICE_DT = ? AND PRACTICE_CD = ?", [ etcMsg,  practiceDt, practiceCd ], function() {
		res.send({ result: 'success' });
	});
};

/* 연습정보 제거 */
exports.removeAttInfo = function(req, res) {
	
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	
	async.series([
		function(callback) {
			db.query("DELETE FROM CHOIR_ATTENDANCE WHERE PRACTICE_DT = ? AND PRACTICE_CD = ?", [ practiceDt, practiceCd], function() {
				callback(null, null);	
			});
		},
		function(callback) {
			db.query("DELETE FROM CHOIR_PRACTICE_INFO WHERE PRACTICE_DT = ? AND PRACTICE_CD = ?", [ practiceDt, practiceCd],function() {
				callback(null, null);
			});
		}
	], function() {
		res.send({ result: 'success' });
	});
};

/* 연습정보 생성 */
exports.createPracticeInfo = function(req, res) {
	
	var practiceDt = req.params.practiceDt;
	var practiceCd = req.params.practiceCd;
	var etgMsg = req.body.etgMsg;
	var musicInfo = req.body.musicInfo;

	async.waterfall([
		function(callback) {
			db.query("SELECT COUNT(*) cnt FROM CHOIR_PRACTICE_INFO i WHERE i.PRACTICE_DT = ? AND i.PRACTICE_CD = ?", [ practiceDt, practiceCd ], function(err, rows){
				callback(null, rows[0].cnt);
			});
		},
		function(cnt, callback) {
			if(cnt == 0) {
				db.query("INSERT into CHOIR_PRACTICE_INFO(PRACTICE_DT, PRACTICE_CD, MUSIC_INFO, ETC_MSG) VALUES(?,?,?,?)", [ practiceDt, practiceCd, musicInfo, etgMsg ], function(){
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
	var query = "SELECT MEET_SEQ meetSeq,MEET_DT meetDt,MEET_TITLE meetTitle,REPLACE(MEET_CONTENTS,'\n','<br/>') meetContents,REG_DT regDt,UPT_DT uptDt,LOCK_YN lockYn FROM MEETTING_DOC ORDER BY MEET_DT DESC, MEET_SEQ DESC";
	db.query(query, {}, function(err, rows){
		res.send(rows);
	});
};

/* 회의록 생성 */
exports.createDoc = function(req, res) {
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
	var docId = req.params.docId;
	db.query("SELECT MEET_SEQ meetSeq,MEET_DT meetDt,MEET_TITLE meetTitle,MEET_CONTENTS meetContents,REG_DT regDt,UPT_DT uptDt,LOCK_YN lockYn FROM meetting_doc WHERE MEET_SEQ = ?", [ docId ], function(err, row){
		res.send(row[0]);
	});
};

/* 회의록 수정 */
exports.updateDoc = function(req, res) {

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
	db.query("delete FROM MEETTING_DOC WHERE MEET_SEQ = ?", [req.body.meetSeq], function() {
		res.send({ result: 'success' });
	});
};

/* 회의록 마감*/
exports.closeDoc = function(req, res) {

	db.query("UPDATE MEETTING_DOC set LOCK_YN = 'Y' WHERE MEET_SEQ = ?", [req.body.meetSeq], function() {
		res.send({ result: 'success' });	
	});
};

/* 대원정보 저장 */
exports.insertMember = function(req, res) {
	
	var memberNm = req.body.memberNm;
	var cPositionCd = req.body.cPositionCd;
	var positionCd = req.body.positionCd;
	var phoneNo = req.body.phoneNo;
	var partCd = req.body.partCd;
	var statusCd = req.body.statusCd;
	var etcMsg = req.body.etcMsg;
	
	var query =
        "INSERT into CHOIR_MEMBER ( " +
        "   MEMBER_NM," +
        "   PHONE_NO," +
        "   PART_CD," +
        "   POSITION_CD," +
        "   C_POSITION_CD," +
        "   STATUS_CD," +
        "   ETC_MSG," +
        "   REG_DT," +
        "   MODIFY_DT ) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, current_timestamp, current_timestamp)";
    
	db.query(query, [ memberNm, phoneNo, partCd, positionCd, cPositionCd, statusCd, etcMsg ], function() {
		res.send({ result: 'success' });
	});
};

/* 대원정보 저장 */
exports.updateMember = function(req, res) {
	
	var memberId = req.body.memberId;
	var memberNm = req.body.memberNm;
	var cPositionCd = req.body.cPositionCd;
	var positionCd = req.body.positionCd;
	var phoneNo = req.body.phoneNo;
	var partCd = req.body.partCd;
	var statusCd = req.body.statusCd;
	var etcMsg = req.body.etcMsg;
	
	var	query =
        "UPDATE choir_member"+
		"   SET MEMBER_NM=?, " +
        "       C_POSITION_CD=?, " +
        "       PHONE_NO=?, " +
        "       PART_CD=?, " +
        "       POSITION_CD=?, " +
        "       STATUS_CD=?, " +
        "       ETC_MSG=?"+
		" WHERE MEMBER_ID=?";
		
	db.query(query, [ memberNm, cPositionCd, phoneNo, partCd, positionCd, statusCd, etcMsg, memberId ], function() {
		res.send({ result: 'success' });
	});
};
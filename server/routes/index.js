
/*
 * GET home page.
 */

 var db_config = {
	host     : 'us-cdbr-iron-east-03.cleardb.net',
	user     : 'b58fcf39b41af8',
	password : '2320cfca',
	database: "heroku_f381219eb7bd59f"
};

var db;

var mysql = require('mysql');

/* Heroku 서비스 mysql 이용시 필수 */
function handleDisconnect() {
	db = mysql.createConnection(db_config);
	db.connect(function(err) {
		if (err) {
			console.log('error when connecting to db:', err);
			setTimeout(handleDisconnect, 2000);
		}
	});
	
	db.on('error', function(err) {
		console.log('db error', err);
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDisconnect();
		} else {
			throw err;
		}
	});
}

handleDisconnect();

exports.index = function(req, res){
	var query = "SELECT C.MEMBER_ID memberId, C.MEMBER_NM memberNm, C.PART_CD partCd, (SELECT ORDERBY_NO FROM CHOIR_PART D WHERE D.PART_CD=C.PART_CD) ORDERBY_NO,C.PHONE_NO phoneNo  FROM CHOIR_MEMBER C WHERE STATUS_CD='O' AND PART_CD !='E' AND NOT EXISTS ( SELECT A.MEMBER_ID FROM (SELECT MEMBER_ID, PRACTICE_DT, PRACTICE_CD FROM CHOIR_ATTENDANCE) A, (SELECT PRACTICE_DT, PRACTICE_CD FROM CHOIR_PRACTICE_INFO WHERE PRACTICE_CD='AM' AND LOCK_YN='Y' ORDER BY PRACTICE_DT DESC LIMIT 3) B WHERE A.PRACTICE_DT = B.PRACTICE_DT AND A.PRACTICE_CD = B.PRACTICE_CD AND C.MEMBER_ID = A.MEMBER_ID) ORDER BY ORDERBY_NO ASC";
	db.query(query, {}, function(err, rows){
		//console.log(rows);
		res.render('index', {list:rows, user: req.session.passport.user || {}});
	});
};

exports.rank = function(req, res){

	var curDate = new Date();
	var curYear = curDate.getFullYear();
	var curMonth = (curDate.getMonth()+1);

	//console.log('현재날짜 : ' + curDate);
	//console.log('현재연도 : ' + curYear);
	//console.log('현재월 : ' + curMonth);

	var startDt = '';
	var endDt = '';
	
	if(curMonth == 12) {
		startDt = curYear + "-12-01";
		endDt = (curYear+1) + "-11-30";
	} else {
		startDt = (curYear-1) + "-12-01";
		endDt = (curYear) + "-11-30";
	}

	//console.log('조회시작기간 : ' + startDt);
	//console.log('조회종료기간 : ' + endDt);

	var query = "  select * from ( "+
				"	select  "+
				"		MEMBER_ID   memberId, "+
				"		MEMBER_NM   memberNm, "+
				"		PART_CD     partCd, "+
				"		(SELECT POSITION_NM FROM CHOIR_POSITION CP WHERE CP.POSITION_CD = a.POSITION_CD) positionNm, "+
				"		(SELECT C_POSITION_NM FROM CHOIR_C_POSITION CP WHERE CP.C_POSITION_CD = a.C_POSITION_CD) cPositionNm, "+
				"		(select count(pi.PRACTICE_DT) sp from CHOIR_PRACTICE_INFO pi where pi.PRACTICE_DT between ? and ? and pi.PRACTICE_CD='AM' and pi.LOCK_YN='Y') amPracticeCnt, "+
				"		(select count(c.PRACTICE_DT) am from CHOIR_PRACTICE_INFO pi, CHOIR_ATTENDANCE c where pi.PRACTICE_DT between ? and ? and pi.PRACTICE_DT=c.PRACTICE_DT and pi.PRACTICE_CD=c.PRACTICE_CD and c.PRACTICE_CD='AM' and c.MEMBER_ID=a.MEMBER_ID and pi.LOCK_YN='Y') amCnt, "+
				"		(select count(pi.PRACTICE_DT) sp from CHOIR_PRACTICE_INFO pi where pi.PRACTICE_DT between ? and ? and pi.PRACTICE_CD='PM' and pi.LOCK_YN='Y') pmPracticeCnt, "+
				"		(select count(c.PRACTICE_DT) pm from CHOIR_PRACTICE_INFO pi, CHOIR_ATTENDANCE c where pi.PRACTICE_DT between ? and ? and pi.PRACTICE_DT=c.PRACTICE_DT and pi.PRACTICE_CD=c.PRACTICE_CD and c.PRACTICE_CD='PM' and c.MEMBER_ID=a.MEMBER_ID and pi.LOCK_YN='Y') pmCnt, "+
				"		(select count(pi.PRACTICE_DT) sp from CHOIR_PRACTICE_INFO pi where pi.PRACTICE_DT between ? and ? and pi.PRACTICE_CD='SP' and pi.LOCK_YN='Y') spPracticeCnt, "+
				"		(select count(c.PRACTICE_DT) sp from CHOIR_PRACTICE_INFO pi, CHOIR_ATTENDANCE c where pi.PRACTICE_DT between ? and ? and pi.PRACTICE_DT=c.PRACTICE_DT and pi.PRACTICE_CD=c.PRACTICE_CD and c.PRACTICE_CD='SP' and c.MEMBER_ID=a.MEMBER_ID and pi.LOCK_YN='Y') spCnt "+
				"	from "+
				"		CHOIR_MEMBER a "+
				"		where a.STATUS_CD='O' "+
				"	) m "+
				"	order by m.amCnt desc, m.pmCnt desc, m.spCnt desc, m.memberNm ";
	//console.log('query : ' + query)
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
		//console.log(rows);
		res.render('rank', {list:rows, user: req.session.passport.user || {}});
	});
};

exports.attList = function(req, res){
	
	var page = req.params.page;
	var size = 50;
	var sRow = (page-1) * size;
	
	var query = "	   SELECT "+
                "	    i.PRACTICE_DT practiceDt,  "+
                "	    i.PRACTICE_CD practiceCd,  "+
                "	    i.MUSIC_INFO musicInfo,  "+
                "	    i.ETC_MSG etcMsg,  "+
                "	    i.LOCK_YN lockYn,  "+
                "	    IF(i.LOCK_YN='Y','마감',NULL) lockNm,  "+
                "	    p.PRACTICE_NM practiceNm, "+
		        "       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE     ca.MEMBER_ID = cm.MEMBER_ID and ca.PRACTICE_DT = i.PRACTICE_DT and ca.PRACTICE_CD = i.PRACTICE_CD and cm.PART_CD = 'S' ) s, "+
                "       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE     ca.MEMBER_ID = cm.MEMBER_ID and ca.PRACTICE_DT = i.PRACTICE_DT and ca.PRACTICE_CD = i.PRACTICE_CD and cm.PART_CD = 'A' ) a, "+
                "       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE     ca.MEMBER_ID = cm.MEMBER_ID and ca.PRACTICE_DT = i.PRACTICE_DT and ca.PRACTICE_CD = i.PRACTICE_CD and cm.PART_CD = 'T' ) t, "+
                "       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE     ca.MEMBER_ID = cm.MEMBER_ID and ca.PRACTICE_DT = i.PRACTICE_DT and ca.PRACTICE_CD = i.PRACTICE_CD and cm.PART_CD = 'B' ) b, "+
                "       (SELECT COUNT(*)  FROM CHOIR_ATTENDANCE ca, CHOIR_MEMBER cm WHERE     ca.MEMBER_ID = cm.MEMBER_ID and ca.PRACTICE_DT = i.PRACTICE_DT and ca.PRACTICE_CD = i.PRACTICE_CD and cm.PART_CD = 'E' ) e, "+
                "	    (select count(*) from CHOIR_ATTENDANCE a WHERE a.PRACTICE_DT=i.PRACTICE_DT and a.PRACTICE_CD=i.PRACTICE_CD) attendanceCnt "+
                "	  FROM CHOIR_PRACTICE_INFO i, CHOIR_PRACTICE p "+
                "	 WHERE i.PRACTICE_CD = p.PRACTICE_CD "+
                "	 ORDER BY i.PRACTICE_DT DESC , p.ORDERBY_NO DESC Limit ?,?";
	//console.log('query : ' + query)
	db.query(query, [sRow, size], function(err, rows){
		//console.log(rows);
		res.send(rows);
	});
};

exports.attInfoModify = function(req, res){

	var practiceDt = req.body.practiceDt;
	var practiceCd = req.body.practiceCd;


	//console.log('[practiceDt='+practiceDt+';practiceCd='+practiceCd+']');

	var query = " SELECT "+
                "	    i.PRACTICE_DT practiceDt,  "+
                "	    i.PRACTICE_CD practiceCd,  "+
                "	    i.MUSIC_INFO musicInfo,  "+
                "	    i.ETC_MSG etcMsg,  "+
                "	    i.LOCK_YN lockYn, "+
                "	    p.PRACTICE_NM practiceNm, "+
                "	    (select count(*) from CHOIR_ATTENDANCE a WHERE a.PRACTICE_DT=i.PRACTICE_DT and a.PRACTICE_CD=i.PRACTICE_CD) attendanceCnt "+
                "	  FROM CHOIR_PRACTICE_INFO i, CHOIR_PRACTICE p "+
                "	 WHERE i.PRACTICE_CD = p.PRACTICE_CD "+
                "	   and i.PRACTICE_DT = ? and i.PRACTICE_CD = ? ";
	db.query(query, [practiceDt,practiceCd], function(err, row){		

		query = " select * from ( "+
                " 			select  "+
                " 			    MEMBER_ID   memberId, "+
                "                             (select count(*) from CHOIR_ATTENDANCE ca where ca.PRACTICE_DT=? and ca.PRACTICE_CD=? and ca.MEMBER_ID = a.MEMBER_ID) attYn, "+
                " 			    MEMBER_NM   memberNm, "+
                " 			    (SELECT C_POSITION_NM FROM CHOIR_C_POSITION CP WHERE CP.C_POSITION_CD = a.C_POSITION_CD) cPositionNm, "+
                " 			    PHONE_NO    phoneNo, "+
                " 			    PART_CD     partCd, "+
                " 			    (SELECT POSITION_NM FROM CHOIR_POSITION CP WHERE CP.POSITION_CD = a.POSITION_CD) positionNm, "+
                " 			    STATUS_CD   statusCd, "+
                " 			    (SELECT STATUS_NM FROM CHOIR_STATUS CS WHERE CS.STATUS_CD = a.STATUS_CD) statusNm, "+
                " 			    ETC_MSG     etcMsg "+
                " 			from "+
                " 			    CHOIR_MEMBER a "+
                "       ) m "+
                "         WHERE statusCd = ? "+
                "         AND partCd = ? "+
                "         order by memberNm ";

		db.query(query, [practiceDt,practiceCd,'O','S'], function(err, sList){
			db.query(query, [practiceDt,practiceCd,'O','A'], function(err, aList){
				db.query(query, [practiceDt,practiceCd,'O','T'], function(err, tList){
					db.query(query, [practiceDt,practiceCd,'O','B'], function(err, bList){
						db.query(query, [practiceDt,practiceCd,'O','E'], function(err, eList){
							query = " select * from ( "+
									" 			select  "+
									" 			    MEMBER_ID   memberId, "+
									"                             (select count(*) from CHOIR_ATTENDANCE ca where ca.PRACTICE_DT=? and ca.PRACTICE_CD=? and ca.MEMBER_ID = a.MEMBER_ID) attYn, "+
									" 			    MEMBER_NM   memberNm, "+
									" 			    (SELECT C_POSITION_NM FROM CHOIR_C_POSITION CP WHERE CP.C_POSITION_CD = a.C_POSITION_CD) cPositionNm, "+
									" 			    PHONE_NO    phoneNo, "+
									" 			    PART_CD     partCd, "+
									" 			    (SELECT POSITION_NM FROM CHOIR_POSITION CP WHERE CP.POSITION_CD = a.POSITION_CD) positionNm, "+
									" 			    STATUS_CD   statusCd, "+
									" 			    (SELECT STATUS_NM FROM CHOIR_STATUS CS WHERE CS.STATUS_CD = a.STATUS_CD) statusNm, "+
									" 			    ETC_MSG     etcMsg "+
									" 			from "+
									" 			    CHOIR_MEMBER a "+
									"       ) m "+
									"         WHERE statusCd = ? "+
									"         order by memberNm ";
							db.query(query, [practiceDt,practiceCd,'H'], function(err, hList){
								db.query(query, [practiceDt,practiceCd,'X'], function(err, xList){
									res.render('attInfoModify', {attInfo:row[0], s:sList, a:aList, t:tList, b:bList, e:eList, h:hList, x:xList, user: req.session.passport.user || {}});
								});					
							});					
						});					
					});					
				});
			});
		});
	});
};

exports.userList = function(req, res){
	var query = 
                " 			select  "+
                " 			    MEMBER_ID   memberId, "+
                " 			    MEMBER_NM   memberNm, "+
                " 			    b.C_POSITION_NM cPositionNm, "+
                " 			    c.POSITION_NM positionNm "+
                " 			from "+
                " 			    choir_member a, "+
                " 			    CHOIR_C_POSITION b, "+
                " 			    CHOIR_POSITION c "+
                "         WHERE a.C_POSITION_CD = b.C_POSITION_CD AND a.POSITION_CD = c.POSITION_CD"+
                "         AND a.STATUS_CD = ? "+
                "         AND a.PART_CD = ? "+
                "         order by a.MEMBER_NM ";
	
	db.query(query, ['O', 'S'], function(err, sList){
		db.query(query, ['O', 'A'], function(err, aList){
			db.query(query, ['O', 'T'], function(err, tList){
				db.query(query, ['O', 'B'], function(err, bList){
					db.query(query, ['O', 'E'], function(err, eList){
						query = 
							" 			select  "+
			                " 			    MEMBER_ID   memberId, "+
			                " 			    MEMBER_NM   memberNm, "+
			                " 			    b.C_POSITION_NM cPositionNm, "+
			                " 			    c.POSITION_NM positionNm "+
			                " 			from "+
			                " 			    choir_member a, "+
			                " 			    CHOIR_C_POSITION b, "+
			                " 			    CHOIR_POSITION c "+
			                "         WHERE a.C_POSITION_CD = b.C_POSITION_CD AND a.POSITION_CD = c.POSITION_CD"+
			                "         AND a.STATUS_CD = ? "+
			                "         order by a.MEMBER_NM ";

						db.query(query, ['H'], function(err, hList){
							db.query(query, ['X'], function(err, xList){
								res.send({s:sList, a:aList, t:tList, b:bList, e:eList, h:hList, x:xList});
							});					
						});					
					});					
				});					
			});
		});
	});
};

exports.user = function(req, res){
	
	console.log(req.body);
	console.log(req.params);
	
	var query = " select * from ( "+
	" 			select  "+
	" 			    MEMBER_ID   memberId, "+
	" 			    MEMBER_NM   memberNm, "+
	" 			    a.C_POSITION_CD   cPositionCd, "+
	" 			    (SELECT C_POSITION_NM FROM CHOIR_C_POSITION CP WHERE CP.C_POSITION_CD = a.C_POSITION_CD) cPositionNm, "+
	" 			    PHONE_NO    phoneNo, "+
	" 			    PART_CD     partCd, "+
	" 			    (SELECT PART_NM FROM CHOIR_PART CP WHERE CP.PART_CD = a.PART_CD) partNm, "+
	" 			    a.POSITION_CD     positionCd, "+
	" 			    (SELECT POSITION_NM FROM CHOIR_POSITION CP WHERE CP.POSITION_CD = a.POSITION_CD) positionNm, "+
	" 			    STATUS_CD   statusCd, "+
	" 			    (SELECT STATUS_NM FROM CHOIR_STATUS CS WHERE CS.STATUS_CD = a.STATUS_CD) statusNm, "+
	" 			    ETC_MSG     etcMsg "+
	" 			from "+
	" 			    choir_member a "+
	"       ) m "+
	"         WHERE memberId = ? ";
	
	db.query(query, [req.params.memberId], function(err, list){
		if(list.length != 0) return res.send(list[0]);
		else return res.send(null);
	});
};

exports.codeList = function(req, res){
	var query = "SELECT * FROM choir_c_position order by orderby_no";
	db.query(query, [req.params.memberId], function(err, cPositionList){
		var query = "SELECT * FROM choir_position order by orderby_no";
		db.query(query, [req.params.memberId], function(err, positionList){
			var query = "SELECT * FROM choir_part order by orderby_no";
			db.query(query, [req.params.memberId], function(err, partList){
				var query = "SELECT * FROM choir_practice order by orderby_no";
				db.query(query, [req.params.memberId], function(err, practiceList){
					var query = "SELECT * FROM choir_status order by orderby_no";
					db.query(query, [req.params.memberId], function(err, statusList){
						res.send({cPositionList:cPositionList, positionList:positionList, partList:partList, practiceList:practiceList, statusList:statusList});
					});
				});
			});
		});
	});
};

exports.lockAttInfo = function(req, res){
	
	var practiceDt = req.body.practiceDt;
	var practiceCd = req.body.practiceCd;

	db.query("UPDATE CHOIR_PRACTICE_INFO SET LOCK_YN = 'Y' WHERE PRACTICE_DT = ? AND PRACTICE_CD = ? AND LOCK_YN = 'N'", [ practiceDt, practiceCd ], function(){
		res.writeHead(302, {'Location': '/attInfoList'});
		res.end();	
	});
}

exports.cancelLockAttInfo = function(req, res){
	
	var practiceDt = req.body.practiceDt;
	var practiceCd = req.body.practiceCd;

	db.query("UPDATE CHOIR_PRACTICE_INFO SET LOCK_YN = 'N' WHERE PRACTICE_DT = ? AND PRACTICE_CD = ? AND LOCK_YN = 'Y'", [ practiceDt, practiceCd ], function(){
		res.writeHead(302, {'Location': '/attInfoList'});
		res.end();	
	});
}


exports.select = function(req, res){
	var practiceDt = req.body.practiceDt;
	var practiceCd = req.body.practiceCd;
	var memberId = req.body.memberId;

	console.log('practiceDt : ', practiceDt);
	console.log('practiceCd : ', practiceCd);
	console.log('memberId : ', memberId);

	db.query("INSERT INTO choir_attendance VALUES (?,?,?)", [ practiceDt, practiceCd, memberId ], function(){
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Hello World\n');
	});
}

exports.deselect = function(req, res){
	var practiceDt = req.body.practiceDt;
	var practiceCd = req.body.practiceCd;
	var memberId = req.body.memberId;

	db.query("DELETE FROM CHOIR_ATTENDANCE WHERE PRACTICE_DT = ? AND PRACTICE_CD = ? AND MEMBER_ID = ?", [ practiceDt, practiceCd, memberId ], function(){
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Hello World\n');
	});
}

exports.saveMusicInfo = function(req, res){
	var practiceDt = req.body.practiceDt;
	var practiceCd = req.body.practiceCd;
	var musicInfo = req.body.musicInfo;

	db.query("UPDATE CHOIR_PRACTICE_INFO SET MUSIC_INFO = ? WHERE PRACTICE_DT = ? AND PRACTICE_CD = ?", [ musicInfo,  practiceDt, practiceCd ]);
}

exports.saveMemo = function(req, res){
	var practiceDt = req.body.practiceDt;
	var practiceCd = req.body.practiceCd;
	var memo = req.body.memo;

	db.query("UPDATE CHOIR_PRACTICE_INFO SET ETC_MSG = ? WHERE PRACTICE_DT = ? AND PRACTICE_CD = ?", [ memo,  practiceDt, practiceCd ]);
}

exports.removeAttInfo = function(req, res){
	var practiceDt = req.body.practiceDt;
	var practiceCd = req.body.practiceCd;

	db.query("DELETE FROM CHOIR_ATTENDANCE WHERE PRACTICE_DT = ? AND PRACTICE_CD = ?", [ practiceDt, practiceCd], function(){
		db.query("DELETE FROM CHOIR_PRACTICE_INFO WHERE PRACTICE_DT = ? AND PRACTICE_CD = ?", [ practiceDt, practiceCd],function(){
			res.writeHead(302, {'Location': '/attInfoList'});
			res.end();	
		});
	});
	
}

exports.practiceInfo = function(req, res){
	res.render('practiceInfo', {user: req.session.passport.user || {}});
};

exports.createPracticeInfo = function(req, res){
	var practiceDt = req.body.practiceDt;
	var practiceCd = req.body.practiceCd;
	var memo = req.body.memo;
	var musicInfo = req.body.musicInfo;

	db.query("SELECT count(*) cnt FROM CHOIR_PRACTICE_INFO i WHERE i.PRACTICE_DT = ? and i.PRACTICE_CD = ?", [ practiceDt, practiceCd ], function(err, row){	

		if(row[0].cnt == 0) {
			db.query("insert into CHOIR_PRACTICE_INFO(PRACTICE_DT, PRACTICE_CD, MUSIC_INFO, ETC_MSG) values(?,?,?,?)", [ practiceDt, practiceCd, musicInfo, memo], function(){
				res.writeHead(302, {'Location': '/attInfoList'});
				res.end();	
			});
		} else {
			res.writeHead(302, {'Location': '/attInfoList'});
			res.end();	
		}

	});
};

exports.docList = function(req, res){
	
	var query = "select MEET_SEQ meetSeq,MEET_DT meetDt,MEET_TITLE meetTitle,REPLACE(MEET_CONTENTS,'\n','<br/>') meetContents,REG_DT regDt,UPT_DT uptDt,LOCK_YN lockYn from MEETTING_DOC order by MEET_DT DESC, MEET_SEQ DESC";

	db.query(query, {}, function(err, rows){
		res.render('docList', {list:rows, user: req.session.passport.user || {}});
	});
};

exports.doc = function(req, res){
	res.render('doc', {user: req.session.passport.user || {}});
};

exports.createDoc = function(req, res){
	var meetDt = req.body.meetDt;
	var meetTitle = req.body.meetTitle;
	var meetContents = req.body.meetContents;

	db.query("insert into MEETTING_DOC(MEET_DT, MEET_TITLE, MEET_CONTENTS, REG_DT, UPT_DT) values(?,?,?,current_timestamp,current_timestamp)", 
		[ meetDt, meetTitle, meetContents], function(){
		res.writeHead(302, {'Location': '/docList'});
		res.end();	
	});

};

exports.modifyDoc = function(req, res){	
	var meetSeq = req.body.meetSeq;
	//console.log('meetSeq : '+meetSeq);
	db.query("select MEET_SEQ meetSeq,MEET_DT meetDt,MEET_TITLE meetTitle,MEET_CONTENTS meetContents,REG_DT regDt,UPT_DT uptDt,LOCK_YN lockYn from meetting_doc where MEET_SEQ = ?", [ meetSeq ], function(err, row){	
		res.render('modifyDoc', {data:row[0], user: req.session.passport.user || {}});
	});
};

exports.updateDoc = function(req, res){

	var meetDt = req.body.meetDt;
	var meetTitle = req.body.meetTitle;
	var meetContents = req.body.meetContents;
	var meetSeq = req.body.meetSeq;

	db.query("update MEETTING_DOC set MEET_DT = ?,MEET_TITLE = ?,MEET_CONTENTS = ?,UPT_DT = current_timestamp where MEET_SEQ = ?", 
		[ meetDt, meetTitle, meetContents, meetSeq], function(){
		res.writeHead(302, {'Location': '/docList'});
		res.end();	
	});
};

exports.removeDoc = function(req, res){

	var meetSeq = req.body.meetSeq;

	db.query("delete from MEETTING_DOC where MEET_SEQ = ?", [ meetSeq], function(){
		res.writeHead(302, {'Location': '/docList'});
		res.end();	
	});
};

exports.closeDoc = function(req, res){

	var meetSeq = req.body.meetSeq;

	db.query("update MEETTING_DOC set LOCK_YN = 'Y' where MEET_SEQ = ?", [ meetSeq], function(){
		res.writeHead(302, {'Location': '/docList'});
		res.end();	
	});
};

exports.modifyUser = function(req, res){
	
	var memberId = req.body.memberId;

	//console.log(memberId);

	var query = " 			select  "+
                " 			    MEMBER_ID   memberId, "+
                " 			    MEMBER_NM   memberNm, "+
                " 			    C_POSITION_CD cPositionCd, "+
                " 			    PHONE_NO    phoneNo, "+
                " 			    PART_CD     partCd, "+
                " 			    POSITION_CD positionCd, "+
                " 			    STATUS_CD   statusCd, "+
                " 			    ETC_MSG     etcMsg "+
                " 			from "+
                " 			    choir_member a where member_id = ?";

	db.query(query, memberId, function(err, row){

		res.render('modifyUser', {data:row[0], user: req.session.passport.user || {}});
	});
}

exports.regUser = function(req, res){
	res.render('regUser', {user: req.session.passport.user || {}});
}

exports.saveUser = function(req, res){
	
	var memberId = req.body.memberId;
	var memberNm = req.body.memberNm;
	var cPositionCd = req.body.cPositionCd;
	var positionCd = req.body.positionCd;
	var phoneNo = req.body.phoneNo;
	var partCd = req.body.partCd;
	var statusCd = req.body.statusCd;
	var etcMsg = req.body.etcMsg;
	
	var query = "";
	
	if(req.body.memberId) {
		query = "update choir_member"+
        "   set MEMBER_NM=?, C_POSITION_CD=?, PHONE_NO=?, PART_CD=?, POSITION_CD=?, STATUS_CD=?, ETC_MSG=?"+
        "   where MEMBER_ID=?";

		db.query(query, [ memberNm, cPositionCd, phoneNo, partCd, positionCd, statusCd, etcMsg, memberId ], function(){
			res.send({});
		});
	} else {
		query = "insert into CHOIR_MEMBER(MEMBER_NM,PHONE_NO,PART_CD,POSITION_CD,C_POSITION_CD,STATUS_CD,ETC_MSG,REG_DT,MODIFY_DT) values(?,?,?,?,?,?,?,current_timestamp,current_timestamp)";
	    
		db.query(query, [ memberNm, phoneNo, partCd, positionCd, cPositionCd, statusCd, etcMsg ], function(){
			res.send({});
		});
	}
}

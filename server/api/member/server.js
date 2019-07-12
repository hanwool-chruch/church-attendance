




/* 대원목록*/
exports.memberList = function(req, res) {

	var db = getDBConnector(req.db_type);
	var query1 = " SELECT MEMBER_NM, MEMBER_ID, PHONE_NO, BIRTHDAY, PART_CD, STATUS_CD " +
		         " FROM CHOIR_MEMBER a ORDER BY a.PART_CD";

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

/* 대원목록*/
exports.memberList = function(req, res) {

	var db = getDBConnector(req.db_type);
	var query1 = " SELECT MEMBER_NM, MEMBER_ID, PHONE_NO, BIRTHDAY, PART_CD, STATUS_CD " +
		         " FROM CHOIR_MEMBER a ORDER BY a.PART_CD";

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

/* 대원목록-이름순*/
exports.sortedMemberList = function(req, res) {

	var db = getDBConnector(req.db_type);
	var query1 = " SELECT MEMBER_NM, MEMBER_ID, PHONE_NO, BIRTHDAY, PART_CD, STATUS_CD " +
		         " FROM CHOIR_MEMBER a ORDER BY a.MEMBER_NM";


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


/* 대원정보 저장 */
exports.insertMember = function(req, res) {

	var db = getDBConnector(req.db_type);
	var member = req.body;

	var query =
        "INSERT into CHOIR_MEMBER ( " +
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

		res.send({ result: 'success' });
	});
};

/* 대원정보 저장 */
exports.updateMember = function(req, res) {

	var db = getDBConnector(req.db_type);
	var member = req.body;

	var	query =
    "UPDATE CHOIR_MEMBER"+
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

	db.query("DELETE FROM CHOIR_MEMBER WHERE MEMBER_ID = ?", [memberId], function(err) {
		res.send({ result: 'success' });
	});
}


/* 대원 상세정보 */
exports.member = function(req, res) {
	
	var db = getDBConnector(req.db_type);
	var query1 = " SELECT * FROM CHOIR_MEMBER WHERE MEMBER_ID = ? ";

	var query2 =
        "SELECT " +
        "       distinct left(a.practice_dt, 7) month, " +
        "       a.practice_dt, a.practice_cd, " +
        "       b.member_id " +
        "  FROM " +
        "       (SELECT practice_dt, practice_cd FROM CHOIR_WORSHIP) a left outer join  " +
        "       (SELECT p.practice_dt, p.practice_cd, a.member_id " +
        "          FROM CHOIR_WORSHIP p inner join " +
        "               CHOIR_ATTENDANCE a " +
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
				if(rows == null || rows.length === 0) {
					callback(null, null);
				} else {
					rows
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
			return res.send([]);
		} else {
			return res.send({
				member 			: results.member, 
				attMonthList 	: results.attMonthList
			});
		}
	});
};
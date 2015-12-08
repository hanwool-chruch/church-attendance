var port = Number(process.env.PORT || 8000);

var express = require('express');

var app = express()
  , routes = require('./server/routes')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io')
  , fs = require('fs')
  , pkginfo = require('./package')
  , passport = require('passport')
  , bodyParser = require('body-parser');

app.use(express.static(__dirname + '/app'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = app.listen(port, function() { 
	console.log('Listening on port %d', server.address().port); 
});

/*공통 코드관리*/
app.get		('/rest/codeList', routes.codeList);

/* 대원관리 */
app.get		('/rest/member', routes.memberList);			/* 대원목록 */
app.post	('/rest/member', routes.insertMember);			/* 대원 등록 */
app.put		('/rest/member', routes.updateMember);			/* 대원 정보 수정 */
app.get		('/rest/member/:memberId', routes.member);		/* 대원 상세정보 */

/* 출석관리 */
app.get		('/rest/att/list/:page', routes.attList);								/* 연습정보 목록 */
app.post	('/rest/att/:practiceDt/:practiceCd', routes.createPracticeInfo);								/* 연습정보 생성 */
app.delete	('/rest/att/:practiceDt/:practiceCd', routes.removeAttInfo);			/* 연습정보 삭제 */
app.get		('/rest/att/:practiceDt/:practiceCd', routes.attInfoDetail);			/* 연습정보 상세(출석정보 포함) */
app.put		('/rest/att/:practiceDt/:practiceCd/musicInfo', routes.saveMusicInfo);	/* 연습곡 수정 */
app.put		('/rest/att/:practiceDt/:practiceCd/etcMsg', routes.saveEtcMsg);		/* 메모 수정 */
app.post	('/rest/att/:practiceDt/:practiceCd/select', routes.select);			/* 출석체크 */
app.post	('/rest/att/:practiceDt/:practiceCd/deselect', routes.deselect);		/* 출석체크 해제 */
app.put		('/rest/att/:practiceDt/:practiceCd/lockAtt', routes.lockAtt);			/* 마감 */
app.put		('/rest/att/:practiceDt/:practiceCd/unlockAtt', routes.unlockAtt);		/* 마감 해제 */

/* 출석순위 */
app.get		('/rest/rank', routes.rank);

/* 회의록 */
app.get		('/rest/doc', routes.docList);
app.get		('/rest/doc/:docId', routes.modifyDoc);

/* 웹소켓 */
var io = socketio.listen(server);
io.set('log level',1);
io.on('connection',function(socket) {

	/* 연습정보 상세정보 입장 */
	socket.on('join', function(data) {
		socket.join(data);
		socket.room = data;
	});

	/* 연습정보 목록 입장 */
	socket.on('hallJoin', function() {
		socket.join('hall');
	});
	
	/* 연습곡 정보 갱신 */
	socket.on('refreshMusicInfo', function(data){
		io.sockets.in('hall').emit('refreshPage', "연습곡 정보가 갱신되었습니다.");
		io.sockets.in(socket.room).emit('replaceMusicInfo', data);
	});

	/* 메모 갱신 */
	socket.on('refreshEtcMsg', function(data){
		io.sockets.in('hall').emit('refreshPage', "메모가 갱신되었습니다.");
		io.sockets.in(socket.room).emit('replaceEtcMsg', data);
	});

	/* 마감 (목록과 상세 두군데로 보내야 함) */
	socket.on('closeAtt', function(data){
		io.sockets.in('hall').emit('refreshPage', "연습정보가 마감되었습니다.");
		io.sockets.in(socket.room).emit('refreshPage', "연습정보가 마감되었습니다.");
	});
	
	/* 마감 해제 (목록과 상세 두군데로 보내야 함) */
	socket.on('uncloseAtt', function(data){
		io.sockets.in('hall').emit('refreshPage', "연습정보가 마감 해제 되었습니다.");
		io.sockets.in(socket.room).emit('refreshPage', "연습정보가 마감 해제 되었습니다.");
	});
	
	/* 연습정보 추가 */
	socket.on('addAtt', function(data){
		io.sockets.in('hall').emit('refreshPage', "새로운 연습정보가 추가되었습니다.");
	});
	
	/* 연습정보 삭제 */
	socket.on('removeAtt', function(data){
		io.sockets.in('hall').emit('refreshPage', "연습정보가 삭제되었습니다.");
		io.sockets.in(socket.room).emit('backToList', "연습정보가 삭제되었습니다.");
	});
	
	/* 출석 체크 */
	socket.on('select', function(data){
		console.log('select Client Send Data:', data);
		io.sockets.in(socket.room).emit('select', data);
	});
});
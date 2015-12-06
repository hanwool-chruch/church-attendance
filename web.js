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
app.post	('/rest/att', routes.createPracticeInfo);								/* 연습정보 생성 */
app.delete	('/rest/att/:practiceDt/:practiceCd', routes.removeAttInfo);			/* 연습정보 삭제 */
app.get		('/rest/att/:practiceDt/:practiceCd', routes.attInfoDetail);			/* 연습정보 상세(출석정보 포함) */
app.put		('/rest/att/:practiceDt/:practiceCd/musicInfo', routes.saveMusicInfo);	/* 연습곡 수정 */
app.put		('/rest/att/:practiceDt/:practiceCd/etcMsg', routes.saveEtcMsg);		/* 메모 수정 */
app.post	('/rest/att/:practiceDt/:practiceCd/select', routes.select);			/* 출석체크 */
app.post	('/rest/att/:practiceDt/:practiceCd/deselect', routes.deselect);		/* 출석체크 해제 */

/* 웹소켓 */
var io = socketio.listen(server);
io.set('log level',1);
io.sockets.on('connection',function(socket) {
	
});
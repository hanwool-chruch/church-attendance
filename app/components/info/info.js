'use strict';

angular.module('myApp.info', [
	'myApp.info.info-directive'
])

/* 앱 이름 */
.constant('title', '주일학교 출석부')

/* 앱 저작권내용 */
.constant('copyright', '하나님께서는 당신을 사랑하십니다.')

/* 환영 메세지 */
.constant('welcomeMessage', '주일학교 출석부 관리시스템')

/* 메뉴명 */
.constant('menu', {
	main   : '주일학교 출석관리',
	member : '반별 학생관리',
	member_kind : '전체 학생정보',
	attendance    : '출석관리',
	rank   : '출석통계',
	doc    : '회의록',
	login  : '로그인',
	calendar : '교회일정',
	part : '부서관리'
})
;

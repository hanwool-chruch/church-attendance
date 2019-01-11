'use strict';

angular.module('myApp.info', [
	'myApp.info.info-directive'
])

/* 앱 이름 */
.constant('title', '주일학교 출석부')

/* 앱 저작권내용 */
.constant('copyright', 'Copyright © 2019 @yhzion All right reserved.')

/* 환영 메세지 */
.constant('welcomeMessage', '손쉬운 출석관리, 지금 다같이 시작해보세요.')

/* 메뉴명 */
.constant('menu', {
	main   : '주일학교 출석관리',
	member : '학생관리',
	att    : '출석관리',
	rank   : '출석순위',
	doc    : '회의록',
	login  : '로그인'
})
;
